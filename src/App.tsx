import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { LearningMapPage } from './pages/LearningMapPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { LabsPage } from './pages/LabsPage';
import { LabViewPage } from './pages/LabViewPage';
import { TroubleshootingPage } from './pages/TroubleshootingPage';
import { ProvaPage } from './pages/ProvaPage';
import { QuizzesPage } from './pages/QuizzesPage';
import { LearnLessonPage } from './pages/LearnLessonPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { ConfigPage } from './pages/ConfigPage';
import { CommunityPage } from './pages/CommunityPage';
import { PacketJourneyPage } from './features/packet-journey/pages/PacketJourneyPage';
import { DesktopOnlyGate } from './components/common/DesktopOnlyGate';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/entrar" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/mapa" element={<LearningMapPage />} />
          <Route
            path="/simulador"
            element={
              <DesktopOnlyGate>
                <SimulatorPage />
              </DesktopOnlyGate>
            }
          />
          <Route
            path="/labs"
            element={
              <DesktopOnlyGate>
                <LabsPage />
              </DesktopOnlyGate>
            }
          />
          <Route
            path="/labs/:id"
            element={
              <DesktopOnlyGate>
                <LabViewPage />
              </DesktopOnlyGate>
            }
          />
          <Route
            path="/troubleshooting"
            element={
              <DesktopOnlyGate>
                <TroubleshootingPage />
              </DesktopOnlyGate>
            }
          />
          <Route path="/prova" element={<ProvaPage />} />
          <Route path="/questionarios" element={<QuizzesPage />} />
          <Route path="/aprender/:lessonId" element={<LearnLessonPage />} />
          <Route path="/conquistas" element={<AchievementsPage />} />
          <Route path="/comunidade" element={<CommunityPage />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/viagem" element={<PacketJourneyPage />} />
          <Route path="*" element={<div className="text-center py-20 text-[--color-text-muted]">Página não encontrada</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}