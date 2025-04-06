/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RESPONDENT_ENTRYPOINT_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
