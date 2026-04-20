import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar as CalendarIcon, Clock, BookOpen, CheckCircle, Circle, Trash2, Plus, Edit2, X, AlertCircle } from 'lucide-react';

const Scheduler = () => {
    const [tasks, setTasks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        subject: '',
        topic: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        duration: 60
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/scheduler');
            setTasks(res.data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                const res = await api.put(`/scheduler/${editingId}`, formData);
                setTasks(tasks.map(t => t._id === editingId ? res.data : t));
            } else {
                const res = await api.post('/scheduler', formData);
                setTasks([...tasks, res.data].sort((a, b) => new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time)));
            }
            closeModal();
            fetchTasks(); // refresh sorting
        } catch (error) {
            console.error('Error saving task', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleComplete = async (task) => {
        try {
            const res = await api.put(`/scheduler/${task._id}`, { completed: !task.completed });
            setTasks(tasks.map(t => t._id === task._id ? res.data : t));
        } catch (error) {
            console.error('Failed to toggle completion:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/scheduler/${id}`);
            setTasks(tasks.filter(t => t._id !== id));
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const openEditModal = (task) => {
        setFormData({
            subject: task.subject,
            topic: task.topic,
            date: task.date,
            time: task.time,
            duration: task.duration
        });
        setEditingId(task._id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            subject: '',
            topic: '',
            date: new Date().toISOString().split('T')[0],
            time: '09:00',
            duration: 60
        });
    };

    // Grouping logic
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysTasks = tasks.filter(t => t.date === todayStr);
    const upcomingTasks = tasks.filter(t => t.date > todayStr);

    const renderTaskCard = (task) => (
        <div key={task._id} className={`flex flex-col md:flex-row md:items-center justify-between p-5 mb-4 rounded-xl border backdrop-blur-md shadow-sm transition-all duration-300 animate-fade-in ${task.completed
            ? 'bg-emerald-900/10 border-emerald-500/10 opacity-60 grayscale-[50%]'
            : 'bg-[#0a0f0d] border-emerald-500/30 shadow-emeraldGlowSoft'
            }`}>
            <div className="flex items-start md:items-center gap-4">
                <button onClick={() => handleToggleComplete(task)} className="mt-1 md:mt-0 focus:outline-none shrink-0 transition-transform hover:scale-110">
                    {task.completed ? <CheckCircle className="w-8 h-8 text-emerald-500" /> : <Circle className="w-8 h-8 text-emerald-500/30 hover:text-emerald-400" />}
                </button>
                <div>
                    <h3 className={`font-bold text-lg flex items-center gap-2 ${task.completed ? 'line-through text-emerald-300/50' : 'text-white'}`}>
                        {task.subject} <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-widest no-underline">{task.topic}</span>
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-emerald-300/70 font-medium font-mono">
                        <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> {task.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {task.time}</span>
                        <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {task.duration} mins</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-4 md:mt-0">
                <button onClick={() => openEditModal(task)} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors">
                    <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(task._id)} className="p-2 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 border border-red-500/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white py-10 px-4 sm:px-10 flex justify-center relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none z-0" />

            <div className="w-full max-w-4xl relative z-10">

                {/* Header */}
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-emerald-500/20">
                    <div>
                        <h1 className="text-3xl font-black text-white flex items-center gap-3">
                            <CalendarIcon className="w-8 h-8 text-emerald-500 drop-shadow-sm" /> Study Scheduler
                        </h1>
                        <p className="text-emerald-300/70 mt-2 font-medium">Organize your technical preparation</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 shadow-emeraldGlowSoft text-black px-5 py-3 rounded-xl font-bold transition-all flex items-center gap-2 hover:scale-105"
                    >
                        <Plus className="w-5 h-5 font-black" /> Add Task
                    </button>
                </div>

                {/* Task Lists */}
                <div className="space-y-12">
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-500 dark:text-emerald-400 uppercase tracking-widest text-sm">
                            <AlertCircle className="w-5 h-5" /> Today's Focus ({todayStr})
                        </h2>
                        {todaysTasks.length === 0 ? (
                            <div className="p-8 text-center bg-black/30 border border-emerald-500/20 rounded-2xl text-emerald-300/50">No tasks scheduled for today. Take a break or add one!</div>
                        ) : (
                            <div>{todaysTasks.map(renderTaskCard)}</div>
                        )}
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-300/70 uppercase tracking-widest text-sm">
                            <CalendarIcon className="w-5 h-5" /> Upcoming Tasks
                        </h2>
                        {upcomingTasks.length === 0 ? (
                            <div className="p-8 text-center bg-black/30 border border-emerald-500/20 rounded-2xl text-emerald-300/50">Your calendar is clear. Plan ahead!</div>
                        ) : (
                            <div>{upcomingTasks.map(renderTaskCard)}</div>
                        )}
                    </section>
                </div>

                {/* MODAL */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-[#0a0f0d] border border-emerald-500/20 rounded-3xl w-full max-w-lg shadow-emeraldGlow overflow-hidden animate-fade-in relative">
                            <div className="bg-black/50 p-6 flex justify-between items-center border-b border-emerald-500/20">
                                <h2 className="text-xl font-black flex items-center gap-2 text-white">
                                    <Edit2 className="w-5 h-5 text-emerald-500" /> {editingId ? 'Edit Task' : 'New Study Task'}
                                </h2>
                                <button onClick={closeModal} className="text-emerald-300/50 hover:text-emerald-400"><X className="w-6 h-6" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-emerald-300/70 uppercase tracking-widest mb-1">Subject</label>
                                    <input required type="text" placeholder="e.g. System Design, DSA" className="w-full bg-black/60 border border-emerald-500/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium text-white placeholder:text-emerald-900/60" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-emerald-300/70 uppercase tracking-widest mb-1">Topic</label>
                                    <input required type="text" placeholder="e.g. Rate Limiter, Graphs" className="w-full bg-black/60 border border-emerald-500/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium text-white placeholder:text-emerald-900/60" value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-300/70 uppercase tracking-widest mb-1">Date</label>
                                        <input required type="date" className="w-full bg-black/60 border border-emerald-500/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono font-bold text-white custom-calendar" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-300/70 uppercase tracking-widest mb-1">Time</label>
                                        <input required type="time" className="w-full bg-black/60 border border-emerald-500/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono font-bold text-white custom-time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-emerald-300/70 uppercase tracking-widest mb-1">Duration (minutes)</label>
                                    <input required type="number" min="5" className="w-full bg-black/60 border border-emerald-500/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono font-bold text-white" value={formData.duration} onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })} />
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 mt-4 text-lg">
                                    {loading ? 'Saving...' : 'Save Task'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Scheduler;
