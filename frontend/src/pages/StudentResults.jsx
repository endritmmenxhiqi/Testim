import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, LayoutDashboard, History, LogOut, 
  Bell, User, FileCheck, Calendar, Clock, AlertTriangle, ArrowLeft, Search, CheckCircle, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const StudentResults = () => {
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const itemsPerPage = 8;

    const fetchResults = async () => {
        try {
            const res = await api.get('/exam/my-results');
            if (res.data) {
                // Renditja: Më të rejat të parat
                const sortedData = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setResults(sortedData);
            }
        } catch (err) {
            console.error("Gabim gjatë marrjes së rezultateve:", err);
            if (err.response?.status === 401) navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Logjika e Filtrimit
    const filteredResults = results.filter(r => {
        const matchesSearch = r.examTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (r.subject && r.subject.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesDate = !dateFilter || (r.date && r.date.startsWith(dateFilter));
        return matchesSearch && matchesDate;
    });

    // Logjika e Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

    const onPageChange = (page) => {
        setCurrentPage(page);
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
                    <SidebarLink icon={LayoutDashboard} label="Dashboard" onClick={() => navigate('/student')} />
                    <SidebarLink icon={History} label="Rezultatet" active />
                    <div style={{ marginTop: 'auto', borderTop: '1px solid #1E293B', paddingTop: '15px' }}>
                        <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', width: '100%', fontSize: '14px', padding: '12px' }}>
                            <LogOut size={18} /> Dil nga sistemi
                        </button>
                    </div>
                </nav>
            </aside>

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <header style={{ height: '64px', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button onClick={() => navigate('/student')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600' }}>
                            <ArrowLeft size={18} /> Dashboard
                        </button>
                        <div style={{ height: '16px', width: '1px', backgroundColor: '#E2E8F0' }}></div>
                        <div style={{ color: '#1E293B', fontSize: '14px', fontWeight: 'bold' }}>Historiku i Rezultateve</div>
                    </div>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Rezultatet tuaja</h1>
                            <p style={{ color: '#64748B', marginTop: '8px' }}>Përmbledhja e të gjitha provimeve dhe vlerësimet përkatëse.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ position: 'relative' }}>
                                <Search style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }} size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Kërko me titull ose lëndë..." 
                                    style={{ padding: '10px 15px 10px 40px', borderRadius: '10px', border: '1px solid #E2E8F0', width: '250px', outline: 'none' }}
                                    onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', padding: '0 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                <Calendar size={18} color="#94A3B8" />
                                <input 
                                    type="date" 
                                    style={{ border: 'none', padding: '10px 0', fontSize: '14px', color: '#1E293B', outline: 'none' }}
                                    onChange={(e) => {setDateFilter(e.target.value); setCurrentPage(1);}}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                                    <th style={thStyle}>PROVIMI</th>
                                    <th style={thStyle}>DATA</th>
                                    <th style={thStyle}>STATUSI</th>
                                    <th style={thStyle}>VLERËSIMI</th>
                                    <th style={thStyle}>VËREJTJE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? currentItems.map((r, i) => (
                                    <tr key={i} style={{ borderBottom: i === currentItems.length - 1 && totalPages <= 1 ? 'none' : '1px solid #F8FAFC', transition: 'background 0.2s' }}>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ backgroundColor: '#EFF6FF', padding: '8px', borderRadius: '8px' }}><FileCheck size={18} color="#2563EB" /></div>
                                                <div style={{ fontWeight: '700', color: '#1E293B' }}>{r.examTitle}</div>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}>
                                                <Calendar size={14} /> {new Date(r.date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <StatusBadge status={r.status} />
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontSize: '18px', fontWeight: '900', color: r.status === 'FINISHED' ? '#10B981' : '#F59E0B' }}>
                                                {r.status === 'FINISHED' ? `${r.score || 0}/100` : '-'}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            {r.violationLog && r.violationLog.trim() !== '' ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', backgroundColor: '#FEE2E2', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
                                                    <AlertTriangle size={14} /> Ka vërejtje
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', backgroundColor: '#DCFCE7', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
                                                    <CheckCircle size={14} /> Pa shkelje
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>Nuk u gjet asnjë rezultat.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        
                        {/* Pagination UI */}
                        {totalPages > 1 && (
                            <div style={{ padding: '20px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                <button 
                                    disabled={currentPage === 1}
                                    onClick={() => onPageChange(currentPage - 1)}
                                    style={paginationButtonStyle}
                                >Para</button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => onPageChange(i + 1)}
                                        style={{
                                            ...paginationButtonStyle,
                                            backgroundColor: currentPage === i + 1 ? '#2563EB' : 'white',
                                            color: currentPage === i + 1 ? 'white' : '#64748B',
                                            fontWeight: currentPage === i + 1 ? '800' : '500'
                                        }}
                                    >{i + 1}</button>
                                ))}
                                <button 
                                    disabled={currentPage === totalPages}
                                    onClick={() => onPageChange(currentPage + 1)}
                                    style={paginationButtonStyle}
                                >Pas</button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    let styles = { padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' };
    if (status === 'FINISHED') return <span style={{ ...styles, backgroundColor: '#DCFCE7', color: '#16A34A' }}>PËRFUNDUAR</span>;
    if (status === 'IN_PROGRESS') return <span style={{ ...styles, backgroundColor: '#E0E7FF', color: '#4338CA' }}>NË PROCES</span>;
    if (status === 'DISQUALIFIED') return <span style={{ ...styles, backgroundColor: '#FEE2E2', color: '#B91C1C' }}>PËRJASHTUAR</span>;
    return <span style={{ ...styles, backgroundColor: '#F3F4F6', color: '#6B7280' }}>{status}</span>;
}

const thStyle = { padding: '20px 24px', textAlign: 'left', color: '#64748B', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '24px', fontSize: '14px' };

const paginationButtonStyle = {
    padding: '8px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', 
    backgroundColor: 'white', cursor: 'pointer', fontSize: '14px', color: '#64748B',
    transition: 'all 0.2s'
};

const SidebarLink = ({ icon: Icon, label, onClick, active }) => (
  <div 
    onClick={onClick} 
    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', transition: 'background 0.2s', backgroundColor: active ? '#2563EB' : 'transparent', color: active ? 'white' : '#94A3B8' }}
  >
    <Icon size={18} /> <span style={{ fontSize: '14px', fontWeight: active ? '600' : '400' }}>{label}</span>
  </div>
);

export default StudentResults;
