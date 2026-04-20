import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Sparkles, BrainCircuit, Target, Award, TrendingUp, Briefcase, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get('/dashboard');
                setDashboardData(res.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <div className="p-8 text-center text-emerald-300/70">Loading Dashboard...</div>;

    // Mock data for charts if no real progress
    const chartData = [
        { name: 'Mon', hours: 2 },
        { name: 'Tue', hours: 3 },
        { name: 'Wed', hours: 1.5 },
        { name: 'Thu', hours: 4 },
        { name: 'Fri', hours: 2.5 },
        { name: 'Sat', hours: 5 },
        { name: 'Sun', hours: 3.5 },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 relative overflow-hidden">
                {/* Ambient Background Gradient */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-900/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

                <div className="relative z-10 space-y-8">
                    {/* Welcome Section */}
                    <div className="flex justify-between items-end pb-8 border-b border-emerald-500/20">
                        <div>
                            <h1 className="text-4xl font-black text-white">
                                Welcome back, Engineer 👋
                            </h1>
                            <p className="text-emerald-300/70 mt-2 text-lg">Let's make today a productive day.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Main Content Area (Left 2 columns) */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* AI Zero Prompt Panel */}
                            <div className="glass-panel border-l-4 border-l-emerald-400 relative overflow-hidden p-6 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-shadow duration-500">
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-400">
                                    <Sparkles className="w-24 h-24" />
                                </div>
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10 text-white">
                                    <Sparkles className="h-5 w-5 text-emerald-500" /> AI Suggestions for You
                                </h2>
                                <div className="space-y-3 relative z-10">
                                    {dashboardData?.aiSuggestions?.map((sug, i) => (
                                        <div key={i} className="flex items-start gap-3 bg-[#0a0f0d] p-4 rounded-lg border border-emerald-500/10">
                                            <div className="h-6 w-6 rounded-full bg-emerald-900/50 text-emerald-400 flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                                            <p className="text-white text-sm">{sug}</p>
                                        </div>
                                    )) || (
                                            <div className="p-4 text-emerald-300/70 bg-[#0a0f0d] rounded-lg border border-emerald-500/10">
                                                No suggestions right now. Keep studying to train your AI!
                                            </div>
                                        )}
                                </div>
                            </div>

                            {/* Study Progress Overview */}
                            <div className="glass-panel p-6">
                                <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-400" /> Weekly Velocity</h2>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <XAxis dataKey="name" stroke="#6ee7b7" />
                                            <YAxis stroke="#6ee7b7" />
                                            <Tooltip cursor={{ fill: 'rgba(16,185,129,0.05)' }} contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(16,185,129,0.2)' }} />
                                            <Bar dataKey="hours" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                        </div>

                        {/* Right Sidebar */}
                        <div className="grid grid-cols-2 gap-4">
                            <motion.div whileHover={{ scale: 1.05 }} className="glass-panel p-6 text-center cursor-pointer group border-b-4 border-b-emerald-500/50">
                                <div className="mx-auto h-12 w-12 bg-emerald-900/50 text-emerald-400 rounded-full flex items-center justify-center mb-4 transition-transform">
                                    <BrainCircuit className="w-6 h-6" />
                                </div>
                                <div className="text-4xl font-black text-white drop-shadow-sm">{dashboardData?.totalQuizzes || 0}</div>
                                <div className="text-xs uppercase tracking-wider font-bold text-emerald-300/70 mt-2">Total Quizzes</div>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.05 }} className="glass-panel p-6 text-center cursor-pointer group border-b-4 border-b-emerald-600">
                                <div className="mx-auto h-12 w-12 bg-emerald-900/50 text-emerald-400 rounded-full flex items-center justify-center mb-4 transition-transform">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div className="text-4xl font-black text-white drop-shadow-sm">{(dashboardData?.readiness || 0).toFixed(0)}%</div>
                                <div className="text-xs uppercase tracking-wider font-bold text-emerald-300/70 mt-2">Readiness</div>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.05 }} className="glass-panel p-6 text-center cursor-pointer group border-b-4 border-b-emerald-400">
                                <div className="mx-auto h-12 w-12 bg-emerald-900/50 text-emerald-400 rounded-full flex items-center justify-center mb-4 transition-transform">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <div className="text-4xl font-black text-white drop-shadow-sm">{dashboardData?.totalMocks || 0}</div>
                                <div className="text-xs uppercase tracking-wider font-bold text-emerald-300/70 mt-2">Total Mocks</div>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.05 }} className="glass-panel p-6 text-center cursor-pointer group border-b-4 border-b-emerald-500">
                                <div className="mx-auto h-12 w-12 bg-emerald-900/50 text-emerald-400 rounded-full flex items-center justify-center mb-4 transition-transform">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div className="text-4xl font-black text-white drop-shadow-sm">{dashboardData?.totalSchedules || 0}</div>
                                <div className="text-xs uppercase tracking-wider font-bold text-emerald-300/70 mt-2">Schedules</div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
