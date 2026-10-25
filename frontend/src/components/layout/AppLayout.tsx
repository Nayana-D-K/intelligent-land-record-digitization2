import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  BarChart3,
  Languages,
  Menu,
  X,
  FileCheck,
  Database,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AppLayout: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMock = import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === true;

  const navItems = [
    {
      to: '/upload',
      labelEn: 'Upload Records',
      labelKn: 'ದಾಖಲೆ ಅಪ್‌ಲೋಡ್',
      icon: UploadCloud,
    },
    {
      to: '/documents',
      labelEn: 'Documents Repository',
      labelKn: 'ದಾಖಲೆಗಳ ಪಟ್ಟಿ',
      icon: FileText,
    },
    {
      to: '/dashboard',
      labelEn: 'System Dashboard',
      labelKn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Emblem / Branding */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold shadow-sm">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    Intelligent Land Record Digitization
                  </h1>
                  {isMock && (
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                      Mock Mode
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {language === 'kn'
                    ? 'ಕರ್ನಾಟಕ ಕಂದಾಯ ಇಲಾಖೆ — ಭೂ ದಾಖಲೆಗಳ ಪರಿಶೀಲನಾ ವ್ಯವಸ್ಥೆ'
                    : 'Karnataka Revenue Dept • Automated OCR & Validation System'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
              title="Toggle English / Kannada (ಕನ್ನಡ)"
            >
              <Languages className="w-4 h-4 text-emerald-600" />
              <span>{language === 'en' ? 'ಕನ್ನಡ (KN)' : 'English (EN)'}</span>
            </button>

            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Nav Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-200 flex flex-col transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 pt-16 lg:pt-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-0 lg:translate-x-0 hidden lg:flex'
          }`}
        >
          {/* Section Label */}
          <div className="px-4 pt-6 pb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              Navigation
            </span>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{language === 'kn' ? item.labelKn : item.labelEn}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Info card */}
          <div className="p-4 m-3 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-slate-300 font-semibold mb-1">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bhoomi Integration</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Standardized OCR pipeline with CER/WER validation & automated rule checks.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

