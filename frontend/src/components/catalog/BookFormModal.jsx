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
  BookOpen,
  ArrowRight,
  Copy
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

export default function BookFormModal({ book = null, categories = [], customFields = [], initialTab = 'details', onClose, onSuccess }) {
  const isEdit = Boolean(book);
  const [activeTab, setActiveTab] = useState(isEdit && initialTab === 'copies' ? 'copies' : 'details'); // 'details' | 'copies'

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
    custom_fields: {},
  });

  // Multiple initial physical copies state (For Add Book Mode)
  const [initialCopies, setInitialCopies] = useState([
    {
      id: 1,
      accession_number: '',
      item_type: 'STANDARD',
      condition: 'GOOD',
      copy_notes: '',
    }
  ]);

  // State for copies in edit mode
  const [copies, setCopies] = useState([]);
  const [loadingCopies, setLoadingCopies] = useState(false);

  // New copy form state (when in edit mode - Single Copy)
  const [newCopy, setNewCopy] = useState({
    accession_number: '',
    item_type: 'STANDARD',
    condition: 'GOOD',
    notes: '',
  });
  const [addingCopy, setAddingCopy] = useState(false);

  // Batch Add in Edit mode state
  const [showBatchEditAdd, setShowBatchEditAdd] = useState(false);
  const [batchEditCount, setBatchEditCount] = useState(3);
  const [batchEditItemType, setBatchEditItemType] = useState('STANDARD');
  const [batchEditCondition, setBatchEditCondition] = useState('GOOD');
  const [batchEditLoading, setBatchEditLoading] = useState(false);

  // General state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Scanner modal state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState('isbn'); // 'isbn' | 'new_copy_accession' | 'initial_copy_0', etc.

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
          custom_fields: book.custom_fields || {},
      });
      fetchBookCopies(book.id);
    }
  }, [book]);

  const fetchBookCopies = async (bookId) => {
    setLoadingCopies(true);
    try {
      const res = await api.get(`/catalog/copies/?book=${bookId}`);
      setCopies(res.data.results || res.data || []);
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

  // --- Initial Copies Handlers (Add Mode) ---
  const handleInitialCopyChange = (index, field, value) => {
    setInitialCopies(prev => prev.map((copy, i) => i === index ? { ...copy, [field]: value } : copy));
    setError('');
  };

  const handleAddInitialCopyRow = () => {
    if (initialCopies.length >= 50) {
      setError('You can add up to 50 copies at once in a single catalog batch.');
      return;
    }
    const nextId = initialCopies.length > 0 ? Math.max(...initialCopies.map(c => c.id || 0)) + 1 : 1;
    const last = initialCopies[initialCopies.length - 1];
    setInitialCopies(prev => [
      ...prev,
      {
        id: nextId,
        accession_number: '',
        item_type: last ? last.item_type : 'STANDARD',
        condition: last ? last.condition : 'GOOD',
        copy_notes: '',
      }
    ]);
  };

  const handleSetCopyCount = (count) => {
    const target = Math.max(1, Math.min(50, parseInt(count) || 1));
    setInitialCopies(prev => {
      if (prev.length === target) return prev;
      if (prev.length < target) {
        const added = [];
        let baseId = prev.length > 0 ? Math.max(...prev.map(c => c.id || 0)) + 1 : 1;
        const last = prev[prev.length - 1];
        for (let i = prev.length; i < target; i++) {
          added.push({
            id: baseId++,
            accession_number: '',
            item_type: last ? last.item_type : 'STANDARD',
            condition: last ? last.condition : 'GOOD',
            copy_notes: '',
          });
        }
        return [...prev, ...added];
      } else {
        return prev.slice(0, target);
      }
    });
  };

  const handleRemoveInitialCopyRow = (index) => {
    if (initialCopies.length <= 1) return;
    setInitialCopies(prev => prev.filter((_, i) => i !== index));
  };

  const generateBarcodeForInitialCopy = (index) => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const barcode = `UOV-BC-${randomNum}`;
    setInitialCopies(prev => prev.map((c, i) => i === index ? { ...c, accession_number: barcode } : c));
  };

  const generateAllInitialBarcodes = () => {
    const baseNum = Math.floor(100000 + Math.random() * 800000);
    setInitialCopies(prev => prev.map((c, i) => ({
      ...c,
      accession_number: c.accession_number.trim() ? c.accession_number : `UOV-BC-${baseNum + i}`
    })));
  };

  // --- Barcode Generators ---
  const generateBarcode = (target) => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const barcode = `UOV-BC-${randomNum}`;
    if (target === 'new_copy_accession') {
      setNewCopy(prev => ({ ...prev, accession_number: barcode }));
    }
  };

  // --- Scanner Handlers ---
  const handleScanResult = (scannedText) => {
    if (scannerTarget === 'isbn') {
      setFormData(prev => ({ ...prev, isbn: scannedText }));
    } else if (scannerTarget === 'new_copy_accession') {
      setNewCopy(prev => ({ ...prev, accession_number: scannedText }));
    } else if (scannerTarget.startsWith('initial_copy_')) {
      const idx = parseInt(scannerTarget.replace('initial_copy_', ''), 10);
      if (!isNaN(idx)) {
        setInitialCopies(prev => prev.map((c, i) => i === idx ? { ...c, accession_number: scannedText } : c));
      }
    }
  };

  const openScanner = (target) => {
    setScannerTarget(target);
    setScannerOpen(true);
  };

  // --- Submit Main Book Form (Add or Edit) ---
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

    // For Add Mode: validate that all initial copies have unique barcodes
    if (!isEdit) {
      if (initialCopies.length === 0) {
        setError('At least 1 physical copy with an accession barcode is required to catalog a book.');
        return;
      }
      for (let i = 0; i < initialCopies.length; i++) {
        if (!initialCopies[i].accession_number.trim()) {
          setError(`Accession Barcode is required for Copy #${i + 1}.`);
          return;
        }
      }
      const barcodes = initialCopies.map(c => c.accession_number.trim().toLowerCase());
      const duplicates = barcodes.filter((item, index) => barcodes.indexOf(item) !== index);
      if (duplicates.length > 0) {
        setError(`Duplicate barcode entered: "${duplicates[0]}". Each physical copy must have a unique barcode.`);
        return;
      }
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
      payload.initial_copies = initialCopies.map(c => ({
        accession_number: c.accession_number.trim(),
        item_type: c.item_type,
        condition: c.condition,
        notes: c.copy_notes ? c.copy_notes.trim() : '',
      }));
    }

    try {
      if (isEdit) {
        const res = await api.put(`/catalog/books/${book.id}/`, payload);
        setSuccessMsg('Book metadata updated successfully!');
        if (onSuccess) onSuccess(res.data);
      } else {
        const res = await api.post('/catalog/books/', payload);
        setSuccessMsg(`Book successfully cataloged with ${initialCopies.length} physical copies!`);
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

  // --- Add a Single Copy to existing book (in Edit mode) ---
  const handleAddSingleCopy = async (e) => {
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
      setSuccessMsg(`Physical copy [${newCopy.accession_number.trim()}] added successfully!`);
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

  // --- Batch Add Copies to existing book (in Edit mode) ---
  const handleBatchAddCopiesInEdit = async () => {
    const count = Math.max(1, Math.min(25, parseInt(batchEditCount) || 1));
    setBatchEditLoading(true);
    setError('');
    const baseNum = Math.floor(100000 + Math.random() * 800000);
    
    let addedCount = 0;
    try {
      for (let i = 0; i < count; i++) {
        const barcode = `UOV-BC-${baseNum + i}`;
        await api.post('/catalog/copies/', {
          book: book.id,
          accession_number: barcode,
          item_type: batchEditItemType,
          condition: batchEditCondition,
          notes: `Batch addition of ${count} copies`,
        });
        addedCount++;
      }
      setSuccessMsg(`Successfully registered ${addedCount} new physical copies to "${book.title}"!`);
      setShowBatchEditAdd(false);
      fetchBookCopies(book.id);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(`Added ${addedCount} copies before encountering an error: ${err.response?.data?.accession_number || 'Duplicate barcode'}`);
      fetchBookCopies(book.id);
    } finally {
      setBatchEditLoading(false);
    }
  };

  // --- Update copy condition or status ---
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

  // --- Delete physical copy ---
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
      alert(err.response?.data?.error || 'Cannot delete copy (it may be checked out or linked to an active loan).');
    }
  };

  // --- Delete entire book ---
  const handleDeleteBook = async () => {
    if (!window.confirm(`DANGER: Are you sure you want to permanently delete "${book.title}" and ALL its physical copies? This action cannot be undone.`)) {
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
          
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-[#670047] via-[#4b0150] to-[#1b3058] text-white p-5 sm:p-6 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ffcb00] text-[#4b0150] flex items-center justify-center font-bold shadow-md">
                {isEdit ? <Edit3 className="w-5 h-5" /> : <BookPlus className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight leading-tight">
                  {isEdit ? `Edit Catalog: ${book.title}` : 'Catalog New Book & Physical Copies'}
                </h2>
                <p className="text-xs text-slate-200 mt-0.5">
                  {isEdit 
                    ? `ISBN: ${book.isbn} • Manage bibliographic record and add or modify copies` 
                    : 'Add 1 or multiple physical copies with unique barcodes in a single step'}
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
                <span>1. Bibliographic Record</span>
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
                <span>2. Physical Copies & Barcodes ({copies.length})</span>
                <span className="bg-[#670047] text-[#ffcb00] text-[10px] font-black px-2 py-0.5 rounded-full ml-1">
                  + Add Copies
                </span>
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

            {/* TAB 1: BIBLIOGRAPHIC DETAILS FORM (Add Mode or Edit Mode) */}
            {(activeTab === 'details' || !isEdit) && (
              <form id="book-form" onSubmit={handleSubmitBook} className="space-y-6">
                
                {/* Edit Mode Notice Banner linking to Copies Tab */}
                {isEdit && (
                  <div className="bg-[#fff9e6] border-2 border-[#ffcb00] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-[#670047] text-[#ffcb00] flex items-center justify-center font-bold shrink-0">
                        <Barcode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-[#670047]">
                          Physical Holdings: {copies.length} {copies.length === 1 ? 'Copy' : 'Copies'} Registered
                        </div>
                        <div className="text-[11px] text-slate-600">
                          Want to add more physical copies with barcodes to this book?
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('copies'); setError(''); setSuccessMsg(''); }}
                      className="bg-[#670047] hover:bg-[#4b0150] text-[#ffcb00] px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 transition shadow-xs whitespace-nowrap"
                    >
                      <span>Manage & Add Copies</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Section 1 Header */}
                <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#670047] pb-1 border-b border-slate-100">
                  <Tag className="w-4 h-4 text-[#ffcb00]" />
                  <span>1. Bibliographic & Classification Metadata</span>
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
                      placeholder="e.g. Operating System Concepts"
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
                      placeholder="Abraham Silberschatz, Peter B. Galvin"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#670047]"
                    >
                      <option value="">Select Academic Discipline</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Call Number & Shelf Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      <span>Dewey / Library Call Number</span>
                    </label>
                    <input
                      type="text"
                      name="call_number"
                      value={formData.call_number}
                      onChange={handleInputChange}
                      placeholder="005.43 SIL 2023"
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
                      placeholder="Rack CS-04, Level 2"
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
                      placeholder="Wiley / Pearson"
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
                      placeholder="10th Edition"
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
                    placeholder="Brief description of the textbook contents, target academic units, and curriculum..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#670047]"
                  ></textarea>
                </div>

                {/* MULTI-COPY PHYSICAL HOLDINGS SECTION (When Adding a New Book) */}
                {!isEdit && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-5 rounded-3xl border-2 border-[#ffcb00]/80 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#670047]">
                        <Barcode className="w-4 h-4 text-[#670047]" />
                        <span>2. Physical Copies & Accession Barcodes ({initialCopies.length} {initialCopies.length === 1 ? 'Copy' : 'Copies'})</span>
                      </div>
                      <span className="text-[10px] font-black uppercase bg-[#670047] text-[#ffcb00] px-2.5 py-0.5 rounded-full shadow-xs w-max">
                        Barcodes Required
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      You can add as many physical copies as you have (e.g. 1 to 50 copies). Each copy must have a unique accession barcode attached for scanning at the circulation desk.
                    </p>

                    {/* Quick Batch Controls Toolbar */}
                    <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-700">Number of Copies:</span>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 5, 10].map(cnt => (
                            <button
                              key={cnt}
                              type="button"
                              onClick={() => handleSetCopyCount(cnt)}
                              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
                                initialCopies.length === cnt
                                  ? 'bg-[#670047] text-[#ffcb00] shadow-xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {cnt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={generateAllInitialBarcodes}
                          className="bg-amber-100 hover:bg-amber-200 text-[#4b0150] border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition shadow-2xs"
                          title="Generate sequential barcodes for all copies"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Auto-Generate All Barcodes</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleAddInitialCopyRow}
                          className="bg-[#670047] hover:bg-[#4b0150] text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1 transition shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#ffcb00]" />
                          <span>+ Add Copy</span>
                        </button>
                      </div>
                    </div>

                    {/* Copy Input Cards List */}
                    <div className="space-y-3">
                      {initialCopies.map((copy, index) => (
                        <div
                          key={copy.id || index}
                          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 transition hover:border-[#670047]/40"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="w-6 h-6 rounded-full bg-[#670047] text-[#ffcb00] text-[11px] font-black flex items-center justify-center">
                                {index + 1}
                              </span>
                              <span className="text-xs font-black text-slate-800">
                                Physical Copy #{index + 1}
                              </span>
                            </div>

                            {initialCopies.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveInitialCopyRow(index)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                                title="Remove this copy"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Barcode input row with Scan and Auto-Gen */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={copy.accession_number}
                                onChange={(e) => handleInitialCopyChange(index, 'accession_number', e.target.value)}
                                placeholder={`e.g. UOV-BC-${100000 + index + 1}`}
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-black text-[#670047] bg-white focus:ring-2 focus:ring-[#670047]"
                                required
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => openScanner(`initial_copy_${index}`)}
                              className="bg-[#670047] hover:bg-[#4b0150] text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-2xs"
                              title="Scan with Camera"
                            >
                              <Camera className="w-3.5 h-3.5 text-[#ffcb00]" />
                              <span>Scan</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => generateBarcodeForInitialCopy(index)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition"
                              title="Auto-generate single barcode"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>Auto-Gen</span>
                            </button>
                          </div>

                          {/* Item Type & Condition */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Item Type / Circulation Policy
                              </label>
                              <select
                                value={copy.item_type}
                                onChange={(e) => handleInitialCopyChange(index, 'item_type', e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                              >
                                {ITEM_TYPES.map(t => (
                                  <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Physical Condition
                              </label>
                              <select
                                value={copy.condition}
                                onChange={(e) => handleInitialCopyChange(index, 'condition', e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                              >
                                {CONDITIONS.map(c => (
                                  <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleAddInitialCopyRow}
                        className="text-xs font-black text-[#670047] hover:underline flex items-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Add Another Physical Copy ({initialCopies.length + 1})</span>
                      </button>

                      <span className="text-[11px] font-bold text-slate-500">
                        Total {initialCopies.length} {initialCopies.length === 1 ? 'copy' : 'copies'} will be registered
                      </span>
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* TAB 2: PHYSICAL COPIES & BARCODES (Edit Mode Only) */}
            {isEdit && activeTab === 'copies' && (
              <div className="space-y-6">

                {/* Add new copy section header with single/batch toggle */}
                <div className="bg-amber-50/70 p-4 sm:p-5 rounded-3xl border border-[#ffcb00] shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#670047] flex items-center space-x-1.5">
                        <Plus className="w-4 h-4 text-[#670047]" />
                        <span>Add New Physical Copies to "{book.title}"</span>
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Register new incoming copies with accession barcodes into the library holdings.
                      </p>
                    </div>

                    {/* Toggle Single vs Batch */}
                    <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-amber-300 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowBatchEditAdd(false)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          !showBatchEditAdd
                            ? 'bg-[#670047] text-[#ffcb00]'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Single Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowBatchEditAdd(true)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          showBatchEditAdd
                            ? 'bg-[#670047] text-[#ffcb00]'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Batch Add
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: Single Copy Add Form */}
                  {!showBatchEditAdd ? (
                    <form onSubmit={handleAddSingleCopy} className="space-y-3 pt-1">
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
                            className="bg-[#670047] hover:bg-[#4b0150] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-2xs"
                          >
                            <Camera className="w-3.5 h-3.5 text-[#ffcb00]" />
                            <span>Scan</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => generateBarcode('new_copy_accession')}
                            className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-2xs"
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
                          className="bg-[#670047] hover:bg-[#4b0150] text-white px-5 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-sm transition disabled:opacity-50"
                        >
                          {addingCopy ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-[#ffcb00]" />
                          )}
                          <span>Register New Copy</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Mode 2: Batch Add Multiple Copies Form */
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Quantity to Add
                          </label>
                          <select
                            value={batchEditCount}
                            onChange={(e) => setBatchEditCount(parseInt(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-bold text-slate-900"
                          >
                            {[2, 3, 5, 10, 15, 20].map(n => (
                              <option key={n} value={n}>{n} Copies</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Item Type
                          </label>
                          <select
                            value={batchEditItemType}
                            onChange={(e) => setBatchEditItemType(e.target.value)}
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
                            value={batchEditCondition}
                            onChange={(e) => setBatchEditCondition(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                          >
                            {CONDITIONS.map(c => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-600">
                          Auto-generates sequential unique barcodes (e.g. <code>UOV-BC-XXXXXX</code>).
                        </span>
                        <button
                          type="button"
                          onClick={handleBatchAddCopiesInEdit}
                          disabled={batchEditLoading}
                          className="bg-[#670047] hover:bg-[#4b0150] text-white px-5 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-sm transition disabled:opacity-50"
                        >
                          {batchEditLoading ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-[#ffcb00]" />
                          )}
                          <span>Generate & Register {batchEditCount} Copies</span>
                        </button>
                      </div>
                    </div>
                  )}
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
                      <span>Refresh Holdings</span>
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
                    <span>
                      {isEdit 
                        ? 'Save Bibliographic Changes' 
                        : `Catalog Book with ${initialCopies.length} ${initialCopies.length === 1 ? 'Copy' : 'Copies'}`}
                    </span>
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
                Done / Close
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Barcode Scanner Modal */}
      {scannerOpen && (
        <QrBarcodeScanner
          title="Scan Physical Book Barcode"
          instruction="Align the accession barcode or ISBN inside the camera viewfinder."
          onScan={(code) => {
            handleScanResult(code);
            setScannerOpen(false);
          }}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </>
  );
}


