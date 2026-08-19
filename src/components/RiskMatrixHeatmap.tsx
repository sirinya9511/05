import React, { useState } from 'react';
import {
  Ra01HazardReport,
  calculateRiskLevel,
  LIKELIHOOD_CRITERIA,
  SEVERITY_CRITERIA,
  RISK_LEVEL_CRITERIA,
} from '../types';
import { Filter, ChevronDown, ChevronUp, BookOpen, CheckCircle2, ShieldAlert } from 'lucide-react';

interface RiskMatrixHeatmapProps {
  hazards: Ra01HazardReport[];
  selectedLikelihood: number | null;
  selectedSeverity: number | null;
  onSelectCell: (l: number | null, s: number | null) => void;
}

export const RiskMatrixHeatmap: React.FC<RiskMatrixHeatmapProps> = ({
  hazards,
  selectedLikelihood,
  selectedSeverity,
  onSelectCell,
}) => {
  const [showCriteriaTable, setShowCriteriaTable] = useState(false);
  const [activeCriteriaTab, setActiveCriteriaTab] = useState<'all' | 'likelihood' | 'severity' | 'risk'>('all');

  // Severity levels (Y-axis: 4 down to 1)
  const severities = [
    { value: 4, label: '4: ทุพพลภาพหรือเสียชีวิต', sub: 'ระดับ 4' },
    { value: 3, label: '3: ความรุนแรงสูง (ป่วย/บาดเจ็บรุนแรง)', sub: 'ระดับ 3' },
    { value: 2, label: '2: ความรุนแรงปานกลาง (รักษาแพทย์)', sub: 'ระดับ 2' },
    { value: 1, label: '1: ความรุนแรงเล็กน้อย (ปฐมพยาบาล)', sub: 'ระดับ 1' },
  ];

  // Likelihood levels (X-axis: 1 to 4)
  const likelihoods = [
    { value: 1, label: '1: น้อยมาก', sub: 'ไม่เคยเกิด ≥10 ปี' },
    { value: 2, label: '2: น้อย', sub: '1 ครั้งใน 5-10 ปี' },
    { value: 3, label: '3: ปานกลาง', sub: '1 ครั้งใน 1-5 ปี' },
    { value: 4, label: '4: สูง', sub: '>1 ครั้งใน 1 ปี' },
  ];

  // Count hazards for each cell (L, S)
  const getCellHazards = (l: number, s: number) => {
    return hazards.filter((h) => h.initialLikelihood === l && h.initialSeverity === s);
  };

  const getCellColorClass = (l: number, s: number) => {
    const score = l * s;
    const level = calculateRiskLevel(score);
    switch (level) {
      case 'critical':
        return 'bg-red-500 hover:bg-red-600 text-white border-red-600 shadow-sm';
      case 'high':
        return 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold border-amber-600 shadow-sm';
      case 'moderate':
        return 'bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-semibold border-yellow-500';
      case 'low':
      default:
        return 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600';
    }
  };

  const isCellSelected = (l: number, s: number) => {
    return selectedLikelihood === l && selectedSeverity === s;
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 text-slate-900 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-100 text-amber-800 font-mono text-xs font-bold border border-amber-200">
              4×4
            </span>
            เมทริกซ์ประเมินความเสี่ยง (4×4 Risk Assessment Matrix)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            คลิกช่องเมทริกซ์เพื่อกรองรายการตามระดับ โอกาสเกิด (L) × ความรุนแรง (S) แบบ Real-time
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(selectedLikelihood !== null || selectedSeverity !== null) && (
            <button
              onClick={() => onSelectCell(null, null)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 transition-colors"
            >
              <Filter className="h-3 w-3" />
              ล้างตัวกรอง (L:{selectedLikelihood} × S:{selectedSeverity})
            </button>
          )}

          <button
            onClick={() => setShowCriteriaTable(!showCriteriaTable)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-600" />
            <span>ตารางเกณฑ์มาตรฐาน</span>
            {showCriteriaTable ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* 4x4 Grid Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          {/* Main Top Header: โอกาสเกิดอันตราย (Likelihood) spanning over columns */}
          <div className="grid grid-cols-[180px_1fr] gap-2 mb-2 items-center">
            {/* Corner box */}
            <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-center flex flex-col justify-center">
              <span className="text-[11px] font-bold text-slate-800">แกนตาราง (4×4)</span>
              <span className="text-[10px] text-slate-500 font-medium">ความรุนแรง (แถว) × โอกาสเกิด (คอลัมน์)</span>
            </div>

            {/* Prominent Likelihood Header Band */}
            <div className="bg-amber-500 text-slate-950 font-bold py-2 px-3 rounded-xl border border-amber-600/40 text-center shadow-xs flex items-center justify-center gap-2">
              <span className="text-xs uppercase tracking-wider">🎯 โอกาสเกิดอันตราย (Likelihood: L)</span>
            </div>
          </div>

          {/* Grid Container with Columns & Rows */}
          <div className="grid grid-cols-[180px_1fr] gap-2 items-center">
            {/* Y-Axis Label / Severity Header on the Left */}
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-center">
              ความรุนแรง (Severity: S) ↓
            </div>

            {/* Top Column Headers (Likelihood 1-4) */}
            <div className="grid grid-cols-4 gap-2 text-center">
              {likelihoods.map((l) => (
                <div
                  key={l.value}
                  className="text-xs font-semibold text-slate-800 py-2 px-1 bg-amber-50/70 rounded-xl border border-amber-200/80 flex flex-col justify-center shadow-xs"
                >
                  <span className="font-bold text-slate-900 text-xs">{l.label}</span>
                  <span className="text-[10px] text-amber-800 font-medium truncate mt-0.5">{l.sub}</span>
                </div>
              ))}
            </div>

            {/* Matrix Rows (Severity 4 down to 1) */}
            {severities.map((s) => (
              <React.Fragment key={s.value}>
                {/* Row Header (Severity) */}
                <div className="text-xs font-medium text-slate-700 pr-2 text-right py-1 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <span className="font-bold block text-slate-900 leading-tight text-xs">{s.label}</span>
                  <span className="text-[10px] text-slate-500">{s.sub}</span>
                </div>

                {/* 4 Cells for this severity */}
                <div className="grid grid-cols-4 gap-2">
                  {likelihoods.map((l) => {
                    const count = getCellHazards(l.value, s.value).length;
                    const score = l.value * s.value;
                    const selected = isCellSelected(l.value, s.value);

                    return (
                      <button
                        key={`${l.value}-${s.value}`}
                        onClick={() => {
                          if (selected) {
                            onSelectCell(null, null);
                          } else {
                            onSelectCell(l.value, s.value);
                          }
                        }}
                        className={`h-13 rounded-xl border transition-all flex flex-col items-center justify-center relative cursor-pointer ${getCellColorClass(
                          l.value,
                          s.value
                        )} ${
                          selected
                            ? 'ring-3 ring-slate-900 ring-offset-2 ring-offset-white scale-105 z-10 shadow-lg'
                            : 'opacity-95'
                        }`}
                        title={`โอกาสเกิด: ${l.value} (${l.sub}), ความรุนแรง: ${s.value} (${s.label}), คะแนน: ${score} (${count} รายการ)`}
                      >
                        <span className="text-xs font-mono font-bold leading-none">
                          {score}
                        </span>
                        {count > 0 ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 bg-slate-950 text-white text-[11px] font-extrabold rounded-full mt-1 border border-white/40 shadow-xs">
                            {count}
                          </span>
                        ) : (
                          <span className="text-[10px] opacity-40 leading-none mt-1">-</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Legend with exact thresholds */}
      <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200/80 flex items-start gap-2">
          <span className="w-3.5 h-3.5 rounded bg-red-500 mt-0.5 shrink-0" />
          <div>
            <strong className="text-red-800 font-bold block">12–16 ความเสี่ยงที่ยอมรับไม่ได้</strong>
            <span className="text-[11px] text-slate-600 block mt-0.5">ต้องหยุดการดำเนินงาน และปรับปรุงแก้ไขทันที</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2">
          <span className="w-3.5 h-3.5 rounded bg-amber-500 mt-0.5 shrink-0" />
          <div>
            <strong className="text-amber-800 font-bold block">8–9 ความเสี่ยงสูง</strong>
            <span className="text-[11px] text-slate-600 block mt-0.5">ต้องมีการดำเนินการลดความเสี่ยง</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-yellow-50 border border-yellow-200/80 flex items-start gap-2">
          <span className="w-3.5 h-3.5 rounded bg-yellow-400 mt-0.5 shrink-0" />
          <div>
            <strong className="text-yellow-800 font-bold block">3–6 ความเสี่ยงปานกลาง</strong>
            <span className="text-[11px] text-slate-600 block mt-0.5">ต้องมีการทบทวนมาตรการควบคุม</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2">
          <span className="w-3.5 h-3.5 rounded bg-emerald-500 mt-0.5 shrink-0" />
          <div>
            <strong className="text-emerald-800 font-bold block">1–2 ความเสี่ยงเล็กน้อย</strong>
            <span className="text-[11px] text-slate-600 block mt-0.5">ยอมรับได้ ปฏิบัติตามมาตรฐานงานปกติ</span>
          </div>
        </div>
      </div>

      {/* Expandable Criteria Reference Section */}
      {showCriteriaTable && (
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <span>ตารางเกณฑ์การประเมินความเสี่ยง 4×4 และเกณฑ์การตัดสินใจ (Risk Assessment Criteria)</span>
            </h4>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveCriteriaTab('all')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  activeCriteriaTab === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setActiveCriteriaTab('likelihood')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  activeCriteriaTab === 'likelihood'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                โอกาสเกิด
              </button>
              <button
                onClick={() => setActiveCriteriaTab('severity')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  activeCriteriaTab === 'severity'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ความรุนแรง
              </button>
              <button
                onClick={() => setActiveCriteriaTab('risk')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  activeCriteriaTab === 'risk'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ระดับความเสี่ยง
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Table 1: โอกาสเกิดเหตุการณ์ */}
            {(activeCriteriaTab === 'all' || activeCriteriaTab === 'likelihood') && (
              <div className={`bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 ${activeCriteriaTab === 'likelihood' ? 'md:col-span-3' : ''}`}>
                <div className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1.5 flex items-center justify-between">
                  <span>1. โอกาสการเกิดเหตุการณ์ (Likelihood)</span>
                  <span className="text-[10px] text-slate-500 font-mono">1-4</span>
                </div>
                <div className="space-y-2">
                  {LIKELIHOOD_CRITERIA.map((item) => (
                    <div key={item.level} className="p-2 rounded-xl bg-white border border-slate-200/80 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold">ระดับ {item.level} ({item.name})</strong>
                        <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">L={item.level}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Table 2: ความรุนแรง */}
            {(activeCriteriaTab === 'all' || activeCriteriaTab === 'severity') && (
              <div className={`bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 ${activeCriteriaTab === 'severity' ? 'md:col-span-3' : ''}`}>
                <div className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1.5 flex items-center justify-between">
                  <span>2. ความรุนแรง (Severity)</span>
                  <span className="text-[10px] text-slate-500 font-mono">1-4</span>
                </div>
                <div className="space-y-2">
                  {SEVERITY_CRITERIA.map((item) => (
                    <div key={item.level} className="p-2 rounded-xl bg-white border border-slate-200/80 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold">ระดับ {item.level} ({item.name})</strong>
                        <span className="font-mono text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">S={item.level}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Table 3: การจัดระดับความเสี่ยง */}
            {(activeCriteriaTab === 'all' || activeCriteriaTab === 'risk') && (
              <div className={`bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 ${activeCriteriaTab === 'risk' ? 'md:col-span-3' : ''}`}>
                <div className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1.5 flex items-center justify-between">
                  <span>3. การจัดระดับความเสี่ยง & มาตรการ</span>
                  <span className="text-[10px] text-slate-500 font-mono">L×S (1-16)</span>
                </div>
                <div className="space-y-2">
                  {RISK_LEVEL_CRITERIA.map((item) => (
                    <div key={item.levelKey} className={`p-2.5 rounded-xl border ${item.badgeColor} space-y-1`}>
                      <div className="flex items-center justify-between">
                        <strong className="font-bold text-xs">{item.scoreRange} : {item.labelTh}</strong>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/70">
                          {item.scoreRange}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium leading-relaxed">
                        ⚠️ <strong>มาตรการ:</strong> {item.actionRequired}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
