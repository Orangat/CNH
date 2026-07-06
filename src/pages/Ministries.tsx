import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useMinistries } from '../data/useMinistries';
import { stockPhotos } from '../data/stockImages';
import Hero from '../components/redesign/Hero';
import Section from '../components/redesign/Section';

interface MinistryItem {
  id: string;
  name: string;
  description?: string;
  meeting?: string;
  image?: string;
  icon?: string;
  contactEmail?: string;
}

/**
 * Local sample ministries shown when the database has none yet.
 * Used for previews/presentations — images are free Unsplash stock photos.
 */
function getSampleMinistries(language: 'en' | 'uk'): MinistryItem[] {
  const uk = language === 'uk';
  return [
    {
      id: 'sample-worship',
      name: uk ? 'Група прославлення' : 'Worship & Praise Team',
      description: uk
        ? 'Музиканти й вокалісти, які ведуть громаду в поклонінні на щотижневих богослужіннях.'
        : 'Musicians and vocalists who lead the congregation in worship every Sunday.',
      meeting: uk ? 'Репетиції — четвер, 19:00' : 'Rehearsals · Thursdays 7:00 PM',
      image: stockPhotos.worshipHands.src(1200),
    },
    {
      id: 'sample-choir',
      name: uk ? 'Хор' : 'Choir',
      description: uk
        ? 'Спільний спів, що наповнює служіння хвалою — приєднуйтесь незалежно від досвіду.'
        : 'Voices joined together in praise — all are welcome, no experience needed.',
      meeting: uk ? 'Репетиції — вівторок, 18:30' : 'Rehearsals · Tuesdays 6:30 PM',
      image: stockPhotos.worship.src(1200),
    },
    {
      id: 'sample-children',
      name: uk ? "Дитяче служіння" : "Children's Ministry",
      description: uk
        ? 'Безпечне й радісне місце, де діти пізнають Ісуса через ігри, історії та творчість.'
        : 'A safe, joyful place where kids learn about Jesus through games, stories, and crafts.',
      meeting: uk ? 'Неділя, під час богослужінь' : 'Sundays · during services',
      image: stockPhotos.kids.src(1200),
    },
    {
      id: 'sample-sunday-school',
      name: uk ? 'Недільна школа' : 'Sunday School',
      description: uk
        ? 'Вивчення Біблії для всіх вікових груп, щоб зростати у вірі та пізнанні Слова.'
        : 'Bible classes for every age to grow in faith and understanding of God’s Word.',
      meeting: uk ? 'Неділя, 9:00' : 'Sundays · 9:00 AM',
      image: stockPhotos.openBible.src(1200),
    },
    {
      id: 'sample-youth',
      name: uk ? 'Молодіжне служіння' : 'Youth Ministry',
      description: uk
        ? 'Спільнота для підлітків і молоді: спілкування, прославлення та зростання у Христі.'
        : 'A community for teens and young adults to connect, worship, and grow in Christ.',
      meeting: uk ? 'П’ятниця, 19:00' : 'Fridays · 7:00 PM',
      image: stockPhotos.fellowship.src(1200),
    },
    {
      id: 'sample-groups',
      name: uk ? 'Малі групи' : 'Small Groups',
      description: uk
        ? 'Невеликі домашні групи для спільної молитви, вивчення Біблії та підтримки одне одного.'
        : 'Home groups gathering for prayer, Bible study, and doing life together.',
      meeting: uk ? 'Протягом тижня' : 'Throughout the week',
      image: stockPhotos.community.src(1200),
    },
    {
      id: 'sample-prayer',
      name: uk ? 'Молитовне служіння' : 'Prayer Ministry',
      description: uk
        ? 'Команда, що молиться за потреби громади та підтримує кожного, хто потребує молитви.'
        : 'A team devoted to praying over the needs of our church family and community.',
      meeting: uk ? 'Середа, 19:00' : 'Wednesdays · 7:00 PM',
      image: stockPhotos.prayer.src(1200),
    },
    {
      id: 'sample-hospitality',
      name: uk ? 'Служіння гостинності' : 'Hospitality & Welcome',
      description: uk
        ? 'Зустрічаємо гостей з усмішкою, допомагаємо кожному відчути себе вдома у New Hope.'
        : 'Greeting guests with a smile and helping everyone feel at home at New Hope.',
      meeting: uk ? 'Неділя, перед богослужінням' : 'Sundays · before service',
      image: stockPhotos.welcome.src(1200),
    },
  ];
}

const MinistryCard: React.FC<{ item: MinistryItem; index: number; contactLabel: string }> = ({
  item,
  index,
  contactLabel,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
    className="group flex flex-col overflow-hidden bg-white border border-navy-900/10 hover:border-tan-500 hover:shadow-2xl hover:shadow-navy-900/10 transition-all"
  >
    {item.image ? (
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 h-[3px] w-14 bg-tan-500" aria-hidden />
      </div>
    ) : (
      <div className="p-8 pb-0">
        <div className="flex h-14 w-14 items-center justify-center bg-navy-50 text-navy-700 group-hover:bg-tan-500 group-hover:text-white transition-colors">
          <i className={`fas fa-${item.icon || 'users'} text-xl`} />
        </div>
      </div>
    )}

    <div className="flex flex-1 flex-col p-8">
      <h3 className="font-display text-xl font-bold uppercase tracking-wider text-navy-900">
        {item.name}
      </h3>
      {item.description && (
        <p className="mt-4 text-sm leading-relaxed text-navy-700/85">{item.description}</p>
      )}
      {item.meeting && (
        <p className="mt-4 text-xs uppercase tracking-wider text-navy-700/60">{item.meeting}</p>
      )}
      {item.contactEmail && (
        <a
          href={`mailto:${item.contactEmail}`}
          className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-tan-500 hover:gap-3 transition-all"
        >
          {contactLabel} →
        </a>
      )}
    </div>
  </motion.div>
);

const Ministries: React.FC = () => {
  const { t, language } = useLanguage();
  const { data: ministries, loading } = useMinistries();

  const dbItems: MinistryItem[] = ministries.map((m) => ({
    id: m.id,
    name: language === 'uk' && m.name_uk ? m.name_uk : m.name_en,
    description:
      language === 'uk' && m.description_uk ? m.description_uk : m.description_en || undefined,
    meeting:
      language === 'uk' && m.meeting_info_uk
        ? m.meeting_info_uk
        : m.meeting_info_en || undefined,
    icon: m.icon || undefined,
    contactEmail: m.contact_email || undefined,
  }));

  const items = dbItems.length > 0 ? dbItems : getSampleMinistries(language);

  return (
    <div className="bg-cream">
      <Hero
        image={stockPhotos.community.src(2000)}
        eyebrow={t('ministries.hero.eyebrow')}
        scriptAccent={t('ministries.hero.script')}
        title={t('ministries.hero.title')}
        description={t('ministries.hero.description')}
        height="short"
      />

      <Section variant="cream" padding="lg">
        {loading ? (
          <p className="text-center text-navy-700/60">Loading…</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <MinistryCard
                key={item.id}
                item={item}
                index={i}
                contactLabel={t('ministries.contact')}
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};

export default Ministries;
