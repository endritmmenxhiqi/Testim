import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Dërgimi i të dhënave në Backend
      const res = await api.post('/auth/login', { 
        username: username, 
        password: password 
      });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('userId', res.data.id);
      localStorage.setItem('username', res.data.username);

      toast.success('Mirësevini!');
      if (res.data.role === 'STUDENT') navigate('/student');
      else if (res.data.role === 'ADMIN') navigate('/admin');
      else navigate('/professor');
    } catch (err) {
      if (err.response?.data && typeof err.response.data === 'object') {
        setError(err.response.data.title || 'Të dhëna të pasakta.');
      } else {
        setError(err.response?.data || 'Përdoruesi ose fjalëkalimi i gabuar.');
      }
    }
  };

  return (
    <div className="login-wrapper">
      <div className="logo-container">
        <div className="logo-icon">
          <GraduationCap size={35} color="white" />
        </div>
        <h1>ExamGuard</h1>
        <p>Platforma e sigurt e provimeve online</p>
      </div>

      <div className="login-card">
        <div className="card-header">
          <h2>Hyr në llogari</h2>
          <p>Shkruaj të dhënat tuaja për të vazhduar</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}
          
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              placeholder="p.sh. filanfisteku" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            {/* Rreshti i titullit të fjalëkalimit me linkun anash */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ marginBottom: 0 }}>Fjalëkalimi</label>
              <button 
                type="button" 
                className="link-blue" 
                style={{ 
                  fontSize: '12px', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  padding: 0,
                  color: '#2563eb',
                  fontWeight: '500'
                }}
                onClick={() => navigate('/forgot-password')}
              >
                Harruat fjalëkalimin?
              </button>
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login" style={{ marginTop: '10px' }}>Hyr</button>
        </form>

        <div className="footer-links">
          <p>Nuk ke llogari? 
            <button 
              type="button"
              className="link-blue" 
              onClick={() => navigate('/register')}
            > 
              Krijo llogari
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;