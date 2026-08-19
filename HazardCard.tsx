import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  MapPin,
  MoreVertical,
  Pencil,
  Sparkles,
  Trash2,
  User,
  ShieldAlert,
  ShieldCheck,
  MessageSquare,
  Building,
} from 'lucide-react';
import {
  Ra01HazardReport,
  HazardStatus,
  getRiskBadgeConfig,
  getStatusBadgeConfig,
  HAZARD_CATEGORIES,
  hasControlMeasures,
} from '../types';

interface HazardCardProps {
  hazard: Ra01HazardReport;
  onView: (hazard: Ra01HazardReport) => void;
  onEdit: (hazard: Ra01HazardReport, tab?: 'report' | 'controls') => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: HazardStatus) => void;
}

export const HazardCard: React.FC<HazardCardProps> = ({
  hazard,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const initialRiskBadge = getRiskBadgeConfig(hazard.initialRiskLevel);
  const residualRiskBadge = getRiskBadgeConfig(hazard.residualRiskLevel);
  const statusBadge = getStatusBadgeConfig(hazard.status);
  const isControlsFilled = hasControlMeasures(hazard);

  // Parse unforeseen hazards if any
  let unforeseenCount = 0;
  try {
    if (hazard.unforeseenHazards) {
      const parsed = JSON.parse(hazard.unforeseenHazards);
      if (Array.isArray(parsed)) unforeseenCount = parsed.length;
    }
  } catch {
    if (hazard.unforeseenHazards && hazard.unforeseenHazards.length > 5) unforeseenCount = 1;
  }

  const categoryObj = HAZARD_CATEGORIES.find((c) => c.id === hazard.hazardCategory) || {
    nameTh: hazard.hazardCategory,
    color: 'slate',
  };

  const statusOptions: { value: HazardStatus; label: string }[] = [
    { value: 'reported', label: 'แจ้งใหม่ / รอตรวจสอบ' },
    { value: 'investigating', label: 'กำลังตรวจประเมิน' },
    { value: 'in_progress', label: 'กำลังดำเนินการแก้ไข' },
    { value: 'resolved', label: 'แก้ไขแล้ว / รอตรวจรับ' },
    { value: 'verified', label: 'จป. ตรวจรับรองแล้ว' },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all relative flex flex-col justify-between group">
      <div>
        {/* Card Header: Code, Category, Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
              {hazard.code}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              {categoryObj.nameTh}
            </span>
            {unforeseenCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                <Sparkles className="h-3 w-3 text-purple-600" />
                AI ชี้บ่ง {unforeseenCount} อันตรายแฝง
              </span>
            )}
          </div>

          {/* Status Changer Menu */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-xs transition-all ${statusBadge.bg}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{statusBadge.labelTh}</span>
            </button>

            {showStatusMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowStatusMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 text-xs">
                  <div className="px-3 py-1.5 font-bold text-slate-400 border-b border-slate-100">
                    เปลี่ยนสถานะแบบ Real-time:
                  </div>
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        onStatusChange(hazard.id, opt.value);
                        setShowStatusMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between ${
                        hazard.status === opt.value
                          ? 'font-bold text-amber-700 bg-amber-50/60'
                          : 'text-slate-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {hazard.status === opt.value && (
                        <CheckCircle className="h-3.5 w-3.5 text-amber-600" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Activity Title */}
        <h4
          onClick={() => onView(hazard)}
          className="text-base font-bold text-slate-900 hover:text-amber-600 cursor-pointer transition-colors line-clamp-2"
        >
          {hazard.activityName}
        </h4>

        {/* Location & Reporter info */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1.5">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{hazard.workArea}</span>
          </div>
          {hazard.reporterName && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <User className="h-3 w-3" />
              <span className="truncate">แจ้งโดย: {hazard.reporterName}</span>
            </div>
          )}
        </div>

        {/* Unsafe Condition / Hazard snippet */}
        <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
          {hazard.unsafeCondition && (
            <div className="text-slate-700">
              <strong className="text-slate-900">สภาพที่ไม่ปลอดภัย:</strong>{' '}
              <span className="line-clamp-2">{hazard.unsafeCondition}</span>
            </div>
          )}
          {hazard.unsafeAct && (
            <div className="text-slate-700">
              <strong className="text-slate-900">การกระทำที่ไม่ปลอดภัย:</strong>{' '}
              <span className="line-clamp-1">{hazard.unsafeAct}</span>
            </div>
          )}
          {hazard.consequences && (
            <div className="text-red-700 font-medium">
              <strong>ผลกระทบ:</strong> <span className="line-clamp-1">{hazard.consequences}</span>
            </div>
          )}
        </div>

        {/* 4x4 Risk Score Transformation: Initial vs Residual */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          {/* Initial Risk (Phase 1) */}
          <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${initialRiskBadge.bg}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
              1. ความเสี่ยงเริ่มต้น (L×S)
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-extrabold text-base sm:text-lg font-mono">
                {hazard.initialLikelihood} × {hazard.initialSeverity} = {hazard.initialRiskScore}
              </span>
              <span className="font-bold text-[11px] truncate ml-1">{initialRiskBadge.labelTh}</span>
            </div>
          </div>

          {/* Residual Risk (Phase 2) */}
          {isControlsFilled ? (
            <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${residualRiskBadge.bg}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                2. หลังมีมาตรการ (L×S)
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-extrabold text-base sm:text-lg font-mono">
                  {hazard.residualLikelihood} × {hazard.residualSeverity} = {hazard.residualRiskScore}
                </span>
                <span className="font-bold text-[11px] truncate ml-1">{residualRiskBadge.labelTh}</span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 flex flex-col justify-between text-amber-900">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                2. มาตรการควบคุม 5 ขั้น
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] font-semibold text-amber-800">
                  ⏳ รอ จป. ตอบกลับ
                </span>
                <button
                  onClick={() => onEdit(hazard, 'controls')}
                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs"
                >
                  ตอบกลับ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Metadata & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3 text-slate-500 truncate">
          {hazard.assignedTo ? (
            <span className="flex items-center gap-1 truncate" title={`ผู้รับผิดชอบ: ${hazard.assignedTo}`}>
              <User className="h-3.5 w-3.5" />
              <span className="truncate">{hazard.assignedTo}</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 italic">
              ยังไม่ระบุผู้รับผิดชอบ
            </span>
          )}
          {hazard.targetDate && (
            <span className="flex items-center gap-1 shrink-0" title={`กำหนดเสร็จ: ${hazard.targetDate}`}>
              <Calendar className="h-3.5 w-3.5" />
              <span>{hazard.targetDate}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Feedback & Controls button if not filled */}
          {!isControlsFilled && (
            <button
              onClick={() => onEdit(hazard, 'controls')}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] transition-colors border border-indigo-200"
              title="ตอบกลับและกำหนดมาตรการควบคุม 5 ขั้น"
            >
              <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
              <span>ตอบกลับมาตรการ</span>
            </button>
          )}

          <button
            onClick={() => onView(hazard)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="ดูแบบฟอร์ม RA-01 ฉบับเต็ม"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(hazard, 'report')}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="แก้ไขข้อมูล RA-01"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรายการ ${hazard.code}?`)) {
                onDelete(hazard.id);
              }
            }}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
            title="ลบรายการ"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
