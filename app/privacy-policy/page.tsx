import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <main style={{maxWidth: 820, margin: '0 auto', padding: '48px 24px', fontFamily: 'Arial, sans-serif', lineHeight: 1.7}}>
      <p><Link href="/">← Back to NelaPost</Link></p>
      <h1>Privacy Policy</h1>
      <p><strong>Last updated:</strong> October 1, 2026</p>

      <p>NelaPost is a social publishing platform that helps users create, schedule and publish content to connected social media platforms.</p>

      <h2>Information we collect</h2>
      <p>Depending on the features you use, NelaPost may process your account information, content you choose to publish, scheduling information and information required to connect your selected social media accounts.</p>

      <h2>Connected social accounts</h2>
      <p>When you connect a social platform, NelaPost receives the authorization information required to act on your behalf. For YouTube, this may include OAuth access and refresh tokens and your YouTube channel identifier and channel name. OAuth credentials are stored using encrypted application storage.</p>

      <h2>How we use information</h2>
      <p>We use information to provide NelaPost features, authenticate connected accounts, publish or schedule content at your request, maintain the service and troubleshoot technical problems.</p>

      <h2>Third-party services</h2>
      <p>NelaPost connects with third-party platforms such as Google/YouTube, Meta, X, Threads and TikTok when you choose to connect those services. Those platforms have their own privacy policies and terms.</p>

      <h2>Data retention and deletion</h2>
      <p>Connected-account information is retained while it is needed to provide the connected service. You can disconnect a social account from NelaPost. You may also contact us to request deletion of information associated with your NelaPost use, subject to information we may be required to retain by law or for legitimate security purposes.</p>

      <h2>Security</h2>
      <p>We use reasonable technical measures to protect information handled by NelaPost. No internet service can guarantee absolute security.</p>

      <h2>Children</h2>
      <p>NelaPost is not intended for children under 13.</p>

      <h2>Changes to this policy</h2>
      <p>We may update this Privacy Policy when the service or its practices change. The updated date above will indicate when the policy was last revised.</p>

      <h2>Contact</h2>
      <p>For privacy questions or requests, contact <a href="mailto:tlisene@gmail.com">tlisene@gmail.com</a>.</p>
    </main>
  )
}
