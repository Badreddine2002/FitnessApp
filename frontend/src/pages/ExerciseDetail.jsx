import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, History, TrendingUp } from 'lucide-react';

const ExerciseDetail = () => {
    const { id } = useParams();
    const [exercise, setExercise] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [progressData, setProgressData] = useState([]);
    const [records, setRecords] = useState({ max_weight: 0, max_reps: 0 });
    const [newSessionDate, setNewSessionDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeSession, setActiveSession] = useState(null);
    const [newSet, setNewSet] = useState({ reps: '', weight: '' });
    const [setsForActiveSession, setSetsForActiveSession] = useState([]);

    useEffect(() => {
        fetchExercise();
        fetchSessions();
        fetchProgress();
        fetchRecords();
    }, [id]);

    const fetchRecords = async () => {
        try {
            const response = await axios.get(`/api/records/${id}`);
            setRecords(response.data || { max_weight: 0, max_reps: 0 });
        } catch (err) {
            console.error(err);
        }
    };

    const fetchExercise = async () => {
        const response = await axios.get('/api/exercises');
        const ex = response.data.find(e => e.id === parseInt(id));
        setExercise(ex);
    };

    const fetchSessions = async () => {
        const response = await axios.get(`/api/sessions/${id}`);
        setSessions(response.data);
    };

    const fetchProgress = async () => {
        const response = await axios.get(`/api/progress/${id}`);
        setProgressData(response.data);
    };

    const handleCreateSession = async () => {
        try {
            const response = await axios.post('/api/sessions', { exerciseId: id, date: newSessionDate });
            fetchSessions();
            setActiveSession(response.data.id);
        } catch (err) {
            console.error('Failed to create session', err);
        }
    };

    const handleAddSet = async () => {
        if (!newSet.reps || !newSet.weight || !activeSession) return;
        try {
            await axios.post('/api/sets', {
                sessionId: activeSession,
                reps: parseInt(newSet.reps),
                weight: parseFloat(newSet.weight)
            });
            setNewSet({ reps: '', weight: '' });
            fetchSetsForSession(activeSession);
            fetchProgress();
            fetchRecords();
        } catch (err) {
            console.error('Failed to add set', err);
        }
    };

    const fetchSetsForSession = async (sessionId) => {
        const response = await axios.get(`/api/sets/${sessionId}`);
        setSetsForActiveSession(response.data);
    };

    const openSession = (sessionId) => {
        setActiveSession(sessionId);
        fetchSetsForSession(sessionId);
    };

    if (!exercise) return <div>Loading...</div>;

    return (
        <div>
            <h1>{exercise.name}</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ textAlign: 'center', borderTop: '4px solid #f59e0b' }}>
                    <h3>Max Weight</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{records.max_weight || 0} kg</p>
                </div>
                <div className="card" style={{ textAlign: 'center', borderTop: '4px solid #10b981' }}>
                    <h3>Max Reps</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{records.max_reps || 0}</p>
                </div>
                <div className="card" style={{ textAlign: 'center', borderTop: '4px solid #3b82f6' }}>
                    <h3>Sessions</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{sessions.length}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Left: Progress Chart */}
                <div className="card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp size={20} /> Progress</h3>
                    <div style={{ width: '100%', height: '300px' }}>
                        {progressData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={progressData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Line yAxisId="left" type="monotone" dataKey="max_weight" stroke="#3b82f6" name="Max Weight (kg)" />
                                    <Line yAxisId="right" type="monotone" dataKey="max_reps" stroke="#10b981" name="Max Reps" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>No progress data yet. Add some sessions!</p>
                        )}
                    </div>
                </div>

                {/* Right: New Session */}
                <div className="card">
                    <h3>New Session</h3>
                    <div className="form-group">
                        <label>Date</label>
                        <input type="date" value={newSessionDate} onChange={(e) => setNewSessionDate(e.target.value)} />
                    </div>
                    <button onClick={handleCreateSession} className="btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Plus size={20} /> Start Session
                    </button>
                </div>
            </div>

            {/* Active Session Sets */}
            {activeSession && (
                <div className="card" style={{ marginTop: '2rem', border: '2px solid #3b82f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Active Session: {sessions.find(s => s.id === activeSession)?.date}</h3>
                        <button onClick={() => setActiveSession(null)} className="btn btn-danger">Close</button>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label>Reps</label>
                            <input type="number" value={newSet.reps} onChange={(e) => setNewSet({ ...newSet, reps: e.target.value })} style={{ marginBottom: 0 }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Weight (kg)</label>
                            <input type="number" step="0.5" value={newSet.weight} onChange={(e) => setNewSet({ ...newSet, weight: e.target.value })} style={{ marginBottom: 0 }} />
                        </div>
                        <button onClick={handleAddSet} className="btn" style={{ height: '42px' }}>Add Set</button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Set #</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Weight</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Reps</th>
                            </tr>
                        </thead>
                        <tbody>
                            {setsForActiveSession.map((s, index) => (
                                <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '0.5rem' }}>{index + 1}</td>
                                    <td style={{ padding: '0.5rem' }}>{s.weight} kg</td>
                                    <td style={{ padding: '0.5rem' }}>{s.reps}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Session History */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><History size={20} /> Session History</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {sessions.map(s => (
                        <div key={s.id} onClick={() => openSession(s.id)} className="card" style={{ cursor: 'pointer', border: activeSession === s.id ? '2px solid #3b82f6' : '1px solid #e5e7eb' }}>
                            <strong>{s.date}</strong>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExerciseDetail;
