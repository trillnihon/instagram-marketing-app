/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INSTAGRAM_APP_ID: string
  readonly VITE_INSTAGRAM_APP_SECRET: string
  readonly VITE_INSTAGRAM_REDIRECT_URI: string
  readonly VITE_FACEBOOK_APP_ID: string
  readonly VITE_FACEBOOK_APP_SECRET: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_OPENAI_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 