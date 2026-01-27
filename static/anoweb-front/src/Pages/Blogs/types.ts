export type Blog = {
  id: number;
  title: string;
  content_md: string;
  image_url: string;
  views: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
};

export type BlogShort = {
  id: number;
  title: string;
  image_url: string;
  views: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
};

export type BlogWithLikeStatus = Blog & {
  has_liked: boolean;
};
