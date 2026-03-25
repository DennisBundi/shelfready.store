import Image from "next/image";
import ScrollReveal from "./ScrollReveal";

export default function BeforeAfterSection() {
  return (
    <section className="bg-[#f8faf9] min-h-screen flex items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-4xl mx-auto">

        <ScrollReveal className="reveal">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-brand-navy mb-2">
            The old way vs. the ShelfReady way
          </h2>
          <p className="text-center text-gray-500 mb-8 max-w-xl mx-auto text-sm">
            Same product. Same colors. The only difference? One took a $1,500 shoot. The other took seconds.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 gap-4 items-start">
          {/* Before */}
          <ScrollReveal className="reveal-left">
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/before.png"
                  alt="Product on mannequin — the old way"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-xs font-bold text-white uppercase tracking-widest px-3 py-1.5 rounded">
                  Before
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-brand-navy mb-1">The Old Way</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Mannequin shoot — no human touch, flat lighting, zero lifestyle feel. Costs $500–$2,000 and takes days.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* After */}
          <ScrollReveal className="reveal-right">
            <div className="bg-white border-2 border-brand shadow-sm rounded-lg overflow-hidden">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/after.png"
                  alt="Product on AI-generated model — ShelfReady result"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
                <div className="absolute top-3 left-3 bg-brand text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded">
                  With ShelfReady
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-brand mb-1">With ShelfReady</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  AI-generated model, lifestyle background, professional lighting — ready in seconds, at a fraction of the cost.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
}
