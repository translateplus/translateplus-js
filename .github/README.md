# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD.

## Workflows

### 1. `ci.yml` - Continuous Integration

Runs on every push and pull request:
- Tests on Node.js 16, 18, and 20
- Runs linter
- Builds the package
- Runs tests

### 2. `publish.yml` - Publish to npm

Publishes the package to npm when:
- A GitHub release is published
- Manually triggered via `workflow_dispatch`

**Setup Required:**
1. Add `NPM_TOKEN` secret to GitHub repository
2. Create a GitHub release to trigger publishing

### 3. `publish-oidc.yml` - Publish with OIDC (Alternative)

Same as `publish.yml` but uses OIDC for authentication (more secure).

## Setup Instructions

### Step 1: Create npm Access Token

1. Go to [npmjs.com/settings](https://www.npmjs.com/settings)
2. Click "Access Tokens" → "Generate New Token"
3. Choose "Automation" token type
4. Copy the token (starts with `npm_`)

### Step 2: Add GitHub Secret

1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: Your npm token
6. Click **Add secret**

### Step 3: Publish

**Option A: Create a Release (Recommended)**
1. Update version in `package.json` and `src/version.ts`
2. Commit and push
3. Go to **Releases** → **Create a new release**
4. Tag: `v2.0.0` (match version)
5. Title: `v2.0.0`
6. Click **Publish release**
7. GitHub Actions will automatically publish to npm

**Option B: Manual Trigger**
1. Go to **Actions** tab
2. Select **Publish to npm** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow**

## Verification

After publishing, verify:
```bash
npm view translateplus-js
npm install translateplus-js
```

## Troubleshooting

- **403 Forbidden**: Check `NPM_TOKEN` secret is set correctly
- **Package already exists**: Version already published, increment version
- **Tests failing**: Check test setup, or set `continue-on-error: true` temporarily
