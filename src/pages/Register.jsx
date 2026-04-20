import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BrainCircuit } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await register(name, email, password);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 flex justify-center items-center min-h-[calc(100vh-100px)]">
                <div className="w-full max-w-md card p-8">
                    <div className="flex flex-col items-center mb-6">
                        <div className="h-16 w-16 bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-4 text-emerald-500 shadow-sm border border-emerald-500/20">
                            <BrainCircuit className="h-10 w-10" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-semibold text-white">Create Account</h2>
                        <p className="text-emerald-300/70 mt-2 text-sm text-center">Establish your secure engineer profile.</p>
                    </div>

                    {error && <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-emerald-400">Full Name</label>
                            <input
                                type="text"
                                className="input-field"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-emerald-400">Email Address</label>
                            <input
                                type="email"
                                className="input-field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-emerald-400">Password</label>
                            <input
                                type="password"
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required />
                        </div>
                        <button type="submit" className="btn-primary w-full py-4 mt-6">Register Profile</button>
                    </form>

                    <div className="mt-6 text-center text-sm text-emerald-300/70">
                        Already authorized? <Link to="/login" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">Access Portal</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
