import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import api from '../api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    // Kontrolli i fjalëkalimit në frontend
    if (password !== confirmPassword) {
      setError('Fjalëkalimet nuk përputhen.');
      return;
    }

    try {
      // Dërgimi i të dhënave sipas AuthController.cs në Backend
      await api.post('/auth/register', { 
        username: username, 
        email: email, 
        password: password 
      });
      
      alert('Llogaria u krijua me sukses!');
      navigate('/login');
    } catch (err) {
      // Rregullimi i crash-it nëse backend kthen objekt gabimi
      if (err.response?.data && typeof err.response.data === 'object') {
        setError(err.response.data.title || 'Gabim gjatë regjistrimit.');
      } else {
        setError(err.response?.data || 'Serveri nuk po përgjigjet.');
      }
    }
  };

  return (
    <div className="login-wrapper" style={{ overflow: 'hidden', height: '100vh' }}>
      <div className="logo-container" style={{ marginBottom: '10px' }}>
        <div className="logo-icon" style={{ width: '55px', height: '55px', marginBottom: '10px' }}>
          <GraduationCap size={32} color="white" />
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827' }}>ExamGuard</h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Krijo llogarinë tënde të re</p>
      </div>

      <div className="login-card" style={{ maxWidth: '500px', padding: '30px 40px' }}>
        <div className="card-header" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px' }}>Regjistrohu</h2>
        </div>

        <form onSubmit={handleRegister}>
          {error && (
            <div className="error-msg" style={{ padding: '10px', marginBottom: '15px', fontSize: '13px' }}>
              {error}
            </div>
          )}
          
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600' }}>Username</label>
            <input 
              type="text" 
              placeholder="p.sh. filan123" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ padding: '12px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600' }}>Email</label>
            <input 
              type="email" 
              placeholder="email@shembull.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: '12px' }}
            />
          </div>

          {/* Rreshti me dy fjalëkalimet anash njëri-tjetrit */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Fjalëkalimi</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ padding: '12px' }}
              />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Konfirmo</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ padding: '12px' }}
              />
            </div>
          </div>

          <button type="submit" className="btn-login" style={{ padding: '12px', fontWeight: '600' }}>
            Regjistrohu
          </button>
        </form>

        <div className="footer-links" style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Ke llogari? 
            <button 
              type="button" // Ky tip parandalon bllokimin e navigimit
              className="link-blue" 
              style={{ 
                marginLeft: '8px', 
                fontWeight: '700', 
                background: 'none', 
                border: 'none', 
                padding: 0, 
                color: '#2563eb', 
                cursor: 'pointer' 
              }}
              onClick={() => navigate('/login')}
            >
              Hyr këtu
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;