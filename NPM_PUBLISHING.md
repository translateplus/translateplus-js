# Publishing to npm

This guide explains how to publish the `translateplus` package to npm.

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com) if you don't have one
2. **Access Token**: Generate an npm access token

## Step 1: Create npm Access Token

1. Go to [npmjs.com/settings](https://www.npmjs.com/settings)
2. Click "Access Tokens" in the left sidebar
3. Click "Generate New Token"
4. Choose token type:
   - **Automation** (recommended for CI/CD) - Never expires, read and publish
   - **Publish** - For manual publishing
5. Copy the token (starts with `npm_`)

## Step 2: Configure GitHub Secrets

For automated publishing via GitHub Actions:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add secret:
   - **Name**: `NPM_TOKEN`
   - **Value**: Your npm access token (starts with `npm_`)

## Step 3: Manual Publishing

If you want to publish manually:

### Login to npm

```bash
npm login
```

Enter your npm credentials when prompted.

### Build the Package

```bash
npm run build
```

### Test the Build

```bash
npm pack
```

This creates a tarball you can inspect.

### Publish

```bash
npm publish
```

For scoped packages or first-time publishing:

```bash
npm publish --access public
```

## Step 4: Automated Publishing with GitHub Actions

The repository includes GitHub Actions workflows for automated publishing.

### Workflow: `publish.yml` (Token-based)

Uses `NPM_TOKEN` secret for authentication.

**Triggers:**
- When a GitHub release is published
- Manual trigger via `workflow_dispatch`

**Setup:**
1. Add `NPM_TOKEN` secret to GitHub repository
2. Create a GitHub release
3. The workflow will automatically publish to npm

### Workflow: `publish-oidc.yml` (OIDC-based)

Uses OpenID Connect for authentication (more secure, no token needed).

**Setup:**
1. Configure npm to trust GitHub Actions (one-time setup)
2. Add `NPM_TOKEN` secret (still needed for some operations)
3. Create a GitHub release
4. The workflow will automatically publish to npm

## Version Management

Always update the version before publishing:

1. **Update version in `package.json`:**
   ```json
   {
     "version": "2.0.1"
   }
   ```

2. **Update version in `src/version.ts`:**
   ```typescript
   export const __version__ = '2.0.1';
   ```

3. **Follow Semantic Versioning:**
   - **MAJOR** (2.0.0): Breaking changes
   - **MINOR** (2.1.0): New features, backward compatible
   - **PATCH** (2.0.1): Bug fixes, backward compatible

## Publishing Workflow

### Option 1: Using GitHub Releases (Recommended)

1. Update version in `package.json` and `src/version.ts`
2. Commit and push changes:
   ```bash
   git add package.json src/version.ts
   git commit -m "Bump version to 2.0.1"
   git push
   ```
3. Create a GitHub release:
   - Go to GitHub → Releases → Create a new release
   - Tag: `v2.0.1`
   - Title: `v2.0.1`
   - Description: Release notes
   - Click "Publish release"
4. GitHub Actions will automatically:
   - Build the package
   - Run tests
   - Publish to npm

### Option 2: Manual Publishing

```bash
# 1. Update version
# Edit package.json and src/version.ts

# 2. Build
npm run build

# 3. Test
npm test

# 4. Publish
npm publish
```

## Verification

After publishing, verify the package:

```bash
# Check package on npm
npm view translateplus

# Install and test
npm install translateplus
node -e "const { TranslatePlusClient } = require('translateplus'); console.log('OK')"
```

## Troubleshooting

### Error: "You must verify your email"

**Solution**: Verify your email address on npmjs.com

### Error: "Package name already exists"

**Solution**: The package name is already taken. You need to:
- Use a different package name
- Or get access to the existing package

### Error: "403 Forbidden"

**Solution**: 
- Check that your npm token has publish permissions
- Verify you're logged in: `npm whoami`
- Check token hasn't expired

### Error: "Invalid token"

**Solution**:
- Generate a new npm access token
- Update the `NPM_TOKEN` secret in GitHub
- Or re-login: `npm login`

## Best Practices

1. **Always test before publishing:**
   ```bash
   npm pack
   npm install ./translateplus-2.0.1.tgz
   ```

2. **Use semantic versioning:**
   - Follow MAJOR.MINOR.PATCH format
   - Update CHANGELOG.md with changes

3. **Tag releases in Git:**
   ```bash
   git tag v2.0.1
   git push origin v2.0.1
   ```

4. **Use GitHub Releases:**
   - Creates tags automatically
   - Triggers automated publishing
   - Provides release notes

5. **Test in different Node versions:**
   - The CI workflow tests on Node 16, 18, and 20

## Package Name

The package is published as `translateplus` on npm.

**Install:**
```bash
npm install translateplus
```

**Import:**
```typescript
import { TranslatePlusClient } from 'translateplus';
```

## Security

- **Never commit tokens** to the repository
- Use GitHub Secrets for CI/CD
- Use OIDC when possible (more secure)
- Rotate tokens regularly
- Use automation tokens for CI/CD (not personal tokens)
