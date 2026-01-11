/**
 * Basic usage examples for TranslatePlus JavaScript client.
 */

import { TranslatePlusClient } from '../src';

// Initialize client
const client = new TranslatePlusClient({
  apiKey: 'your-api-key-here',
});

async function main() {
  // Example 1: Translate a single text
  console.log('=== Example 1: Single Translation ===');
  const result = await client.translate({
    text: 'Hello, world!',
    source: 'en',
    target: 'fr',
  });
  console.log(`Original: Hello, world!`);
  console.log(`Translated: ${result.translations.translation}`);
  console.log();

  // Example 2: Batch translation
  console.log('=== Example 2: Batch Translation ===');
  const texts = ['Hello', 'Goodbye', 'Thank you'];
  const batchResult = await client.translateBatch({
    texts,
    source: 'en',
    target: 'fr',
  });
  batchResult.translations.forEach((translation) => {
    if (translation.success) {
      console.log(`${translation.text} -> ${translation.translation}`);
    }
  });
  console.log();

  // Example 3: HTML translation
  console.log('=== Example 3: HTML Translation ===');
  const html = '<p>Hello <b>world</b></p>';
  const htmlResult = await client.translateHTML({
    html,
    source: 'en',
    target: 'fr',
  });
  console.log(`Original: ${html}`);
  console.log(`Translated: ${htmlResult.html}`);
  console.log();

  // Example 4: Language detection
  console.log('=== Example 4: Language Detection ===');
  const detectResult = await client.detectLanguage('Bonjour le monde');
  console.log(`Detected language: ${detectResult.language_detection.language}`);
  console.log(`Confidence: ${detectResult.language_detection.confidence}`);
  console.log();

  // Example 5: Get supported languages
  console.log('=== Example 5: Supported Languages ===');
  const languages = await client.getSupportedLanguages();
  console.log(`Total languages: ${Object.keys(languages.languages).length}`);
  console.log('Sample languages:');
  Object.entries(languages.languages)
    .slice(0, 5)
    .forEach(([code, name]) => {
      console.log(`  ${code}: ${name}`);
    });
  console.log();

  // Example 6: Account summary
  console.log('=== Example 6: Account Summary ===');
  const summary = await client.getAccountSummary();
  console.log(`Credits remaining: ${summary.credits_remaining || 'N/A'}`);
  console.log(`Current plan: ${summary.plan_name || 'N/A'}`);
  console.log();
}

main().catch(console.error);
