import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const WHATSAPP_LINK = "https://api.whatsapp.com/send?phone=5524998368014&text=Ol%c3%a1%20Myllena,%20vim%20pelo%20Consultor%20Inteligente%20e%20gostaria%20de%20saber%20mais%20sobre%20a%20aula%20experimental";

// Fallback responses for when AI is not available
const fallbackResponses: Record<string, string> = {
  default: `O Pilates é uma excelente opção para o seu caso! Através de exercícios específicos, trabalhamos o fortalecimento muscular profundo, melhoramos a postura e aliviamos tensões acumuladas.

No PilatescomMQ, realizamos uma avaliação inicial para entender suas necessidades específicas e criar um programa personalizado para você.`,
  costas: `A dor nas costas é uma das queixas mais comuns que tratamos no Pilates! O método trabalha diretamente no fortalecimento (músculos abdominais e paravertebrais), que são fundamentais para sustentar a coluna.

Com exercícios específicos, você vai:
• Fortalecer a musculatura que protege a coluna
• Melhorar a postura no dia a dia
• Reduzir tensões musculares
• Aumentar a mobilidade da coluna

No PilatescomMQ, fazemos uma avaliação postural completa para identificar exatamente onde está o problema e criar um programa personalizado para você.`,
  postura: `A má postura é a raiz de muitos problemas físicos, e o Pilates é referência mundial em correção postural!

No nosso estúdio, trabalhamos:
• Consciência corporal - você aprende a identificar sua postura
• Fortalecimento dos músculos estabilizadores
• Alongamento de músculos encurtados
• Reeducação de padrões de movimento

O resultado é uma postura natural e saudável, sem esforço consciente.`,
};

const AIConsultant = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getFallbackResponse = (userQuery: string): string => {
    const lowerQuery = userQuery.toLowerCase();
    if (lowerQuery.includes("costas") || lowerQuery.includes("lombar") || lowerQuery.includes("coluna")) {
      return fallbackResponses.costas;
    } else if (lowerQuery.includes("postura") || lowerQuery.includes("curvatura")) {
      return fallbackResponses.postura;
    }
    return fallbackResponses.default;
  };

  const handleConsult = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse("");

    try {
      const { data, error } = await supabase.functions.invoke("pilates-consultant", {
        body: { query: query.trim() },
      });

      if (error) {
        console.error("Error calling AI:", error);
        throw error;
      }

      if (data?.error) {
        // Handle rate limiting or payment errors
        if (data.error.includes("requisições")) {
          toast({
            title: "Aguarde um momento",
            description: "Muitas consultas em pouco tempo. Tente novamente em alguns segundos.",
            variant: "destructive",
          });
        }
        throw new Error(data.error);
      }

      setResponse(data.response);
    } catch (error) {
      console.error("Falling back to mock response:", error);
      // Use fallback response when AI is unavailable
      setResponse(getFallbackResponse(query));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConsult();
    }
  };

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-secondary text-primary px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Consultor Inteligente</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-purple-dark mb-4">
              Consultor de Bem-Estar
            </h2>
            <p className="text-lg text-muted-foreground">
              Conte sua dor ou desconforto e descubra como o Pilates pode ajudar você
            </p>
          </div>

          <Card className="border-0 shadow-soft rounded-3xl overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-4">
                <Input
                  placeholder="Ex: dor nas costas, má postura, tensão no pescoço..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full h-12 rounded-xl border-border focus:ring-primary"
                />
                <Button
                  onClick={handleConsult}
                  disabled={isLoading || !query.trim()}
                  className="w-full sm:w-auto sm:self-end h-12 px-6 rounded-xl"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Consultar IA
                      <Sparkles className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {response && (
                <div className="mt-6 p-6 bg-secondary rounded-2xl animate-fade-in-up">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full gradient-purple flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-purple-dark mb-2">Resposta do Consultor</p>
                      <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                        {response}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-border">
                    <a
                      href={WHATSAPP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Agendar essa solução →
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            💡 Este é um consultor inteligente para orientação inicial. 
            Para avaliação completa, agende sua aula experimental.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AIConsultant;
