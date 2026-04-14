import React from 'react';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { useLanguage } from '../contexts/LanguageContext';
import { stockPhotos } from '../data/stockImages';
import Hero from '../components/redesign/Hero';
import Section from '../components/redesign/Section';

const ZELLE_PHONE = '(704) 453-9365';
const ZELLE_NAME = 'CHURCH OF NEW HOPE Accounts';

// Build the official Zelle QR payload so banking apps recognise it as a
// payment request rather than a plain text phone number. The token must
// match the phone number the recipient enrolled with Zelle.
const zellePayload = {
  name: ZELLE_NAME,
  token: ZELLE_PHONE.replace(/\D/g, ''),
  action: 'payment',
};
const ZELLE_QR_VALUE = `https://enroll.zellepay.com/qr-codes?data=${btoa(
  JSON.stringify(zellePayload),
)}`;

const Give: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-cream">
      <Hero
        image={stockPhotos.cross.src(2000)}
        eyebrow={t('give.hero.eyebrow')}
        scriptAccent={t('give.hero.script')}
        title={t('give.hero.title')}
        description={t('give.hero.description')}
        height="short"
      />

      <Section variant="cream" padding="lg">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Online giving — primary */}
          <motion.a
            href="https://churchofnewhope.churchcenter.com/giving?open-in-church-center-modal=true"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative overflow-hidden bg-navy-900 text-white p-8 hover:bg-navy-800 transition-colors cursor-pointer block"
          >
            <div className="flex h-14 w-14 items-center justify-center bg-tan-500 text-navy-900">
              <i className="fas fa-credit-card text-xl" />
            </div>
            <h3 className="mt-6 font-display text-2xl font-bold uppercase tracking-wider">
              {t('give.onlineGiving.title')}
            </h3>
            <p className="mt-4 text-sm text-white/80 leading-relaxed">
              {t('give.onlineGiving.description')}
            </p>
            <div className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-tan-500 group-hover:gap-3 transition-all">
              {t('give.onlineGiving.button')} →
            </div>
          </motion.a>

          {/* PayPal */}
          <motion.a
            href="https://www.paypal.com/donate/?hosted_button_id=WN6DWH9H8KTB4"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative overflow-hidden bg-white border border-navy-900/10 p-8 hover:border-tan-500 hover:shadow-2xl hover:shadow-navy-900/10 transition-all cursor-pointer block"
          >
            <div className="flex h-14 w-14 items-center justify-center bg-navy-50 text-navy-700 group-hover:bg-tan-500 group-hover:text-white transition-colors">
              <i className="fab fa-paypal text-xl" />
            </div>
            <h3 className="mt-6 font-display text-2xl font-bold uppercase tracking-wider text-navy-900">
              {t('give.paypal.title')}
            </h3>
            <p className="mt-4 text-sm text-navy-700/80 leading-relaxed">
              {t('give.paypal.description')}
            </p>
            <div className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy-700 group-hover:gap-3 group-hover:text-tan-500 transition-all">
              {t('give.paypal.button')} →
            </div>
          </motion.a>

          {/* Zelle with QR */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white border border-navy-900/10 p-8"
          >
            <div className="flex h-14 w-14 items-center justify-center bg-navy-50 text-navy-700">
              <i className="fas fa-mobile-alt text-xl" />
            </div>
            <h3 className="mt-6 font-display text-2xl font-bold uppercase tracking-wider text-navy-900">
              {t('give.zelle.title')}
            </h3>
            <p className="mt-4 text-sm text-navy-700/80 leading-relaxed">
              {t('give.zelle.description')}
            </p>
            <div className="mt-6 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-navy-700/70">{t('give.zelle.phone')}</span>
                <span className="font-mono text-navy-900">{ZELLE_PHONE}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-navy-700/70">{t('give.zelle.note')}</span>
                <span className="font-mono text-navy-900">{t('give.zelle.noteValue')}</span>
              </div>
            </div>
            <div className="mt-6 flex flex-col items-center">
              <div className="bg-white p-3 border border-navy-900/10">
                <QRCodeCanvas value={ZELLE_QR_VALUE} size={140} level="M" includeMargin={false} />
              </div>
              <p className="mt-3 text-xs text-navy-700/70 text-center">{t('give.zelle.scanQR')}</p>
            </div>
          </motion.div>
        </div>
      </Section>

      <Section variant="navy" padding="md">
        <div className="text-center max-w-2xl mx-auto">
          <i className="fas fa-heart text-tan-500 text-2xl" />
          <p className="mt-4 font-display text-xl md:text-2xl">{t('give.thankYou')}</p>
          <p className="mt-3 text-sm text-white/70">{t('give.taxDeductible')}</p>
        </div>
      </Section>
    </div>
  );
};

export default Give;
