import { LeaderRow } from './types';

/**
 * Bundled fallback used when Supabase is not configured or unreachable.
 * Mirrors what was previously hardcoded in src/components/Leadership.tsx.
 * The English name/title is also used for the Ukrainian fields until staff
 * edits them in the admin panel.
 */
const raw: Array<{ name: string; title: string; emails: string[]; photo: string }> = [
  { name: 'Vasily & Lucy Rudnitsky', title: 'Senior Pastor & Church Accountant', emails: ['vasily@churchofnewhope.org', 'lucy@churchofnewhope.org'], photo: '/images/rudn.jpg' },
  { name: 'Yuriy Rudnitsky', title: 'English Service Pastor', emails: ['yuriy@churchofnewhope.org'], photo: '/images/yurrudn.jpg' },
  { name: 'Anatoli Plukchi', title: 'Home Groups Pastor', emails: ['homegroups@churchofnewhope.org'], photo: '/images/plukchii.jpg' },
  { name: 'Yevgenni Prannik', title: 'Hospitality Pastor', emails: ['info@churchofnewhope.org'], photo: '/images/pranik.jpg' },
  { name: 'Alexander Grinchak', title: 'Visitation Pastor', emails: ['info@churchofnewhope.org'], photo: '/images/grinchak.jpg' },
  { name: 'Andrii Kyslianka', title: 'Family Pastor', emails: ['info@churchofnewhope.org'], photo: '/images/kuslanka.jpg' },
  { name: 'Dima Grinchak', title: 'Pastor', emails: ['info@churchofnewhope.org'], photo: '' },
  { name: 'Andriy Omeliash', title: 'Church Operations Director', emails: ['andriy@churchofnewhope.org'], photo: '/images/omelash.jpg' },
  { name: 'Artem Topchi', title: 'Head Deacon', emails: ['artem@churchofnewhope.org'], photo: '/images/topchiiArtem.jpg' },
  { name: 'Maksym & Victoria Sak', title: 'Ministry Operations Director & Creative Media Director', emails: ['maksym@churchofnewhope.org', 'creative@churchofnewhope.org'], photo: '/images/sak.jpg' },
  { name: 'Iurii & Angelina Prokopchuk', title: "Service Director & Women's Ministry Director", emails: ['iurii@churchofnewhope.org', 'women@churchofnewhope.org'], photo: '/images/prokopchuk.jpg' },
  { name: 'Vitaliy Kuprovsky', title: 'Creative & Production Director', emails: ['vitaliy@churchofnewhope.org'], photo: '/images/kuprovskii.jpg' },
  { name: 'Alexander Berezovsky', title: 'Missions Director', emails: ['missions@churchofnewhope.org'], photo: '' },
  { name: 'Katie Topchi', title: 'Worship Ministry Director', emails: ['worship@churchofnewhope.org'], photo: '/images/katetopchii.jpg' },
  { name: 'Iryna Zyhalenko', title: 'Choir Director', emails: ['worship@churchofnewhope.org'], photo: '' },
  { name: 'Vlad Ferkaliak', title: "Men's Ministry Director", emails: ['men@churchofnewhope.org'], photo: '/images/ferkal.jpg' },
  { name: 'Vitalii Arshulik', title: 'Youth Ministry Director', emails: ['youth@churchofnewhope.org'], photo: '' },
  { name: 'David Pavlyuk', title: 'Youth Ministry Leader', emails: ['youth@churchofnewhope.org'], photo: '/images/david.jpg' },
  { name: 'Vasily and Olena Manilenko', title: "Children's Ministry Directors", emails: ['kids@churchofnewhope.org'], photo: '' },
  { name: 'Nataliia Bohodenko', title: 'Kids Choir Director', emails: ['kids@churchofnewhope.org'], photo: '' },
  { name: 'Maks Mitin', title: 'Sunday School Director', emails: ['kids@churchofnewhope.org'], photo: '/images/metin.jpg' },
  { name: 'Katie Bernik', title: 'Social Media Director', emails: ['creative@churchofnewhope.org'], photo: '' },
  { name: 'Nelia Olos', title: 'Hospitality Director', emails: ['hospitality@churchofnewhope.org'], photo: '/images/olos.jpg' },
  { name: 'Olena Soloninko', title: 'Décor Director', emails: ['info@churchofnewhope.org'], photo: '' },
  { name: 'Victoria Kyshko', title: 'Kitchen Ministry Director', emails: ['info@churchofnewhope.org'], photo: '/images/kushko.jpg' },
];

export const fallbackLeaders: LeaderRow[] = raw.map((l, i) => ({
  id: `fallback-${i}`,
  sort_order: i * 10,
  name_en: l.name,
  name_uk: l.name,
  title_en: l.title,
  title_uk: l.title,
  emails: l.emails,
  photo_path: l.photo || null,
  is_published: true,
}));
