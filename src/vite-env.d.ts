/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** GA4 measurement ID, e.g. G-XXXXXXXXXX. Analytics stays off without it. */
  readonly VITE_GA_MEASUREMENT_ID?: string;
}
