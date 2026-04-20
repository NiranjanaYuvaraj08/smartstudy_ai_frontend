import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Clock, Target, ArrowRight, Activity, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const ROLES = [
    "Frontend Developer", "Backend Developer", "Full Stack Developer", "UI/UX Designer", "Product Designer", "Data Engineer", "SDE-I"
];

const roleTopics = {
    "Frontend Developer": ["React rendering", "CSS Grid and Flexbox", "JavaScript Closures", "Web Performance", "DOM Manipulation"],
    "Backend Developer": ["Database Indexing", "API Security", "Microservices", "Caching Strategies", "Concurrency"],
    "Full Stack Developer": ["System Architecture", "State Management", "REST vs GraphQL", "Database Design", "Authentication"],
    "UI/UX Designer": ["Color Theory", "Accessibility", "User Research", "Wireframing", "Interaction Design"],
    "Product Designer": ["Design Systems", "Prototyping", "User Journey", "Information Architecture", "Usability Testing"],
    "Data Engineer": ["ETL Pipelines", "Data Warehousing", "SQL Optimization", "Big Data", "Data Modeling"],
    "SDE-I": ["Data Structures", "Algorithms", "Object-Oriented Programming", "Time Complexity", "System Design Basics"]
};

const MockInterview = () => {
    const [role, setRole] = useState(ROLES[0]);
    const [timeInput, setTimeInput] = useState("15:00");
    const [remainingTime, setRemainingTime] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [answerInput, setAnswerInput] = useState("");
    const [session, setSession] = useState([]);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    const timeRef = useRef(null);
    const totalDurationSeconds = useRef(0);

    const parseTimeInput = (timeStr) => {
        const parts = timeStr.split(':');
        if (parts.length === 2) {
            const m = parseInt(parts[0]) || 0;
            const s = parseInt(parts[1]) || 0;
            return m * 60 + s;
        }
        return parseInt(timeStr) * 60 || 15 * 60;
    };

    const formatTimer = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const generateQuestion = async (currentSessionLength = 0) => {
        setLoading(true);
        try {
            const topics = roleTopics[role] || roleTopics["SDE-I"];
            const topic = topics[currentSessionLength % topics.length];
            const res = await api.post('/interview/generate', { role, topic });
            setCurrentQuestion(res.data.question);
        } catch (error) {
            console.error("Error generating question", error);
            setCurrentQuestion("Could you explain a complex technical challenge you solved recently?");
        } finally {
            setLoading(false);
        }
    };

    const startInterview = () => {
        const secs = parseTimeInput(timeInput);
        if (secs <= 0) return;

        setRemainingTime(secs);
        totalDurationSeconds.current = secs;
        setSession([]);
        setReport(null);
        setIsActive(true);
        setCurrentQuestion("");
        setAnswerInput("");
        generateQuestion(0);
    };

    useEffect(() => {
        if (!isActive) return;

        timeRef.current = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev <= 1) {
                    clearInterval(timeRef.current);

                    // Call evaluation wrapper to ensure we capture current state
                    setTimeout(() => {
                        handleTimeUp();
                    }, 0);

                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timeRef.current);
    }, [isActive]);

    // Added a separate ref-based wrapper to ensure latest state is accessed when time ends
    const sessionRef = useRef(session);
    const answerRef = useRef(answerInput);
    const questionRef = useRef(currentQuestion);

    useEffect(() => {
        sessionRef.current = session;
        answerRef.current = answerInput;
        questionRef.current = currentQuestion;
    }, [session, answerInput, currentQuestion]);

    const handleTimeUp = async () => {
        setIsActive(false);
        setLoading(true);
        try {
            let finalSession = [...sessionRef.current];
            if (answerRef.current.trim() && questionRef.current) {
                finalSession.push({ question: questionRef.current, answer: answerRef.current });
            }
            setSession(finalSession);
            setAnswerInput("");

            const res = await api.post('/interview/evaluate', { role, allQuestionsAndAnswers: finalSession });
            setReport(res.data.evaluation);
        } catch (error) {
            console.error("Evaluation error", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        if (!answerInput.trim()) return;
        const newSession = [...session, { question: currentQuestion, answer: answerInput }];
        setSession(newSession);
        setAnswerInput("");
        await generateQuestion(newSession.length);
    };

    const handleInterviewEnd = async () => {
        setIsActive(false);
        setLoading(true);
        try {
            let finalSession = [...session];
            if (answerInput.trim() && currentQuestion) {
                finalSession.push({ question: currentQuestion, answer: answerInput });
            }
            setSession(finalSession);
            setAnswerInput("");

            const res = await api.post('/interview/evaluate', { role, allQuestionsAndAnswers: finalSession });
            setReport(res.data.evaluation);
        } catch (error) {
            console.error("Evaluation error", error);
        } finally {
            setLoading(false);
        }
    };

    const percentage = totalDurationSeconds.current > 0 ? (remainingTime / totalDurationSeconds.current) * 100 : 0;
    const isWarning = remainingTime <= 30 && remainingTime > 0;
    const colorClass = isWarning ? 'text-red-500 stroke-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'text-emerald-400 stroke-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-grow flex flex-col items-center min-h-[calc(100vh-80px)] bg-[#050505] text-emerald-100 relative p-4 md:p-8 overflow-hidden font-sans"
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none z-0" />

            <div className="w-full max-w-5xl mx-auto relative z-10 flex flex-col gap-8 pb-12">

                {!isActive && !report && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-emerald-900/10 backdrop-blur-xl border border-emerald-500/20 shadow-emeraldGlow rounded-[2rem] p-8 md:p-12 w-full flex flex-col items-center mt-10"
                    >
                        <Target className="w-16 h-16 text-emerald-400 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        <h1 className="text-4xl font-black text-emerald-200 mb-3 text-center tracking-tight">Mock Interview Sandbox</h1>
                        <p className="text-emerald-400/60 mb-10 text-center text-[15px] max-w-lg">Zero random questions. Pure targeted evaluations mapping your active progression strictly inside the {role} techstack.</p>

                        <div className="w-full max-w-2xl flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <label className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-3 block opacity-80 pl-2">Target Role</label>
                                <select
                                    className="w-full bg-[#0a0f0d] border border-emerald-500/20 text-emerald-200 rounded-2xl py-5 px-6 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:outline-none transition-all shadow-inner text-base font-medium appearance-none"
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                    disabled={loading}
                                >
                                    {ROLES.map(r => <option key={r} value={r} className="bg-black text-emerald-100">{r}</option>)}
                                </select>
                            </div>
                            <div className="w-full md:w-48">
                                <label className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-3 block opacity-80 pl-2">Duration <span className="text-emerald-500/50 lowercase text-[9px]">(mm:ss)</span></label>
                                <input
                                    type="text"
                                    className="w-full text-center bg-[#0a0f0d] border border-emerald-500/20 text-emerald-400 rounded-2xl py-5 px-6 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:outline-none placeholder:text-emerald-900 font-bold tracking-widest shadow-inner transition-all text-lg"
                                    value={timeInput}
                                    onChange={e => setTimeInput(e.target.value)}
                                    placeholder="15:00"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            onClick={startInterview}
                            disabled={loading || parseTimeInput(timeInput) <= 0}
                            className="mt-10 py-5 px-12 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-full transition-all flex items-center justify-center gap-3 text-lg w-full max-w-sm hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-widest"
                        >
                            {loading ? <Activity className="w-6 h-6 animate-spin text-black" /> : <Clock className="w-6 h-6 shrink-0" />}
                            {loading ? 'Initializing...' : 'Start Interview'}
                        </button>
                    </motion.div>
                )}

                {isActive && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="w-full flex justify-center gap-8 md:gap-12 animate-fade-in mt-6 md:mt-12 flex-col md:flex-row items-center md:items-start"
                    >
                        <div className="relative flex items-center justify-center shrink-0">
                            <motion.svg
                                className="w-48 h-48 md:w-64 md:h-64 transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                                animate={isWarning ? { scale: [1, 1.05, 1] } : {}}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-emerald-900/40" />
                                <circle cx="50%" cy="50%" r="45%" strokeWidth="4" fill="transparent"
                                    strokeDasharray={283 * 2.5} strokeDashoffset={(283 * 2.5) - (percentage / 100) * (283 * 2.5)}
                                    className={`${colorClass} transition-all duration-1000 ease-linear`} strokeLinecap="round" />
                            </motion.svg>
                            <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-[10px] uppercase font-black tracking-[0.3em] text-emerald-500/80 mb-1">Time Remaining</span>
                                <span className={`text-4xl md:text-5xl font-black tabular-nums tracking-tight ${isWarning ? 'text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-emerald-200 drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]'}`}>
                                    {formatTimer(remainingTime)}
                                </span>
                            </div>

                            <button onClick={handleInterviewEnd} className="absolute -bottom-10 border border-emerald-500/30 text-emerald-500/50 hover:text-emerald-400 hover:border-emerald-500 px-6 py-2 rounded-full uppercase tracking-widest text-[10px] font-black transition-all">End Session Early</button>
                        </div>

                        <div className="w-full max-w-2xl flex flex-col gap-6">
                            <motion.div
                                key={currentQuestion}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="w-full bg-emerald-900/10 backdrop-blur-xl border border-emerald-500/20 shadow-emeraldGlowSoft rounded-[2rem] p-8 md:p-10 min-h-[180px] flex flex-col justify-center relative transition-all"
                            >
                                <div className="absolute -top-3 left-8 bg-[#050505] border border-emerald-500/30 px-4 py-1.5 rounded-full flex gap-2 items-center shadow-lg">
                                    <MessageSquare className="w-3 h-3 text-emerald-500" />
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Question {session.length + 1}</span>
                                </div>
                                {loading && !currentQuestion ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <Activity className="w-6 h-6 animate-spin text-emerald-500" />
                                        <p className="text-emerald-600 font-bold uppercase tracking-widest text-[10px]">Generating strictly unique protocol...</p>
                                    </div>
                                ) : (
                                    <h2 className="text-xl md:text-2xl font-bold text-emerald-100 leading-relaxed mt-2 tracking-wide font-sans">
                                        {currentQuestion}
                                    </h2>
                                )}
                            </motion.div>

                            <div className="w-full relative shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)] rounded-[2rem]">
                                <textarea
                                    value={answerInput}
                                    onChange={(e) => setAnswerInput(e.target.value)}
                                    placeholder="Execute your structured response protocol..."
                                    className="w-full p-8 text-lg bg-[#0a0f0d]/60 backdrop-blur-md border border-emerald-500/20 text-emerald-200 rounded-[2rem] min-h-[220px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-vertical placeholder:text-emerald-900/70 transition-all font-medium custom-scrollbar"
                                    disabled={loading || !currentQuestion}
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleNext}
                                    disabled={loading || !answerInput.trim() || !currentQuestion}
                                    className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:scale-100 text-black font-black py-4 px-10 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all flex items-center gap-3 text-[15px] hover:scale-105 uppercase tracking-widest"
                                >
                                    Submit Node <ArrowRight className="w-5 h-5 shrink-0" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {!isActive && report && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full bg-emerald-900/10 backdrop-blur-xl border border-emerald-500/30 shadow-emeraldGlowStrong rounded-[2.5rem] p-8 md:p-14 relative mt-6"
                    >
                        <div className="flex flex-col items-center justify-center pb-10 mb-10 border-b border-emerald-900/50">
                            <div className="w-32 h-32 rounded-[2rem] rotate-3 bg-[#050505] border border-emerald-500/30 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                                <div className="-rotate-3 flex flex-col justify-center items-center">
                                    <span className="text-5xl font-black text-emerald-400 drop-shadow-md">{(report.overallPercentage || 0).toFixed(0)}</span>
                                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">% Match</span>
                                </div>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-emerald-200 mb-4 text-center tracking-tight">Technical Analysis</h2>
                            <p className="text-emerald-400 font-black uppercase tracking-[0.2em] border border-emerald-500/20 px-6 py-2 rounded-full bg-[#050505]/50 text-[10px] shadow-sm mb-3">
                                Verdict: {report.finalVerdict}
                            </p>
                            <p className="text-emerald-300/70 text-xs font-bold uppercase tracking-widest border border-emerald-900/50 px-4 py-1.5 rounded-full bg-emerald-900/10">Cumulative Score: {report.totalScore} / {report.maxScore}</p>
                        </div>

                        {report.questionAnalysis && report.questionAnalysis.length > 0 && (
                            <div className="space-y-6 mb-12 w-full text-left">
                                <h3 className="font-black text-emerald-500/50 mb-6 text-[11px] uppercase tracking-[0.2em] px-2 border-l-2 border-emerald-500">Node-By-Node Breakdown</h3>
                                {report.questionAnalysis.map((qa, i) => (
                                    <div key={i} className="bg-[#050505]/40 p-6 md:p-8 border border-emerald-500/20 rounded-3xl shadow-inner text-emerald-100 flex flex-col gap-5 transition-all hover:border-emerald-500/40 hover:bg-[#0a0f0d]/60">
                                        <div className="flex justify-between items-start gap-4 flex-col md:flex-row">
                                            <h4 className="font-bold text-lg md:text-xl text-white leading-relaxed">{qa.question}</h4>
                                            <div className="shrink-0 flex items-center gap-3">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm ${qa.score >= 8 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : qa.score >= 5 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>{qa.correctness}</span>
                                                <span className="px-4 py-1.5 bg-black border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-black tracking-widest shadow-inner">{qa.score}/10</span>
                                            </div>
                                        </div>

                                        <div className="bg-[#050505] p-5 rounded-2xl border border-emerald-900/50">
                                            <p className="text-[10px] uppercase font-black text-emerald-600 mb-2 tracking-[0.2em]">Executed Response</p>
                                            <p className="text-sm font-medium text-emerald-300/70 leading-relaxed font-sans">{qa.userAnswer || "No protocol executed."}</p>
                                        </div>

                                        <div className="bg-emerald-900/20 p-5 rounded-2xl border border-emerald-500/30 shadow-emeraldGlowSoft">
                                            <p className="text-[10px] uppercase font-black text-emerald-400 mb-2 tracking-[0.2em]">Optimal Target Signature</p>
                                            <p className="text-sm font-medium text-emerald-100 leading-relaxed font-sans">{qa.idealAnswer}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                            <div className="bg-red-900/10 border border-red-500/20 p-5 rounded-2xl">
                                                <p className="text-[10px] uppercase font-black text-red-400 mb-3 tracking-[0.2em] flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Trace Faults</p>
                                                <p className="text-[13px] font-medium text-emerald-200/60 leading-relaxed">{qa.missingPoints || "None"}</p>
                                            </div>
                                            <div className="bg-emerald-900/10 border border-emerald-500/20 p-5 rounded-2xl">
                                                <p className="text-[10px] uppercase font-black text-emerald-500 mb-3 tracking-[0.2em] flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Optimization Path</p>
                                                <p className="text-[13px] font-medium text-emerald-200/60 leading-relaxed">{qa.improvementTip || "Code optimal."}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="bg-[#050505]/40 p-8 border border-emerald-500/20 rounded-3xl shadow-inner">
                                <h3 className="font-black text-emerald-400 mb-6 flex items-center gap-3 text-[13px] uppercase tracking-widest">
                                    <CheckCircle2 className="w-5 h-5" /> Optimized Patterns
                                </h3>
                                <ul className="space-y-4">
                                    {report.strongAreas?.map((str, idx) => (
                                        <li key={idx} className="text-sm font-medium text-emerald-200/80 flex items-start gap-3 leading-loose">
                                            <span className="text-emerald-500 mt-1.5 opacity-80 text-[10px]">■</span> {str}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-[#050505]/40 p-8 border border-emerald-500/20 rounded-3xl shadow-inner">
                                <h3 className="font-black text-red-400 mb-6 flex items-center gap-3 text-[13px] uppercase tracking-widest">
                                    <AlertTriangle className="w-5 h-5" /> Suboptimal Metrics
                                </h3>
                                <ul className="space-y-4">
                                    {report.weakAreas?.map((wk, idx) => (
                                        <li key={idx} className="text-sm font-medium text-emerald-200/80 flex items-start gap-3 leading-loose">
                                            <span className="text-red-500 mt-1.5 opacity-80 text-[10px]">■</span> {wk}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-[#0a0f0d] p-8 md:p-10 border border-emerald-500/30 rounded-3xl shadow-xl">
                            <h3 className="font-black text-emerald-500/50 mb-6 text-[11px] uppercase tracking-[0.2em]">Detailed Mentorship Feedback</h3>
                            <p className="text-emerald-200 text-sm md:text-[15px] font-medium leading-relaxed max-w-4xl">{report.improvementSuggestions}</p>
                        </div>

                        <div className="mt-14 flex justify-center">
                            <button
                                onClick={() => { setReport(null); setSession([]); }}
                                className="px-12 py-5 bg-[#050505] border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 font-bold uppercase tracking-widest text-[11px] rounded-full transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-1"
                            >
                                Re-Initialize Environment
                            </button>
                        </div>
                    </motion.div>
                )}

                {loading && !isActive && !report && (
                    <div className="flex flex-col items-center justify-center p-20 text-emerald-500/50 gap-6 mt-20">
                        <Activity className="w-16 h-16 animate-spin drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        <p className="animate-pulse font-black text-[11px] uppercase tracking-[0.3em]">Compiling Diagnostics...</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default MockInterview;
