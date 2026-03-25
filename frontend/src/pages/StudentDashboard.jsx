import React, { useState } from 'react';
import { Search, Play, History, LogOut, ExternalLink, Clock, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const StudentDashboard = () => {
    const [code, setCode] = useState('');
    const [examInfo, setExamInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchExam = async () => {
        // Profesi nuk duhet të hyjë si student!
        const role = localStorage.getItem('role');
        if (role === 'PROFESSOR' || role === 'ADMIN') {
            alert("Ky panel është vetëm për studentë. Ju jeni të loguar si " + role + ". Ju lutem dilni dhe hyni me llogarinë e studentit.");
            return;
        }

        if (!code || code.length < 6) {
            alert("Ju lutem shkruani kodin me 6 karaktere.");
            return;
        }

        setLoading(true);
        try {
            // Rregullimi kryesor: Thirrja e endpoint-it të saktë 'get-by-code'
            const res = await api.get(`/exam/get-by-code/${code}`);
            setExamInfo(res.data);
        } catch (err) {
            console.error("Gabim gjatë kërkimit të provimit:", err);
            setExamInfo(null);
            
            if (err.response && err.response.status === 404) {
                alert('Ky kod i provimit nuk ekziston.');
            } else {
                alert('Gabim në autorizim ose serveri nuk po përgjigjet.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="min-h-screen p-6 md:p-12 bg-[#0F172A] text-white">
            {/* Header */}
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold">Student Portal</h1>
                    <p className="text-blue-300">Gati për vlerësimin tuaj?</p>
                </div>
                <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                >
                    <LogOut className="w-4 h-4" /> Logout
                </button>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Launchpad Section */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Play className="text-green-400" /> Exam Launchpad
                    </h2>

                    <div className="space-y-4">
                        <label className="block text-sm text-gray-400">Shkruani kodin e provimit (6 karaktere)</label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-center text-2xl tracking-widest uppercase font-mono focus:outline-none focus:border-blue-500 transition-all"
                                placeholder="XOC32Q"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                            />
                            <button 
                                onClick={fetchExam} 
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-500 p-4 rounded-xl transition-all disabled:opacity-50"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Detajet e Provimit (Shfaqen vetëm nëse kodi është i saktë) */}
                        {examInfo && (
                            <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{examInfo.title}</h3>
                                        <p className="text-blue-300 flex items-center gap-1 text-sm mt-1">
                                            <BookOpen size={14} /> {examInfo.subject}
                                        </p>
                                    </div>
                                    <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                        <Clock size={12} /> {examInfo.duration} Min
                                    </div>
                                </div>
                                
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6">
                                    <p className="text-xs text-yellow-200/80 leading-relaxed">
                                        ⚠️ Duke klikuar butonin më poshtë, kompjuteri juaj do të hyjë në një ambient të siguruar (SEB). Sigurohuni që keni ruajtur punët e tjera.
                                    </p>
                                </div>

                                <button 
                                    onClick={async () => {
                                        const startTimeRaw = examInfo.startTime || examInfo.StartTime;
                                        if (!startTimeRaw || startTimeRaw.startsWith('0001-01-01')) {
                                            alert("Ky provim nuk ka filluar ende! Prisni që profesori të klikojë 'Fillo'.");
                                            return;
                                        }

                                        // Kontrollo nëse ka skaduar koha (Expired)
                                        let start = new Date(startTimeRaw);
                                        // Sigurohemi që trajtohet si UTC
                                        if (typeof startTimeRaw === 'string' && !startTimeRaw.endsWith('Z')) {
                                            start = new Date(startTimeRaw + 'Z');
                                        }
                                        
                                        const duration = examInfo.duration || examInfo.Duration || 0;
                                        const end = new Date(start.getTime() + duration * 60000);
                                        if (new Date() > end) {
                                            alert("Koha e provimit ka përfunduar (Expired). Nuk mund të hyni më.");
                                            return;
                                        }

                                        try {
                                            const userId = localStorage.getItem('userId') || '0';
                                            await api.post(`/exam/join/${examInfo.id}`, { StudentId: parseInt(userId) });
                                            const token = localStorage.getItem('token') || '';
                                            const username = encodeURIComponent(localStorage.getItem('username') || 'Student');
                                            const dpUrl = `seb://start?url=${encodeURIComponent(examInfo.url)}&duration=${examInfo.duration}&student=${username}&studentId=${userId}&examId=${examInfo.id}&token=${token}`;
                                            window.location.href = dpUrl;
                                        } catch (err) {
                                            console.error("Gabim në regjistrimin e Studentit në provim:", err);
                                            const msg = err.response?.data?.message || "Pati një gabim gjatë lidhjes me provimin. Ju lutem provoni përsëri.";
                                            alert(msg);
                                        }
                                    }}
                                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
                                >
                                    <ExternalLink size={18} /> HAP PROVIMIN NË SEB
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* History Section */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <History className="text-blue-400" /> Rezultatet e Fundit
                    </h2>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10">
                            <div>
                                <div className="font-semibold">Mathematics Final</div>
                                <div className="text-xs text-gray-400">Feb 01, 2026</div>
                            </div>
                            <div className="text-green-400 font-bold text-lg">95/100</div>
                        </div>
                        
                        <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10">
                            <div>
                                <div className="font-semibold">Physics Quiz</div>
                                <div className="text-xs text-gray-400">Jan 15, 2026</div>
                            </div>
                            <div className="text-yellow-400 font-bold text-lg">82/100</div>
                        </div>
                        
                        <div className="text-center text-sm text-gray-500 mt-6 italic">Fundi i historikut</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;