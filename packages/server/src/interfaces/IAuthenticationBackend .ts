

export interface IAuthenticationBackend {
    initializeToken: (username: string, password: string, cb) => Promise<void>;
    refreshToken: () => Promise<boolean>;
    getConfig: () => ConfigSchema;
}