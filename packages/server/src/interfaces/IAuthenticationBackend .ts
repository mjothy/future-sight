

export interface IAuthenticationBackend {
    initializeToken: () => Promise<void>;
    refreshToken: () => Promise<boolean>;
    getConfig: () => ConfigSchema;
}