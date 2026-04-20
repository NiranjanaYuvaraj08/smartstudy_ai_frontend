import { useState } from 'react';
import api from '../services/api';
import { Brain, Trophy, AlertTriangle, RefreshCw, Check, X } from 'lucide-react';

const Quiz = () => {
    const [subject, setSubject] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const generateQuiz = async (e) => {
        e.preventDefault();
        setLoading(true);
        setQuizData(null);
        setShowResults(false);
        setSelectedAnswers({});
        setCurrentQuestion(0);
        setError('');

        try {
            const res = await api.post('/quizzes/generate', { subject, difficulty });
            setQuizData(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to generate quiz. AI might be overwhelmed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAnswer = (ans) => {
        setSelectedAnswers(prev => ({ ...prev, [currentQuestion]: ans }));
    };

    const calculateScore = () => {
        let score = 0;
        quizData.questions.forEach((q, i) => {
            if (selectedAnswers[i] === q.correctAnswer) {
                score++;
            }
        });
        return score;
    };

    const submitQuiz = async () => {
        setSubmitting(true);
        const score = calculateScore();
        const formattedQuestions = quizData.questions.map((q, i) => ({
            ...q,
            userAnswer: selectedAnswers[i]
        }));

        try {
            await api.post('/quizzes', {
                subject: quizData.subject,
                questions: formattedQuestions,
                score,
                total: quizData.questions.length
            });
            setShowResults(true);
        } catch (err) {
            console.error(err);
            setError('Failed to submit results.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white py-10 px-4 sm:px-10 flex justify-center">
            <div className="w-full max-w-4xl space-y-8">

                {/* Header Config */}
                {!quizData && !loading && (
                    <div className="card p-8 md:p-12 text-center animate-fade-in mt-12 bg-black/50 border border-emerald-500/20">
                        <div className="mx-auto h-20 w-20 bg-emerald-900/50 text-emerald-400 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 hover:shadow-emeraldGlowSoft transition-all">
                            <Brain className="h-10 w-10" />
                        </div>
                        <h1 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">AI Quiz Generator</h1>
                        <p className="text-lg text-emerald-300/70 max-w-lg mx-auto mb-10">Test your knowledge on any subject. Our AI will craft custom multiple-choice questions instantly.</p>

                        {error && <div className="bg-red-900/20 text-red-400 border border-red-500/50 p-4 rounded-xl mb-8 flex items-center gap-3 justify-center"><AlertTriangle /> {error}</div>}

                        <form onSubmit={generateQuiz} className="max-w-md mx-auto space-y-6">
                            <div>
                                <label className="block text-left text-sm font-semibold text-emerald-400 mb-2">What do you want to test?</label>
                                <input type="text" className="input-field py-3" placeholder="e.g. System Design, React Hooks, Biology" value={subject} onChange={e => setSubject(e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-left text-sm font-semibold text-emerald-400 mb-2">Difficulty</label>
                                <select className="input-field py-3" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                    <option value="university">University Level</option>
                                </select>
                            </div>
                            <button type="submit" className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-2">
                                <Brain className="h-5 w-5" /> Generate Quiz
                            </button>
                        </form>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="card p-12 text-center mt-12 flex flex-col items-center justify-center bg-black/50 border border-emerald-500/20">
                        <RefreshCw className="h-16 w-16 animate-spin text-emerald-500 mb-6" />
                        <h2 className="text-2xl font-bold mb-2 text-white">Crafting your custom quiz...</h2>
                        <p className="text-emerald-300/70">The system is gathering data vectors for '{subject}'.</p>
                    </div>
                )}

                {/* Active Quiz */}
                {quizData && !showResults && !loading && (
                    <div className="card p-0 overflow-hidden shadow-emeraldGlowSoft border-none bg-[#0a0f0d]">
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-900 border-b border-emerald-500/20 p-6 text-white text-center">
                            <h2 className="text-2xl font-bold capitalize">{quizData.subject} Core Competency</h2>
                            <div className="mt-4 flex justify-center gap-2">
                                {quizData.questions.map((_, i) => (
                                    <div key={i} className={`h-2 w-10 md:w-16 rounded-full transition-all ${i === currentQuestion ? 'bg-white' : i < currentQuestion ? 'bg-white/50' : 'bg-white/20'}`} />
                                ))}
                            </div>
                        </div>

                        <div className="p-8 md:p-12">
                            <div className="mb-4 text-emerald-400 font-semibold flex items-center justify-between text-sm uppercase tracking-wider">
                                <span>Question {currentQuestion + 1} of {quizData.questions.length}</span>
                                <span className="text-emerald-300/50 font-normal">Select the optimal approach</span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-relaxed">
                                {quizData.questions[currentQuestion].questionText}
                            </h3>

                            <div className="space-y-4">
                                {quizData.questions[currentQuestion].options.map((opt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSelectAnswer(opt)}
                                        className={`w-full text-left p-5 rounded-xl border transition-all ${selectedAnswers[currentQuestion] === opt ? 'border-emerald-500 bg-emerald-900/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-emerald-500/20 hover:border-emerald-400 hover:bg-[#050505] text-emerald-300/70'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${selectedAnswers[currentQuestion] === opt ? 'border-emerald-500 bg-emerald-500' : 'border-emerald-500/50'}`}>
                                                {selectedAnswers[currentQuestion] === opt && <div className="h-2 w-2 bg-black rounded-full" />}
                                            </div>
                                            <span className="text-lg">{opt}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-12 flex justify-between border-t border-emerald-500/20 pt-8">
                                <button
                                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                                    disabled={currentQuestion === 0}
                                    className="px-6 py-3 font-medium text-emerald-300/70 hover:bg-emerald-900/20 hover:text-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                >
                                    Previous
                                </button>

                                {currentQuestion < quizData.questions.length - 1 ? (
                                    <button
                                        onClick={() => setCurrentQuestion(prev => Math.min(quizData.questions.length - 1, prev + 1))}
                                        disabled={!selectedAnswers[currentQuestion]}
                                        className="btn-primary"
                                    >
                                        Next Question
                                    </button>
                                ) : (
                                    <button
                                        onClick={submitQuiz}
                                        disabled={!selectedAnswers[currentQuestion] || submitting}
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        {submitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Trophy className="h-5 w-5" />} Submit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Screen */}
                {showResults && quizData && (
                    <div className="card text-center py-16 px-4 animate-slide-up shadow-emeraldGlowSoft overflow-hidden relative bg-black/60 border border-emerald-500/20">
                        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                            <Trophy className="w-64 h-64 text-emerald-500" />
                        </div>
                        <Trophy className="h-24 w-24 text-emerald-500 mx-auto mb-6 relative z-10" />
                        <h2 className="text-4xl font-extrabold mb-4 relative z-10 text-white">Evaluation Matrix Completed</h2>

                        <div className="inline-block bg-black/50 px-8 py-6 rounded-[2rem] mt-2 mb-10 border border-emerald-500/30 relative z-10 shadow-sm">
                            <p className="text-emerald-300/70 mb-2 uppercase tracking-wide font-bold text-sm">Target Score Reached</p>
                            <div className="text-6xl font-black text-emerald-500">
                                {calculateScore()} <span className="text-3xl text-emerald-300/50">/ {quizData.questions.length}</span>
                            </div>
                            <p className="mt-4 font-medium text-lg text-emerald-300/90">
                                {calculateScore() / quizData.questions.length >= 0.8 ? 'Excellent performance! You mastered this component.' : 'Sub-optimal performance. Recalibrate and try again.'}
                            </p>
                        </div>

                        <div className="space-y-6 max-w-2xl mx-auto text-left relative z-10">
                            <h3 className="font-bold text-xl border-b border-emerald-500/20 pb-4 mb-8 text-center text-white">Traceback Review</h3>
                            {quizData.questions.map((q, i) => {
                                const isCorrect = selectedAnswers[i] === q.correctAnswer;
                                return (
                                    <div key={i} className={`p-6 rounded-2xl border ${isCorrect ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-red-900/10 border-red-500/30'}`}>
                                        <p className="font-semibold text-white mb-4 text-lg">{i + 1}. {q.questionText}</p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-2 text-sm bg-black/30 p-3 rounded-xl border border-emerald-500/10">
                                                <span className="font-bold text-emerald-300/70 mt-0.5 min-w-[100px] uppercase">Input:</span>
                                                <span className={`font-medium flex items-center gap-1.5 text-[0.95rem] ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {selectedAnswers[i] || 'Timeout / No answer'} {isCorrect ? <Check className="h-4 w-4 stroke-[3]" /> : <X className="h-4 w-4 stroke-[3]" />}
                                                </span>
                                            </div>
                                            {!isCorrect && (
                                                <div className="flex items-start gap-2 text-sm bg-[#0a0f0d] p-3 rounded-xl border border-emerald-500/20 mt-3 shadow-sm border-l-4 border-l-emerald-500">
                                                    <span className="font-bold text-emerald-500/70 mt-0.5 min-w-[100px] uppercase">Expected:</span>
                                                    <span className="font-medium text-emerald-300 text-[0.95rem]">{q.correctAnswer}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-12 border-t border-emerald-500/20 pt-8 relative z-10 flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={() => setQuizData(null)} className="px-8 py-4 font-bold bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 rounded-xl transition-colors tracking-wide">Initiate New Sequence</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quiz;
