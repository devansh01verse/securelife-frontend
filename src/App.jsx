import React, { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { Shield, Award, CheckCircle, ArrowRight, Phone, Mail, MapPin, MessageCircle, ChevronRight, Activity, Heart, Car, Trash2, Lock, Moon, Sun } from 'lucide-react';
import profileImg from './assets/profile.png';

export default function InsuranceWebsite() {
  // Navigation, Auth & Theme States
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home'); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
// Initialize theme based on system preference
// Always start in Light Mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Listen for real-time system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDarkMode(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Database States
  const [pendingReviews, setPendingReviews] = useState([]); 
  const [publicReviews, setPublicReviews] = useState([]);
  const [liveReviews, setLiveReviews] = useState([]); 

  // EmailJS States (Moved UP!)
  const form = useRef();
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Email Sending Function
  const sendEmail = (e) => {
    e.preventDefault(); // Stops the page from reloading
    setIsSending(true);

    // You must replace these strings with your actual EmailJS keys!
    emailjs.sendForm(
      'service_2gfphrw', 
      'template_69iydfa', 
      form.current, 
      '23KGxl7HQRPNF9NTS'
    )
    .then((result) => {
        console.log('Success!', result.text);
        setSendSuccess(true);
        setIsSending(false);
        form.current.reset(); // Clears the boxes
        
        // Hides the success message after 3 seconds
        setTimeout(() => setSendSuccess(false), 3000);
    }, (error) => {
        console.log('FAILED...', error.text);
        setIsSending(false);
        alert("Something went wrong. Please try again.");
    });
  }; 
  
  // Fetch real reviews from Spring Boot
  useEffect(() => {
    fetch('https://securelife-backend-5lmz.onrender.com/api/reviews')
      .then(response => response.json())
      .then(data => {
        const unapproved = data.filter(review => review.approved === false);
        const approved = data.filter(review => review.approved === true);
        
        setPendingReviews(unapproved);
        setLiveReviews(approved); 
        setPublicReviews(approved); 
      })
      .catch(error => console.error("Error:", error));
  }, [currentView]);

  // APPROVE a review
  const handleApprove = (id) => {
    const instaInput = document.getElementById(`insta-${id}`);
    const instaUrl = instaInput ? instaInput.value : "";

    fetch(`https://securelife-backend-5lmz.onrender.com/api/reviews/${id}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instagramUrl: instaUrl })
    })
    .then(() => {
      setPendingReviews(pendingReviews.filter(r => r.id !== id));
      alert("Review Approved!");
    })
    .catch(err => console.error("Error approving:", err));
  };

  // DELETE a review
  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to permanently delete this review?")) {
      fetch(`https://securelife-backend-5lmz.onrender.com/api/reviews/${id}`, {
        method: 'DELETE',
      })
      .then(() => {
        setPendingReviews(pendingReviews.filter(r => r.id !== id));
        setLiveReviews(liveReviews.filter(r => r.id !== id));
      })
      .catch(err => console.error("Error deleting:", err)) ;
    }
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- ADMIN LOGIN UI ---
  if (currentView === 'login') {
    const handleLogin = (e) => {
      e.preventDefault();
      if (e.target.password.value === 'admin123') { 
        setIsAuthenticated(true);
        setCurrentView('admin');
      } else {
        alert("Incorrect Password!");
      }
    };

    return (
      <div className={`min-h-screen font-sans p-8 flex items-center justify-center transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-900 text-slate-900'}`}>
        <div className={`max-w-md w-full p-10 rounded-3xl shadow-2xl relative transition-colors ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
          <button onClick={() => setCurrentView('home')} className="absolute top-6 right-6 text-slate-400 hover:text-sky-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'}`}>
            <Lock className="w-8 h-8" />
          </div>
          <h2 className={`text-3xl font-bold serif mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Admin Access</h2>
          <p className="text-slate-500 mb-8">Enter your credentials to manage reviews.</p>
          <form onSubmit={handleLogin} className="space-y-5">
            <input name="password" type="password" required className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-sky-500 outline-none transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'border-slate-200 bg-white'}`} placeholder="Password" />
            <button type="submit" className={`w-full font-medium py-4 rounded-xl transition-colors ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  // --- ADMIN DASHBOARD UI ---
  if (currentView === 'admin') {
    return (
      <div className={`min-h-screen font-sans p-8 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className={`text-3xl font-bold serif mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Admin Dashboard</h1>
              <p className="text-slate-500">Manage your pending and live client testimonials.</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-400 hover:text-sky-500 transition-colors rounded-full bg-slate-800/10">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => setCurrentView('home')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                Back to Website
              </button>
            </div>
          </div>

          {/* Pending Reviews Table */}
          <div className={`border rounded-2xl shadow-sm overflow-hidden mb-12 transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-sky-50/50'}`}>
              <h2 className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Pending Approvals ({pendingReviews.length})</h2>
            </div>
            <div className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {pendingReviews.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No pending reviews right now.</div>
              ) : (
                pendingReviews.map((review) => (
                  <div key={review.id} className={`p-6 flex flex-col md:flex-row gap-6 items-start justify-between transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'}`}>
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{review.name}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-md ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{review.role}</span>
                      </div>
                      <p className={`italic mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>"{review.text}"</p>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-sky-500" />
                        <input 
                          type="url" 
                          id={`insta-${review.id}`}
                          placeholder="Add video link if any..."
                          className={`w-full max-w-sm px-0 py-1 text-sm bg-transparent border-b outline-none transition-colors focus:border-sky-500 ${isDarkMode ? 'border-slate-700 text-white placeholder-slate-600' : 'border-slate-200 text-slate-900'}`}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                      <button onClick={() => handleDelete(review.id)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${isDarkMode ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20' : 'text-red-600 bg-red-50 hover:bg-red-100'}`}>
                        <Trash2 className="w-4 h-4"/> Reject
                      </button>
                      <button onClick={() => handleApprove(review.id)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                        Approve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live Reviews Table */}
          <div className={`border rounded-2xl shadow-sm overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
              <h2 className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Live Website Reviews ({liveReviews.length})</h2>
            </div>
            <div className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {liveReviews.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No live reviews on the website yet.</div>
              ) : (
                liveReviews.map((review) => (
                  <div key={review.id} className={`p-6 flex flex-col md:flex-row gap-6 items-center justify-between transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{review.name}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-md ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{review.role}</span>
                        {review.instagramUrl && <span className="text-xs font-bold text-sky-500 uppercase tracking-wider">Has Video</span>}
                      </div>
                      <p className={`text-sm italic line-clamp-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>"{review.text}"</p>
                    </div>
                    <button onClick={() => handleDelete(review.id)} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Review">
                      <Trash2 className="w-5 h-5"/>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- SUBMIT FEEDBACK UI ---
  if (currentView === 'feedback') {
    const handleReviewSubmit = (e) => {
      e.preventDefault();
      const newReview = {
        name: e.target.name.value,
        role: e.target.role.value,
        text: e.target.text.value,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      fetch('https://securelife-backend-5lmz.onrender.com/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      })
      .then(() => {
        alert("Thank you! Your review has been submitted for approval.");
        setCurrentView('home');
      })
      .catch(err => console.error("Error submitting:", err));
    };

    return (
      <div className={`min-h-screen font-sans p-8 flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
        <div className={`max-w-xl w-full p-10 rounded-3xl shadow-xl relative border transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <button onClick={() => setCurrentView('home')} className="absolute top-6 right-6 text-slate-400 hover:text-sky-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <h2 className={`text-3xl font-bold serif mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Share Your Experience</h2>
          <p className="text-slate-500 mb-8">Your feedback helps me improve and helps others secure their future.</p>
          <form ref={form} onSubmit={sendEmail} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
              <input name="name" type="text" required className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-sky-500 outline-none transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`} placeholder="e.g. Sneha Rao" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Professional Role / Occupation</label>
              <input name="role" type="text" required className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-sky-500 outline-none transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`} placeholder="e.g. Business Owner" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Your Review</label>
              <textarea name="text" required rows="4" className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-sky-500 outline-none resize-none transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`} placeholder="How did the consultation help you?"></textarea>
            </div>
            <button type="submit" className={`w-full font-medium py-4 rounded-xl transition-colors mt-4 ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
              Submit Review
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN WEBSITE WITH THEME WRAPPER ---
  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-500 ${isDarkMode ? 'dark bg-slate-950 text-slate-200' : 'bg-white text-slate-800'}`}>
      
      {/* INJECTED USER CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        
        :root { --grid-color: rgba(14, 165, 233, 0.05); }
        .dark { --grid-color: rgba(14, 165, 233, 0.1); }
        
        body { font-family: 'Inter', sans-serif; background-color: ${isDarkMode ? '#020617' : '#ffffff'}; background-image: linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px); background-size: 40px 40px; transition: background-color 0.5s ease; }
        .serif { font-family: 'Playfair Display', serif; }
        .hero-text { line-height: 1.1; letter-spacing: -0.02em; }
        
        /* Glassmorphism updates based on theme */
        .ai-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(14, 165, 233, 0.1); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05); transition: all 0.3s ease; }
        .dark .ai-card { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(14, 165, 233, 0.15); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5); }
        
        .ai-card:hover { transform: translateY(-4px); }
        .dark .ai-card:hover { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(14, 165, 233, 0.3); box-shadow: 0 20px 40px -10px rgba(14, 165, 233, 0.2); }
        
        .badge-shadow { box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); }
        .dark .badge-shadow { box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); }
        
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* NAVIGATION */}
      <div className="fixed top-6 left-0 right-0 z-50 flex flex-col items-center px-4 pointer-events-none">
        <nav className={`pointer-events-auto w-full max-w-5xl flex items-center justify-between gap-4 md:gap-8 px-2 py-2 backdrop-blur-xl border shadow-lg rounded-full transition-all duration-300 ${isDarkMode ? 'bg-slate-900/80 border-slate-800 shadow-black/50' : 'bg-white/80 border-slate-200 shadow-slate-200/50'}`}>
          <div className="flex items-center gap-3 pl-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold serif text-sm ${isDarkMode ? 'bg-white text-slate-900 shadow-white/20' : 'bg-slate-900 text-white shadow-slate-900/20'}`}>SL</div>
            <span className={`font-semibold hidden sm:block pr-4 md:pr-6 border-r text-sm ${isDarkMode ? 'text-white border-slate-700' : 'text-slate-900 border-slate-200'}`}>SecureLife</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 px-2">
            <a href="#about" className={`font-medium text-sm transition-colors ${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>About</a>
            <a href="#services" className={`font-medium text-sm transition-colors ${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Services</a>
            <a href="#testimonials" className={`font-medium text-sm transition-colors ${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Results</a>
          </div>
          <div className="flex items-center gap-2 pr-1 md:pr-0">
            
            {/* THEME TOGGLE BUTTON */}
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition-colors mr-2 ${isDarkMode ? 'text-slate-300 bg-slate-800 hover:bg-slate-700' : 'text-slate-500 bg-slate-100 hover:bg-slate-200'}`}>
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <a href="#contact" className={`hidden sm:flex px-5 py-2.5 rounded-full font-medium text-sm transition-all items-center gap-2 badge-shadow ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
              Book Call <ArrowRight className="w-4 h-4" />
            </a>
            <button className={`md:hidden p-2 rounded-full ${isDarkMode ? 'text-white bg-slate-800' : 'text-slate-800 bg-slate-100'}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </nav>
        {isMobileMenuOpen && (
          <div className={`pointer-events-auto mt-4 w-full max-w-sm rounded-3xl shadow-xl border p-5 flex flex-col gap-4 md:hidden ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-slate-100'}`}>
             <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium p-3 rounded-xl ${isDarkMode ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}>About</a>
             <a href="#services" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium p-3 rounded-xl ${isDarkMode ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}>Services</a>
             <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className={`font-medium p-3 rounded-xl ${isDarkMode ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}>Results</a>
             <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className={`text-center font-medium p-4 rounded-xl mt-2 ${isDarkMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>Book a Consultation</a>
          </div>
        )}
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border badge-shadow mb-8 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]"></span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dheeraj Mittal •Insurance & Wealth Advisor</span>
            </div>
            <h1 className={`text-5xl md:text-7xl lg:text-[5rem] font-bold mb-6 serif hero-text transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              The advisor families call when the <span className="italic text-sky-500 font-light drop-shadow-md">stakes are high.</span>
            </h1>
            <p className={`text-xl mb-10 max-w-2xl font-light ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              I help individuals and business owners clarify priorities, align assets, and convert strategy into measurable financial security.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <a href="#contact" className={`w-full sm:w-auto px-8 py-4 rounded-full font-medium text-lg transition-all badge-shadow ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>Start a Consultation</a>
              <a href="#services" className={`w-full sm:w-auto px-8 py-4 rounded-full font-medium text-lg transition-all badge-shadow border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'}`}>Learn More</a>
            </div>
          </div>
          <div className="relative max-w-sm md:max-w-md mx-auto mt-20">
            <img 
              src={profileImg} 
              alt="Dheeraj Mittal - Strategic Advisor" 
              className="rounded-[2.5rem] w-full object-cover aspect-[3/4] shadow-2xl relative z-10"
            />
            <div className="absolute top-1/4 -left-8 md:-left-20 ai-card badge-shadow p-3 md:p-4 rounded-2xl flex items-center gap-4 z-20">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold serif text-lg badge-shadow ${isDarkMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>25</div>
              <div className="text-left hidden sm:block">
                <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">Years Exp.</p>
                <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Trusted Advisor</p>
              </div>
            </div>
            <div className="absolute bottom-16 -right-8 md:-right-20 ai-card badge-shadow p-3 md:p-4 rounded-2xl flex items-center gap-4 z-20">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">Settlement</p>
                <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>100% Claim Rate</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
            {/* The glowing orb behind the image */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full filter blur-3xl opacity-40 z-0 ${isDarkMode ? 'bg-sky-600 mix-blend-screen' : 'bg-sky-200 mix-blend-multiply'}`}></div>
          </div>
        </div>
      </section>
{/* PARTNERS / TRUSTED BY SECTION */}
      <section className={`py-10 border-t transition-colors ${isDarkMode ? 'bg-slate-900/20 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className={`text-center text-xs font-bold uppercase tracking-widest mb-8 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Authorized Partner For India's Leading Providers
          </p>
          
          {/* Logo Container (Fixed Overflow Clipping) */}
          <div className="flex overflow-x-auto snap-x snap-mandatory items-center justify-start gap-10 md:gap-16 lg:gap-20 pb-4 pt-2 px-6 md:px-12 hide-scrollbar w-full 2xl:justify-center">
            
            {/* 1. HDFC Ergo */}
            <a href="https://www.hdfcergo.com/" target="_blank" rel="noreferrer" className="shrink-0 snap-start block">
              <img 
                src="/assets/hdfc.png" 
                alt="HDFC Ergo" 
                className={`h-10 md:h-12 w-auto max-w-none object-contain transition-all duration-300 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 ${isDarkMode ? 'invert' : ''}`}
              />
            </a>
            
            {/* 2. LIC of India */}
            <a href="https://licindia.in/" target="_blank" rel="noreferrer" className="shrink-0 snap-start block">
              <img 
                src="./assets/lic.jpg" 
                alt="LIC of India" 
                className={`h-14 md:h-16 w-auto max-w-none object-contain transition-all duration-300 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 ${isDarkMode ? 'invert' : ''}`}
              />
            </a>
            
            {/* 3. Care Health Insurance */}
            <a href="https://www.careinsurance.com/" target="_blank" rel="noreferrer" className="shrink-0 snap-start block">
              <img 
                src="./assets/care.png" 
                alt="Care Health Insurance" 
                className={`h-8 md:h-10 w-auto max-w-none object-contain transition-all duration-300 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 ${isDarkMode ? 'invert' : ''}`}
              />
            </a>
            
            {/* 4. Star Health */}
            <a href="https://www.starhealth.in/" target="_blank" rel="noreferrer" className="shrink-0 snap-start block">
              <img 
                src="./assets/star.png" 
                alt="Star Health" 
                className={`h-14 md:h-16 w-auto max-w-none object-contain transition-all duration-300 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 ${isDarkMode ? 'invert' : ''}`}
              />
            </a>
            
            {/* 5. ICICI Prudential */}
            <a href="https://www.icicilombard.com/" target="_blank" rel="noreferrer" className="shrink-0 snap-start block">
              <img 
                src="./assets/icici.png" 
                alt="ICICI Prudential" 
                className={`h-12 md:h-14 w-auto max-w-none object-contain transition-all duration-300 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 ${isDarkMode ? 'invert' : ''}`}
              />
            </a>

            {/* 6. NJ Wealth */}
            <a href="https://www.njindiaonline.in/" target="_blank" rel="noreferrer" className="shrink-0 snap-start block">
              <img 
                src="./assets/nj.jpg" 
                alt="NJ Wealth" 
                className={`h-12 md:h-14 w-auto max-w-none object-contain transition-all duration-300 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 ${isDarkMode ? 'invert' : ''}`}
              />
            </a>

            {/* 7. Oriental Insurance */}
            <a href="https://www.orientalinsurance.org.in/" target="_blank" rel="noreferrer" className="shrink-0 snap-start block">
              <img 
                src="./assets/ori.webp" 
                alt="Oriental Insurance"
                className={`h-10 md:h-12 w-auto max-w-none object-contain transition-all duration-300 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 ${isDarkMode ? 'invert' : ''}`}
              />
            </a>
            
            {/* 8. Manipal Cigna */}
            <a href="https://www.manipalcigna.com/" target="_blank" rel="noreferrer" className="shrink-0 snap-start block">
              <img 
                src="./assets/manipal.png" 
                alt="Manipal Cigna" 
                className={`h-12 md:h-16 w-auto max-w-none object-contain transition-all duration-300 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 ${isDarkMode ? 'invert' : ''}`}
              />
            </a>

          </div>
        </div>
      </section>
      {/* STATS SECTION */}
      <section id="claims" className={`py-16 border-y backdrop-blur-sm transition-colors ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white/50 border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 divide-x ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
            <div className="text-center px-4">
              <h3 className={`text-4xl font-bold mb-2 serif ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>₹50Cr+</h3>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Claims Settled</p>
            </div>
            <div className="text-center px-4">
              <h3 className={`text-4xl font-bold mb-2 serif ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>1,200+</h3>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Happy Families</p>
            </div>
            <div className="text-center px-4">
              <h3 className={`text-4xl font-bold mb-2 serif ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>25+</h3>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Years Experience</p>
            </div>
            <div className="text-center px-4">
              <h3 className="text-4xl font-bold text-sky-500 mb-2 serif">100%</h3>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Support Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <div className="relative">
                <div className={`absolute inset-0 rounded-3xl translate-x-4 translate-y-4 -z-10 ${isDarkMode ? 'bg-sky-900/30' : 'bg-sky-100'}`}></div>
                <img 
                  src={profileImg} 
                  alt="Dheeraj Mittal - Strategic Advisor" 
                  className="rounded-3xl w-full object-cover aspect-[4/5] badge-shadow"
                />
                <div className="absolute -bottom-6 -left-6 ai-card p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-sky-500/20 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-sky-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Certified By</p>
                    <p className={`font-bold serif ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>IRDAI India</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2">
              <h2 className="text-sm font-bold text-sky-500 uppercase tracking-wider mb-2">Meet Dheeraj Mittal</h2>
              <h3 className={`text-3xl md:text-4xl font-bold mb-6 serif transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>A trusted partner in your financial journey.</h3>
              <p className={`mb-6 text-lg leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                With over a decade of specialized experience in the Indian insurance sector, I've helped thousands of families navigate the complexities of life and health coverage. 
              </p>
              <p className={`mb-8 text-lg leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                My approach is simple: absolute transparency, unbiased advice, and standing by your side exactly when you need it most—during claim settlements.
              </p>
              <ul className="space-y-4">
                {[
                  "Personalized risk assessment for every client",
                  "Direct assistance with all documentation",
                  "Dedicated support during hospitalizations/claims",
                  "Annual portfolio reviews and upgrades"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                    <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      
      {/* SERVICES SECTION */}
      <section id="services" className={`py-24 transition-colors ${isDarkMode ? 'bg-slate-900/30' : 'bg-slate-50/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-sky-500 uppercase tracking-wider mb-2">Expert Services</h2>
            <h3 className={`text-3xl md:text-4xl font-bold mb-4 serif ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Comprehensive Protection Plans</h3>
            <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Select the right coverage designed for your unique needs. No jargon, just clear protection.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="ai-card p-8 rounded-3xl">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <Heart className="w-7 h-7" />
              </div>
              <h4 className={`text-xl font-bold mb-3 serif ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Health Insurance</h4>
              <p className={`mb-6 line-clamp-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Comprehensive medical coverage that protects your savings against rising healthcare costs, including cashless treatments.</p>
              <a href="#contact" className="text-sky-500 font-medium flex items-center gap-1 hover:gap-2 transition-all">Learn more <ChevronRight className="w-4 h-4" /></a>
            </div>
            <div className="ai-card p-8 rounded-3xl">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                <Shield className="w-7 h-7" />
              </div>
              <h4 className={`text-xl font-bold mb-3 serif ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Term Life Insurance</h4>
              <p className={`mb-6 line-clamp-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>High-cover, low-premium life insurance ensuring your family's financial independence and lifestyle security in your absence.</p>
              <a href="#contact" className="text-sky-500 font-medium flex items-center gap-1 hover:gap-2 transition-all">Learn more <ChevronRight className="w-4 h-4" /></a>
            </div>
            <div className="ai-card p-8 rounded-3xl">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${isDarkMode ? 'bg-sky-500/10 text-sky-400' : 'bg-sky-50 text-sky-600'}`}>
                <Car className="w-7 h-7" />
              </div>
              <h4 className={`text-xl font-bold mb-3 serif ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Motor Insurance</h4>
              <p className={`mb-6 line-clamp-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Reliable coverage for your vehicles against accidents, theft, and third-party liabilities with quick claim processing.</p>
              <a href="#contact" className="text-sky-500 font-medium flex items-center gap-1 hover:gap-2 transition-all">Learn more <ChevronRight className="w-4 h-4" /></a>
            </div>
            <div className={`col-span-1 md:col-span-2 lg:col-span-3 border-2 border-dashed rounded-3xl p-8 text-center bg-transparent mt-4 flex flex-col items-center justify-center min-h-[160px] transition-colors ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
               <Activity className={`w-8 h-8 mb-3 ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`} />
               <p className={`font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Investment & Mutual Fund Advisory Services Coming Soon</p>
            </div>
          </div>
        </div>
      </section>
      {/* TESTIMONIALS SECTION (UNIFIED HORIZONTAL SCROLL) */}
      <section id="testimonials" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
               <h2 className="text-sm font-bold text-sky-500 uppercase tracking-wider mb-2">Client Feedback</h2>
               <h3 className={`text-3xl md:text-4xl font-bold mb-4 serif ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Trusted by Families Nationwide</h3>
            </div>
            <button 
              onClick={() => setCurrentView('feedback')}
              className={`px-6 py-3 rounded-full font-medium text-sm transition-all badge-shadow flex items-center gap-2 whitespace-nowrap border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'}`}
            >
              <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              Write a Review
            </button>
          </div>
          
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 hide-scrollbar">
            {publicReviews.length === 0 ? (
              <div className="w-full text-center py-10 text-slate-500">
                No reviews yet. Be the first to share your experience!
              </div>
            ) : (
              publicReviews.map((testimonial, idx) => (
                <div key={idx} className="snap-center shrink-0 w-[85vw] md:w-[400px] ai-card p-8 rounded-3xl relative flex flex-col justify-between h-full min-h-[250px]">
                  <div>
                    <div className="text-sky-500/50 mb-4">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                    </div>
                    <p className={`mb-8 relative z-10 italic whitespace-normal ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>"{testimonial.text}"</p>
                  </div>
                  
                  <div className={`mt-auto pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br rounded-full flex items-center justify-center text-white font-bold serif text-sm badge-shadow shrink-0 ${isDarkMode ? 'from-slate-700 to-slate-800' : 'from-slate-800 to-slate-900'}`}>
                          {testimonial.name ? testimonial.name.charAt(0) : '?'}
                        </div>
                        <div>
                          <h5 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{testimonial.name}</h5>
                          <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{testimonial.role}</p>
                        </div>
                      </div>
                      {testimonial.instagramUrl && (
                        <a 
                          href={testimonial.instagramUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-all shadow-md shrink-0 ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          Watch
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className={`py-24 relative overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-950 border-t border-slate-900' : 'bg-slate-900'}`}>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-sky-500/10 blur-3xl rounded-full transform translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-sm font-bold text-sky-400 uppercase tracking-wider mb-2">Get In Touch</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-white mb-6 serif hero-text">Ready to secure your future?</h3>
              <p className="text-slate-400 mb-10 text-lg">Drop a message to schedule a free 30-minute consultation. We'll assess your current portfolio and identify coverage gaps.</p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/5">
                    <Phone className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Call Directly</p>
                    <p className="font-medium text-lg text-slate-200">+91 9873089369</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/5">
                    <Mail className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Email Address</p>
                    <p className="font-medium text-lg text-slate-200">mittaldheeraj75@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/5">
                    <MapPin className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Office Location</p>

                    <p className="font-medium text-lg text-slate-200">112-A Shivam Tower Rdc Rajnagar, Ghaziabad</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`p-8 rounded-3xl badge-shadow relative border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-transparent text-slate-900'}`}>
            <form ref={form} onSubmit={sendEmail} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>First Name</label>
                    <input name="first_name" type="text" required className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-sky-500 outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'}`} placeholder="John" />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Last Name</label>
                    <input name="last_name" type="text" required className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-sky-500 outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'}`} placeholder="Doe" />
                  </div>
                </div>

                {/* --- NEW EMAIL FIELD --- */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Email Address</label>
                  <input name="email" type="email" required className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-sky-500 outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'}`} placeholder="john@example.com" />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Phone Number</label>
                  <input name="phone_number" type="tel" required className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-sky-500 outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'}`} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Insurance Interest</label>
                  <select name="insurance_interest" className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-sky-500 outline-none transition-all appearance-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'}`}>
                    <option value="Health Insurance">Health Insurance</option>
                    <option value="Term Life Insurance">Term Life Insurance</option>
                    <option value="Motor Insurance">Motor Insurance</option>
                    <option value="Portfolio Review">Portfolio Review</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {/* Query / Message Box */}
                <div className="flex flex-col gap-2 mt-4">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Your Query
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    placeholder="How can I help you achieve your financial goals?"
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-sky-500 outline-none resize-none transition-all ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' 
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={isSending}
                  className={`w-full font-medium py-4 rounded-xl transition-colors flex justify-center items-center gap-2 badge-shadow ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'} ${isSending ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSending ? 'Sending...' : 'Send Request'} <ArrowRight className="w-4 h-4" />
                </button>
                {sendSuccess && (
                  <p className="text-green-500 font-medium text-center mt-2">Message sent successfully!</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`pt-12 pb-28 md:pb-12 border-t transition-colors ${isDarkMode ? 'bg-[#010409] border-slate-900 text-slate-500' : 'bg-slate-950 border-white/10 text-slate-400'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-sky-500" />
            <span className="text-xl font-bold text-white serif">SecureLife<span className="text-sky-500">.</span></span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">IRDAI Guidelines</a>
          </div>
          <div className="text-sm flex flex-col sm:flex-row items-center gap-3">
            <button 
              onClick={() => setCurrentView(isAuthenticated ? 'admin' : 'login')} 
              className="opacity-40 hover:opacity-100 transition-opacity p-2 flex items-center gap-1"
            >
              <Lock className="w-3 h-3" /> Admin Portal
            </button>
            <span className="text-center">© {new Date().getFullYear()} SecureLife Consulting.</span>
          </div>
        </div>
      </footer>

      {/* FLOATING WHATSAPP BUTTON */}
      <a 
        href="https://wa.me/9873089369" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-110 hover:shadow-green-500/50 transition-all z-50 group"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
        <span className={`absolute right-16 text-xs font-medium px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none badge-shadow ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white'}`}>
          Need Help? Chat with us!
        </span>
      </a>
    </div>
  );
}
