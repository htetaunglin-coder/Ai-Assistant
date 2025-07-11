"use client";

import { AnnouncementBar } from "./components/announcement-bar";
import { FeaturesSection } from "./components/features-section";
import { Footer } from "./components/footer";
import { HeroSection } from "./components/hero-section";
import { HowItWorksSection } from "./components/how-it-works-section";
import { Navbar } from "./components/navbar";
import { ProductOverviewSection } from "./components/product-overview-section";
import { WaitlistSection } from "./components/waitlist-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen transition-colors duration-300">
      <AnnouncementBar />
      <Navbar />
      <main>
        <HeroSection />
        <ProductOverviewSection />
        <FeaturesSection />
        <HowItWorksSection />
        <WaitlistSection />
      </main>
      <Footer />
    </div>
  );
}
