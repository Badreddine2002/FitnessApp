import React, { useState, useEffect } from 'react';
import mockApi from '../services/mockApi';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Activity, Dumbbell, Award, ChevronRight, History } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await mockApi.getExercises();
                setExercises(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-8 text-white shadow-xl shadow-primary-200">
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user.username}! 👋</h1>
                <p className="text-primary-100 text-lg">You have {exercises.length} active exercises tracked. Keep pushing your limits!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card hover:shadow-md transition-shadow">
                    <div className="bg-primary-50 dark:bg-primary-900/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                        <Dumbbell className="text-primary-600 dark:text-primary-400" size={24} />
                    </div>
                    <h2 className="text-3xl font-bold dark:text-white">{exercises.length}</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Exercises Tracked</p>
                </div>
                <div className="card hover:shadow-md transition-shadow">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                        <Activity className="text-emerald-600 dark:text-emerald-400" size={24} />
                    </div>
                    <h2 className="text-3xl font-bold dark:text-white">Active</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Current Status</p>
                </div>
                <div className="card hover:shadow-md transition-shadow">
                    <div className="bg-amber-50 dark:bg-amber-900/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                        <Award className="text-amber-600 dark:text-amber-400" size={24} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Keep going!</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Daily Fitness Goal</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <History className="text-primary-600 dark:text-primary-400" size={24} />
                        Recent Exercises
                    </h2>
                    <Link to="/exercises" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold flex items-center gap-1">
                        View All <ChevronRight size={20} />
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exercises.slice(0, 6).map(ex => (
                        <Link key={ex.id} to={`/exercises/${ex.id}`} className="group">
                            <div className="card h-full border-l-4 border-l-primary-500 group-hover:shadow-lg group-hover:-translate-y-1 transition-all">
                                <h3 className="text-xl font-bold dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{ex.name}</h3>
                                <p className="text-slate-400 dark:text-slate-500 text-sm mt-2 flex items-center gap-1">
                                    Added on {new Date(ex.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
                
                {exercises.length === 0 && (
                    <div className="card text-center py-12 space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-colors">
                            <Dumbbell className="text-slate-300 dark:text-slate-600" size={40} />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">No exercises yet. Start by adding one to track your progress!</p>
                        <Link to="/exercises" className="btn-primary inline-flex items-center gap-2">
                            Add Exercise
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
