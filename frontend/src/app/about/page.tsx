import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';

export const metadata: Metadata = {
  title: 'எங்களைப் பற்றி | ஊரும் உறவும்',
  description: 'ஊரும் உறவும் தமிழ் செய்தி தளம் பற்றிய தகவல்கள்',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Breadcrumb items={[
        { label: 'முகப்பு', href: '/' },
        { label: 'எங்களைப் பற்றி' },
      ]} />
      <h1 className="text-3xl font-bold mb-6">Fostering Unity &amp; Preserving Tamil Heritage</h1>
      <div className="prose prose-lg max-w-none">
        <p>
          &ldquo;Oorum Uravum&rdquo; aims to serve as a comprehensive global bridge
          connecting Tamil people across geographic borders, archiving historical
          knowledge, publishing community obituaries, and maintaining cultural
          continuity for future generations.
        </p>
      </div>
    </main>
  );
}
