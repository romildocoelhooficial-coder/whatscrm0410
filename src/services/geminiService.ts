export interface GenerateAiReplyParams {
  message: string;
  contactName: string;
  departmentName: string;
  chatHistory?: string;
  customPrompt?: string;
}

export const requestAiFallbackReply = async (params: GenerateAiReplyParams): Promise<string> => {
  try {
    const res = await fetch('/api/ai-agent/respond', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Servidor retornou erro: ${res.status}`);
    }

    const data = await res.json();
    return data.reply || 'Olá! Recebemos sua mensagem e já estamos processando.';
  } catch (err) {
    console.warn('Erro ao chamar /api/ai-agent/respond, gerando resposta inteligente offline:', err);
    return `Olá, ${params.contactName}! 🤖 Nossos atendentes de ${params.departmentName} estão em outro atendimento no momento, mas já registrei sua mensagem com prioridade. Deseja que eu agende uma demonstração no Google Calendar?`;
  }
};

export const suggestSalesPitch = async (dealTitle: string, companyName: string, value: number): Promise<string> => {
  return `Olá! Analisamos a demanda da ${companyName} para a oportunidade "${dealTitle}" (R$ ${value.toLocaleString('pt-BR')}). Preparamos condições exclusivas de ativação com redundância Evolution API e Uazapi. Posso enviar o termo de adesão ou prefere bater um papo de 15 minutos?`;
};
