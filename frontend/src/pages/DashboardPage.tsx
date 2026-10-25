import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  RefreshCw,
  UploadCloud,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';

export const DashboardPage: React.FC = () => {
  const { language } = useLanguage();

  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.getStats(),
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-96 mb-6"></div>

        {/* Card skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>

        {/* Chart & Failures skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200 rounded-xl"></div>
          <div className="h-80 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 max-w-7xl mx-auto w-full">
        <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-center max-w-lg mx-auto my-12">
          <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-rose-900">Failed to load analytics</h3>
          <p className="text-sm text-rose-700 mt-1 mb-4">
            {error instanceof Error ? error.message : 'Unknown error occurred while fetching system statistics.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Query
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 max-w-7xl mx-auto w-full text-center py-16">
        <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Analytics Data Available</h3>
        <p className="text-sm text-slate-500 mt-1">Upload documents to generate extraction and validation stats.</p>
        <Link
          to="/upload"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm"
        >
          <UploadCloud className="w-4 h-4" />
          Upload Record
        </Link>
      </div>
    );
  }

  // Format chart data
  const chartData = [
    {
      name: language === 'kn' ? 'ಪರಿಶೀಲನೆ ಬಾಕಿ' : 'Needs Review',
      key: 'NEEDS_REVIEW',
      count: stats.status_counts.NEEDS_REVIEW || 0,
      color: '#f59e0b', // amber-500
    },
    {
      name: language === 'kn' ? 'ದೃಢೀಕರಿಸಲಾಗಿದೆ' : 'Validated',
      key: 'VALIDATED',
      count: stats.status_counts.VALIDATED || 0,
      color: '#16a34a', // emerald-600
    },
    {
      name: language === 'kn' ? 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ' : 'Rejected',
      key: 'REJECTED',
      count: stats.status_counts.REJECTED || 0,
      color: '#f43f5e', // rose-500
    },
    {
      name: language === 'kn' ? 'ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ' : 'Processing',
      key: 'PROCESSING',
      count: stats.status_counts.PROCESSING || 0,
      color: '#3b82f6', // blue-500
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {language === 'kn' ? 'ವ್ಯವಸ್ಥೆಯ ಅಂಕಿಅಂಶ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : 'System Analytics Dashboard'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'kn'
              ? 'ಭೂ ಕಂದಾಯ ದಾಖಲೆಗಳ ಡಿಜಿಟಲೀಕರಣ, ಒಸಿಆರ್ ನಿಖರತೆ ಮತ್ತು ನಿಯಮ ಪರಿಶೀಲನೆ ಸಾರಾಂಶ'
              : 'Real-time overview of document digitization throughput, OCR confidence & rule validation.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{language === 'kn' ? 'ನವೀಕರಿಸಿ' : 'Refresh'}</span>
          </button>
          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{language === 'kn' ? 'ದಾಖಲೆ ಸೇರಿಸಿ' : 'Upload Record'}</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <Link
          to="/documents"
          className="group p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'kn' ? 'ಒಟ್ಟು ದಾಖಲೆಗಳು' : 'Total Documents'}
            </span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-200 transition">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.total}</div>
            <span className="text-xs text-slate-400 group-hover:text-emerald-700 inline-flex items-center gap-0.5 font-medium transition">
              View all <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Needs Review */}
        <Link
          to="/documents?status=NEEDS_REVIEW"
          className="group p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-sm transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              {language === 'kn' ? 'ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ' : 'Needs Review'}
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-bold text-amber-900">{stats.needs_review}</div>
            <span className="text-xs text-amber-600 font-medium inline-flex items-center gap-0.5">
              Pending action <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Validated */}
        <Link
          to="/documents?status=VALIDATED"
          className="group p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-sm transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              {language === 'kn' ? 'ದೃಢೀಕರಿಸಲಾಗಿದೆ' : 'Validated'}
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-900">{stats.validated}</div>
            <span className="text-xs text-emerald-600 font-medium inline-flex items-center gap-0.5">
              Verified records <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Average Confidence */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'kn' ? 'ಸರಾಸರಿ ನಿಖರತೆ' : 'Avg OCR Confidence'}
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              {Math.round(stats.avg_confidence * 100)}%
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded font-semibold ${
                stats.avg_confidence >= 0.85
                  ? 'bg-emerald-100 text-emerald-800'
                  : stats.avg_confidence >= 0.70
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {stats.avg_confidence >= 0.85 ? 'High Quality' : 'Acceptable'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Failure list section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {language === 'kn' ? 'ಸ್ಥಿತಿ ಪ್ರಕಾರ ದಾಖಲೆಗಳು' : 'Documents by Processing Status'}
              </h3>
              <p className="text-xs text-slate-500">Distribution of repository records</p>
            </div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 20, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded shadow-lg border border-slate-800">
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-slate-300 mt-0.5">
                            Count: <span className="text-white font-bold">{item.count}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Common Validation Failures */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                {language === 'kn' ? 'ಸಾಮಾನ್ಯ ನಿಯಮ ವೈಫಲ್ಯಗಳು' : 'Common Validation Failures'}
              </h3>
              <p className="text-xs text-slate-500">Unresolved rule checks requiring attention</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {stats.common_validation_failures && stats.common_validation_failures.length > 0 ? (
              stats.common_validation_failures.map((item) => (
                <div
                  key={item.rule_id}
                  className="p-3 rounded-lg border border-rose-100 bg-rose-50/50 hover:bg-rose-50 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-rose-900">
                      {item.rule_id}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
                      {item.count} {item.count === 1 ? 'doc' : 'docs'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No Validation Failures</p>
                <p className="text-xs text-slate-500 mt-0.5">All active documents pass sanity checks.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              to="/documents?status=NEEDS_REVIEW"
              className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <span>{language === 'kn' ? 'ಪರಿಶೀಲನೆಗೆ ತೆರಳಿ' : 'Review Low Confidence Records'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
