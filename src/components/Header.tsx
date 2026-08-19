import React, { useState } from 'react';
import {
  ShieldAlert,
  Sparkles,
  PlusCircle,
  Printer,
  LogIn,
  LogOut,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import { Ra01HazardReport, AuthUser } from '../types';

interface HeaderProps {
  hazards: Ra01HazardReport[];
  isRealtimeConnected: boolean;
  currentUser: AuthUser | null;
  onOpenNewHazard: () => void;
  onOpenAiAssistant: () => void;
  onOpenPrintAll: () => void;
  onLoginWithGoogle: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hazards,
  isRealtimeConnected,
  currentUser,
  onOpenNewHazard,
  onOpenAiAssistant,
  onOpenPrintAll,
  onLoginWithGoogle,
  onLogout,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-md shadow-red-500/20 ring-2 ring-amber-400/30 shrink-0">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-slate-100">
                  ระบบชี้บ่งอันตรายและประเมินความเสี่ยง
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 hidden sm:inline">
                  แบบฟอร์ม RA-01
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      isRealtimeConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span>
                    {isRealtimeConnected
                      ? 'Real-time Firebase Firestore เชื่อมต่อแล้ว'
                      : 'กำลังเชื่อมต่อฐานข้อมูล...'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons & Gmail Sign-In */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 1. AI ช่วยชี้บ่งอันตรายแฝง */}
            <button
              id="header-ai-assistant-btn"
              onClick={onOpenAiAssistant}
              className="group relative inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-600/20 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-yellow-300 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">AI ช่วยชี้บ่งอันตรายแฝง</span>
              <span className="md:hidden">AI วิเคราะห์</span>
            </button>

            {/* 2. บันทึกชี้บ่งอันตราย */}
            <button
              id="header-new-hazard-btn"
              onClick={onOpenNewHazard}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 stroke-[2.5]" />
              <span className="hidden sm:inline">บันทึกชี้บ่งอันตราย</span>
              <span className="sm:hidden">+ ชี้บ่ง</span>
            </button>

            {/* 3. พิมพ์รายงาน */}
            <button
              id="header-print-ra01-btn"
              onClick={onOpenPrintAll}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
              title="พิมพ์รายงาน"
            >
              <Printer className="h-4 w-4 text-slate-300" />
              <span className="hidden sm:inline">พิมพ์รายงาน</span>
            </button>

            {/* 4. Google / Gmail Sign In & User Profile */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-all cursor-pointer"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="h-7 w-7 rounded-lg object-cover ring-1 ring-amber-400/50"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                      {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                    </div>
                  )}
                  <div className="hidden lg:block text-left max-w-[120px] truncate">
                    <p className="font-semibold text-slate-100 truncate text-[11px] leading-tight">
                      {currentUser.displayName || currentUser.email}
                    </p>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <UserCheck className="h-2.5 w-2.5" /> เข้าสู่ระบบแล้ว
                    </p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white text-slate-800 shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        {currentUser.photoURL ? (
                          <img
                            src={currentUser.photoURL}
                            alt={currentUser.displayName || 'User'}
                            className="h-10 w-10 rounded-xl object-cover ring-2 ring-slate-100"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm">
                            {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {currentUser.displayName || 'ผู้ใช้งาน'}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {currentUser.email}
                          </p>
                        </div>
                      </div>

                      <div className="py-2 text-[11px] text-slate-600">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          บัญชี Google / Gmail ยืนยันแล้ว
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full mt-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>ออกจากระบบ (Logout)</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                id="header-login-gmail-btn"
                onClick={onLoginWithGoogle}
                className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer border border-slate-200"
                title="เข้าสู่ระบบด้วยบัญชี Google / Gmail"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="hidden sm:inline">เข้าสู่ระบบด้วย Gmail</span>
                <span className="sm:hidden">Gmail</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
