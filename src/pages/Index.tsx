import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Benefits from "@/components/landing/Benefits";
import AIConsultant from "@/components/landing/AIConsultant";
import AboutSpace from "@/components/landing/AboutSpace";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Benefits />
      <AIConsultant />
      <AboutSpace />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
