import Set "mo:core/Set";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
  type Comment = {
    id : Nat;
    authorName : Text;
    authorId : Principal;
    content : Text;
    likes : Nat;
    timestamp : Int;
    reported : Bool;
    likedBy : Set.Set<Principal>;
  };

  type OldPost = {
    id : Nat;
    authorName : Text;
    authorId : Principal;
    content : Text;
    image : ?Storage.ExternalBlob;
    timestamp : Int;
    likes : Nat;
    comments : [Comment];
    reported : Bool;
  };

  type NewPost = {
    id : Nat;
    authorName : Text;
    authorId : Principal;
    content : Text;
    image : ?Storage.ExternalBlob;
    timestamp : Int;
    likes : Nat;
    comments : [Comment];
    reported : Bool;
    likedBy : Set.Set<Principal>;
  };

  type OldActor = {
    mutablePosts : List.List<OldPost>;
    nextPostId : Nat;
    nextCommentId : Nat;
  };

  type NewActor = {
    mutablePosts : List.List<NewPost>;
    nextPostId : Nat;
    nextCommentId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newPosts = old.mutablePosts.map<OldPost, NewPost>(
      func(oldPost) {
        { oldPost with likedBy = Set.empty<Principal>() };
      }
    );
    { old with mutablePosts = newPosts };
  };
};
