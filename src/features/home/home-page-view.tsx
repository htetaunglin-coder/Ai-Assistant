import React from "react";
import { AnnouncementBar } from "./components/announcement-bar";
import { Navbar } from "./components/navbar";
import { HeroSection } from "./components/hero-section";
import { ProductOverviewSection } from "./components/product-overview-section";
import { FeaturesSection } from "./components/features-section";
import { HowItWorksSection } from "./components/how-it-works-section";
import { WaitlistSection } from "./components/waitlist-section";
import { Footer } from "./components/footer";

const HomePageView = () => {
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
};

export default HomePageView;
