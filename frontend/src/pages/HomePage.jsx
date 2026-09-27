import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  FileText, 
  Globe, 
  Bookmark, 
  Clock, 
  MapPin, 
  Award, 
  CheckCircle2, 
  GraduationCap, 
  Printer, 
  ShieldCheck, 
  Wifi, 
  Repeat, 
  Download, 
  ExternalLink, 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  Info, 
  Layers,
  Calendar,
  Building2,
  Users
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [activeSearchTab, setActiveSearchTab] = useState('opac'); // 'opac' | 'repository' | 'ebooks' | 'pastpapers'
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (activeSearchTab === 'opac') {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery)}`);
    } else if (activeSearchTab === 'repository') {
      navigate(`/repository?q=${encodeURIComponent(searchQuery)}`);
    } else if (activeSearchTab === 'ebooks') {
      navigate(`/ebooks?q=${encodeURIComponent(searchQuery)}`);
    } else if (activeSearchTab === 'pastpapers') {
      navigate(`/publications?q=${encodeURIComponent(searchQuery)}#past-papers`);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. TOP ANNOUNCEMENT TICKER (Inspired by lib.cmb.ac.lk & vau.ac.lk) */}
      <div className="bg-[#fff9e6] border-b border-[#ffcb00] text-xs py-2.5 px-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[#670047]">
          <div className="flex items-center space-x-2">
            <span className="bg-[#670047] text-[#ffcb00] text-[10px] font-black uppercase px-2 py-0.5 rounded">
              Notice
            </span>
            <span className="font-semibold text-xs truncate max-w-2xl">
              Physical checkouts require your Student/Staff Digital QR Card. Main Library open Monday to Friday 8:00 AM – 8:00 PM.
            </span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] font-bold shrink-0">
            <Link to="/about" className="hover:underline flex items-center space-x-1">
              <span>Opening Hours & Rules</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION WITH MULTI-TAB DISCOVERY SEARCH (Colombo & Vavuniya Model) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#670047] via-[#4b0150] to-[#121e36] text-white p-6 sm:p-10 md:p-14 shadow-2xl">
          {/* Subtle Decorative Crest Watermark */}
          <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none select-none">
            <img 
              src="/uov_logo.png" 
              alt="" 
              className="w-80 md:w-96 h-auto" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 bg-[#ffcb00]/20 border border-[#ffcb00]/40 text-[#ffcb00] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>University of Vavuniya • Gateway to Knowledge</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
              Discover Library Holdings, E-Resources & Research
            </h1>

            <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl font-normal">
              Access physical books across Pambaimadu Campus, digital textbooks, faculty research publications, past examination papers, and international databases.
            </p>

            {/* Federated Multi-Tab Search Box */}
            <div className="pt-4">
              {/* Tabs selector */}
              <div className="flex flex-wrap gap-1 bg-black/30 p-1.5 rounded-2xl w-max max-w-full backdrop-blur-md border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveSearchTab('opac')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    activeSearchTab === 'opac'
                      ? 'bg-[#ffcb00] text-[#4b0150] shadow-md'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Books (OPAC)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSearchTab('repository')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    activeSearchTab === 'repository'
                      ? 'bg-[#ffcb00] text-[#4b0150] shadow-md'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Institutional Repository</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSearchTab('ebooks')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    activeSearchTab === 'ebooks'
                      ? 'bg-[#ffcb00] text-[#4b0150] shadow-md'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>E-Books & Open Access</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSearchTab('pastpapers')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    activeSearchTab === 'pastpapers'
                      ? 'bg-[#ffcb00] text-[#4b0150] shadow-md'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Past Papers</span>
                </button>
              </div>

              {/* Search input and submit */}
              <form onSubmit={handleSearchSubmit} className="mt-3 flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      activeSearchTab === 'opac'
                        ? 'Search physical books by Title, Author, ISBN, or Call No...'
                        : activeSearchTab === 'repository'
                        ? 'Search faculty publications, theses, pre-prints, and journals...'
                        : activeSearchTab === 'ebooks'
                        ? 'Search digital textbooks, DOAB e-books, and open monographs...'
                        : 'Search past examination papers by Course Code (e.g. CSC3113)...'
                    }
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#ffcb00]/50 shadow-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#ffcb00] hover:bg-[#e5b600] text-[#4b0150] font-black px-7 py-3.5 rounded-2xl transition shadow-lg flex items-center justify-center space-x-2 text-sm shrink-0"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Discovery Sub-links */}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-200">
                <span className="text-slate-300 font-semibold">Quick Access:</span>
                <Link to="/catalog?available=true" className="hover:text-[#ffcb00] underline underline-offset-2">Available Stacks</Link>
                <span>•</span>
                <Link to="/catalog?category=1" className="hover:text-[#ffcb00] underline underline-offset-2">Computer Science</Link>
                <span>•</span>
                <Link to="/ebooks" className="hover:text-[#ffcb00] underline underline-offset-2">DOAB E-Books</Link>
                <span>•</span>
                <Link to="/about" className="hover:text-[#ffcb00] underline underline-offset-2">Vanni Special Collection</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. QUICK SERVICES TILES (Matching lib.cmb.ac.lk & vau.ac.lk) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Essential Library Services & Portals
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Direct access to university circulation, research assistance, and digital scholarly holdings
            </p>
          </div>
          <Link to="/services" className="text-xs font-bold text-[#670047] hover:underline flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Explore All Library Services</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Card 1: OPAC */}
          <Link
            to="/catalog"
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-[#670047] shadow-xs hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#670047]/10 text-[#670047] flex items-center justify-center mb-3 group-hover:bg-[#670047] group-hover:text-white transition shadow-2xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 group-hover:text-[#670047] transition">
                Find Books (OPAC)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Live catalog search for physical stacks, call numbers, and shelf locations.
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#670047] mt-4 flex items-center space-x-1">
              <span>Search Catalog</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </span>
          </Link>

          {/* Card 2: E-Books & Open Access */}
          <Link
            to="/ebooks"
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-[#670047] shadow-xs hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#ffcb00]/20 text-[#670047] flex items-center justify-center mb-3 group-hover:bg-[#ffcb00] transition shadow-2xs">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 group-hover:text-[#670047] transition">
                E-Books & Open Access
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Download verified academic e-textbooks, open monographs, and DOAB titles.
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#670047] mt-4 flex items-center space-x-1">
              <span>Read E-Books</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </span>
          </Link>

          {/* Card 3: Institutional Repository */}
          <Link
            to="/repository"
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-[#670047] shadow-xs hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#1b3058]/10 text-[#1b3058] flex items-center justify-center mb-3 group-hover:bg-[#1b3058] group-hover:text-white transition shadow-2xs">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 group-hover:text-[#670047] transition">
                Institutional Repository
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Vavuniya faculty research papers, student dissertations, and conference pre-prints.
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#1b3058] mt-4 flex items-center space-x-1">
              <span>Explore Research</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </span>
          </Link>

          {/* Card 4: Past Papers & Publications */}
          <Link
            to="/publications"
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-[#670047] shadow-xs hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition shadow-2xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 group-hover:text-[#670047] transition">
                Publications & Past Papers
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Semester examination papers, university journals (VJBS & JST), and conference archives.
              </p>
            </div>
            <span className="text-[11px] font-bold text-amber-700 mt-4 flex items-center space-x-1">
              <span>View Archives</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </span>
          </Link>

          {/* Card 5: Turnitin Plagiarism Check */}
          <Link
            to="/services#turnitin"
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-[#670047] shadow-xs hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 group-hover:text-[#670047] transition">
                Similarity Checking (Turnitin)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Plagiarism checking for final year dissertations and faculty publications.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 mt-4 flex items-center space-x-1">
              <span>Service Details</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </span>
          </Link>

          {/* Card 6: Circulation Desk & Borrowing */}
          <Link
            to="/services#borrowing"
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-[#670047] shadow-xs hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mb-3 group-hover:bg-rose-600 group-hover:text-white transition shadow-2xs">
                <Repeat className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 group-hover:text-[#670047] transition">
                Circulation & Loan Rules
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Undergraduate & academic loan limits, 2x renewals, and return guidelines.
              </p>
            </div>
            <span className="text-[11px] font-bold text-rose-700 mt-4 flex items-center space-x-1">
              <span>View Borrowing Rules</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </span>
          </Link>

          {/* Card 7: ISBN / ISSN Registration */}
          <Link
            to="/services#isbn"
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-[#670047] shadow-xs hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition shadow-2xs">
                <Bookmark className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 group-hover:text-[#670047] transition">
                Apply for ISBN / ISSN
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Assistance with National Library of Sri Lanka book and serial numbering.
              </p>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 mt-4 flex items-center space-x-1">
              <span>ISBN Application</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </span>
          </Link>

          {/* Card 8: Inter-Library Loan */}
          <Link
            to="/services#ill"
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-[#670047] shadow-xs hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-800 flex items-center justify-center mb-3 group-hover:bg-cyan-700 group-hover:text-white transition shadow-2xs">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 group-hover:text-[#670047] transition">
                Inter-Library Loan (ILL)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Obtain books and research journal articles from other Sri Lankan universities.
              </p>
            </div>
            <span className="text-[11px] font-bold text-cyan-800 mt-4 flex items-center space-x-1">
              <span>Request Material</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </span>
          </Link>

        </div>
      </section>

      {/* 4. ABOUT UNIVERSITY OF VAVUNIYA LIBRARY (VISION & MISSION SPOTLIGHT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-[#1b3058] rounded-3xl text-white p-8 sm:p-10 shadow-xl overflow-hidden relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#ffcb00] bg-white/10 px-3 py-1 rounded-full border border-white/15">
                About The Main Library
              </span>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                Fostering Academic Excellence at University of Vavuniya
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                The Library of the University of Vavuniya, situated at the serene Pambaimadu Campus, stands as the central intellectual repository supporting the Faculty of Applied Science, Faculty of Business Studies, and Faculty of Technological Studies.
              </p>

              {/* Vision & Mission Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-xs">
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#ffcb00]">Our Vision</div>
                  <p className="text-xs text-slate-200 mt-1.5 italic leading-relaxed">
                    “To be a leading centre for knowledge access, advancement, and dissemination that supports academic excellence, innovative research, and sustainable development.”
                  </p>
                </div>

                <div className="bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-xs">
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#ffcb00]">Our Mission</div>
                  <p className="text-xs text-slate-200 mt-1.5 italic leading-relaxed">
                    “To contribute to excellence in education, innovative research, and collaboration by providing quality information resources, promoting information literacy, and supporting knowledge creation.”
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/about"
                  className="bg-[#ffcb00] hover:bg-[#e5b600] text-[#4b0150] px-5 py-2.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition shadow"
                >
                  <span>Read Complete History & Guidelines</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  to="/services"
                  className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition border border-white/20"
                >
                  View Library Facilities
                </Link>
              </div>
            </div>

            {/* Right Column: Impact Highlights */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/15 text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#ffcb00]">25,000+</div>
                <div className="text-[11px] font-bold text-slate-200 mt-1">Printed Books & Volumes</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Stack & Reference Sections</div>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/15 text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#ffcb00]">5,000+</div>
                <div className="text-[11px] font-bold text-slate-200 mt-1">Theses & Faculty Papers</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Institutional Repository</div>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/15 text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#ffcb00]">100K+</div>
                <div className="text-[11px] font-bold text-slate-200 mt-1">E-Books & Open Journals</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Global Academic Databases</div>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/15 text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#ffcb00]">3,500+</div>
                <div className="text-[11px] font-bold text-slate-200 mt-1">Undergraduates & Staff</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Active Patron Accounts</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. SPECIAL COLLECTIONS & RESEARCH STACKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Featured Special Collections
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Rare historical documents, indigenous heritage, and high-demand academic reference
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Collection 1: Vanni Heritage Collection */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-[#670047] transition flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase text-[#670047] bg-[#fff0f7] px-2.5 py-0.5 rounded-full border border-[#ffb3d9]">
                  Heritage Collection
                </span>
                <span className="text-xs text-slate-400 font-mono">Special Stacks</span>
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-[#670047] transition">
                Vanni Cultural & Regional Collection
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                A distinguished collection of writings, poetry, local folklore, and historical manuscripts documenting the social, cultural, and spiritual heritage of the Vanni region and Northern Sri Lanka.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Available for Reference</span>
              <Link to="/about#vanni" className="text-[#670047] font-bold hover:underline flex items-center space-x-1">
                <span>View Guidelines</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Collection 2: Sri Lanka / Ceyloniana Collection */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-[#670047] transition flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase text-[#1b3058] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  National Archive
                </span>
                <span className="text-xs text-slate-400 font-mono">Rare Books</span>
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-[#1b3058] transition">
                Sri Lanka Ceyloniana Collection
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                An assemblage of published materials related to Sri Lanka's constitutional history, government gazettes, archaeological surveys, indigenous sciences, and Ceylon administrative reports.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Room 204 • Reference</span>
              <Link to="/about#srilanka" className="text-[#1b3058] font-bold hover:underline flex items-center space-x-1">
                <span>Explore Stacks</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Collection 3: Course Reserve Collection */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-[#670047] transition flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Course Reserves
                </span>
                <span className="text-xs text-slate-400 font-mono">Desk Hold</span>
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-amber-800 transition">
                High-Demand Course Textbooks
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Prescribed textbooks and syllabi references placed on short-loan reserve by lecturers across the Department of Physical Science, Bio-Science, Business Economics, and ICT.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">1-Day / Short Loan</span>
              <Link to="/catalog?available=true" className="text-amber-800 font-bold hover:underline flex items-center space-x-1">
                <span>Browse Holdings</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 6. OPENING HOURS & CIRCULATION DESK SCHEDULE (Matching lib.cmb.ac.lk & vau.ac.lk) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-3">
              <div className="inline-flex items-center space-x-1.5 text-xs font-black uppercase text-[#670047] bg-[#fff0f7] px-3 py-1 rounded-full border border-[#ffb3d9]">
                <Clock className="w-3.5 h-3.5" />
                <span>Operational Hours</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                Library Opening Times & Desk Services
              </h2>

              <p className="text-xs text-slate-600 leading-relaxed">
                The Main Library operates extended hours to support continuous undergraduate and faculty research. Please present your digital ID card QR at the reception counter.
              </p>

              <div className="pt-2">
                <Link
                  to="/dashboard"
                  className="bg-[#670047] hover:bg-[#4b0150] text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 transition shadow"
                >
                  <span>View Your Digital ID Card QR</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#ffcb00]" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span>Issue Counter</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">Open</span>
                  </div>
                  <div className="text-slate-500 mt-1">Monday – Friday: <strong>8:00 AM – 8:00 PM</strong></div>
                  <div className="text-[11px] text-slate-400">Circulation, desk holds & returns</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span>Reference & Stacks</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">Active</span>
                  </div>
                  <div className="text-slate-500 mt-1">Monday – Friday: <strong>8:00 AM – 8:00 PM</strong></div>
                  <div className="text-[11px] text-slate-400">Quiet study halls & stacks browsing</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span>Sri Lanka & Vanni Room</span>
                    <span className="text-slate-600 font-semibold bg-slate-200 px-2 py-0.5 rounded text-[10px]">Reference</span>
                  </div>
                  <div className="text-slate-500 mt-1">Monday – Friday: <strong>8:00 AM – 8:00 PM</strong></div>
                  <div className="text-[11px] text-slate-400">Special regional archives</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span>Weekend Study Hours</span>
                    <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px] border border-amber-200">Weekends</span>
                  </div>
                  <div className="text-slate-500 mt-1">Saturday: <strong>8:30 AM – 4:30 PM</strong></div>
                  <div className="text-[11px] text-slate-400">Reference reading & reading halls</div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. LATEST LIBRARY NEWS & SCHOLARLY EVENTS (Inspired by lib.cmb.ac.lk) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Library News & Academic Events
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Stay informed about user education workshops, book donations, and scholarly announcements
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-center space-x-2 text-[11px] text-slate-500 mb-2">
                <Calendar className="w-3.5 h-3.5 text-[#670047]" />
                <span>October 2026</span>
              </div>
              <h3 className="text-sm font-black text-slate-900 hover:text-[#670047] transition">
                Library Orientation for 2025/2026 Undergraduate Intake
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Comprehensive induction sessions for newly enrolled students on OPAC search, digital ID QR cards, and library stacks discovery at Main Library Auditorium.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">User Education</span>
              <Link to="/services#education" className="text-[#670047] font-bold hover:underline">Read Guide</Link>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-center space-x-2 text-[11px] text-slate-500 mb-2">
                <Calendar className="w-3.5 h-3.5 text-[#670047]" />
                <span>September 2026</span>
              </div>
              <h3 className="text-sm font-black text-slate-900 hover:text-[#670047] transition">
                Workshop on Reference Managers & Turnitin Similarity Checking
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Hands-on training session conducted by the Library staff for final year undergraduates and postgraduates on Mendeley, Zotero, and thesis submission originality checks.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">Research Support</span>
              <Link to="/services#turnitin" className="text-[#670047] font-bold hover:underline">Details</Link>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-center space-x-2 text-[11px] text-slate-500 mb-2">
                <Calendar className="w-3.5 h-3.5 text-[#670047]" />
                <span>August 2026</span>
              </div>
              <h3 className="text-sm font-black text-slate-900 hover:text-[#670047] transition">
                Online Access to ScienceDirect & Emerald Insight Granted
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Faculty members and students can now access international peer-reviewed journals via LEARN campus network and off-campus federated login.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded">E-Resources</span>
              <Link to="/ebooks" className="text-[#670047] font-bold hover:underline">Access Portal</Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
