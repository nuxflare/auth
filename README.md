# Nuxflare Auth

A modern, lightweight, self-hosted auth server built with [Cloudflare](https://cloudflare.com), [Nuxt](https://nuxt.com), and [OpenAuth.js](https://openauth.js.org/).

## What's This?

Nuxflare Auth lets you add authentication to your apps without the headache. It's a monorepo that bundles everything you need:

- A slick auth UI built with Nuxt 3 and [@nuxt/ui](https://ui.nuxt.com)
- Backend auth magic running on Cloudflare Workers
- A ready-to-use example so you can see how it all fits together

## Features

- 🔒 Complete authentication UI including:
  - Code-based login
  - Password-based login
  - Forgot password flow
  - User registration
- 🔑 OAuth2 authentication with GitHub and Google (easily add more providers)
- ✉️ Emails using Resend (or use any other provider)
- ⚡ Lightning-fast, powered by Cloudflare's edge network

## Project Layout

```
packages/
  ├── auth-frontend/   # auth UI components
  ├── emails/          # react email templates
  ├── example-client/  # example nuxt client
  └── functions/       # cloudflare workers
```

## Prerequisites

Before getting started, you'll need:

- pnpm
- A Cloudflare account
- OAuth credentials from Google and GitHub
- A [Resend](https://resend.com) API key for sending emails

## Getting Started

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/nuxflare/auth nuxflare-auth
   cd nuxflare-auth
   pnpm install
   ```

2. **Create and Configure API Token:**

   a. Create a Cloudflare API token with the required permissions using [this link](https://dash.cloudflare.com/profile/api-tokens?permissionGroupKeys=%5B%7B%22key%22:%22workers_r2%22,%22type%22:%22edit%22%7D,%7B%22key%22:%22workers_kv_storage%22,%22type%22:%22edit%22%7D,%7B%22key%22:%22workers_scripts%22,%22type%22:%22edit%22%7D,%7B%22key%22:%22memberships%22,%22type%22:%22read%22%7D,%7B%22key%22:%22user_details%22,%22type%22:%22read%22%7D%5D&name=Nuxflare%20Auth).\
   b. Set the `CLOUDFLARE_API_TOKEN` environment variable:

   ```bash
   export CLOUDFLARE_API_TOKEN=GahXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. Configure your secrets:

   ```bash
   # OAuth stuff
   pnpm sst secret set GoogleClientID your_client_id
   pnpm sst secret set GoogleClientSecret your_client_secret
   pnpm sst secret set GithubClientID your_client_id
   pnpm sst secret set GithubClientSecret your_client_secret

   # For emails
   pnpm sst secret set ResendApiKey your_resend_api_key
   ```

4. Configure your `fromEmail` in `sst.config.ts`:

   ```typescript
   async run() {
     const fromEmail = "hi@nuxflare.com";
     // ...
   }
   ```

5. Start local development:

   ```bash
   pnpm dev
   ```

6. Deploy to production:
   ```bash
   pnpm sst deploy --stage production
   ```

## Architecture

### Frontend (`packages/auth-frontend`)

Login, signup, sign in with code, and forgot password flows built with Nuxt and Nuxt UI.

### Backend (`packages/functions`)

The backend consists of two main components:

- `auth.ts`: Core authentication logic handler
- `emails.tsx`: Sending emails with Resend

Everything is stored in Cloudflare KV—sessions, users, etc. Plus, it all runs on the edge, so it's super fast.

## Example Implementation

Check out `packages/example-client` to see how to add auth to your own app.

## Support

Found a bug? Please [open an issue](https://github.com/nuxflare/auth/issues) on our GitHub repository.
