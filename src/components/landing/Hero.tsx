import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import studioHero from "@/assets/studio-hero.jpg";

const WHATSAPP_LINK = "https://api.whatsapp.com/send?phone=5524998368014&text=Ol%c3%a1%20Myllena,%20vim%20do%20Instagram%20e%20gostaria%20de%20saber%20mais%20sobre%20a%20aula%20experimental";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image Placeholder */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${studioHero})`,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 gradient-overlay" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in-up">
            Transforme seu corpo e mente com o{" "}
            <span className="block mt-2">
              <span className="text-primary-foreground/90">Pilates</span>
              <span className="text-lavender">comMQ</span>
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
            Descubra um método personalizado que vai além do exercício físico. 
            Cuide do seu bem-estar com acompanhamento especializado.
          </p>

          <div className="animate-fade-in-up animate-delay-200">
            <Button
              asChild
              size="lg"
              className="bg-background text-primary hover:bg-background/90 rounded-full px-8 py-6 text-lg font-semibold shadow-glow hover:scale-105 transition-all duration-300"
            >
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                Agendar Aula Experimental
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/50 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
