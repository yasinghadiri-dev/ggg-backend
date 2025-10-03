const { runMigrations } = require('../scripts/runTestMigrations');
process.env.DB_DIALECT = 'sqlite';
const dbFile = runMigrations();
process.env.DB_STORAGE = dbFile;
const { sendToToken } = require('../src/services/notificationService');
const logger = require('../src/config/logger');

describe('Notification service fallback', () => {
  test('sendToToken logs fallback when admin not configured and no token', async () => {
    // spy on logger methods
    const infoSpy = jest.spyOn(logger, 'info').mockImplementation(() => {});
    const warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});

    // Call with no token -> should warn and not throw
    await expect(sendToToken(null, { test: 'payload' })).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith('No FCM token provided, skipping notification');

    // Call with token but admin not configured -> should log info fallback and not throw
    infoSpy.mockClear();
    await expect(sendToToken('fake-token', { a: 1 })).resolves.toBeUndefined();
    // Should have logged the fallback info
    expect(infoSpy).toHaveBeenCalled();

    infoSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
