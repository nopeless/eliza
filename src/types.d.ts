declare global {
  namespace NodeJS {
    interface ProcessEnv {
      RAPID_API_KEY?: string;
      DISCORD_TOKEN?: string;
      OwnerID?: string;
    }
  }
}

export {};
