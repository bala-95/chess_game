import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { botDetection } from '../../services/botDetection';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import './Login.css';

export const Login = ({ onToggleMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();

    const handleInputChange = (type) => {
        botDetection.trackInteraction('input', { field: type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Check for bot behavior
            const botAnalysis = await botDetection.analyze();
            if (botAnalysis.isSuspicious) {
                setError('Suspicious activity detected. Please try again more slowly.');
                setLoading(false);
                botDetection.reset();
                return;
            }

            await signIn(email, password);
            botDetection.reset();
        } catch (err) {
            setError(err.message || 'Failed to sign in');
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <LogIn size={32} />
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue playing chess</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="error-message">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="input-group">
                        <Mail size={20} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                handleInputChange('email');
                            }}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Lock size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                handleInputChange('password');
                            }}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <button type="button" onClick={onToggleMode} className="link-button">
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
