import React, { useState, useEffect } from 'react';
import mockApi from '../services/mockApi';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight, Trash2, Search, Dumbbell } from 'lucide-react';

const Exercises = () => {
    const [exercises, setExercises] = useState([]);
    const [newName, setNewName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        try {
            const response = await mockApi.getExercises();
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
            await mockApi.addExercise(newName);
            setNewName('');
            fetchExercises();
        } catch (err) {
            console.error('Failed to add exercise', err);
        }
    };

    const handleDelete = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this exercise and all its history?')) {
            try {
                await mockApi.deleteExercise(id);
                fetchExercises();
            } catch (err) {
                console.error('Failed to delete exercise', err);
            }
        }
    };

    const filteredExercises = exercises.filter(ex => 
        ex && ex.name && ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">Your Exercises</h1>
                <p className="text-slate-500 dark:text-slate-400 transition-colors">Manage and track your workout categories</p>
            </header>
            
            <section className="card p-4 sm:p-6">
                <form onSubmit={handleAddExercise} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-grow">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block transition-colors">New Exercise</label>
                        <input 
                            type="text" 
                            className="input"
                            value={newName} 
                            onChange={(e) => setNewName(e.target.value)} 
                            placeholder="e.g. Bench Press"
                            required 
                        />
                    </div>
                    <div className="flex items-end">
                        <button type="submit" className="btn-primary w-full sm:w-auto h-[42px] flex items-center justify-center gap-2 transition-all">
                            <Plus size={20} /> Add Exercise
                        </button>
                    </div>
                </form>
            </section>

            <section className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search exercises..."
                        className="input pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredExercises.map(ex => (
                        <Link key={ex.id} to={`/exercises/${ex.id}`} className="group block">
                            <div className="card hover:border-primary-300 dark:hover:border-primary-800 hover:shadow-md transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary-50 dark:bg-primary-900/20 p-2 rounded-lg text-primary-600 dark:text-primary-400 group-hover:bg-primary-600 dark:group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                        <Dumbbell size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{ex.name}</h3>
                                        <p className="text-slate-400 dark:text-slate-500 text-sm">
                                            Created {ex.created_at ? new Date(ex.created_at).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={(e) => handleDelete(e, ex.id)}
                                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                        title="Delete Exercise"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <ChevronRight className="text-slate-300 dark:text-slate-700 group-hover:text-primary-400 dark:group-hover:text-primary-500 group-hover:translate-x-1 transition-all" size={20} />
                                </div>
                            </div>
                        </Link>
                    ))}

                    {filteredExercises.length === 0 && (
                        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 transition-colors">
                            <p className="text-slate-400 dark:text-slate-600">No exercises found.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Exercises;
