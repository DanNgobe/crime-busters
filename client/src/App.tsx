import { App as AntApp } from 'antd';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import IncidentMap from './components/IncidentMap';
import ReportIncident from './components/ReportIncident';

const App = () => {
  return (
    <AntApp>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IncidentMap />} />
          <Route path="/report" element={<ReportIncident />} />
        </Routes>
      </BrowserRouter>
    </AntApp>
  );
};

export default App;
