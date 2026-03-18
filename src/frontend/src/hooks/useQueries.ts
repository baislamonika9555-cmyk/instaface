import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Comment, Post, UserProfile } from "../backend";
import { useActor } from "./useActor";

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetHomeFeed(offset: bigint, limit: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Post[]>({
    queryKey: ["homeFeed", offset.toString(), limit.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHomeFeed(offset, limit);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetExploreFeed(offset: bigint, limit: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Post[]>({
    queryKey: ["exploreFeed", offset.toString(), limit.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExploreFeed(offset, limit);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserProfile(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getProfileByPrincipal(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
    staleTime: 60_000,
  });
}

export function useGetUserPosts(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Post[]>({
    queryKey: ["userPosts", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getUserPosts(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useGetFollowers(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Principal[]>({
    queryKey: ["followers", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getFollowers(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useGetFollowing(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Principal[]>({
    queryKey: ["following", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getFollowing(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useGetComments(postId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Comment[]>({
    queryKey: ["comments", postId?.toString()],
    queryFn: async () => {
      if (!actor || postId === null) return [];
      return actor.getComments(postId);
    },
    enabled: !!actor && !isFetching && postId !== null,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      bio,
      avatar,
    }: {
      username: string;
      bio: string;
      avatar: import("../backend").ExternalBlob | null;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.updateProfile(username, bio, avatar);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      content,
      image,
    }: {
      content: string;
      image: import("../backend").ExternalBlob | null;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.createPost(content, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
      queryClient.invalidateQueries({ queryKey: ["exploreFeed"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
    },
  });
}

export function useLikePost() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.likePost(postId);
    },
  });
}

export function useUnlikePost() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.unlikePost(postId);
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postId,
      content,
    }: {
      postId: bigint;
      content: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.addComment(postId, content);
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", postId.toString()],
      });
    },
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.followUser(target);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.unfollowUser(target);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
    },
  });
}
