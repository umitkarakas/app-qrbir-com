export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lum-auth-page">
      <div className="lum-bgdecor" aria-hidden="true">
        <div className="lum-orb lum-orb--violet" />
        <div className="lum-orb lum-orb--sky" />
        <div className="lum-orb lum-orb--peach" />
        <div className="lum-streak" />
      </div>
      {children}
    </div>
  );
}
