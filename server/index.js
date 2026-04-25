import 'dotenv/config';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import multer from 'multer';
import OpenAI, { toFile } from 'openai';

const currentDir = dirname(fileURLToPath(import.meta.url));
const distPath = resolve(currentDir, '../dist');
const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 18 * 1024 * 1024 } });
const port = Number(process.env.PORT || 8787);
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const geminiThinkingBudget = Number(process.env.GEMINI_THINKING_BUDGET ?? 0);
const geminiApiBaseUrl = (process.env.GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta').replace(
  /\/$/,
  '',
);
const openaiModel = process.env.OPENAI_MODEL || 'gpt-5-mini';
const transcribeModel = process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-4o-mini-transcribe';
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const activeProvider = geminiApiKey ? 'gemini' : openai ? 'openai' : 'mock';
const activeModel = geminiApiKey ? geminiModel : openai ? openaiModel : 'mock';
const hasStaticBuild = existsSync(resolve(distPath, 'index.html'));

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: '1mb' }));

function systemInstructions(locale = 'kk', mode = 'support') {
  const language = locale === 'ru' ? 'Russian' : 'Kazakh';
  const modeHint = {
    support:
      'General module: listen first, reflect briefly, then suggest one gentle next step.',
    'voice-support':
      'Voice module: respond naturally as if speaking aloud. Use 2-4 short sentences, no lists unless the teacher asks.',
    'camera-mood':
      'Camera mood module: you receive only client-side numeric visual cues, never an image. Treat them as tentative external signals, not proof of emotion or diagnosis.',
    diary:
      'Diary module: help the teacher name the feeling, normalize it, and turn it into a short reflection.',
    stress:
      'Anti-stress module: guide grounding, breathing, and body relaxation with clear micro-steps.',
  }[mode] ?? 'General support module.';

  return [
    `You are Teacher Support AI, an emotionally safe AI assistant for school teachers. Reply in ${language}.`,
    'Your tone is warm, calm, concise, and supportive, like a careful AI psychologist assistant.',
    'Keep replies compact: usually 2-5 short sentences.',
    'Do not diagnose medical or psychiatric conditions.',
    'Do not claim that facial expression proves a real inner emotion. Use phrases like "may look like" or "external cues suggest".',
    'If the teacher describes self-harm, danger, abuse, or an emergency, encourage immediate local emergency help and trusted human support.',
    'Prefer practical micro-steps: breathing, grounding, reframing, asking for help, and reducing the next task.',
    modeHint,
    `Current product mode: ${mode}.`,
  ].join('\n');
}

function formatHistory(history = []) {
  return history
    .slice(-8)
    .map((item) => {
      const speaker = item.role === 'ai' || item.role === 'assistant' ? 'AI' : 'Teacher';
      return `${speaker}: ${item.content}`;
    })
    .join('\n');
}

function formatGeminiHistory(history = []) {
  return history.slice(-8).flatMap((item) => {
    const text = String(item.content ?? '').trim();
    if (!text) return [];

    const role = item.role === 'ai' || item.role === 'assistant' || item.role === 'model' ? 'model' : 'user';
    return [{ role, parts: [{ text }] }];
  });
}

function geminiEndpoint(modelName = geminiModel) {
  const modelPath = modelName.startsWith('models/') ? modelName : `models/${modelName}`;
  return `${geminiApiBaseUrl}/${modelPath}:generateContent`;
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((part) => part.text ?? '')
    .join('')
    .trim();
}

async function generateGeminiText({ contents, instructions, maxOutputTokens = 320, temperature = 0.65 }) {
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const payload = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens,
    },
  };

  if (Number.isFinite(geminiThinkingBudget)) {
    payload.generationConfig.thinkingConfig = { thinkingBudget: geminiThinkingBudget };
  }

  if (instructions) {
    payload.systemInstruction = { parts: [{ text: instructions }] };
  }

  const geminiResponse = await fetch(geminiEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': geminiApiKey,
    },
    body: JSON.stringify(payload),
  });
  const data = await geminiResponse.json().catch(() => ({}));

  if (!geminiResponse.ok) {
    throw new Error(data?.error?.message || `Gemini returned ${geminiResponse.status}`);
  }

  const text = extractGeminiText(data);
  if (!text) {
    const finishReason = data?.candidates?.[0]?.finishReason;
    throw new Error(finishReason ? `Gemini returned empty response (${finishReason})` : 'Gemini returned empty response');
  }

  return {
    text,
    requestId: geminiResponse.headers.get('x-request-id'),
  };
}

function mockReply(locale = 'kk') {
  if (locale === 'ru') {
    return 'Я рядом и готов вас выслушать. Сейчас не нужно решать всё сразу: сделайте один спокойный вдох и выберите самый маленький следующий шаг.';
  }

  return 'Мен сізді тыңдап тұрмын. Қазір бәрін бірден шешудің қажеті жоқ: бір терең дем алып, ең кішкентай келесі қадамды ғана таңдаңыз.';
}

function missingProviderMessage(locale = 'kk') {
  if (locale === 'ru') {
    return 'AI backend не подключён: добавьте GEMINI_API_KEY в environment variables на Render и перезапустите сервис.';
  }

  return 'AI backend қосылмаған: Render environment variables ішіне GEMINI_API_KEY қосып, сервисті қайта іске қосыңыз.';
}

function mockCameraAdvice(locale = 'kk', state = 'calm') {
  const kk = {
    calm:
      'Сыртқы белгілеріңіз бірқалыпты көрінеді. Осы тыныш ырғақты сақтау үшін 30 секунд баяу дем алып, бүгінгі ең жеңіл бір істі таңдаңыз.',
    tired:
      'Камерада шаршауға ұқсас белгі байқалды. Бұл диагноз емес: су ішіп, көзіңізді 20 секунд демалдырып, бір міндетті кейінге қалдырыңыз.',
    tense:
      'Кернеуге ұқсас белгі бар. Жақты босатып, иықты түсіріңіз, содан кейін ойыңызды “қазір бір ғана не істей аламын?” деген сұраққа бұрыңыз.',
    positive:
      'Жылы энергия байқалады. Осы ресурсты жоғалтпай, күнделікке бір жақсы сәтті жазып қойыңыз.',
  };
  const ru = {
    calm:
      'Внешние признаки выглядят ровно. Чтобы сохранить спокойный ритм, подышите медленно 30 секунд и выберите одно самое лёгкое действие.',
    tired:
      'Камера видит признаки, похожие на усталость. Это не диагноз: выпейте воды, дайте глазам 20 секунд отдыха и отложите одну задачу.',
    tense:
      'Есть признаки, похожие на напряжение. Расслабьте челюсть, опустите плечи и спросите себя: “какой один шаг я могу сделать сейчас?”',
    positive:
      'Видна более тёплая энергия. Пока ресурс рядом, запишите один хороший момент в дневник.',
  };

  return (locale === 'ru' ? ru : kk)[state] ?? (locale === 'ru' ? ru.calm : kk.calm);
}

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    provider: activeProvider,
    gemini: Boolean(geminiApiKey),
    openai: Boolean(openai),
    model: activeModel,
  });
});

app.post('/api/chat', async (request, response) => {
  const { message = '', history = [], locale = 'kk', mode = 'support' } = request.body ?? {};
  const cleanMessage = String(message).trim();

  if (!cleanMessage) {
    return response.status(400).json({ error: 'message is required' });
  }

  try {
    if (geminiApiKey) {
      const result = await generateGeminiText({
        instructions: systemInstructions(locale, mode),
        contents: [...formatGeminiHistory(history), { role: 'user', parts: [{ text: cleanMessage }] }],
        maxOutputTokens: mode === 'voice-support' ? 220 : 360,
      });

      return response.json({
        message: result.text || mockReply(locale),
        source: 'gemini',
        requestId: result.requestId,
      });
    }

    if (!openai) {
      return response.status(503).json({
        error: 'ai_provider_missing',
        message: missingProviderMessage(locale),
        source: 'error',
      });
    }

    const historyText = formatHistory(history);
    const result = await openai.responses.create({
      model: openaiModel,
      instructions: systemInstructions(locale, mode),
      input: `${historyText ? `Conversation so far:\n${historyText}\n\n` : ''}Teacher: ${cleanMessage}`,
      max_output_tokens: mode === 'voice-support' ? 220 : 360,
    });

    return response.json({
      message: result.output_text || mockReply(locale),
      source: 'openai',
      requestId: result._request_id,
    });
  } catch (error) {
    console.error(`${activeProvider} chat error:`, error);
    return response.status(500).json({
      error: `${activeProvider}_chat_failed`,
      message: locale === 'ru' ? 'Gemini сейчас не смог ответить. Проверьте backend logs на Render.' : 'Gemini қазір жауап бере алмады. Render backend logs тексеріңіз.',
      source: 'error',
    });
  }
});

app.post('/api/camera-advice', async (request, response) => {
  const { signals = {}, locale = 'kk', context = '' } = request.body ?? {};
  const face = signals.face ?? {};
  const hand = signals.hand ?? {};
  const faceState = String(face.state || 'calm');
  const cleanLocale = locale === 'ru' ? 'ru' : 'kk';

  try {
    if (geminiApiKey) {
      const result = await generateGeminiText({
        instructions: systemInstructions(cleanLocale, 'camera-mood'),
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: [
                  'Give one concise wellbeing recommendation for a teacher.',
                  'Do not diagnose. Do not overstate camera accuracy. Mention that these are only external cues if useful.',
                  `Context: ${String(context).slice(0, 500) || 'mood camera scan'}`,
                  `Face signals: detected=${Boolean(face.detected)}, state=${faceState}, moodKey=${face.moodKey}, balance=${face.balance}, smile=${face.smile}, tension=${face.tension}, fatigue=${face.fatigue}`,
                  `Hand signals: detected=${Boolean(hand.detected)}, gesture=${hand.gesture}, squeeze=${hand.squeeze}`,
                ].join('\n'),
              },
            ],
          },
        ],
        maxOutputTokens: 220,
        temperature: 0.55,
      });

      return response.json({
        message: result.text || mockCameraAdvice(cleanLocale, faceState),
        source: 'gemini',
        requestId: result.requestId,
      });
    }

    if (!openai) {
      return response.json({
        message: mockCameraAdvice(cleanLocale, faceState),
        source: 'mock-backend',
      });
    }

    const result = await openai.responses.create({
      model: openaiModel,
      instructions: systemInstructions(cleanLocale, 'camera-mood'),
      input: [
        'Give one concise wellbeing recommendation for a teacher.',
        'Do not diagnose. Do not overstate camera accuracy. Mention that these are only external cues if useful.',
        `Context: ${String(context).slice(0, 500) || 'mood camera scan'}`,
        `Face signals: detected=${Boolean(face.detected)}, state=${faceState}, moodKey=${face.moodKey}, balance=${face.balance}, smile=${face.smile}, tension=${face.tension}, fatigue=${face.fatigue}`,
        `Hand signals: detected=${Boolean(hand.detected)}, gesture=${hand.gesture}, squeeze=${hand.squeeze}`,
      ].join('\n'),
      max_output_tokens: 220,
    });

    return response.json({
      message: result.output_text || mockCameraAdvice(cleanLocale, faceState),
      source: 'openai',
      requestId: result._request_id,
    });
  } catch (error) {
    console.error(`${activeProvider} camera advice error:`, error);
    return response.status(500).json({
      error: `${activeProvider}_camera_advice_failed`,
      message: mockCameraAdvice(cleanLocale, faceState),
    });
  }
});

app.post('/api/speech-to-text', upload.single('audio'), async (request, response) => {
  const locale = request.body?.locale === 'ru' ? 'ru' : 'kk';

  if (!request.file) {
    return response.status(400).json({ error: 'audio file is required' });
  }

  try {
    if (geminiApiKey) {
      const languageName = locale === 'ru' ? 'Russian' : 'Kazakh';
      const result = await generateGeminiText({
        instructions: [
          `Transcribe short teacher voice notes into ${languageName}.`,
          'Return only the spoken text. Do not add commentary, labels, or translation unless the audio itself asks for it.',
        ].join('\n'),
        contents: [
          {
            role: 'user',
            parts: [
              { text: `Transcribe this ${languageName} audio clip.` },
              {
                inlineData: {
                  mimeType: request.file.mimetype || 'audio/webm',
                  data: request.file.buffer.toString('base64'),
                },
              },
            ],
          },
        ],
        maxOutputTokens: 260,
        temperature: 0.1,
      });

      return response.json({ text: result.text ?? '', source: 'gemini' });
    }

    if (!openai) {
      return response.json({ text: '', source: 'mock-backend' });
    }

    const file = await toFile(request.file.buffer, request.file.originalname || 'audio.webm', {
      type: request.file.mimetype || 'audio/webm',
    });
    const result = await openai.audio.transcriptions.create({
      file,
      model: transcribeModel,
      language: locale,
    });

    return response.json({ text: result.text ?? '', source: 'openai' });
  } catch (error) {
    console.error(`${activeProvider} transcription error:`, error);
    return response.status(500).json({ error: `${activeProvider}_transcription_failed` });
  }
});

if (hasStaticBuild) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (_request, response) => {
    response.sendFile(resolve(distPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Teacher Support AI backend listening on http://localhost:${port}`);
  console.log(`${activeProvider} provider enabled with model ${activeModel}`);
  console.log(hasStaticBuild ? `Serving frontend from ${distPath}` : 'Static frontend build not found; API-only mode');
});
