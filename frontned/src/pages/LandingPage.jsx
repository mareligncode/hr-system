import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import r2unisonImg from '../assets/images/r2unison.webp';

const slides = [
    {
        image: r2unisonImg,
        accent: "Precision in Staff Harmony",
        title: <>Experience <span className="text-lp-secondary-fixed-dim">Institutional Unison</span> in HR</>,
        description: "The global benchmark for human capital management. Orchestrate your entire hospitality workforce with elite precision and 5-star digital infrastructure.",
        cta1: "Get Started",
        cta2: "Explore Features"
    },
    {
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAX3AQ6xsQ-pib0GVHEjma9OJRR4wIl8s_awnvJmuvi0aOftcc8euTgEO_wFsFuMfKezr668DmtgIpF9afeqi2gJYCS0XFBB9ZrTVEvynkz3WA2jajJEe3uNiRQQ_EFxKZ-5-4fM3UYfOxA-7I2V_Qj12o02xVfX2WngTlJMppRhgFnQbKvgGAXhfrg497TYn0sdA-f9Pdobstpvd8ElBZR12JTD0BZHYPyCLa2b7Xy8wOw3O96d45QtO33uYEw6mSHr278hK16QMo",
        accent: "Excellence in Hospitality HR",
        title: <>Elevate Your Hotel Workforce with <span className="text-lp-secondary-fixed-dim">World-Class HR</span></>,
        description: "Seamless management, global standards, and unparalleled efficiency for the hospitality industry. Crafted for the world's most prestigious hotels.",
        cta1: "Sign In",
        cta2: "View Demo"
    },
    {
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCG5I0lR5xWfowi3vyCB_hJ-_VG5mUdHV9chEY1WJie3sN8RajeX7t3wszyBGhjIO8KkX1q591iKVOKoClgA7DpvjRh1-Sw68qJefY_C61GyhvlqE6AJUVSy8hZnxK9v4cg5dkHtGcSxFLh5YoYysLsYgLNedQMAooGS94dimxjxDFC70jsot2jK5hXDj1tLDxWVXBTzrZA-ZaHZRZOZOnlAuHa2w8PXlontM88VVPo8Q_VvEu6bbx2VV8uVzrG2wpgNv4b-F-NnwQ",
        accent: "Advanced Talent Management",
        title: <>Sophisticated <span className="text-lp-secondary-fixed-dim">Talent Analytics</span> & Performance</>,
        description: "Gain deep insights into your staff potential with AI-driven KPIs tailored for high-touch luxury service environments. Operational excellence refined.",
        cta1: "Demo Now",
        cta2: "View Stories"
    }
];

const LandingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-lp-surface text-lp-on-surface font-body selection:bg-lp-secondary-container selection:text-lp-on-secondary-container min-h-screen">
            <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .glass-dark {
          background: rgba(0, 17, 58, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .hero-gradient {
          background: linear-gradient(150deg, #00113a 0%, #002366 100%);
        }
        .gold-border-focus:focus-within {
          border-bottom: 2px solid #775a19;
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>

            {/* Top Navigation Bar */}
            <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.04)]">
                <div className="flex justify-between items-center px-6 md:px-12 py-6 max-w-screen-2xl mx-auto">
                    <div className="text-2xl font-bold tracking-tighter text-blue-950 font-headline">LUXE HR</div>
                    <div className="hidden md:flex items-center space-x-12">
                        <a className="text-sm tracking-widest uppercase text-amber-700 font-bold border-b border-amber-700/20" href="#features">Features</a>
                        <a className="text-sm tracking-widest uppercase text-blue-950/60 hover:text-blue-950 transition-colors" href="#why-us">Why Us</a>
                        <a className="text-sm tracking-widest uppercase text-blue-950/60 hover:text-blue-950 transition-colors" href="#stories">Stories</a>
                    </div>
                    <button
                        onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                        className="bg-lp-primary hover:opacity-80 transition-all duration-500 ease-in-out text-lp-on-primary px-8 py-3 rounded-xl text-sm tracking-widest uppercase font-bold transform active:scale-95"
                    >
                        {isAuthenticated ? 'Dashboard' : 'Sign In'}
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative min-h-screen flex items-center overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 z-0"
                    >
                        <motion.img
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 3, ease: "easeOut" }}
                            className="w-full h-full object-cover brightness-[0.3]"
                            alt="luxury hotel"
                            src={slides[currentSlide].image}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Glassmorphism Overlay Content */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pt-20">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="max-w-3xl"
                        >
                            <div className="flex items-center space-x-4 mb-6">
                                <span className="h-[1px] w-12 bg-lp-secondary"></span>
                                <span className="text-lp-secondary font-label tracking-[0.3em] uppercase text-xs">
                                    {slides[currentSlide].accent}
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-headline font-extrabold text-white leading-tight mb-8">
                                {slides[currentSlide].title}
                            </h1>
                            <p className="text-xl md:text-2xl font-light text-white/80 mb-12 leading-relaxed">
                                {slides[currentSlide].description}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <button
                                    onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                                    className="hero-gradient text-lp-on-primary px-10 py-5 rounded-xl font-bold tracking-widest uppercase shadow-2xl hover:scale-105 transition-transform"
                                >
                                    {isAuthenticated ? 'Go to Dashboard' : slides[currentSlide].cta1}
                                </button>
                                <button className="border border-white/20 backdrop-blur-md text-white px-10 py-5 rounded-xl font-bold tracking-widest uppercase hover:bg-white/10 transition-all">
                                    {slides[currentSlide].cta2}
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
                {/* Floating Elements (Constant) */}
                <div className="absolute right-20 bottom-20 hidden lg:block">
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="glass-panel p-8 rounded-2xl shadow-2xl border-t-2 border-lp-secondary/20 max-w-xs transform rotate-3"
                    >
                        <div className="flex items-center mb-4">
                            <span className="material-symbols-outlined text-lp-secondary mr-3" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="text-lp-primary font-bold text-sm">Top-Rated Global HR 2024</span>
                        </div>
                        <p className="text-lp-on-surface-variant text-sm leading-relaxed">Trusted by 5-star establishments to manage over 100,000 global staff members daily.</p>
                    </motion.div>
                </div>
                {/* Dots Indicator */}
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
                    {slides.map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-lp-secondary w-6' : 'bg-white/30'}`}
                        />
                    ))}
                </div>
            </header>

            {/* Features Section (Bento Grid) */}
            <motion.section
                id="features"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="py-32 px-6 md:px-12 bg-lp-surface"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="mb-20 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-8">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl md:text-5xl font-headline font-bold text-lp-primary mb-6">Redefining Operational Excellence</h2>
                            <p className="text-lp-on-surface-variant text-lg">Sophisticated tools designed specifically for the unique demands of luxury hospitality staff management.</p>
                        </div>
                        <div className="text-lp-secondary font-bold tracking-tighter text-6xl opacity-10">01 / FEATURES</div>
                    </div>
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.2
                                }
                            }
                        }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        <motion.div
                            variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
                            className="md:col-span-2 group relative overflow-hidden rounded-2xl bg-lp-surface-container-lowest p-12 shadow-sm border-t-2 border-lp-secondary/10 transition-all hover:shadow-xl"
                        >
                            <div className="relative z-10">
                                <span className="material-symbols-outlined text-4xl text-lp-secondary mb-6">diversity_3</span>
                                <h3 className="text-2xl font-headline font-bold text-lp-primary mb-4">Elite Staff Unison</h3>
                                <p className="text-lp-on-surface-variant leading-relaxed max-w-md">Orchestrate your hospitality teams with surgical precision. Our Unison engine ensures every department moves in perfect harmony toward guest delight.</p>
                            </div>
                            <div className="absolute bottom-0 right-0 w-full h-full pointer-events-none opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700">
                                <img
                                    className="w-full h-full object-cover grayscale scale-110 group-hover:scale-100 transition-transform duration-1000"
                                    src={r2unisonImg}
                                    alt="Staff Unison"
                                />
                            </div>
                            <div className="absolute top-10 right-10 opacity-20 transform -rotate-12 group-hover:rotate-0 transition-transform">
                                <span className="material-symbols-outlined text-8xl text-lp-secondary">hands_clapping</span>
                            </div>
                        </motion.div>
                        {/* Small Feature Card */}
                        <motion.div
                            variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
                            className="group bg-lp-tertiary-container p-12 rounded-2xl transition-all hover:scale-[1.02]"
                        >
                            <span className="material-symbols-outlined text-4xl text-lp-secondary-fixed-dim mb-6">query_stats</span>
                            <h3 className="text-2xl font-headline font-bold text-white mb-4">Performance Analytics</h3>
                            <p className="text-lp-tertiary-fixed-dim leading-relaxed">Deep insights into staff performance using AI-driven KPIs tailored for high-touch service environments.</p>
                        </motion.div>
                        {/* Three Bottom Cards */}
                        <motion.div
                            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                            className="group bg-lp-surface-container-lowest p-10 rounded-2xl border-t-2 border-lp-secondary/5 shadow-sm hover:shadow-lg transition-all"
                        >
                            <span className="material-symbols-outlined text-3xl text-lp-secondary mb-6">schedule</span>
                            <h3 className="text-xl font-headline font-bold text-lp-primary mb-3">Staff Scheduling</h3>
                            <p className="text-lp-on-surface-variant text-sm">Dynamic shift management optimized for occupancy rates and seasonal fluctuations.</p>
                        </motion.div>
                        <motion.div
                            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                            className="group bg-lp-surface-container-lowest p-10 rounded-2xl border-t-2 border-lp-secondary/5 shadow-sm hover:shadow-lg transition-all"
                        >
                            <span className="material-symbols-outlined text-3xl text-lp-secondary mb-6">payments</span>
                            <h3 className="text-xl font-headline font-bold text-lp-primary mb-3">Payroll Automation</h3>
                            <p className="text-lp-on-surface-variant text-sm">Multi-currency, tax-compliant payroll processing across international borders.</p>
                        </motion.div>
                        <motion.div
                            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                            className="group bg-lp-surface-container-lowest p-10 rounded-2xl border-t-2 border-lp-secondary/5 shadow-sm hover:shadow-lg transition-all"
                        >
                            <span className="material-symbols-outlined text-3xl text-lp-secondary mb-6">verified_user</span>
                            <h3 className="text-xl font-headline font-bold text-lp-primary mb-3">Compliance Management</h3>
                            <p className="text-lp-on-surface-variant text-sm">Automated legal tracking ensuring global labor laws and safety standards are met.</p>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Why Choose Us / Stats Section */}
            <motion.section
                id="why-us"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="bg-lp-primary text-white py-32 overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                    <div className="absolute top-20 right-[-10%] w-[800px] h-[800px] border-[1px] border-lp-secondary rounded-full"></div>
                    <div className="absolute top-40 right-[-5%] w-[600px] h-[600px] border-[1px] border-lp-secondary rounded-full"></div>
                </div>
                <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1">
                            <motion.div
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true }}
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                                }}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-8"
                            >
                                <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }} className="bg-white/5 backdrop-blur-lg p-10 rounded-2xl">
                                    <div className="text-5xl font-headline font-extrabold text-lp-secondary-fixed-dim mb-2">500+</div>
                                    <div className="text-sm font-label tracking-widest uppercase opacity-60">Hotels Integrated Globally</div>
                                </motion.div>
                                <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }} className="bg-white/5 backdrop-blur-lg p-10 rounded-2xl mt-12">
                                    <div className="text-5xl font-headline font-extrabold text-lp-secondary-fixed-dim mb-2">99%</div>
                                    <div className="text-sm font-label tracking-widest uppercase opacity-60">Staff Satisfaction</div>
                                </motion.div>
                                <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }} className="bg-white/5 backdrop-blur-lg p-10 rounded-2xl -mt-12">
                                    <div className="text-5xl font-headline font-extrabold text-lp-secondary-fixed-dim mb-2">24h</div>
                                    <div className="text-sm font-label tracking-widest uppercase opacity-60">Concierge Support</div>
                                </motion.div>
                                <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }} className="bg-white/5 backdrop-blur-lg p-10 rounded-2xl">
                                    <div className="text-5xl font-headline font-extrabold text-lp-secondary-fixed-dim mb-2">12M+</div>
                                    <div className="text-sm font-label tracking-widest uppercase opacity-60">Shifts Managed</div>
                                </motion.div>
                            </motion.div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="order-1 lg:order-2"
                        >
                            <h2 className="text-4xl md:text-6xl font-headline font-bold mb-8 leading-tight">Sophistication at <span className="text-lp-secondary-fixed-dim italic">Scale</span></h2>
                            <p className="text-xl text-lp-primary-fixed-dim font-light leading-relaxed mb-10">
                                Luxury hospitality requires a different level of attention. Our system isn't just software; it's a digital infrastructure built on the philosophy of white-glove service. We empower your management to focus on guests, while we automate the administrative complexities.
                            </p>
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <span className="material-symbols-outlined text-lp-secondary">check_circle</span>
                                    <span className="text-lg">ISO 27001 Certified Security</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="material-symbols-outlined text-lp-secondary">check_circle</span>
                                    <span className="text-lg">Seamless PMS & ERP Integration</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Testimonials Section */}
            <motion.section
                id="stories"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="py-32 px-6 md:px-12 bg-lp-surface-container-low"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-headline font-bold text-lp-primary mb-4">Voices of Leadership</h2>
                        <p className="text-lp-on-surface-variant max-w-xl mx-auto">Hear from the executives of the world's most iconic hotel brands.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Testimonial cards */}
                        {[
                            {
                                text: "LUXE HR has fundamentally changed how we manage our global talent pool. The reporting capabilities are unrivaled in the industry.",
                                author: "Marcus Sterling",
                                role: "COO, Grand Azure Resorts",
                                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0a0Iv0gpOfxkwbnCe82SAm6FjSXD7gxwmQsMoIrYIWCCLyl1zto7q-3fjs16hNFIdlB7qQSiYoGwd6ZqBdEJNkzyJX2iyDgDkwPXljzJPOwbI9izZH1SshJGQuy9UPAoQ58D5vQMbT6hif_0Fw2kQoA71kITGabOhs5jpv5yoZWonBC5ZGhfozWcHXCL-3NzPsp1quKBAulfy5b_Z8UQJ712dBJUP0lc9_1PN8IpxslcqkU-KUXCAT6v1kTe90S1kK49x6e3fXOE"
                            },
                            {
                                text: "The implementation was flawless. It feels like the system was built specifically for our concierge and high-end service teams.",
                                author: "Elena Rodriguez",
                                role: "Global HR Director, L'Excellence",
                                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgCZBFtylpeUz3ZDoOTI0Mkuch2S26OOhlhl5GNuQD4_eRJBdSkUE1-Cf7EcwyIraNbKzT94FZE3g0r3mrfn53hHHzmDCi-eC-E0ceKCOnVcLzVCnsi3GpGBMwnfCJ74A41Vuk4ExMMbQxCUuZp-MQaDVPms3WJ8w0iflDb6TjzU1J9gv9aGc4pDCb2d8r7i2PTUsdcbYWK6l4kGOCPgmgzvsmPi7O5QL5_JnBgBr-wwyduPstNnB1OmkP8Eg2dZ88lNEmZHHWq7w"
                            },
                            {
                                text: "Operational efficiency increased by 35% within the first six months. This is the gold standard for HR systems.",
                                author: "Julian Thorne",
                                role: "Founder, Thorne Hospitality",
                                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNNurUOEOvPVSaD6NXRMkxFCxIo6birTn-U1HpzTunUxR3jFDh99NustXzPXj_8WDAza9fg3ckUWYz8Fk11-vKAuYPV19DdHQkPN8N18JFGiyTvOnhhGVu_0Yh3CQonyrK3Mb7BgdYl_HbYPt41X-Sxnwv-gumomE0_8hHpg0m61y02Ps_uGdKNLIavXWEUpUfJHJye8xjP7d0_zTdaIj-okulw9YLlPnn1Q5A-uoxzpZwtXtWLqZspECcrnl3twd8YhIdaPCMt4c"
                            }
                        ].map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-lp-surface-container-lowest p-12 rounded-2xl shadow-sm border-t-4 border-lp-secondary transition-all hover:shadow-2xl"
                            >
                                <div className="flex text-lp-secondary-container mb-6">
                                    {[...Array(5)].map((_, j) => (
                                        <span key={j} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    ))}
                                </div>
                                <p className="text-lp-primary font-light italic text-lg leading-relaxed mb-8">"{t.text}"</p>
                                <div className="flex items-center">
                                    <img className="w-14 h-14 rounded-full object-cover mr-4 grayscale hover:grayscale-0 transition-all" alt={t.author} src={t.img} />
                                    <div>
                                        <h4 className="font-bold text-lp-primary">{t.author}</h4>
                                        <p className="text-xs font-label uppercase tracking-widest text-lp-secondary">{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* CTA / Contact Section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="py-32 px-6 md:px-12 relative overflow-hidden"
            >
                <div className="absolute inset-0 z-0">
                    <img
                        className="w-full h-full object-cover brightness-95"
                        alt="meeting room"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG5I0lR5xWfowi3vyCB_hJ-_VG5mUdHV9chEY1WJie3sN8RajeX7t3wszyBGhjIO8KkX1q591iKVOKoClgA7DpvjRh1-Sw68qJefY_C61GyhvlqE6AJUVSy8hZnxK9v4cg5dkHtGcSxFLh5YoYysLsYgLNedQMAooGS94dimxjxDFC70jsot2jK5hXDj1tLDxWVXBTzrZA-ZaHZRZOZOnlAuHa2w8PXlontM88VVPo8Q_VvEu6bbx2VV8uVzrG2wpgNv4b-F-NnwQ"
                    />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="lg:w-1/2"
                    >
                        <h2 className="text-5xl md:text-6xl font-headline font-bold text-lp-primary mb-8 leading-tight">Ready for a <span className="text-lp-secondary">New Standard?</span></h2>
                        <p className="text-xl text-lp-on-surface-variant font-light leading-relaxed mb-12">
                            Join the ranks of the world's finest hotels. Schedule a private demonstration with our senior consultants and discover the future of human capital.
                        </p>
                        <div className="flex items-center space-x-6">
                            <div className="flex -space-x-4">
                                {[1, 2, 3].map(i => (
                                    <img key={i} className="w-12 h-12 rounded-full border-4 border-white object-cover" alt={`avatar ${i}`} src={`https://lh3.googleusercontent.com/aida-public/AB6AXuBIbYQCkbdX6nXl9ckylKidcSfeYlYMronWCviW_CUcNfbM36Gc_9iIxepAU5_ft14fXhX0SrGAI6hdohGlz15tzddPeOLSLYk5BPtDDhfJA3AM21kfbWN-1YVTabrzIp_s8oBOWE5FxiOkn8jMI8gCrApdoLs802DQQosBQz1O2ytfMv9kCktjZYql_LcMudqfVpmRO5l0Eaivagp38xXO9Ki2A8c8KVuTxr5nsGGymX1Kl4cXsw_5f2giJRevN77TzJC_MC5D4VU`} />
                                ))}
                            </div>
                            <p className="text-sm font-bold text-lp-primary uppercase tracking-widest">Join 500+ Luxury Partners</p>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="lg:w-1/2 w-full"
                    >
                        <div className="glass-panel p-8 md:p-12 rounded-2xl shadow-2xl border border-white/50">
                            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                                <div className="gold-border-focus transition-all">
                                    <label className="text-[10px] font-label uppercase tracking-widest text-lp-on-surface-variant mb-2 block">Full Name</label>
                                    <input className="w-full bg-transparent border-0 border-b border-lp-secondary/20 focus:ring-0 text-lp-primary p-0 pb-2 placeholder:text-lp-primary/20" placeholder="Johnathan Sterling" type="text" />
                                </div>
                                <div className="gold-border-focus transition-all">
                                    <label className="text-[10px] font-label uppercase tracking-widest text-lp-on-surface-variant mb-2 block">Hotel Property</label>
                                    <input className="w-full bg-transparent border-0 border-b border-lp-secondary/20 focus:ring-0 text-lp-primary p-0 pb-2 placeholder:text-lp-primary/20" placeholder="The Plaza Grand" type="text" />
                                </div>
                                <div className="gold-border-focus transition-all">
                                    <label className="text-[10px] font-label uppercase tracking-widest text-lp-on-surface-variant mb-2 block">Business Email</label>
                                    <input className="w-full bg-transparent border-0 border-b border-lp-secondary/20 focus:ring-0 text-lp-primary p-0 pb-2 placeholder:text-lp-primary/20" placeholder="executive@hotelgroup.com" type="email" />
                                </div>
                                <button className="w-full bg-lp-primary text-lp-on-primary py-5 rounded-xl font-bold tracking-widest uppercase hover:opacity-90 transition-all shadow-xl">
                                    Request Exclusive Access
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Footer */}
            <footer className="bg-blue-950 w-full py-20 px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 w-full max-w-7xl mx-auto">
                    <div className="space-y-6">
                        <div className="text-lg font-bold text-white font-headline">LUXE HR</div>
                        <p className="text-white/40 text-sm leading-relaxed font-body">The global benchmark for human capital management in the luxury hospitality sector.</p>
                    </div>
                    <div>
                        <h4 className="text-amber-500 font-label tracking-tight uppercase text-xs mb-8">Navigation</h4>
                        <ul className="space-y-4">
                            <li><a className="text-white/40 hover:text-amber-500 transition-colors duration-300 text-sm" href="#features">Features</a></li>
                            <li><a className="text-white/40 hover:text-amber-500 transition-colors duration-300 text-sm" href="#why-us">Why Us</a></li>
                            <li><a className="text-white/40 hover:text-amber-500 transition-colors duration-300 text-sm" href="#stories">Stories</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-amber-500 font-label tracking-tight uppercase text-xs mb-8">Company</h4>
                        <ul className="space-y-4">
                            <li><a className="text-white/40 hover:text-amber-500 transition-colors duration-300 text-sm" href="#">Privacy Policy</a></li>
                            <li><a className="text-white/40 hover:text-amber-500 transition-colors duration-300 text-sm" href="#">Terms of Service</a></li>
                            <li><a className="text-white/40 hover:text-amber-500 transition-colors duration-300 text-sm" href="#">Global Offices</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-amber-500 font-label tracking-tight uppercase text-xs mb-8">Contact Support</h4>
                        <p className="text-white/40 text-sm mb-4">concierge@luxehr.global</p>
                        <div className="flex space-x-6 mt-8">
                            <span className="material-symbols-outlined text-white/20 cursor-pointer hover:text-lp-secondary transition-colors">language</span>
                            <span className="material-symbols-outlined text-white/20 cursor-pointer hover:text-lp-secondary transition-colors">shield</span>
                            <span className="material-symbols-outlined text-white/20 cursor-pointer hover:text-lp-secondary transition-colors">public</span>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-20 text-center md:text-left border-t border-white/5">
                    <p className="text-white/20 text-xs tracking-widest uppercase">© 2024 Luxe Global Human Capital. All rights reserved.</p>
                </div>
            </footer>

            {/* Floating Sticky Widget */}
            <div className="fixed bottom-10 right-10 z-[60]">
                <button
                    onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                    className="group flex items-center bg-lp-secondary text-lp-on-secondary px-6 py-4 rounded-full shadow-[0_10px_40px_rgba(119,90,25,0.4)] hover:scale-110 transition-all"
                >
                    <span className="material-symbols-outlined mr-2">magic_button</span>
                    <span className="font-bold tracking-widest uppercase text-xs">{isAuthenticated ? 'Dashboard' : 'Demo'}</span>
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
