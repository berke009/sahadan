// Mock aiChat service
jest.mock('../../services/aiChat', () => ({
  getAIResponse: jest.fn(),
}));

// Mock supabase
jest.mock('../../services/supabase', () => ({
  supabase: {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null }),
    }),
    functions: { invoke: jest.fn() },
  },
}));

import { useChatStore } from '../chatStore';
import { getAIResponse } from '../../services/aiChat';

beforeEach(() => {
  // Reset store state
  useChatStore.setState({ messages: [], sessionId: null, loading: false, error: null });
  (getAIResponse as jest.Mock).mockReset();
});

describe('chatStore', () => {
  test('initSession sets mock session id in client AI mode', async () => {
    await useChatStore.getState().initSession();
    expect(useChatStore.getState().sessionId).toBe('mock-session');
  });

  test('sendMessage adds user message and calls getAIResponse', async () => {
    useChatStore.setState({ sessionId: 'mock-session' });
    (getAIResponse as jest.Mock).mockResolvedValueOnce({
      content: 'Merhaba!',
    });

    await useChatStore.getState().sendMessage('Selam');

    const messages = useChatStore.getState().messages;
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('user');
    expect(messages[0].content).toBe('Selam');
    expect(messages[1].role).toBe('assistant');
    expect(messages[1].content).toBe('Merhaba!');
    expect(getAIResponse).toHaveBeenCalledWith('Selam', expect.any(Array));
  });

  test('sendMessage preserves widget_payload from AI response', async () => {
    useChatStore.setState({ sessionId: 'mock-session' });
    const widget = { type: 'hot_matches' as const, matches: [] };
    (getAIResponse as jest.Mock).mockResolvedValueOnce({
      content: 'Bugün 3 maç var!',
      widget_payload: widget,
    });

    await useChatStore.getState().sendMessage('Bugün maç var mı?');

    const messages = useChatStore.getState().messages;
    expect(messages[1].widget_payload).toEqual(widget);
  });

  test('sendMessage shows error as assistant message on failure', async () => {
    useChatStore.setState({ sessionId: 'mock-session' });
    (getAIResponse as jest.Mock).mockRejectedValueOnce(new Error('AI error 500: Internal Server Error'));

    await useChatStore.getState().sendMessage('test');

    const messages = useChatStore.getState().messages;
    expect(messages).toHaveLength(2);
    expect(messages[1].role).toBe('assistant');
    expect(messages[1].content).toContain('AI servisi');
    expect(useChatStore.getState().loading).toBe(false);
    expect(useChatStore.getState().error).toBeDefined();
  });

  test('sendMessage sets loading state correctly', async () => {
    useChatStore.setState({ sessionId: 'mock-session' });
    let resolveAI: (v: any) => void;
    const aiPromise = new Promise((r) => { resolveAI = r; });
    (getAIResponse as jest.Mock).mockReturnValueOnce(aiPromise);

    const sendPromise = useChatStore.getState().sendMessage('test');

    // Loading should be true while waiting
    expect(useChatStore.getState().loading).toBe(true);

    resolveAI!({ content: 'done' });
    await sendPromise;

    // Loading should be false after completion
    expect(useChatStore.getState().loading).toBe(false);
  });

  test('sendMessage does nothing without sessionId', async () => {
    useChatStore.setState({ sessionId: null });
    await useChatStore.getState().sendMessage('test');

    expect(useChatStore.getState().messages).toHaveLength(0);
    expect(getAIResponse).not.toHaveBeenCalled();
  });
});
