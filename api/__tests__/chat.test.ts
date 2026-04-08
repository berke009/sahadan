import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock @ai-sdk/gateway
const mockGenerateText = jest.fn();
const mockGatewayModel = jest.fn().mockReturnValue('mock-model');
jest.mock('@ai-sdk/gateway', () => ({
  createGateway: jest.fn(() => mockGatewayModel),
}));

// Mock ai package
jest.mock('ai', () => ({
  generateText: (...args: any[]) => mockGenerateText(...args),
  jsonSchema: (schema: any) => ({ _jsonSchema: schema }),
}));

import handler from '../chat';
import { createGateway } from '@ai-sdk/gateway';

function createReq(overrides: Partial<VercelRequest> = {}): VercelRequest {
  return {
    method: 'POST',
    body: {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are helpful.' },
        { role: 'user', content: 'hello' },
      ],
      tools: [{
        type: 'function',
        function: {
          name: 'get_standings',
          description: 'Get league standings',
          parameters: { type: 'object', properties: { league_id: { type: 'number' } } },
        },
      }],
      max_tokens: 1024,
    },
    ...overrides,
  } as unknown as VercelRequest;
}

function createRes(): VercelResponse & { _status: number; _body: unknown; _headers: Record<string, string> } {
  const res: any = { _status: 200, _body: null, _headers: {} };
  res.setHeader = jest.fn((k: string, v: string) => { res._headers[k] = v; return res; });
  res.status = jest.fn((code: number) => { res._status = code; return res; });
  res.json = jest.fn((data: unknown) => { res._body = data; return res; });
  res.send = jest.fn((data: unknown) => { res._body = data; return res; });
  res.end = jest.fn(() => res);
  return res;
}

beforeEach(() => {
  mockGenerateText.mockReset();
  mockGatewayModel.mockClear();
  (createGateway as jest.Mock).mockClear();
  process.env.AI_GATEWAY_KEY = 'test-key-123';
});

afterEach(() => {
  delete process.env.AI_GATEWAY_KEY;
});

describe('api/chat proxy (AI SDK)', () => {
  test('creates gateway with correct API key', async () => {
    mockGenerateText.mockResolvedValueOnce({
      text: 'Hello!', toolCalls: [], finishReason: 'stop',
    });

    await handler(createReq(), createRes());

    expect(createGateway).toHaveBeenCalledWith({ apiKey: 'test-key-123' });
  });

  test('adds openai/ prefix to model name', async () => {
    mockGenerateText.mockResolvedValueOnce({
      text: 'Hi', toolCalls: [], finishReason: 'stop',
    });

    await handler(createReq(), createRes());

    expect(mockGatewayModel).toHaveBeenCalledWith('openai/gpt-4o-mini');
  });

  test('preserves model name if it already has provider prefix', async () => {
    mockGenerateText.mockResolvedValueOnce({
      text: 'Hi', toolCalls: [], finishReason: 'stop',
    });

    const req = createReq({ body: { ...createReq().body, model: 'anthropic/claude-3.5-sonnet' } });
    await handler(req, createRes());

    expect(mockGatewayModel).toHaveBeenCalledWith('anthropic/claude-3.5-sonnet');
  });

  test('converts OpenAI tools to AI SDK format', async () => {
    mockGenerateText.mockResolvedValueOnce({
      text: 'ok', toolCalls: [], finishReason: 'stop',
    });

    await handler(createReq(), createRes());

    const call = mockGenerateText.mock.calls[0][0];
    expect(call.tools).toHaveProperty('get_standings');
    expect(call.tools.get_standings.description).toBe('Get league standings');
    expect(call.tools.get_standings.inputSchema).toEqual({
      _jsonSchema: { type: 'object', properties: { league_id: { type: 'number' } } },
    });
  });

  test('converts messages from OpenAI format to AI SDK format', async () => {
    mockGenerateText.mockResolvedValueOnce({
      text: 'ok', toolCalls: [], finishReason: 'stop',
    });

    await handler(createReq(), createRes());

    const call = mockGenerateText.mock.calls[0][0];
    expect(call.messages[0]).toEqual({ role: 'system', content: 'You are helpful.' });
    expect(call.messages[1]).toEqual({ role: 'user', content: 'hello' });
  });

  test('converts tool result messages correctly', async () => {
    mockGenerateText.mockResolvedValueOnce({
      text: 'ok', toolCalls: [], finishReason: 'stop',
    });

    const req = createReq({
      body: {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'system' },
          { role: 'user', content: 'puan durumu' },
          {
            role: 'assistant', content: null,
            tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'get_standings', arguments: '{"league_id":203}' } }],
          },
          { role: 'tool', content: 'Lider: Galatasaray', tool_call_id: 'call_1' },
        ],
        tools: [],
        max_tokens: 1024,
      },
    });

    await handler(req, createRes());

    const call = mockGenerateText.mock.calls[0][0];
    // Assistant message with tool calls
    expect(call.messages[2]).toEqual({
      role: 'assistant',
      content: [{
        type: 'tool-call',
        toolCallId: 'call_1',
        toolName: 'get_standings',
        input: { league_id: 203 },
      }],
    });
    // Tool result message
    expect(call.messages[3]).toEqual({
      role: 'tool',
      content: [{
        type: 'tool-result',
        toolCallId: 'call_1',
        toolName: 'get_standings',
        output: { type: 'text', value: 'Lider: Galatasaray' },
      }],
    });
  });

  test('returns text response in OpenAI format', async () => {
    mockGenerateText.mockResolvedValueOnce({
      text: 'Merhaba!', toolCalls: [], finishReason: 'stop',
    });

    const res = createRes();
    await handler(createReq(), res);

    expect(res._status).toBe(200);
    expect(res._body).toEqual({
      choices: [{
        message: { role: 'assistant', content: 'Merhaba!' },
        finish_reason: 'stop',
      }],
    });
  });

  test('returns tool calls in OpenAI format', async () => {
    mockGenerateText.mockResolvedValueOnce({
      text: '',
      toolCalls: [{
        toolCallId: 'call_abc',
        toolName: 'get_standings',
        input: { league_id: 203 },
      }],
      finishReason: 'tool-calls',
    });

    const res = createRes();
    await handler(createReq(), res);

    expect(res._body).toEqual({
      choices: [{
        message: {
          role: 'assistant',
          content: null,
          tool_calls: [{
            id: 'call_abc',
            type: 'function',
            function: { name: 'get_standings', arguments: '{"league_id":203}' },
          }],
        },
        finish_reason: 'tool_calls',
      }],
    });
  });

  test('returns 500 with error message on SDK failure', async () => {
    mockGenerateText.mockRejectedValueOnce(new Error('Gateway timeout'));

    const res = createRes();
    await handler(createReq(), res);

    expect(res._status).toBe(500);
    expect(res._body).toEqual({ error: 'Gateway timeout' });
  });

  test('returns 500 when AI_GATEWAY_KEY is missing', async () => {
    delete process.env.AI_GATEWAY_KEY;

    const res = createRes();
    await handler(createReq(), res);

    expect(res._status).toBe(500);
    expect(res._body).toEqual({ error: 'AI_GATEWAY_KEY not configured on server' });
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  test('returns 405 for non-POST methods', async () => {
    const req = createReq({ method: 'GET' });
    const res = createRes();
    await handler(req, res);

    expect(res._status).toBe(405);
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  test('returns 200 for OPTIONS (CORS preflight)', async () => {
    const req = createReq({ method: 'OPTIONS' });
    const res = createRes();
    await handler(req, res);

    expect(res._status).toBe(200);
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  test('sets CORS headers', async () => {
    mockGenerateText.mockResolvedValueOnce({
      text: 'ok', toolCalls: [], finishReason: 'stop',
    });

    const res = createRes();
    await handler(createReq(), res);

    expect(res._headers['Access-Control-Allow-Origin']).toBe('*');
    expect(res._headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
  });
});
