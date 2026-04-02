import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, LayoutDashboard, PlusCircle, Monitor, 
  ClipboardList, LogOut, ChevronRight, FileCheck, Bell, User, Search, Calendar, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';

const ExamResults = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [students, setStudents] = useState([]);
  
  // States për Filtrim dhe Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const examsPerPage = 6;

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/Exam/my-exams');
      let data = res.data;
      // RENDITJA: Më të rejat të parat (bazuar në ID ose Date)
      data.sort((a, b) => (b.id || b.Id) - (a.id || a.Id));
      setExams(data);
    } catch (err) { console.error(err); }
  };

  const handleExamClick = async (exam) => {
    setSelectedExam(exam);
    setStudentPage(1);
    try {
      const res = await api.get(`/Exam/${exam.id || exam.Id}/participants`);
      setStudents(res.data);
    } catch (err) { setStudents([]); }
  };

  const handleUpdateGrade = async (studentId, grade) => {
    try {
      await api.post(`/Exam/update-grade`, {
        examId: selectedExam.id || selectedExam.Id,
        studentId: studentId,
        grade: parseInt(grade)
      });
      toast.success("Pikët u ruajtën me sukses!");
    } catch (err) { toast.error("Gabim gjatë ruajtjes."); }
  };

  // LOGJIKA E FILTRIMIT
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || (exam.date && exam.date.startsWith(dateFilter));
    return matchesSearch && matchesDate;
  });

  // LOGJIKA E PAGINATION
  const indexOfLastExam = currentPage * examsPerPage;
  const indexOfFirstExam = indexOfLastExam - examsPerPage;
  const currentExams = filteredExams.slice(indexOfFirstExam, indexOfLastExam);
  const totalPages = Math.ceil(filteredExams.length / examsPerPage);

  // LOGJIKA E PAGINATION PËR STUDENTËT
  const [studentPage, setStudentPage] = useState(1);
  const studentsPerPage = 8;
  const indexOfLastStudent = studentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalStudentPages = Math.ceil(students.length / studentsPerPage);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, backgroundColor: '#F8FAFC' }}>
      {/* SIDEBAR */}
      <aside style={{ width: '260px', backgroundColor: '#0F172A', color: '#94A3B8', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #1E293B' }}>
          <div style={{ backgroundColor: '#2563EB', padding: '8px', borderRadius: '6px' }}><GraduationCap color="white" size={20} /></div>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '19px' }}>ExamGuard</span>
        </div>
        <nav style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <SidebarLink icon={LayoutDashboard} label="Dashboard" onClick={() => navigate('/professor')} />
          <SidebarLink icon={PlusCircle} label="Krijo Provim" onClick={() => navigate('/create-exam')} />
          <SidebarLink icon={Monitor} label="Live Monitoring" onClick={() => navigate('/logs')} />
          <SidebarLink icon={ClipboardList} label="Raportet (Logs)" onClick={() => navigate('/reports')} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#2563EB', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
            <FileCheck size={18} /> <span style={{ fontWeight: '600' }}>Rezultatet</span>
          </div>
          <div style={{ marginTop: 'auto', borderTop: '1px solid #1E293B', paddingTop: '15px' }}>
            <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px' }}>
              <LogOut size={18} /> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <header style={{ height: '64px', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
          <div style={{ color: '#64748B', fontWeight: '500' }}>{selectedExam ? `Rezultatet / ${selectedExam.title}` : 'Rezultatet e Provimeve'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}><Bell size={20} color="#94A3B8" style={{cursor:'pointer'}} /><User size={20} color="#2563EB" style={{cursor:'pointer'}} /></div>
        </header>

        <div style={{ padding: '40px' }}>
          {!selectedExam ? (
            <>
              {/* FILTER BAR */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                  <Search style={{ position: 'absolute', left: '12px', top: '10px' }} size={18} color="#64748B" />
                  <input 
                    type="text" 
                    placeholder="Kërko testin ose lëndën..." 
                    value={searchTerm}
                    onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                    style={filterInputStyle}
                  />
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', padding: '2px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <Calendar size={18} color="#64748B" />
                  <input 
                    type="date" 
                    value={dateFilter}
                    onChange={(e) => {setDateFilter(e.target.value); setCurrentPage(1);}}
                    style={{ border: 'none', padding: '8px', outline: 'none', color: '#64748B', fontSize: '14px' }}
                  />
                  {dateFilter && <X size={16} color="#EF4444" style={{cursor:'pointer'}} onClick={() => setDateFilter('')} />}
                </div>
              </div>

              {/* EXAM CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {currentExams.length > 0 ? currentExams.map(exam => (
                  <div key={exam.id || exam.Id} onClick={() => handleExamClick(exam)} style={cardStyle}>
                    <div style={{ backgroundColor: '#EFF6FF', padding: '10px', borderRadius: '10px' }}><FileCheck color="#2563EB" /></div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '16px', color: '#1E293B' }}>{exam.title}</h3>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{exam.subject}</p>
                    </div>
                    <ChevronRight size={18} color="#CBD5E1" />
                  </div>
                )) : (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#64748B' }}>Nuk u gjet asnjë provim.</div>
                )}
              </div>

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '30px' }}>
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    style={paginationButtonStyle}
                  >Para</button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      style={{
                        ...paginationButtonStyle,
                        backgroundColor: currentPage === i + 1 ? '#2563EB' : 'white',
                        color: currentPage === i + 1 ? 'white' : '#64748B'
                      }}
                    >{i + 1}</button>
                  ))}
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    style={paginationButtonStyle}
                  >Pas</button>
                </div>
              )}
            </>
          ) : (
            /* STUDENT RESULTS TABLE (Mbetet e njëjtë por me stil të përmirësuar) */
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => setSelectedExam(null)} style={{ border: 'none', background: 'none', color: '#2563EB', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>← Kthehu te lista</button>
                <div style={{fontSize: '14px', color: '#64748B'}}>Totali: <strong>{students.length} studentë</strong></div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                    <th style={{ padding: '15px 24px', fontSize: '13px', color: '#64748B' }}>STUDENTI</th>
                    <th style={{ padding: '15px 24px', fontSize: '13px', color: '#64748B' }}>PIKËT</th>
                    <th style={{ padding: '15px 24px', fontSize: '13px', color: '#64748B' }}>VEPRIMI</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.map(s => (
                    <tr key={s.studentId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '15px 24px', fontWeight: '500' }}>{s.studentName || 'Emri Mungon'}</td>
                      <td style={{ padding: '15px 24px' }}>
                        <input type="number" id={`g-${s.studentId}`} defaultValue={s.score} style={{ width: '80px', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} />
                      </td>
                      <td style={{ padding: '15px 24px' }}>
                        <button onClick={() => handleUpdateGrade(s.studentId, document.getElementById(`g-${s.studentId}`).value)} style={{ backgroundColor: '#0F172A', color: 'white', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Ruaj</button>
                      </td>
                    </tr>
                  ))}
                  {currentStudents.length === 0 && (
                      <tr><td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Asnjë pjesëmarrës nuk u gjet.</td></tr>
                  )}
                </tbody>
              </table>
              
              {/* PAGINATION STUDENTE */}
              {totalStudentPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '20px', borderTop: '1px solid #E2E8F0' }}>
                      <button 
                          disabled={studentPage === 1}
                          onClick={() => setStudentPage(prev => prev - 1)}
                          style={paginationButtonStyle}
                      >Para</button>
                      {[...Array(totalStudentPages)].map((_, i) => (
                          <button 
                              key={i}
                              onClick={() => setStudentPage(i + 1)}
                              style={{
                                  ...paginationButtonStyle,
                                  backgroundColor: studentPage === i + 1 ? '#2563EB' : 'white',
                                  color: studentPage === i + 1 ? 'white' : '#64748B',
                                  fontWeight: studentPage === i + 1 ? '800' : '500'
                              }}
                          >{i + 1}</button>
                      ))}
                      <button 
                          disabled={studentPage === totalStudentPages}
                          onClick={() => setStudentPage(prev => prev + 1)}
                          style={paginationButtonStyle}
                      >Pas</button>
                  </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// STYLES
const cardStyle = { 
  backgroundColor: 'white', padding: '24px', borderRadius: '15px', border: '1px solid #E2E8F0', 
  display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', 
  transition: 'transform 0.2s, box-shadow 0.2s',
  ':hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }
};

const filterInputStyle = { 
  width: '100%', padding: '10px 15px 10px 40px', borderRadius: '10px', 
  border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' 
};

const paginationButtonStyle = {
  padding: '8px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', 
  backgroundColor: 'white', cursor: 'pointer', fontSize: '14px', color: '#64748B'
};

const SidebarLink = ({ icon: Icon, label, onClick }) => (
  <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', cursor: 'pointer', color: '#94A3B8' }}><Icon size={18} /> <span style={{ fontSize: '14px' }}>{label}</span></div>
);

export default ExamResults;