export interface User {
  id: number;
  name: string;
}

export interface UserStore {
  users: User[];
  fetchUsers: () => Promise<void>;
}
