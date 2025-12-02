/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_MYKEYS_API_URL?: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly VITE_APP_VERSION?: string
  // Add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

