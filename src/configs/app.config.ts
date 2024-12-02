export type AppConfig = {
  apiPrefix: string;
  authenticatedEntryPath: string;
  unAuthenticatedEntryPath: string;
  tourPath: string;
  locale: string;
  enableMock: boolean;
};

const appConfig: AppConfig = {
  apiPrefix: import.meta.env.VITE_BASE_URL,
  authenticatedEntryPath: "/dashboard",
  unAuthenticatedEntryPath: "/sign-in",
  tourPath: "/",
  locale: "en",
  enableMock: false,
};

export default appConfig;