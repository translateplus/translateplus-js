/**
 * TranslatePlus JavaScript/TypeScript Client Library
 *
 * Official client for TranslatePlus API - Professional translation service
 * for text, HTML, emails, subtitles, and i18n files in 100+ languages.
 */

export { TranslatePlusClient } from './client';
export {
  TranslatePlusError,
  TranslatePlusAPIError,
  TranslatePlusAuthenticationError,
  TranslatePlusRateLimitError,
  TranslatePlusInsufficientCreditsError,
  TranslatePlusValidationError,
} from './exceptions';

export type {
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

export { __version__ } from './version';
