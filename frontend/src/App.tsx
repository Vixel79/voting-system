import React, { useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate } from
'react-router-dom';
import { EventProvider } from './contexts/EventContext';
import { ToastProvider } from './components/ui/Toast';
import { AdminShell } from './components/admin/AdminShell';

import { AdminLogin } from './pages/admin/AdminLogin';
import { Overview } from './pages/admin/Overview';
import { AudienceControl } from './pages/admin/AudienceControl';
import { VoteManagement } from './pages/admin/VoteManagement';
import { JudgesManagement } from './pages/admin/JudgesManagement';
import { JudgesResults } from './pages/admin/JudgesResults';
import { FinalScore } from './pages/admin/FinalScore';
import { StageControl } from './pages/admin/StageControl';
import { TeamsAdmin } from './pages/admin/TeamsAdmin';
import { EventSettings } from './pages/admin/EventSettings';

function LoginRoute({ onAuth }: {onAuth: () => void;}) {
  const navigate = useNavigate();
  return (
    <AdminLogin
      onAuth={() => {
        onAuth();
        navigate('/admin');
      }} />);


}

export default function App() {
  const [authed, setAuthed] = useState(false);

  const guard = (node: React.ReactNode) =>
  authed ? <AdminShell>{node}</AdminShell> : <Navigate to="/admin/login" replace />;

  return (
    <EventProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="min-h-full w-full bg-ink-950">
            <Routes>

              <Route
                path="/admin/login"
                element={<LoginRoute onAuth={() => setAuthed(true)} />} />
              
              <Route path="/admin" element={guard(<Overview />)} />
              <Route path="/admin/audience" element={guard(<AudienceControl />)} />
              <Route path="/admin/ballots" element={guard(<VoteManagement />)} />
              <Route path="/admin/judges" element={guard(<JudgesManagement />)} />
              <Route
                path="/admin/judges-results"
                element={guard(<JudgesResults />)} />
              
              <Route path="/admin/final" element={guard(<FinalScore />)} />
              <Route path="/admin/stage" element={guard(<StageControl />)} />
              <Route path="/admin/teams" element={guard(<TeamsAdmin />)} />
              <Route path="/admin/settings" element={guard(<EventSettings />)} />
              <Route path="*" element={<Navigate to="/admin/login" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </EventProvider>);

}