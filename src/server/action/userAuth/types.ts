// User auth types for server actions

export type LoginInput = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  bio?: string;
  image?: string;
  role?: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken?: string;
};

export type TokenMeta = {
  accessTokenExpiresIn?: number;
  refreshTokenExpiresIn?: number;
};

export type LoginResult = {
  user: AuthUser;
  tokens?: TokenPair;
  meta?: TokenMeta;
};

export type ResetPassword = {
  token: string;
  password: string;
};
