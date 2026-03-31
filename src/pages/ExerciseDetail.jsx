import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import mockApi from '../services/mockApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Plus, History, TrendingUp, Calendar, Clock, Weight, Repeat, Trash2, ArrowLeft, ChevronRight } from 'lucide-react';

const ExerciseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exercise, setExercise] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [progressData, setProgressData] = useState([]);
    const [records, setRecords] = useState({ max_weight: 0, max_reps: 0 });
    const [newSessionDate, setNewSessionDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeSession, setActiveSession] = useState(null);
    const [newSet, setNewSet] = useState({ reps: '', weight: '' });
    const [setsForActiveSession, setSetsForActiveSession] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setActiveSession(null);
            setSetsForActiveSession([]);
            try {
                await Promise.all([
                    fetchExercise(),
                    fetchSessions(),
                    fetchProgress(),
                    fetchRecords()
                ]);
            } catch (err) {
                console.error("Error loading exercise detail:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const fetchRecords = async () => {
        try {
            const response = await mockApi.getRecords(id);
            setRecords(response.data || { max_weight: 0, max_reps: 0 });
        } catch (err) {
            console.error(err);
        }
    };

    const fetchExercise = async () => {
        try {
            const response = await mockApi.getExerciseById(id);
            if (response.data) setExercise(response.data);
            else setExercise(null);
        } catch (err) {
            console.error(err);
            setExercise(null);
        }
    };

    const fetchSessions = async () => {
        try {
            const response = await mockApi.getSessions(id);
            setSessions(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error(err);
            setSessions([]);
        }
    };

    const fetchProgress = async () => {
        try {
            const response = await mockApi.getProgress(id);
            setProgressData(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error(err);
            setProgressData([]);
        }
    };

    const handleCreateSession = async () => {
        try {
            const response = await mockApi.addSession(id, newSessionDate);
            await fetchSessions();
            setActiveSession(response.data.id);
            setSetsForActiveSession([]);
        } catch (err) {
            console.error('Failed to create session', err);
        }
    };

    const handleAddSet = async () => {
        if (!newSet.reps || !newSet.weight || !activeSession) return;
        try {
            await mockApi.addSet(activeSession, newSet.reps, newSet.weight);
            setNewSet({ reps: '', weight: '' });
            await fetchSetsForSession(activeSession);
            await fetchProgress();
            await fetchRecords();
        } catch (err) {
            console.error('Failed to add set', err);
        }
    };

    const fetchSetsForSession = async (sessionId) => {
        try {
            const response = await mockApi.getSets(sessionId);
            setSetsForActiveSession(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error(err);
            setSetsForActiveSession([]);
        }
    };

    const openSession = (sessionId) => {
        setActiveSession(sessionId);
        fetchSetsForSession(sessionId);
    };

    const handleDeleteExercise = async () => {
        if (window.confirm('Delete this exercise and all its history?')) {
            await mockApi.deleteExercise(id);
            navigate('/exercises');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );
    if (!exercise) return <div className="text-center py-20 text-slate-500">Exercise not found.</div>;

    const activeSessionData = Array.isArray(sessions) ? sessions.find(s => Number(s.id) === Number(activeSession)) : null;
    const validProgressData = Array.isArray(progressData) ? progressData.filter(d => d && d.date) : [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/exercises')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft size={24} className="dark:text-white" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{exercise.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 transition-colors">
                            <Calendar size={14} /> Tracking since {exercise.created_at ? new Date(exercise.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                </div>
                <button onClick={handleDeleteExercise} className="btn-danger w-fit flex items-center gap-2">
                    <Trash2 size={18} /> Delete Exercise
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="card border-t-4 border-t-amber-500 bg-amber-50/30 dark:bg-amber-900/10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400 transition-colors"><Weight size={20} /></div>
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 transition-colors">Personal Record</h3>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white transition-colors">{records.max_weight || 0} <span className="text-lg font-medium text-slate-500 dark:text-slate-400">kg</span></p>
                </div>
                <div className="card border-t-4 border-t-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 transition-colors"><Repeat size={20} /></div>
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 transition-colors">Max Reps</h3>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white transition-colors">{records.max_reps || 0} <span className="text-lg font-medium text-slate-500 dark:text-slate-400">reps</span></p>
                </div>
                <div className="card border-t-4 border-t-primary-500 bg-primary-50/30 dark:bg-primary-900/10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400 transition-colors"><History size={20} /></div>
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 transition-colors">Total Sessions</h3>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white transition-colors">{sessions.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Progress Chart */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="card">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white transition-colors"><TrendingUp size={24} className="text-primary-600 dark:text-primary-400" /> Progress Chart</h3>
                        </div>
                        <div className="w-full h-[350px]">
                            {validProgressData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={validProgressData}>
                                        <defs>
                                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                        <Tooltip 
                                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'var(--card-bg, #fff)', color: 'var(--text-color, #000)'}}
                                        />
                                        <Area yAxisId="left" type="monotone" dataKey="max_weight" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" name="Max Weight (kg)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-2 transition-colors">
                                    <TrendingUp size={48} className="opacity-20" />
                                    <p>Log more sessions to see your progress chart!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Session Area */}
                    {activeSession && activeSessionData && (
                        <div className="card ring-2 ring-primary-500 dark:ring-primary-600 border-none shadow-xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b dark:border-slate-800">
                                <div>
                                    <h3 className="text-xl font-bold text-primary-900 dark:text-white">Active Session</h3>
                                    <p className="text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1 transition-colors">
                                        <Calendar size={14} /> {activeSessionData.date} 
                                        {activeSessionData.created_at && (
                                            <>
                                                <Clock size={14} className="ml-2" /> 
                                                {new Date(activeSessionData.created_at).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}
                                            </>
                                        )}
                                    </p>
                                </div>
                                <button onClick={() => setActiveSession(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors">Close</button>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block transition-colors">Reps</label>
                                    <input type="number" className="input text-lg font-bold" value={newSet.reps} onChange={(e) => setNewSet({ ...newSet, reps: e.target.value })} placeholder="0" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block transition-colors">Weight (kg)</label>
                                    <input type="number" step="0.5" className="input text-lg font-bold" value={newSet.weight} onChange={(e) => setNewSet({ ...newSet, weight: e.target.value })} placeholder="0.0" />
                                </div>
                                <div className="flex items-end">
                                    <button onClick={handleAddSet} className="btn-primary w-full h-[46px] flex items-center justify-center gap-2">
                                        <Plus size={20} /> Add Set
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Set</th>
                                            <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Weight</th>
                                            <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Reps</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800 transition-colors">
                                        {Array.isArray(setsForActiveSession) && setsForActiveSession.map((s, index) => (
                                            <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-4 py-3 font-medium text-slate-400 dark:text-slate-500">#{index + 1}</td>
                                                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white transition-colors">{s.weight} kg</td>
                                                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white transition-colors">{s.reps}</td>
                                            </tr>
                                        ))}
                                        {(!Array.isArray(setsForActiveSession) || setsForActiveSession.length === 0) && (
                                            <tr>
                                                <td colSpan="3" className="px-4 py-8 text-center text-slate-400 dark:text-slate-600 italic transition-colors">No sets added yet for this session.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar: New Session & History */}
                <div className="space-y-6">
                    <div className="card border-l-4 border-l-emerald-500">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-lg transition-colors">
                            <Plus size={20} className="text-emerald-500" /> Start Session
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block transition-colors">Date</label>
                                <input type="date" className="input" value={newSessionDate} onChange={(e) => setNewSessionDate(e.target.value)} />
                            </div>
                            <button onClick={handleCreateSession} className="btn-primary w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 transition-all">
                                <Calendar size={18} /> Log Today's Work
                            </button>
                        </div>
                    </div>

                    <div className="card h-[400px] flex flex-col">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-lg transition-colors">
                            <History size={20} className="text-primary-500 dark:text-primary-400" /> History
                        </h3>
                        <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {Array.isArray(sessions) && sessions.map(s => (
                                <button 
                                    key={s.id} 
                                    onClick={() => openSession(s.id)} 
                                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group
                                        ${Number(activeSession) === Number(s.id) 
                                            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 ring-1 ring-primary-500 shadow-sm' 
                                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                >
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white transition-colors">{s.date}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 transition-colors">
                                            {s.created_at ? (
                                                <>
                                                    <Clock size={12} /> 
                                                    {new Date(s.created_at).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}
                                                </>
                                            ) : 'Manual entry'}
                                        </p>
                                    </div>
                                    <ChevronRight size={18} className={`${Number(activeSession) === Number(s.id) ? 'text-primary-500' : 'text-slate-300 dark:text-slate-700'} group-hover:translate-x-1 transition-transform`} />
                                </button>
                            ))}
                            {(!Array.isArray(sessions) || sessions.length === 0) && (
                                <div className="text-center py-10 text-slate-400 dark:text-slate-600 transition-colors">
                                    <History size={32} className="mx-auto opacity-20 mb-2" />
                                    <p>No history found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExerciseDetail;
