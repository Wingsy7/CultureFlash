import { useCallback, useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

import { OAuthProvider, supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import type { User } from '@/types';

WebBrowser.maybeCompleteAuthSession();

type UseAuthResult = {
  user: User | null;
  isLoading: boolean;
  errorMessage: string | null;
  signInWithProvider: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
};

type OAuthTokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

let authListenerStarted = false;
let bootstrapPromise: Promise<void> | null = null;

const readStringMetadata = (
  metadata: Record<string, unknown>,
  key: string,
): string | null => {
  const value = metadata[key];

  return typeof value === 'string' && value.length > 0 ? value : null;
};

const mapSupabaseUser = (supabaseUser: SupabaseUser): User => {
  const metadata = supabaseUser.user_metadata;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    username:
      readStringMetadata(metadata, 'name') ??
      readStringMetadata(metadata, 'full_name') ??
      supabaseUser.email?.split('@')[0] ??
      null,
    avatarUrl:
      readStringMetadata(metadata, 'avatar_url') ??
      readStringMetadata(metadata, 'picture'),
  };
};

const parseOAuthTokens = (url: string): OAuthTokens => {
  const parsedUrl = new URL(url);
  const params = new URLSearchParams(parsedUrl.search);
  const hash = parsedUrl.hash.replace(/^#/, '');

  new URLSearchParams(hash).forEach((value, key) => {
    params.set(key, value);
  });

  return {
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token'),
  };
};

const ensureUserRows = async (user: User): Promise<void> => {
  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      username: user.username,
      avatar_url: user.avatarUrl,
    },
    { onConflict: 'id' },
  );

  if (profileError) {
    throw profileError;
  }

  const { error: streakError } = await supabase.from('streaks').upsert(
    {
      user_id: user.id,
      current_streak: 0,
      longest_streak: 0,
      total_played: 0,
      total_correct: 0,
    },
    { ignoreDuplicates: true, onConflict: 'user_id' },
  );

  if (streakError) {
    throw streakError;
  }
};

const applySessionToStore = async (session: Session | null): Promise<void> => {
  const { resetUserState, setUser } = useUserStore.getState();

  if (!session?.user) {
    resetUserState();
    return;
  }

  const mappedUser = mapSupabaseUser(session.user);
  setUser(mappedUser);
  await ensureUserRows(mappedUser);
};

const bootstrapAuthSession = async (): Promise<void> => {
  const { setAuthIsLoading } = useUserStore.getState();
  setAuthIsLoading(true);

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    await applySessionToStore(data.session);
  } finally {
    setAuthIsLoading(false);
  }
};

const getBootstrapPromise = (): Promise<void> => {
  bootstrapPromise ??= bootstrapAuthSession();

  return bootstrapPromise;
};

const startAuthListener = (): void => {
  if (authListenerStarted) {
    return;
  }

  authListenerStarted = true;

  supabase.auth.onAuthStateChange((_event, session) => {
    void applySessionToStore(session).catch(() => undefined);
  });
};

export const useAuth = (): UseAuthResult => {
  const user = useUserStore((state) => state.user);
  const authIsLoading = useUserStore((state) => state.authIsLoading);
  const setAuthIsLoading = useUserStore((state) => state.setAuthIsLoading);
  const resetUserState = useUserStore((state) => state.resetUserState);
  const [isLoading, setIsLoading] = useState(authIsLoading);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    startAuthListener();

    void getBootstrapPromise()
      .catch((error: unknown) => {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Impossible de charger la session utilisateur.',
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const signInWithProvider = useCallback(
    async (provider: OAuthProvider): Promise<void> => {
      setIsLoading(true);
      setAuthIsLoading(true);
      setErrorMessage(null);

      try {
        const redirectTo = Linking.createURL('auth/callback');
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo,
            skipBrowserRedirect: true,
          },
        });

        if (error) {
          throw error;
        }

        if (!data.url) {
          throw new Error('Supabase n’a pas retourné d’URL OAuth.');
        }

        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

        if (result.type !== 'success') {
          return;
        }

        const tokens = parseOAuthTokens(result.url);

        if (!tokens.accessToken || !tokens.refreshToken) {
          throw new Error('La connexion OAuth n’a pas retourné de session valide.');
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        });

        if (sessionError) {
          throw sessionError;
        }

        await applySessionToStore(sessionData.session);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'La connexion a échoué.',
        );
      } finally {
        setIsLoading(false);
        setAuthIsLoading(false);
      }
    },
    [setAuthIsLoading],
  );

  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setAuthIsLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      resetUserState();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'La déconnexion a échoué.',
      );
    } finally {
      setIsLoading(false);
      setAuthIsLoading(false);
    }
  }, [resetUserState, setAuthIsLoading]);

  return {
    user,
    isLoading,
    errorMessage,
    signInWithProvider,
    signOut,
  };
};
