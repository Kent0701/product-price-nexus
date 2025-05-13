
export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Added this view to allow querying auth users without direct access to auth schema
export interface AuthUsersView {
  id: string;
  email: string;
}
