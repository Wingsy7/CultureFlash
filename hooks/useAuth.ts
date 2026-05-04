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

export const useAuth = (): UseAuthResult => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const resetUserState = useUserStore((state) => state.resetUserState);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const applySession = useCallback(
    async (session: Session | null): Promise<void> => {
      if (!session?.user) {
        resetUserState();
        return;
      }

      const mappedUser = mapSupabaseUser(session.user);
      setUser(mappedUser);
      await ensureUserRows(mappedUser);
    },
    [resetUserState, setUser],
  );

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async (): Promise<void> => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        await applySession(data.session);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Impossible de charger la session utilisateur.';

        if (isMounted) {
          setErrorMessage(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session).catch((error: unknown) => {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Impossible de synchroniser la session.',
        );
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  const signInWithProvider = useCallback(
    async (provider: OAuthProvider): Promise<void> => {
      setIsLoading(true);
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
          throw new Error('Supabase n’a pas retourne d’URL OAuth.');
        }

        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

        if (result.type !== 'success') {
          return;
        }

        const tokens = parseOAuthTokens(result.url);

        if (!tokens.accessToken || !tokens.refreshToken) {
          throw new Error('La connexion OAuth n’a pas retourne de session valide.');
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        });

        if (sessionError) {
          throw sessionError;
        }

        await applySession(sessionData.session);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'La connexion a echoue.',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [applySession],
  );

  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      resetUserState();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'La deconnexion a echoue.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [resetUserState]);

  return {
    user,
    isLoading,
    errorMessage,
    signInWithProvider,
    signOut,
  };
};
