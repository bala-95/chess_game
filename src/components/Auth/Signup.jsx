import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { botDetection } from '../../services/botDetection';
import { UserPlus, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import './Login.css';

export const Signup = ({ onToggleMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();

    const handleInputChange = (type) => {
        botDetection.trackInteraction('input', { field: type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            // Check for bot behavior
            const botAnalysis = await botDetection.analyze();
            if (botAnalysis.isSuspicious) {
                setError('Suspicious activity detected. Please try again more slowly.');
                setLoading(false);
                botDetection.reset();
                return;
            }

            await signUp(email, password);
            setSuccess(true);
            botDetection.reset();

            // Auto-switch to login after 2 seconds
            setTimeout(() => {
                onToggleMode();
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to sign up');
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <UserPlus size={32} />
                    <h1>Create Account</h1>
                    <p>Join to start playing chess</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="error-message">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="success-message">
                            <CheckCircle size={16} />
                            <span>Account created! Check your email to verify.</span>
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

                    <div className="input-group">
                        <Lock size={20} />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                handleInputChange('confirmPassword');
                            }}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-button" disabled={loading || success}>
                        {loading ? 'Creating account...' : success ? 'Success!' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <button type="button" onClick={onToggleMode} className="link-button">
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
