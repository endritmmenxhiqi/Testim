import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/StudentDashboard';
import StudentResults from './pages/StudentResults';
import AdminDashboard from './pages/AdminDashboard';
import ProfessorDashboard from './pages/profesor/ProfessorDashboard'; 
import CreateExam from './pages/profesor/CreateExam'; 
import EventLogs from './pages/profesor/EventLog';
import Reports from './pages/profesor/Reports';
import ExamResults from './pages/profesor/ExamResults';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Dashboards */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/results" element={<StudentResults />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/professor" element={<ProfessorDashboard />} />
        <Route path="/create-exam" element={<CreateExam />} />
        <Route path="/logs" element={<EventLogs />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/results" element={<ExamResults />} />

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;