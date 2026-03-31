// Mock API service using localStorage to simulate a backend
const DELAY = 300; // Artificial delay for realism

const getFromStorage = (key) => JSON.parse(localStorage.getItem(key)) || [];
const saveToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const mockApi = {
    // Auth
    login: async (username, password) => {
        await new Promise(resolve => setTimeout(resolve, DELAY));
        const users = getFromStorage('users');
        const user = users.find(u => u.username === username);
        
        if (user && user.password === password) {
            const token = 'mock-jwt-token-' + Math.random().toString(36).substr(2);
            return { data: { token, user: { id: user.id, username: user.username } } };
        }
        throw new Error('Invalid credentials');
    },

    register: async (username, password) => {
        await new Promise(resolve => setTimeout(resolve, DELAY));
        const users = getFromStorage('users');
        if (users.some(u => u.username === username)) {
            throw new Error('Username already exists');
        }
        const newUser = { id: Date.now(), username, password };
        users.push(newUser);
        saveToStorage('users', users);
        return { data: { message: 'Registered successfully' } };
    },

    // Exercises
    getExercises: async () => {
        await new Promise(resolve => setTimeout(resolve, DELAY));
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (!currentUser) return { data: [] };
        const exercises = getFromStorage('exercises');
        return { data: exercises.filter(e => Number(e.user_id) === Number(currentUser.id)) };
    },

    addExercise: async (name) => {
        await new Promise(resolve => setTimeout(resolve, DELAY));
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const exercises = getFromStorage('exercises');
        const newEx = { id: Date.now(), user_id: currentUser.id, name, created_at: new Date().toISOString() };
        exercises.push(newEx);
        saveToStorage('exercises', exercises);
        return { data: newEx };
    },

    deleteExercise: async (id) => {
        await new Promise(resolve => setTimeout(resolve, DELAY));
        
        const exerciseId = Number(id);
        // Remove exercise
        const exercises = getFromStorage('exercises');
        const filteredExercises = exercises.filter(e => Number(e.id) !== exerciseId);
        saveToStorage('exercises', filteredExercises);
        
        // Remove related sessions and sets
        const sessions = getFromStorage('sessions');
        const filteredSessions = sessions.filter(s => Number(s.exercise_id) !== exerciseId);
        const sessionIdsToRemove = sessions.filter(s => Number(s.exercise_id) === exerciseId).map(s => s.id);
        saveToStorage('sessions', filteredSessions);
        
        const sets = getFromStorage('sets');
        const filteredSets = sets.filter(s => !sessionIdsToRemove.includes(s.session_id));
        saveToStorage('sets', filteredSets);
        
        return { data: { success: true } };
    },

    getExerciseById: async (id) => {
        await new Promise(resolve => setTimeout(resolve, DELAY));
        const exercises = getFromStorage('exercises');
        const exerciseId = Number(id);
        return { data: exercises.find(e => Number(e.id) === exerciseId) };
    },

    // Sessions
    getSessions: async (exerciseId) => {
        await new Promise(resolve => setTimeout(resolve, DELAY));
        const sessions = getFromStorage('sessions');
        const exId = Number(exerciseId);
        return { data: sessions.filter(s => Number(s.exercise_id) === exId).sort((a,b) => new Date(b.created_at) - new Date(a.created_at)) };
    },

    addSession: async (exerciseId, date) => {
        await new Promise(resolve => setTimeout(resolve, DELAY));
        const sessions = getFromStorage('sessions');
        // We include both date (user selected) and created_at (actual time)
        const newSession = { 
            id: Date.now(), 
            exercise_id: Number(exerciseId), 
            date, 
            created_at: new Date().toISOString() 
        };
        sessions.push(newSession);
        saveToStorage('sessions', sessions);
        return { data: newSession };
    },

    // Sets
    getSets: async (sessionId) => {
        await new Promise(resolve => setTimeout(resolve, DELAY));
        const sets = getFromStorage('sets');
        const sessId = Number(sessionId);
        return { data: sets.filter(s => Number(s.session_id) === sessId) };
    },

    addSet: async (sessionId, reps, weight) => {
        await new Promise(resolve => setTimeout(resolve, DELAY));
        const sets = getFromStorage('sets');
        const newSet = { id: Date.now(), session_id: Number(sessionId), reps: Number(reps), weight: Number(weight) };
        sets.push(newSet);
        saveToStorage('sets', sets);
        return { data: newSet };
    },

    // Progress
    getRecords: async (exerciseId) => {
        await new Promise(resolve => setTimeout(resolve, DELAY));
        const exId = Number(exerciseId);
        const sessions = getFromStorage('sessions').filter(s => Number(s.exercise_id) === exId);
        const sessionIds = sessions.map(s => s.id);
        const sets = getFromStorage('sets').filter(s => sessionIds.includes(s.session_id));
        
        const max_weight = sets.length > 0 ? Math.max(...sets.map(s => s.weight)) : 0;
        const max_reps = sets.length > 0 ? Math.max(...sets.map(s => s.reps)) : 0;
        
        return { data: { max_weight, max_reps } };
    },

    getProgress: async (exerciseId) => {
        await new Promise(resolve => setTimeout(resolve, DELAY));
        const exId = Number(exerciseId);
        const sessions = getFromStorage('sessions').filter(s => Number(s.exercise_id) === exId);
        const sets = getFromStorage('sets');
        
        const progress = sessions.map(s => {
            const sessionSets = sets.filter(st => st.session_id === s.id);
            return {
                date: s.date,
                max_weight: sessionSets.length > 0 ? Math.max(...sessionSets.map(st => st.weight)) : 0,
                max_reps: sessionSets.length > 0 ? Math.max(...sessionSets.map(st => st.reps)) : 0
            };
        }).sort((a,b) => new Date(a.date) - new Date(b.date));
        
        return { data: progress };
    }
};

export default mockApi;
