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
import { AchievementsPage } from './pages/AchievementsPage';
import { ConfigPage } from './pages/ConfigPage';
import { PacketJourneyPage } from './features/packet-journey/pages/PacketJourneyPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/mapa" element={<LearningMapPage />} />
          <Route path="/simulador" element={<SimulatorPage />} />
          <Route path="/labs" element={<LabsPage />} />
          <Route path="/labs/:id" element={<LabViewPage />} />
          <Route path="/troubleshooting" element={<TroubleshootingPage />} />
          <Route path="/prova" element={<ProvaPage />} />
          <Route path="/conquistas" element={<AchievementsPage />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/viagem" element={<PacketJourneyPage />} />
          <Route path="*" element={<div className="text-center py-20 text-[--color-text-muted]">Página não encontrada</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}