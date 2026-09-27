import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  Search, 
  BookOpen, 
  Download, 
  ExternalLink, 
  Tag, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  FileText, 
  Bookmark,
  Share2,
  Filter
} from 'lucide-react';

const EBOOK_CATEGORIES = [
  'All Disciplines',
  'Computer Science & ICT',
  'Mathematics & Statistics',
  'Bio-Science & Agriculture',
  'Business Economics & Management',
  'Engineering & Technology',
  'Physical Science',
  'General Reference'
];

const CURATED_EBOOKS = [
  {
    id: 1,
    title: 'Operating Systems: Three Easy Pieces',
    authors: 'Remzi H. Arpaci-Dusseau, Andrea C. Arpaci-Dusseau',
    category: 'Computer Science & ICT',
    publisher: 'Arpaci-Dusseau Books (Open Edition)',
    year: 2024,
    description: 'Fundamental textbook covering virtualization (CPU & Memory), concurrency (threads, locks, semaphores), and persistence (file systems & RAID). Prescribed for Applied Science ICT degree.',
    format: 'PDF / HTML',
    downloadUrl: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
    isOpenAccess: true,
  },
  {
    id: 2,
    title: 'Introduction to Statistical Learning with Applications in Python',
    authors: 'Gareth James, Daniela Witten, Trevor Hastie, Robert Tibshirani',
    category: 'Mathematics & Statistics',
    publisher: 'SpringerOpen Texts in Statistics',
    year: 2023,
    description: 'Premier open access reference on statistical modeling, machine learning, regularization, tree-based models, and deep learning for data science undergraduates.',
    format: 'PDF (Open Access)',
    downloadUrl: 'https://www.statlearning.com/',
    isOpenAccess: true,
  },
  {
    id: 3,
    title: 'Principles of Accounting (Volume 1 & 2)',
    authors: 'Mitchell Franklin, Patty Graybeal, Dixon Cooper',
    category: 'Business Economics & Management',
    publisher: 'OpenStax • Rice University',
    year: 2024,
    description: 'Peer-reviewed curriculum textbook covering financial and managerial accounting concepts, financial statements, and cost control for business undergraduates.',
    format: 'PDF / EPUB',
    downloadUrl: 'https://openstax.org/details/books/principles-accounting-volume-1-financial-accounting',
    isOpenAccess: true,
  },
  {
    id: 4,
    title: 'Database Design and Implementation: Second Edition',
    authors: 'Edward Sciore',
    category: 'Computer Science & ICT',
    publisher: 'Springer Nature (Open Monograph)',
    year: 2023,
    description: 'Comprehensive guide to relational database engines, B-tree indexing, query optimization, transaction management, and concurrency control.',
    format: 'PDF',
    downloadUrl: 'https://link.springer.com/book/10.1007/978-3-030-33836-7',
    isOpenAccess: true,
  },
  {
    id: 5,
    title: 'Concepts of Biology for Undergraduates',
    authors: 'Samantha Fowler, Rebecca Roush, James Wise',
    category: 'Bio-Science & Agriculture',
    publisher: 'OpenStax • Rice University',
    year: 2024,
    description: 'Foundational concepts in cellular biology, genetics, evolutionary biology, ecology, and plant physiological processes designed for biological science courses.',
    format: 'PDF / EPUB',
    downloadUrl: 'https://openstax.org/details/books/concepts-biology',
    isOpenAccess: true,
  },
  {
    id: 6,
    title: 'Calculus: Volume 1 & Volume 2',
    authors: 'Edwin Strang, Gilbert Strang, Herman Strange',
    category: 'Mathematics & Statistics',
    publisher: 'OpenStax • MIT OpenCourseWare',
    year: 2023,
    description: 'Standard multi-variable calculus, differential equations, Taylor series, and analytical geometry textbook for science and engineering faculties.',
    format: 'PDF',
    downloadUrl: 'https://openstax.org/details/books/calculus-volume-1',
    isOpenAccess: true,
  },
  {
    id: 7,
    title: 'Introductory Business Statistics',
    authors: 'Alexander Holmes, Barbara Illowsky, Susan Dean',
    category: 'Business Economics & Management',
    publisher: 'OpenStax Academic Press',
    year: 2024,
    description: 'Hypothesis testing, probability distributions, regression analysis, and variance tests tailored for management and economic decision modeling.',
    format: 'PDF / Web',
    downloadUrl: 'https://openstax.org/details/books/introductory-business-statistics',
    isOpenAccess: true,
  },
  {
    id: 8,
    title: 'Modern Robotics: Mechanics, Planning, and Control',
    authors: 'Kevin M. Lynch, Frank C. Park',
    category: 'Engineering & Technology',
    publisher: 'Cambridge University Press (Open Edition)',
    year: 2023,
    description: 'Rigorous introduction to kinematics, dynamics, motion planning, and trajectory control for technology and robotic engineering students.',
    format: 'PDF',
    downloadUrl: 'https://hades.mech.northwestern.edu/index.php/Modern_Robotics',
    isOpenAccess: true,
  },
];

export default function EBooksPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Disciplines');

  const filteredEbooks = CURATED_EBOOKS.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.authors.toLowerCase().includes(search.toLowerCase()) ||
      book.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = 
      selectedCategory === 'All Disciplines' || book.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-r from-[#670047] via-[#4b0150] to-[#1b3058] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-[#ffcb00]/20 border border-[#ffcb00]/40 text-[#ffcb00] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            <span>Digital Library • Open Access Textbooks</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            E-Books & Open Access Scholarly Resources
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Access hundreds of peer-reviewed digital textbooks, open academic monographs, and global research repositories directly without subscription paywalls.
          </p>

          {/* Search bar */}
          <div className="pt-3 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search e-books by title, author, or subject keyword..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#ffcb00]/50 shadow-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. GLOBAL ACADEMIC REPOSITORIES GATEWAY TILES */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Connected Global Academic E-Book Repositories
          </h2>
          <p className="text-xs text-slate-500">
            Search peer-reviewed monographs across trusted worldwide university press consortiums
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="https://www.doabooks.org/"
            target="_blank"
            rel="noreferrer"
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-[#670047] shadow-xs hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-900 group-hover:text-[#670047]">DOAB</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#670047]" />
            </div>
            <div className="text-[11px] text-slate-500">Directory of Open Access Books — 80,000+ academic titles from 400+ publishers.</div>
          </a>

          <a
            href="https://openstax.org/"
            target="_blank"
            rel="noreferrer"
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-[#670047] shadow-xs hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-900 group-hover:text-[#670047]">OpenStax</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#670047]" />
            </div>
            <div className="text-[11px] text-slate-500">Peer-reviewed, openly licensed textbooks from Rice University for degree curricula.</div>
          </a>

          <a
            href="https://www.oapen.org/"
            target="_blank"
            rel="noreferrer"
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-[#670047] shadow-xs hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-900 group-hover:text-[#670047]">OAPEN Library</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#670047]" />
            </div>
            <div className="text-[11px] text-slate-500">Open Access Publishing in European Networks — quality-controlled humanities & sciences.</div>
          </a>

          <a
            href="https://link.springer.com/search?facet-content-type=%22Book%22&package=openaccess"
            target="_blank"
            rel="noreferrer"
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-[#670047] shadow-xs hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-900 group-hover:text-[#670047]">SpringerOpen</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#670047]" />
            </div>
            <div className="text-[11px] text-slate-500">Thousands of freely accessible academic books in science, computing, and economics.</div>
          </a>
        </div>
      </section>

      {/* 3. CATEGORY FILTER CHIPS */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-bold text-slate-700 shrink-0">Filter:</span>
        {EBOOK_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-[#670047] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4. CURATED TEXTBOOKS GRID */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            Curated Academic Course E-Books ({filteredEbooks.length})
          </h2>
          <span className="text-xs text-[#670047] font-bold bg-[#fff0f7] px-3 py-1 rounded-full border border-[#ffb3d9]">
            Full Text Open Access
          </span>
        </div>

        {filteredEbooks.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No e-books matched your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEbooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-[#670047] transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <span className="text-[10px] font-black uppercase text-[#670047] bg-[#fff0f7] px-2.5 py-0.5 rounded-md border border-[#ffb3d9]">
                      {book.category}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{book.format}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#670047] transition leading-snug">
                    {book.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    By {book.authors} • <span className="text-slate-400 font-mono">{book.year}</span>
                  </p>

                  <div className="text-[11px] text-slate-500 mt-1">
                    Publisher: <strong className="text-slate-700">{book.publisher}</strong>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {book.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-700">
                    Free University Open Access
                  </span>

                  <a
                    href={book.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#670047] hover:bg-[#4b0150] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-xs"
                  >
                    <span>Read / Download</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#ffcb00]" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. NOTICE ON COPYRIGHT & RESEARCH USE */}
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start space-x-2">
        <Sparkles className="w-4 h-4 text-[#670047] shrink-0 mt-0.5" />
        <div>
          <strong>Scholarly Fair-Use Notice:</strong> All digital textbooks hosted or linked here are licensed under Creative Commons, open-access scholarly charters, or institutional open licenses for university research and educational study.
        </div>
      </div>

    </div>
  );
}
