/**
 * Main TranslatePlus API client.
 */

import {
  TranslateOptions,
  BatchTranslateOptions,
  TranslateHTMLOptions,
  TranslateEmailOptions,
  TranslateSubtitleOptions,
  I18nJobOptions,
  TranslateResponse,
  BatchTranslateResponse,
  TranslateHTMLResponse,
  TranslateEmailResponse,
  TranslateSubtitleResponse,
  DetectLanguageResponse,
  SupportedLanguagesResponse,
  AccountSummaryResponse,
  I18nJobResponse,
  I18nJobStatusResponse,
  I18nJobListResponse,
} from './types';
import {
  TranslatePlusAPIError,
  TranslatePlusAuthenticationError,
  TranslatePlusRateLimitError,
  TranslatePlusInsufficientCreditsError,
  TranslatePlusValidationError,
} from './exceptions';
import { __version__ } from './version';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

export interface ClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  maxConcurrent?: number;
}

/**
 * Official JavaScript/TypeScript client for TranslatePlus API.
 *
 * This client provides a simple and intuitive interface to all TranslatePlus
 * translation endpoints including text, batch, HTML, email, subtitles, and i18n translation.
 *
 * @example
 * ```typescript
 * import { TranslatePlusClient } from 'translateplus';
 *
 * const client = new TranslatePlusClient({ apiKey: 'your-api-key' });
 * const result = await client.translate({ text: 'Hello', source: 'en', target: 'fr' });
 * console.log(result.translations.translation); // 'Bonjour'
 * ```
 */
export class TranslatePlusClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private maxRetries: number;
  private maxConcurrent: number;
  private activeRequests: number = 0;

  constructor(options: ClientOptions) {
    if (!options.apiKey) {
      throw new TranslatePlusValidationError('API key is required');
    }

    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl || 'https://api.translateplus.io').replace(/\/$/, '');
    this.timeout = options.timeout || 30000;
    this.maxRetries = options.maxRetries || 3;
    this.maxConcurrent = options.maxConcurrent || 5;
  }

  /**
   * Make an HTTP request to the API.
   */
  private async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    files?: { [key: string]: string | Buffer },
    params?: { [key: string]: string | number }
  ): Promise<T> {
    const url = `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;

    // Wait for semaphore (concurrency control)
    while (this.activeRequests >= this.maxConcurrent) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    this.activeRequests++;

    try {
      // Prepare headers
      const headers: { [key: string]: string } = {
        'X-API-KEY': this.apiKey,
        'User-Agent': `translateplus-js/${__version__}`,
      };

      let body: any;
      let formData: any;

      if (files) {
        // Use FormData for file uploads
        formData = new FormData();
        if (data) {
          Object.keys(data).forEach((key) => {
            formData.append(key, String(data[key]));
          });
        }
        Object.keys(files).forEach((key) => {
          const filePath = files[key];
          if (typeof filePath === 'string') {
            formData.append(key, fs.createReadStream(filePath));
          } else {
            formData.append(key, filePath, { filename: 'file' });
          }
        });
        // Get headers from form-data
        if (formData.getHeaders) {
          Object.assign(headers, formData.getHeaders());
        }
        body = formData;
      } else {
        headers['Content-Type'] = 'application/json';
        body = data ? JSON.stringify(data) : undefined;
      }

      // Add query parameters
      let queryString = '';
      if (params) {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          queryParams.append(key, String(params[key]));
        });
        queryString = '?' + queryParams.toString();
      }

      // Retry logic
      let lastError: Error | null = null;
      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        try {
          // Create timeout controller
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.timeout);

          try {
            const response = await fetch(`${url}${queryString}`, {
              method,
              headers: headers as any,
              body: formData || body,
              signal: controller.signal as any,
            });

            clearTimeout(timeoutId);

            // Handle rate limiting with exponential backoff
            if (response.status === 429) {
              const retryAfter = parseInt(response.headers.get('Retry-After') || '2', 10);
              const delay = Math.min(retryAfter * 1000, Math.pow(2, attempt) * 1000);
              if (attempt < this.maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, delay));
                continue;
              }
              const errorData = await response.json().catch(() => ({}));
              throw new TranslatePlusRateLimitError(
                'Rate limit exceeded. Please try again later.',
                response.status,
                errorData
              );
            }

            // Handle other errors
            if (response.status >= 400) {
              const errorData = await response.json().catch(() => ({}));
              const errorMessage = errorData.detail || `API error: ${response.status}`;

              if (response.status === 401 || response.status === 403) {
                throw new TranslatePlusAuthenticationError(
                  errorMessage,
                  response.status,
                  errorData
                );
              } else if (response.status === 402) {
                throw new TranslatePlusInsufficientCreditsError(
                  errorMessage,
                  response.status,
                  errorData
                );
              } else if (response.status === 429) {
                throw new TranslatePlusRateLimitError(
                  errorMessage,
                  response.status,
                  errorData
                );
              } else {
                throw new TranslatePlusAPIError(errorMessage, response.status, errorData);
              }
            }

            return await response.json();
          } catch (fetchError: any) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
              throw new TranslatePlusAPIError(`Request timeout after ${this.timeout}ms`);
            }
            const error = fetchError;
            if (
              error instanceof TranslatePlusAuthenticationError ||
              error instanceof TranslatePlusInsufficientCreditsError
            ) {
              // Don't retry authentication or credit errors
              throw error;
            }

            lastError = error as Error;
            if (attempt < this.maxRetries) {
              // Exponential backoff
              await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
              continue;
            }
          }
        } catch (error) {
          if (
            error instanceof TranslatePlusAuthenticationError ||
            error instanceof TranslatePlusInsufficientCreditsError
          ) {
            // Don't retry authentication or credit errors
            throw error;
          }
          lastError = error as Error;
          if (attempt < this.maxRetries) {
            // Exponential backoff
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            continue;
          }
        }
      }

      // If we get here, all retries failed
      throw new TranslatePlusAPIError(
        `Request failed after ${this.maxRetries} retries: ${lastError?.message || 'Unknown error'}`
      );
    } finally {
      this.activeRequests--;
    }
  }

  /**
   * Translate a single text.
   *
   * @param options - Translation options
   * @returns Translation result
   *
   * @example
   * ```typescript
   * const result = await client.translate({
   *   text: 'Hello, world!',
   *   source: 'en',
   *   target: 'fr'
   * });
   * console.log(result.translations.translation); // 'Bonjour le monde !'
   * ```
   */
  async translate(options: TranslateOptions): Promise<TranslateResponse> {
    return this.makeRequest<TranslateResponse>('POST', '/v2/translate', {
      text: options.text,
      source: options.source || 'auto',
      target: options.target,
    });
  }

  /**
   * Translate multiple texts in a single request.
   *
   * @param options - Batch translation options
   * @returns Batch translation result
   *
   * @example
   * ```typescript
   * const result = await client.translateBatch({
   *   texts: ['Hello', 'Goodbye', 'Thank you'],
   *   source: 'en',
   *   target: 'fr'
   * });
   * result.translations.forEach(t => console.log(t.translation));
   * ```
   */
  async translateBatch(options: BatchTranslateOptions): Promise<BatchTranslateResponse> {
    if (!options.texts || options.texts.length === 0) {
      throw new TranslatePlusValidationError('Texts array cannot be empty');
    }
    if (options.texts.length > 100) {
      throw new TranslatePlusValidationError('Maximum 100 texts allowed per batch request');
    }

    return this.makeRequest<BatchTranslateResponse>('POST', '/v2/translate/batch', {
      texts: options.texts,
      source: options.source || 'auto',
      target: options.target,
    });
  }

  /**
   * Translate HTML content while preserving all tags and structure.
   *
   * @param options - HTML translation options
   * @returns Translated HTML content
   *
   * @example
   * ```typescript
   * const result = await client.translateHTML({
   *   html: '<p>Hello <b>world</b></p>',
   *   source: 'en',
   *   target: 'fr'
   * });
   * console.log(result.html); // '<p>Bonjour <b>monde</b></p>'
   * ```
   */
  async translateHTML(options: TranslateHTMLOptions): Promise<TranslateHTMLResponse> {
    return this.makeRequest<TranslateHTMLResponse>('POST', '/v2/translate/html', {
      html: options.html,
      source: options.source || 'auto',
      target: options.target,
    });
  }

  /**
   * Translate email subject and HTML body.
   *
   * @param options - Email translation options
   * @returns Translated email
   *
   * @example
   * ```typescript
   * const result = await client.translateEmail({
   *   subject: 'Welcome',
   *   email_body: '<p>Thank you for signing up!</p>',
   *   source: 'en',
   *   target: 'fr'
   * });
   * console.log(result.subject); // 'Bienvenue'
   * ```
   */
  async translateEmail(options: TranslateEmailOptions): Promise<TranslateEmailResponse> {
    return this.makeRequest<TranslateEmailResponse>('POST', '/v2/translate/email', {
      subject: options.subject,
      email_body: options.email_body,
      source: options.source || 'auto',
      target: options.target,
    });
  }

  /**
   * Translate subtitle files (SRT or VTT format).
   *
   * @param options - Subtitle translation options
   * @returns Translated subtitle content
   *
   * @example
   * ```typescript
   * const result = await client.translateSubtitles({
   *   content: '1\n00:00:01,000 --> 00:00:02,000\nHello world\n',
   *   format: 'srt',
   *   source: 'en',
   *   target: 'fr'
   * });
   * ```
   */
  async translateSubtitles(options: TranslateSubtitleOptions): Promise<TranslateSubtitleResponse> {
    if (options.format !== 'srt' && options.format !== 'vtt') {
      throw new TranslatePlusValidationError("Format must be 'srt' or 'vtt'");
    }

    return this.makeRequest<TranslateSubtitleResponse>('POST', '/v2/translate/subtitles', {
      content: options.content,
      format: options.format,
      source: options.source || 'auto',
      target: options.target,
    });
  }

  /**
   * Detect the language of a text.
   *
   * @param text - Text to detect language from
   * @returns Language detection result
   *
   * @example
   * ```typescript
   * const result = await client.detectLanguage('Bonjour le monde');
   * console.log(result.language_detection.language); // 'fr'
   * ```
   */
  async detectLanguage(text: string): Promise<DetectLanguageResponse> {
    return this.makeRequest<DetectLanguageResponse>('POST', '/v2/language/detect', {
      text,
    });
  }

  /**
   * Get list of supported languages.
   *
   * @returns Supported languages
   *
   * @example
   * ```typescript
   * const languages = await client.getSupportedLanguages();
   * console.log(languages.languages.en); // 'English'
   * ```
   */
  async getSupportedLanguages(): Promise<SupportedLanguagesResponse> {
    return this.makeRequest<SupportedLanguagesResponse>('GET', '/v2/language/supported');
  }

  /**
   * Get account summary including credits, plan, and usage.
   *
   * @returns Account summary
   *
   * @example
   * ```typescript
   * const summary = await client.getAccountSummary();
   * console.log(`Credits remaining: ${summary.credits_remaining}`);
   * ```
   */
  async getAccountSummary(): Promise<AccountSummaryResponse> {
    return this.makeRequest<AccountSummaryResponse>('GET', '/v2/user/account');
  }

  /**
   * Create an i18n translation job.
   *
   * @param options - i18n job options
   * @returns Job creation result
   *
   * @example
   * ```typescript
   * const result = await client.createI18nJob({
   *   file_path: 'locales/en.json',
   *   target_languages: ['fr', 'es'],
   *   source_language: 'en'
   * });
   * console.log(`Job ID: ${result.job_id}`);
   * ```
   */
  async createI18nJob(options: I18nJobOptions): Promise<I18nJobResponse> {
    const filePath = path.resolve(options.file_path);
    if (!fs.existsSync(filePath)) {
      throw new TranslatePlusValidationError(`File not found: ${filePath}`);
    }

    const formData: { [key: string]: any } = {
      source_language: options.source_language || 'auto',
      target_languages: options.target_languages.join(','),
    };
    if (options.webhook_url) {
      formData.webhook_url = options.webhook_url;
    }

    return this.makeRequest<I18nJobResponse>(
      'POST',
      '/v2/i18n/jobs',
      formData,
      { file: filePath }
    );
  }

  /**
   * Get the status of an i18n translation job.
   *
   * @param jobId - Job ID
   * @returns Job status information
   */
  async getI18nJobStatus(jobId: string): Promise<I18nJobStatusResponse> {
    return this.makeRequest<I18nJobStatusResponse>('GET', `/v2/i18n/jobs/${jobId}`);
  }

  /**
   * List all i18n translation jobs.
   *
   * @param page - Page number (default: 1)
   * @param pageSize - Number of jobs per page (default: 20)
   * @returns List of jobs with pagination information
   */
  async listI18nJobs(page: number = 1, pageSize: number = 20): Promise<I18nJobListResponse> {
    return this.makeRequest<I18nJobListResponse>('GET', '/v2/i18n/jobs', undefined, undefined, {
      page: String(page),
      page_size: String(pageSize),
    });
  }

  /**
   * Download a translated i18n file.
   *
   * @param jobId - Job ID
   * @param languageCode - Target language code
   * @returns File content as Buffer
   */
  async downloadI18nFile(jobId: string, languageCode: string): Promise<Buffer> {
    const url = `${this.baseUrl}/v2/i18n/jobs/${jobId}/download/${languageCode}`;
    
    const response = await fetch(url, {
      headers: {
        'X-API-KEY': this.apiKey,
        'User-Agent': `translateplus-js/${__version__}`,
      },
    } as any);

    if (response.status >= 400) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `API error: ${response.status}`;
      throw new TranslatePlusAPIError(errorMessage, response.status, errorData);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Delete an i18n translation job.
   *
   * @param jobId - Job ID to delete
   */
  async deleteI18nJob(jobId: string): Promise<void> {
    await this.makeRequest('DELETE', `/v2/i18n/jobs/${jobId}`);
  }

  /**
   * Translate multiple texts concurrently using parallel requests.
   *
   * @param texts - Array of texts to translate
   * @param source - Source language code
   * @param target - Target language code
   * @returns Array of translation results in the same order as input texts
   *
   * @example
   * ```typescript
   * const results = await client.translateConcurrent(
   *   ['Hello', 'Goodbye', 'Thank you'],
   *   'en',
   *   'fr'
   * );
   * results.forEach(r => console.log(r.translations.translation));
   * ```
   */
  async translateConcurrent(
    texts: string[],
    source: string = 'auto',
    target: string
  ): Promise<TranslateResponse[]> {
    const promises = texts.map((text) =>
      this.translate({ text, source, target }).catch((error) => {
        return { error: error.message } as any;
      })
    );

    return Promise.all(promises);
  }
}
