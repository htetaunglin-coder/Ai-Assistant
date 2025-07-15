import { Footer } from "@/features/home/components/footer";
import { DarkBlueRadialGradient } from "@/features/home/components/gradient-decorators";
import { Navbar } from "@/features/home/components/navbar";
import React from "react";

const BasicHomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen flex-col transition-colors duration-300">
      <DarkBlueRadialGradient />
      <Navbar />
      <div className="flex grow items-center justify-center">{children}</div>
      <Footer />
    </div>
  );
};

export { BasicHomeLayout };
