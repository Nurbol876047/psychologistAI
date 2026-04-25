# Teacher Support AI / Ұстазға көмек AI

AI-платформа эмоциональной поддержки учителей против выгорания. Интерфейс сделан на казахском языке с переключателем Kazakh / Russian, включает голосовой AI-модуль, анализ состояния, антистресс-практики, дневник эмоций и живой 3D emotional core.

## Стек

- React + Vite
- Tailwind CSS
- React Router
- Framer Motion
- Three.js + React Three Fiber + Drei
- Lucide React icons
- Web Speech API и Web Audio API для voice UI

## Быстрый запуск

```bash
npm install
npm run dev
```

Откройте:

```text
http://localhost:5173
```

Production build:

```bash
npm run build
npm start
```

Проверка кода:

```bash
npm run lint
```

Визуальная проверка 3D canvas через Chrome / Playwright Core:

```bash
npm run verify:visual
```

## Структура

```text
src/
  assets/
  components/
    layout/
    shared/
    stress/
    three/
    voice/
  context/
  data/
  hooks/
  pages/
  services/
  utils/
```

## Основные страницы

- `/` - Home с hero screen и 3D glowing emotional core
- `/voice` - AI Voice Support, микрофон, статусы idle/listening/thinking/speaking, chat UI
- `/mood` - Күй-жағдайды талдау, mini survey и мягкие рекомендации
- `/anti-stress` - антистресс карточки и 1 минут тыныс алу
- `/diary` - эмоция күнделігі, заметки, timeline и аналитика
- `/about` - жоба туралы және backend integration architecture

## Backend integration

Frontend не хранит Gemini API key. Ключ должен находиться только на backend.

В проект добавлен минимальный backend на Express:

```text
server/index.js
```

1. Создайте локальный `.env` на основе `.env.example`.
2. Вставьте новый Gemini API key только в `.env`.
3. Запустите приложение:

```bash
npm run dev
```

Эта команда поднимает и backend, и frontend. Если нужно запустить их отдельно:

```bash
npm run dev:api
npm run dev:web
```

Vite proxy уже настроен на `http://localhost:8787`, поэтому frontend отправляет:

```text
POST /api/chat
POST /api/speech-to-text
```

Ожидаемый контракт для `/api/chat`:

```json
{
  "message": "Бүгін қатты шаршадым",
  "history": [],
  "locale": "kk",
  "mode": "support"
}
```

Ответ:

```json
{
  "message": "Сізді түсінемін. Қазір ең жақын бір ғана қадамды таңдауға болады."
}
```

Для Render используйте Web Service, а не Static Site:

```text
Build Command: npm ci && npm run build
Start Command: npm start
Environment: GEMINI_API_KEY=ваш ключ
```

Если `/api/health` на production возвращает `404`, значит запущен только статический frontend, и чат не сможет обращаться к Gemini.
