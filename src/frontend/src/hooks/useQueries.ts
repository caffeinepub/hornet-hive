import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PostView, UserProfile } from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';
import { useEffect, useState, useRef } from 'react';
import { withTimeout } from '../utils/withTimeout';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const [actorTimeout, setActorTimeout] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Set a timeout for actor initialization - starts whenever actor is null
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!actor) {
      // Start countdown whenever actor is not available
      timerRef.current = setTimeout(() => {
        setActorTimeout(true);
      }, 8000); // 8 second timeout
    } else {
      // Actor is available, clear timeout state
      setActorTimeout(false);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [actor]);

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Unable to connect to the service. Please check your connection and try again.');
      }
      // Wrap the actor call with a timeout
      return withTimeout(
        actor.getCallerUserProfile(),
        10000,
        'Profile fetch timed out. Please try again.'
      );
    },
    // Enable the query if:
    // 1. Actor is available and not fetching, OR
    // 2. Actor timed out (so we can throw an error)
    enabled: (!!actor && !actorFetching) || actorTimeout,
    retry: (failureCount, error) => {
      // Don't retry timeout or connection errors
      if (error.message.includes('timed out') || error.message.includes('connect')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 0,
  });

  // Reset timeout state when needed for retry
  const resetTimeout = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setActorTimeout(false);
  };

  return {
    ...query,
    isLoading: (actorFetching || query.isLoading) && !actorTimeout,
    isFetched: query.isFetched || (actorTimeout && query.isError),
    resetTimeout,
  };
}

export function useGetUserProfile(userPrincipal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal) return null;
      return actor.getUserProfile(userPrincipal);
    },
    enabled: !!actor && !actorFetching && !!userPrincipal,
  });
}

export function useSetUniqueUsername() {
  const { actor } = useActor();
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
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PostView[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPosts();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000, // Poll every 10 seconds for new posts
  });
}

export function useCreatePost() {
  const { actor } = useActor();
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
  const { actor } = useActor();
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
  const { actor } = useActor();
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
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.likePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
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
  const { actor } = useActor();
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
  const { actor } = useActor();
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
  const { actor } = useActor();
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
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (reportedUser: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.reportUser(reportedUser);
    },
  });
}
