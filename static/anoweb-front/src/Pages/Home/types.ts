export type Profile = {
  id: number;
  name: string;
  email: string;
  github: string;
  linkedin: string;
  bio: string;
};

export type Education = {
  id: number;
  school: string;
  degree: string;
  start_date: string;
  end_date: string;
  link: string;
  image_url: string;
};

export type Experience = {
  id: number;
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  present: boolean;
  image_url: string;
  order_index: number;
};