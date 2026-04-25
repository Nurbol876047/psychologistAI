import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import AboutProject from './pages/AboutProject.jsx';
import AntiStress from './pages/AntiStress.jsx';
import EmotionDiary from './pages/EmotionDiary.jsx';
import Home from './pages/Home.jsx';
import MoodAnalysis from './pages/MoodAnalysis.jsx';
import VoiceSupport from './pages/VoiceSupport.jsx';

export default function App() {
  const location = useLocation();

  return (
    <Layout>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/voice" element={<VoiceSupport />} />
          <Route path="/mood" element={<MoodAnalysis />} />
          <Route path="/anti-stress" element={<AntiStress />} />
          <Route path="/diary" element={<EmotionDiary />} />
          <Route path="/about" element={<AboutProject />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}
