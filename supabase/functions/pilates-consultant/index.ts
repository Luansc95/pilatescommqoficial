import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é um consultor especializado em Pilates do estúdio PilatescomMQ.

INFORMAÇÕES DO ESTÚDIO (USE EXATAMENTE COMO ESTÁ):
- Nome do estúdio: PilatescomMQ
- Especialista responsável: Myllena Queiroz
- Localização: Barra do Piraí - RJ (NUNCA mencione outra cidade)

DIRETRIZES DE RESPOSTA:
- Responda de forma acolhedora, profissional e empática
- Explique como o Pilates pode ajudar com a dor ou problema específico mencionado
- Mencione benefícios como: fortalecimento muscular, correção postural, aumento da flexibilidade, alívio de tensões
- Destaque que o estúdio oferece atendimento personalizado com avaliação inicial
- Sempre encoraje o agendamento de uma aula experimental

RESTRIÇÕES IMPORTANTES:
- LIMITE OBRIGATÓRIO: Mantenha a resposta entre 100 e 150 palavras (NUNCA ultrapasse)
- Use português brasileiro
- NÃO mencione preços ou valores
- NÃO use termos técnicos como "CORE", "powerhouse", ou nomes de aparelhos/equipamentos
- NÃO mencione nomes de equipamentos de Pilates (Reformer, Cadillac, etc.)
- Use linguagem simples e acessível para qualquer pessoa entender

DIFERENCIAIS DO ESTÚDIO:
- Atendimento individualizado
- Ambiente climatizado e confortável
- Acompanhamento profissional especializado`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service is not configured");
    }

    console.log("Processing query:", query);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `O visitante do site disse: "${query}"\n\nExplique como o Pilates pode ajudar com esse problema específico.` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Por favor, tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Serviço temporariamente indisponível." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error("No response from AI:", data);
      throw new Error("No response from AI");
    }

    console.log("AI response generated successfully");

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in pilates-consultant function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro ao processar sua consulta" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
