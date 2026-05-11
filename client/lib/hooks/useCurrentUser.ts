"use client";

import { useState, useEffect } from "react";
import { getMe, User } from "@/lib/api/auth";

interface UseCurrentUserResult {
  user: User | null;
  loading: boolean;
}

export function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}