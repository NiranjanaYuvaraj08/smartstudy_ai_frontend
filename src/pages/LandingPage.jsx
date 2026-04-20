import { Link } from 'react-router-dom';
import { Brain, TrendingUp, Calendar, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { CreatorSection } from '../components/CreatorSection';

const LandingPage = () => {
    return (
        <div className="flex-grow flex flex-col bg-[#050505] text-white">

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40 px-4 sm:px-6 flex-grow flex items-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-emerald-900/10 opacity-70 blur-3xl rounded-full" />
                <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen animate-float" />
                <div className="absolute bottom-[20%] left-[10%] w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen animate-float shadow-[0_0_50px_rgba(16,185,129,0.3)]" style={{ animationDelay: '2s' }} />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/20 backdrop-blur-md text-emerald-400 font-medium mb-8 shadow-sm border border-emerald-500/20"
                    >
                        <Zap className="h-4 w-4" />
                        <span>The Ultimate Engineer Placement Toolkit</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
                    >
                        Crack the Interview, <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-700">Secure the Bag.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="max-w-2xl mx-auto text-xl text-emerald-300/70 mb-10"
                    >
                        SmartPrep AI generates infinite mock interviews, tests your DSA knowledge, and maps out your exact career roadmap. Engineered for you.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to="/register" className="btn-primary w-full sm:w-auto text-lg px-8 py-4">
                            Get Started for Free
                        </Link>
                        <Link to="/login" className="px-8 py-4 text-lg font-medium text-white hover:text-emerald-400 border border-emerald-500/50 hover:border-emerald-400 rounded-xl transition-all bg-black/50 backdrop-blur-sm shadow-sm hover:shadow-md">
                            I already have an account
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="bg-[#050505] py-24 border-t border-emerald-500/20 relative">
                <div className="absolute inset-0 bg-[#050505]/40 opacity-50 bg-[bottom_1px_center] [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-white">Everything you need to succeed</h2>
                        <p className="text-emerald-300/70 text-lg">Powered by advanced AI models tailored for rigourous technical evaluation.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            index={1}
                            icon={<Brain className="h-8 w-8 text-emerald-500" />}
                            title="Mock Interviews"
                            desc="Simulate actual behavioral and technical interviews with continuous feedback."
                        />
                        <FeatureCard
                            index={2}
                            icon={<TrendingUp className="h-8 w-8 text-emerald-500" />}
                            title="DSA Mastery"
                            desc="Receive optimized solutions and time-complexity breakdowns instantly."
                        />
                        <FeatureCard
                            index={3}
                            icon={<Calendar className="h-8 w-8 text-emerald-500" />}
                            title="Career Roadmaps"
                            desc="Generate tailored 3-month strategies to break into FAANG and top-tier companies."
                        />
                    </div>
                </div>
            </section>

            <CreatorSection />

        </div>
    );
};

const FeatureCard = ({ icon, title, desc, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        className="card p-8 flex flex-col items-start group"
    >
        <div className="h-14 w-14 bg-emerald-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 border border-emerald-500/20">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-emerald-300/70 leading-relaxed group-hover:text-emerald-300 transition-colors">{desc}</p>
    </motion.div>
);

export default LandingPage;
