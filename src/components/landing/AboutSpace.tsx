import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Thermometer, Heart } from "lucide-react";
import studioEquipment from "@/assets/studio-equipment.jpg";

const WHATSAPP_LINK = "https://api.whatsapp.com/send?phone=5524998368014&text=Ol%c3%a1%20Myllena,%20gostaria%20de%20saber%20mais%20sobre%20a%20aula%20experimental";

const features = [
  { icon: Thermometer, text: "Ambiente climatizado" },
  { icon: Heart, text: "Atendimento personalizado" },
  { icon: MapPin, text: "Localização privilegiada" },
];

const AboutSpace = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-28 bg-secondary overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div
            className={`relative transition-all duration-700 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-glow">
              <img
                src={studioEquipment}
                alt="Estúdio PilatescomMQ"
                className="w-full aspect-[4/3] object-cover"
              />
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl gradient-purple opacity-80" />
              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-xl bg-lavender" />
            </div>
          </div>

          {/* Content */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-purple-dark mb-6">
              Nosso Espaço
            </h2>
            
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              O PilatescomMQ foi pensado para proporcionar uma experiência única de bem-estar. 
              Nosso estúdio oferece um ambiente acolhedor, moderno e equipado com os melhores 
              aparelhos do mercado.
            </p>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Aqui, você encontra um espaço exclusivo onde cada detalhe foi cuidadosamente 
              planejado para o seu conforto. Atendimento individualizado ou em pequenos grupos, 
              garantindo atenção total às suas necessidades.
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-4 mb-8">
              {features.map((feature) => (
                <div
                  key={feature.text}
                  className="flex items-center gap-2 bg-background px-4 py-2 rounded-full"
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <Button
              asChild
              size="lg"
              className="rounded-full px-8 shadow-soft hover:shadow-glow transition-all duration-300"
            >
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                Venha Conhecer
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSpace;
