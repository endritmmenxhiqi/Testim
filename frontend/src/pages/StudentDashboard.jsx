import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, LayoutDashboard, History, LogOut, 
  Bell, User, BookOpen, AlertTriangle, ExternalLink, 
  Clock, Search, CheckCircle, XCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
    const [code, setCode] = useState('');
    const [examInfo, setExamInfo] = useState(null);
    const [results, setResults] = useState([]);
    const [stats, setStats] = useState({ totalExams: 0, avgScore: 0, violations: 0 });
    const [loading, setLoading] = useState(true);
    const [fetchingExam, setFetchingExam] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const isFetching = useRef(false);

    const fetchData = async () => {
        if (isFetching.current) return;
        isFetching.current = true;
        try {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }

            const res = await api.get('/exam/my-results');
            if (res.data) {
                const data = res.data;
                setResults(data);
                
                // Kalkulimi i statistikave
                const finished = data.filter(r => r.status === 'FINISHED');
                const avg = finished.length > 0 
                    ? (finished.reduce((acc, curr) => acc + curr.score, 0) / finished.length).toFixed(1)
                    : 0;
                const violationsCount = data.filter(r => r.violationLog && r.violationLog.trim() !== '').length;

                setStats({
                    totalExams: data.length,
                    avgScore: avg,
                    violations: violationsCount
                });
            }
        } catch (err) {
            console.error("Gabim gjatë marrjes së të dhënave:", err);
            if (err.response?.status === 401) {
                localStorage.clear();
                navigate('/login');
            }
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    };

    useEffect(() => {
        fetchData();
        
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchExamByCode = async () => {
        if (!code || code.length < 6) {
            toast.error("Ju lutem shkruani kodin me 6 karaktere.");
            return;
        }
        setFetchingExam(true);
        try {
            const res = await api.get(`/exam/get-by-code/${code}`);
            setExamInfo(res.data);
        } catch (err) {
            setExamInfo(null);
            if (err.response?.status === 404) toast.error('Ky kod i provimit nuk ekziston.');
            else toast.error('Gabim gjatë kërkimit të provimit.');
        } finally {
            setFetchingExam(false);
        }
    };

    const handleJoinExam = async () => {
        const startTimeRaw = examInfo.startTime || examInfo.StartTime;
        if (!startTimeRaw || startTimeRaw.startsWith('0001-01-01')) {
            toast.error("Ky provim nuk ka filluar ende! Prisni që profesori të klikojë 'Fillo'.");
            return;
        }

        let start = new Date(startTimeRaw.endsWith('Z') ? startTimeRaw : startTimeRaw + 'Z');
        const durationMin = examInfo.duration || examInfo.Duration || 0;
        const end = new Date(start.getTime() + durationMin * 60000);
        
        const now = new Date();
        if (now > end) {
            toast.error("Koha e provimit ka përfunduar (Expired). Nuk mund të hyni më.");
            return;
        }

        // Sinkronizimi Global i Kohës (kalkulimi në sekonda)
        const remainingSeconds = Math.floor((end.getTime() - now.getTime()) / 1000);

        try {
            const userId = localStorage.getItem('userId') || '0';
            const res = await api.post(`/exam/join/${examInfo.id}`);
            
            const token = localStorage.getItem('token') || '';
            const username = encodeURIComponent(localStorage.getItem('username') || 'Student');
            
            // Tani dërgojmë sekondat te `duration` në vend të minutave totale
            const dpUrl = `seb://start?url=${encodeURIComponent(examInfo.url)}&duration=${remainingSeconds}&student=${username}&studentId=${userId}&examId=${examInfo.id}&token=${token}`;
            window.location.href = dpUrl;
        } catch (err) {
            const msg = err.response?.data?.message || "Pati një gabim gjatë lidhjes me provimin.";
            toast.error(msg);
        }
    };

    if (loading) return <div style={{ padding: '100px', textAlign: 'center', color: '#64748B' }}>Duke ngarkuar...</div>;

    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, backgroundColor: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
            
            {/* SIDEBAR */}
            <aside style={{ width: '260px', backgroundColor: '#0F172A', color: '#94A3B8', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #1E293B' }}>
                    <div style={{ backgroundColor: '#2563EB', padding: '8px', borderRadius: '6px' }}><GraduationCap color="white" size={20} /></div>
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '19px' }}>ExamGuard</span>
                </div>
                <nav style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <SidebarLink icon={LayoutDashboard} label="Dashboard" active />
                    <SidebarLink icon={History} label="Rezultatet" onClick={() => navigate('/student/results')} />
                    <div style={{ marginTop: 'auto', borderTop: '1px solid #1E293B', paddingTop: '15px' }}>
                        <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', width: '100%', fontSize: '14px', padding: '12px' }}>
                            <LogOut size={18} /> Dil nga sistemi
                        </button>
                    </div>
                </nav>
            </aside>

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <header style={{ height: '64px', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
                    <div style={{ color: '#64748B', fontSize: '14px' }}>Paneli i Studentit</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <Bell size={20} color="#94A3B8" />
                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <div 
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                style={{ width: '32px', height: '32px', backgroundColor: '#2563EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                                <User size={16} color="white" />
                            </div>
                            
                            {showProfileDropdown && (
                                <div style={{ position: 'absolute', top: '45px', right: 0, width: '220px', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', overflow: 'hidden', zIndex: 100 }}>
                                    <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #F1F5F9' }}>
                                        <div style={{ width: '48px', height: '48px', margin: '0 auto 10px auto', backgroundColor: '#DBEAFE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={24} color="#2563EB" />
                                        </div>
                                        <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '15px' }}>{localStorage.getItem('username') || 'Student'}</div>
                                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{localStorage.getItem('role') || 'STUDENT'}</div>
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
                </header>

                <div style={{ padding: '40px' }}>
                    {/* WARNING BANNER FOR PROFESSORS */}
                    {localStorage.getItem('role') === 'PROFESSOR' && (
                        <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', padding: '16px', borderRadius: '12px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <AlertTriangle color="#F97316" size={24} />
                            <div>
                                <div style={{ fontWeight: 'bold', color: '#9A3412' }}>Kujdes: Jeni të loguar si Profesor!</div>
                                <div style={{ fontSize: '13px', color: '#C2410C' }}>Po përdorni panelin e studentit për testim. Testi do të regjistrohet me emrin tuaj në dashboard.</div>
                            </div>
                        </div>
                    )}

                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Përshëndetje!</h1>
                    <p style={{ color: '#64748B', marginTop: '4px' }}>Mirëseerdhët në portalin tuaj të vlerësimit.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '32px' }}>
                        <StatCard icon={BookOpen} label="Provime" value={stats.totalExams} color="#2563EB" />
                        <StatCard icon={AlertTriangle} label="Shkelje" value={stats.violations} color="#EF4444" />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '40px', maxWidth: '800px' }}>
                        
                        {/* JOIN EXAM SECTION */}
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '30px' }}>
                            <h3 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ExternalLink size={20} color="#2563EB" /> Hyr në Provim
                            </h3>
                            <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>Shkruani kodin e provimit për të filluar vlerësimin.</p>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Shënoni kodin për të filluar testin"
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '16px', fontWeight: 'bold', letterSpacing: '2px', outline: 'none', textAlign: 'center' }}
                                />
                                <button 
                                    onClick={fetchExamByCode}
                                    disabled={fetchingExam}
                                    style={{ backgroundColor: '#2563EB', color: 'white', border: 'none', padding: '0 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    {fetchingExam ? '...' : 'Kërko'}
                                </button>
                            </div>

                            {examInfo && (
                                <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#F8F9FA', borderRadius: '12px', border: '1px solid #E9ECEF' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '16px' }}>{examInfo.title}</div>
                                            <div style={{ color: '#64748B', fontSize: '13px' }}>{examInfo.subject}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#E0E7FF', color: '#4338CA', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                                            <Clock size={14} /> {examInfo.duration} Min
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleJoinExam}
                                        style={{ width: '100%', backgroundColor: '#10B981', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}>
                                        NIS PROVIMIN NË SEB
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const SidebarLink = ({ icon: Icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', transition: 'background 0.2s', backgroundColor: active ? '#2563EB' : 'transparent', color: active ? 'white' : '#94A3B8' }}
  >
    <Icon size={18} /> <span style={{ fontSize: '14px', fontWeight: active ? '600' : '400' }}>{label}</span>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
  <div 
    onClick={onClick}
    style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '18px', cursor: onClick ? 'pointer' : 'default' }}
  >
    <div style={{ backgroundColor: `${color}10`, padding: '12px', borderRadius: '12px', color: color }}><Icon size={26} /></div>
    <div><div style={{ fontSize: '22px', fontWeight: '800' }}>{value}</div><div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>{label}</div></div>
  </div>
);

export default StudentDashboard;