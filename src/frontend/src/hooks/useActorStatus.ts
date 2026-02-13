/**
 * Wrapper hook that exposes actor initialization status including errors.
 * Composes the immutable useActor() with React Query state to provide:
 * - actor: the initialized actor or null
 * - isLoading: true while actor is initializing
 * - isError: true if actor initialization failed
 * - error: the normalized error object
 * - retryActorInit: function to force a fresh initialization attempt
 */

import { useActor } from './useActor';
import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from './useInternetIdentity';
import { normalizeActorError, type NormalizedActorError } from '../utils/actorInitError';
import { useMemo } from 'react';

export interface ActorStatus {
  actor: ReturnType<typeof useActor>['actor'];
  isLoading: boolean;
  isError: boolean;
  error: NormalizedActorError | null;
  retryActorInit: () => Promise<void>;
}

export function useActorStatus(): ActorStatus {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  // Get the actor query state from the cache
  const actorQueryKey = ['actor', identity?.getPrincipal().toString()];
  const actorQueryState = queryClient.getQueryState(actorQueryKey);

  // Determine if there's an error
  const isError = actorQueryState?.status === 'error';
  const rawError = actorQueryState?.error;

  // Normalize the error
  const normalizedError = useMemo(() => {
    if (!isError || !rawError) return null;
    return normalizeActorError(rawError);
  }, [isError, rawError]);

  // Function to retry actor initialization
  const retryActorInit = async () => {
    // Remove the cached actor query to force a fresh initialization
    queryClient.removeQueries({ queryKey: actorQueryKey });
    // Refetch will happen automatically due to enabled: true in useActor
    await queryClient.refetchQueries({ queryKey: actorQueryKey });
  };

  return {
    actor,
    isLoading: isFetching && !isError,
    isError,
    error: normalizedError,
    retryActorInit,
  };
}
