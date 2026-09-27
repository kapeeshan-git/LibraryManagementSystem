import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Download, 
  UploadCloud, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  Lock, 
  Globe, 
  Filter 
} from 'lucide-react';

export default function RepositoryPage() {
  const { user, isAuthenticated, isStaff, isLecturer } = useAuth();
  const [papers, setPapers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [reviewModalPaper, setReviewModalPaper] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [authorsDisplay, setAuthorsDisplay] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState('');
  const [doi, setDoi] = useState('');
  const [journal, setJournal] = useState('');
  const [accessType, setAccessType] = useState('OPEN_ACCESS');
  const [file, setFile] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Review State
  const [reviewStatus, setReviewStatus] = useState('APPROVED');
  const [reviewComments, setReviewComments] = useState('');

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/repository/papers/?q=${encodeURIComponent(search)}`);
      setPapers(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setFormError('Please select a PDF document.');
      return;
    }
    setFormLoading(true);
    setFormError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('authors_display', authorsDisplay);
    formData.append('abstract', abstract);
    formData.append('keywords', keywords);
    formData.append('doi', doi);
    formData.append('journal_or_conference', journal);
    formData.append('access_type', accessType);
    formData.append('file', file);

    try {
      await api.post('/repository/papers/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadModalOpen(false);
      resetForm();
      fetchPapers();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to submit research paper.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewModalPaper) return;
    setFormLoading(true);

    try {
      await api.post(`/repository/papers/${reviewModalPaper.id}/review/`, {
        status: reviewStatus,
        review_comments: reviewComments
      });
      setReviewModalPaper(null);
      fetchPapers();
    } catch (err) {
      alert('Failed to submit review.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDownload = (paperId, fileName) => {
    window.open(`/api/repository/papers/${paperId}/download/`, '_blank');
  };

  const resetForm = () => {
    setTitle('');
    setAuthorsDisplay('');
    setAbstract('');
    setKeywords('');
    setDoi('');
    setJournal('');
    setFile(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 mb-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">Institutional Archive</span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Research Publications Repository</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Explore university pre-prints, conference proceedings, and faculty journal papers with open and campus-only distribution.
          </p>
        </div>

        {(isLecturer || isStaff) && (
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md transition"
          >
            <UploadCloud className="w-5 h-5" />
            <span>Submit Research Paper</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPapers()}
            placeholder="Search papers by title, author name, abstract, or DOI..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <button
          onClick={fetchPapers}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition"
        >
          Search
        </button>
      </div>

      {/* Papers List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-slate-500">Loading publications...</p>
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-base">No research publications found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {papers.map((paper) => (
            <div
              key={paper.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                    paper.access_type === 'OPEN_ACCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {paper.access_type === 'OPEN_ACCESS' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    <span>{paper.access_type_display}</span>
                  </span>

                  {isStaff && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      paper.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      paper.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      Status: {paper.status_display}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">{paper.title}</h3>
                <div className="text-xs text-slate-600 mt-1 font-medium">
                  {paper.authors_display} • Dept: {paper.lecturer_department || 'Faculty of Applied Science'}
                </div>

                {paper.journal_or_conference && (
                  <div className="text-xs text-slate-500 italic mt-0.5">
                    Published in: {paper.journal_or_conference} {paper.doi && `(DOI: ${paper.doi})`}
                  </div>
                )}

                <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                  {paper.abstract}
                </p>

                {paper.keywords && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {paper.keywords.split(',').map((kw, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        #{kw.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex md:flex-col justify-end items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[160px]">
                <button
                  onClick={() => handleDownload(paper.id, paper.title)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <div className="text-[11px] text-slate-400">
                  {paper.download_count} total downloads
                </div>

                {isStaff && paper.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      setReviewModalPaper(paper);
                      setReviewStatus('APPROVED');
                      setReviewComments('');
                    }}
                    className="mt-2 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 transition"
                  >
                    Review Submission
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD PAPER MODAL */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Submit Academic Publication</h2>
            <p className="text-xs text-slate-500 mb-4">Upload research paper for library peer cataloging and archiving.</p>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-800 text-xs rounded-lg border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Paper Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Authors Citation Line *</label>
                <input
                  type="text"
                  required
                  value={authorsDisplay}
                  onChange={(e) => setAuthorsDisplay(e.target.value)}
                  placeholder="e.g. Dr. S. Kanapathipillai, V. Kapeeshan"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Abstract *</label>
                <textarea
                  rows="3"
                  required
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Keywords</label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="AI, Databases, Networks"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">DOI (Optional)</label>
                  <input
                    type="text"
                    value={doi}
                    onChange={(e) => setDoi(e.target.value)}
                    placeholder="10.1145/..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Access Type</label>
                  <select
                    value={accessType}
                    onChange={(e) => setAccessType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="OPEN_ACCESS">Open Access (Public)</option>
                    <option value="CAMPUS_ONLY">Campus-Only (Restricted)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">PDF File *</label>
                  <input
                    type="file"
                    required
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold text-slate-600 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-emerald-600 rounded-lg font-semibold text-white hover:bg-emerald-700 shadow"
                >
                  {formLoading ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIBRARIAN REVIEW MODAL */}
      {reviewModalPaper && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Peer Review Research Paper</h2>
            <div className="text-xs text-slate-600 mb-4 font-semibold">{reviewModalPaper.title}</div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Review Decision</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="APPROVED">Approve & Publish to Repository</option>
                  <option value="EDITS_REQUESTED">Request Revisions from Author</option>
                  <option value="REJECTED">Reject Paper</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Review Notes / Feedback</label>
                <textarea
                  rows="3"
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Provide comments or citation feedback for the faculty member..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalPaper(null)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold text-slate-600 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-slate-900 rounded-lg font-semibold text-white hover:bg-slate-800 shadow"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
