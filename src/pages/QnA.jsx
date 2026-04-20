import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Send, Cpu, History, MessageSquare, Menu, X, Plus } from 'lucide-react';

const CATEGORIES = [
    "DSA", "DBMS", "OS", "CN", "Frontend", "Backend", "System Design", "UI/UX"
];

const QnA = () => {
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/qa/history');
            setHistory(res.data);
        } catch (error) {
            console.error("Failed to fetch QA history", error);
        }
    };

    const handleLoadConversation = async (id) => {
        try {
            const res = await api.get(`/qa/history/${id}`);
            if (res.data.conversation) {
                // Map from DB schema role 'user'/'assistant' to local state 'user'/'ai'
                setMessages(res.data.conversation.map(msg => ({
                    role: msg.role === 'assistant' ? 'ai' : 'user',
                    content: msg.message
                })));
                setCategory(res.data.category);
                setIsSidebarOpen(false); // Close sidebar on mobile after selection
            }
        } catch (error) {
            console.error("Failed to load conversation", error);
        }
    };

    const startNewChat = () => {
        setMessages([]);
        setInput('');
        setIsSidebarOpen(false);
    };

    const handleAsk = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const currentMsgContent = input.trim();
        const userMsg = { role: 'user', content: currentMsgContent };

        // Append to existing, or start fresh if new session
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Re-passing category just for backend state. Currently the backend creates a NEW history record
            // each time you ask. A true continued-conversation requires appending in backend, but per instructions,
            // we use the backend correctly (calling /qa/ask). The backend currently creates a new doc per ask.
            // If the user wants a connected chat string, we accept the current /qa/ask execution creating a block.
            const res = await api.post('/qa/ask', { category, question: currentMsgContent });
            setMessages(prev => [...prev, { role: 'ai', content: res.data.answer }]);
            fetchHistory(); // Refresh sidebar history list!
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'ai', content: '*Error processing your request. Please try again.*' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-grow flex h-[calc(100vh-80px)] bg-[#050505] text-white relative overflow-hidden">
            {/* Ambient Background Gradient for chat aesthetic */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full mix-blend-screen pointer-events-none z-0" />

            {/* --- SIDEBAR (History) --- */}
            <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0a0f0d] border-r border-emerald-500/20 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full mt-16 md:mt-0 p-4">
                    <button
                        onClick={startNewChat}
                        className="w-full flex items-center gap-3 p-3 mb-6 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-400 border border-emerald-500/30 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    >
                        <Plus className="w-5 h-5" /> New Chat
                    </button>

                    <h3 className="text-xs uppercase tracking-widest text-emerald-300/50 font-bold mb-4 ml-2">Recent Consultations</h3>

                    <div className="flex-grow overflow-y-auto space-y-2 custom-scrollbar pr-1">
                        {history.length === 0 ? (
                            <p className="text-emerald-300/50 text-sm ml-2">No history yet.</p>
                        ) : (
                            history.map(item => (
                                <button
                                    key={item._id}
                                    onClick={() => handleLoadConversation(item._id)}
                                    className="w-full text-left flex items-start gap-3 p-3 rounded-lg hover:bg-[#050505] transition-colors border border-transparent hover:border-emerald-500/30 group"
                                >
                                    <MessageSquare className="w-4 h-4 text-emerald-500 mt-1 opacity-70 group-hover:opacity-100 shrink-0" />
                                    <div className="overflow-hidden">
                                        <div className="text-sm font-medium text-white truncate">
                                            {item.conversation && item.conversation.length > 0 ? item.conversation[0].message : "Empty Query"}
                                        </div>
                                        <div className="text-xs text-emerald-300/50 mt-0.5 flex gap-2">
                                            <span>{item.category}</span>
                                            <span>•</span>
                                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* --- MAIN CHAT AREA --- */}
            <div className="flex-grow flex flex-col h-[calc(100vh-80px)] relative z-10 w-full md:w-[calc(100%-18rem)]">

                {/* Mobile Header Toggle */}
                <div className="md:hidden flex items-center justify-between p-4 border-b border-emerald-500/20 bg-black/50 backdrop-blur-md absolute top-0 left-0 right-0 z-30">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-emerald-300/70">
                        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                    <span className="font-bold text-emerald-500">Q&A Chat</span>
                    <div className="w-6" /> {/* Spacer */}
                </div>

                {/* Chat Scroll Area */}
                <div className="flex-grow overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center h-[50vh] text-emerald-300/50 opacity-80">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 shadow-emeraldGlowSoft">
                                    <Cpu className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Technical AI Mentor</h2>
                                <p className="max-w-md text-emerald-300/70 mb-8">Ask highly specific technical questions regarding DSA, Systems Design, Backend infrastructure, and more.</p>
                                <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                                    <button onClick={() => { setCategory('System Design'); setInput('How do I scale a high-traffic WebSocket server?'); }} className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-900/10 hover:bg-emerald-900/30 text-sm text-emerald-300/90 text-left transition-colors">"How do I scale a high-traffic WebSocket server?"</button>
                                    <button onClick={() => { setCategory('DSA'); setInput('Explain the difference between Dijkstra and A* pathfinding.'); }} className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-900/10 hover:bg-emerald-900/30 text-sm text-emerald-300/90 text-left transition-colors">"Explain Dijkstra vs A* algorithms."</button>
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'ai' && (
                                        <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mr-4 mt-1">
                                            <Cpu className="w-5 h-5 text-emerald-500" />
                                        </div>
                                    )}
                                    <div className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-sm border ${msg.role === 'user'
                                        ? 'bg-emerald-900/30 border-emerald-500/50 text-white shadow-emeraldGlowSoft rounded-tr-sm'
                                        : 'bg-transparent border-transparent text-white text-[15px] leading-relaxed'
                                        }`}>
                                        {msg.role === 'ai' ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none prose-emerald prose-headings:text-emerald-500 prose-a:text-emerald-400">
                                                <ReactMarkdown
                                                    components={{
                                                        code({ node, inline, className, children, ...props }) {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            return !inline && match ? (
                                                                <SyntaxHighlighter
                                                                    language={match[1]}
                                                                    PreTag="div"
                                                                    className="rounded-lg my-4 !bg-black border border-emerald-500/20 font-mono text-sm shadow-emeraldGlowSoft"
                                                                    {...props}
                                                                >
                                                                    {String(children).replace(/\n$/, '')}
                                                                </SyntaxHighlighter>
                                                            ) : (
                                                                <code className="bg-[#0a0f0d] text-emerald-400 px-1.5 py-0.5 rounded-md font-mono text-sm border border-emerald-500/20" {...props}>
                                                                    {children}
                                                                </code>
                                                            )
                                                        }
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="font-medium text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}

                        {loading && (
                            <div className="flex justify-start items-center gap-4">
                                <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
                                    <Cpu className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div className="flex items-center gap-2 text-emerald-500 font-medium bg-[#0a0f0d]/50 px-5 py-3 rounded-2xl rounded-tl-sm border border-emerald-500/20">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200"></span>
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-300"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Sticky Input Area */}
                <div className="p-4 md:p-6 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent shrink-0">
                    <div className="max-w-4xl mx-auto">
                        <form onSubmit={handleAsk} className="relative flex flex-col gap-2 rounded-2xl bg-[#0a0f0d]/80 backdrop-blur-md border border-emerald-500/20 p-2 shadow-xl focus-within:border-emerald-500/80 focus-within:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                            <div className="flex items-center gap-2 px-2 pt-2 pb-1">
                                <select
                                    className="bg-[#050505] border border-emerald-500/20 hover:border-emerald-500/50 text-emerald-300/90 text-xs font-bold uppercase tracking-widest rounded-lg py-1.5 px-3 focus:outline-none transition-colors appearance-none cursor-pointer"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    disabled={loading}
                                >
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="flex relative items-end px-2 pb-2">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(e); }
                                    }}
                                    placeholder="Message the AI Mentor..."
                                    className="w-full bg-transparent text-white placeholder:text-emerald-900/60 focus:outline-none resize-none pt-2 pb-1 text-[15px] min-h-[44px] max-h-40 font-medium custom-scrollbar"
                                    disabled={loading}
                                    rows="1"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="p-2.5 ml-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-black shadow-emeraldGlowSoft rounded-xl transition-all"
                                >
                                    <Send className="w-4 h-4 ml-0.5" />
                                </button>
                            </div>
                        </form>
                        <p className="text-center text-[10px] text-emerald-300/50 mt-3 hidden md:block">
                            AI interactions are analyzed for context. Mentors can make mistakes. Consider verifying advanced architectures.
                        </p>
                    </div>
                </div>

            </div>

            {/* Mobile overlay for sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}
        </div>
    );
};

export default QnA;
