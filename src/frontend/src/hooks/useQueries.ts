import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActorStatus } from './useActorStatus';
import type { PostView, UserProfile } from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';
import { withTimeout } from '../utils/withTimeout';

export function useGetCallerUserProfile() {
  const { actor, isLoading: actorLoading, isError: actorError, error: actorErrorDetails } = useActorStatus();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      // Wrap the actor call with a timeout
      return withTimeout(
        actor.getCallerUserProfile(),
        10000,
        'Profile fetch timed out. Please try again.'
      );
    },
    // Only enable when actor is available and not in error state
    enabled: !!actor && !actorLoading && !actorError,
    retry: (failureCount, error) => {
      // Don't retry timeout errors
      if (error.message.includes('timed out')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 0,
  });

  // If actor initialization failed, surface that error instead of profile fetch error
  const effectiveError = actorError && actorErrorDetails 
    ? new Error(actorErrorDetails.message)
    : query.error;

  const effectiveIsError = actorError || query.isError;

  return {
    ...query,
    // Loading if actor is loading OR profile query is loading (but not if actor errored)
    isLoading: actorLoading || (query.isLoading && !actorError),
    // Error if actor errored OR profile query errored
    isError: effectiveIsError,
    error: effectiveError,
    // Fetched if actor errored (so we can show error screen) OR profile query fetched
    isFetched: actorError || query.isFetched,
  };
}

export function useGetUserProfile(userPrincipal: Principal | null) {
  const { actor, isLoading: actorLoading } = useActorStatus();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal) return null;
      return actor.getUserProfile(userPrincipal);
    },
    enabled: !!actor && !actorLoading && !!userPrincipal,
  });
}

export function useSetUniqueUsername() {
  const { actor } = useActorStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setUniqueUsername(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetPosts() {
  const { actor, isLoading: actorLoading } = useActorStatus();

  return useQuery<PostView[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPosts();
    },
    enabled: !!actor && !actorLoading,
    refetchInterval: 10000, // Poll every 10 seconds for new posts
  });
}

export function useCreatePost() {
  const { actor } = useActorStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, image }: { content: string; image: ExternalBlob | null }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createPost(content, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActorStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActorStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, commentId }: { postId: bigint; commentId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteComment(postId, commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useLikePost() {
  const { actor } = useActorStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.likePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    // Don't invalidate on error - let the component handle it
    onError: () => {
      // Error is handled in the component
    },
  });
}

export function useAddComment() {
  const { actor } = useActorStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: bigint; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addComment(postId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useLikeComment() {
  const { actor } = useActorStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, commentId }: { postId: bigint; commentId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.likeComment(postId, commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    // Don't invalidate on error - let the component handle it
    onError: () => {
      // Error is handled in the component
    },
  });
}

export function useReportPost() {
  const { actor } = useActorStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.reportPost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useReportComment() {
  const { actor } = useActorStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, commentId }: { postId: bigint; commentId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.reportComment(postId, commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useReportUser() {
  const { actor } = useActorStatus();

  return useMutation({
    mutationFn: async (reportedUser: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.reportUser(reportedUser);
    },
  });
}
