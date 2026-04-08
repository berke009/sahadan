import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { Message } from '../types';
import { getAIResponse } from '../services/aiChat';

interface ChatState {
  messages: Message[];
  sessionId: string | null;
  loading: boolean;
  error: string | null;
  initSession: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  addWidgetAction: (content: string) => Promise<void>;
  loadHistory: () => Promise<void>;
}

// Use local mock responses (edge function not deployed yet)
const USE_MOCK = true;

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  sessionId: null,
  loading: false,
  error: null,

  initSession: async () => {
    if (USE_MOCK) {
      set({ sessionId: 'mock-session' });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: sessions } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (sessions && sessions.length > 0) {
      set({ sessionId: sessions[0].id });
      await get().loadHistory();
    } else {
      const { data } = await supabase
        .from('chat_sessions')
        .insert({ user_id: user.id })
        .select('id')
        .single();
      if (data) set({ sessionId: data.id });
    }
  },

  loadHistory: async () => {
    if (USE_MOCK) return;
    const { sessionId } = get();
    if (!sessionId) return;

    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (data) set({ messages: data as Message[] });
  },

  sendMessage: async (content: string) => {
    const { sessionId, messages } = get();
    if (!sessionId) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      session_id: sessionId,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    set({ messages: [...messages, userMsg], loading: true, error: null });

    try {
      if (USE_MOCK) {
        const response = await getAIResponse(content);
        const assistantMsg: Message = {
          id: `msg-${Date.now()}-resp`,
          session_id: sessionId,
          role: 'assistant',
          content: response.content,
          widget_payload: response.widget_payload,
          created_at: new Date().toISOString(),
        };
        set((state) => ({
          messages: [...state.messages, assistantMsg],
          loading: false,
        }));
        return;
      }

      await supabase.from('messages').insert({
        session_id: sessionId,
        role: 'user',
        content,
      });

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { session_id: sessionId, message: content },
      });

      if (error) throw new Error(error.message);

      const assistantMsg: Message = {
        id: data.id || `resp-${Date.now()}`,
        session_id: sessionId,
        role: 'assistant',
        content: data.content,
        widget_type: data.widget_type,
        widget_payload: data.widget_payload,
        created_at: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        loading: false,
      }));
    } catch (err: any) {
      const errorMessage = err.message || 'Bir hata olustu';
      const errorMsg: Message = {
        id: `msg-${Date.now()}-error`,
        session_id: sessionId,
        role: 'assistant',
        content: `Hata: ${errorMessage}`,
        created_at: new Date().toISOString(),
      };
      set((state) => ({
        messages: [...state.messages, errorMsg],
        loading: false,
        error: errorMessage,
      }));
    }
  },

  addWidgetAction: async (content: string) => {
    await get().sendMessage(content);
  },
}));
