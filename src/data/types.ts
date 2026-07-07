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

export interface SermonRow {
  id: string;
  title_en: string;
  title_uk: string;
  speaker: string;
  series: string;
  scripture: string;
  description_en: string;
  description_uk: string;
  youtube_id: string;
  preached_at: string | null;
  is_published: boolean;
  sort_order: number;
  thumbnail_url: string;
  custom_thumbnail_path: string | null;
  title_edited: boolean;
  auto_imported: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MinistryRow {
  id: string;
  slug: string;
  name_en: string;
  name_uk: string;
  description_en: string;
  description_uk: string;
  contact_email: string;
  meeting_info_en: string;
  meeting_info_uk: string;
  icon: string;
  sort_order: number;
  is_published: boolean;
  // Media + Tier B fields (migration 0005)
  photo_path: string | null;
  gallery: string[];
  audience_en: string;
  audience_uk: string;
  language: 'en' | 'uk' | 'bilingual';
  long_description_en: string;
  long_description_uk: string;
  leader_name: string;
  leader_role_en: string;
  leader_role_uk: string;
  location_en: string;
  location_uk: string;
  cta_url: string;
  cta_label_en: string;
  cta_label_uk: string;
  is_featured: boolean;
}

export interface PrayerRequestRow {
  id: string;
  name: string;
  email: string;
  request: string;
  share_with_team: boolean;
  status: 'new' | 'praying' | 'answered' | 'archived';
  created_at: string;
}
