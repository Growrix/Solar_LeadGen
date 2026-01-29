# WordPress (JWT) Integration — SolarMatch

## What this adds

- Server-side WordPress client (JWT token + authenticated fetch)
- API endpoint to fetch posts without exposing credentials:
  - `GET /api/wp/posts`

## Required WordPress setup

- Plugin: **JWT Authentication for WP-API**
- Ensure `JWT_AUTH_SECRET_KEY` is added to `wp-config.php`
- Ensure the plugin health check shows green for secret key + endpoints

## Required Next.js env vars

Add to your local `.env` (or hosting provider env vars):

- `WP_BASE_URL` (example: `https://communicatorsbd.com`)
- `WP_JWT_USERNAME`
- `WP_JWT_PASSWORD`

Optional:
- `WP_JWT_TOKEN_CACHE_SECONDS` (default 50 minutes)

## How to test

1) Start the app

- `npm run dev`

2) Call the API route

- `GET http://localhost:3000/api/wp/posts`

Optional query params:
- `page` (default 1)
- `per_page` (default 10)
- `search`
- `slug`
- `status` (default `publish`)

