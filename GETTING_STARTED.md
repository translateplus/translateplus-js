# Getting Started with TranslatePlus JavaScript/TypeScript Library

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Library

```bash
npm run build
```

This will create:
- `dist/index.js` - CommonJS build
- `dist/index.esm.js` - ES Module build
- `dist/index.d.ts` - TypeScript definitions

### 3. Run Tests

```bash
npm test
```

### 4. Development Mode

```bash
npm run dev
```

This watches for changes and rebuilds automatically.

## Project Structure

```
translateplus-js/
├── src/
│   ├── index.ts          # Main exports
│   ├── client.ts         # Main client class
│   ├── exceptions.ts     # Custom exceptions
│   ├── types.ts          # TypeScript type definitions
│   └── version.ts        # Version number
├── examples/
│   └── basic-usage.ts   # Usage examples
├── tests/
│   └── client.test.ts    # Unit tests
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
├── tsup.config.ts        # Build configuration
└── README.md             # Documentation
```

## Publishing to npm

### 1. Update Version

Update version in:
- `package.json`
- `src/version.ts`

### 2. Build

```bash
npm run build
```

### 3. Test Build

```bash
npm pack
```

This creates a tarball you can test locally.

### 4. Publish

```bash
npm publish
```

Make sure you're logged in:
```bash
npm login
```

## Features

- ✅ Full TypeScript support with type definitions
- ✅ ESM and CommonJS builds
- ✅ All TranslatePlus API endpoints
- ✅ Concurrent request support
- ✅ Comprehensive error handling
- ✅ Retry logic with exponential backoff
- ✅ Rate limit handling

## Usage Example

```typescript
import { TranslatePlusClient } from 'translateplus';

const client = new TranslatePlusClient({
  apiKey: 'your-api-key'
});

const result = await client.translate({
  text: 'Hello',
  source: 'en',
  target: 'fr'
});

console.log(result.translations.translation);
```
