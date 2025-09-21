export type Project = {
  id: number;
  name: string;
  description: string;
  link: string;
  image_url: string;
};

export type PostShort = {
  id: number;
  parent_id: number;
  name: string;
  updated_at: string;
};

export type Post = {
  id: number;
  name: string;
  content_md: string;
  updated_at: string;
};