import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookFormModal from '../components/catalog/BookFormModal';
import { 
  Search, 
  BookCheck, 
  Bookmark, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Tag, 
  AlertCircle,
  BookOpen,
  FileText,
  Repeat,
  QrCode,
  Sparkles,
  Info,
  BookPlus,
  Edit3,
  Layers,
  Barcode
} from 'lucide-react';

export default function CatalogPage() {
  const { isAuthenticated, isStaff, isAdmin } = useAuth();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [reservationMessage, setReservationMessage] = useState({ text: '', type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  // Add / Edit Book Modal state
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchBooks();
  }, [selectedCategory, availableOnly]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/catalog/categories/');
      setCategories(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let url = `/catalog/books/?q=${encodeURIComponent(search)}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (availableOnly) url += `&available=true`;
      
      const res = await api.get(url);
      setBooks(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  const handlePlaceHold = async (bookId) => {
    if (!isAuthenticated) {
      alert('Please sign in to place a book hold or join the reservation waitlist.');
      return;
    }
    setActionLoading(true);
    setReservationMessage({ text: '', type: '' });

    try {
      const res = await api.post('/reservations/place/', { book_id: bookId });
      setReservationMessage({
        type: 'success',
        text: res.data.status === 'READY_FOR_PICKUP'
          ? `Hold Placed! A copy has been set aside at the library desk for 48 hours.`
          : `Reserved! You are in position #${res.data.queue_position} in line.`
      });
      fetchBooks();
    } catch (err) {
      setReservationMessage({
        type: 'error',
        text: err.response?.data?.detail || err.response?.data?.[0] || 'Unable to place reservation.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Notice Banner (Inspired by lib.cmb.ac.lk & vau.ac.lk) */}
      <div className="bg-[#fff9e6] border-l-4 border-[#ffcb00] p-3.5 rounded-xl shadow-xs flex items-center justify-between text-xs text-[#670047]">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-[#670047] shrink-0" />
          <span className="font-semibold">
            <strong>Library Notice:</strong> Physical checkouts require your Student/Staff University ID Card QR. View your digital QR card from your dashboard.
          </span>
        </div>
        <span className="hidden md:inline font-mono font-bold text-[11px] bg-[#670047] text-[#ffcb00] px-2 py-0.5 rounded">
          Term 2 Circulation Active
        </span>
      </div>

      {/* Hero OPAC Search Section with UoV Colors */}
      <div className="bg-gradient-to-br from-[#670047] via-[#4b0150] to-[#1b3058] rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative crest watermark */}
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
          <img src="/uov_logo.png" alt="" className="w-72 h-auto" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-[#ffcb00]/20 border border-[#ffcb00]/40 text-[#ffcb00] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Online Public Access Catalog (OPAC)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Discover Library Collections & Research
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm mt-2 leading-relaxed max-w-2xl">
            Search physical books across Pambaimadu Campus, verify real-time shelf status, place desk pickup holds, and access faculty pre-prints.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Title, Author, ISBN, Subject, Call No., or Shelf..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#ffcb00]/50 shadow-lg"
              />
            </div>
            <button
              type="submit"
              className="bg-[#ffcb00] hover:bg-[#e5b600] text-[#4b0150] font-black px-7 py-3.5 rounded-2xl transition shadow-lg flex items-center justify-center space-x-2 text-sm"
            >
              <span>Search Catalog</span>
            </button>
          </form>

          {/* Filters Bar */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-200">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-300">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#1b3058] border border-white/20 text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#ffcb00]"
              >
                <option value="">All Academic Disciplines</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center space-x-2 cursor-pointer bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/15 transition">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded text-[#ffcb00] focus:ring-[#ffcb00]"
              />
              <span className="font-medium text-white">Available on Shelf Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Quick Services Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/repository"
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-[#670047] shadow-xs hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#670047]/10 text-[#670047] flex items-center justify-center mb-3 group-hover:bg-[#670047] group-hover:text-white transition">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#670047] transition">Institutional Repository</h3>
          <p className="text-[11px] text-slate-500 mt-1">Lecturer research papers & faculty journals</p>
        </Link>

        <Link
          to={isAuthenticated ? "/dashboard" : "/login"}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-[#670047] shadow-xs hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#ffcb00]/20 text-[#670047] flex items-center justify-center mb-3 group-hover:bg-[#ffcb00] transition">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#670047] transition">Digital Patron ID Card</h3>
          <p className="text-[11px] text-slate-500 mt-1">Mobile QR card for book checkouts</p>
        </Link>

        {isStaff ? (
          <Link
            to="/circulation"
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-[#670047] shadow-xs hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1b3058]/10 text-[#1b3058] flex items-center justify-center mb-3 group-hover:bg-[#1b3058] group-hover:text-white transition">
              <Repeat className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#670047] transition">Circulation Desk</h3>
            <p className="text-[11px] text-slate-500 mt-1">Barcode & ID scan for issues/returns</p>
          </Link>
        ) : (
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-[#670047] shadow-xs hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1b3058]/10 text-[#1b3058] flex items-center justify-center mb-3 group-hover:bg-[#1b3058] group-hover:text-white transition">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#670047] transition">Loan Renewals</h3>
            <p className="text-[11px] text-slate-500 mt-1">Extend borrowing periods online</p>
          </Link>
        )}

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#670047] tracking-wider">Main Library Hours</div>
            <div className="text-xs font-bold text-slate-800 mt-1">Monday – Friday: 8:00 AM – 6:00 PM</div>
            <div className="text-[11px] text-slate-500">Saturday: 8:30 AM – 4:30 PM</div>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded w-max mt-2 border border-emerald-200">
            Open for Academic Year
          </span>
        </div>
      </div>

      {/* Book Collection Grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">University Library Holdings</h2>
            <p className="text-xs text-slate-500">Showing catalog results for University of Vavuniya collections</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-[#670047] bg-[#fff0f7] px-3 py-1.5 rounded-full border border-[#ffb3d9]">
              {books.length} Books Found
            </span>

            {/* Admin / Staff Add Book Button */}
            {(isStaff || isAdmin) && (
              <button
                onClick={() => {
                  setBookToEdit(null);
                  setBookModalOpen(true);
                }}
                className="bg-[#670047] hover:bg-[#4b0150] text-white px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-2 transition shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <BookPlus className="w-4 h-4 text-[#ffcb00]" />
                <span>+ Add Book (Barcode Req.)</span>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#670047] border-t-transparent"></div>
            <p className="mt-2 text-xs text-slate-500 font-medium">Searching university library database...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-slate-500 text-xs">No catalog titles found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => {
              const isAvailable = book.available_copies_count > 0;
              return (
                <div
                  key={book.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between hover:border-[#670047]/40"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#670047] bg-[#fff0f7] px-2.5 py-0.5 rounded-md border border-[#ffb3d9]">
                        {book.category_name || 'Academic'}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isAvailable
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isAvailable ? `${book.available_copies_count} on Shelf` : 'All Loaned'}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 leading-snug hover:text-[#670047] transition">
                      {book.title}
                    </h3>

                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      By {book.authors?.map(a => a.name).join(', ') || 'Faculty / Author'}
                    </p>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        <span>ISBN: <strong className="font-mono text-slate-800">{book.isbn}</strong></span>
                      </div>
                      {book.call_number && (
                        <div className="flex items-center space-x-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          <span>Call No: <strong className="font-mono text-[#670047] font-bold">{book.call_number}</strong></span>
                        </div>
                      )}
                      {book.shelf_location && (
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Location: <strong className="text-slate-800">{book.shelf_location}</strong></span>
                        </div>
                      )}
                    </div>

                    {book.description && (
                      <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {book.description}
                      </p>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedBook(book);
                        setReservationMessage({ text: '', type: '' });
                      }}
                      className="text-xs font-bold text-[#670047] hover:underline"
                    >
                      Copies ({book.total_copies_count})
                    </button>

                    <div className="flex items-center space-x-2">
                      {/* Staff Edit Button */}
                      {(isStaff || isAdmin) && (
                        <button
                          onClick={() => {
                            setBookToEdit(book);
                            setBookModalOpen(true);
                          }}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#670047]/30 text-[#670047] hover:bg-[#670047]/10 transition flex items-center space-x-1 shadow-2xs"
                          title="Edit bibliographic details and manage copies/barcodes"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      )}

                      <button
                        onClick={() => handlePlaceHold(book.id)}
                        disabled={actionLoading}
                        className={`text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 transition shadow-xs ${
                          isAvailable
                            ? 'bg-[#670047] hover:bg-[#4b0150] text-white'
                            : 'bg-[#1b3058] hover:bg-[#121e36] text-white'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5 text-[#ffcb00]" />
                        <span>{isAvailable ? 'Hold' : 'Queue'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Book Copies Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">{selectedBook.title}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ISBN: {selectedBook.isbn} {selectedBook.call_number && `• Call: ${selectedBook.call_number}`}
                </p>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {reservationMessage.text && (
              <div className={`p-3 rounded-xl text-xs font-bold mb-4 flex items-center space-x-2 ${
                reservationMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {reservationMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span>{reservationMessage.text}</span>
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
                Physical Holdings & Accession Barcodes
              </h4>
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
                {selectedBook.copies && selectedBook.copies.length > 0 ? (
                  selectedBook.copies.map((copy) => (
                    <div key={copy.id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-mono font-bold text-[#670047] flex items-center space-x-1.5">
                          <Barcode className="w-3.5 h-3.5" />
                          <span>{copy.accession_number}</span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Type: {copy.item_type_display || copy.item_type} • Condition: {copy.condition_display || copy.condition}
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        copy.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                        copy.status === 'BORROWED' ? 'bg-amber-100 text-amber-800' :
                        copy.status === 'ON_HOLD' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {copy.status_display || copy.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">No physical copies registered yet.</div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                {(isStaff || isAdmin) && (
                  <button
                    onClick={() => {
                      setBookToEdit(selectedBook);
                      setSelectedBook(null);
                      setBookModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#670047] border border-[#670047]/40 hover:bg-[#670047]/10 flex items-center space-x-1.5 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit & Manage Barcodes</span>
                  </button>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedBook(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Close
                </button>
                <button
                  onClick={() => handlePlaceHold(selectedBook.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#670047] hover:bg-[#4b0150] shadow"
                >
                  {selectedBook.available_copies_count > 0 ? 'Place Desk Hold' : 'Join Waitlist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Book Form Modal */}
      {bookModalOpen && (
        <BookFormModal
          book={bookToEdit}
          categories={categories}
          onClose={() => {
            setBookModalOpen(false);
            setBookToEdit(null);
          }}
          onSuccess={() => {
            fetchBooks();
          }}
        />
      )}
    </div>
  );
}
