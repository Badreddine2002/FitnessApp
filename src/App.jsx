import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import ExerciseDetail from './pages/ExerciseDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import { Dumbbell, LayoutDashboard, LogOut, Menu, X, Sun, Moon } from 'lucide-react';

const PrivateRoute = ({ children }) => {
    const { token, loading } = useAuth();
    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    return token ? children : <Navigate to="/login" />;
};

const Navbar = () => {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = React.useState(false);

    if (!user) return (
        <div className="absolute top-4 right-4 z-50">
            <button onClick={toggleTheme} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>
    );

    return (
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-primary-600 p-2 rounded-lg group-hover:bg-primary-700 transition-colors">
                                <Dumbbell className="text-white" size={24} />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
                                FitnessTracker
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-500 font-medium flex items-center gap-2 transition-colors">
                            <LayoutDashboard size={18} /> Dashboard
                        </Link>
                        <Link to="/exercises" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-500 font-medium flex items-center gap-2 transition-colors">
                            <Dumbbell size={18} /> Exercises
                        </Link>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
                        
                        <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                {user.username}
                            </span>
                            <button onClick={logout} className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 transition-colors">
                                <LogOut size={18} /> Logout
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button onClick={toggleTheme} className="p-2 rounded-xl text-slate-600 dark:text-slate-400">
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 dark:text-slate-400 p-2">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-4 animate-in slide-in-from-top-4 duration-200">
                    <Link to="/" onClick={() => setIsOpen(false)} className="block text-slate-600 dark:text-slate-400 font-medium p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">Dashboard</Link>
                    <Link to="/exercises" onClick={() => setIsOpen(false)} className="block text-slate-600 dark:text-slate-400 font-medium p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">Exercises</Link>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={logout} className="w-full text-left text-red-600 font-medium p-2">Logout</button>
                    </div>
                </div>
            )}
        </nav>
    );
};

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <Router>
                    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
                        <Navbar />
                        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                                <Route path="/exercises" element={<PrivateRoute><Exercises /></PrivateRoute>} />
                                <Route path="/exercises/:id" element={<PrivateRoute><ExerciseDetail /></PrivateRoute>} />
                            </Routes>
                        </main>
                        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 transition-colors duration-300">
                            <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                                &copy; 2026 FitnessTracker. All rights reserved.
                            </div>
                        </footer>
                    </div>
                </Router>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
