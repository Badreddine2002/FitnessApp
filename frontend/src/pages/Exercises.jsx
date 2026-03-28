import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight } from 'lucide-react';

const Exercises = () => {
    const [exercises, setExercises] = useState([]);
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        try {
            const response = await axios.get('/api/exercises');
            setExercises(response.data);
        } catch (err) {
            console.error('Failed to fetch exercises', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExercise = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        try {
            await axios.post('/api/exercises', { name: newName });
            setNewName('');
            fetchExercises();
        } catch (err) {
            console.error('Failed to add exercise', err);
        }
    };

    if (loading) return <div>Loading exercises...</div>;

    return (
        <div>
            <h1>Your Exercises</h1>
            
            <form onSubmit={handleAddExercise} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                    <label>New Exercise Name</label>
                    <input 
                        type="text" 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                        placeholder="e.g. Bench Press"
                        required 
                        style={{ marginBottom: 0 }}
                    />
                </div>
                <button type="submit" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '42px' }}>
                    <Plus size={20} /> Add
                </button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {exercises.map(ex => (
                    <Link key={ex.id} to={`/exercises/${ex.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}>
                            <span style={{ fontWeight: 'bold' }}>{ex.name}</span>
                            <ChevronRight size={20} color="#9ca3af" />
                        </div>
                    </Link>
                ))}
            </div>
            {exercises.length === 0 && <p>No exercises yet. Add your first one above!</p>}
        </div>
    );
};

export default Exercises;
