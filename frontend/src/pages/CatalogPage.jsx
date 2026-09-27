import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, BookCheck, Bookmark, CheckCircle, Clock, MapPin, Tag, AlertCircle } from 'lucide-react';

export default function CatalogPage() {
  const { isAuthenticated } = useAuth();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [reservationMessage, setReservationMessage] = useState({ text: '', type: '' });
  const [actionLoading, setActionLoading] = useState(false);

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
      alert('Please sign in to place a book hold or join the reservation queue.');
      return;
    }
    setActionLoading(true);
    setReservationMessage({ text: '', type: '' });

    try {
      const res = await api.post('/reservations/place/', { book_id: bookId });
      setReservationMessage({
        type: 'success',
        text: res.data.status === 'READY_FOR_PICKUP'
          ? `Hold Placed! A copy is set aside for you at the library desk for 48 hours.`
          : `Reserved! You are position #${res.data.queue_position} in the queue.`
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-8 mb-8 text-white shadow-xl">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">University OPAC Catalog</h1>
        <p className="text-emerald-100 max-w-2xl text-sm leading-relaxed">
          Search physical library collections, check real-time shelf availability, and place pickup holds or join loan waiting queues.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, author, ISBN, or subject..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-md"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition shadow-md flex items-center justify-center space-x-2 text-sm"
          >
            <span>Search Catalog</span>
          </button>
        </form>

        {/* Filter controls */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-emerald-100">
          <div className="flex items-center space-x-2">
            <span>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-800/80 border border-emerald-500/30 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center space-x-2 cursor-pointer bg-slate-800/60 px-3 py-1 rounded-lg border border-emerald-500/20 hover:bg-slate-800">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="rounded text-emerald-500 focus:ring-emerald-400"
            />
            <span>Available Copies Only</span>
          </label>
        </div>
      </div>

      {/* Book Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-slate-500">Searching catalog collection...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-slate-500 text-base">No books found matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => {
            const isAvailable = book.available_copies_count > 0;
            return (
              <div
                key={book.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {book.category_name || 'General'}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isAvailable ? `${book.available_copies_count} Available` : 'All On Loan'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug hover:text-emerald-700 transition">
                    {book.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1">
                    By {book.authors?.map(a => a.name).join(', ') || 'Unknown Author'}
                  </p>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      <span>ISBN: <strong className="text-slate-700">{book.isbn}</strong></span>
                    </div>
                    {book.shelf_location && (
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Shelf: <strong className="text-slate-700">{book.shelf_location}</strong></span>
                      </div>
                    )}
                  </div>

                  {book.description && (
                    <p className="mt-3 text-xs text-slate-600 line-clamp-2">
                      {book.description}
                    </p>
                  )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedBook(book);
                      setReservationMessage({ text: '', type: '' });
                    }}
                    className="text-xs font-bold text-slate-700 hover:text-emerald-700 underline"
                  >
                    View Copies ({book.total_copies_count})
                  </button>

                  <button
                    onClick={() => handlePlaceHold(book.id)}
                    disabled={actionLoading}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-sm ${
                      isAvailable
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{isAvailable ? 'Hold for Pickup' : 'Join Waitlist'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Copies Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedBook.title}</h3>
                <p className="text-xs text-slate-500">ISBN: {selectedBook.isbn} • Shelf: {selectedBook.shelf_location}</p>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {reservationMessage.text && (
              <div className={`p-3 rounded-lg text-xs font-medium mb-4 flex items-center space-x-2 ${
                reservationMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {reservationMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{reservationMessage.text}</span>
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Physical Holdings & Barcodes
              </h4>
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto border border-slate-200 rounded-lg">
                {selectedBook.copies && selectedBook.copies.length > 0 ? (
                  selectedBook.copies.map((copy) => (
                    <div key={copy.id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-mono font-bold text-slate-800">{copy.accession_number}</div>
                        <div className="text-slate-500 text-[11px]">Condition: {copy.condition_display}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${
                        copy.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                        copy.status === 'BORROWED' ? 'bg-amber-100 text-amber-800' :
                        copy.status === 'ON_HOLD' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {copy.status_display}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">No copies registered yet.</div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => handlePlaceHold(selectedBook.id)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow"
              >
                {selectedBook.available_copies_count > 0 ? 'Hold Available Copy' : 'Join Wait Queue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
