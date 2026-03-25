import ScrollReveal from "./ScrollReveal";

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="10" r="5" stroke="#1D9E75" strokeWidth="2" fill="none" />
        <path d="M5 24c0-4.418 4.03-8 9-8s9 3.582 9 8" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    ),
    title: "AI Model Generation",
    description:
      "Your product appears on a realistic AI-generated model. No casting, no fitting sessions, no agency fees.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="22" height="16" rx="3" stroke="#1D9E75" strokeWidth="2" fill="none" />
        <path d="M9 21v2M19 21v2M6 23h16" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 13c2-3 10-3 12 0" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    ),
    title: "Studio & Lifestyle Backgrounds",
    description:
      "Choose from dozens of scenes — kitchens, desks, outdoor settings, and more. All AI-generated to match your brand.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M14 4v20M7 8l7-4 7 4M7 20l7 4 7-4" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M3 12l4 2M21 14l4-2" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "A Fraction of the Cost",
    description:
      "Stop spending $500–$2,000 per shoot. ShelfReady delivers professional-quality results at a price that makes sense for any seller.",
  },
];

const delays = ["anim-delay-100", "anim-delay-200", "anim-delay-300"];

export default function FeaturesSection() {
  return (
    <section className="bg-white min-h-screen flex items-center py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">

        <ScrollReveal className="reveal">
          <h2 className="text-3xl font-bold text-center text-brand-navy mb-4">
            Everything you need. Nothing you don&apos;t.
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            Professional product photography, rebuilt from the ground up for the modern online seller.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-3 gap-6 items-stretch">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} className={`reveal ${delays[i]} h-full`}>
              <div className="h-full rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-md hover:border-brand-light hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-brand-light flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="font-bold text-brand-navy mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
