import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import List "mo:core/List";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Set "mo:core/Set";
import Migration "migration";

// Integrate migration module for data persistence
(with migration = Migration.run)
actor {
  // Integrate storage and authentication modules
  include MixinStorage();

  // Include persistent authentication.
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    accountSuspendedUntil : ?Time.Time; // New field for tracking suspension
  };

  // Store user profiles persistently
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Enforce unique usernames
  public shared ({ caller }) func setUniqueUsername(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can set username");
    };

    if (username.size() == 0) {
      Runtime.trap("Username cannot be empty");
    };

    for ((user, profile) in userProfiles.entries()) {
      if (profile.name == username) {
        Runtime.trap("Username must be unique");
      };
    };

    let profile = {
      name = username;
      accountSuspendedUntil = null;
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type Comment = {
    id : Nat;
    authorName : Text;
    authorId : Principal;
    content : Text;
    likes : Nat;
    timestamp : Time.Time;
    reported : Bool;
    likedBy : Set.Set<Principal>;
  };

  type CommentView = {
    id : Nat;
    authorName : Text;
    authorId : Principal;
    content : Text;
    likes : Nat;
    timestamp : Time.Time;
    reported : Bool;
  };

  type Post = {
    id : Nat;
    authorName : Text;
    authorId : Principal;
    content : Text;
    image : ?Storage.ExternalBlob;
    timestamp : Time.Time;
    likes : Nat;
    comments : [Comment];
    reported : Bool;
    likedBy : Set.Set<Principal>; // Track who liked each post.
  };

  type PostView = {
    id : Nat;
    authorName : Text;
    authorId : Principal;
    content : Text;
    image : ?Storage.ExternalBlob;
    timestamp : Time.Time;
    likes : Nat;
    comments : [CommentView];
    reported : Bool;
  };

  let mutablePosts = List.empty<Post>();
  var nextPostId = 0;
  var nextCommentId = 0;

  module Post {
    public func compare(post1 : Post, post2 : Post) : Order.Order {
      Nat.compare(
        post2.timestamp.toNat(),
        post1.timestamp.toNat(),
      );
    };
  };

  public shared ({ caller }) func createPost(content : Text, image : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create posts");
    };

    let profile = switch (userProfiles.get(caller)) {
      case (?p) { p };
      case (null) { Runtime.trap("User must set username before posting") };
    };

    switch (profile.accountSuspendedUntil) {
      case (?suspensionEnd) {
        if (Time.now() < suspensionEnd) {
          Runtime.trap("Your account is suspended until the specified date.");
        };
      };
      case (null) {};
    };

    let newPost : Post = {
      id = nextPostId;
      authorName = profile.name;
      authorId = caller;
      content;
      image;
      timestamp = Time.now();
      likes = 0;
      comments = [];
      reported = false;
      likedBy = Set.empty<Principal>();
    };

    mutablePosts.add(newPost);
    nextPostId += 1;
  };

  public shared ({ caller }) func addComment(postId : Nat, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can comment");
    };

    let profile = switch (userProfiles.get(caller)) {
      case (?p) { p };
      case (null) { Runtime.trap("User must set username before commenting") };
    };

    switch (profile.accountSuspendedUntil) {
      case (?suspensionEnd) {
        if (Time.now() < suspensionEnd) {
          Runtime.trap("Your account is suspended until the specified date.");
        };
      };
      case (null) {};
    };

    let comment = {
      id = nextCommentId;
      authorName = profile.name;
      authorId = caller;
      content;
      likes = 0;
      timestamp = Time.now();
      reported = false;
      likedBy = Set.empty<Principal>();
    };

    let updatedPosts = mutablePosts.toArray().map(
      func(p) {
        if (p.id == postId) {
          {
            id = p.id;
            authorName = p.authorName;
            authorId = p.authorId;
            content = p.content;
            image = p.image;
            timestamp = p.timestamp;
            likes = p.likes;
            comments = p.comments.concat([comment]);
            reported = p.reported;
            likedBy = p.likedBy;
          };
        } else {
          p;
        };
      }
    );

    mutablePosts.clear();
    mutablePosts.addAll(updatedPosts.values());
    nextCommentId += 1;
  };

  public shared ({ caller }) func deleteComment(postId : Nat, commentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete comments");
    };

    let postsArray = mutablePosts.toArray();
    let postIndex = postsArray.findIndex(func(p) { p.id == postId });

    switch (postIndex) {
      case (?idx) {
        let post = postsArray[idx];
        let commentIndex = post.comments.findIndex(func(c) { c.id == commentId });

        switch (commentIndex) {
          case (?cIdx) {
            let comment = post.comments[cIdx];
            if (comment.authorId != caller) {
              Runtime.trap("Unauthorized: Only comment author can delete this comment.");
            };

            let commentsList = List.fromArray<Comment>(post.comments);
            let updatedCommentsList = List.empty<Comment>();

            var currentIndex = 0;
            for (c in commentsList.values()) {
              if (currentIndex != cIdx) {
                updatedCommentsList.add(c);
              };
              currentIndex += 1;
            };

            let updatedPost : Post = {
              id = post.id;
              authorName = post.authorName;
              authorId = post.authorId;
              content = post.content;
              image = post.image;
              timestamp = post.timestamp;
              likes = post.likes;
              comments = updatedCommentsList.toArray();
              reported = post.reported;
              likedBy = post.likedBy;
            };

            // Update posts array by constructing a new array
            let updatedPostsArray = postsArray.toVarArray<Post>();
            updatedPostsArray[idx] := updatedPost;

            mutablePosts.clear();
            mutablePosts.addAll(updatedPostsArray.toArray().values());
          };
          case (null) { Runtime.trap("Comment not found") };
        };
      };
      case (null) { Runtime.trap("Post not found") };
    };
  };

  public shared ({ caller }) func reportComment(postId : Nat, commentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can report comments");
    };

    let postsArray = mutablePosts.toArray();
    let postIndex = postsArray.findIndex(func(p) { p.id == postId });

    switch (postIndex) {
      case (?pIdx) {
        let post = postsArray[pIdx];
        let commentIndex = post.comments.findIndex(func(c) { c.id == commentId });

        switch (commentIndex) {
          case (?cIdx) {
            let updatedComments = post.comments.map(
              func(c) {
                {
                  id = c.id;
                  authorName = c.authorName;
                  authorId = c.authorId;
                  content = c.content;
                  likes = c.likes;
                  timestamp = c.timestamp;
                  reported = c.id == commentId;
                  likedBy = c.likedBy;
                };
              }
            );

            let updatedPost : Post = {
              id = post.id;
              authorName = post.authorName;
              authorId = post.authorId;
              content = post.content;
              image = post.image;
              timestamp = post.timestamp;
              likes = post.likes;
              comments = updatedComments;
              reported = post.reported;
              likedBy = post.likedBy;
            };

            let updatedPostsArray = postsArray.toVarArray<Post>();
            updatedPostsArray[pIdx] := updatedPost;

            mutablePosts.clear();
            mutablePosts.addAll(updatedPostsArray.toArray().values());
          };
          case (null) { Runtime.trap("Comment not found") };
        };
      };
      case (null) { Runtime.trap("Post not found") };
    };
  };

  public query ({ caller }) func getPosts() : async [PostView] {
    let visiblePosts = mutablePosts.toArray().filter(func(p) { not p.reported });
    let postsWithFilteredComments = visiblePosts.map(
      func(p) {
        let visibleComments = p.comments.filter(func(c) { not c.reported });
        let immutableComments = visibleComments.map(
          func(c) {
            {
              id = c.id;
              authorName = c.authorName;
              authorId = c.authorId;
              content = c.content;
              likes = c.likes;
              timestamp = c.timestamp;
              reported = c.reported;
            };
          }
        );
        {
          id = p.id;
          authorName = p.authorName;
          authorId = p.authorId;
          content = p.content;
          image = p.image;
          timestamp = p.timestamp;
          likes = p.likes;
          comments = immutableComments;
          reported = p.reported;
        };
      }
    );
    postsWithFilteredComments;
  };

  // Only allow one like per user per post.
  public shared ({ caller }) func likePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can like posts");
    };

    let updateLikeStatus = func(post : Post, caller : Principal) : Post {
      if (post.likedBy.contains(caller)) {
        post; // No change if caller already liked
      } else {
        let newLikedBy = post.likedBy.clone();
        newLikedBy.add(caller);
        { post with likes = post.likes + 1; likedBy = newLikedBy };
      };
    };

    let updatedPosts = mutablePosts.toArray().map(
      func(post) {
        if (post.id == postId) {
          updateLikeStatus(post, caller);
        } else {
          post;
        };
      }
    );

    mutablePosts.clear();
    mutablePosts.addAll(updatedPosts.values());
  };

  public shared ({ caller }) func likeComment(postId : Nat, commentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can like comments");
    };

    let updateCommentLikes = func(comment : Comment, caller : Principal) : Comment {
      if (comment.likedBy.contains(caller)) {
        comment; // No change if caller has already liked
      } else {
        let newLikedBy = comment.likedBy.clone();
        newLikedBy.add(caller);
        { comment with likes = comment.likes + 1; likedBy = newLikedBy };
      };
    };

    let updatedPosts = mutablePosts.toArray().map(
      func(post) {
        if (post.id == postId) {
          let updatedComments = post.comments.map(
            func(comment) {
              if (comment.id == commentId) {
                updateCommentLikes(comment, caller);
              } else {
                comment;
              };
            }
          );
          {
            post with
            comments = updatedComments
          };
        } else {
          post;
        };
      }
    );

    mutablePosts.clear();
    mutablePosts.addAll(updatedPosts.values());
  };

  public shared ({ caller }) func deletePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete posts");
    };

    switch (mutablePosts.toArray().find(func(p) { p.id == postId })) {
      case (?targetPost) {
        if (targetPost.authorId != caller) {
          Runtime.trap("Unauthorized: Only post author can delete this post.");
        };
        let filteredPosts = mutablePosts.toArray().filter(
          func(p) { p.id != postId }
        );
        mutablePosts.clear();
        mutablePosts.addAll(filteredPosts.values());
      };
      case (null) { Runtime.trap("Post not found") };
    };
  };

  let reportersMap = Map.empty<Principal, Map.Map<Principal, Nat>>();
  let postsReported = Map.empty<Nat, Nat>();

  public shared ({ caller }) func reportPost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can report posts");
    };

    switch (postsReported.get(postId)) {
      case (?count) {
        postsReported.add(postId, count + 1);
      };
      case (null) {
        postsReported.add(postId, 1);
      };
    };

    let updatedPosts = mutablePosts.toArray().map(
      func(p) {
        if (p.id == postId) {
          {
            id = p.id;
            authorName = p.authorName;
            authorId = p.authorId;
            content = p.content;
            image = p.image;
            timestamp = p.timestamp;
            likes = p.likes;
            comments = p.comments;
            reported = true;
            likedBy = p.likedBy;
          };
        } else {
          p;
        };
      }
    );

    mutablePosts.clear();
    mutablePosts.addAll(updatedPosts.values());
  };

  public shared ({ caller }) func reportUser(reportedUser : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can report accounts");
    };

    if (caller == reportedUser) {
      Runtime.trap("Cannot report your own account");
    };

    let existingReporters = switch (reportersMap.get(reportedUser)) {
      case (?map) { map };
      case (null) {
        let map = Map.empty<Principal, Nat>();
        map;
      };
    };

    if (existingReporters.get(caller) == null) {
      existingReporters.add(caller, 1);
      reportersMap.add(reportedUser, existingReporters);
    };

    let distinctReporters = existingReporters.size();
    let reportThreshold = 5;

    if (distinctReporters >= reportThreshold) {
      switch (userProfiles.get(reportedUser)) {
        case (?profile) {
          let suspensionPeriod = 7 * 24 * 60 * 60 * 1_000_000_000;
          let updatedProfile = {
            name = profile.name;
            accountSuspendedUntil = ?(Time.now() + suspensionPeriod);
          };
          userProfiles.add(reportedUser, updatedProfile);
        };
        case (null) {};
      };
    };
  };
};
