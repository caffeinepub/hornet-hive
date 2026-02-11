import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type OldComment = {
    id : Nat;
    authorName : Text;
    authorId : Principal;
    content : Text;
    likes : Nat;
    timestamp : Int;
    reported : Bool;
  };

  type OldPost = {
    id : Nat;
    authorName : Text;
    authorId : Principal;
    content : Text;
    image : ?Storage.ExternalBlob;
    timestamp : Int;
    likes : Nat;
    comments : [OldComment];
    reported : Bool;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text; accountSuspendedUntil : ?Int }>;
    mutablePosts : List.List<OldPost>;
    nextPostId : Nat;
    nextCommentId : Nat;
    reportersMap : Map.Map<Principal, Map.Map<Principal, Nat>>;
    postsReported : Map.Map<Nat, Nat>;
  };

  type NewComment = {
    id : Nat;
    authorName : Text;
    authorId : Principal;
    content : Text;
    likes : Nat;
    timestamp : Int;
    reported : Bool;
    likedBy : Set.Set<Principal>;
  };

  type NewPost = {
    id : Nat;
    authorName : Text;
    authorId : Principal;
    content : Text;
    image : ?Storage.ExternalBlob;
    timestamp : Int;
    likes : Nat;
    comments : [NewComment];
    reported : Bool;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text; accountSuspendedUntil : ?Int }>;
    mutablePosts : List.List<NewPost>;
    nextPostId : Nat;
    nextCommentId : Nat;
    reportersMap : Map.Map<Principal, Map.Map<Principal, Nat>>;
    postsReported : Map.Map<Nat, Nat>;
  };

  public func run(old : OldActor) : NewActor {
    let newPosts = old.mutablePosts.map<OldPost, NewPost>(
      func(oldPost) {
        let newComments = oldPost.comments.map(
          func(oldComment) {
            {
              oldComment with
              likedBy = Set.empty<Principal>() // All old comments start empty
            }
          }
        );
        { oldPost with comments = newComments };
      }
    );
    { old with mutablePosts = newPosts };
  };
};
