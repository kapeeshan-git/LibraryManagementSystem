import React from 'react';
import { Flame, Search, Bookmark, TrendingUp } from 'lucide-react';

export default function OverviewTab({ metrics, bookStats }) {
  if (!metrics) return null;
  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Catalog Titles</div>
          <div className="text-xl font-black text-slate-900 mt-1">{metrics.total_titles}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{metrics.total_physical_copies} physical copies</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Loans</div>
          <div className="text-xl font-black text-emerald-700 mt-1">{metrics.active_loans}</div>
          <div className="text-[10px] text-rose-600 font-bold mt-0.5">{metrics.overdue_loans} overdue</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3 text-rose-500" />
            <span>Total Borrows</span>
          </div>
          <div className="text-xl font-black text-[#670047] mt-1">{(metrics.total_cumulative_borrows || 0).toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Cumulative desk issues</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Search className="w-3 h-3 text-blue-500" />
            <span>Catalog Searches</span>
          </div>
          <div className="text-xl font-black text-[#1b3058] mt-1">{(metrics.total_catalog_searches || 0).toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Student & staff lookups</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-amber-500" />
            <span>Holds & Queues</span>
          </div>
          <div className="text-xl font-black text-amber-700 mt-1">{(metrics.total_cumulative_holds || 0).toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Desk holds & waitlists</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unpaid Fines</div>
          <div className="text-xl font-black text-rose-700 mt-1">Rs. {metrics.outstanding_fines_rs?.toFixed(0)}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Rs. {metrics.collected_fines_rs?.toFixed(0)} paid</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Research Papers</div>
          <div className="text-xl font-black text-blue-700 mt-1">{metrics.total_research_papers}</div>
          <div className="text-[10px] text-amber-600 font-bold mt-0.5">{metrics.pending_papers_for_review} pending</div>
        </div>
      </div>

      {/* Book Popularity & Demand Analytics (3 Columns: Most Borrowed, Most Searched, Most on Hold) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#670047] flex items-center justify-center text-[#ffcb00]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Academic Book Demand & Circulation Statistics (Koha Core Analytics)
            </h3>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
            Top 5 Ranking Per Metric
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
          {/* Column 1: Most Borrowed */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-800">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>🔥 Most Borrowed Titles</span>
              </div>
              <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                Checkouts
              </span>
            </div>

            <div className="space-y-2">
              {bookStats.most_borrowed?.slice(0, 5).map((b, idx) => (
                <div key={b.id} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                    <div className="flex-1 font-bold text-slate-900 truncate" title={b.title}>
                      {b.title}
                    </div>
                    <span className="font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                      {b.borrow_count} loans
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 pl-4">
                    <span>{b.category_name || 'Academic'}</span>
                    <span className="text-emerald-700 font-semibold">{b.available_copies_count}/{b.total_copies_count} on shelf</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Most Searched */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-800">
                <Search className="w-4 h-4 text-blue-600" />
                <span>🔍 Most Searched Titles</span>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                Inquiries
              </span>
            </div>

            <div className="space-y-2">
              {bookStats.most_searched?.slice(0, 5).map((b, idx) => (
                <div key={b.id} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                    <div className="flex-1 font-bold text-slate-900 truncate" title={b.title}>
                      {b.title}
                    </div>
                    <span className="font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                      {b.search_count} views
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 pl-4">
                    <span>{b.category_name || 'Academic'}</span>
                    <span className="font-mono text-slate-400">{b.call_number || b.isbn}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Most on Hold */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800">
                <Bookmark className="w-4 h-4 text-amber-600" />
                <span>📌 Most on Hold (Waitlists)</span>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                Demand Queue
              </span>
            </div>

            <div className="space-y-2">
              {bookStats.most_held?.slice(0, 5).map((b, idx) => (
                <div key={b.id} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                    <div className="flex-1 font-bold text-slate-900 truncate" title={b.title}>
                      {b.title}
                    </div>
                    <span className="font-black text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                      {b.hold_count} holds
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 pl-4">
                    <span>{b.category_name || 'Academic'}</span>
                    <span className={b.available_copies_count > 0 ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                      {b.available_copies_count > 0 ? `${b.available_copies_count} on shelf` : 'All copies loaned'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
