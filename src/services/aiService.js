const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const fallbackResponses = [
  'Сізді түсінемін. Мұндай сәтте бәрін бірден көтерудің қажеті жоқ. Қазір бір терең дем алып, ең жақын бір ғана қадамды таңдауға болады.',
  'Сіз жалғыз емессіз. Бүгін өзіңізден мінсіз болуды талап етпей, күшіңіз жететін көлемді ғана қалдыруға рұқсат беріңіз.',
  'Бұл сезіміңіз маңызды. Оны басып тастамай, жұмсақ байқап көрейік: денеңіз қай жерде кернеуді сезіп тұр?',
];

function buildFallbackReply(message) {
  const index = Math.abs(message.length) % fallbackResponses.length;
  return {
    role: 'ai',
    content: fallbackResponses[index],
    source: 'mock',
  };
}

export async function sendChatMessage({ message, history = [], locale = 'kk', mode = 'support' }) {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    return buildFallbackReply('empty');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: trimmedMessage,
        history,
        locale,
        mode,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI backend returned ${response.status}`);
    }

    const data = await response.json();
    return {
      role: 'ai',
      content: data.message ?? data.content ?? '',
      source: data.source ?? 'backend',
    };
  } catch (error) {
    console.info('Using local AI mock response:', error.message);
    await new Promise((resolve) => setTimeout(resolve, 650));
    return buildFallbackReply(trimmedMessage);
  }
}

export async function sendVoiceTranscript({ transcript, history = [], locale = 'kk' }) {
  return sendChatMessage({
    message: transcript,
    history,
    locale,
    mode: 'voice-support',
  });
}

export async function requestCameraAdvice({ signals, locale = 'kk', context = '' }) {
  const face = signals?.face ?? {};
  const fallback =
    locale === 'ru'
      ? 'Я вижу только внешние признаки, не диагноз. Сделайте один медленный выдох, расслабьте челюсть и выберите самый маленький следующий шаг.'
      : 'Мен тек сыртқы белгілерді ғана көремін, бұл диагноз емес. Бір баяу дем шығарып, жақты босатыңыз да, ең кішкентай келесі қадамды таңдаңыз.';

  try {
    const response = await fetch(`${API_BASE_URL}/api/camera-advice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locale,
        context,
        signals: {
          face: {
            detected: Boolean(face.detected),
            state: face.state,
            moodKey: face.moodKey,
            balance: face.balance,
            smile: Number(face.smile ?? 0).toFixed(2),
            tension: Number(face.tension ?? 0).toFixed(2),
            fatigue: Number(face.fatigue ?? 0).toFixed(2),
          },
          hand: signals?.hand
            ? {
                detected: Boolean(signals.hand.detected),
                gesture: signals.hand.gesture,
                squeeze: Number(signals.hand.squeeze ?? 0).toFixed(2),
              }
            : undefined,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Camera AI returned ${response.status}`);
    }

    const data = await response.json();
    return data.message || fallback;
  } catch (error) {
    console.info('Using local camera advice:', error.message);
    return fallback;
  }
}

export async function transcribeAudio(audioBlob, locale = 'kk') {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'teacher-support-audio.webm');
  formData.append('locale', locale);

  const response = await fetch(`${API_BASE_URL}/api/speech-to-text`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Speech backend returned ${response.status}`);
  }

  return response.json();
}
