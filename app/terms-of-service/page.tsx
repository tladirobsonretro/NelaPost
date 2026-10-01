import Link from 'next/link'

export default function TermsOfService() {
  return (
    <main style={{maxWidth: 820, margin: '0 auto', padding: '48px 24px', fontFamily: 'Arial, sans-serif', lineHeight: 1.7}}>
      <p><Link href="/">← Back to NelaPost</Link></p>
      <h1>Terms of Service</h1>
      <p><strong>Last updated:</strong> October 1, 2026</p>

      <p>These Terms of Service govern your use of NelaPost, a social publishing platform for creating, scheduling and publishing content to connected social media platforms.</p>

      <h2>Use of NelaPost</h2>
      <p>You are responsible for the content you create or publish through NelaPost and for ensuring that your use of connected social platforms complies with their applicable rules and policies.</p>

      <h2>Connected accounts</h2>
      <p>When you connect a social account, you authorize NelaPost to perform the actions described during the connection process. You can disconnect an account when you no longer want NelaPost to access it.</p>

      <h2>Content and publishing</h2>
      <p>NelaPost provides tools for publishing and scheduling content. Publication depends on the availability, permissions and policies of the connected third-party platform. NelaPost does not guarantee that every scheduled or requested publication will be accepted or delivered by a third-party platform.</p>

      <h2>Acceptable use</h2>
      <p>You may not use NelaPost for unlawful activity, to violate the rights of others, to distribute harmful or abusive material, or to interfere with the operation or security of the service.</p>

      <h2>Third-party platforms</h2>
      <p>NelaPost is not responsible for changes, outages, restrictions or policy decisions made by third-party platforms. Your use of those platforms remains subject to their own terms and policies.</p>

      <h2>Service availability</h2>
      <p>NelaPost is provided on an ongoing development basis. Features may change, be added, suspended or discontinued as the service develops.</p>

      <h2>Limitation of liability</h2>
      <p>To the extent permitted by applicable law, NelaPost is not liable for indirect losses arising from your use of the service or from actions taken by connected third-party platforms.</p>

      <h2>Changes to these terms</h2>
      <p>We may update these Terms of Service as NelaPost develops. Continued use of the service after an update constitutes acceptance of the revised terms where permitted by law.</p>

      <h2>Contact</h2>
      <p>For questions about these terms, contact <a href="mailto:tlisene@gmail.com">tlisene@gmail.com</a>.</p>
    </main>
  )
}
