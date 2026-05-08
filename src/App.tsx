/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  Dumbbell, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Instagram, 
  Facebook, 
  Youtube, 
  Twitter, 
  Check, 
  Menu, 
  X,
  ChevronRight,
  Flame,
  UserCheck,
  Target,
  Zap,
  Gem,
  Users
} from 'lucide-react';

// --- Data ---
const CLASSES = [
  { id: 1, name: 'HIIT Explosive', time: '6:00 AM', level: 'Advanced', capacity: 20, category: 'hiit', icon: <Flame className="w-8 h-8" /> },
  { id: 2, name: 'Strength Forge', time: '7:00 AM', level: 'All Levels', capacity: 25, category: 'strength', icon: <Zap className="w-8 h-8" /> },
  { id: 3, name: 'Cardio Blitz', time: '8:00 AM', level: 'Intermediate', capacity: 30, category: 'hiit', icon: <Zap className="w-8 h-8" /> },
  { id: 4, name: 'Power Yoga', time: '5:30 PM', level: 'All Levels', capacity: 28, category: 'yoga', icon: <Users className="w-8 h-8" /> },
  { id: 5, name: 'Core Crusher', time: '6:30 PM', level: 'Intermediate', capacity: 22, category: 'strength', icon: <Target className="w-8 h-8" /> },
  { id: 6, name: 'Elite Boxing', time: '7:30 PM', level: 'Advanced', capacity: 16, category: 'strength', icon: <Dumbbell className="w-8 h-8" /> },
];

const MEMBERSHIPS = [
  {
    name: 'STARTER',
    price: '₹2,499',
    period: '/month',
    features: ['Gym access 6am-10pm', '20 cardio machines', 'Locker facility', 'Basic training session'],
    highlight: false,
  },
  {
    name: 'ELITE',
    price: '₹5,999',
    period: '/month',
    features: ['24/7 unlimited access', 'All equipment access', 'Unlimited classes', '4 personal training sessions/month', 'Nutrition consultation', 'Priority booking'],
    highlight: true,
  },
  {
    name: 'CHAMPION',
    price: '₹9,999',
    period: '/month',
    features: ['24/7 unlimited access', 'All equipment + VIP zone', 'Unlimited premium classes', '12 personal training sessions/month', 'Custom meal planning', 'Priority support', 'Exclusive events'],
    highlight: false,
  },
];

const TESTIMONIALS = [
  {
    name: 'Arjun Patel',
    role: 'Entrepreneur',
    text: 'Transformed my physique in 4 months. The trainers here are absolute professionals. Best decision ever.',
    rating: 5,
    avatar: '👨‍💼',
  },
  {
    name: 'Priya Sharma',
    role: 'Corporate Executive',
    text: 'State-of-the-art facility, incredible community. This gym ignited my fitness journey. Highly recommended!',
    rating: 5,
    avatar: '👩‍💼',
  },
  {
    name: 'Vikram Singh',
    role: 'Athlete',
    text: 'Elite training environment. The equipment, coaching, and energy here are unmatched in Ahmedabad.',
    rating: 5,
    avatar: '🏋️',
  },
];

const FEATURES = [
  { title: "Advanced Equipment", text: "Olympic platforms, cable machines, functional training zones, and cardio tech from world-class brands.", icon: <Flame className="text-primary w-6 h-6" /> },
  { title: "Expert Trainers", text: "NASM, ACE, ISSA certified professionals with competitive athletics & bodybuilding backgrounds.", icon: <UserCheck className="text-primary w-6 h-6" /> },
  { title: "Personalized Plans", text: "Nutrition guidance, program customization, and monthly 1-on-1 coaching sessions.", icon: <Target className="text-primary w-6 h-6" /> },
  { title: "HIIT & Group Classes", text: "Circuit training, yoga, strength, boxing, and power sessions led by pros.", icon: <Zap className="text-primary w-6 h-6" /> },
  { title: "Premium Amenities", text: "Locker rooms with premium showers, steam room, smoothie bar, and recovery lounge.", icon: <Gem className="text-primary w-6 h-6" /> },
  { title: "Exclusive Community", text: "Network with ambitious professionals, athletes, and entrepreneurs at member events.", icon: <Users className="text-primary w-6 h-6" /> },
];

const TRAINERS = [
  { id: 1, name: "Marcus 'Steel' Thorne", role: "Head of Performance", specialty: "Olympic Weightlifting", emoji: "🦾" },
  { id: 2, name: "Sarah 'Zen' Miller", role: "Holistic Wellness Lead", specialty: "Power Yoga & Mobility", emoji: "🧘" },
  { id: 3, name: "Leo 'Swift' Rodriguez", role: "HIIT Specialist", specialty: "Explosive Conditioning", emoji: "⚡" },
  { id: 4, name: "Elena 'Force' Ivanova", role: "Strength Coach", specialty: "Powerlifting", emoji: "🏋️‍♀️" },
];

const FAQS = [
  { q: "Do you offer single-day passes?", a: "Yes, we offer a Free 24-hour trial for new local residents. Single-day passes are also available for ₹500." },
  { q: "Are personal trainers included?", a: "Elite and Champion memberships include monthly 1-on-1 sessions. Dedicated personal training packages are available separately." },
  { q: "Is there a ladies-only area?", a: "While we are a co-ed facility, we have dedicated 'Strength & Flow' hours specifically designed for women participants." },
  { q: "What should I bring for my first session?", a: "Bring comfortable gym wear, athletic shoes, a water bottle, and your drive to transform. We provide towels and lockers." },
];

// --- Components ---

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [classFilter, setClassFilter] = useState('all');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<null | 'success' | 'error'>(null);
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Gemini AI Integration
  const askAICoach = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiMessage(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const prompt = `You are the FORGE Elite AI Coach. provide a short, high-intensity fitness or nutrition advice based on this request: ${aiInput}. Keep it professional, motivating, and under 150 words. Focus on results and discipline. Use a strong, athletic tone.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      setAiMessage(response.text || "I was unable to formulate a strategy. Try again, champion.");
    } catch (error) {
      console.error("AI Assistant error:", error);
      setAiMessage("Connection to the forge interrupted. Re-focus and try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'trainers', 'classes', 'memberships', 'testimonials', 'faq', 'contact'];
      const scrollPos = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (section: string) => {
    setActiveSection(section);
    setIsMenuOpen(false);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredClasses = classFilter === 'all' 
    ? CLASSES 
    : CLASSES.filter(c => c.category === classFilter);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-md border-b border-primary/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => handleNavClick('home')}
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
            >
              <Zap className="text-primary w-8 h-8 fill-primary" />
            </motion.div>
            <span className="font-montserrat font-black text-2xl tracking-tighter bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
              FORGE
            </span>
          </div>

          {/* Desktop Nav */}
          <ul className="hidden md:flex gap-10">
            {['home', 'about', 'trainers', 'classes', 'memberships', 'testimonials', 'faq', 'contact'].map((section) => (
              <li key={section}>
                <button
                  onClick={() => handleNavClick(section)}
                  className={`text-sm font-medium uppercase tracking-widest transition-colors relative pb-1 ${
                    activeSection === section ? 'text-primary' : 'text-zinc-400 hover:text-primary'
                  }`}
                >
                  {section}
                  {activeSection === section && (
                    <motion.div
                      layoutId="navUnderline"
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>

          <button 
            className="md:hidden text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-black border-b border-primary/20 flex flex-col p-6 md:hidden gap-6"
            >
              {['home', 'about', 'trainers', 'classes', 'memberships', 'testimonials', 'faq', 'contact'].map((section) => (
                <button
                  key={section}
                  onClick={() => handleNavClick(section)}
                  className={`text-lg font-bold uppercase text-left border-b border-zinc-800 pb-2 ${
                    activeSection === section ? 'text-primary' : 'text-zinc-400'
                  }`}
                >
                  {section}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section 
        id="home"
        className="relative h-screen flex items-center justify-center pt-20 overflow-hidden"
      >
        <div className="absolute inset-0 z-0 bg-radial-[circle_at_30%_50%] from-primary/10 via-transparent to-transparent opacity-60" />
        <div className="absolute inset-0 z-0 bg-radial-[circle_at_70%_60%] from-secondary/10 via-transparent to-transparent opacity-40 animate-pulse" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-zinc-400 font-medium tracking-[0.3em] uppercase mb-6"
          >
            Elite Training for Champions
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-montserrat font-black text-6xl md:text-8xl lg:text-9xl tracking-tighter leading-[0.85] mb-10 bg-gradient-to-br from-white via-white to-primary bg-clip-text text-transparent"
          >
            UNLEASH YOUR PEAK POWER
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button 
              onClick={() => setIsMembershipModalOpen(true)}
              className="bg-primary hover:bg-secondary text-white font-black px-10 py-5 rounded-sm transition-all transform hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,69,0,0.5)] group uppercase tracking-widest flex items-center justify-center gap-2"
            >
              Join the Elite
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setIsTrialModalOpen(true)}
              className="border-2 border-white hover:bg-white hover:text-black text-white font-black px-10 py-5 rounded-sm transition-all transform hover:-translate-y-1 uppercase tracking-widest"
            >
              Claim Free Trial
            </button>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-montserrat font-black text-4xl md:text-5xl mb-8 leading-tight tracking-tight">
              WHY FORGE LEADS <span className="text-primary italic">AHMEDABAD</span>
            </h2>
            <div className="space-y-6 text-zinc-400 text-lg leading-relaxed font-light">
              <p>
                FORGE isn't just a gym—it's a transformation center. Founded in 2020, we've helped over 2,000+ members achieve their peak physical and mental potential in Ahmedabad.
              </p>
              <p>
                Our elite team of certified trainers and state-of-the-art equipment create an unparalleled environment for ambitious individuals ready to dominate their fitness goals.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square bg-zinc-900 border border-primary/20 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <Dumbbell className="w-32 h-32 text-primary mx-auto mb-6 animate-bounce" />
                <p className="font-montserrat font-black text-xl tracking-widest">AHMEDABAD'S #1</p>
                <p className="text-zinc-500">Premium Destination</p>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-primary p-8 rounded-xl shadow-2xl">
              <p className="text-4xl font-black">2000+</p>
              <p className="text-sm font-bold uppercase tracking-widest">Active Members</p>
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-primary/50 transition-all hover:-translate-y-1 group"
            >
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h4 className="font-montserrat font-bold text-xl mb-4 text-primary">{feature.title}</h4>
              <p className="text-zinc-400 leading-relaxed font-light">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trainers Section */}
      <section id="trainers" className="py-24 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-montserrat font-black text-4xl md:text-6xl mb-6 tracking-tight">MEET THE MASTERS</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto uppercase tracking-widest text-sm">Professional coaching for professional results</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TRAINERS.map((trainer, idx) => (
              <motion.div
                key={trainer.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-zinc-900 rounded-2xl p-8 border border-zinc-800 hover:border-primary transition-all text-center"
              >
                <div className="text-7xl mb-6 grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-110">
                  {trainer.emoji}
                </div>
                <h4 className="font-montserrat font-black text-xl mb-1 tracking-tight text-white">{trainer.name}</h4>
                <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-4">{trainer.role}</p>
                <div className="pt-4 border-t border-zinc-800">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Specialty</p>
                  <p className="text-zinc-300 text-sm">{trainer.specialty}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Classes Section */}
      <section id="classes" className="py-24 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-montserrat font-black text-4xl md:text-6xl mb-6 tracking-tight">ELITE SESSIONS</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {['all', 'hiit', 'strength', 'yoga'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setClassFilter(cat)}
                  className={`px-8 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
                    classFilter === cat 
                    ? 'bg-primary text-white shadow-[0_0_20px_rgba(255,69,0,0.4)]' 
                    : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <motion.div 
            layout
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredClasses.map((cls) => (
                <motion.div
                  key={cls.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-primary/40 transition-colors group"
                >
                  <div className="h-40 bg-gradient-to-br from-primary to-secondary flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                      <Zap className="w-full h-full rotate-12 scale-150" />
                    </div>
                    {cls.icon}
                  </div>
                  <div className="p-8">
                    <h4 className="font-montserrat font-black text-2xl mb-2">{cls.name}</h4>
                    <div className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full mb-6 italic">
                      {cls.level}
                    </div>
                    <div className="flex justify-between items-center text-zinc-500 text-sm mb-8 border-b border-zinc-800 pb-4">
                      <span className="flex items-center gap-2"><Clock size={16} /> {cls.time}</span>
                      <span className="flex items-center gap-2"><Users size={16} /> {cls.capacity} spots</span>
                    </div>
                    <button 
                      onClick={() => alert(`Booking confirmed for ${cls.name}!`)}
                      className="w-full py-4 bg-zinc-800 hover:bg-primary transition-colors font-black uppercase tracking-widest text-sm rounded-lg"
                    >
                      Book Session
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Memberships Section */}
      <section id="memberships" className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="font-montserrat font-black text-4xl md:text-6xl text-center mb-20 tracking-tight">TRANSFORM YOUR ACCESS</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {MEMBERSHIPS.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`relative p-10 rounded-2xl border-2 transition-all hover:-translate-y-2 ${
                plan.highlight 
                ? 'bg-zinc-900 border-primary shadow-[0_0_50px_rgba(255,69,0,0.15)] scale-105 z-10' 
                : 'bg-zinc-950 border-zinc-800'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary px-4 py-1.5 rounded-full text-xs font-black tracking-tighter uppercase">
                  Best Value
                </div>
              )}
              <h3 className="font-montserrat font-black text-2xl mb-6 tracking-widest">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-black text-primary">{plan.price}</span>
                <span className="text-zinc-500 text-sm">{plan.period}</span>
              </div>
              <ul className="mt-10 space-y-4 mb-10 min-h-[250px]">
                {plan.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3 text-zinc-400 text-sm">
                    <Check size={18} className="text-primary shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => setIsMembershipModalOpen(true)}
                className={`w-full py-4 rounded-lg font-black uppercase tracking-widest transition-all ${
                  plan.highlight 
                  ? 'bg-primary hover:bg-secondary text-white' 
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                Choose Plan
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-zinc-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-montserrat font-black text-4xl md:text-5xl mb-16 tracking-tight italic text-primary">REAL TRANSFORMATIONS</h2>
          <div className="relative min-h-[350px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-zinc-900/50 p-12 rounded-3xl border border-zinc-800 backdrop-blur-sm"
              >
                <div className="text-6xl mb-8 opacity-40">{TESTIMONIALS[currentTestimonial].avatar}</div>
                <p className="text-xl md:text-2xl font-light italic text-zinc-300 leading-relaxed mb-10">
                  "{TESTIMONIALS[currentTestimonial].text}"
                </p>
                <h4 className="font-montserrat font-black text-lg tracking-widest mb-1">{TESTIMONIALS[currentTestimonial].name}</h4>
                <p className="text-primary text-sm font-bold uppercase">{TESTIMONIALS[currentTestimonial].role}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex justify-center gap-3 mt-12">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                className={`w-12 h-1.5 rounded-full transition-all ${
                  idx === currentTestimonial ? 'bg-primary' : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="font-montserrat font-black text-4xl md:text-6xl text-center mb-20 tracking-tight">KNOW THE FORGE</h2>
        <div className="max-w-3xl mx-auto grid gap-6">
          {FAQS.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-zinc-900 border border-zinc-800 rounded-xl"
            >
              <h4 className="font-montserrat font-bold text-lg mb-4 text-primary flex gap-3">
                <span className="opacity-30">Q.</span> {faq.q}
              </h4>
              <p className="text-zinc-400 font-light leading-relaxed pl-8">
                {faq.a}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="font-montserrat font-black text-4xl md:text-6xl mb-20 tracking-tight">GET STARTED TODAY</h2>
        <div className="grid lg:grid-cols-2 gap-20">
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl pointer-events-none" />
            <h3 className="font-montserrat font-black text-2xl mb-8 tracking-tighter">BOOK A TRIAL SESSION</h3>
            <form 
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                setFormStatus('success');
                setTimeout(() => setFormStatus(null), 5000);
              }}
            >
              {formStatus === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-green-500/20 border border-green-500 rounded text-green-500 font-bold text-center"
                >
                  Champion Choice! We'll contact you in 24 hours.
                </motion.div>
              )}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Name</label>
                  <input required type="text" className="w-full bg-zinc-800 border-none rounded-lg focus:ring-2 focus:ring-primary p-4" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Phone</label>
                  <input required type="tel" className="w-full bg-zinc-800 border-none rounded-lg focus:ring-2 focus:ring-primary p-4" placeholder="+91 99999 99999" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Email</label>
                <input required type="email" className="w-full bg-zinc-800 border-none rounded-lg focus:ring-2 focus:ring-primary p-4" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Message</label>
                <textarea rows={4} className="w-full bg-zinc-800 border-none rounded-lg focus:ring-2 focus:ring-primary p-4" placeholder="Your fitness goals..." />
              </div>
              <button className="w-full py-5 bg-primary hover:bg-secondary transition-all font-black uppercase tracking-widest rounded-lg shadow-lg hover:shadow-primary/30">
                Submit Request
              </button>
            </form>
          </div>

          <div className="space-y-12">
            {[
              { title: "LOCATION", content: "SG Highway, Ahmedabad, Gujarat", icon: <MapPin className="text-primary w-8 h-8" /> },
              { title: "PHONE", content: "+91 98765 43210", icon: <Phone className="text-primary w-8 h-8" /> },
              { title: "EMAIL", content: "hello@forgegym.com", icon: <Mail className="text-primary w-8 h-8" /> },
              { title: "HOURS", content: "Mon-Fri: 6 AM - 10 PM | Sat-Sun: 7 AM - 8 PM", icon: <Clock className="text-primary w-8 h-8" /> },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 group">
                <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 group-hover:bg-primary transition-colors">
                  <div className="group-hover:text-white transition-colors">{item.icon}</div>
                </div>
                <div>
                  <h4 className="font-montserrat font-black text-zinc-500 text-xs tracking-widest mb-2">{item.title}</h4>
                  <p className="text-xl font-medium tracking-tight group-hover:text-primary transition-colors">{item.content}</p>
                </div>
              </div>
            ))}
            
            <div className="pt-10 flex gap-4">
              {[Instagram, Facebook, Youtube, Twitter].map((SocialIco, idx) => (
                <button key={idx} className="w-14 h-14 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1">
                  <SocialIco size={24} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-zinc-900 text-center text-zinc-600 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Zap className="text-zinc-800 w-8 h-8 fill-zinc-800" />
            <span className="font-montserrat font-black text-3xl tracking-tighter text-zinc-800">FORGE</span>
          </div>
          <p className="max-w-md mx-auto mb-10 text-sm leading-relaxed">
            Transform Your Body. Elevate Your Mind. Dominate Your Goals. Ahmedabad's most elite fitness destination.
          </p>
          <div className="flex justify-center gap-10 mb-10">
            <button className="hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">Privacy Policy</button>
            <button className="hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">Terms of Service</button>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">
            © 2024 FORGE PREMIUM FITNESS CENTER ALL RIGHTS RESERVED
          </p>
        </div>
      </footer>

      {/* Membership Modal */}
      <AnimatePresence>
        {isMembershipModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMembershipModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm shadow-2xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-primary rounded-3xl p-10 shadow-2xl"
            >
              <button 
                onClick={() => setIsMembershipModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white"
              >
                <X size={32} />
              </button>
              <h2 className="font-montserrat font-black text-3xl mb-4 tracking-tighter">SELECT YOUR PATH</h2>
              <p className="text-zinc-500 mb-8 leading-relaxed">Choose your membership tier and start your transformation today. Redirecting to payment portal...</p>
              <div className="space-y-4">
                {MEMBERSHIPS.map((plan, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      alert(`Proceeding to payment for ${plan.name} Plan at ${plan.price}`);
                      setIsMembershipModalOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-6 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-primary transition-all group"
                  >
                    <div className="text-left">
                      <p className="font-black tracking-widest mb-1">{plan.name}</p>
                      <p className="text-primary text-xl font-black">{plan.price}</p>
                    </div>
                    <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Trial Modal */}
      <AnimatePresence>
        {isTrialModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTrialModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-primary/40 rounded-3xl p-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl pointer-events-none" />
              <button 
                onClick={() => setIsTrialModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white"
              >
                <X size={32} />
              </button>
              <h2 className="font-montserrat font-black text-3xl mb-2 tracking-tighter">FREE ACCESS</h2>
              <p className="text-zinc-500 mb-8 font-light italic">Experience elite training for 24 hours.</p>
              
              <form 
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Free trial code sent to your phone! See you at the forge.');
                  setIsTrialModalOpen(false);
                }}
              >
                <input required type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none" placeholder="Full Name" />
                <input required type="email" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none" placeholder="Email Address" />
                <input required type="tel" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none" placeholder="WhatsApp Number" />
                <button className="w-full py-5 bg-primary hover:bg-secondary text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20">
                  Claim Your Pass
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Assistant Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAICoachOpen(true)}
        className="fixed bottom-8 right-8 z-[90] w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,69,0,0.5)] border-2 border-white/20"
      >
        <Zap className="text-white fill-white w-8 h-8" />
        <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] font-black px-2 py-1 rounded-full animate-bounce">
          AI COACH
        </span>
      </motion.button>

      {/* AI Coach Modal */}
      <AnimatePresence>
        {isAICoachOpen && (
          <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center md:px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAICoachOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-zinc-900 border-t md:border border-primary rounded-t-3xl md:rounded-3xl p-8 md:p-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="font-montserrat font-black text-2xl tracking-tighter flex items-center gap-2">
                    <Zap className="text-primary fill-primary" /> FORGE AI COACH
                  </h2>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Personalized Strategy Instantly</p>
                </div>
                <button onClick={() => setIsAICoachOpen(false)} className="text-zinc-500 hover:text-white">
                  <X size={32} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="min-h-[150px] bg-black/50 rounded-2xl p-6 border border-zinc-800 text-zinc-300 font-light leading-relaxed">
                  {aiLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap className="text-primary w-10 h-10" />
                      </motion.div>
                      <p className="text-xs font-black tracking-widest text-primary animate-pulse">ANALYZING BIOMETRICS...</p>
                    </div>
                  ) : aiMessage ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {aiMessage}
                    </motion.div>
                  ) : (
                    <div className="text-zinc-600 italic">
                      "I need a 4-day strength split" or "What should I eat before morning HIIT?"
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <input 
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && askAICoach()}
                    className="flex-1 bg-zinc-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none" 
                    placeholder="Ask your coach..." 
                  />
                  <button 
                    disabled={aiLoading}
                    onClick={askAICoach}
                    className="bg-primary hover:bg-secondary disabled:opacity-50 text-white font-black px-6 py-4 rounded-xl transition-all"
                  >
                    SEND
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
