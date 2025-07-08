export interface User {
  id: string;
  username: string;
  password: string;
}

export interface AuthOptions {
  jwtSecret: string;
  tokenExpiration?: string;
  findUserByUsername: (username: string) => Promise<User | null>;
  validatePassword: (user: User, password: string) => Promise<boolean>;
}
