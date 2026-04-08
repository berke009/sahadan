// Mock footballApi before importing aiChat
jest.mock('../footballApi', () => ({
  LEAGUES: { superLig: 203, premierLeague: 39, laLiga: 140, serieA: 135, bundesliga: 78, championsLeague: 2, europaLeague: 3 },
  getTodayFixtures: jest.fn(),
  getLiveFixtures: jest.fn(),
  getStandings: jest.fn(),
  getTopScorers: jest.fn(),
  getHeadToHead: jest.fn(),
  getTeamStats: jest.fn(),
  searchTeam: jest.fn(),
}));

const mockFetch = jest.fn();
(globalThis as any).fetch = mockFetch;

import { getAIResponse } from '../aiChat';
import { getTodayFixtures } from '../footballApi';

beforeEach(() => {
  mockFetch.mockReset();
  (getTodayFixtures as jest.Mock).mockReset();
});

describe('getAIResponse', () => {
  test('calls /api/chat endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { role: 'assistant', content: 'Merhaba!' }, finish_reason: 'stop' }],
      }),
    });

    await getAIResponse('Selam');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/chat');
  });

  test('sends correct OpenAI-format request body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { role: 'assistant', content: 'Hi' }, finish_reason: 'stop' }],
      }),
    });

    await getAIResponse('Selam');

    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe('POST');
    const body = JSON.parse(options.body);
    expect(body.model).toBe('gpt-4o');
    expect(body.max_tokens).toBe(1024);
    expect(body.messages).toHaveLength(2);
    expect(body.messages[0].role).toBe('system');
    expect(body.messages[1]).toEqual({ role: 'user', content: 'Selam' });
    expect(body.tools).toBeDefined();
    expect(body.tool_choice).toBe('auto');
  });

  test('returns direct text for non-tool responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { role: 'assistant', content: 'Merhaba! Nasılsın?' }, finish_reason: 'stop' }],
      }),
    });

    const result = await getAIResponse('Selam');
    expect(result.content).toBe('Merhaba! Nasılsın?');
    expect(result.widget_payload).toBeUndefined();
  });

  test('executes tool and makes follow-up call', async () => {
    // First call: model requests a tool
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            role: 'assistant',
            content: null,
            tool_calls: [{
              id: 'call_123',
              type: 'function',
              function: { name: 'get_today_fixtures', arguments: '{"league_id":203}' },
            }],
          },
          finish_reason: 'tool_calls',
        }],
      }),
    });

    (getTodayFixtures as jest.Mock).mockResolvedValueOnce([{
      fixture: { id: 1, date: '2026-04-08T20:00:00+03:00', status: { short: 'NS', elapsed: null } },
      league: { id: 203, name: 'Süper Lig', logo: '' },
      teams: { home: { id: 1, name: 'Galatasaray', logo: '' }, away: { id: 2, name: 'Fenerbahçe', logo: '' } },
      goals: { home: null, away: null },
    }]);

    // Second call: model generates final response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { role: 'assistant', content: 'Bugün 1 maç var!' }, finish_reason: 'stop' }],
      }),
    });

    const result = await getAIResponse('Bugün maç var mı?');

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result.content).toBe('Bugün 1 maç var!');
    expect(result.widget_payload).toBeDefined();
    expect(result.widget_payload!.type).toBe('hot_matches');
  });

  test('throws on AI error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    });

    await expect(getAIResponse('test')).rejects.toThrow('AI error 500');
  });

  test('includes 6 tool definitions', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { role: 'assistant', content: 'ok' }, finish_reason: 'stop' }],
      }),
    });

    await getAIResponse('test');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.tools).toHaveLength(6);
    const toolNames = body.tools.map((t: any) => t.function.name);
    expect(toolNames).toEqual([
      'get_today_fixtures',
      'get_live_scores',
      'get_standings',
      'get_top_scorers',
      'get_team_form',
      'get_head_to_head',
    ]);
  });
});
