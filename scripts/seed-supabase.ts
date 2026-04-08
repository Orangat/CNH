/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * One-off seed script. Run with the service role key in your shell:
 *
 *   REACT_APP_SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   npx ts-node scripts/seed-supabase.ts
 *
 * Idempotent — safe to re-run.
 */
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const url = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing REACT_APP_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_IMAGES = path.join(ROOT, 'public', 'images');

interface Leader {
  name: string;
  title: string;
  emails: string[];
  photo: string;
}

const leaders: Leader[] = [
  { name: 'Vasily & Lucy Rudnitsky', title: 'Senior Pastor & Church Accountant', emails: ['vasily@churchofnewhope.org', 'lucy@churchofnewhope.org'], photo: 'rudn.jpg' },
  { name: 'Yuriy Rudnitsky', title: 'English Service Pastor', emails: ['yuriy@churchofnewhope.org'], photo: 'yurrudn.jpg' },
  { name: 'Anatoli Plukchi', title: 'Home Groups Pastor', emails: ['homegroups@churchofnewhope.org'], photo: 'plukchii.jpg' },
  { name: 'Yevgenni Prannik', title: 'Hospitality Pastor', emails: ['info@churchofnewhope.org'], photo: 'pranik.jpg' },
  { name: 'Alexander Grinchak', title: 'Visitation Pastor', emails: ['info@churchofnewhope.org'], photo: 'grinchak.jpg' },
  { name: 'Andrii Kyslianka', title: 'Family Pastor', emails: ['info@churchofnewhope.org'], photo: 'kuslanka.jpg' },
  { name: 'Dima Grinchak', title: 'Pastor', emails: ['info@churchofnewhope.org'], photo: '' },
  { name: 'Andriy Omeliash', title: 'Church Operations Director', emails: ['andriy@churchofnewhope.org'], photo: 'omelash.jpg' },
  { name: 'Artem Topchi', title: 'Head Deacon', emails: ['artem@churchofnewhope.org'], photo: 'topchiiArtem.jpg' },
  { name: 'Maksym & Victoria Sak', title: 'Ministry Operations Director & Creative Media Director', emails: ['maksym@churchofnewhope.org', 'creative@churchofnewhope.org'], photo: 'sak.jpg' },
  { name: 'Iurii & Angelina Prokopchuk', title: "Service Director & Women's Ministry Director", emails: ['iurii@churchofnewhope.org', 'women@churchofnewhope.org'], photo: 'prokopchuk.jpg' },
  { name: 'Vitaliy Kuprovsky', title: 'Creative & Production Director', emails: ['vitaliy@churchofnewhope.org'], photo: 'kuprovskii.jpg' },
  { name: 'Alexander Berezovsky', title: 'Missions Director', emails: ['missions@churchofnewhope.org'], photo: '' },
  { name: 'Katie Topchi', title: 'Worship Ministry Director', emails: ['worship@churchofnewhope.org'], photo: 'katetopchii.jpg' },
  { name: 'Iryna Zyhalenko', title: 'Choir Director', emails: ['worship@churchofnewhope.org'], photo: '' },
  { name: 'Vlad Ferkaliak', title: "Men's Ministry Director", emails: ['men@churchofnewhope.org'], photo: 'ferkal.jpg' },
  { name: 'Vitalii Arshulik', title: 'Youth Ministry Director', emails: ['youth@churchofnewhope.org'], photo: '' },
  { name: 'David Pavlyuk', title: 'Youth Ministry Leader', emails: ['youth@churchofnewhope.org'], photo: 'david.jpg' },
  { name: 'Vasily and Olena Manilenko', title: "Children's Ministry Directors", emails: ['kids@churchofnewhope.org'], photo: '' },
  { name: 'Nataliia Bohodenko', title: 'Kids Choir Director', emails: ['kids@churchofnewhope.org'], photo: '' },
  { name: 'Maks Mitin', title: 'Sunday School Director', emails: ['kids@churchofnewhope.org'], photo: 'metin.jpg' },
  { name: 'Katie Bernik', title: 'Social Media Director', emails: ['creative@churchofnewhope.org'], photo: '' },
  { name: 'Nelia Olos', title: 'Hospitality Director', emails: ['hospitality@churchofnewhope.org'], photo: 'olos.jpg' },
  { name: 'Olena Soloninko', title: 'Décor Director', emails: ['info@churchofnewhope.org'], photo: '' },
  { name: 'Victoria Kyshko', title: 'Kitchen Ministry Director', emails: ['info@churchofnewhope.org'], photo: 'kushko.jpg' },
];

function flatten(obj: any, prefix = ''): Array<{ key: string; value: string; group: string }> {
  const out: Array<{ key: string; value: string; group: string }> = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') {
      out.push(...flatten(v, key));
    } else if (typeof v === 'string') {
      out.push({ key, value: v, group: key.split('.')[0] });
    }
  }
  return out;
}

async function seedTexts() {
  const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/translations/en.json'), 'utf8'));
  const uk = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/translations/uk.json'), 'utf8'));
  const enFlat = flatten(en);
  const ukMap = new Map(flatten(uk).map((r) => [r.key, r.value]));
  const rows = enFlat.map((r) => ({
    key: r.key,
    group: r.group,
    value_en: r.value,
    value_uk: ukMap.get(r.key) ?? '',
  }));
  const { error } = await supabase.from('site_texts').upsert(rows, { onConflict: 'key' });
  if (error) throw error;
  console.log(`Seeded ${rows.length} texts`);
}

async function uploadPhoto(filename: string): Promise<string | null> {
  if (!filename) return null;
  const full = path.join(PUBLIC_IMAGES, filename);
  if (!fs.existsSync(full)) {
    console.warn(`  ! photo missing: ${filename}`);
    return null;
  }
  const buf = fs.readFileSync(full);
  const ext = path.extname(filename).slice(1) || 'jpg';
  const target = `seed/${filename}`;
  const { error } = await supabase.storage
    .from('leader-photos')
    .upload(target, buf, { upsert: true, contentType: `image/${ext}` });
  if (error) {
    console.warn(`  ! upload failed for ${filename}: ${error.message}`);
    return null;
  }
  return target;
}

async function seedLeaders() {
  // Idempotent strategy: look up by name_en, update if present, insert otherwise.
  for (let i = 0; i < leaders.length; i++) {
    const l = leaders[i];
    const photoPath = await uploadPhoto(l.photo);
    const payload = {
      sort_order: i * 10,
      name_en: l.name,
      name_uk: l.name,
      title_en: l.title,
      title_uk: l.title,
      emails: l.emails,
      photo_path: photoPath,
      is_published: true,
    };
    const { data: existing } = await supabase
      .from('leaders')
      .select('id')
      .eq('name_en', l.name)
      .maybeSingle();
    let error;
    if (existing) {
      ({ error } = await supabase.from('leaders').update(payload).eq('id', existing.id));
    } else {
      ({ error } = await supabase.from('leaders').insert(payload));
    }
    if (error) console.warn(`  ! ${l.name}: ${error.message}`);
    else console.log(`  ✓ ${l.name}`);
  }
  console.log(`Seeded ${leaders.length} leaders`);
}

async function seedContact() {
  const { data } = await supabase.from('contact_info').select('id').limit(1).maybeSingle();
  const payload = {
    address: '13601 Idlewild Rd, Matthews, NC 28105',
    phone: '+1 (704) 609-7110',
    email: 'info@churchofnewhope.org',
    service_time_english: '10:00 AM',
    service_time_ukrainian: '12:00 PM',
    map_url: 'https://www.google.com/maps/place/Church+of+New+Hope',
    facebook_url: 'https://www.facebook.com/CNHCharlotte',
    instagram_url: 'https://www.instagram.com/cnhcharlotte',
    youtube_url: 'https://www.youtube.com/@ChurchOfNewHopeUA/streams',
  };
  if (data) {
    await supabase.from('contact_info').update(payload).eq('id', data.id);
  } else {
    await supabase.from('contact_info').insert(payload);
  }
  console.log('Seeded contact_info');
}

(async () => {
  console.log('Seeding texts…');
  await seedTexts();
  console.log('Seeding leaders…');
  await seedLeaders();
  console.log('Seeding contact…');
  await seedContact();
  console.log('Done.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
