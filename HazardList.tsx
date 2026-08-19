import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  Layers,
  MapPin,
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  FolderOpen,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import {
  Ra01HazardReport,
  HazardStatus,
  WORK_AREAS,
  HAZARD_CATEGORIES,
  hasControlMeasures,
} from '../types';
import { HazardCard } from './HazardCard';

interface HazardListProps {
  hazards: Ra01HazardReport[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  selectedMatrixL: number | null;
  selectedMatrixS: number | null;
  onClearMatrixFilter: () => void;
  onView: (hazard: Ra01HazardReport) => void;
  onEdit: (hazard: Ra01HazardReport, tab?: 'report' | 'controls') => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: HazardStatus) => void;
  onOpenNewHazard: () => void;
  onReset3Samples?: () => void;
}

export const HazardList: React.FC<HazardListProps> = ({
  hazards,
  activeFilter,
  onFilterChange,
  selectedMatrixL,
  selectedMatrixS,
  onClearMatrixFilter,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onOpenNewHazard,
  onReset3Samples,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyUnforeseen, setOnlyUnforeseen] = useState(false);
  const [sortBy, setSortBy] = useState<'riskScore' | 'newest' | 'code'>('riskScore');

  // Filter items
  const filteredHazards = useMemo(() => {
    return hazards
      .filter((item) => {
        // Search Term matching
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchCode = item.code?.toLowerCase().includes(term);
          const matchActivity = item.activityName?.toLowerCase().includes(term);
          const matchArea = item.workArea?.toLowerCase().includes(term);
          const matchConseq = item.consequences?.toLowerCase().includes(term);
          const matchReporter = item.reporterName?.toLowerCase().includes(term);
          const matchAssignee = item.assignedTo?.toLowerCase().includes(term);
          if (!matchCode && !matchActivity && !matchArea && !matchConseq && !matchReporter && !matchAssignee) {
            return false;
          }
        }

        // Active Status/Risk/Control Filter
        if (activeFilter === 'critical') {
          if (item.initialRiskLevel !== 'critical') return false;
        } else if (activeFilter === 'in_progress') {
          if (item.status !== 'in_progress' && item.status !== 'investigating') return false;
        } else if (activeFilter === 'resolved') {
          if (item.status !== 'resolved' && item.status !== 'verified') return false;
        } else if (activeFilter === 'reported') {
          if (item.status !== 'reported') return false;
        } else if (activeFilter === 'pending_controls') {
          if (hasControlMeasures(item)) return false;
        } else if (activeFilter === 'controls_defined') {
          if (!hasControlMeasures(item)) return false;
        }

        // 4x4 Matrix Cell filter
        if (selectedMatrixL !== null && selectedMatrixS !== null) {
          if (item.initialLikelihood !== selectedMatrixL || item.initialSeverity !== selectedMatrixS) {
            return false;
          }
        }

        // Area Filter
        if (selectedArea !== 'all' && item.workArea !== selectedArea) {
          return false;
        }

        // Category Filter
        if (selectedCategory !== 'all' && item.hazardCategory !== selectedCategory) {
          return false;
        }

        // Only Unforeseen
        if (onlyUnforeseen) {
          try {
            if (!item.unforeseenHazards) return false;
            const parsed = JSON.parse(item.unforeseenHazards);
            if (!Array.isArray(parsed) || parsed.length === 0) return false;
          } catch {
            if (!item.unforeseenHazards || item.unforeseenHazards.length < 10) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'riskScore') {
          return b.initialRiskScore - a.initialRiskScore;
        } else if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else {
          return a.code.localeCompare(b.code);
        }
      });
  }, [
    hazards,
    searchTerm,
    activeFilter,
    selectedMatrixL,
    selectedMatrixS,
    selectedArea,
    selectedCategory,
    onlyUnforeseen,
    sortBy,
  ]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหารหัส RA01, กิจกรรม, พื้นที่, อันตราย, ผู้รับผิดชอบ, ผู้รายงาน..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 placeholder:text-slate-400 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                ล้าง
              </button>
            )}
          </div>

          {/* Quick Filter Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'ทั้งหมด' },
              { id: 'pending_controls', label: '⏳ รอมาตรการตอบกลับ' },
              { id: 'controls_defined', label: '🛡️ กำหนดมาตรการแล้ว' },
              { id: 'critical', label: '🔴 วิกฤต (12-16)' },
              { id: 'in_progress', label: '🟡 กำลังแก้ไข' },
              { id: 'resolved', label: '🟢 แก้ไขแล้ว' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onFilterChange(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters: Area, Category, Unforeseen AI, Sort */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Area Dropdown */}
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="all">ทุกแผนก / พื้นที่ปฏิบัติงาน</option>
              {WORK_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="all">ทุกหมวดหมู่อันตราย</option>
              {HAZARD_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameTh}
                </option>
              ))}
            </select>

            {/* AI Unforeseen Toggle */}
            <button
              onClick={() => setOnlyUnforeseen(!onlyUnforeseen)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                onlyUnforeseen
                  ? 'bg-purple-50 text-purple-700 border-purple-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span>เฉพาะอันตรายแฝง (AI Unforeseen)</span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">เรียงตาม:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="riskScore">คะแนนความเสี่ยงสูงสุด (Risk Score)</option>
              <option value="newest">วันที่บันทึกล่าสุด (Newest)</option>
              <option value="code">รหัสแบบฟอร์ม RA01</option>
            </select>
          </div>
        </div>

        {/* Active Matrix Filter Banner */}
        {selectedMatrixL !== null && selectedMatrixS !== null && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-amber-600" />
              <span>
                กำลังกรองตามช่องเมทริกซ์ 4×4: <strong>โอกาสเกิด L = {selectedMatrixL}</strong> × <strong>ความรุนแรง S = {selectedMatrixS}</strong> (คะแนน {selectedMatrixL * selectedMatrixS})
              </span>
            </span>
            <button
              onClick={onClearMatrixFilter}
              className="font-bold underline hover:text-amber-950 cursor-pointer"
            >
              ล้างตัวกรองนี้
            </button>
          </div>
        )}
      </div>

      {/* Hazard Count & List Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 px-1">
        <span>
          แสดงผล <strong>{filteredHazards.length}</strong> จากทั้งหมด {hazards.length} รายการ
        </span>
        {onReset3Samples && (
          <button
            onClick={onReset3Samples}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold cursor-pointer transition-colors w-fit"
            title="รีเซ็ตและโหลดตัวอย่าง 3 รายการตาม 3 สถานะมาตรฐาน (รอตอบกลับ / กำหนดมาตรการ / แก้ไขแล้ว)"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
            <span>โหลดชุดข้อมูลตัวอย่าง 3 สถานะมาตรฐาน</span>
          </button>
        )}
      </div>

      {/* Grid of Hazard Cards */}
      {filteredHazards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHazards.map((hazard) => (
            <HazardCard
              key={hazard.id}
              hazard={hazard}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <FolderOpen className="h-7 w-7" />
          </div>
          <h4 className="font-bold text-base text-slate-800">
            ไม่พบรายการชี้บ่งอันตรายที่ตรงกับเงื่อนไข
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือคลิกปุ่มด้านล่างเพื่อสร้างการชี้บ่งอันตราย RA-01 ฉบับใหม่
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={onOpenNewHazard}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              + บันทึกชี้บ่งอันตรายใหม่
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
