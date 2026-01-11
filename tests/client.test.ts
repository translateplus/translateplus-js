/**
 * Tests for TranslatePlusClient.
 */

import {
  TranslatePlusAuthenticationError,
  TranslatePlusRateLimitError,
  TranslatePlusInsufficientCreditsError,
  TranslatePlusValidationError,
} from '../src/exceptions';

// Import client - mocks are set up in setup.ts
import { TranslatePlusClient } from '../src/client';
import fetch from 'node-fetch';

const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('TranslatePlusClient', () => {
  let client: TranslatePlusClient;

  beforeEach(() => {
    client = new TranslatePlusClient({
      apiKey: 'test-api-key',
    });
    mockedFetch.mockClear();
  });

  describe('Initialization', () => {
    it('should initialize with API key', () => {
      expect(client).toBeInstanceOf(TranslatePlusClient);
    });

    it('should throw error if API key is missing', () => {
      expect(() => {
        new TranslatePlusClient({ apiKey: '' });
      }).toThrow(TranslatePlusValidationError);
    });

    it('should initialize with custom options', () => {
      const customClient = new TranslatePlusClient({
        apiKey: 'test-key',
        baseUrl: 'https://custom-api.com',
        timeout: 60000,
        maxRetries: 5,
        maxConcurrent: 10,
      });
      expect(customClient).toBeInstanceOf(TranslatePlusClient);
    });
  });

  describe('translate', () => {
    it('should translate text successfully', async () => {
      const mockResponse = {
        translations: {
          text: 'Hello',
          translation: 'Bonjour',
          source: 'en',
          target: 'fr',
        },
      };

      mockedFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => mockResponse,
        headers: {
          get: () => null,
        },
      } as any);

      const result = await client.translate({
        text: 'Hello',
        source: 'en',
        target: 'fr',
      });

      expect(result.translations.translation).toBe('Bonjour');
    });

    it('should handle authentication error', async () => {
      mockedFetch.mockResolvedValueOnce({
        status: 403,
        json: async () => ({ detail: 'Invalid API key' }),
        headers: {
          get: () => null,
        },
      } as any);

      await expect(
        client.translate({ text: 'Hello', source: 'en', target: 'fr' })
      ).rejects.toThrow(TranslatePlusAuthenticationError);
    });

    it('should handle rate limit error', async () => {
      mockedFetch.mockResolvedValueOnce({
        status: 429,
        headers: {
          get: (key: string) => (key === 'Retry-After' ? '60' : null),
        },
        json: async () => ({ detail: 'Rate limit exceeded' }),
      } as any);

      await expect(
        client.translate({ text: 'Hello', source: 'en', target: 'fr' })
      ).rejects.toThrow(TranslatePlusRateLimitError);
    });

    it('should handle insufficient credits error', async () => {
      mockedFetch.mockResolvedValueOnce({
        status: 402,
        json: async () => ({ detail: 'Insufficient credits' }),
        headers: {
          get: () => null,
        },
      } as any);

      await expect(
        client.translate({ text: 'Hello', source: 'en', target: 'fr' })
      ).rejects.toThrow(TranslatePlusInsufficientCreditsError);
    });
  });

  describe('translateBatch', () => {
    it('should validate empty texts array', async () => {
      await expect(
        client.translateBatch({ texts: [], source: 'en', target: 'fr' })
      ).rejects.toThrow(TranslatePlusValidationError);
    });

    it('should validate too many texts', async () => {
      const texts = Array(101).fill('text');
      await expect(
        client.translateBatch({ texts, source: 'en', target: 'fr' })
      ).rejects.toThrow(TranslatePlusValidationError);
    });
  });

  describe('translateSubtitles', () => {
    it('should validate format', async () => {
      await expect(
        client.translateSubtitles({
          content: 'content',
          format: 'invalid' as any,
          source: 'en',
          target: 'fr',
        })
      ).rejects.toThrow(TranslatePlusValidationError);
    });
  });
});
