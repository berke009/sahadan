import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { UserProfile } from '../types';

// Skip Supabase auth — use mock session for development
const USE_MOCK_AUTH = true;

const MOCK_USER: User = {
  id: 'mock-user-id',
  email: 'demo@soccera.app',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User;

const MOCK_PROFILE: UserProfile = {
  id: 'mock-user-id',
  xp: 2450,
  total_predictions: 42,
  correct_predictions: 26,
  created_at: new Date().toISOString(),
};

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: false,
  initialized: false,

  initialize: () => {
    if (USE_MOCK_AUTH) {
      set({ initialized: true });
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, initialized: true });
      if (session?.user) get().fetchProfile();
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) get().fetchProfile();
    });
  },

  signIn: async (email, password) => {
    set({ loading: true });

    if (USE_MOCK_AUTH) {
      await new Promise((r) => setTimeout(r, 500));
      set({
        loading: false,
        session: { access_token: 'mock-token' } as Session,
        user: MOCK_USER,
        profile: MOCK_PROFILE,
      });
      return {};
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ loading: false });
    return { error: error?.message };
  },

  signUp: async (email, password) => {
    set({ loading: true });

    if (USE_MOCK_AUTH) {
      await new Promise((r) => setTimeout(r, 500));
      set({
        loading: false,
        session: { access_token: 'mock-token' } as Session,
        user: MOCK_USER,
        profile: MOCK_PROFILE,
      });
      return {};
    }

    const { error } = await supabase.auth.signUp({ email, password });
    set({ loading: false });
    return { error: error?.message };
  },

  signOut: async () => {
    if (!USE_MOCK_AUTH) {
      await supabase.auth.signOut();
    }
    set({ session: null, user: null, profile: null });
  },

  fetchProfile: async () => {
    if (USE_MOCK_AUTH) {
      set({ profile: MOCK_PROFILE });
      return;
    }

    const userId = get().user?.id;
    if (!userId) return;

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) set({ profile: data as UserProfile });
  },
}));
