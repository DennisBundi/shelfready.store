import Logo from "./Logo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-brand-navy/90 backdrop-blur-sm border-b border-white/10">
      <nav aria-label="Main" className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo />
        <a href="#waitlist" className="text-xs font-semibold bg-brand text-white px-3 py-1.5 rounded-full tracking-wide hover:bg-brand-hover transition-colors">
          Join Waitlist
        </a>
      </nav>
    </header>
  );
}
