import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import studioHero from "@/assets/studio-hero.jpg";
import logoMQ from "@/assets/logo-mq.png";

const WHATSAPP_LINK = "https://api.whatsapp.com/send?phone=5524998368014&text=Ol%c3%a1%20Myllena,%20vim%20do%20Instagram%20e%20gostaria%20de%20saber%20mais%20sobre%20a%20aula%20experimental";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${studioHero})`,
        }}
      />
      
      {/* Gradient Overlay - lighter to show image */}
      <div className="absolute inset-0 gradient-overlay-light" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-12 pt-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 lg:gap-16">
          
          {/* Text Content - Left Side */}
          <div className="flex-1 text-center md:text-left order-2 md:order-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in-up">
              Transforme seu corpo e mente com{" "}
              <span className="text-lavender">Pilates</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-xl animate-fade-in-up animate-delay-100">
              Descubra um método personalizado que vai além do exercício físico. 
              Cuide do seu bem-estar com acompanhamento especializado.
            </p>

            <div className="animate-fade-in-up animate-delay-200">
              <Button
                asChild
                size="lg"
                className="bg-background text-primary hover:bg-background/90 rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-glow hover:scale-105 transition-all duration-300"
              >
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  Agendar Aula Experimental
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </a>
              </Button>
            </div>
          </div>

          {/* Logo - Right Side */}
          <div className="flex-shrink-0 order-1 md:order-2 animate-fade-in-up">
            <img 
              src={logoMQ} 
              alt="Pilates com MQ" 
              className="w-40 sm:w-48 md:w-56 lg:w-72 h-auto drop-shadow-2xl"
            />
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
