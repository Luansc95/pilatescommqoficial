import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, Move, Dumbbell } from "lucide-react";

const benefits = [
  {
    icon: UserCheck,
    title: "Correção Postural",
    description: "Melhore sua postura e alivie dores causadas por desalinhamentos corporais através de exercícios específicos.",
  },
  {
    icon: Move,
    title: "Aumento da Flexibilidade",
    description: "Desenvolva amplitude de movimento e elasticidade muscular de forma progressiva e segura.",
  },
  {
    icon: Dumbbell,
    title: "Fortalecimento Muscular",
    description: "Fortaleça sua musculatura profunda para uma base sólida e movimentos mais eficientes.",
  },
];

const Benefits = () => {
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
    <section ref={sectionRef} className="py-20 md:py-28 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-purple-dark mb-4">
            Benefícios do Pilates
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra como o Pilates pode transformar sua qualidade de vida
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card
              key={benefit.title}
              className={`bg-card border-0 shadow-soft rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-glow hover:-translate-y-2 ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-purple flex items-center justify-center">
                  <benefit.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-purple-dark mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
