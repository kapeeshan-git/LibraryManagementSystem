import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Printer, 
  Bookmark, 
  Search, 
  ShieldCheck, 
  GraduationCap, 
  Building2, 
  Repeat, 
  Wifi, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight, 
  Mail, 
  Phone,
  FileCheck,
  Sparkles,
  HelpCircle,
  FileText
} from 'lucide-react';

export default function ServicesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-r from-[#670047] via-[#4b0150] to-[#1b3058] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-[#ffcb00]/20 border border-[#ffcb00]/40 text-[#ffcb00] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Library Facilities • vau.ac.lk/library_services/</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Library Services & Academic Facilities
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Providing modern library facilities, reproduction services, ISBN/ISSN applications, research similarity checking, and user education for the University of Vavuniya community.
          </p>
        </div>
      </div>

      {/* 2. SERVICES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Service 1: Photocopying & Printing */}
        <div id="photocopy" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:border-[#670047] transition flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#670047]/10 text-[#670047] flex items-center justify-center mb-4 shadow-2xs">
              <Printer className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              Photocopying, Printing & Scanning Service
            </h2>
            <div className="text-xs text-slate-600 mt-2 space-y-2 leading-relaxed">
              <p>
                The photocopying and document reproduction service is located on the <strong>left side of the entrance of the Main Library</strong>. Similar services are accessible across other faculty library premises at Pambaimadu Campus.
              </p>
              <ul className="space-y-1.5 pt-1 text-slate-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>High-speed photocopying conforming to Sri Lanka copyright fair-use limits.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Network laser printing for student assignments and faculty research papers.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Free document scanning to USB or email for academic references.</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500 font-medium">
            Operating Hours: Mon – Fri: 8:30 AM – 5:00 PM
          </div>
        </div>

        {/* Service 2: Apply Online for ISBN/ISSN/ISMN (Official vau.ac.lk Feature) */}
        <div id="isbn" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:border-[#670047] transition flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#ffcb00]/20 text-[#670047] flex items-center justify-center mb-4 shadow-2xs">
              <Bookmark className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              Apply Online for ISBN / ISSN / ISMN
            </h2>
            <div className="text-xs text-slate-600 mt-2 space-y-2 leading-relaxed">
              <p>
                The University Library assists academics, departments, and authors in obtaining International Standard Book Numbers (ISBN), International Standard Serial Numbers (ISSN), and Music Numbers (ISMN).
              </p>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-1.5 text-[11px] text-amber-900">
                <div className="font-bold">University Publications:</div>
                <p>
                  A <strong>UNIVERSITY ACCOUNT</strong> created by the library is required to apply online for ISBN/ISSN for official university conference proceedings, faculty journals, and institutional books.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-[11px] text-slate-800">
                <div className="font-bold">Author Publications (Self-publishing):</div>
                <p>
                  Individual authors may register directly on the National Library of Sri Lanka registration portal:
                </p>
                <a
                  href="https://isbn.lk/index.php/Welcome/select_signup"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#670047] font-bold hover:underline inline-flex items-center space-x-1"
                >
                  <span>isbn.lk Registration Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500 font-medium">
            Contact: Senior Assistant Librarian • <a href="mailto:library@vau.ac.lk" className="text-[#670047] underline">library@vau.ac.lk</a>
          </div>
        </div>

        {/* Service 3: OPAC Search & Desk Circulation */}
        <div id="borrowing" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:border-[#670047] transition flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#1b3058]/10 text-[#1b3058] flex items-center justify-center mb-4 shadow-2xs">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              Online Public Access Catalog (OPAC) & Holds
            </h2>
            <div className="text-xs text-slate-600 mt-2 space-y-2 leading-relaxed">
              <p>
                Browse the complete physical catalog of the University of Vavuniya, locate call numbers, review real-time shelf status across stack racks, and place desk pickup holds.
              </p>
              <ul className="space-y-1.5 pt-1 text-slate-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Koha/DDC classification call number lookup for rapid stack retrieval.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Place desk holds on loaned books to enter reservation queue automatically.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Physical Student/Staff ID Card (QR or Barcode) checkouts at the circulation counter.</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link to="/catalog" className="text-xs font-bold text-[#670047] hover:underline flex items-center space-x-1">
              <span>Access Online Catalog (OPAC)</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Service 4: Turnitin Plagiarism & Similarity Checking */}
        <div id="turnitin" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:border-[#670047] transition flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              Research Support & Similarity Checking (Turnitin)
            </h2>
            <div className="text-xs text-slate-600 mt-2 space-y-2 leading-relaxed">
              <p>
                To maintain high research integrity and combat plagiarism, the University Library provides Turnitin similarity verification for:
              </p>
              <ul className="space-y-1.5 pt-1 text-slate-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Undergraduate final year project dissertations.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Postgraduate M.Phil and Ph.D. research theses.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Manuscripts intended for publication in university research journals.</span>
                </li>
              </ul>
              <p className="text-[11px] text-slate-500 pt-1">
                Submissions must be routed through the relevant Head of Department or Supervisor to the Senior Assistant Librarian.
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500 font-medium">
            Requirement: Similarity index must not exceed 20% (excluding references).
          </div>
        </div>

        {/* Service 5: User Education & Information Literacy */}
        <div id="education" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:border-[#670047] transition flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#670047] flex items-center justify-center mb-4 shadow-2xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              User Education & Information Literacy
            </h2>
            <div className="text-xs text-slate-600 mt-2 space-y-2 leading-relaxed">
              <p>
                The Library conducts regular capacity-building workshops to empower students and faculty in mastering scientific literature discovery and citation managers:
              </p>
              <ul className="space-y-1.5 pt-1 text-slate-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Annual Orientation & Library Tour for new undergraduate entrants.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Workshops on Reference Managers: Mendeley, Zotero, and EndNote.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Advanced scientific literature searching in IEEE, ScienceDirect, and JSTOR.</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500 font-medium">
            Contact the Reader Services Division to book group instructional sessions.
          </div>
        </div>

        {/* Service 6: Inter-Library Loan (ILL) */}
        <div id="ill" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:border-[#670047] transition flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-800 flex items-center justify-center mb-4 shadow-2xs">
              <Repeat className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              Inter-Library Loan (ILL) & Document Delivery
            </h2>
            <div className="text-xs text-slate-600 mt-2 space-y-2 leading-relaxed">
              <p>
                Materials not available in the University of Vavuniya holdings can be requested from other state university libraries through the national Inter-Library Loan network:
              </p>
              <ul className="space-y-1.5 pt-1 text-slate-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Partnered with Colombo, Peradeniya, Jaffna, Moratuwa, and Ruhuna.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Electronic delivery of journal articles and book chapter photocopies.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Short-term loan of specialized monographs for academic staff.</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500 font-medium">
            Submit request via ILL Request Form at the Reference Counter.
          </div>
        </div>

        {/* Service 7: Campus Wi-Fi & Cyber Center */}
        <div id="wifi" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:border-[#670047] transition flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 shadow-2xs">
              <Wifi className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              High-Speed Wi-Fi & Cyber Center / Digital Lab
            </h2>
            <div className="text-xs text-slate-600 mt-2 space-y-2 leading-relaxed">
              <p>
                High-speed internet connectivity powered by Lanka Education and Research Network (LEARN) and eduroam is available across all floors of the Main Library:
              </p>
              <ul className="space-y-1.5 pt-1 text-slate-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Global eduroam roaming credentials supported.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Dedicated desktop workstations in the Digital Resource Center.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Fast access to institutional e-learning portals and subscribed databases.</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500 font-medium">
            Location: 1st Floor Digital Lab, Main Library
          </div>
        </div>

        {/* Service 8: Resource Center & Special Collections */}
        <div id="resource-center" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:border-[#670047] transition flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 shadow-2xs">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              Resource Centre & Archival Consultations
            </h2>
            <div className="text-xs text-slate-600 mt-2 space-y-2 leading-relaxed">
              <p>
                Dedicated archival research assistance providing access to the historical Vanni Regional Collection, Sri Lanka Ceyloniana archives, and national gazettes:
              </p>
              <ul className="space-y-1.5 pt-1 text-slate-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>One-on-one consultation with subject reference librarians.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Access to rare Northern Ceylon literature and indigenous agricultural texts.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Quiet carrel desks reserved for postgraduate and visiting researchers.</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500 font-medium">
            Room 204 • Prior appointment recommended for rare manuscripts
          </div>
        </div>

      </div>

      {/* 3. ASSISTANCE BANNER */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">Need Customized Research or Circulation Assistance?</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Our librarians are ready to assist with literature searches, database access issues, and citation verification. Visit the Reader Services counter or email us.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href="mailto:library@vau.ac.lk"
            className="bg-[#ffcb00] hover:bg-[#e5b600] text-[#4b0150] px-4 py-2.5 rounded-xl text-xs font-black transition shadow flex items-center space-x-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Library Desk</span>
          </a>
          <Link
            to="/about"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs font-bold transition"
          >
            View Loan Matrix & Hours
          </Link>
        </div>
      </section>

    </div>
  );
}
