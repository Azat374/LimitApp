/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: "http://127.0.0.1:5000";
  readonly VITE_GITHUB_CLIENTID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}