import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Download, 
  ExternalLink, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight,
  Filter
} from 'lucide-react';

const PAST_PAPERS = [
  {
    code: 'CSC3113',
    title: 'Operating Systems & System Programming',
    faculty: 'Faculty of Applied Science',
    department: 'Physical Science',
    year: '2024',
    semester: 'Year 3 • Semester 1',
    fileType: 'PDF (1.2 MB)',
  },
  {
    code: 'TICT2123',
    title: 'Object-Oriented Software Engineering',
    faculty: 'Faculty of Technological Studies',
    department: 'Information & Communication Technology',
    year: '2024',
    semester: 'Year 2 • Semester 1',
    fileType: 'PDF (980 KB)',
  },
  {
    code: 'BBA2101',
    title: 'Principles of Financial Management',
    faculty: 'Faculty of Business Studies',
    department: 'Finance & Accountancy',
    year: '2023',
    semester: 'Year 2 • Semester 1',
    fileType: 'PDF (840 KB)',
  },
  {
    code: 'AMA1102',
    title: 'Calculus & Analytical Geometry',
    faculty: 'Faculty of Applied Science',
    department: 'Physical Science',
    year: '2023',
    semester: 'Year 1 • Semester 1',
    fileType: 'PDF (1.1 MB)',
  },
  {
    code: 'BIO2103',
    title: 'Microbial Genetics & Biotechnology',
    faculty: 'Faculty of Applied Science',
    department: 'Biological Science',
    year: '2023',
    semester: 'Year 2 • Semester 2',
    fileType: 'PDF (1.4 MB)',
  },
  {
    code: 'HRM3204',
    title: 'Strategic Human Resource Management',
    faculty: 'Faculty of Business Studies',
    department: 'Management & Entrepreneurship',
    year: '2024',
    semester: 'Year 3 • Semester 2',
    fileType: 'PDF (750 KB)',
  },
  {
    code: 'CSC2112',
    title: 'Database Systems & SQL Implementation',
    faculty: 'Faculty of Applied Science',
    department: 'Physical Science',
    year: '2024',
    semester: 'Year 2 • Semester 1',
    fileType: 'PDF (1.0 MB)',
  },
  {
    code: 'TICT3102',
    title: 'Network Security & Cryptography',
    faculty: 'Faculty of Technological Studies',
    department: 'Information & Communication Technology',
    year: '2023',
    semester: 'Year 3 • Semester 1',
    fileType: 'PDF (1.3 MB)',
  },
];

export default function PublicationsPage() {
  const [paperSearch, setPaperSearch] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('All');

  const filteredPapers = PAST_PAPERS.filter(p => {
    const matchesSearch = 
      p.code.toLowerCase().includes(paperSearch.toLowerCase()) ||
      p.title.toLowerCase().includes(paperSearch.toLowerCase()) ||
      p.year.includes(paperSearch);
    const matchesFaculty = 
      selectedFaculty === 'All' || p.faculty === selectedFaculty;
    return matchesSearch && matchesFaculty;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-r from-[#670047] via-[#4b0150] to-[#1b3058] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-[#ffcb00]/20 border border-[#ffcb00]/40 text-[#ffcb00] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>University Publications & Past Papers Archive</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Scholarly Publications & Exam Repository
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Access University of Vavuniya peer-reviewed research journals, international conference proceedings (VUIRC), and past semester examination papers for undergraduate studies.
          </p>
        </div>
      </div>

      {/* 2. UNIVERSITY RESEARCH JOURNALS */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            University Research Journals & Proceedings
          </h2>
          <p className="text-xs text-slate-500">
            Official peer-reviewed journals published under the authority of the Senate of University of Vavuniya
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Journal 1: VJBS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-[#670047] transition flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase text-[#670047] bg-[#fff0f7] px-2.5 py-0.5 rounded-full border border-[#ffb3d9]">
                  Bi-Annual Journal
                </span>
                <span className="text-xs text-slate-500 font-mono font-bold">ISSN: 2362-0943</span>
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-[#670047] transition">
                Vavuniya Journal of Business Studies (VJBS)
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Published by the Faculty of Business Studies, VJBS features peer-reviewed research in business economics, financial management, entrepreneurship, and organizational behavior in emerging markets.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-bold">Volume 10 • Issue 2</span>
              <a
                href="https://vau.ac.lk/vjbs/"
                target="_blank"
                rel="noreferrer"
                className="text-[#670047] font-bold hover:underline flex items-center space-x-1"
              >
                <span>Journal Home</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Journal 2: JST */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-[#670047] transition flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase text-[#1b3058] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Annual Journal
                </span>
                <span className="text-xs text-slate-500 font-mono font-bold">Peer-Reviewed</span>
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-[#1b3058] transition">
                Journal of Science and Technology (JST)
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                The flagship publication of the Faculty of Applied Science, dedicated to fundamental and applied research in physical sciences, bio-technology, computing, and applied mathematical modeling.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
              <span className="text-blue-700 font-bold">Volume 7 • 2024</span>
              <a
                href="https://fas.vau.ac.lk/"
                target="_blank"
                rel="noreferrer"
                className="text-[#1b3058] font-bold hover:underline flex items-center space-x-1"
              >
                <span>Read Articles</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Journal 3: VUIRC */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-[#670047] transition flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Conference Proceedings
                </span>
                <span className="text-xs text-slate-500 font-mono font-bold">VUIRC 2024</span>
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-amber-800 transition">
                Vavuniya University International Research Conference
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Full-length research papers, track presentations, and keynotes from national and international scholars across science, management, and technology.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
              <span className="text-amber-800 font-bold">Proceedings Archive</span>
              <a
                href="https://vau.ac.lk/"
                target="_blank"
                rel="noreferrer"
                className="text-amber-800 font-bold hover:underline flex items-center space-x-1"
              >
                <span>Conference Site</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* 3. PAST EXAMINATION PAPERS ARCHIVE */}
      <section id="past-papers" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#670047] bg-[#fff0f7] px-3 py-1 rounded-full border border-[#ffb3d9] mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Exam Preparation Archive</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Past Semester Examination Papers
            </h2>
            <p className="text-xs text-slate-500">
              Download previous end-of-semester examination papers organized by course code and faculty
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Faculty of Applied Science', 'Faculty of Business Studies', 'Faculty of Technological Studies'].map(f => (
              <button
                key={f}
                onClick={() => setSelectedFaculty(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedFaculty === f
                    ? 'bg-[#670047] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f === 'All' ? 'All Faculties' : f.replace('Faculty of ', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={paperSearch}
            onChange={(e) => setPaperSearch(e.target.value)}
            placeholder="Search by Course Code (e.g. CSC3113) or Paper Title..."
            className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#670047]"
          />
        </div>

        {/* Papers Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Course Code</th>
                <th className="p-3.5">Examination Paper Title</th>
                <th className="p-3.5">Faculty / Dept</th>
                <th className="p-3.5">Semester & Year</th>
                <th className="p-3.5 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPapers.map((paper, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5 font-mono font-black text-[#670047] text-xs">
                    {paper.code}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">
                    {paper.title}
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <div>{paper.faculty}</div>
                    <div className="text-[11px] text-slate-400">Dept of {paper.department}</div>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <div>Academic Year {paper.year}</div>
                    <div className="text-[11px] text-slate-400">{paper.semester}</div>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => alert(`Downloading past paper: ${paper.code} (${paper.year})`)}
                      className="bg-slate-900 hover:bg-[#670047] text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center space-x-1.5 transition shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-[#ffcb00]" />
                      <span>{paper.fileType}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. INSTITUTIONAL REPOSITORY & RESEARCH GATEWAY */}
      <section className="bg-gradient-to-br from-slate-900 to-[#121e36] text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-[10px] font-black uppercase text-[#ffcb00] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
            Open Scholarly Repository
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            University of Vavuniya Institutional Repository
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Discover thousands of full-text postgraduate dissertations, faculty research journal articles, conference pre-prints, and working papers indexed with permanent handle URIs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/repository"
            className="bg-[#ffcb00] hover:bg-[#e5b600] text-[#4b0150] px-5 py-2.5 rounded-xl text-xs font-black transition shadow"
          >
            Open Institutional Repository
          </Link>
          <a
            href="https://scholar.google.com/citations?hl=en&view_op=search_authors&mauthors=%22vau.ac.lk%22"
            target="_blank"
            rel="noreferrer"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
          >
            <span>Staff in Google Scholar</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#ffcb00]" />
          </a>
        </div>
      </section>

    </div>
  );
}
