import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import VoterPage from './pages/VoterPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function App() {
  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="nav-brand">LivePoll</Link>
        <div className="nav-links">
          <Link to="/">Vote</Link>
          <Link to="/admin">Admin</Link>
        </div>
      </nav>
      
      <main className="page-wrapper">
        <Routes>
          <Route path="/" element={<VoterPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
