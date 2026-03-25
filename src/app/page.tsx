import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BeforeAfterSection from "@/components/BeforeAfterSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ShelfReady",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "AI-powered product photography for online sellers. Upload your product and get professional lifestyle photos with AI-generated models and backgrounds in seconds.",
  url: "https://shelfready.store",
  offers: {
    "@type": "Offer",
    availability: "https://schema.org/PreOrder",
    description: "Join the waitlist for early access",
  },
  creator: {
    "@type": "Organization",
    name: "ShelfReady",
    url: "https://shelfready.store",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <Navbar />
        <HeroSection />
        <BeforeAfterSection />
        <FeaturesSection />
        <Footer />
      </main>
    </>
  );
}
