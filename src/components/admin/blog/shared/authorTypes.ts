export type AuthorProfile = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'contributor' | 'guest' | string;
  status: 'active' | 'inactive' | string;
  avatar: string;
  joinedAt: string;
  bio?: string;
};
