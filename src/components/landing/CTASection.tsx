import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight } from "lucide-react";

const WHATSAPP_LINK = "https://api.whatsapp.com/send?phone=5524998368014&text=Ol%c3%a1%20Myllena,%20gostaria%20de%20saber%20mais%20sobre%20a%20aula%20experimental";

const CTASection = () => {
  return (
    <section className="py-20 md:py-24 gradient-purple relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full -translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Pronto para começar?
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-xl mx-auto">
            Agende sua aula experimental e dê o primeiro passo para transformar sua qualidade de vida.
          </p>
          
          <Button
            asChild
            size="lg"
            className="bg-background text-primary hover:bg-background/90 rounded-full px-10 py-7 text-lg font-semibold shadow-lg hover:scale-105 transition-all duration-300"
          >
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-5 h-5 mr-3" />
              Falar no WhatsApp
              <ArrowRight className="w-5 h-5 ml-3" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
