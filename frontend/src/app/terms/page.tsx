import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';

export const metadata: Metadata = {
  title: 'Terms of Service | ஊரும் உறவும்',
  description: 'Oorum Uravum terms of service — rules for using the platform',
  alternates: {
    canonical: '/terms',
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-3 border-b border-foreground/10 pb-2">{title}</h2>
      <div className="space-y-3 text-foreground/75 leading-relaxed">{children}</div>
    </section>
  );
}

const TAMIL_SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. விதிமுறைகளின் ஏற்றுக்கொள்ளல்',
    body: (
      <p>
        இந்த விதிமுறைகள் வலைத்தளம், அதன் கட்டுரைகள், வீடியோக்கள், இரங்கல் அறிவிப்புகள்,
        கருத்துகள் மற்றும் தொடர்புடைய அனைத்து சேவைகளுக்கும் பொருந்தும். நாங்கள் அவ்வப்போது
        இவற்றைப் புதுப்பிக்கலாம்; மாற்றங்களுக்குப் பிறகு தொடர்ந்து பயன்படுத்துவது ஒப்புதலாகும்.
      </p>
    ),
  },
  {
    title: '2. பயனர் கணக்குகள்',
    body: (
      <>
        <p>
          கணக்கு உருவாக்கும்போது துல்லியமான தகவல் வழங்க வேண்டும்; உங்கள் உள்நுழைவு விவரங்களை
          ரகசியமாக வைத்திருக்கவும். உங்கள் கணக்கின் கீழ் நடக்கும் அனைத்திற்கும் நீங்கள் பொறுப்பு.
          செயலற்ற, போலி அல்லது துஷ்பிரயோக கணக்குகள் இடைநிறுத்தப்படலாம்.
        </p>
        <p>
          கருத்து இடுவதற்கும் இரங்கல் சமர்ப்பிப்பதற்கும் <strong>பதிவு செய்யப்பட்ட கணக்கு தேவை</strong>.
          கணக்கு உருவாக்க குறைந்தது 13 வயது இருக்க வேண்டும்.
        </p>
      </>
    ),
  },
  {
    title: '3. ஏற்றுக்கொள்ளக்கூடிய பயன்பாடு',
    body: (
      <>
        <p>நீங்கள் பின்வருவற்றைச் செய்யக் கூடாது:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>சட்டவிரோதமான, அவதூறான, ஆபாசமான அல்லது துன்புறுத்தும் உள்ளடக்கம் இடுவது</li>
          <li>தவறான அல்லது சரிபார்க்கப்படாத இரங்கல் தகவல்களைச் சமர்ப்பிப்பது</li>
          <li>மற்றொருவரின் அடையாளத்தைப் பயன்படுத்துவது அல்லது போலி செய்வது</li>
          <li>ஸ்பேம், விளம்பரங்கள் அல்லது வேண்டாத மொத்த உள்ளடக்கம் இடுவது</li>
          <li>தளத்தை அல்லது அதன் அமைப்புகளை சீர்குலைக்க முயற்சிப்பது</li>
          <li>அனுமதியின்றி தள உள்ளடக்கத்தை நகலெடுப்பது</li>
          <li>எங்கள் எழுத்து ஒப்புதலின்றி வணிக நோக்கங்களுக்காகப் பயன்படுத்துவது</li>
        </ul>
      </>
    ),
  },
  {
    title: '4. உள்ளடக்கம் மற்றும் அறிவுசார் சொத்து',
    body: (
      <>
        <p>
          தளத்தின் கட்டுரைகள், வீடியோக்கள், படங்கள் மற்றும் தலையங்க உள்ளடக்கம் ஊரும் உறவுக்குச்
          சொந்தமானது; பதிப்புரிமையால் பாதுகாக்கப்படுகிறது. எழுத்து அனுமதி இல்லாமல், தனிப்பட்ட
          மற்றும் வருவாய் சாராத பயன்பாட்டைத் தாண்டி நகலெடுக்கவோ மாற்றியமைக்கவோ முடியாது.
        </p>
        <p>
          நீங்கள் சமர்ப்பிக்கும் உள்ளடக்கம் (கருத்துகள், இரங்கல்கள், சுயவிவரத் தகவல்) உங்களுடையது.
          அதைச் சமர்ப்பிப்பதன் மூலம், அதை ஹோஸ்ட் செய்ய, காட்ட, சமூக காப்பகத்தில் விநியோகிக்க
          எங்களுக்கு உலகளாவிய, ராயல்டி-இலவச உரிமத்தை வழங்குகிறீர்கள்.
        </p>
        <p>உங்கள் உள்ளடக்கத்தை நீக்கக் கோர எங்களைத் தொடர்பு கொள்ளலாம்.</p>
      </>
    ),
  },
  {
    title: '5. இரங்கல் சமர்ப்பிப்புகள்',
    body: (
      <p>
        இரங்கல் அறிவிப்புகள் சமூக சேவையாக வெளியிடப்படுகின்றன. சமர்ப்பிப்பவர் எல்லா தகவல்களின்
        துல்லியம் மற்றும் இறந்தவரின் விவரங்கள், புகைப்படத்தைப் பகிர்வதற்கான உரிமை உள்ளதை உறுதி
        செய்ய வேண்டும். வெளியிடும் முன் அனைத்து சமர்ப்பிப்புகளும் மதிப்பாய்வு செய்யப்படுகின்றன.
      </p>
    ),
  },
  {
    title: '6. மதிப்பாய்வு',
    body: (
      <p>
        அனைத்து கருத்துகளும் மற்றும் இரங்கல் சமர்ப்பிப்புகளும் பொதுவில் தோன்றும் முன் மதிப்பாய்வு
        செய்யப்படுகின்றன. விதிகளை மீறும் அல்லது சமூகத்தைக் காயப்படுத்தும் உள்ளடக்கத்தை எங்கள்
        விருப்பத்தின்படி நீக்கலாம். மீண்டும் மீண்டும் மீறுவது கணக்கு இடைநிறுத்தத்திற்குக் வழிவகுக்கும்.
      </p>
    ),
  },
  {
    title: '7. உத்தரவாதங்களின் மறுப்பு',
    body: (
      <p>
        சேவை “உள்ளபடியே” வழங்கப்படுகிறது; தொடர்ச்சியான அல்லது பிழையற்ற செயல்பாட்டை நாங்கள்
        உறுதி செய்யவில்லை, மேலும் பயனர் சமர்ப்பித்த உள்ளடக்கத்தின் துல்லியத்திற்கும்
        பொறுப்பல்ல.
      </p>
    ),
  },
  {
    title: '8. பொறுப்பு வரம்பு',
    body: (
      <p>
        சட்டத்தால் அனுமதிக்கப்பட்ட அதிகபட்ச அளவிற்கு, Oorum Uravum உங்கள் சேவையின் பயன்பாட்டிலிருந்து
        எழும் எந்த மறைமுக, எதிர்பாராத, சிறப்பு அல்லது விளைவு சேதங்களுக்கும், தரவு இழப்பு அல்லது
        பயனர் சமர்ப்பித்த உள்ளடக்கத்தை நம்பியிருப்பது உட்பட, பொறுப்பல்ல.
      </p>
    ),
  },
  {
    title: '9. மூன்றாம் தரப்பு உள்ளடக்கம் மற்றும் இணைப்புகள்',
    body: (
      <p>
        சேவையில் YouTube போன்ற மூன்றாம் தரப்பு தளங்களுக்கான இணைப்புகள் அல்லது உட்பொதியங்கள்
        இருக்கலாம். அந்த மூன்றாம் தரப்பினரின் உள்ளடக்கம், கொள்கைகள் அல்லது நடைமுறைகளுக்கு
        நாங்கள் பொறுப்பல்ல.
      </p>
    ),
  },
  {
    title: '10. முடிவுபடுத்துதல்',
    body: (
      <p>
        இந்த விதிமுறைகளின் மீறல்களுக்காக அல்லது எங்கள் விருப்பத்தின்படி எப்போது வேண்டுமானாலும்
        உங்கள் அணுகலை இடைநிறுத்தவோ முடிக்கவோ எங்களால் முடியும். முடிவுக்குப் பிறகு, சேவையைப்
        பயன்படுத்தும் உங்கள் உரிமை உடனே முடிவுக்கு வரும்.
      </p>
    ),
  },
  {
    title: '11. ஆளும் சட்டம்',
    body: (
      <p>
        இந்த விதிமுறைகள் இலங்கை சட்டத்தின் படி, சட்ட மோதல் கொள்கைகளைக் கருதாமல், ஆளப்படுகிறது.
      </p>
    ),
  },
  {
    title: '12. மாற்றங்கள் மற்றும் தொடர்பு',
    body: (
      <p>
        நாங்கள் எப்போது வேண்டுமானாலும் இந்த விதிமுறைகளைத் திருத்தலாம்; புதுப்பிக்கப்பட்ட பதிப்பு
        இந்தப் பக்கத்தில் இடப்படும். கேள்விகள் உள்ளனவா?{' '}
        <a href="/contact" className="text-accent-red hover:underline">தொடர்பு பக்கம்</a> மூலம் எங்களை அடையவும்.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Breadcrumb items={[
        { label: 'முகப்பு', href: '/' },
        { label: 'Terms of Service' },
      ]} />
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-foreground/50 mb-6">Last updated: November 2025</p>

      {/* ─── English ─── */}
      <div className="prose prose-lg max-w-none">
        <p>
          Welcome to Oorum Uravum. By accessing or using oorumuravum.com, you agree to be bound by
          these Terms of Service. If you do not agree, please do not use the platform.
        </p>

        <Section title="1. Acceptance of Terms">
          <p>These terms govern your use of the website, its articles, videos, obituary notices,
          comments, and all related services (the &ldquo;Service&rdquo;). We may update these terms
          from time to time; continued use after changes constitutes acceptance.</p>
        </Section>

        <Section title="2. User Accounts">
          <p>You must provide accurate information when creating an account and keep your credentials
          confidential. You are responsible for all activity under your account. Accounts that are
          inactive, fake, or used abusively may be suspended or terminated.</p>
          <p>Posting comments and submitting obituaries <strong>requires a registered account</strong>.
          You must be at least 13 years old to create an account.</p>
        </Section>

        <Section title="3. Acceptable Use">
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Post content that is unlawful, defamatory, obscene, hateful, or harassing</li>
            <li>Submit false, misleading, or unverified obituary information</li>
            <li>Impersonate another person or misrepresent your identity</li>
            <li>Post spam, advertisements, or bulk unsolicited content</li>
            <li>Attempt to disrupt, probe, or gain unauthorized access to the platform or its systems</li>
            <li>Scrape or systematically copy site content without permission</li>
            <li>Use the platform for any commercial purpose without our written consent</li>
          </ul>
        </Section>

        <Section title="4. Content and Intellectual Property">
          <p>Articles, videos, images, and other editorial content on the platform are owned by
          Oorum Uravum or its licensors and are protected by copyright. You may not reproduce,
          redistribute, or create derivative works without written permission, except for personal,
          non-commercial use with attribution.</p>
          <p>Content you submit (comments, obituary submissions, profile information) remains yours.
          By submitting it, you grant us a non-exclusive, worldwide, royalty-free license to host,
          display, and distribute it as part of the Service, including in the community archive.</p>
          <p>You retain the right to request removal of your content by contacting us.</p>
        </Section>

        <Section title="5. Obituary Submissions">
          <p>Obituary notices are published as a community service. Submitters are responsible for the
          accuracy and truthfulness of all information and for having the right to share the deceased
          person&rsquo;s details and photograph. We review all submissions before publication and may
          reject, edit, or remove submissions that do not meet these standards. Submitting an obituary
          does not create any obligation on our part beyond good-faith publication.</p>
        </Section>

        <Section title="6. Moderation">
          <p>All comments and obituary submissions are reviewed before appearing publicly.
          We may remove content that violates these terms, is off-topic, or harms the community,
          at our discretion. Repeated violations may result in account suspension.</p>
        </Section>

        <Section title="7. Disclaimer of Warranties">
          <p>The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind,
          express or implied. We do not guarantee uninterrupted or error-free operation, and we
          are not responsible for the accuracy of user-submitted content.</p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>To the maximum extent permitted by law, Oorum Uravum shall not be liable for any
          indirect, incidental, special, or consequential damages arising from your use of the
          Service, including loss of data or reliance on user-submitted content.</p>
        </Section>

        <Section title="9. Third-Party Content and Links">
          <p>The Service may contain links to or embeds from third-party sites such as YouTube.
          We are not responsible for the content, policies, or practices of those third parties.</p>
        </Section>

        <Section title="10. Termination">
          <p>We may suspend or terminate your access at any time for violations of these terms or
          for any reason at our discretion. Upon termination, your right to use the Service ends
          immediately; provisions that by nature should survive (such as intellectual property and
          liability) will remain in effect.</p>
        </Section>

        <Section title="11. Governing Law">
          <p>These terms are governed by the laws applicable in Sri Lanka, without regard to
          conflict-of-law principles.</p>
        </Section>

        <Section title="12. Changes and Contact">
          <p>We may revise these terms at any time; the updated version will be posted on this page.
          Questions? Reach us through the <a href="/contact" className="text-accent-red hover:underline">Contact page</a>.</p>
        </Section>
      </div>

      {/* ─── Tamil ─── */}
      <div className="mt-14 border-t border-foreground/10 pt-8">
        <h2 className="text-2xl font-bold mb-2">பயன்பாட்டு விதிமுறைகள்</h2>
        <p className="text-sm text-foreground/50 mb-6">கடைசியாக புதுப்பிக்கப்பட்டது: நவம்பர் 2025</p>
        <div className="prose prose-lg max-w-none">
          <p>
            ஊரும் உறவுக்கு வரவேற்கிறோம். oorumuravum.com-ஐ அணுகுவதன் மூலம் அல்லது பயன்படுத்துவதன்
            மூலம், நீங்கள் இந்தப் பயன்பாட்டு விதிமுறைகளுக்கு உட்பட ஒப்புக்கொள்கிறீர்கள்.
            நீங்கள் ஒப்புக்கொள்ளவில்லை என்றால், தயவுசெய்து இந்தத் தளத்தைப் பயன்படுத்த வேண்டாம்.
          </p>
          {TAMIL_SECTIONS.map((s) => (
            <Section key={s.title} title={s.title}>{s.body}</Section>
          ))}
        </div>
      </div>
    </main>
  );
}
