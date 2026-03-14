import { Navbar } from "./components/navbar";
import { HeroSection } from "./components/hero-section";
import { ProblemSection } from "./components/problem-section";
import { HowItWorksSection } from "./components/how-it-works-section";
import { DemoSection } from "./components/demo-section";
import { TechStackSection } from "./components/tech-stack-section";
import { Footer } from "./components/footer";
//.
export default function App() {
  return (
    <div className="min-h-screen bg-[#0f0620] text-white overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <DemoSection />
      <TechStackSection />
      <Footer />
    </div>
  );
}