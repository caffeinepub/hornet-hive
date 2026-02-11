import { useGetCallerUserProfile } from './useQueries';

export function useSuspensionStatus() {
  const { data: profile } = useGetCallerUserProfile();

  if (!profile || !profile.accountSuspendedUntil) {
    return {
      isSuspended: false,
      suspensionEnd: null,
    };
  }

  const now = BigInt(Date.now()) * BigInt(1_000_000); // Convert to nanoseconds
  const isSuspended = now < profile.accountSuspendedUntil;

  return {
    isSuspended,
    suspensionEnd: isSuspended ? profile.accountSuspendedUntil : null,
  };
}
