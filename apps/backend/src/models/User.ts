export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  password: string; // hashed
  bio?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPublic {
  id: string;
  username: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
}
