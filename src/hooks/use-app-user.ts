"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export function useAppUser() {
  const { user: clerkUser, isLoaded } = useUser();

  const appUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  return {
    clerkUser,
    appUser,
    isLoaded: isLoaded && appUser !== undefined,
    needsSetup: isLoaded && clerkUser && appUser === null,
  };
}
