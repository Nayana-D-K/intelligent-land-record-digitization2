import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  UploadCloud,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import api from '../api';
import type { DocumentFilterOptions, DocumentStatus, DocType, SortField, SortOrder } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { useLanguage } from '../context/LanguageContext';

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();

  // Read initial filter from URL if present
  const initialStatus = (searchParams.get('status') as DocumentStatus) || 'ALL';

  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<DocumentStatus | 'ALL'>(initialStatus);
  const [docType, setDocType] = useState<DocType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<SortField>('uploaded_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Sync state if URL query param changes
  useEffect(() => {
    const urlStatus = searchParams.get('status') as DocumentStatus;
    if (urlStatus && urlStatus !== status) {
      setStatus(urlStatus);
    }
  }, [searchParams]);

  const filterParams: DocumentFilterOptions = {
    search: search.trim() || undefined,
    status,
    doc_type: docType,
    sortBy,
    sortOrder,
  };

  const {
    data: documents,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['documents', filterParams],
    queryFn: () => api.getDocuments(filterParams),
  });

  const handleSortChange = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getDocTypeLabel = (type: DocType) => {
    const map: Record<DocType, { en: string; kn: string }> = {
      RTC: { en: 'RTC (Pahani)', kn: 'ಆರ್‌ಟಿಸಿ (ಪಹಣಿ)' },
      SALE_DEED: { en: 'Sale Deed', kn: 'ಕ್ರಯಪತ್ರ' },
      ESTAMP: { en: 'e-Stamp', kn: 'ಇ-ಮುದ್ರಾಂಕ' },
      OTHER: { en: 'Other Record', kn: 'ಇತರ ದಾಖಲೆ' },
    };
    const item = map[type] || { en: type, kn: type };
    return language === 'kn' ? item.kn : item.en;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(language === 'kn' ? 'kn-IN' : 'en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {language === 'kn' ? 'ಭೂ ದಾಖಲೆಗಳ ಪಟ್ಟಿ' : 'Land Records Repository'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'kn'
              ? 'ಡಿಜಿಟಲೀಕರಿಸಲಾದ ಎಲ್ಲಾ ಭೂ ದಾಖಲೆಗಳು, ಒಸಿಆರ್ ಫಲಿತಾಂಶಗಳು ಮತ್ತು ಸ್ಥಿತಿ'
              : 'Browse, filter, and inspect digitized land records and extraction results.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{language === 'kn' ? 'ನವೀಕರಿಸಿ' : 'Refresh'}</span>
          </button>
          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{language === 'kn' ? 'ಹೊಸ ದಾಖಲೆ ಅಪ್‌ಲೋಡ್' : 'Upload New Document'}</span>
          </Link>
        </div>
      </div>

      {/* Controls Bar: Search, Status, Doc Type filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Search Input */}
        <div className="lg:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              language === 'kn'
                ? 'ದಾಖಲೆಯ ಹೆಸರು, ಐಡಿ ಅಥವಾ ಪ್ರಕಾರವನ್ನು ಹುಡುಕಿ...'
                : 'Search by filename, document ID, or type...'
            }
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Status Dropdown */}
        <div className="lg:col-span-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 shrink-0">Status:</span>
            <select
              value={status}
              onChange={(e) => {
                const newStatus = e.target.value as DocumentStatus | 'ALL';
                setStatus(newStatus);
                if (newStatus === 'ALL') {
                  searchParams.delete('status');
                  setSearchParams(searchParams);
                } else {
                  setSearchParams({ status: newStatus });
                }
              }}
              className="w-full text-xs sm:text-sm py-2 px-2.5 rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEEDS_REVIEW">Needs Review</option>
              <option value="VALIDATED">Validated</option>
              <option value="PROCESSING">Processing</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Document Type Dropdown */}
        <div className="lg:col-span-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 shrink-0">Type:</span>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocType | 'ALL')}
              className="w-full text-xs sm:text-sm py-2 px-2.5 rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">All Document Types</option>
              <option value="RTC">RTC (Pahani)</option>
              <option value="SALE_DEED">Sale Deed</option>
              <option value="ESTAMP">e-Stamp</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-md"></div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-rose-700">
              {error instanceof Error ? error.message : 'Failed to load documents'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 px-4 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : !documents || documents.length === 0 ? (
          <div className="p-12 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Documents Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {search || status !== 'ALL' || docType !== 'ALL'
                ? 'Try adjusting your search query or filter options.'
                : 'Get started by uploading your first land record document.'}
            </p>
            {(search || status !== 'ALL' || docType !== 'ALL') ? (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatus('ALL');
                  setDocType('ALL');
                  searchParams.delete('status');
                  setSearchParams(searchParams);
                }}
                className="mt-4 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Clear all filters
              </button>
            ) : (
              <Link
                to="/upload"
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] sm:text-xs uppercase tracking-wider select-none">
                <tr>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSortChange('filename')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Document</span>
                      {sortBy === 'filename' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4">Type</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSortChange('status')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      {sortBy === 'status' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSortChange('overall_confidence')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Confidence</span>
                      {sortBy === 'overall_confidence' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSortChange('uploaded_at')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Uploaded Date</span>
                      {sortBy === 'uploaded_at' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => navigate(`/documents/${doc.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    {/* File / ID */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition truncate max-w-xs">
                            {doc.filename}
                          </p>
                          <p className="text-[11px] font-mono text-slate-600">
                            {doc.id} • {doc.page_count} {doc.page_count === 1 ? 'page' : 'pages'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs">
                        {getDocTypeLabel(doc.doc_type)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <StatusBadge status={doc.status} size="sm" />
                    </td>

                    {/* Overall Confidence */}
                    <td className="py-3 px-4">
                      {doc.status === 'PROCESSING' ? (
                        <span className="text-xs text-slate-400 italic">Calculating...</span>
                      ) : (
                        <ConfidenceBadge confidence={doc.overall_confidence} size="sm" />
                      )}
                    </td>

                    {/* Upload Date */}
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {formatDate(doc.uploaded_at)}
                    </td>

                    {/* Review Button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/documents/${doc.id}`);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition"
                      >
                        <span>Review</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
