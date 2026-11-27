import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Objective | ஊரும் உறவும்',
  description: 'ஊரும் உறவும்-ன் நோக்கங்கள் மற்றும் நோக்கம்',
  alternates: {
    canonical: '/objective',
  },
};

const objectives = [
  {
    num: '01',
    title: 'Digital Historical Archiving',
    desc: 'Digitizing rare manuscripts, documentaries, and historical accounts for public educational access.',
  },
  {
    num: '02',
    title: 'Cultural & Obituary Networking',
    desc: 'Connecting Tamil diaspora through community services, announcements, and remembrance portals.',
  },
];

export default function ObjectivePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Breadcrumb items={[
        { label: 'முகப்பு', href: '/' },
        { label: 'Objective' },
      ]} />
      <h1 className="text-3xl font-bold mb-6">Objective</h1>
      <div className="space-y-8">
        {objectives.map((o) => (
          <div key={o.num} className="flex gap-5">
            <span className="shrink-0 text-3xl font-extrabold text-accent-red/80 leading-none pt-1">
              {o.num}
            </span>
            <div>
              <h2 className="text-xl font-bold mb-2">{o.title}</h2>
              <p className="text-foreground/70 leading-relaxed">{o.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
