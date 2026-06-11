import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import ContactPageClient from '@/components/contact-page-client';
import { normalizeSiteLanguage, SITE_LANGUAGE_COOKIE } from '@/lib/site-language';
import { SITE_URL } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with András Dénes for inquiries about yellow sketches, fine art prints, or collaborations. Email and Instagram contact available.',
  openGraph: {
    title: 'Contact | Yellowsky',
    description: 'Get in touch for inquiries about prints or collaborations.',
    url: `${SITE_URL}/contact`,
    type: 'website',
  },
};

export default async function ContactPage() {
  const cookieStore = await cookies();
  const initialLanguage = normalizeSiteLanguage(
    cookieStore.get(SITE_LANGUAGE_COOKIE)?.value,
  );

  return <ContactPageClient initialLanguage={initialLanguage} />;
}