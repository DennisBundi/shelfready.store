import WaitlistForm from "./WaitlistForm"
import CompareSlider from "./CompareSlider"

export default function HeroSection() {
  return (
    <section className="relative bg-brand-navy min-h-screen flex items-center px-4 sm:px-6 overflow-hidden">

      {/* Decorative background blobs */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-brand rounded-full blur-3xl opacity-10 pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-brand rounded-full blur-3xl opacity-10 pointer-events-none" />

      <div className="relative w-full max-w-6xl mx-auto py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: text + form */}
          <div className="flex flex-col gap-5">
            <span className="animate-fade-in-up anim-delay-100 inline-flex items-center gap-2 text-xs font-semibold bg-brand/20 text-brand px-4 py-2 rounded-full border border-brand/30 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block animate-pulse-dot" />
              AI Product Photography — Launching Soon
            </span>

            <h1 className="animate-fade-in-up anim-delay-200 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
              Skip the model.{" "}
              <span className="text-brand">Skip the studio.</span>
              {" "}Just great product photos.
            </h1>

            <p className="animate-fade-in-up anim-delay-300 text-base sm:text-lg text-gray-400 max-w-lg leading-relaxed">
              Upload your product and ShelfReady&apos;s AI places it on a realistic
              model, in a professional lifestyle scene — ready in seconds.
              Used by online sellers worldwide.
            </p>

            <div id="waitlist" className="animate-fade-in-up anim-delay-400 w-full">
              <WaitlistForm />
            </div>

            <p className="animate-fade-in anim-delay-500 text-xs text-gray-500 flex items-center gap-2">
              <span>No credit card required</span>
              <span className="w-1 h-1 rounded-full bg-gray-600 inline-block" />
              <span>Free early access</span>
              <span className="w-1 h-1 rounded-full bg-gray-600 inline-block" />
              <span>Cancel anytime</span>
            </p>
          </div>

          {/* Right: compare slider */}
          <div className="animate-fade-in-up anim-delay-300 w-full max-w-md lg:max-w-none mx-auto lg:mx-0 lg:ml-auto">
            <CompareSlider
              beforeSrc="/after.png"
              afterSrc="/before.png"
              beforeAlt="AI-generated model wearing the same clothing in a lifestyle scene"
              afterAlt="Clothing on mannequins — the old way"
            />
            <p className="text-center text-xs text-gray-600 mt-3">
              Drag to compare → real result from ShelfReady
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
