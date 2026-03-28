import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Activity, Dumbbell, Award } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await axios.get('/api/exercises');
                setExercises(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)', color: 'white' }}>
                <h1>Welcome back, {user.username}!</h1>
                <p>You have {exercises.length} active exercises tracked.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <Dumbbell size={32} color="#3b82f6" style={{ margin: '0 auto' }} />
                    <h2>{exercises.length}</h2>
                    <p>Exercises</p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <Activity size={32} color="#10b981" style={{ margin: '0 auto' }} />
                    <h2>Active</h2>
                    <p>Status</p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <Award size={32} color="#f59e0b" style={{ margin: '0 auto' }} />
                    <h2>Keep going!</h2>
                    <p>Daily Goal</p>
                </div>
            </div>

            <h2 style={{ marginTop: '2rem' }}>Recent Exercises</h2>
            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {exercises.slice(0, 6).map(ex => (
                    <Link key={ex.id} to={`/exercises/${ex.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
                            <h3 style={{ margin: 0 }}>{ex.name}</h3>
                            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Created: {new Date(ex.created_at).toLocaleDateString()}</p>
                        </div>
                    </Link>
                ))}
            </div>
            
            {exercises.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>No exercises yet. Start by adding one!</p>
                    <Link to="/exercises" className="btn">Add Exercise</Link>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
