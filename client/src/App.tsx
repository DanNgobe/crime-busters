import { App as AntApp } from "antd";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AudioRecorder from "./components/AudioRecorder";
import AudioToxicityChecker from "./components/AudioToxicityChecker";
import IncidentMap from "./components/IncidentMap";
import ReportIncident from "./components/ReportIncident";
import QuickReport from "./components/VoiceIncidentReporter";
import Dashboard from "./pages/Dashboard";

const App = () => {
  return (
    <AntApp>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<IncidentMap />} />
          <Route path="/report" element={<ReportIncident />} />
          <Route path="/toxicity" element={<AudioToxicityChecker />} />
          <Route path="/quick-report" element={<QuickReport />} />
          <Route path="/sound" element={<AudioRecorder />} />
        </Routes>
      </BrowserRouter>
    </AntApp>
  );
};

export default App;
