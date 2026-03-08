import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SocioDashboard from './pages/SocioDashboard';
import ConductorDashboard from './pages/ConductorDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/socio" element={<SocioDashboard />} />
        <Route path="/conductor" element={<ConductorDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
