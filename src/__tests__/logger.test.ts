import { logger } from '../utils/logger.js';

describe('logger', () => {
  const stderrSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

  afterEach(() => stderrSpy.mockClear());
  afterAll(() => stderrSpy.mockRestore());

  test('маскирует секреты в строках', () => {
    logger.error('connect failed', 'DB_PASSWORD=hunter2');
    const out = stderrSpy.mock.calls.flat().join(' ');
    expect(out).not.toContain('hunter2');
    expect(out).toContain('***');
  });

  test('маскирует секреты в stack Error', () => {
    logger.error(new Error('connect mysql://root:hunter2@localhost/db'));
    const out = stderrSpy.mock.calls.flat().join(' ');
    expect(out).not.toContain('hunter2');
  });

  test('не падает на не-JSON объектах', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(() => logger.info(circular)).not.toThrow();
  });

  test('warn пишет в stderr с маскировкой', () => {
    logger.warn('slow query', 'token=abc123&x=1');
    const out = stderrSpy.mock.calls.flat().join(' ');
    expect(out).not.toContain('abc123');
    expect(out).toContain('[instantcms-mcp]');
  });
});
