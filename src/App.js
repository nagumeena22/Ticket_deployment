import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Home from './pages/Home';
import NewTicket from './components/Tickets/NewTicket';
import MyTickets from './pages/MyTickets';
import GeminiChat from './pages/GeminiChat';
import ExcelUpload from './pages/ExcelUpload';
import Analytics from './pages/Analytics';
import SLATracker from './pages/SLATracker';
import KnowledgeBase from './pages/KnowledgeBase';
import MailCenter from './pages/MailCenter';
import Triage from './pages/Triage';
import AnomalyRadar from './pages/AnomalyRadar';
import CommandCenter from './pages/CommandCenter';
import MaintenancePlanner from './pages/MaintenancePlanner';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/new-ticket" element={<NewTicket />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/chatbot" element={<GeminiChat />} />
        <Route path="/excel-upload" element={<ExcelUpload />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/sla-tracker" element={<SLATracker />} />
        <Route path="/knowledge-base" element={<KnowledgeBase />} />
        <Route path="/mail-center" element={<MailCenter />} />
        <Route path="/triage" element={<Triage />} />
        <Route path="/anomaly-radar" element={<AnomalyRadar />} />
        <Route path="/command-center" element={<CommandCenter />} />
        <Route path="/maintenance" element={<MaintenancePlanner />} />
      </Routes>
    </Router>
  );
}

export default App;
