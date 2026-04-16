import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { stockPhotos } from '../data/stockImages';
import Hero from '../components/redesign/Hero';
import Section from '../components/redesign/Section';

const MAX_REQUEST_LENGTH = 2000;

const Prayer: React.FC = () => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [request, setRequest] = useState('');
  const [shareWithTeam, setShareWithTeam] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const mountedAt = useRef(Date.now());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.trim()) return;
    setError(null);

    if (honeypot || Date.now() - mountedAt.current < 3000) {
      setSubmitting(true);
      setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 800);
      return;
    }

    setSubmitting(true);

    if (!supabase) {
      setSubmitting(false);
      setSubmitted(true);
      return;
    }

    const { error: err } = await supabase.from('prayer_requests').insert({
      name: name.trim(),
      email: email.trim(),
      request: request.trim().slice(0, MAX_REQUEST_LENGTH),
      share_with_team: shareWithTeam,
    });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSubmitted(true);
    setName('');
    setEmail('');
    setRequest('');
  };

  return (
    <div className="bg-cream">
      <Hero
        image={stockPhotos.prayer.src(2000)}
        eyebrow={t('prayer.hero.eyebrow')}
        scriptAccent={t('prayer.hero.script')}
        title={t('prayer.hero.title')}
        description={t('prayer.hero.description')}
        height="short"
      />

      <Section variant="cream" padding="lg">
        <div className="grid gap-12 md:grid-cols-5 max-w-6xl mx-auto">
          {/* Verse column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2 flex flex-col justify-center"
          >
            <p className="font-script text-3xl text-tan-500">{t('prayer.hero.script')}</p>
            <blockquote className="mt-6 font-display text-2xl md:text-3xl leading-snug text-navy-900">
              {t('prayer.verse')}
            </blockquote>
            <cite className="mt-4 block text-xs font-bold uppercase tracking-widest text-tan-500 not-italic">
              {t('prayer.verseRef')}
            </cite>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-3 bg-white p-8 md:p-10 border border-navy-900/10"
          >
            {submitted ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center bg-tan-500 text-navy-900">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="mt-6 font-display text-xl uppercase tracking-wider text-navy-900">
                  {t('prayer.form.thanks')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-navy-700 mb-2">
                    {t('prayer.form.name')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('prayer.form.namePlaceholder')}
                    className="w-full border border-navy-900/15 px-4 py-3 text-sm focus:border-tan-500 focus:outline-none focus:ring-1 focus:ring-tan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-navy-700 mb-2">
                    {t('prayer.form.email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('prayer.form.emailPlaceholder')}
                    className="w-full border border-navy-900/15 px-4 py-3 text-sm focus:border-tan-500 focus:outline-none focus:ring-1 focus:ring-tan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-navy-700 mb-2">
                    {t('prayer.form.request')} *
                  </label>
                  <textarea
                    value={request}
                    onChange={(e) => setRequest(e.target.value.slice(0, MAX_REQUEST_LENGTH))}
                    placeholder={t('prayer.form.requestPlaceholder')}
                    required
                    rows={6}
                    maxLength={MAX_REQUEST_LENGTH}
                    className="w-full border border-navy-900/15 px-4 py-3 text-sm focus:border-tan-500 focus:outline-none focus:ring-1 focus:ring-tan-500 resize-none"
                  />
                  <p className={`mt-1 text-xs text-right ${request.length > MAX_REQUEST_LENGTH * 0.9 ? 'text-red-500' : 'text-navy-400'}`}>
                    {request.length}/{MAX_REQUEST_LENGTH}
                  </p>
                </div>
                {/* Honeypot — invisible to humans, bots auto-fill it */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>
                <fieldset>
                  <legend className="text-xs font-bold uppercase tracking-widest text-navy-700 mb-3">
                    {t('prayer.form.share')}
                  </legend>
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={shareWithTeam}
                        onChange={() => setShareWithTeam(true)}
                        className="mt-1 accent-tan-500"
                      />
                      <span className="text-sm text-navy-700">{t('prayer.form.shareYes')}</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={!shareWithTeam}
                        onChange={() => setShareWithTeam(false)}
                        className="mt-1 accent-tan-500"
                      />
                      <span className="text-sm text-navy-700">{t('prayer.form.shareNo')}</span>
                    </label>
                  </div>
                </fieldset>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting || !request.trim()}
                  className="w-full bg-navy-900 px-6 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {submitting ? t('prayer.form.submitting') : t('prayer.form.submit')} →
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </Section>
    </div>
  );
};

export default Prayer;
