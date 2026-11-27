import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Privacy Policy | ஊரும் உறவும்',
  description: 'Oorum Uravum privacy policy — how we collect, use, and protect your information',
  alternates: {
    canonical: '/privacy',
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

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Breadcrumb items={[
        { label: 'முகப்பு', href: '/' },
        { label: 'Privacy Policy' },
      ]} />
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-foreground/50 mb-6">Last updated: November 2025</p>

      {/* ─── English ─── */}
      <div className="prose prose-lg max-w-none">
        <p>
          Oorum Uravum (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the platform&rdquo;) respects your privacy.
          This policy explains what information we collect when you use oorumuravum.com,
          how we use it, and the choices you have.
        </p>

        <Section title="1. Information We Collect">
          <p><strong>Account information.</strong> When you register or sign in, we collect your name, email address,
          and — if you provide it in your profile — phone number, address, and avatar photo.
          If you sign in with Google, we receive your name, email, and profile picture from Google.</p>
          <p><strong>Content you submit.</strong> Comments you post on articles (display name and comment text)
          and obituaries you submit (the deceased person&rsquo;s name, life details, tribute text, and photo,
          plus your name and email as the submitter).</p>
          <p><strong>Usage data.</strong> We record basic visit information such as pages viewed,
          browser type, and approximate activity through our own visitor statistics and Google Analytics.</p>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="list-disc pl-6 space-y-1">
            <li>To create and manage your account and keep you signed in</li>
            <li>To publish your comments and obituary submissions after review</li>
            <li>To display your profile activity (your comments and submitted obituaries) on your profile page</li>
            <li>To send account-related emails such as verification codes</li>
            <li>To understand how the site is used and improve it</li>
          </ul>
        </Section>

        <Section title="3. Comments and Obituaries">
          <p>Posting comments and submitting obituaries <strong>requires an account</strong>.
          Your display name comes from your registered profile — you cannot post anonymously.</p>
          <p>All comments and obituary submissions are reviewed by our team before they appear publicly.
          Submissions that are inappropriate, defamatory, or off-topic may be rejected or removed.</p>
          <p>Obituary notices are a community service. Please submit only truthful information about the deceased
          and ensure you have the right to share the details and photo provided.</p>
        </Section>

        <Section title="4. Cookies and Local Storage">
          <p>We use browser local storage to keep you signed in (your session token) and to remember
          preferences such as your theme choice. These stay on your device and are not shared with
          advertisers. You can clear them at any time through your browser settings, though you will
          need to sign in again.</p>
        </Section>

        <Section title="5. Third-Party Services">
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Google:</strong> If you choose &ldquo;Sign in with Google&rdquo;, Google handles the
              authentication and shares your basic profile (name, email, picture) with us, subject to
              Google&rsquo;s own privacy policy.</li>
            <li><strong>Google Analytics:</strong> We use it to measure site traffic. It sets cookies and
              collects usage data as described in Google&rsquo;s privacy policy.</li>
            <li><strong>YouTube:</strong> Video pages may embed YouTube players; YouTube may set cookies
              and collect data under its own policy when videos load.</li>
          </ul>
        </Section>

        <Section title="6. Data Security and Retention">
          <p>We use reasonable technical measures — including encrypted connections (HTTPS), hashed passwords,
          and access controls — to protect your information. No method of transmission or storage is
          completely secure, however.</p>
          <p>We keep your account data while your account is active. Comments and obituaries remain published
          as part of the community archive unless removed. You may request deletion of your account and
          associated personal data by contacting us.</p>
        </Section>

        <Section title="7. Your Rights and Choices">
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>View and edit:</strong> You can view and update your name, phone, and address anytime on your profile page.</li>
            <li><strong>Comments and obituaries:</strong> Your activity is listed on your profile page.</li>
            <li><strong>Deletion:</strong> Contact us to request account deletion or removal of specific content.</li>
            <li><strong>Analytics opt-out:</strong> You can block or delete Google Analytics cookies via your browser or a browser extension.</li>
          </ul>
        </Section>

        <Section title="8. Children&rsquo;s Privacy">
          <p>The platform is not directed at children under 13, and we do not knowingly collect personal
          information from them. If you believe a child has provided us information, please contact us.</p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>We may update this policy from time to time. Changes will be posted on this page with a revised
          date. Continued use of the site after changes means you accept the updated policy.</p>
        </Section>

        <Section title="10. Contact Us">
          <p>Questions about this policy or your data? Reach us through the <a href="/contact" className="text-accent-red hover:underline">Contact page</a>.</p>
        </Section>
      </div>

      {/* ─── Tamil ─── */}
      <div className="mt-14 border-t border-foreground/10 pt-8">
        <h2 className="text-2xl font-bold mb-2">தனியுரிமைக் கொள்கை</h2>
        <p className="text-sm text-foreground/50 mb-6">கடைசியாக புதுப்பிக்கப்பட்டது: நவம்பர் 2025</p>
        <div className="prose prose-lg max-w-none">
          <p>
            ஊரும் உறவும் உங்கள் தனியுரிமையை மதிக்கிறது. oorumuravum.com-ஐப்
            பயன்படுத்தும்போது நாங்கள் என்ன தகவல்களைச் சேகரிக்கிறோம், அவற்றை எப்படிப்
            பயன்படுத்துகிறோம், உங்களிடம் உள்ள தேர்வுகள் என்ன என்பதை இந்தக் கொள்கை விளக்குகிறது.
          </p>

          <Section title="1. நாங்கள் சேகரிக்கும் தகவல்கள்">
            <p><strong>கணக்கு தகவல்.</strong> நீங்கள் பதிவு செய்யும்போது அல்லது உள்நுழையும்போது,
            உங்கள் பெயர், மின்னஞ்சல் முகவரி, மற்றும் சுயவிவரத்தில் அளித்தால் தொலைபேசி எண்,
            முகவரி, சுயவிவரப் படம் ஆகியவை சேகரிக்கப்படும். Google-உடன் உள்நுழைந்தால்,
            உங்கள் பெயர், மின்னஞ்சல், சுயவிவரப் படம் ஆகியவை Google-இலிருந்து பெறப்படும்.</p>
            <p><strong>நீங்கள் சமர்ப்பிக்கும் உள்ளடக்கம்.</strong> கட்டுரைகளில் இடும் கருத்துகள்
            (காட்டப்படும் பெயர் மற்றும் கருத்து உரை) மற்றும் சமர்ப்பிக்கும் இரங்கல் அறிவிப்புகள்
            (இறந்தவரின் பெயர், வாழ்க்கை விவரங்கள், அஞ்சலி உரை, படம், மேலும் சமர்ப்பிப்பவரின்
            பெயர் மற்றும் மின்னஞ்சல்).</p>
            <p><strong>பயன்பாட்டு தரவு.</strong> பார்வையிட்ட பக்கங்கள், உலாவி வகை போன்ற
            அடிப்படை தகவல்கள் எங்கள் பார்வையாளர் புள்ளிவிவரங்கள் மற்றும் Google Analytics மூலம் சேகரிக்கப்படும்.</p>
          </Section>

          <Section title="2. உங்கள் தகவலை நாங்கள் எப்படிப் பயன்படுத்துகிறோம்">
            <ul className="list-disc pl-6 space-y-1">
              <li>உங்கள் கணக்கை உருவாக்கி நிர்வகிக்க, உங்களை உள்நுழைந்த நிலையில் வைத்திருக்க</li>
              <li>மதிப்பாய்வுக்குப் பிறகு உங்கள் கருத்துகள் மற்றும் இரங்கல் அறிவிப்புகளை வெளியிட</li>
              <li>உங்கள் சுயவிவரப் பக்கத்தில் உங்கள் கருத்துகள் மற்றும் சமர்ப்பித்த இரங்கல்களைக் காட்ட</li>
              <li>சரிபார்ப்புக் குறியீடு போன்ற கணக்கு தொடர்பான மின்னஞ்சல்களை அனுப்ப</li>
              <li>தளத்தின் பயன்பாட்டைப் புரிந்துகொண்டு மேம்படுத்த</li>
            </ul>
          </Section>

          <Section title="3. கருத்துகள் மற்றும் இரங்கல்கள்">
            <p>கருத்து இடுவதற்கும் இரங்கல் சமர்ப்பிப்பதற்கும் <strong>கணக்கு தேவை</strong>.
            காட்டப்படும் பெயர் உங்கள் பதிவு செய்யப்பட்ட சுயவிவரத்திலிருந்து வருகிறது — அநாமதேயமாக
            இட முடியாது.</p>
            <p>அனைத்து கருத்துகளும் மற்றும் இரங்கல் சமர்ப்பிப்புகளும் வெளியிடும் முன் எங்கள் குழுவால்
            மதிப்பாய்வு செய்யப்படுகின்றன. பொருத்தமற்ற, அவதூறான அல்லது பொருந்தாத சமர்ப்பிப்புகள்
            நிராகரிக்கப்படலாம் அல்லது நீக்கப்படலாம்.</p>
            <p>இரங்கல் அறிவிப்புகள் ஒரு சமூக சேவை. இறந்தவர் பற்றிய தகவல்கள் மற்றும் வழங்கும்
            படம் பற்றிய உரிமை உங்களிடம் இருப்பதை உறுதி செய்யவும்.</p>
          </Section>

          <Section title="4. குக்கீகள் மற்றும் லோக்கல் ஸ்டோரேஜ்">
            <p>உங்களை உள்நுழைந்த நிலையில் வைத்திருக்க (உங்கள் அமர்வு டோக்கன்) மற்றும்
            தீம் விருப்பம் போன்றவற்றை நினைவில் கொள்ள எங்கள் உலாவியின் லோக்கல் ஸ்டோரேஜைப்
            பயன்படுத்துகிறோம். இவை உங்கள் சாதனத்திலேயே இருக்கும்; விளம்பரதாரர்களுடன் பகிரப்படாது.
            உலாவி அமைப்புகள் மூலம் எப்போது வேண்டுமானாலும் அழிக்கலாம் — அப்போது மீண்டும் உள்நுழைய வேண்டும்.</p>
          </Section>

          <Section title="5. மூன்றாம் தரப்பு சேவைகள்">
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Google:</strong> நீங்கள் &ldquo;Google-உடன் உள்நுழை&rdquo; என்பதைத் தேர்ந்தால், அங்கீகாரத்தை
                Google கையாளுகிறது; Google தனது சொந்த தனியுரிமைக் கொள்கையின் படி
                உங்கள் அடிப்படை சுயவிவரத்தை (பெயர், மின்னஞ்சல், படம்) எங்களுடன் பகிர்கிறது.</li>
              <li><strong>Google Analytics:</strong> தளத்தின் பார்வையாளர் போக்கை அளவிட நாங்கள் இதைப் பயன்படுத்துகிறோம்.
                இது குக்கீகளை அமைத்து, Google தனியுரிமைக் கொள்கையில் விவரிக்கப்பட்டுள்ளபடி
                பயன்பாட்டு தரவைச் சேகரிக்கிறது.</li>
              <li><strong>YouTube:</strong> வீடியோ பக்கங்களில் YouTube பிளேயர்கள் உட்பொதியப்படலாம்; வீடியோக்கள்
                ஏற்றும்போது YouTube அதன் சொந்த கொள்கையின் படி குக்கீகளை அமைத்து தரவுகளைச் சேகரிக்கலாம்.</li>
            </ul>
          </Section>

          <Section title="6. தரவு பாதுகாப்பு மற்றும் தக்கவைத்தல்">
            <p>உங்கள் தகவலைப் பாதுகாக்க நாங்கள் நியாயமான தொழில்நுட்ப நடவடிக்கைகளை — குறியாக்கப்பட்ட
            இணைப்புகள் (HTTPS), கடவுச்சொல் ஹேஷிங், அணுகல் கட்டுப்பாடுகள் உட்பட — பயன்படுத்துகிறோம்.
            எந்தப் பரிமாற்றம் அல்லது சேமிப்பு முறையும் முற்றிலும் பாதுகாப்பானது அல்ல.</p>
            <p>உங்கள் கணக்கு செயலில் உள்ள வரை உங்கள் கணக்கு தரவை வைத்திருக்கிறோம். கருத்துகள் மற்றும்
            இரங்கல்கள் சமூக காப்பகத்தின் ஒரு பகுதியாக வெளியிடப்பட்ட நிலையில் இருக்கும், நீக்கப்படும்
            வரை. உங்கள் கணக்கு மற்றும் தொடர்புடைய தனிப்பட்ட தரவின் நீக்கத்தைக் கோரி எங்களைத் தொடர்பு கொள்ளலாம்.</p>
          </Section>

          <Section title="7. உங்கள் உரிமைகள் மற்றும் தேர்வுகள்">
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>காண்பதும் திருத்துவதும்:</strong> உங்கள் சுயவிவரப் பக்கத்தில் எப்போது வேண்டுமானாலும்
                உங்கள் பெயர், தொலைபேசி, முகவரியைப் பார்க்கவும் புதுப்பிக்கவும் முடியும்.</li>
              <li><strong>கருத்துகள் மற்றும் இரங்கல்கள்:</strong> உங்கள் செயல்பாடு உங்கள் சுயவிவரப் பக்கத்தில் பட்டியலிடப்படுகிறது.</li>
              <li><strong>நீக்கம்:</strong> கணக்கு நீக்கம் அல்லது குறிப்பிட்ட உள்ளடக்க நீக்கத்தைக் கோர எங்களைத் தொடர்பு கொள்ளவும்.</li>
              <li><strong>பகுப்பாய்வு நிராகரிப்பு:</strong> உங்கள் உலாவி அல்லது நீட்டிப்பு மூலம் Google Analytics குக்கீகளைத் தடுக்கலாம் அல்லது நீக்கலாம்.</li>
            </ul>
          </Section>

          <Section title="8. குழந்தைகளின் தனியுரிமை">
            <p>இந்தத் தளம் 13 வயதுக்குக் குறைந்த குழந்தைகளை நோக்கி இல்லை; அவர்களிடமிருந்து
            தெரியாமல் தனிப்பட்ட தகவலைச் சேகரிக்க மாட்டோம். குழந்தை எங்களைத் தகவல் வழங்கியதாக
            நினைத்தால், எங்களைத் தொடர்பு கொள்ளவும்.</p>
          </Section>

          <Section title="9. இந்தக் கொள்கையில் மாற்றங்கள்">
            <p>நாங்கள் அவ்வப்போது இந்தக் கொள்கையைப் புதுப்பிக்கலாம். மாற்றங்கள் திருத்தப்பட்ட தேதியுடன்
            இந்தப் பக்கத்தில் இடப்படும். மாற்றங்களுக்குப் பிறகு தளத்தைத் தொடர்ந்து பயன்படுத்துவது
            புதுப்பிக்கப்பட்ட கொள்கையை ஏற்றுக்கொள்வதாகும்.</p>
          </Section>

          <Section title="10. எங்களைத் தொடர்பு கொள்ளவும்">
            <p>இந்தக் கொள்கை அல்லது உங்கள் தரவு பற்றி கேள்விகள் உள்ளனவா? <a href="/contact" className="text-accent-red hover:underline">தொடர்பு பக்கம்</a> மூலம் எங்களை அடையவும்.</p>
          </Section>
        </div>
      </div>
    </main>
  );
}
