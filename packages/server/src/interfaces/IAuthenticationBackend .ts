

export interface IAuthenticationBackend {
    initializeToken: (username: string, password: string) => Promise<void>;
    queryToken: (username: string, password: string) => Promise<{access: string, refresh: string}>;
    refreshToken: () => Promise<boolean>;
    getConfig: () => ConfigSchema;
}
