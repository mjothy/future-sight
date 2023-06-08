

export interface IAuthenticationBackend {
    getToken: () => string;
    getRefreshToken: () => void;
    getConfig: () => ConfigSchema;
}