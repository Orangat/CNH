-- =============================================================================
-- CNH initial content seed
-- Run in Supabase SQL Editor AFTER migrations 0001 and 0002.
-- Idempotent: safe to run multiple times (uses ON CONFLICT).
-- =============================================================================

-- =============================================================================
-- 1. CONTACT INFO (update singleton row created by 0001)
-- =============================================================================
update contact_info set
  address              = '13601 Idlewild Rd, Matthews, NC 28105',
  phone                = '+1 (704) 609-7110',
  email                = 'info@churchofnewhope.org',
  service_time_english = '10:00 AM',
  service_time_ukrainian = '12:00 PM',
  map_url              = 'https://www.google.com/maps/place/Church+of+New+Hope/@35.1386539,-80.6753961,17z',
  facebook_url         = 'https://www.facebook.com/CNHCharlotte',
  instagram_url        = 'https://www.instagram.com/cnhcharlotte',
  youtube_url          = 'https://www.youtube.com/@ChurchOfNewHopeUA/streams'
where singleton = true;

-- =============================================================================
-- 2. LEADERS (all 25, photos point to /images/*.jpg — served from Netlify static)
-- =============================================================================
insert into leaders (sort_order, name_en, name_uk, title_en, title_uk, emails, photo_path, is_published)
values
  (10,  'Vasily & Lucy Rudnitsky',       'Vasily & Lucy Rudnitsky',       'Senior Pastor & Church Accountant',                          'Senior Pastor & Church Accountant',                          '{vasily@churchofnewhope.org,lucy@churchofnewhope.org}', '/images/rudn.jpg',         true),
  (20,  'Yuriy Rudnitsky',               'Yuriy Rudnitsky',               'English Service Pastor',                                     'English Service Pastor',                                     '{yuriy@churchofnewhope.org}',                           '/images/yurrudn.jpg',      true),
  (30,  'Anatoli Plukchi',               'Anatoli Plukchi',               'Home Groups Pastor',                                         'Home Groups Pastor',                                         '{homegroups@churchofnewhope.org}',                      '/images/plukchii.jpg',     true),
  (40,  'Yevgenni Prannik',              'Yevgenni Prannik',              'Hospitality Pastor',                                         'Hospitality Pastor',                                         '{info@churchofnewhope.org}',                            '/images/pranik.jpg',       true),
  (50,  'Alexander Grinchak',            'Alexander Grinchak',            'Visitation Pastor',                                          'Visitation Pastor',                                          '{info@churchofnewhope.org}',                            '/images/grinchak.jpg',     true),
  (60,  'Andrii Kyslianka',              'Andrii Kyslianka',              'Family Pastor',                                              'Family Pastor',                                              '{info@churchofnewhope.org}',                            '/images/kuslanka.jpg',     true),
  (70,  'Dima Grinchak',                 'Dima Grinchak',                 'Pastor',                                                     'Pastor',                                                     '{info@churchofnewhope.org}',                            null,                       true),
  (80,  'Andriy Omeliash',               'Andriy Omeliash',               'Church Operations Director',                                 'Church Operations Director',                                 '{andriy@churchofnewhope.org}',                          '/images/omelash.jpg',      true),
  (90,  'Artem Topchi',                  'Artem Topchi',                  'Head Deacon',                                                'Head Deacon',                                                '{artem@churchofnewhope.org}',                           '/images/topchiiArtem.jpg', true),
  (100, 'Maksym & Victoria Sak',         'Maksym & Victoria Sak',         'Ministry Operations Director & Creative Media Director',      'Ministry Operations Director & Creative Media Director',      '{maksym@churchofnewhope.org,creative@churchofnewhope.org}', '/images/sak.jpg',     true),
  (110, 'Iurii & Angelina Prokopchuk',   'Iurii & Angelina Prokopchuk',   'Service Director & Women''s Ministry Director',               'Service Director & Women''s Ministry Director',               '{iurii@churchofnewhope.org,women@churchofnewhope.org}', '/images/prokopchuk.jpg',   true),
  (120, 'Vitaliy Kuprovsky',             'Vitaliy Kuprovsky',             'Creative & Production Director',                             'Creative & Production Director',                             '{vitaliy@churchofnewhope.org}',                         '/images/kuprovskii.jpg',   true),
  (130, 'Alexander Berezovsky',          'Alexander Berezovsky',          'Missions Director',                                          'Missions Director',                                          '{missions@churchofnewhope.org}',                        null,                       true),
  (140, 'Katie Topchi',                  'Katie Topchi',                  'Worship Ministry Director',                                  'Worship Ministry Director',                                  '{worship@churchofnewhope.org}',                         '/images/katetopchii.jpg',  true),
  (150, 'Iryna Zyhalenko',              'Iryna Zyhalenko',               'Choir Director',                                             'Choir Director',                                             '{worship@churchofnewhope.org}',                         null,                       true),
  (160, 'Vlad Ferkaliak',               'Vlad Ferkaliak',                'Men''s Ministry Director',                                   'Men''s Ministry Director',                                   '{men@churchofnewhope.org}',                             '/images/ferkal.jpg',       true),
  (170, 'Vitalii Arshulik',             'Vitalii Arshulik',              'Youth Ministry Director',                                    'Youth Ministry Director',                                    '{youth@churchofnewhope.org}',                           null,                       true),
  (180, 'David Pavlyuk',                'David Pavlyuk',                 'Youth Ministry Leader',                                      'Youth Ministry Leader',                                      '{youth@churchofnewhope.org}',                           '/images/david.jpg',        true),
  (190, 'Vasily and Olena Manilenko',   'Vasily and Olena Manilenko',    'Children''s Ministry Directors',                              'Children''s Ministry Directors',                              '{kids@churchofnewhope.org}',                            null,                       true),
  (200, 'Nataliia Bohodenko',           'Nataliia Bohodenko',            'Kids Choir Director',                                        'Kids Choir Director',                                        '{kids@churchofnewhope.org}',                            null,                       true),
  (210, 'Maks Mitin',                   'Maks Mitin',                    'Sunday School Director',                                     'Sunday School Director',                                     '{kids@churchofnewhope.org}',                            '/images/metin.jpg',        true),
  (220, 'Katie Bernik',                 'Katie Bernik',                  'Social Media Director',                                      'Social Media Director',                                      '{creative@churchofnewhope.org}',                        null,                       true),
  (230, 'Nelia Olos',                   'Nelia Olos',                    'Hospitality Director',                                       'Hospitality Director',                                       '{hospitality@churchofnewhope.org}',                     '/images/olos.jpg',         true),
  (240, 'Olena Soloninko',              'Olena Soloninko',               'Décor Director',                                             'Décor Director',                                             '{info@churchofnewhope.org}',                            null,                       true),
  (250, 'Victoria Kyshko',              'Victoria Kyshko',               'Kitchen Ministry Director',                                  'Kitchen Ministry Director',                                  '{info@churchofnewhope.org}',                            '/images/kushko.jpg',       true)
on conflict do nothing;

-- =============================================================================
-- 3. SITE TEXTS — only keys that should be EDITABLE through admin
--
-- Approach:
--   - Keys inserted here → editable in /admin/texts (Supabase overrides JSON)
--   - Keys NOT here → stay in en.json/uk.json (still work via t() fallback)
--   - "description" field tells admin WHERE this text appears on the site
--   - "group" field organizes by page in admin UI
--
-- What we SKIP (stays in JSON, almost never changes):
--   - nav.* (navigation labels)
--   - home.mission.* (Love God / Love People — theological, static)
--   - home.leadershipPreview.* (just section labels)
--   - home.groupsCta.* (Bible study CTA — static)
--   - home.giveCta.* (give CTA — static)
--   - weBelieve.* (theological statements)
--   - All form placeholders and UI micro-copy
-- =============================================================================

insert into site_texts (key, "group", value_en, value_uk, description)
values
  -- =========================================================================
  -- HOME PAGE — hero
  -- =========================================================================
  ('home.hero.eyebrow',      'home', 'Welcome home',                                'Ласкаво просимо додому',                        'Home page: small label above the main title'),
  ('home.hero.script',       'home', 'There is hope',                               'Є надія',                                       'Home page: decorative script text in hero'),
  ('home.hero.title',        'home', 'A church for the next generation',             'Церква для нового покоління',                   'Home page: main hero title (largest text)'),
  ('home.hero.description',  'home', 'We are a bilingual community gathering each Sunday in Charlotte to encounter Jesus, grow together, and serve the city we love. You are welcome here, just as you are.', 'Ми — двомовна спільнота, яка щонеділі збирається у Шарлотті, щоб зустріти Ісуса, рости разом та служити нашому місту. Ви бажані гості — такими, якими ви є.', 'Home page: paragraph under hero title'),
  ('home.hero.ctaPrimary',   'home', 'Plan your visit',                             'Запланувати візит',                             'Home page: main CTA button in hero'),
  ('home.hero.ctaSecondary', 'home', 'Watch a sermon',                              'Дивитись проповідь',                            'Home page: secondary link in hero'),

  -- HOME — welcome / come as you are section
  ('home.welcome.eyebrow',   'home', 'First time?',                                 'Вперше у нас?',                                 'Home page: "Come as you are" section label'),
  ('home.welcome.title',     'home', 'Come as you are',                             'Приходьте такими, якими ви є',                  'Home page: "Come as you are" section title'),
  ('home.welcome.body',      'home', 'Whether you''ve been walking with Jesus for decades or are just beginning to ask questions, you''ll find a warm welcome at Church of New Hope. We gather in two languages, share a meal, and worship together as one family.', 'Незалежно від того, чи ви ходите з Ісусом десятиліттями чи лише починаєте задавати питання — у Церкві Нової Надії ви знайдете тепле прийняття. Ми збираємось двома мовами, ділимось трапезою та поклоняємось як одна сім''я.', 'Home page: "Come as you are" paragraph'),

  -- HOME — what to expect
  ('home.expect.eyebrow',                  'home', 'What to expect',                     'Чого очікувати',                        'Home page: "What to expect" section label'),
  ('home.expect.title',                    'home', 'Sundays at New Hope',                'Неділі у Новій Надії',                  'Home page: "What to expect" section title'),
  ('home.expect.items.worship.title',      'home', 'Heartfelt worship',                  'Щире поклоніння',                       'Home page: "What to expect" — worship card title'),
  ('home.expect.items.worship.body',       'home', 'Live music, congregational singing, and a moment for everyone to lift their voice.', 'Жива музика, спільний спів та можливість для кожного підняти свій голос.', 'Home page: "What to expect" — worship card text'),
  ('home.expect.items.teaching.title',     'home', 'Bible-rooted teaching',              'Біблійне навчання',                     'Home page: "What to expect" — teaching card title'),
  ('home.expect.items.teaching.body',      'home', 'Practical messages grounded in Scripture, translated live in both English and Ukrainian.', 'Практичні послання, що базуються на Писанні, з живим перекладом англійською та українською.', 'Home page: "What to expect" — teaching card text'),
  ('home.expect.items.kids.title',         'home', 'Joyful kids ministry',               'Радісне дитяче служіння',               'Home page: "What to expect" — kids card title'),
  ('home.expect.items.kids.body',          'home', 'Safe, joyful classes for kids from nursery through middle school during every service.', 'Безпечні, радісні класи для дітей від ясел до середньої школи під час кожного служіння.', 'Home page: "What to expect" — kids card text'),
  ('home.expect.items.fellowship.title',   'home', 'Real community',                     'Справжня спільнота',                    'Home page: "What to expect" — community card title'),
  ('home.expect.items.fellowship.body',    'home', 'Coffee, conversation, and people genuinely glad to meet you after every gathering.', 'Кава, розмови та люди, які щиро раді знайомству з вами після кожного зібрання.', 'Home page: "What to expect" — community card text'),

  -- HOME — stats (labels only; numbers are hardcoded in Home.tsx — need code change)
  ('home.stats.years',       'home', 'Years serving Charlotte',                     'Років служіння Шарлотту',                       'Home page: stat label under the "20+" number'),
  ('home.stats.languages',   'home', 'Languages every Sunday',                      'Мови щонеділі',                                 'Home page: stat label under the "2" number'),
  ('home.stats.groups',      'home', 'Active small groups',                         'Активні малі групи',                            'Home page: stat label under the "15+" number'),
  ('home.stats.ministries',  'home', 'Ministry teams',                              'Служінь',                                       'Home page: stat label under the "25+" number'),

  -- HOME — service times strip labels
  ('home.sundays',           'home', 'Sundays',                                     'Щонеділі',                                      'Home page + Footer: "Sundays" label next to service times'),
  ('home.english',           'home', 'English',                                     'Англійською',                                   'Home page + Footer: label for English service time'),
  ('home.ukrainian',         'home', 'Ukrainian',                                   'Українською',                                   'Home page + Footer: label for Ukrainian service time'),

  -- =========================================================================
  -- LEADERSHIP PAGE
  -- =========================================================================
  ('leadership.eyebrow',     'leadership', 'The team',                               'Команда',                                       'Leadership page: small label above title'),
  ('leadership.title',       'leadership', 'Our Leadership',                         'Наші лідери',                                   'Leadership page: main title'),
  ('leadership.subtitle',    'leadership', 'Meet the pastors, directors, and volunteers who serve our church family.', 'Познайомтесь з пасторами, директорами та волонтерами, які служать нашій церковній сім''ї.', 'Leadership page: subtitle under title'),

  -- =========================================================================
  -- VISIT PAGE
  -- =========================================================================
  ('visit.hero.eyebrow',     'visit', 'Plan your visit',                            'Запланувати візит',                             'Visit page: hero label'),
  ('visit.hero.script',      'visit', 'We saved you a seat',                        'Ми зберегли вам місце',                         'Visit page: hero script text'),
  ('visit.hero.title',       'visit', 'Your first time at New Hope',                'Ваш перший раз у Новій Надії',                 'Visit page: hero title'),
  ('visit.hero.description', 'visit', 'Here''s everything you need to know before walking through our doors.', 'Все, що вам потрібно знати, перш ніж переступити поріг.', 'Visit page: hero description'),
  ('visit.sections.what.title',     'visit', 'What to expect',                      'Чого очікувати',                                'Visit page: info card — what to expect'),
  ('visit.sections.what.body',      'visit', 'Services last about 90 minutes and include music, prayer, and a Bible-based message. Come a few minutes early — we''ll have coffee waiting and someone happy to show you around.', 'Служіння триває близько 90 хвилин і включає музику, молитву та біблійне послання. Приходьте на кілька хвилин раніше — кава вже буде готова, і хтось з радістю покаже вам усе.', 'Visit page: info card — what to expect body'),
  ('visit.sections.wear.title',     'visit', 'What to wear',                        'Що вдягнути',                                   'Visit page: info card — what to wear'),
  ('visit.sections.wear.body',      'visit', 'Whatever feels comfortable. You''ll see jeans, dresses, suits — and everything in between. There''s no dress code at New Hope.', 'Все, що зручно. Ви побачите джинси, сукні, костюми — і все між ними. У Новій Надії немає дрес-коду.', 'Visit page: info card — what to wear body'),
  ('visit.sections.kids.title',     'visit', 'For your kids',                        'Для ваших дітей',                               'Visit page: info card — kids ministry'),
  ('visit.sections.kids.body',      'visit', 'We love kids. Our team runs safe, age-appropriate classes from nursery through 5th grade during every service. Check-in opens 20 minutes before service.', 'Ми любимо дітей. Наша команда проводить безпечні класи від ясел до 5 класу під час кожного служіння. Реєстрація відкривається за 20 хвилин до служіння.', 'Visit page: info card — kids body'),
  ('visit.sections.parking.title',  'visit', 'Parking',                              'Парковка',                                      'Visit page: info card — parking'),
  ('visit.sections.parking.body',   'visit', 'Free parking in our main lot. First-time guests can park up front in marked spots — look for the welcome banner.', 'Безкоштовна парковка на нашій основній стоянці. Гості, що приходять вперше, можуть припаркуватись попереду — шукайте банер привітання.', 'Visit page: info card — parking body'),
  ('visit.sections.language.title', 'visit', 'Both languages',                       'Дві мови',                                      'Visit page: info card — language services'),
  ('visit.sections.language.body',  'visit', 'English service at 10am, Ukrainian service at noon. Live translation is available between rooms — let a greeter know.', 'Англійське служіння о 10:00, українське о 12:00. Доступний живий переклад між кімнатами — повідомте грітеру.', 'Visit page: info card — language body'),
  ('visit.sections.questions.title','visit', 'Have questions?',                       'Маєте питання?',                                'Visit page: info card — questions'),
  ('visit.sections.questions.body', 'visit', 'Reach out anytime. We''re happy to answer anything — even the awkward ones.', 'Звертайтесь у будь-який час. Ми з радістю відповімо на будь-які — навіть незручні.', 'Visit page: info card — questions body'),

  -- =========================================================================
  -- SERMONS PAGE
  -- =========================================================================
  ('sermons.hero.eyebrow',     'sermons', 'Watch and listen',                        'Дивитись та слухати',                           'Sermons page: hero label'),
  ('sermons.hero.script',      'sermons', 'The Word, alive',                         'Слово, що оживає',                              'Sermons page: hero script text'),
  ('sermons.hero.title',       'sermons', 'Recent sermons',                          'Останні проповіді',                             'Sermons page: hero title'),
  ('sermons.hero.description', 'sermons', 'Catch up on past messages or share with a friend. New videos posted every week.', 'Наздоганяйте минулі послання або діліться з друзями. Нові відео щотижня.', 'Sermons page: hero description'),

  -- =========================================================================
  -- MINISTRIES PAGE
  -- =========================================================================
  ('ministries.hero.eyebrow',     'ministries', 'Get involved',                      'Долучайтесь',                                   'Ministries page: hero label'),
  ('ministries.hero.script',      'ministries', 'Find your place',                   'Знайдіть своє місце',                           'Ministries page: hero script text'),
  ('ministries.hero.title',       'ministries', 'Ministries',                        'Служіння',                                      'Ministries page: hero title'),
  ('ministries.hero.description', 'ministries', 'Every ministry exists to help people meet Jesus, grow in Him, and serve others. Find one that fits where you are right now.', 'Кожне служіння існує, щоб допомогти людям зустріти Ісуса, рости в Ньому та служити іншим. Знайдіть те, що відповідає вашому моменту.', 'Ministries page: hero description'),

  -- =========================================================================
  -- PRAYER PAGE
  -- =========================================================================
  ('prayer.hero.eyebrow',     'prayer', 'We''re praying with you',                  'Ми молимось з вами',                            'Prayer page: hero label'),
  ('prayer.hero.script',      'prayer', 'You are not alone',                         'Ви не самі',                                    'Prayer page: hero script text'),
  ('prayer.hero.title',       'prayer', 'Prayer requests',                           'Молитовні прохання',                            'Prayer page: hero title'),
  ('prayer.hero.description', 'prayer', 'Whatever you''re facing, our pastors and prayer team would be honored to pray with you. Your request is private unless you choose otherwise.', 'З чим би ви не стикались, наші пастори та молитовна команда будуть честю молитись з вами. Ваше прохання приватне, якщо ви не оберете інакше.', 'Prayer page: hero description'),
  ('prayer.verse',            'prayer', '"Cast all your anxiety on him because he cares for you."', '"Покладіть на Нього всю турботу свою, бо Він дбає про вас."', 'Prayer page: Bible verse shown next to form'),
  ('prayer.verseRef',         'prayer', '1 Peter 5:7',                               '1 Петра 5:7',                                   'Prayer page: verse reference'),

  -- =========================================================================
  -- EVENTS PAGE
  -- =========================================================================
  ('events.hero.eyebrow',     'events', 'Mark your calendar',                        'Заплануйте',                                    'Events page: hero label'),
  ('events.hero.script',      'events', 'See you there',                             'До зустрічі',                                   'Events page: hero script text'),
  ('events.hero.title',       'events', 'Upcoming events',                           'Майбутні події',                                'Events page: hero title'),
  ('events.hero.description', 'events', 'Worship services, community gatherings, special events — there''s always something happening at New Hope.', 'Служіння поклоніння, спільні зустрічі, особливі події — у Новій Надії завжди щось відбувається.', 'Events page: hero description'),

  -- =========================================================================
  -- GIVE PAGE
  -- =========================================================================
  ('give.hero.eyebrow',     'give', 'Generosity',                                   'Щедрість',                                      'Give page: hero label'),
  ('give.hero.script',      'give', 'Thank you',                                    'Дякуємо',                                       'Give page: hero script text'),
  ('give.hero.title',       'give', 'Give to New Hope',                             'Пожертвувати Новій Надії',                      'Give page: hero title'),
  ('give.hero.description', 'give', 'Every gift — large or small — fuels Sunday worship, ministry to kids and families, and outreach across Charlotte.', 'Кожна пожертва — велика чи мала — підтримує недільні служіння, дитяче та сімейне служіння та благовістя у Шарлотті.', 'Give page: hero description'),
  ('give.zelle.description','give', 'Send your gift directly to our Zelle account. Fast, secure, and no fees. Please add a note with your gift.', 'Надішліть пожертву безпосередньо на наш рахунок Zelle. Швидко, безпечно та без комісій. Будь ласка, додайте примітку.', 'Give page: Zelle card description'),
  ('give.paypal.description','give','Donate securely through PayPal. Use your PayPal balance, a bank account, or any card.', 'Безпечні пожертви через PayPal. Використовуйте баланс PayPal, банківський рахунок або картку.', 'Give page: PayPal card description'),
  ('give.onlineGiving.description','give','Use our secure online giving platform powered by Square. Accepts all major credit cards and bank transfers.', 'Наша безпечна онлайн платформа на базі Square. Приймає всі основні картки та банківські перекази.', 'Give page: Online giving card description'),
  ('give.thankYou',          'give', 'Thank you for your generous support of our ministry!', 'Дякуємо за вашу щедру підтримку!',        'Give page: thank you message at bottom'),
  ('give.taxDeductible',     'give', 'All donations are tax-deductible. You will receive a receipt for your records.', 'Усі пожертви не оподатковуються. Ви отримаєте квитанцію.', 'Give page: tax deductible notice'),

  -- =========================================================================
  -- FOOTER
  -- =========================================================================
  ('footer.tagline',         'footer', 'A place to belong',                          'Місце, де ви свої',                             'Footer: tagline under church name'),
  ('footer.copyright',       'footer', '© 2026 Church of New Hope. All rights reserved.', '© 2026 Церква Нової Надії. Усі права захищено.', 'Footer: copyright line at very bottom')

on conflict (key) do update set
  value_en = excluded.value_en,
  value_uk = excluded.value_uk,
  description = excluded.description;

-- =============================================================================
-- Done! Verify:
-- =============================================================================
-- select count(*) from leaders;          -- expect 25
-- select count(*) from site_texts;       -- expect ~70
-- select * from contact_info limit 1;    -- expect filled row
