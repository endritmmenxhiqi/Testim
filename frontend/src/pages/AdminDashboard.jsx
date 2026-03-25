import React, { useState, useEffect, useRef } from 'react';
import { Shield, LogOut, Check, UserX, Search, Bell, User, AlertTriangle, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    // State për Toast Notification (Zëvendëson alert-in)
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchUsers();
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err) { 
            showToast("Gabim gjatë marrjes së të dhënave", "error");
        }
    };

    // Funksioni ndihmës për Toast
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            // Thirrja në C#: [HttpPost("set-role")] me SetRoleDto { userId, role }
            await api.post('/admin/set-role', { 
                userId: userId, 
                role: newRole 
            });
            
            setUsers(users.map(user => 
                user.id === userId ? { ...user, role: newRole } : user
            ));
            
            showToast(`Roli u ndryshua me sukses në ${newRole}`);
        } catch (err) {
            console.error(err);
            showToast("Gabim gjatë përditësimit të rolit", "error");
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'ALL' || 
                             (statusFilter === 'ACTIVE' ? user.isApproved : !user.isApproved);
        return matchesSearch && matchesRole && matchesStatus;
    });

    const triggerBanModal = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const confirmBan = async () => {
        if (selectedUser) {
            try {
                await api.post(`/admin/ban/${selectedUser.id}`);
                showToast(`Aksesi u hoq për ${selectedUser.username}`);
                fetchUsers();
                setShowModal(false);
            } catch (err) {
                showToast("Gabim gjatë bllokimit", "error");
            }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div style={styles.container}>
            {/* TOAST NOTIFICATION */}
            {toast.show && (
                <div style={{...styles.toast, backgroundColor: toast.type === 'success' ? '#10B981' : '#EF4444'}}>
                    {toast.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* MODAL I BLLOKIMIT */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalIconWrapper}><AlertTriangle size={32} color="#EF4444" /></div>
                        <h3 style={styles.modalTitle}>Konfirmoni Bllokimin</h3>
                        <p style={styles.modalText}>A jeni i sigurt për bllokimin e <strong>{selectedUser?.username}</strong>?</p>
                        <div style={styles.modalActionButtons}>
                            <button onClick={() => setShowModal(false)} style={styles.btnModalCancel}>Anulo</button>
                            <button onClick={confirmBan} style={styles.btnModalConfirm}>Po, Bllokoje</button>
                        </div>
                    </div>
                </div>
            )}

            {/* NAVBAR */}
            <nav style={styles.navbar}>
                <div style={styles.navContent}>
                    <div style={styles.navLeft}>
                        <div style={styles.logoBox}><Shield size={20} color="white" /></div>
                        <h2 style={styles.navTitle}>Admin Panel</h2>
                    </div>
                    <div style={styles.navRight}>
                        <Bell size={20} color="#6B7280" style={{cursor:'pointer'}} />
                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <div style={styles.userProfile} onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                                <User size={20} color={showProfileDropdown ? "#2563EB" : "#6B7280"} />
                            </div>
                            {showProfileDropdown && (
                                <div style={styles.profileDropdown}>
                                    <div style={styles.dropdownHeader}>
                                        <div style={styles.avatarLarge}><User size={30} color="#2563EB" /></div>
                                        <h4 style={styles.profileName}>{currentUser?.username || 'Admin'}</h4>
                                        <span style={styles.profileBadge}>Administrator</span>
                                    </div>
                                    <div style={styles.dropdownFooter}>
                                        <button onClick={handleLogout} style={styles.btnLogoutFull}><LogOut size={16} /> Logout</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main style={styles.main}>
                <div style={styles.headerSection}>
                    <h1 style={styles.pageTitle}>Menaxhimi i Përdoruesve</h1>
                    <p style={styles.pageSubtitle}>Kontrollo rolet, lejet dhe statusin e anëtarëve të sistemit.</p>
                </div>

                <div style={styles.tableCard}>
                    {/* FILTRAT */}
                    <div style={styles.filterBar}>
                        <div style={styles.searchWrapper}>
                            <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
                            <input 
                                type="text" 
                                placeholder="Kërko me emër ose email..." 
                                style={styles.searchInput}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div style={styles.filtersRight}>
                            <div style={styles.filterGroup}>
                                <Filter size={14} color="#6B7280" />
                                <select 
                                    style={styles.filterSelect}
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="ALL">Të gjitha Rolet</option>
                                    <option value="STUDENT">Student</option>
                                    <option value="PROFESSOR">Professor</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            <div style={styles.filterGroup}>
                                <select 
                                    style={styles.filterSelect}
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="ALL">Çdo Status</option>
                                    <option value="ACTIVE">Aktiv</option>
                                    <option value="PENDING">Joaktiv</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeaderRow}>
                                <th style={styles.th}>Përdoruesi</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>Roli</th>
                                <th style={styles.th}>Statusi</th>
                                <th style={styles.th}>Veprime</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <tr key={user.id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                            <div style={styles.avatarSmall}>{user.username?.charAt(0).toUpperCase()}</div>
                                            <strong>{user.username}</strong>
                                        </div>
                                    </td>
                                    <td style={{ ...styles.td, color: '#6B7280' }}>{user.email}</td>
                                    <td style={styles.td}>
                                        <select 
                                            value={user.role} 
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            style={styles.inlineRoleSelect}
                                        >
                                            <option value="STUDENT">Student</option>
                                            <option value="PROFESSOR">Professor</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={user.isApproved ? styles.badgeActive : styles.badgePending}>
                                            {user.isApproved ? 'Aktiv' : 'Joaktiv'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <button onClick={() => triggerBanModal(user)} style={styles.btnActionBan} title="Hiq Aksesin">
                                            <UserX size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={styles.noResults}>Nuk u gjet asnjë përdorues.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', width: '100vw', backgroundColor: '#F3F4F6', fontFamily: '"Inter", sans-serif' },
    toast: { 
        position: 'fixed', top: '24px', right: '24px', color: 'white', padding: '12px 20px', 
        borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 10000,
        display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500', animation: 'slideIn 0.3s ease-out' 
    },
    navbar: { width: '100%', height: '70px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'center', position: 'sticky', top: 0, zIndex: 50 },
    navContent: { width: '100%', maxWidth: '1400px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' },
    navLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
    logoBox: { backgroundColor: '#2563EB', padding: '8px', borderRadius: '8px' },
    navTitle: { fontSize: '20px', fontWeight: '700', color: '#111827' },
    navRight: { display: 'flex', alignItems: 'center', gap: '20px' },
    userProfile: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3F4F6', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', border: '1px solid #E5E7EB' },
    main: { width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '40px' },
    headerSection: { marginBottom: '32px' },
    pageTitle: { fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '8px' },
    pageSubtitle: { fontSize: '16px', color: '#6B7280' },
    tableCard: { backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' },
    filterBar: { padding: '24px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
    searchWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    searchIcon: { position: 'absolute', left: '16px' },
    searchInput: { width: '350px', padding: '12px 16px 12px 48px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', transition: 'all 0.2s' },
    filtersRight: { display: 'flex', gap: '12px' },
    filterGroup: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', padding: '4px 12px', borderRadius: '10px', border: '1px solid #E5E7EB' },
    filterSelect: { border: 'none', backgroundColor: 'transparent', padding: '8px 4px', fontSize: '14px', fontWeight: '500', outline: 'none', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', textAlign: 'left', backgroundColor: '#F9FAFB' },
    td: { padding: '20px 24px', fontSize: '14px', borderBottom: '1px solid #F3F4F6' },
    avatarSmall: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#DBEAFE', color: '#2563EB', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px', fontWeight: '700' },
    inlineRoleSelect: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    badgeActive: { backgroundColor: '#DCFCE7', color: '#15803D', padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600' },
    badgePending: { backgroundColor: '#FEF3C7', color: '#B45309', padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600' },
    btnActionBan: { backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' },
    modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(17, 24, 39, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modalContent: { backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '20px', width: '400px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
    modalTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '12px' },
    modalActionButtons: { display: 'flex', gap: '12px', marginTop: '24px' },
    btnModalCancel: { flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', fontWeight: '600', cursor: 'pointer' },
    btnModalConfirm: { flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#EF4444', color: '#FFFFFF', fontWeight: '600', cursor: 'pointer' },
    profileDropdown: { position: 'absolute', top: '55px', right: 0, width: '260px', backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB', overflow: 'hidden' },
    dropdownHeader: { padding: '20px', textAlign: 'center', borderBottom: '1px solid #F3F4F6' },
    profileBadge: { fontSize: '11px', color: '#2563EB', backgroundColor: '#EBF2FF', padding: '4px 10px', borderRadius: '9999px', fontWeight: '700' },
    btnLogoutFull: { width: '100%', padding: '12px', border: 'none', backgroundColor: '#FFF1F2', color: '#E11D48', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
};

export default AdminDashboard;