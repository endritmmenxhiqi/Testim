import React, { useState, useEffect, useRef } from "react";
import { 
  GraduationCap, LayoutDashboard, PlusCircle, Users, 
  Monitor, ClipboardList, LogOut, Bell, User, ArrowLeft, CheckCircle2, Copy
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import api from "../../api";
import toast from "react-hot-toast";

const CreateExam = () => {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const examData = {
        title: title,
        subject: subject,
        url: url,
        duration: parseInt(duration)
      };

      const response = await api.post('/exam/create', examData);

      if (response.status === 200) {
        const data = response.data;
        const code = data.examCode || data.code || data.Code;
        setGeneratedCode(code);
        toast.success("Provimi u krijua me sukses!");
        setShowSuccessModal(true);
      } else {
        toast.error("Gabim gjatë krijimit të provimit.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data || "Nuk mund të lidhet me serverin.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success("Kodi u kopjua!");
  };

  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0',
    marginTop: '6px', fontSize: '14px', outline: 'none', backgroundColor: '#FFFFFF'
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, backgroundColor: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: '260px', backgroundColor: '#0F172A', color: '#94A3B8', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #1E293B' }}>
          <div style={{ backgroundColor: '#2563EB', padding: '8px', borderRadius: '6px' }}>
            <GraduationCap color="white" size={20} />
          </div>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '19px' }}>ExamGuard</span>
        </div>

        {/* NAVIGIMI KRYESOR */}
        <nav style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <SidebarLink icon={LayoutDashboard} label="Dashboard" onClick={() => navigate('/professor')} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#2563EB', color: 'white', borderRadius: '8px', cursor: 'pointer', marginBottom: '10px' }}>
            <PlusCircle size={18} /> <span style={{ fontWeight: '600' }}>Krijo Provim</span>
          </div>

          <SidebarLink icon={Monitor} label="Live Monitoring" onClick={() => navigate('/logs')} />
          <SidebarLink icon={ClipboardList} label="Raportet" onClick={() => navigate('/reports')} />
          <SidebarLink icon={Users} label="Rezultatet" onClick={() => navigate('/results')} />

          {/* LOGOUT NE FUND TE SIDEBAR-IT */}
          <div style={{ marginTop: 'auto', borderTop: '1px solid #1E293B', paddingTop: '15px' }}>
             <SidebarLink 
                icon={LogOut} 
                label="Dil nga sistemi" 
                onClick={() => { localStorage.clear(); navigate('/login'); }} 
             />
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <header style={{ height: '64px', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
          <button onClick={() => navigate('/professor')} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
            <ArrowLeft size={18} /> Kthehu te Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Bell size={20} color="#94A3B8" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: '#1E293B' }}>Profesor</span>
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                  <div 
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      style={{ width: '32px', height: '32px', backgroundColor: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                      <User size={18} color="#64748B" />
                  </div>
                  
                  {showProfileDropdown && (
                      <div style={{ position: 'absolute', top: '45px', right: 0, width: '220px', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', overflow: 'hidden', zIndex: 100 }}>
                          <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #F1F5F9' }}>
                              <div style={{ width: '48px', height: '48px', margin: '0 auto 10px auto', backgroundColor: '#DBEAFE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <User size={24} color="#2563EB" />
                              </div>
                              <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '15px' }}>{localStorage.getItem('username') || 'Profesor'}</div>
                              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{localStorage.getItem('role') || 'PROFESSOR'}</div>
                          </div>
                          <div>
                              <button 
                                  onClick={() => { localStorage.clear(); navigate('/login'); }}
                                  style={{ width: '100%', padding: '12px', border: 'none', backgroundColor: '#FFF1F2', color: '#E11D48', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}
                              >
                                  <LogOut size={16} /> Dil nga llogaria
                              </button>
                          </div>
                      </div>
                  )}
              </div>
            </div>
          </div>
        </header>

        <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '650px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', marginBottom: '30px' }}>Krijo Provim të Ri</h1>
            <div style={{ backgroundColor: 'white', padding: '35px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>Titulli i Provimit</label>
                  <input type="text" required placeholder="p.sh. Kolofiumi 1" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>Lënda</label>
                  <input type="text" required placeholder="p.sh. Kimi" value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>Kohëzgjatja (minuta)</label>
                    <input type="number" required placeholder="60" value={duration} onChange={(e) => setDuration(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>URL e Testit</label>
                    <input type="url" required placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: '#1E3A8A', color: 'white', fontWeight: '800', padding: '14px', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? "Duke procesuar..." : "Krijo Provimin"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '450px', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#DCFCE7', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle2 size={32} color="#16A34A" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>Provimi u krijua!</h2>
            <div style={{ backgroundColor: '#F1F5F9', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '24px', fontWeight: '900', color: '#1E3A8A' }}>{generatedCode}</span>
              <button onClick={copyToClipboard} style={{ background: 'white', border: 'none', padding: '8px', cursor: 'pointer' }}><Copy size={18}/></button>
            </div>
            <button onClick={() => navigate('/professor')} style={{ width: '100%', backgroundColor: '#0F172A', color: 'white', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: '600' }}>Vazhdo te Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarLink = ({ icon: Icon, label, onClick }) => (
  <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', cursor: 'pointer', color: '#94A3B8', transition: 'all 0.2s' }}>
    <Icon size={18} /> <span style={{ fontSize: '14px' }}>{label}</span>
  </div>
);

export default CreateExam;
