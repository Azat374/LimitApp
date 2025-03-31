/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: "https://server-1-cxbf.onrender.com";
  readonly VITE_GITHUB_CLIENTID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}