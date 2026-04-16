export type VBookShort = {
  id: number;
  slug: string;
  title: string;
  description: string;
  cover_image_url: string;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type ChapterProgress = {
  chapter_id: string;
  completed_count: number;
  completed_sections: string[];
  last_completed_at?: string;
};

export type LastReadInfo = {
  chapter_id: string;
  section_id: string;
  updated_at: string;
};

export type VBookWithProgress = VBookShort & {
  progress: ChapterProgress[];
  last_read: LastReadInfo | null;
};

export type ChapterMeta = {
  id: string;
  label: string;
  title: string;
  shortLabel?: string;
};

export type SectionMeta = {
  id: string;
  label: string;
  emoji: string;
};
