import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Lock, User, UserPlus, AlertCircle } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await register(username, password);
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-in fade-in duration-700">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
                <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
                    <Dumbbell className="text-white" size={32} />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900">Create Account</h2>
                <p className="text-slate-500">Join our fitness community and start tracking</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="card shadow-xl border-none">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-center gap-3 text-red-700 animate-in slide-in-from-top-2">
                            <AlertCircle size={20} />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}
                    
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Choose Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    className="input pl-10" 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)} 
                                    required 
                                    placeholder="new_athlete"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Create Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="password" 
                                    className="input pl-10" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="btn bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-100 w-full py-3 text-lg flex items-center justify-center gap-2 group transition-all"
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                            <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-slate-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
