/**
 * Type definitions for TranslatePlus API.
 */

export interface TranslateOptions {
  text: string;
  source?: string;
  target: string;
}

export interface BatchTranslateOptions {
  texts: string[];
  source?: string;
  target: string;
}

export interface TranslateHTMLOptions {
  html: string;
  source?: string;
  target: string;
}

export interface TranslateEmailOptions {
  subject: string;
  email_body: string;
  source?: string;
  target: string;
}

export interface TranslateSubtitleOptions {
  content: string;
  format: 'srt' | 'vtt';
  source?: string;
  target: string;
}

export interface I18nJobOptions {
  file_path: string;
  target_languages: string[];
  source_language?: string;
  webhook_url?: string;
}

export interface TranslateResponse {
  translations: {
    text: string;
    translation: string;
    source: string;
    target: string;
  };
  details?: Record<string, any>;
}

export interface BatchTranslateResponse {
  translations: Array<{
    text: string;
    translation: string;
    source: string;
    target: string;
    success: boolean;
    error?: string;
  }>;
  total: number;
  successful: number;
  failed: number;
}

export interface TranslateHTMLResponse {
  html: string;
}

export interface TranslateEmailResponse {
  subject: string;
  html_body: string;
}

export interface TranslateSubtitleResponse {
  format: string;
  content: string;
}

export interface DetectLanguageResponse {
  language_detection: {
    language: string;
    confidence: number;
  };
}

export interface SupportedLanguagesResponse {
  languages: Record<string, string>;
}

export interface AccountSummaryResponse {
  credits_remaining: number;
  total_credits: number;
  plan_name: string;
  concurrency_limit: number;
  [key: string]: any;
}

export interface I18nJobResponse {
  job_id: string;
  status: string;
  message?: string;
}

export interface I18nJobStatusResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  source_language: string;
  target_languages: string[];
  progress?: number;
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface I18nJobListResponse {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: I18nJobStatusResponse[];
}
