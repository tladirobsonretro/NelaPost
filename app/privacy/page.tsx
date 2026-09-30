import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | NelaPost',
  description: 'Privacy Policy for NelaPost.'
}

export default function PrivacyPage() {
  return (
    <main className="legalPage">
      <div className="legalWrap">
        <Link href="/" className="legalBack">← Back to NelaPost</Link>
        <div className="legalBrand">NELAPOST</div>
        <h1>Privacy Policy</h1>
        <p className="legalLead">This Privacy Policy explains how NelaPost collects, uses, stores and protects information when you use our social publishing service.</p>
        <p className="legalUpdated">Effective date: 30 September 2026</p>

        <section><h2>1. Information we collect</h2><p>NelaPost may collect information you provide when you use the service, including your email address or other account information, content you create or submit, and information needed to operate your account and connected-platform features.</p></section>
        <section><h2>2. Connected social accounts</h2><p>When you connect a social-media account through OAuth, NelaPost may receive information provided by that platform, such as the connected account identifier, account name or username, access tokens and refresh tokens, and information required to publish content on your behalf. The exact information available depends on the platform and permissions you authorize.</p></section>
        <section><h2>3. How we use information</h2><p>We use information to authenticate users, connect and manage authorized social accounts, create and schedule posts, publish content at your request, maintain the service, troubleshoot technical problems, protect the service and comply with applicable legal obligations.</p></section>
        <section><h2>4. Social-platform data</h2><p>NelaPost uses data received from connected platforms only as needed to provide the functionality you request and operate the service. We do not sell or resell social-platform data. We do not use connected-platform data for advertising, profiling or training artificial-intelligence models.</p></section>
        <section><h2>5. Your content</h2><p>Content you create or upload remains yours. NelaPost processes that content so that you can create, schedule and publish posts through the connected platforms you authorize. You are responsible for ensuring that you have the necessary rights to use and publish your content.</p></section>
        <section><h2>6. Cookies and similar technologies</h2><p>NelaPost may use cookies or similar browser storage to maintain sessions, protect OAuth flows and support essential service functionality. These technologies are used for operating the service rather than for selling personal information.</p></section>
        <section><h2>7. Third-party services</h2><p>NelaPost relies on third-party infrastructure and platform APIs to operate its service. This may include hosting, database, authentication and social-media services. Information may be processed by those providers only as necessary to provide the requested functionality and operate the service. Those providers have their own terms and privacy policies.</p></section>
        <section><h2>8. Data security</h2><p>We use reasonable technical and organisational measures to protect information against unauthorized access, loss, misuse or disclosure. Access credentials and OAuth tokens are handled using security measures appropriate to the service. No internet service can guarantee absolute security.</p></section>
        <section><h2>9. Data retention</h2><p>We retain information for as long as reasonably necessary to provide NelaPost, maintain records, resolve disputes, enforce agreements and comply with legal obligations. Connected-account credentials are retained only while needed for the authorized integration or until the connection is removed, subject to technical and legal requirements.</p></section>
        <section><h2>10. Disconnecting an account</h2><p>You can disconnect a connected social account through NelaPost where that feature is available. You may also revoke NelaPost's authorization through the relevant social platform. Revoking access may prevent NelaPost from publishing to that account.</p></section>
        <section><h2>11. Your privacy choices</h2><p>You may request access to, correction of, or deletion of personal information held by NelaPost, subject to applicable law and legitimate technical or legal retention requirements. You may also withdraw authorization for connected social accounts.</p></section>
        <section><h2>12. Children's privacy</h2><p>NelaPost is not intended for children under the age at which they can legally consent to use of online services in their jurisdiction. We do not knowingly collect personal information from children for the purpose of providing NelaPost.</p></section>
        <section><h2>13. International processing</h2><p>Because NelaPost uses online infrastructure and third-party services, information may be processed in countries other than the country where you live. Where required, we take reasonable steps to support lawful international data transfers.</p></section>
        <section><h2>14. Changes to this Privacy Policy</h2><p>We may update this Privacy Policy as NelaPost develops, our processing changes or legal requirements change. The updated version will be posted on this page with a revised effective date.</p></section>
        <section><h2>15. Contact</h2><p>For privacy questions, requests or concerns about NelaPost, contact us at tladirobson@gmail.com.</p></section>

        <footer className="legalFooter"><Link href="/">NelaPost</Link><span>·</span><Link href="/terms">Terms of Service</Link><span>·</span><Link href="/privacy">Privacy Policy</Link></footer>
      </div>
    </main>
  )
}
