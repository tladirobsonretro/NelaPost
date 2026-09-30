import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service | NelaPost',
  description: 'Terms governing the use of NelaPost.'
}

export default function TermsPage() {
  return (
    <main className="legalPage">
      <div className="legalWrap">
        <Link href="/" className="legalBack">← Back to NelaPost</Link>
        <div className="legalBrand">NELAPOST</div>
        <h1>Terms of Service</h1>
        <p className="legalLead">These Terms of Service govern your use of NelaPost, a social publishing tool that helps you create, schedule and publish content to connected third-party platforms.</p>
        <p className="legalUpdated">Effective date: 30 September 2026</p>

        <section><h2>1. Using NelaPost</h2><p>By using NelaPost, you agree to these Terms. You must be legally able to enter into this agreement. If you use NelaPost on behalf of a business or organisation, you confirm that you have authority to bind that organisation to these Terms.</p></section>
        <section><h2>2. What NelaPost does</h2><p>NelaPost provides tools for creating, scheduling and publishing social-media content. Features depend on the third-party platforms you connect and the permissions you grant. NelaPost does not guarantee that every platform, account type, feature or publishing format will always be available.</p></section>
        <section><h2>3. Connected accounts and authorization</h2><p>When you connect a social-media account, you authorize NelaPost to use the permissions you approve through that platform's authorization process. You are responsible for ensuring that you have the right to connect and manage the account or Page. You can revoke access through the relevant third-party platform or by disconnecting the account where that option is available in NelaPost.</p></section>
        <section><h2>4. Your content</h2><p>You retain responsibility for the text, images, videos, links and other material you submit or publish through NelaPost. You must have the rights and permissions needed to use and publish that content. You must not use NelaPost to publish unlawful, infringing, fraudulent or otherwise prohibited material.</p></section>
        <section><h2>5. Third-party platforms</h2><p>NelaPost relies on third-party services including social-media platforms and their APIs. Those services have their own terms, policies, privacy practices and availability. Changes made by a third-party platform may affect NelaPost features, permissions or publishing. Your use of those platforms remains subject to their terms and policies.</p></section>
        <section><h2>6. Publishing and scheduling</h2><p>Scheduled publishing is not a guarantee of delivery at an exact time. Publishing may be delayed, rejected or unavailable because of platform restrictions, API limits, account permissions, outages, content rules or technical problems. You are responsible for checking important posts on the destination platform.</p></section>
        <section><h2>7. Acceptable use</h2><p>You may not use NelaPost to interfere with the service, bypass security or access controls, abuse third-party APIs, impersonate another person or organisation, distribute malware, or violate applicable law or third-party platform rules.</p></section>
        <section><h2>8. Service availability</h2><p>NelaPost is provided on an evolving basis. We may add, change, suspend or discontinue features. We may also limit or suspend access where reasonably necessary to protect the service, users or third-party integrations.</p></section>
        <section><h2>9. Intellectual property</h2><p>NelaPost's software, branding, interface and original materials are owned by or licensed to NelaPost and are protected by applicable intellectual-property laws. These Terms do not transfer ownership of NelaPost's intellectual property to you. Your rights in your own content remain yours.</p></section>
        <section><h2>10. Privacy</h2><p>Your use of NelaPost is also subject to our Privacy Policy. Where NelaPost receives information through a connected platform, we use that information only as needed to provide the connected functionality and operate the service, subject to applicable law and the permissions you grant.</p></section>
        <section><h2>11. Disclaimer</h2><p>To the extent permitted by law, NelaPost is provided on an “as available” basis. We do not promise uninterrupted service, error-free operation or successful publication to every connected platform.</p></section>
        <section><h2>12. Limitation of liability</h2><p>To the extent permitted by applicable law, NelaPost will not be liable for indirect, incidental, special or consequential loss arising from your use of the service, including losses resulting from third-party platform outages, account restrictions or unsuccessful publication.</p></section>
        <section><h2>13. Changes to these Terms</h2><p>We may update these Terms as NelaPost develops or as legal or platform requirements change. The updated version will be posted on this page with a revised effective date. Continued use of NelaPost after an update means you accept the updated Terms.</p></section>
        <section><h2>14. Governing law</h2><p>These Terms are governed by the laws of the Republic of South Africa, unless applicable law requires otherwise.</p></section>
        <section><h2>15. Contact</h2><p>For questions about these Terms or NelaPost, use the support or contact method made available within the NelaPost service.</p></section>

        <footer className="legalFooter"><Link href="/">NelaPost</Link><span>·</span><Link href="/terms">Terms of Service</Link></footer>
      </div>
    </main>
  )
}
