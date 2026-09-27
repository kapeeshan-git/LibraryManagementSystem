import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import QrBarcodeScanner from '../common/QrBarcodeScanner';
import { 
  X, 
  BookPlus, 
  Edit3, 
  Barcode, 
  Camera, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Tag, 
  MapPin, 
  FileText, 
  Clock, 
  ShieldCheck,
  RefreshCw,
  BookOpen
} from 'lucide-react';

const ITEM_TYPES = [
  { value: 'STANDARD', label: 'Standard Lending (14 Days)' },
  { value: 'REFERENCE', label: 'Reference (Non-circulating / Library Use)' },
  { value: 'RESERVE', label: 'Course Reserve (Short Loan / 3 Days)' },
  { value: 'PERIODICAL', label: 'Periodical / Journal' },
];

const CONDITIONS = [
  { value: 'NEW', label: 'Brand New' },
  { value: 'GOOD', label: 'Good Condition' },
  { value: 'FAIR', label: 'Fair / Normal Wear' },
  { value: 'DAMAGED', label: 'Damaged / Needs Repair' },
];

const COPY_STATUSES = [
  { value: 'AVAILABLE', label: 'Available on Shelf' },
  { value: 'BORROWED', label: 'Checked Out / On Loan' },
  { value: 'ON_HOLD', label: 'Reserved for Pickup' },
  { value: 'MAINTENANCE', label: 'In Repair / Maintenance' },
  { value: 'LOST', label: 'Reported Lost' },
];

export default function BookFormModal({ book = null, categories = [], onClose, onSuccess }) {
  const isEdit = Boolean(book);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'copies'

  // Book details form state
  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    author_names: '',
    category: '',
    call_number: '',
    shelf_location: '',
    publisher: '',
    publication_year: '',
    edition: '',
    description: '',
    // Initial physical copy fields (Required for Add Book)
    accession_number: '',
    item_type: 'STANDARD',
    condition: 'GOOD',
    copy_notes: '',
  });

  // State for copies in edit mode
  const [copies, setCopies] = useState([]);
  const [loadingCopies, setLoadingCopies] = useState(false);

  // New copy form state (when in edit mode)
  const [newCopy, setNewCopy] = useState({
    accession_number: '',
    item_type: 'STANDARD',
    condition: 'GOOD',
    notes: '',
  });
  const [addingCopy, setAddingCopy] = useState(false);

  // General state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Scanner modal state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState('accession_number'); // 'accession_number' | 'new_copy_accession' | 'isbn'

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        isbn: book.isbn || '',
        author_names: book.authors ? book.authors.map(a => a.name).join(', ') : '',
        category: book.category ? String(book.category) : '',
        call_number: book.call_number || '',
        shelf_location: book.shelf_location || '',
        publisher: book.publisher || '',
        publication_year: book.publication_year ? String(book.publication_year) : '',
        edition: book.edition || '',
        description: book.description || '',
        accession_number: '',
        item_type: 'STANDARD',
        condition: 'GOOD',
        copy_notes: '',
      });
      fetchBookCopies(book.id);
    }
  }, [book]);

  const fetchBookCopies = async (bookId) => {
    setLoadingCopies(true);
    try {
      const res = await api.get(`/catalog/copies/?book=${bookId}`);
      setCopies(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to load book copies', err);
    } finally {
      setLoadingCopies(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleNewCopyChange = (e) => {
    const { name, value } = e.target;
    setNewCopy(prev => ({ ...prev, [name]: value }));
  };

  const generateBarcode = (target) => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const barcode = `UOV-BC-${randomNum}`;
    if (target === 'accession_number') {
      setFormData(prev => ({ ...prev, accession_number: barcode }));
    } else if (target === 'new_copy_accession') {
      setNewCopy(prev => ({ ...prev, accession_number: barcode }));
    }
  };

  const handleScanResult = (scannedText) => {
    if (scannerTarget === 'accession_number') {
      setFormData(prev => ({ ...prev, accession_number: scannedText }));
    } else if (scannerTarget === 'new_copy_accession') {
      setNewCopy(prev => ({ ...prev, accession_number: scannedText }));
    } else if (scannerTarget === 'isbn') {
      setFormData(prev => ({ ...prev, isbn: scannedText }));
    }
  };

  const openScanner = (target) => {
    setScannerTarget(target);
    setScannerOpen(true);
  };

  // Submit main book form (Add or Edit)
  const handleSubmitBook = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.title.trim()) {
      setError('Book title is required.');
      return;
    }
    if (!formData.isbn.trim()) {
      setError('ISBN number is required.');
      return;
    }

    // If adding a new book, barcode is strictly mandatory
    if (!isEdit && !formData.accession_number.trim()) {
      setError('Physical Copy Barcode / Accession Number is required to catalog a book.');
      return;
    }

    setLoading(true);

    const payload = {
      title: formData.title.trim(),
      isbn: formData.isbn.trim(),
      author_names: formData.author_names.trim(),
      category: formData.category ? parseInt(formData.category) : null,
      call_number: formData.call_number.trim(),
      shelf_location: formData.shelf_location.trim(),
      publisher: formData.publisher.trim(),
      publication_year: formData.publication_year ? parseInt(formData.publication_year) : null,
      edition: formData.edition.trim(),
      description: formData.description.trim(),
    };

    if (!isEdit) {
      payload.accession_number = formData.accession_number.trim();
      payload.item_type = formData.item_type;
      payload.condition = formData.condition;
      payload.copy_notes = formData.copy_notes.trim();
    }

    try {
      if (isEdit) {
        const res = await api.put(`/catalog/books/${book.id}/`, payload);
        setSuccessMsg('Book metadata updated successfully!');
        if (onSuccess) onSuccess(res.data);
      } else {
        const res = await api.post('/catalog/books/', payload);
        setSuccessMsg('Book and physical copy registered successfully!');
        if (onSuccess) onSuccess(res.data);
        setTimeout(() => onClose(), 1200);
      }
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      if (data) {
        if (typeof data === 'object') {
          const firstKey = Object.keys(data)[0];
          const val = data[firstKey];
          setError(`${firstKey}: ${Array.isArray(val) ? val[0] : val}`);
        } else {
          setError(String(data));
        }
      } else {
        setError('An unexpected error occurred while saving the book.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add an additional copy to existing book (in Edit mode)
  const handleAddCopy = async (e) => {
    e.preventDefault();
    if (!newCopy.accession_number.trim()) {
      setError('Accession Barcode is mandatory when adding a physical copy.');
      return;
    }

    setAddingCopy(true);
    setError('');
    try {
      await api.post('/catalog/copies/', {
        book: book.id,
        accession_number: newCopy.accession_number.trim(),
        item_type: newCopy.item_type,
        condition: newCopy.condition,
        notes: newCopy.notes.trim(),
      });
      setSuccessMsg(`Physical copy [${newCopy.accession_number}] added successfully!`);
      setNewCopy({
        accession_number: '',
        item_type: 'STANDARD',
        condition: 'GOOD',
        notes: '',
      });
      fetchBookCopies(book.id);
      if (onSuccess) onSuccess();
    } catch (err) {
      const data = err.response?.data;
      if (data?.accession_number) {
        setError(Array.isArray(data.accession_number) ? data.accession_number[0] : data.accession_number);
      } else {
        setError('Failed to add physical copy.');
      }
    } finally {
      setAddingCopy(false);
    }
  };

  // Update copy condition or status
  const handleUpdateCopy = async (copyId, patchData) => {
    try {
      await api.patch(`/catalog/copies/${copyId}/`, patchData);
      setCopies(prev => prev.map(c => c.id === copyId ? { ...c, ...patchData } : c));
      setSuccessMsg('Copy details updated.');
      if (onSuccess) onSuccess();
    } catch (err) {
      alert(err.response?.data?.error || 'Unable to update copy.');
    }
  };

  // Delete physical copy
  const handleDeleteCopy = async (copyId, accession) => {
    if (!window.confirm(`Are you sure you want to permanently delete copy [${accession}]?`)) {
      return;
    }
    try {
      await api.delete(`/catalog/copies/${copyId}/`);
      setCopies(prev => prev.filter(c => c.id !== copyId));
      setSuccessMsg(`Copy [${accession}] deleted.`);
      if (onSuccess) onSuccess();
    } catch (err) {
      alert(err.response?.data?.error || 'Cannot delete copy (may be checked out or linked to active loans).');
    }
  };

  // Delete entire book
  const handleDeleteBook = async () => {
    if (!window.confirm(`DANGER: Are you sure you want to delete "${book.title}" and all its physical holdings? This action cannot be undone.`)) {
      return;
    }
    setLoading(true);
    try {
      await api.delete(`/catalog/books/${book.id}/`);
      if (onSuccess) onSuccess(null, true);
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || 'Cannot delete book: Copies may currently be borrowed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#670047] via-[#4b0150] to-[#1b3058] text-white p-5 sm:p-6 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ffcb00] text-[#4b0150] flex items-center justify-center font-bold shadow-md">
                {isEdit ? <Edit3 className="w-5 h-5" /> : <BookPlus className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight leading-tight">
                  {isEdit ? `Edit Catalog: ${book.title}` : 'Catalog New Book to Library'}
                </h2>
                <p className="text-xs text-slate-200 mt-0.5">
                  {isEdit 
                    ? `ISBN: ${book.isbn} • Manage bibliographic record and physical accession barcodes` 
                    : 'Physical accession barcode is required for desk circulation and shelving'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Edit Mode Tabs Navigation */}
          {isEdit && (
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 shrink-0">
              <button
                type="button"
                onClick={() => { setActiveTab('details'); setError(''); setSuccessMsg(''); }}
                className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-bold border-b-2 transition ${
                  activeTab === 'details'
                    ? 'border-[#670047] text-[#670047] bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Bibliographic Details</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('copies'); setError(''); setSuccessMsg(''); }}
                className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-bold border-b-2 transition ${
                  activeTab === 'copies'
                    ? 'border-[#670047] text-[#670047] bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Physical Copies & Barcodes ({copies.length})</span>
              </button>
            </div>
          )}

          {/* Feedback Alerts */}
          {(error || successMsg) && (
            <div className="px-6 pt-4 shrink-0">
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2 text-rose-800 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* Scrollable Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">

            {/* TAB 1 / ADD MODE: Bibliographic Metadata Form */}
            {(activeTab === 'details' || !isEdit) && (
              <form id="book-form" onSubmit={handleSubmitBook} className="space-y-5">
                
                {/* Section Header */}
                <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#670047] pb-1 border-b border-slate-100">
                  <Tag className="w-4 h-4 text-[#ffcb00]" />
                  <span>1. Bibliographic & Classification Details</span>
                </div>

                {/* Title & ISBN */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Book Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Introduction to Database Systems"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#670047] font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ISBN <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="isbn"
                        value={formData.isbn}
                        onChange={handleInputChange}
                        placeholder="978-0133970777"
                        className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#670047]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => openScanner('isbn')}
                        title="Scan ISBN from back cover"
                        className="absolute right-2 top-2 text-slate-400 hover:text-[#670047] transition p-1"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Authors & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Author(s) <span className="text-slate-400 font-normal">(Comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      name="author_names"
                      value={formData.author_names}
                      onChange={handleInputChange}
                      placeholder="e.g. C. J. Date, Dr. S. Vimalan"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#670047]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Academic Discipline / Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#670047] bg-white font-medium"
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code ? `[${c.code}] ` : ''}{c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Call Number (Koha/DDC) & Shelf Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                      <span>Call Number (Koha / DDC)</span>
                      <span className="text-[10px] text-slate-500 font-normal">e.g. 005.133 JAV 2023</span>
                    </label>
                    <input
                      type="text"
                      name="call_number"
                      value={formData.call_number}
                      onChange={handleInputChange}
                      placeholder="005.74 DAT 2022"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono text-[#670047] font-bold focus:outline-none focus:ring-2 focus:ring-[#670047] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>Shelf / Stacks Location</span>
                    </label>
                    <input
                      type="text"
                      name="shelf_location"
                      value={formData.shelf_location}
                      onChange={handleInputChange}
                      placeholder="Rack CS-03, Level 2"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#670047] bg-white"
                    />
                  </div>
                </div>

                {/* Publisher, Year & Edition */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Publisher
                    </label>
                    <input
                      type="text"
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleInputChange}
                      placeholder="Pearson / McGraw-Hill"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#670047]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Publication Year
                    </label>
                    <input
                      type="number"
                      name="publication_year"
                      value={formData.publication_year}
                      onChange={handleInputChange}
                      placeholder="2024"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#670047]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Edition
                    </label>
                    <input
                      type="text"
                      name="edition"
                      value={formData.edition}
                      onChange={handleInputChange}
                      placeholder="8th Global Edition"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#670047]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Book Synopsis / Scope Notes
                  </label>
                  <textarea
                    name="description"
                    rows="2"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the textbook contents, target courses, and references..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#670047]"
                  ></textarea>
                </div>

                {/* REQUIRED PHYSICAL COPY SECTION (When adding a new book) */}
                {!isEdit && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-5 rounded-3xl border-2 border-[#ffcb00]/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#670047]">
                        <Barcode className="w-4 h-4 text-[#670047]" />
                        <span>2. Initial Physical Copy & Accession Barcode</span>
                      </div>
                      <span className="text-[10px] font-black uppercase bg-[#670047] text-[#ffcb00] px-2.5 py-0.5 rounded-full shadow-xs">
                        Barcode Required
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Every physical book in the library holdings must have a unique accession barcode attached for scanning at the circulation desk during checkout and returns.
                    </p>

                    {/* Barcode input with scan & auto-generate buttons */}
                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1">
                        Accession Number / Barcode <span className="text-rose-600">*</span>
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            name="accession_number"
                            value={formData.accession_number}
                            onChange={handleInputChange}
                            placeholder="e.g. UOV-BC-109284 or ACC-2024-001"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-black text-[#670047] focus:outline-none focus:ring-2 focus:ring-[#670047] bg-white shadow-xs"
                            required
                          />
                        </div>

                        {/* Scanner trigger button */}
                        <button
                          type="button"
                          onClick={() => openScanner('accession_number')}
                          className="bg-[#670047] hover:bg-[#4b0150] text-white px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-xs"
                        >
                          <Camera className="w-4 h-4 text-[#ffcb00]" />
                          <span>Scan Barcode</span>
                        </button>

                        {/* Auto-generate button */}
                        <button
                          type="button"
                          onClick={() => generateBarcode('accession_number')}
                          className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-xs"
                        >
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>Auto-Generate</span>
                        </button>
                      </div>
                    </div>

                    {/* Item type and condition */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Koha Item Type / Collection Code
                        </label>
                        <select
                          name="item_type"
                          value={formData.item_type}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white font-medium focus:ring-2 focus:ring-[#670047]"
                        >
                          {ITEM_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Initial Physical Condition
                        </label>
                        <select
                          name="condition"
                          value={formData.condition}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white font-medium focus:ring-2 focus:ring-[#670047]"
                        >
                          {CONDITIONS.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Copy Notes <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="copy_notes"
                        value={formData.copy_notes}
                        onChange={handleInputChange}
                        placeholder="e.g. Faculty donation, First acquisition batch"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#670047]"
                      />
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* TAB 2: Physical Copies & Barcodes (Edit Mode Only) */}
            {isEdit && activeTab === 'copies' && (
              <div className="space-y-6">

                {/* Add another copy form */}
                <div className="bg-amber-50/70 p-4 sm:p-5 rounded-3xl border border-[#ffcb00] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#670047] flex items-center space-x-1.5">
                      <Plus className="w-4 h-4 text-[#670047]" />
                      <span>Add Additional Physical Copy</span>
                    </h4>
                    <span className="text-[10px] font-black uppercase bg-[#670047] text-[#ffcb00] px-2 py-0.5 rounded-full">
                      Barcode Required
                    </span>
                  </div>

                  <form onSubmit={handleAddCopy} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Accession Number / Barcode <span className="text-rose-600">*</span>
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          name="accession_number"
                          value={newCopy.accession_number}
                          onChange={handleNewCopyChange}
                          placeholder="e.g. UOV-BC-948102"
                          className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-black text-[#670047] bg-white focus:ring-2 focus:ring-[#670047]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => openScanner('new_copy_accession')}
                          className="bg-[#670047] hover:bg-[#4b0150] text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 shadow-xs"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#ffcb00]" />
                          <span>Scan Barcode</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => generateBarcode('new_copy_accession')}
                          className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Auto-Gen</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Item Type
                        </label>
                        <select
                          name="item_type"
                          value={newCopy.item_type}
                          onChange={handleNewCopyChange}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                        >
                          {ITEM_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Condition
                        </label>
                        <select
                          name="condition"
                          value={newCopy.condition}
                          onChange={handleNewCopyChange}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                        >
                          {CONDITIONS.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={addingCopy}
                        className="bg-[#670047] hover:bg-[#4b0150] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition disabled:opacity-50"
                      >
                        {addingCopy ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        <span>Register Copy to Holdings</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Existing copies table / list */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
                    <span>Registered Physical Copies ({copies.length})</span>
                    <button
                      type="button"
                      onClick={() => fetchBookCopies(book.id)}
                      className="text-[#670047] hover:underline flex items-center space-x-1 text-[11px] font-bold"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Refresh</span>
                    </button>
                  </h4>

                  {loadingCopies ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#670047] border-t-transparent"></div>
                      <p className="text-xs text-slate-500 mt-2">Loading physical copies...</p>
                    </div>
                  ) : copies.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                      <p className="text-xs text-slate-500">No physical copies registered for this title yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                      {copies.map((copy) => (
                        <div key={copy.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                          
                          {/* Copy Info */}
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Barcode className="w-4 h-4 text-[#670047]" />
                              <span className="font-mono font-black text-sm text-[#670047]">
                                {copy.accession_number}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                copy.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                                copy.status === 'BORROWED' ? 'bg-amber-100 text-amber-800' :
                                copy.status === 'ON_HOLD' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {copy.status_display || copy.status}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                              <span>Type: <strong className="text-slate-700">{copy.item_type_display || copy.item_type}</strong></span>
                              <span>•</span>
                              <span>Condition: <strong className="text-slate-700">{copy.condition_display || copy.condition}</strong></span>
                              {copy.notes && (
                                <>
                                  <span>•</span>
                                  <span className="italic text-slate-500">"{copy.notes}"</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Quick Edit Actions */}
                          <div className="flex items-center space-x-2 shrink-0">
                            {/* Condition selector */}
                            <select
                              value={copy.condition}
                              onChange={(e) => handleUpdateCopy(copy.id, { condition: e.target.value })}
                              className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-semibold"
                              title="Update condition"
                            >
                              {CONDITIONS.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                              ))}
                            </select>

                            {/* Status selector (Disable for active borrowed copies) */}
                            <select
                              value={copy.status}
                              disabled={copy.status === 'BORROWED'}
                              onChange={(e) => handleUpdateCopy(copy.id, { status: e.target.value })}
                              className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-semibold disabled:opacity-50"
                              title={copy.status === 'BORROWED' ? 'Copy is checked out' : 'Update circulation status'}
                            >
                              {COPY_STATUSES.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                              ))}
                            </select>

                            {/* Delete copy button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteCopy(copy.id, copy.accession_number)}
                              disabled={copy.status === 'BORROWED'}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-30"
                              title={copy.status === 'BORROWED' ? 'Cannot delete borrowed copy' : 'Delete copy'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Danger Zone: Delete Entire Book Record */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h5 className="text-xs font-bold text-rose-900">Delete Bibliographic Record</h5>
                      <p className="text-[11px] text-rose-700">Permanently delete this book and its physical copies from the OPAC catalog.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeleteBook}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shrink-0 shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Book</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Footer Action Buttons */}
          <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
            >
              Cancel
            </button>

            {(activeTab === 'details' || !isEdit) && (
              <button
                type="submit"
                form="book-form"
                disabled={loading}
                className="bg-[#670047] hover:bg-[#4b0150] text-white px-6 py-2.5 rounded-xl text-xs font-black flex items-center space-x-2 transition shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Catalog Record...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#ffcb00]" />
                    <span>{isEdit ? 'Save Changes' : 'Catalog Book with Barcode'}</span>
                  </>
                )}
              </button>
            )}

            {isEdit && activeTab === 'copies' && (
              <button
                type="button"
                onClick={onClose}
                className="bg-[#670047] hover:bg-[#4b0150] text-white px-6 py-2.5 rounded-xl text-xs font-black transition shadow-md"
              >
                Done Managing Copies
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Barcode Scanner Modal Component */}
      {scannerOpen && (
        <QrBarcodeScanner
          title={
            scannerTarget === 'isbn'
              ? 'Scan Book ISBN Barcode'
              : 'Scan Physical Copy Accession Barcode'
          }
          onScan={handleScanResult}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </>
  );
}
