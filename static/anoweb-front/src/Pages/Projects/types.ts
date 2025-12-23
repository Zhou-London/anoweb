export type Project = {
  id: number;
  name: string;
  description: string;
  link: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
};

export type PostShort = {
  id: number;
  parent_id: number;
  parent_type?: string;
  name: string;
  created_at?: string;
  updated_at: string;
};

export type Post = {
  id: number;
  parent_id: number;
  parent_type?: string;
  name: string;
  content_md: string;
  created_at?: string;
  updated_at: string;
};