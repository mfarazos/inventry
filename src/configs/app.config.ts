export type AppConfig = {
  apiPrefix: string;
  authenticatedEntryPath: string;
  unAuthenticatedEntryPath: string;
  tourPath: string;
  locale: string;
  enableMock: boolean;
};


const appConfig: AppConfig = {
       //apiPrefix: "https://apps.leadsmovinghomecompany.com",
       //apiPrefix: "http://localhost:3004",
       apiPrefix: "https://nooraniplastic.com",
      //  apiPrefix: import.meta.env.VITE_BASE_URL,
  authenticatedEntryPath: "/inventrylist",
  unAuthenticatedEntryPath: "/sign-in",
  tourPath: "/",
  locale: "en",
  enableMock: false,
};

export default appConfig;
