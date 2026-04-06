/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** openrouteservice.org — driving directions & geocoding */
  readonly VITE_OPENROUTESERVICE_API_KEY?: string;
  /** Google AI Studio / Cloud — Gemini API for route tips */
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_GEMINI_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
