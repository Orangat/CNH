export interface LeaderRow {
  id: string;
  sort_order: number;
  name_en: string;
  name_uk: string;
  title_en: string;
  title_uk: string;
  emails: string[];
  photo_path: string | null;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SiteTextRow {
  id: string;
  key: string;
  group: string;
  value_en: string;
  value_uk: string;
  description: string | null;
}

export interface ContactInfoRow {
  id: string;
  address: string;
  phone: string;
  email: string;
  service_time_english: string;
  service_time_ukrainian: string;
  map_url: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
}

export interface AdminUserRow {
  id: string;
  email: string;
  role: 'admin' | 'editor';
}
