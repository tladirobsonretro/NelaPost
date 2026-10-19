import Link from 'next/link'

export default function EmailConfirmed(){
 return <main className="loginPage">
  <section className="loginCard emailConfirmedCard">
   <div className="loginLogo"><img src="/logo-mark.svg" alt="NelaPost"/></div>
   <div className="loginBrand">NELAPOST</div>
   <div className="emailConfirmedMark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg></div>
   <h1>Email confirmed successfully</h1>
   <p className="emailConfirmedCopy">Your email address has been verified. You can now sign in to your NelaPost account.</p>
   <Link className="emailConfirmedButton" href="/login">Go to Sign In</Link>
   <Link className="emailConfirmedBack" href="/login">Return to sign in</Link>
  </section>
 </main>
}
