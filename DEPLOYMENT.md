# Deployment

The frontend stays on Vercel and the Express API runs on Render. The Vercel API function forwards the existing `/api/*` requests to Render, so no frontend UI or API call sites need to change.

## Render

1. Create a Render Blueprint from this repository and select `render.yaml`.
2. Wait for the `nexuspolar-api` service to deploy, then check `https://<render-service>.onrender.com/api/health`.
3. Add optional provider secrets such as `GEMINI_API_KEY` and `WEATHER_API_KEY` in the Render service environment settings. Do not put secrets in Vercel or commit them.

## Vercel

1. Import this repository as a Vercel project and set **Root Directory** to `client`.
2. Use the Vite defaults: build command `npm run build` and output directory `dist`.
3. Add the environment variable `VITE_API_URL` with the Render service origin, for example `https://nexuspolar-api.onrender.com` (no trailing slash and no `/api`).
4. Redeploy. Frontend API requests use this origin directly. If it is unset, the Vercel function at `client/api/[...path].js` remains available as a same-origin proxy fallback.

The API currently stores application data in memory. Changes can be lost when the Render service restarts or redeploys; configure a persistent database before relying on it for production data.