import React, { useState } from 'react';
import {
  X,
  Printer,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Calendar,
  User,
  MapPin,
  FileSpreadsheet,
  Clock,
  ArrowRight,
  ShieldAlert,
  MessageSquare,
  Building,
  Camera,
  Layers,
  FileText,
} from 'lucide-react';
import {
  Ra01HazardReport,
  HazardStatus,
  getRiskBadgeConfig,
  getStatusBadgeConfig,
  HAZARD_CATEGORIES,
  hasControlMeasures,
} from '../types';

interface HazardDetailModalProps {
  hazard: Ra01HazardReport | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (hazard: Ra01HazardReport, tab?: 'report' | 'controls') => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: HazardStatus) => void;
  onAddCorrectiveNote: (id: string, note: string) => void;
  onPrintSingle: (hazard: Ra01HazardReport) => void;
}

export const HazardDetailModal: React.FC<HazardDetailModalProps> = ({
  hazard,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onAddCorrectiveNote,
  onPrintSingle,
}) => {
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (!isOpen || !hazard) return null;

  const initialRiskBadge = getRiskBadgeConfig(hazard.initialRiskLevel);
  const residualRiskBadge = getRiskBadgeConfig(hazard.residualRiskLevel);
  const statusBadge = getStatusBadgeConfig(hazard.status);
  const isControlsFilled = hasControlMeasures(hazard);

  const categoryObj = HAZARD_CATEGORIES.find((c) => c.id === hazard.hazardCategory) || {
    nameTh: hazard.hazardCategory,
  };

  // Parse unforeseen hazards if any
  let parsedUnforeseen: any[] = [];
  try {
    if (hazard.unforeseenHazards) {
      const p = JSON.parse(hazard.unforeseenHazards);
      if (Array.isArray(p)) parsedUnforeseen = p;
    }
  } catch {
    // fallback text
  }

  const handleSaveNote = () => {
    if (!newNote.trim()) return;
    const updatedNotes = hazard.correctiveNotes
      ? `${hazard.correctiveNotes}\n[${new Date().toLocaleDateString('th-TH')}] ${newNote}`
      : `[${new Date().toLocaleDateString('th-TH')}] ${newNote}`;
    onAddCorrectiveNote(hazard.id, updatedNotes);
    setNewNote('');
    setIsAddingNote(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl text-slate-900 relative">
        {/* Modal Top Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 p-4 sm:p-5 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shadow-md">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-amber-700 border border-slate-200">
                  {hazard.code}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge.bg}`}>
                  {statusBadge.labelTh}
                </span>
                {isControlsFilled ? (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline">
                    🛡️ กำหนดมาตรการแล้ว
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 hidden sm:inline">
                    ⏳ รอ จป. ตอบกลับมาตรการ
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1 line-clamp-1">
                {hazard.activityName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintSingle(hazard)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              title="พิมพ์แบบฟอร์ม RA-01 ฉบับนี้"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">พิมพ์รายงาน RA-01</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(hazard, 'report');
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="แก้ไขข้อมูลรายงาน"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">สถานที่ / แผนก</span>
              <span className="font-bold text-slate-900 mt-0.5 block truncate">
                {hazard.workArea}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">หมวดหมู่อันตราย</span>
              <span className="font-bold text-slate-900 mt-0.5 block truncate">
                {categoryObj.nameTh}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">ผู้รายงาน / ชี้บ่ง</span>
              <span className="font-bold text-slate-900 mt-0.5 block truncate">
                {hazard.reporterName || 'ไม่ระบุ'}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {hazard.reporterDepartment}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">ผู้รับผิดชอบแก้ไข</span>
              <span className="font-bold text-slate-900 mt-0.5 block truncate">
                {hazard.assignedTo || 'ยังไม่ระบุ'}
              </span>
              {hazard.targetDate && (
                <span className="text-[10px] text-slate-500 block">
                  กำหนดเสร็จ: {hazard.targetDate}
                </span>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 1: ข้อมูลการชี้บ่งอันตรายและการประเมินเบื้องต้น (Initial Hazard Identification) */}
          {/* ========================================================================= */}
          <div className="space-y-4 border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  การชี้บ่งอันตราย & การประเมินความเสี่ยงเบื้องต้น (Initial Report)
                </h4>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                แจ้งโดย: {hazard.reporterName} ({hazard.reporterDepartment})
              </span>
            </div>

            {/* 4x4 Matrix Visual Card: Initial Risk */}
            <div className={`p-4 rounded-2xl border space-y-2 ${initialRiskBadge.bg}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                  ระดับความเสี่ยงเบื้องต้น (Initial Risk: 4×4)
                </span>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-white/80 shadow-xs">
                  {initialRiskBadge.labelTh}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono">
                  {hazard.initialLikelihood * hazard.initialSeverity}
                </span>
                <span className="text-xs font-semibold">
                  (โอกาสเกิด L:{hazard.initialLikelihood} × ความรุนแรง S:{hazard.initialSeverity})
                </span>
              </div>
              <p className="text-[11px] font-medium pt-1 border-t border-black/10">
                ⚠️ <strong>ข้อกำหนดตามระดับความเสี่ยง:</strong> {initialRiskBadge.actionTh}
              </p>
            </div>

            {/* Hazard Condition & Unsafe Acts */}
            <div className="space-y-3 text-xs">
              {hazard.workStep && (
                <div>
                  <strong className="text-slate-800 block mb-0.5">
                    ขั้นตอนการปฏิบัติงาน:
                  </strong>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {hazard.workStep}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <strong className="text-slate-800 block mb-0.5">
                    สภาพการทำงานที่ไม่ปลอดภัย (Unsafe Condition):
                  </strong>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {hazard.unsafeCondition || '-'}
                  </p>
                </div>

                <div>
                  <strong className="text-slate-800 block mb-0.5">
                    การกระทำที่ไม่ปลอดภัย (Unsafe Act):
                  </strong>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {hazard.unsafeAct || '-'}
                  </p>
                </div>
              </div>

              {hazard.consequences && (
                <div>
                  <strong className="text-red-700 block mb-0.5">
                    ผลกระทบ / ความเสียหายที่อาจเกิดขึ้น (Consequences):
                  </strong>
                  <p className="text-red-700 font-medium bg-red-50 p-2.5 rounded-xl border border-red-200">
                    {hazard.consequences}
                  </p>
                </div>
              )}

              {/* Photo Attachment if available */}
              {hazard.photoUrl && (
                <div>
                  <strong className="text-slate-800 block mb-1 flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-amber-500" />
                    <span>ภาพถ่ายสภาพอันตรายหน้างาน:</span>
                  </strong>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl max-w-sm">
                    <img
                      src={hazard.photoUrl}
                      alt="ภาพถ่ายสภาพอันตราย"
                      className="rounded-lg object-contain max-h-60 w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* AI Unforeseen Hazards Section */}
            {parsedUnforeseen.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-purple-500/40 space-y-3 shadow-lg mt-3">
                <h4 className="font-bold text-sm text-purple-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  <span>อันตรายแฝงที่ชี้บ่งโดย AI (Unforeseen Hazards Identified by AI):</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {parsedUnforeseen.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-800/90 border border-purple-400/30 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-100 font-bold">{item.hazardName}</strong>
                        <span className="px-2 py-0.5 rounded bg-red-500/30 text-red-200 font-semibold text-[10px]">
                          {item.riskLevel || 'สูง'}
                        </span>
                      </div>
                      {item.whyUnforeseen && (
                        <div className="text-amber-300 bg-amber-950/60 p-2 rounded-lg text-[11px]">
                          💡 <strong>ทำไมถึงคาดไม่ถึง:</strong> {item.whyUnforeseen}
                        </div>
                      )}
                      {item.potentialConsequence && (
                        <div className="text-slate-300 text-[11px]">
                          💥 <strong>ผลกระทบ:</strong> {item.potentialConsequence}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: การตอบกลับมาตรการควบคุม 5 ลำดับขั้น & Residual Risk (Feedback & Controls) */}
          {/* ========================================================================= */}
          <div className="space-y-4 border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  มาตรการควบคุม 5 ลำดับขั้น & ความเสี่ยงคงเหลือ (Hierarchy of Controls & Feedback)
                </h4>
              </div>

              {/* Respond/Feedback Action button */}
              <button
                onClick={() => {
                  onClose();
                  onEdit(hazard, 'controls');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
                <span>{isControlsFilled ? 'แก้ไขมาตรการควบคุม' : 'ตอบกลับ / กำหนดมาตรการตอนนี้'}</span>
              </button>
            </div>

            {/* If NOT filled yet: show pending feedback banner */}
            {!isControlsFilled ? (
              <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-300/80 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">
                    ยังไม่มีการตอบกลับมาตรการควบคุม 5 ขั้น (Pending Controls & Feedback)
                  </h5>
                  <p className="text-xs text-slate-600 max-w-lg mx-auto mt-1">
                    รายการนี้ถูกบันทึกจากการชี้บ่งอันตรายเบื้องต้น อยู่ระหว่างรอ จป.วิชาชีพ หรือผู้รับผิดชอบเข้ามากำหนดมาตรการ 5 ลำดับขั้น และประเมิน Residual Risk
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onEdit(hazard, 'controls');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>ตอบกลับและกำหนดมาตรการควบคุม (Provide Feedback & Controls)</span>
                </button>
              </div>
            ) : (
              /* If filled: display full hierarchy and residual risk */
              <div className="space-y-4">
                {/* Residual Risk Card */}
                <div className={`p-4 rounded-2xl border space-y-2 ${residualRiskBadge.bg}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                      ความเสี่ยงคงเหลือหลังมีมาตรการ (Residual Risk: 4×4)
                    </span>
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-white/80 shadow-xs">
                      {residualRiskBadge.labelTh}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-mono">
                      {hazard.residualLikelihood * hazard.residualSeverity}
                    </span>
                    <span className="text-xs font-semibold">
                      (โอกาสเกิด L:{hazard.residualLikelihood} × ความรุนแรง S:{hazard.residualSeverity})
                    </span>
                  </div>
                  <p className="text-[11px] font-medium pt-1 border-t border-black/10">
                    🛡️ <strong>ผลประเมิน:</strong> {residualRiskBadge.actionTh}
                  </p>
                </div>

                {/* 5-tier Hierarchy of Controls */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <h5 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>มาตรการควบคุมความเสี่ยง 5 ลำดับขั้น (Hierarchy of Controls)</span>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="font-bold text-red-600 block mb-1 text-[11px]">1. ขจัดอันตราย</span>
                      <span className="text-slate-700 text-[11px]">
                        {hazard.hierarchyElimination || '-'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="font-bold text-orange-600 block mb-1 text-[11px]">2. การทดแทน</span>
                      <span className="text-slate-700 text-[11px]">
                        {hazard.hierarchySubstitution || '-'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="font-bold text-amber-600 block mb-1 text-[11px]">3. วิศวกรรม</span>
                      <span className="text-slate-700 text-[11px]">
                        {hazard.hierarchyEngineering || '-'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="font-bold text-blue-600 block mb-1 text-[11px]">4. บริหารจัดการ</span>
                      <span className="text-slate-700 text-[11px]">
                        {hazard.hierarchyAdministrative || '-'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="font-bold text-emerald-600 block mb-1 text-[11px]">5. อุปกรณ์ PPE</span>
                      <span className="text-slate-700 text-[11px]">
                        {hazard.hierarchyPpe || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Plan & Corrective Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Action Plan */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <h5 className="font-bold text-slate-900">
                      แผนปฏิบัติการแก้ไข (Action Plan / CAPA):
                    </h5>
                    <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 leading-relaxed min-h-[50px]">
                      {hazard.actionPlan || 'ยังไม่ได้กำหนดแผนปฏิบัติการ'}
                    </p>
                    {hazard.applicableLaw && (
                      <div className="pt-2 text-[11px] text-slate-500">
                        <strong>กฎหมายอ้างอิง:</strong> {hazard.applicableLaw}
                      </div>
                    )}
                  </div>

                  {/* Corrective Notes Log */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                    <div>
                      <h5 className="font-bold text-slate-900 flex items-center justify-between">
                        <span>บันทึกความคืบหน้าการแก้ไข (Progress Notes):</span>
                      </h5>
                      <div className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 min-h-[60px] whitespace-pre-line text-[11px] mt-1">
                        {hazard.correctiveNotes || 'ยังไม่มีบันทึกเพิ่มเติม'}
                      </div>
                    </div>

                    {/* Add Note Button */}
                    {isAddingNote ? (
                      <div className="space-y-2 pt-2">
                        <textarea
                          rows={2}
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="พิมพ์บันทึกการแก้ไข เช่น 'จัดซื้อการ์ดแล้ว รอติดตั้งวันจันทร์'..."
                          className="w-full p-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setIsAddingNote(false)}
                            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-200 text-slate-700"
                          >
                            ยกเลิก
                          </button>
                          <button
                            onClick={handleSaveNote}
                            className="px-3 py-1 text-[11px] rounded-lg bg-slate-900 text-white font-bold"
                          >
                            บันทึก
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsAddingNote(true)}
                        className="self-start text-[11px] font-bold text-amber-700 hover:underline pt-1"
                      >
                        + เพิ่มบันทึกความคืบหน้า
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Status Workflow Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">เปลี่ยนสถานะการดำเนินการ (Real-time):</span>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {(['reported', 'investigating', 'in_progress', 'resolved', 'verified'] as HazardStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => onStatusChange(hazard.id, st)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                        hazard.status === st
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st === 'reported' && 'แจ้งใหม่'}
                      {st === 'investigating' && 'ตรวจประเมิน'}
                      {st === 'in_progress' && 'กำลังแก้ไข'}
                      {st === 'resolved' && 'แก้ไขแล้ว'}
                      {st === 'verified' && 'จป. รับรอง'}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-400">
              ผู้ชี้บ่ง: <strong>{hazard.reporterName}</strong> ({hazard.reporterDepartment})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
