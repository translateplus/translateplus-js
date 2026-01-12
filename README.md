# TranslatePlus JavaScript/TypeScript Client

[![npm version](https://badge.fury.io/js/translateplus-js.svg)](https://badge.fury.io/js/translateplus-js)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-14+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official JavaScript/TypeScript client library for [Translation API](https://translateplus.io) - Professional translation service for text, HTML, emails, subtitles, and i18n files in 100+ languages.

## Features

- ✅ **TypeScript Support** - Full type definitions included
- ✅ **All Endpoints Supported** - Text, batch, HTML, email, subtitles, and i18n translation
- ✅ **Concurrent Requests** - Built-in support for parallel translations
- ✅ **Error Handling** - Comprehensive exception handling with detailed error messages
- ✅ **Production Ready** - Retry logic, rate limiting, and connection pooling
- ✅ **100+ Languages** - Support for all languages available in TranslatePlus
- ✅ **ESM & CommonJS** - Works with both import and require

## Installation

```bash
npm install translateplus-js
```

or with yarn:

```bash
yarn add translateplus-js
```

or with pnpm:

```bash
pnpm add translateplus-js
```

## Quick Start

### TypeScript/ES Modules

```typescript
import { TranslatePlusClient } from 'translateplus-js';

// Initialize client
const client = new TranslatePlusClient({
  apiKey: 'your-api-key'
});

// Translate a single text
const result = await client.translate({
  text: 'Hello, world!',
  source: 'en',
  target: 'fr'
});
console.log(result.translations.translation);
// Output: "Bonjour le monde !"

// Translate multiple texts
const texts = ['Hello', 'Goodbye', 'Thank you'];
const batchResult = await client.translateBatch({
  texts,
  source: 'en',
  target: 'fr'
});
batchResult.translations.forEach(t => console.log(t.translation));

// Translate HTML
const html = '<p>Hello <b>world</b></p>';
const htmlResult = await client.translateHTML({
  html,
  source: 'en',
  target: 'fr'
});
console.log(htmlResult.html);
// Output: "<p>Bonjour <b>monde</b></p>"
```

### CommonJS

```javascript
const { TranslatePlusClient } = require('translateplus-js');

const client = new TranslatePlusClient({
  apiKey: 'your-api-key'
});

client.translate({
  text: 'Hello',
  source: 'en',
  target: 'fr'
}).then(result => {
  console.log(result.translations.translation);
});
```

## Documentation

### Client Options

```typescript
const client = new TranslatePlusClient({
  apiKey: 'your-api-key',           // Required: Your TranslatePlus API key
  baseUrl: 'https://api.translateplus.io', // Optional: API base URL
  timeout: 30000,                    // Optional: Request timeout in ms (default: 30000)
  maxRetries: 3,                     // Optional: Maximum retries (default: 3)
  maxConcurrent: 5,                  // Optional: Max concurrent requests (default: 5)
});
```

### Text Translation

#### Single Translation

```typescript
const result = await client.translate({
  text: 'My client speaks only French. Will you translate for me?',
  source: 'en',  // or 'auto' for auto-detection
  target: 'fr'
});

console.log(result.translations.translation);
console.log(result.translations.source);  // Detected source language
console.log(result.translations.target);  // Target language
```

#### Batch Translation

```typescript
const texts = [
  'Hello, how are you?',
  'What is your name?',
  'Thank you very much!'
];

const result = await client.translateBatch({
  texts,
  source: 'en',
  target: 'fr'
});

console.log(`Total: ${result.total}`);
console.log(`Successful: ${result.successful}`);
console.log(`Failed: ${result.failed}`);

result.translations.forEach(translation => {
  if (translation.success) {
    console.log(`${translation.text} -> ${translation.translation}`);
  } else {
    console.log(`Error: ${translation.error}`);
  }
});
```

#### Concurrent Translation

```typescript
const texts = ['Hello', 'Goodbye', 'Thank you', 'Please', 'Sorry'];

// Translate all texts concurrently
const results = await client.translateConcurrent(texts, 'en', 'fr');

results.forEach((result, index) => {
  if ('error' in result) {
    console.log(`Error translating "${texts[index]}": ${result.error}`);
  } else {
    console.log(result.translations.translation);
  }
});
```

### HTML Translation

```typescript
const htmlContent = `
<html>
  <body>
    <h1>Welcome</h1>
    <p>This is a <strong>test</strong> paragraph.</p>
  </body>
</html>
`;

const result = await client.translateHTML({
  html: htmlContent,
  source: 'en',
  target: 'fr'
});

console.log(result.html);
// HTML structure is preserved, only text content is translated
```

### Email Translation

```typescript
const result = await client.translateEmail({
  subject: 'Welcome to our service',
  email_body: '<p>Thank you for signing up!</p><p>We\'re excited to have you.</p>',
  source: 'en',
  target: 'fr'
});

console.log(result.subject);    // Translated subject
console.log(result.html_body);  // Translated HTML body
```

### Subtitle Translation

```typescript
const srtContent = `1
00:00:01,000 --> 00:00:02,000
Hello world

2
00:00:03,000 --> 00:00:04,000
How are you?
`;

const result = await client.translateSubtitles({
  content: srtContent,
  format: 'srt',  // or 'vtt'
  source: 'en',
  target: 'fr'
});

console.log(result.content);
// Timestamps are preserved, only text is translated
```

### Language Detection

```typescript
const result = await client.detectLanguage('Bonjour le monde');
console.log(result.language_detection.language);    // 'fr'
console.log(result.language_detection.confidence);   // 0.99
```

### Supported Languages

```typescript
const languages = await client.getSupportedLanguages();
for (const [code, name] of Object.entries(languages.languages)) {
  console.log(`${code}: ${name}`);
}
```

### Account Information

```typescript
const summary = await client.getAccountSummary();
console.log(`Credits remaining: ${summary.credits_remaining}`);
console.log(`Current plan: ${summary.plan_name}`);
console.log(`Concurrency limit: ${summary.concurrency_limit}`);
```

### i18n Translation Jobs

#### Create Job

```typescript
const result = await client.createI18nJob({
  file_path: 'locales/en.json',
  target_languages: ['fr', 'es', 'de'],
  source_language: 'en',
  webhook_url: 'https://your-app.com/webhook'  // Optional
});

const jobId = result.job_id;
console.log(`Job created: ${jobId}`);
```

#### Check Job Status

```typescript
const status = await client.getI18nJobStatus(jobId);
console.log(`Status: ${status.status}`);  // pending, processing, completed, failed
console.log(`Progress: ${status.progress || 0}%`);
```

#### List Jobs

```typescript
const jobs = await client.listI18nJobs(1, 20);
for (const job of jobs.results) {
  console.log(`Job ${job.id}: ${job.status}`);
}
```

#### Download Translated File

```typescript
// Download French translation
const content = await client.downloadI18nFile(jobId, 'fr');
fs.writeFileSync('locales/fr.json', content);
```

#### Delete Job

```typescript
await client.deleteI18nJob(jobId);
```

## Error Handling

The library provides specific exception types for different error scenarios:

```typescript
import {
  TranslatePlusClient,
  TranslatePlusError,
  TranslatePlusAPIError,
  TranslatePlusAuthenticationError,
  TranslatePlusRateLimitError,
  TranslatePlusInsufficientCreditsError,
  TranslatePlusValidationError,
} from 'translateplus-js';

const client = new TranslatePlusClient({ apiKey: 'your-api-key' });

try {
  const result = await client.translate({ text: 'Hello', source: 'en', target: 'fr' });
} catch (error) {
  if (error instanceof TranslatePlusAuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof TranslatePlusInsufficientCreditsError) {
    console.error('Insufficient credits');
  } else if (error instanceof TranslatePlusRateLimitError) {
    console.error('Rate limit exceeded');
  } else if (error instanceof TranslatePlusAPIError) {
    console.error(`API error: ${error.message}`);
    console.error(`Status code: ${error.statusCode}`);
  } else if (error instanceof TranslatePlusError) {
    console.error(`Error: ${error.message}`);
  }
}
```

## Examples

### Translate a List of Documents

```typescript
const documents = [
  'Document 1 content...',
  'Document 2 content...',
  'Document 3 content...',
];

const results = await client.translateConcurrent(documents, 'en', 'fr');

results.forEach((result, index) => {
  if ('error' in result) {
    console.error(`Document ${index + 1} failed: ${result.error}`);
  } else {
    console.log(`Document ${index + 1}: ${result.translations.translation}`);
  }
});
```

### Translate HTML Email Template

```typescript
const emailTemplate = `
<html>
  <body>
    <h1>Welcome {{name}}!</h1>
    <p>Thank you for joining us.</p>
  </body>
</html>
`;

// Translate to multiple languages
const languages = ['fr', 'es', 'de'];
const translations: { [key: string]: string } = {};

for (const lang of languages) {
  const result = await client.translateHTML({
    html: emailTemplate,
    source: 'en',
    target: lang
  });
  translations[lang] = result.html;
}
```

## Requirements

- Node.js 14.0.0 or higher
- TypeScript 5.1+ (optional, for TypeScript projects)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Related Libraries

TranslatePlus provides official client libraries for multiple programming languages:

- **Python**: [translateplus-python](https://pypi.org/project/translateplus-python/) - Official PyPI package
- **PHP**: [translateplus-php](https://packagist.org/packages/translateplus/translateplus-php) - Official Composer package

All libraries provide the same comprehensive API support and features.

## Support

- **Documentation**: [https://docs.translateplus.io](https://docs.translateplus.io)
- **API Reference**: [https://docs.translateplus.io/reference/v2/translation/translate](https://docs.translateplus.io/reference/v2/translation/translate)
- **Issues**: [GitHub Issues](https://github.com/translateplus/translateplus-js/issues)
- **Email**: support@translateplus.io

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Changelog

### 2.0.0 (2024-01-12)

- Initial release
- Support for all TranslatePlus API endpoints
- Concurrent translation support
- Comprehensive error handling
- Full TypeScript support
- ESM and CommonJS support
