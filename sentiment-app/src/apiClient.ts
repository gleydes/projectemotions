const API_URL = '/api/save';

export const saveSentiment = async (data: {
  sentiment_level: number;
  sentiment_label: string;
  session_id: string;
}) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const getSupportMessage = async (): Promise<string> => {
  const messages = [
    'Você está no caminho certo! Cada dia é uma nova oportunidade.',
    'Sua felicidade contagia! Aproveite esse momento.',
    'É normal ter dias difíceis. Respire fundo, você é mais forte do que imagina.',
    'A ansiedade é passageira. Foque no presente, um passo de cada vez.',
    'Preocupações são como nuvens: elas passam. O sol sempre volta.',
    'Cuide de si mesmo hoje. Você merece gentileza.',
    'Seu bem-estar importa. Faça algo que te faça bem!',
    'Lembre-se: não está sozinho. Peça ajuda quando precisar.',
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};