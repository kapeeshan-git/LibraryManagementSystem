import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  MapPin, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  Users, 
  Layers, 
  FileText, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* 1. HERO HEADER WITH VAU.AC.LK IDENTITY */}
      <div className="bg-gradient-to-r from-[#670047] via-[#4b0150] to-[#1b3058] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
          <img src="/uov_logo.png" alt="" className="w-80 h-auto" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-[#ffcb00]/20 border border-[#ffcb00]/40 text-[#ffcb00] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official University Profile • vau.ac.lk/library_about/</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            About the Library — University of Vavuniya
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Empowering the university community with high-calibre academic collections, innovative digital repositories, regional historical archives, and dynamic research support services.
          </p>
        </div>
      </div>

      {/* 2. VISION & MISSION CARDS (Exact Official Text from vau.ac.lk) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 border-2 border-[#670047]/20 shadow-xs hover:border-[#670047] transition">
          <div className="w-12 h-12 rounded-2xl bg-[#670047]/10 text-[#670047] flex items-center justify-center font-bold mb-4">
            <Award className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#670047] bg-[#fff0f7] px-3 py-1 rounded-full border border-[#ffb3d9]">
            Our Vision
          </span>
          <p className="mt-4 text-sm sm:text-base font-medium text-slate-800 italic leading-relaxed">
            “To be a leading centre for knowledge access, advancement, and dissemination that supports academic excellence, innovative research, and sustainable development.”
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border-2 border-[#ffcb00]/40 shadow-xs hover:border-[#ffcb00] transition">
          <div className="w-12 h-12 rounded-2xl bg-[#ffcb00]/20 text-[#670047] flex items-center justify-center font-bold mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#4b0150] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Our Mission
          </span>
          <p className="mt-4 text-sm sm:text-base font-medium text-slate-800 italic leading-relaxed">
            “To contribute to excellence in education, innovative research, and collaboration by providing quality information resources, promoting information literacy, and supporting knowledge creation that empowers graduates and advances sustainable regional and national development.”
          </p>
        </div>
      </section>

      {/* 3. HISTORY & EVOLUTION */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-[#670047]" />
          <span>Historical Background</span>
        </h2>
        <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
          <p>
            The University of Vavuniya Library originated alongside the establishment of the Northern Province Affiliated University College (NPAUC) in 1991. Subsequently, in 1997, it was upgraded into the Vavuniya Campus of the University of Jaffna, operating two prominent faculties: the Faculty of Applied Science and the Faculty of Business Studies.
          </p>
          <p>
            On August 1, 2021, by virtue of an Extraordinary Gazette issued by the Government of Sri Lanka, the institution attained full-fledged national university status as the <strong>University of Vavuniya</strong>, becoming Sri Lanka's 17th state university.
          </p>
          <p>
            Presently situated at the picturesque Pambaimadu Campus on Mannar Road, the library system comprises the central Main Library along with specialized faculty collection wings catering to the Faculty of Applied Science, Faculty of Business Studies, and Faculty of Technological Studies.
          </p>
        </div>
      </section>

      {/* 4. OFFICIAL OPENING HOURS (Matching vau.ac.lk Schedule) */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#670047]" />
            <span>Library Opening Hours</span>
          </h2>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Weekdays & Saturday Schedule
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
            <thead className="bg-[#670047] text-white uppercase text-[11px] font-bold">
              <tr>
                <th className="p-3.5">Library Section</th>
                <th className="p-3.5">Weekdays (Opening Hours)</th>
                <th className="p-3.5">Weekend Hours</th>
                <th className="p-3.5">Service Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">Main Circulation Counter</td>
                <td className="p-3.5 text-[#670047] font-bold">8.00 a.m. to 8.00 p.m.</td>
                <td className="p-3.5 text-slate-600">8.30 a.m. to 4.30 p.m. (Sat)</td>
                <td className="p-3.5 text-slate-500">Book issues, returns, barcode checks, fine settlement</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">Reference Section</td>
                <td className="p-3.5 text-[#670047] font-bold">8.00 a.m. to 8.00 p.m.</td>
                <td className="p-3.5 text-slate-600">8.30 a.m. to 4.30 p.m. (Sat)</td>
                <td className="p-3.5 text-slate-500">Non-circulating encyclopedias, dictionaries, overnight loans</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">Stack Section (Lending)</td>
                <td className="p-3.5 text-[#670047] font-bold">8.00 a.m. to 8.00 p.m.</td>
                <td className="p-3.5 text-slate-600">8.30 a.m. to 4.30 p.m. (Sat)</td>
                <td className="p-3.5 text-slate-500">Open stacks for course textbooks and borrowing</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">Sri Lanka Collection</td>
                <td className="p-3.5 text-[#670047] font-bold">8.00 a.m. to 8.00 p.m.</td>
                <td className="p-3.5 text-slate-600">Library Use Only</td>
                <td className="p-3.5 text-slate-500">Ceyloniana, government gazettes, national history</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">Vanni Collection</td>
                <td className="p-3.5 text-[#670047] font-bold">8.00 a.m. to 8.00 p.m.</td>
                <td className="p-3.5 text-slate-600">Library Use Only</td>
                <td className="p-3.5 text-slate-500">Regional folklore, spiritual writings, Northern heritage</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">Periodical Section</td>
                <td className="p-3.5 text-[#670047] font-bold">8.00 a.m. to 8.00 p.m.</td>
                <td className="p-3.5 text-slate-600">8.30 a.m. to 4.30 p.m. (Sat)</td>
                <td className="p-3.5 text-slate-500">Academic journals, current awareness publications, newspapers</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. CIRCULATION POLICY & LOAN LIMITS MATRIX (Official vau.ac.lk Rules) */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Circulation Guidelines & Borrowing Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Official borrowing limits, borrowing durations, renewals, and overdue fine tariffs
          </p>
        </div>

        {/* 1. Book Issuing Times */}
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#670047]">
            1. Book Issuing & Return Timings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 text-sm">Reference Section (Overnight Loans)</div>
              <div>Issue Time: <strong>3.00 p.m. to 6.00 p.m.</strong></div>
              <div>Return Time: <strong>8.30 a.m. to 9.00 a.m. (Next Working Day)</strong></div>
              <div>Loan Duration: <strong>1 Day (Students)</strong> • <strong>1 Week (Academic Staff)</strong></div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 text-sm">Stack Section (Regular Lending)</div>
              <div>Issue Time: <strong>8.00 a.m. to 6.00 p.m.</strong></div>
              <div>Return Time: <strong>8.00 a.m. to 6.00 p.m.</strong></div>
              <div>Loan Duration: <strong>1 Week (Students & Non-Academic)</strong> • <strong>1 Month (Academic Staff)</strong></div>
            </div>
          </div>
        </div>

        {/* 2. Loan Limits Table */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#670047]">
            2. Patron Loan Limits
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Patron Category</th>
                  <th className="p-3 text-center">Reference Section</th>
                  <th className="p-3 text-center">Stack Section</th>
                  <th className="p-3 text-center">Total Book Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/80">
                  <td className="p-3 font-semibold">1st Year Undergraduates</td>
                  <td className="p-3 text-center">01</td>
                  <td className="p-3 text-center">02</td>
                  <td className="p-3 text-center font-bold text-[#670047]">03 Books</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="p-3 font-semibold">2nd Year Undergraduates</td>
                  <td className="p-3 text-center">01</td>
                  <td className="p-3 text-center">03</td>
                  <td className="p-3 text-center font-bold text-[#670047]">04 Books</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="p-3 font-semibold">3rd Year Undergraduates</td>
                  <td className="p-3 text-center">01</td>
                  <td className="p-3 text-center">04</td>
                  <td className="p-3 text-center font-bold text-[#670047]">05 Books</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="p-3 font-semibold">4th Year Undergraduates</td>
                  <td className="p-3 text-center">01</td>
                  <td className="p-3 text-center">04</td>
                  <td className="p-3 text-center font-bold text-[#670047]">05 Books</td>
                </tr>
                <tr className="hover:bg-slate-50/80 bg-purple-50/40">
                  <td className="p-3 font-bold text-slate-900">Academic Staff (Permanent)</td>
                  <td className="p-3 text-center font-bold">02</td>
                  <td className="p-3 text-center font-bold">06</td>
                  <td className="p-3 text-center font-black text-[#670047]">08 Books</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="p-3 font-semibold">Academic Staff (Temporary / Visiting)</td>
                  <td className="p-3 text-center">02</td>
                  <td className="p-3 text-center">02</td>
                  <td className="p-3 text-center font-bold text-[#670047]">04 Books</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="p-3 font-semibold">Non-Academic Staff</td>
                  <td className="p-3 text-center">—</td>
                  <td className="p-3 text-center">02</td>
                  <td className="p-3 text-center font-bold text-[#670047]">02 Books</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Fines & Renewals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200">
            <div className="font-bold text-rose-900 mb-1">3. Overdue Fine Tariffs</div>
            <div className="space-y-1 text-rose-800">
              <div>• Reference Books: <strong>Rs. 50.00 per day</strong></div>
              <div>• Stack / Lending Books: <strong>Rs. 5.00 per day</strong></div>
              <div className="text-[11px] text-rose-700 mt-1">Fines accumulate automatically until the item is discharged at the desk.</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
            <div className="font-bold text-amber-900 mb-1">4. Book Renewal Privileges</div>
            <p className="text-amber-800 leading-relaxed">
              Users are permitted to renew their borrowed items online or at the circulation counter before the due date. A <strong>maximum of two (2) renewals</strong> is permitted per book provided no other patron has placed a reservation hold.
            </p>
          </div>
        </div>

      </section>

      {/* 6. GENERAL RULES & CODE OF CONDUCT (From Official vau.ac.lk) */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-[#670047]" />
          <span>Library Conduct & Regulations</span>
        </h2>
        
        <p className="text-xs text-slate-600 italic">
          Valued Readers, It is a great pleasure to welcome you. Readers are kindly expected to abide by these rules and regulations. Violation of library rules may lead to cancellation or suspension of library membership. These rules are as effective as University regulations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700 pt-2">
          <div className="flex items-start space-x-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-[#670047] shrink-0 mt-0.5" />
            <span><strong>Silence:</strong> Strict silence must be observed at all times inside study halls and stack areas.</span>
          </div>

          <div className="flex items-start space-x-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-[#670047] shrink-0 mt-0.5" />
            <span><strong>Mobile Phones:</strong> Switch off or silence all mobile devices upon entering the library premises.</span>
          </div>

          <div className="flex items-start space-x-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-[#670047] shrink-0 mt-0.5" />
            <span><strong>Prohibited Bags:</strong> Briefcases, personal handbags, umbrellas, hats, and personal bulky sheets must be placed in property lockers at entrance.</span>
          </div>

          <div className="flex items-start space-x-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-[#670047] shrink-0 mt-0.5" />
            <span><strong>Declaration at Counter:</strong> Declare all personal notebooks and materials when entering and leaving the library.</span>
          </div>

          <div className="flex items-start space-x-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-[#670047] shrink-0 mt-0.5" />
            <span><strong>Shelving Etiquette:</strong> Readers are not expected to reshelve books; please leave consulted volumes neatly on reading tables.</span>
          </div>

          <div className="flex items-start space-x-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-[#670047] shrink-0 mt-0.5" />
            <span><strong>Food & Drinks:</strong> Consumption of food, beverages, and smoking are strictly prohibited in the library building.</span>
          </div>

          <div className="flex items-start space-x-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-[#670047] shrink-0 mt-0.5" />
            <span><strong>ID Card Inspection:</strong> Readers must present their Student/Staff Identity Card QR upon request by library staff.</span>
          </div>

          <div className="flex items-start space-x-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-[#670047] shrink-0 mt-0.5" />
            <span><strong>Uncharged Books:</strong> Taking uncharged books out of the library is a severe offense resulting in disciplinary action.</span>
          </div>
        </div>
      </section>

      {/* 7. SPECIAL COLLECTIONS SPOTLIGHT */}
      <section id="vanni" className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-3xl p-8 border border-[#ffcb00] shadow-xs space-y-4">
        <h2 className="text-xl font-black text-[#670047] tracking-tight">
          Special Collections: Vanni & Sri Lanka Heritage
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
          <div className="space-y-2 bg-white p-5 rounded-2xl border border-amber-200">
            <h3 className="text-sm font-black text-slate-900">Vanni Heritage Collection</h3>
            <p className="leading-relaxed">
              The Vanni Collection, established in the context of regional history and spiritual literature, preserves rare writings, poems, folktales, and socioeconomic documentation attributed to the Vanni region and Northern Ceylon. Researchers across Sri Lanka utilize this distinguished collection for postgraduate research.
            </p>
          </div>

          <div id="srilanka" className="space-y-2 bg-white p-5 rounded-2xl border border-amber-200">
            <h3 className="text-sm font-black text-slate-900">Sri Lanka Ceyloniana Collection</h3>
            <p className="leading-relaxed">
              The Sri Lanka Collection represents an invaluable assemblage preserving the island’s rich cultural heritage, administrative narratives, national gazettes, and botanical explorations, strictly conserved for reference within the library.
            </p>
          </div>
        </div>
      </section>

      {/* 8. LIBRARY CONTACT & LOCATION */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">University of Vavuniya Main Library</h2>
          <div className="text-xs text-slate-400 space-y-1">
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-[#ffcb00]" />
              <span>Pambaimadu Campus, Mannar Road, Vavuniya, Sri Lanka</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-[#ffcb00]" />
              <span>library@vau.ac.lk</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-[#ffcb00]" />
              <span>+94 24 222 2265 / +94 24 222 3317</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/catalog"
            className="bg-[#ffcb00] hover:bg-[#e5b600] text-[#4b0150] px-4 py-2.5 rounded-xl text-xs font-black transition shadow"
          >
            Search OPAC Catalog
          </Link>
          <Link
            to="/services"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs font-bold transition"
          >
            View All Services
          </Link>
        </div>
      </section>

    </div>
  );
}
