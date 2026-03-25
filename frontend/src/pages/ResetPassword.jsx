import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        if (newPassword !== confirmPassword) {
            setMessage('Fjalëkalimet nuk përputhen!');
            setIsError(true);
            return;
        }

        if (newPassword.length < 6) {
            setMessage('Fjalëkalimi duhet të jetë të paktën 6 karaktere.');
            setIsError(true);
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/reset-password', { email, newPassword });
            setMessage('Fjalëkalimi u ndryshua me sukses!');
            setIsError(false);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setIsError(true);
            const errorMsg = err.response?.data || 'Gabim gjatë ndryshimit.';
            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            {/* Logo Section */}
            <div style={styles.logoWrapper}>
                <div style={styles.logoIcon}>
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                    </svg>
                </div>
                <h1 style={styles.brandTitle}>ExamGuard</h1>
            </div>

            {/* Reset Card */}
            <div style={styles.card}>
                <h2 style={styles.cardTitle}>Vendos fjalëkalimin e ri</h2>
                <p style={styles.cardSubtitle}>
                    Për llogarinë: <strong>{email}</strong>
                </p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {message && (
                        <div style={isError ? styles.errorMsg : styles.successMsg}>
                            {message}
                        </div>
                    )}

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Fjalëkalimi i ri</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Konfirmo fjalëkalimin</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        style={loading ? styles.buttonDisabled : styles.button}
                    >
                        {loading ? "Duke u procesuar..." : "Ndrysho Fjalëkalimin"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#F8F9FB',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    logoWrapper: {
        textAlign: 'center',
        marginBottom: '24px'
    },
    logoIcon: {
        backgroundColor: '#2563EB',
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto 12px auto'
    },
    brandTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#111827',
        margin: 0
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        width: '100%',
        maxWidth: '440px',
        border: '1px solid #F3F4F6'
    },
    cardTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#111827',
        marginBottom: '8px'
    },
    cardSubtitle: {
        fontSize: '14px',
        color: '#6B7280',
        marginBottom: '24px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
    },
    input: {
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
        fontSize: '14px',
        backgroundColor: '#F9FAFB',
        outline: 'none'
    },
    button: {
        padding: '12px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#2563EB',
        color: '#ffffff',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '8px'
    },
    buttonDisabled: {
        padding: '12px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#93C5FD',
        color: '#ffffff',
        cursor: 'not-allowed',
        marginTop: '8px'
    },
    successMsg: {
        color: '#065F46',
        backgroundColor: '#D1FAE5',
        padding: '10px',
        borderRadius: '6px',
        fontSize: '13px',
        textAlign: 'center'
    },
    errorMsg: {
        color: '#991B1B',
        backgroundColor: '#FEE2E2',
        padding: '10px',
        borderRadius: '6px',
        fontSize: '13px',
        textAlign: 'center'
    }
};

export default ResetPassword;