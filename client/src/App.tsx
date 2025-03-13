import { App as AntApp } from "antd";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
          <Route path="/quick-report" element={<QuickReport />} />
        </Routes>
      </BrowserRouter>
    </AntApp>
  );
};

export default App;
