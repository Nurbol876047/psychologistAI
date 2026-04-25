import {
  Activity,
  AudioLines,
  Brain,
  CalendarHeart,
  HeartPulse,
  Hand,
  Mic2,
  Orbit,
  Sparkles,
  Waves,
} from 'lucide-react';

export const modules = [
  {
    title: 'Дауыстық қарым-қатынас',
    description: 'Мұғалім дауыспен сөйлейді, AI қысқа әрі жылы жауап беріп, қажет болса оны дыбыстайды.',
    icon: Mic2,
    to: '/voice',
    tone: 'cyan',
  },
  {
    title: 'Камера арқылы күй сигналы',
    description: 'Бет пен қолдың сыртқы белгілері браузер ішінде оқылып, жұмсақ ұсынысқа айналады.',
    icon: AudioLines,
    to: '/mood',
    tone: 'blue',
  },
  {
    title: 'Күй-жағдайды талдау',
    description: 'Жылдам self-check арқылы шаршау, күйзеліс және тыныштық деңгейін көру.',
    icon: Brain,
    to: '/mood',
    tone: 'violet',
  },
  {
    title: 'Антистресс модульдері',
    description: '1 минуттық тыныс алу, gesture stress ball және жылдам тыныштану құралдары.',
    icon: HeartPulse,
    to: '/anti-stress',
    tone: 'green',
  },
  {
    title: 'Эмоция күнделігі',
    description: 'Күн сайын көңіл-күйді, қысқа жазбаны және апта динамикасын сақтау.',
    icon: CalendarHeart,
    to: '/diary',
    tone: 'peach',
  },
  {
    title: '3D интерфейс',
    description: 'Эмоциялық core дауысқа, күйге және AI жауабына қарай жұмсақ қозғалады.',
    icon: Orbit,
    to: '/',
    tone: 'iris',
  },
];

export const moodOptions = [
  {
    key: 'calm',
    label: 'тыныш',
    score: 74,
    color: '#87C4A3',
    recommendation:
      'Қазіргі тыныш күйіңізді сақтауға тырысыңыз. Күніңіздің ең жеңіл сәтін белгілеп, қысқа демалысқа 3 минут бөліңіз.',
  },
  {
    key: 'tired',
    label: 'шаршадым',
    score: 42,
    color: '#8EC5FF',
    recommendation:
      'Шаршау - сіздің көп күш жұмсағаныңыздың белгісі. Бір міндетті кейінге қалдырып, су ішіп, иығыңызды босатыңыз.',
  },
  {
    key: 'stress',
    label: 'күйзеліс бар',
    score: 28,
    color: '#F0B38A',
    recommendation:
      'Сіз жалғыз емессіз. Қазір ең маңыздысы - қарқынды бәсеңдету. Бір минуттық тыныс алу модулін ашып, ойды бір нүктеге жинақтайық.',
  },
  {
    key: 'anxious',
    label: 'алаңдап тұрмын',
    score: 36,
    color: '#7C6DF2',
    recommendation:
      'Алаңдау болғанда нақты бір шағын әрекет көмектеседі. Сізді мазалаған ойды жазып, “қазір қолымнан келетіні не?” деп бөліп көріңіз.',
  },
  {
    key: 'happy',
    label: 'қуаныштымын',
    score: 88,
    color: '#55DDE0',
    recommendation:
      'Керемет. Осы энергияны сақтап қалу үшін бүгінгі жақсы сәтті күнделікке жазыңыз және өзіңізге алғыс айтыңыз.',
  },
];

export const antiStressCards = [
  {
    title: '1 минут тыныс алу',
    description: 'Көзді демалдырып, тыныс ырғағын баяулататын guided practice.',
    icon: Waves,
    state: 'calming',
  },
  {
    title: 'Жылдам тыныштану',
    description: 'Сабақ арасындағы қысқа grounding жаттығуы: дене, тыныс, назар.',
    icon: Activity,
    state: 'idle',
  },
  {
    title: 'Дауыспен қолдау',
    description: 'AI-мен жұмсақ сөйлесіп, ауыр ойды сөзге айналдыру.',
    icon: Sparkles,
    state: 'speaking',
  },
  {
    title: 'Қолмен шар',
    description: 'Камера қол қимылын көргенде жұмсақ шар созылып, қысылады.',
    icon: Hand,
    state: 'calming',
  },
];

export const diaryEmotions = [
  { key: 'joy', label: 'қуаныш', color: '#55DDE0', value: 82 },
  { key: 'tired', label: 'шаршау', color: '#8EC5FF', value: 46 },
  { key: 'stress', label: 'стресс', color: '#F0B38A', value: 34 },
  { key: 'peace', label: 'тыныштық', color: '#87C4A3', value: 76 },
  { key: 'worry', label: 'алаңдау', color: '#7C6DF2', value: 40 },
];

export const diaryEntries = [
  {
    id: 1,
    date: 'Бүгін',
    mood: 'тыныштық',
    note: 'Сыныппен жылы әңгіме болды. Өзімді көбірек тыңдағым келеді.',
    color: '#87C4A3',
  },
  {
    id: 2,
    date: 'Кеше',
    mood: 'шаршау',
    note: 'Құжат жұмысы көп болды, кешке 10 минут тыныс алу көмектесті.',
    color: '#8EC5FF',
  },
  {
    id: 3,
    date: 'Дүйсенбі',
    mood: 'қуаныш',
    note: 'Оқушылар жаңа тақырыпты жақсы қабылдады.',
    color: '#55DDE0',
  },
];

export const weeklyMood = [
  { label: 'Дс', value: 48, color: '#8EC5FF' },
  { label: 'Сс', value: 58, color: '#55DDE0' },
  { label: 'Ср', value: 42, color: '#F0B38A' },
  { label: 'Бс', value: 72, color: '#87C4A3' },
  { label: 'Жм', value: 65, color: '#7C6DF2' },
  { label: 'Сн', value: 78, color: '#55DDE0' },
  { label: 'Жк', value: 70, color: '#87C4A3' },
];

export const monthMood = [
  { label: '1', value: 50, color: '#8EC5FF' },
  { label: '2', value: 61, color: '#55DDE0' },
  { label: '3', value: 44, color: '#F0B38A' },
  { label: '4', value: 68, color: '#87C4A3' },
  { label: '5', value: 72, color: '#55DDE0' },
  { label: '6', value: 56, color: '#7C6DF2' },
  { label: '7', value: 76, color: '#87C4A3' },
  { label: '8', value: 63, color: '#8EC5FF' },
];

export const chatSeed = [
  {
    role: 'ai',
    content:
      'Сәлеметсіз бе! Мен сізді тыңдауға дайынмын. Бүгінгі күніңізде ең ауыр болған сәт қандай?',
  },
];
