import { useState, useEffect } from 'react';
import api from '../services/api';
import { History, BrainCircuit, Target, BookOpen, Clock } from 'lucide-react';

const InterviewHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('all'); // all, qa, quiz
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const endpoint = activeTab === 'all' ? '/history' : `/history/${activeTab}`;
                const res = await api.get(endpoint);
                setHistory(res.data.history || []);
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 relative overflow-hidden">
                {/* Ambient Background Gradient */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-900/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

                <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-6">
                        <div>
                            <h1 className="text-3xl font-black text-white flex items-center gap-3">
                                <History className="w-8 h-8 text-emerald-500" />
                                Activity History
                            </h1>
                            <p className="text-emerald-300/70 mt-2">Review your past Q&A, mock interviews, and quizzes.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 border-b border-emerald-500/20 pb-4">
                        <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'all' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-emerald-300/70 hover:bg-emerald-900/30'}`}>All</button>
                        <button onClick={() => setActiveTab('qa')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'qa' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-emerald-300/70 hover:bg-emerald-900/30'}`}>Q&A</button>

                        <button onClick={() => setActiveTab('quiz')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'quiz' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-emerald-300/70 hover:bg-emerald-900/30'}`}>Quizzes</button>
                    </div>

                    {loading ? (
                        <div className="text-emerald-300/50 text-center py-10 animate-pulse">Loading history...</div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-12 text-emerald-300/70 bg-black/50 rounded-2xl border border-emerald-500/10 glass-panel">
                            <Clock className="w-12 h-12 mx-auto text-emerald-500/30 mb-3" />
                            <p className="text-lg font-medium text-white">No activity found for this category.</p>
                            <p className="text-sm mt-1">Complete a mock interview or ask a question to see it here.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {history && history.length > 0 && history.map((item, i) => (
                                <div key={i} className="glass-panel p-6 rounded-2xl border border-emerald-500/20 hover:shadow-emeraldGlowSoft transition-all duration-300 bg-black/30">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            {item.type === 'qa' && <BrainCircuit className="w-8 h-8 text-emerald-400 bg-emerald-900/50 p-1.5 rounded-lg border border-emerald-500/20" />}
                                            {item.type === 'quiz' && <BookOpen className="w-8 h-8 text-emerald-400 bg-emerald-900/50 p-1.5 rounded-lg border border-emerald-500/20" />}
                                            <div>
                                                <h3 className="font-bold text-white capitalize">{item.type} <span className="text-emerald-300/50 font-normal">| {item.category}</span></h3>
                                                <p className="text-xs text-emerald-300/50">{new Date(item.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        {item.score !== null && (
                                            <div className="bg-emerald-900/50 text-emerald-400 font-bold px-3 py-1 rounded-full text-sm border border-emerald-500/50">
                                                Score: {item.score.toFixed(1)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        {item.questions && item.questions.length > 0 && item.questions.map((q, qIndex) => (
                                            <div key={qIndex} className="bg-[#0a0f0d] p-4 rounded-xl border border-emerald-500/10">
                                                <p className="font-semibold text-white mb-2">Q: {q}</p>
                                                {item.answers[qIndex] && (
                                                    <p className="text-emerald-300/80 text-sm mb-2"><span className="font-medium text-emerald-500">Your Answer:</span> {item.answers[qIndex]}</p>
                                                )}
                                                {item.feedback[qIndex] && (
                                                    <div className="text-sm bg-emerald-900/10 p-3 rounded-lg border border-emerald-500/20 text-emerald-300/90 line-clamp-3 hover:line-clamp-none transition-all cursor-pointer" title="Click to expand (hover opens fully)">
                                                        <span className="font-bold text-emerald-500 text-xs uppercase tracking-wider block mb-1">AI Feedback/Reply:</span>
                                                        {item.feedback[qIndex]}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InterviewHistoryPage;
