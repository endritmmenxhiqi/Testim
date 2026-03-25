import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Shield, Clock, BarChart3 } from 'lucide-react';

const Index = () => {
    return (
        <div style={styles.container}>
            {/* --- HEADER (Lart si në foto) --- */}
            <header style={styles.header}>
                <div style={styles.logoSection}>
                    <div style={styles.logoIcon}>
                        <GraduationCap size={22} color="white" />
                    </div>
                    <span style={styles.brandName}>ExamGuard</span>
                </div>
                
                <div style={styles.navButtons}>
                    <Link to="/login" style={styles.btnOutlineNav}>Hyr</Link>
                    <Link to="/register" style={styles.btnPrimaryNav}>Regjistrohu</Link>
                </div>
            </header>

            {/* --- HERO SECTION (Në qendër të ekranit) --- */}
            <main style={styles.main}>
                <div style={styles.heroContent}>
                    <h1 style={styles.title}>
                        Platforma e Sigurt për<br />
                        <span style={{ color: '#2563EB' }}>Provime Online</span>
                    </h1>
                    
                    <p style={styles.subtitle}>
                        Menaxho, monitoro dhe zhvillo provime me siguri maksimale.<br />
                        Lockdown mode, monitorim në kohë reale, dhe raporte të detajuara.
                    </p>

                    <div style={styles.heroButtonWrapper}>
                        <Link to="/login" style={styles.btnPrimaryLarge}>Fillo Tani</Link>
                    </div>

                    {/* --- FEATURES GRID --- */}
                    <div style={styles.grid}>
                        <FeatureCard 
                            icon={<Shield size={24} color="#2563EB" />} 
                            title="Lockdown Mode" 
                            desc="Parandalon kopjimin dhe ndërrimin e tab-ave" 
                        />
                        <FeatureCard 
                            icon={<Clock size={24} color="#2563EB" />} 
                            title="Kohë Reale" 
                            desc="Monitoro studentët gjatë provimit" 
                        />
                        <FeatureCard 
                            icon={<BarChart3 size={24} color="#2563EB" />} 
                            title="Raporte" 
                            desc="Rezultate dhe analiza të detajuara" 
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div style={styles.card}>
        <div style={styles.cardIconBox}>{icon}</div>
        <h3 style={styles.cardTitle}>{title}</h3>
        <p style={styles.cardDesc}>{desc}</p>
    </div>
);

const styles = {
    container: {
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'hidden',
    },
    header: {
        height: '70px',
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #F3F4F6',
    },
    logoSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    logoIcon: {
        background: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)',
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandName: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#111827',
    },
    navButtons: {
        display: 'flex',
        gap: '10px',
    },
    btnOutlineNav: {
        padding: '8px 18px',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        textDecoration: 'none',
        color: '#374151',
        fontWeight: '600',
        fontSize: '14px',
    },
    btnPrimaryNav: {
        backgroundColor: '#2563EB',
        padding: '8px 18px',
        borderRadius: '8px',
        textDecoration: 'none',
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: '14px',
    },
    main: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroContent: {
        textAlign: 'center',
        maxWidth: '1000px',
        paddingBottom: '40px',
    },
    title: {
        fontSize: '52px',
        fontWeight: '800',
        color: '#111827',
        lineHeight: '1.2',
        marginBottom: '15px',
    },
    subtitle: {
        fontSize: '17px',
        color: '#6B7280',
        marginBottom: '30px',
    },
    heroButtonWrapper: {
        marginBottom: '50px',
    },
    btnPrimaryLarge: {
        backgroundColor: '#2563EB',
        padding: '14px 40px',
        color: 'white',
        borderRadius: '10px',
        textDecoration: 'none',
        fontWeight: '700',
        fontSize: '17px',
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
    },
    grid: {
        display: 'flex',
        gap: '20px',
        padding: '0 20px',
    },
    card: {
        flex: 1,
        padding: '30px 20px',
        borderRadius: '20px',
        border: '1px solid #F3F4F6',
        backgroundColor: '#FFFFFF',
    },
    cardIconBox: {
        width: '50px',
        height: '50px',
        backgroundColor: '#EFF6FF',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto 15px auto',
    },
    cardTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#111827',
        marginBottom: '8px',
    },
    cardDesc: {
        fontSize: '14px',
        color: '#6B7280',
    }
};

export default Index;