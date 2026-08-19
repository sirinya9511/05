import React from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { Ra01HazardReport, RiskLevel, HazardStatus } from '../types';

interface RealtimeDashboardProps {
  hazards: Ra01HazardReport[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onOpenCriticalHazard: (hazard: Ra01HazardReport) => void;
  onOpenAiAssistant: () => void;
}

export const RealtimeDashboard: React.FC<RealtimeDashboardProps> = ({
  hazards,
  activeFilter,
  onFilterChange,
  onOpenCriticalHazard,
  onOpenAiAssistant,
}) => {
  const totalHazards = hazards.length;
  const criticalHazards = hazards.filter(
    (h) => h.initialRiskLevel === 'critical' && h.status !== 'resolved' && h.status !== 'verified'
  );
  const highHazards = hazards.filter(
    (h) => h.initialRiskLevel === 'high' && h.status !== 'resolved' && h.status !== 'verified'
  );
  const inProgressHazards = hazards.filter(
    (h) => h.status === 'in_progress' || h.status === 'investigating'
  );
  const resolvedHazards = hazards.filter(
    (h) => h.status === 'resolved' || h.status === 'verified'
  );

  // Unforeseen hazards count
  const unforeseenCount = hazards.filter((h) => {
    try {
      if (!h.unforeseenHazards) return false;
      const parsed = JSON.parse(h.unforeseenHazards);
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return h.unforeseenHazards.length > 10;
    }
  }).length;

  const resolutionRate = totalHazards > 0 ? Math.round((resolvedHazards.length / totalHazards) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: Total Reports */}
        <button
          onClick={() => onFilterChange('all')}
          className={`p-4 rounded-2xl text-left border transition-all ${
            activeFilter === 'all'
              ? 'bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-slate-900/20'
              : 'bg-white border-slate-200/80 text-slate-900 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${activeFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
              การชี้บ่งอันตรายทั้งหมด
            </span>
            <div className={`p-2 rounded-xl ${activeFilter === 'all' ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-700'}`}>
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${activeFilter === 'all' ? 'text-white' : 'text-slate-900'}`}>
              {totalHazards}
            </span>
            <span className={`text-xs ${activeFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>รายการ RA-01</span>
          </div>
          <div className={`mt-2 text-[11px] flex items-center gap-1 ${activeFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
            <span>บันทึกบน Firebase RA01</span>
          </div>
        </button>

        {/* Card 2: Critical Risks */}
        <button
          onClick={() => onFilterChange('critical')}
          className={`p-4 rounded-2xl text-left border transition-all ${
            activeFilter === 'critical'
              ? 'bg-red-50 border-red-500 shadow-md ring-2 ring-red-500/20'
              : 'bg-white border-slate-200/80 hover:border-red-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-600">
              อันตรายวิกฤต (Critical)
            </span>
            <div className="p-2 rounded-xl bg-red-100 text-red-600">
              <AlertOctagon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-red-600 font-mono">
              {criticalHazards.length}
            </span>
            <span className="text-xs text-red-600/80">คะแนน 16–25</span>
          </div>
          <div className="mt-2 text-[11px] text-red-600 font-medium">
            {criticalHazards.length > 0 ? '⚠️ ต้องแก้ไขเร่งด่วน' : '✓ ไม่มีอันตรายวิกฤตค้าง'}
          </div>
        </button>

        {/* Card 3: In Progress / Investigating */}
        <button
          onClick={() => onFilterChange('in_progress')}
          className={`p-4 rounded-2xl text-left border transition-all ${
            activeFilter === 'in_progress'
              ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200/80 hover:border-amber-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">
              กำลังดำเนินการแก้ไข
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-mono">
              {inProgressHazards.length}
            </span>
            <span className="text-xs text-amber-700/80">รายการ</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-medium">
            ตามแผนปฏิบัติการ (CAPA)
          </div>
        </button>

        {/* Card 4: Resolved / Verified */}
        <button
          onClick={() => onFilterChange('resolved')}
          className={`p-4 rounded-2xl text-left border transition-all ${
            activeFilter === 'resolved'
              ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200/80 hover:border-emerald-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">
              แก้ไขเสร็จ / ตรวจรับแล้ว
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
              {resolvedHazards.length}
            </span>
            <span className="text-xs text-emerald-700/80">
              ({resolutionRate}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-medium">
            ความเสี่ยงคงเหลือลดลง
          </div>
        </button>

        {/* Card 5: AI Unforeseen Hazards */}
        <button
          onClick={onOpenAiAssistant}
          className="col-span-2 lg:col-span-1 p-4 rounded-2xl text-left border border-purple-200 bg-gradient-to-br from-purple-50 via-indigo-50/50 to-white hover:border-purple-300 hover:shadow-md transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              AI อันตรายแฝง
            </span>
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-700 font-mono">
              {unforeseenCount}
            </span>
            <span className="text-xs text-purple-600">จุดที่ตรวจพบ</span>
          </div>
          <div className="mt-2 text-[11px] text-purple-700 font-bold flex items-center gap-1">
            <span>คลิกสแกนด้วย AI</span>
            <span>→</span>
          </div>
        </button>
      </div>
    </div>
  );
};
