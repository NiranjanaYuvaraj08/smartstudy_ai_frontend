import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Send, Bot, User, Loader2 } from 'lucide-react';

const ChatAssistant = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/chat');
                if (res.data && res.data.messages) {
                    setMessages(res.data.messages);
                }
            } catch (error) {
                console.error("Failed to load chat history");
            }
        };
        fetchHistory();
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/chat', { prompt: userMessage.content });
            setMessages(res.data.messages); // the backend returns the updated full history
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 flex flex-col items-center">
                <div className="w-full max-w-4xl card p-0 flex flex-col h-[75vh] rounded-[2rem] overflow-hidden shadow-emeraldGlowSoft border border-emerald-500/20 bg-black/70">

                    {/* Chat Header */}
                    <div className="p-6 bg-emerald-900/10 border-b border-emerald-500/20 flex items-center gap-4">
                        <div className="h-12 w-12 bg-emerald-900/50 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-sm">
                            <Bot className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-white">AI Technical Mentor</h2>
                            <p className="text-sm text-emerald-300/70">Ask me anything about algorithms and system design.</p>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-[#050505]/50 custom-scrollbar">
                        {messages.length === 0 && (
                            <div className="text-center text-emerald-300/50 my-10 flex flex-col items-center">
                                <Bot className="h-16 w-16 mb-4 opacity-50 text-emerald-500" />
                                <p>Environment initialized. Awaiting queries.</p>
                                <p className="text-sm mt-2">Try asking: "Explain DFS algorithm with a code example"</p>
                            </div>
                        )}

                        {messages.map((msg, index) => (
                            <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`h-10 w-10 rounded-[1rem] flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-sm ${msg.role === 'user' ? 'bg-emerald-900/20 text-emerald-500' : 'bg-black text-emerald-400'
                                    }`}>
                                    {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                                </div>
                                <div className={`max-w-[80%] rounded-2xl p-5 ${msg.role === 'user'
                                    ? 'bg-emerald-900/20 border border-emerald-500/30 text-white rounded-tr-none shadow-md'
                                    : 'bg-[#0a0f0d] text-white border border-emerald-500/10 rounded-tl-none shadow-sm'
                                    }`}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-[1rem] flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-sm bg-black text-emerald-400">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div className="bg-[#0a0f0d] border border-emerald-500/10 rounded-2xl p-4 rounded-tl-none flex items-center gap-3">
                                    <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                                    <span className="text-emerald-300/70 font-medium tracking-wide">Processing query...</span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-[#0a0f0d]/80 border-t border-emerald-500/20">
                        <form onSubmit={handleSend} className="flex gap-3 relative">
                            <input
                                type="text"
                                className="flex-grow pl-6 pr-14 py-4 rounded-[1.5rem] border border-emerald-500/20 bg-black/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white transition-all shadow-inner placeholder:text-emerald-900/60"
                                placeholder="Execute root command query..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="absolute right-2 top-2 bottom-2 rounded-full p-4 bg-emerald-600 text-black hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatAssistant;
