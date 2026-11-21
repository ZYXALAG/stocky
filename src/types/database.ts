export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  user: any;
}
