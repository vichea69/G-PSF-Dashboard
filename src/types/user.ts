export type UserType = {
  id: number;
  username: string;
  email: string;
  bio?: string;
  image?: string;
};

export type IUserResponse = {
  user: UserType & { token: string };
};

export type LoginDto = {
  email: string;
  password: string;
};
