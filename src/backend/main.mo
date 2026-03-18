import Map "mo:core/Map";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Int "mo:core/Int";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Nat "mo:core/Nat";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserProfile = {
    username : Text;
    bio : Text;
    avatar : ?Storage.ExternalBlob;
    createdAt : Int;
  };

  public type Post = {
    id : Nat;
    author : Principal;
    content : Text;
    image : ?Storage.ExternalBlob;
    timestamp : Int;
    likes : Nat;
  };

  public type Comment = {
    id : Nat;
    postId : Nat;
    author : Principal;
    content : Text;
    timestamp : Int;
  };

  var nextPostId = 1;
  var nextCommentId = 1;

  // Storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let posts = Map.empty<Nat, Post>();
  let comments = Map.empty<Nat, Comment>();
  let usernameToPrincipal = Map.empty<Text, Principal>();

  let followers = Map.empty<Principal, Set.Set<Principal>>();
  let following = Map.empty<Principal, Set.Set<Principal>>();
  let postLikes = Map.empty<Nat, Set.Set<Principal>>();

  // User Profile Functions
  public shared ({ caller }) func updateProfile(username : Text, bio : Text, avatar : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    if (username.size() < 3 or username.size() > 20) {
      Runtime.trap("Username must be 3-20 characters long");
    };

    // Check for username uniqueness
    switch (usernameToPrincipal.get(username)) {
      case (?owner) {
        if (owner != caller) {
          Runtime.trap("Username already taken");
        };
      };
      case (null) {};
    };

    // If user already exists, remove old username mapping
    switch (userProfiles.get(caller)) {
      case (?existingProfile) {
        if (existingProfile.username != username) {
          usernameToPrincipal.remove(existingProfile.username);
        };
      };
      case (null) {};
    };

    let profile : UserProfile = {
      username;
      bio;
      avatar;
      createdAt = Time.now();
    };

    userProfiles.add(caller, profile);
    usernameToPrincipal.add(username, caller);
  };

  public query ({ caller }) func getProfileByPrincipal(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public query ({ caller }) func getProfileByUsername(username : Text) : async ?UserProfile {
    switch (usernameToPrincipal.get(username)) {
      case (?user) { userProfiles.get(user) };
      case (null) { null };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Follow/Unfollow Functions
  public shared ({ caller }) func followUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow other users");
    };

    if (caller == target) { Runtime.trap("Cannot follow yourself") };

    let callerFollowings = switch (following.get(caller)) {
      case (?f) { f };
      case (null) { Set.empty<Principal>() };
    };

    if (callerFollowings.contains(target)) {
      Runtime.trap("Already following this user");
    };

    callerFollowings.add(target);
    following.add(caller, callerFollowings);

    let targetFollowers = switch (followers.get(target)) {
      case (?f) { f };
      case (null) { Set.empty<Principal>() };
    };
    targetFollowers.add(caller);
    followers.add(target, targetFollowers);
  };

  public shared ({ caller }) func unfollowUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow other users");
    };

    let callerFollowings = switch (following.get(caller)) {
      case (?f) { f };
      case (null) { Runtime.trap("You are not following anyone") };
    };

    if (not callerFollowings.contains(target)) {
      Runtime.trap("You are not following this user");
    };

    callerFollowings.remove(target);

    if (callerFollowings.isEmpty()) {
      following.remove(caller);
    } else {
      following.add(caller, callerFollowings);
    };

    let targetFollowers = switch (followers.get(target)) {
      case (?f) { f };
      case (null) { Runtime.trap("This user has no followers") };
    };

    targetFollowers.remove(caller);

    if (targetFollowers.isEmpty()) {
      followers.remove(target);
    } else {
      followers.add(target, targetFollowers);
    };
  };

  // Post Functions
  public shared ({ caller }) func createPost(content : Text, image : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    if (content.isEmpty() and image == null) {
      Runtime.trap("Post cannot be empty");
    };

    let post : Post = {
      id = nextPostId;
      author = caller;
      content;
      image;
      timestamp = Time.now();
      likes = 0;
    };

    posts.add(nextPostId, post);
    nextPostId += 1;
  };

  public query ({ caller }) func getPost(postId : Nat) : async ?Post {
    posts.get(postId);
  };

  public query ({ caller }) func getUserPosts(user : Principal) : async [Post] {
    let filteredPosts = posts.values().filter(
      func(post) {
        post.author == user;
      }
    );
    filteredPosts.toArray();
  };

  // Like/Unlike Posts
  public shared ({ caller }) func likePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    switch (posts.get(postId)) {
      case (?post) {
        let likeSet = switch (postLikes.get(postId)) {
          case (?s) { s };
          case (null) { Set.empty<Principal>() };
        };

        if (likeSet.contains(caller)) {
          Runtime.trap("Already liked this post");
        };

        likeSet.add(caller);
        postLikes.add(postId, likeSet);

        let updatedPost : Post = { post with likes = likeSet.size() };
        posts.add(postId, updatedPost);
      };
      case (null) { Runtime.trap("Post not found") };
    };
  };

  public shared ({ caller }) func unlikePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike posts");
    };

    switch (posts.get(postId)) {
      case (?post) {
        let likeSet = switch (postLikes.get(postId)) {
          case (?s) { s };
          case (null) { Set.empty<Principal>() };
        };

        if (not likeSet.contains(caller)) {
          Runtime.trap("You have not liked this post");
        };

        likeSet.remove(caller);
        if (likeSet.isEmpty()) {
          postLikes.remove(postId);
        } else {
          postLikes.add(postId, likeSet);
        };

        let updatedPost : Post = { post with likes = likeSet.size() };
        posts.add(postId, updatedPost);
      };
      case (null) { Runtime.trap("Post not found") };
    };
  };

  // Comment Functions
  public shared ({ caller }) func addComment(postId : Nat, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    switch (posts.get(postId)) {
      case (?_) {
        let comment : Comment = {
          id = nextCommentId;
          postId;
          author = caller;
          content;
          timestamp = Time.now();
        };

        comments.add(nextCommentId, comment);
        nextCommentId += 1;
      };
      case (null) { Runtime.trap("Post not found") };
    };
  };

  public query ({ caller }) func getComments(postId : Nat) : async [Comment] {
    let filteredComments = comments.values().filter(
      func(comment) {
        comment.postId == postId;
      }
    );
    filteredComments.toArray();
  };

  // Feed Functions
  public query ({ caller }) func getHomeFeed(offset : Nat, limit : Nat) : async [Post] {
    let followedUsers = switch (following.get(caller)) {
      case (?f) { f };
      case (null) { Set.empty<Principal>() };
    };

    let filteredPosts = posts.values().filter(
      func(post) {
        followedUsers.contains(post.author);
      }
    );

    let postArray = filteredPosts.toArray();
    if (offset >= postArray.size()) {
      return [];
    };
    let endIndex = Nat.min(offset + limit, postArray.size());
    let resultList = List.empty<Post>();
    var i = offset;
    while (i < endIndex) {
      resultList.add(postArray[i]);
      i += 1;
    };
    resultList.toArray();
  };

  public query ({ caller }) func getExploreFeed(offset : Nat, limit : Nat) : async [Post] {
    let postArray = posts.values().toArray();
    if (offset >= postArray.size()) {
      return [];
    };
    let endIndex = Nat.min(offset + limit, postArray.size());
    let resultList = List.empty<Post>();
    var i = offset;
    while (i < endIndex) {
      resultList.add(postArray[i]);
      i += 1;
    };
    resultList.toArray();
  };

  public query ({ caller }) func getFollowers(user : Principal) : async [Principal] {
    switch (followers.get(user)) {
      case (?f) { f.toArray() };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getFollowing(user : Principal) : async [Principal] {
    switch (following.get(user)) {
      case (?f) { f.toArray() };
      case (null) { [] };
    };
  };
};

