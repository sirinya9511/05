import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Save,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Calendar,
  User,
  Camera,
  CheckCircle2,
  FileSpreadsheet,
  Info,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Building,
  ClipboardList,
  MessageSquare,
} from 'lucide-react';
import {
  Ra01HazardReport,
  HazardCategory,
  HazardStatus,
  RiskLevel,
  WORK_AREAS,
  HAZARD_CATEGORIES,
  calculateRiskLevel,
  getRiskBadgeConfig,
  AIAnalysisResult,
  hasControlMeasures,
} from '../types';

interface HazardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: Omit<Ra01HazardReport, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editingHazard?: Ra01HazardReport | null;
  onOpenAiAssistant: () => void;
  initialAiData?: AIAnalysisResult | null;
  initialTab?: 'report' | 'controls';
}

export const HazardFormModal: React.FC<HazardFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingHazard,
  onOpenAiAssistant,
  initialAiData,
  initialTab = 'report',
}) => {
  // Tab control: 'report' = Phase 1 (ผู้ชี้บ่งอันตราย), 'controls' = Phase 2 (มาตรการควบคุม & feedback)
  const [activeTab, setActiveTab] = useState<'report' | 'controls'>(initialTab);

  // General & Activity (Phase 1)
  const [code, setCode] = useState(`RA01-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [activityName, setActivityName] = useState('');
  const [workArea, setWorkArea] = useState(WORK_AREAS[0]);
  const [workStep, setWorkStep] = useState('');
  const [hazardCategory, setHazardCategory] = useState<HazardCategory>('mechanical');

  // Hazard Identification (Phase 1)
  const [unsafeAct, setUnsafeAct] = useState('');
  const [unsafeCondition, setUnsafeCondition] = useState('');
  const [consequences, setConsequences] = useState('');

  // Initial Risk Matrix (Phase 1: 4x4)
  const [initialLikelihood, setInitialLikelihood] = useState<number>(3);
  const [initialSeverity, setInitialSeverity] = useState<number>(3);

  // Reporter & Photo (Phase 1)
  const [reporterName, setReporterName] = useState('พนักงานประจำพื้นที่ / ผู้ชี้บ่ง');
  const [reporterDepartment, setReporterDepartment] = useState('ฝ่ายปฏิบัติการ / แผนกการผลิต');
  const [photoUrl, setPhotoUrl] = useState('');

  // AI Unforeseen risks
  const [unforeseenHazards, setUnforeseenHazards] = useState<string>('');

  // Hierarchy of Controls (Phase 2)
  const [hierarchyElimination, setHierarchyElimination] = useState('');
  const [hierarchySubstitution, setHierarchySubstitution] = useState('');
  const [hierarchyEngineering, setHierarchyEngineering] = useState('');
  const [hierarchyAdministrative, setHierarchyAdministrative] = useState('');
  const [hierarchyPpe, setHierarchyPpe] = useState('');

  // Residual Risk Matrix (Phase 2: 4x4)
  const [residualLikelihood, setResidualLikelihood] = useState<number>(1);
  const [residualSeverity, setResidualSeverity] = useState<number>(2);

  // Status & Responsibility (Phase 2)
  const [status, setStatus] = useState<HazardStatus>('reported');
  const [assignedTo, setAssignedTo] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [correctiveNotes, setCorrectiveNotes] = useState('');
  const [applicableLaw, setApplicableLaw] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync editing hazard or AI data
  useEffect(() => {
    if (editingHazard) {
      setCode(editingHazard.code);
      setActivityName(editingHazard.activityName);
      setWorkArea(editingHazard.workArea);
      setWorkStep(editingHazard.workStep || '');
      setHazardCategory(editingHazard.hazardCategory as HazardCategory);
      setUnsafeAct(editingHazard.unsafeAct || '');
      setUnsafeCondition(editingHazard.unsafeCondition || '');
      setConsequences(editingHazard.consequences || '');
      setInitialLikelihood(editingHazard.initialLikelihood || 3);
      setInitialSeverity(editingHazard.initialSeverity || 3);
      setUnforeseenHazards(editingHazard.unforeseenHazards || '');
      setHierarchyElimination(editingHazard.hierarchyElimination || '');
      setHierarchySubstitution(editingHazard.hierarchySubstitution || '');
      setHierarchyEngineering(editingHazard.hierarchyEngineering || '');
      setHierarchyAdministrative(editingHazard.hierarchyAdministrative || '');
      setHierarchyPpe(editingHazard.hierarchyPpe || '');
      setResidualLikelihood(editingHazard.residualLikelihood || 1);
      setResidualSeverity(editingHazard.residualSeverity || 2);
      setStatus(editingHazard.status);
      setReporterName(editingHazard.reporterName || '');
      setReporterDepartment(editingHazard.reporterDepartment || '');
      setAssignedTo(editingHazard.assignedTo || '');
      setTargetDate(editingHazard.targetDate || '');
      setActionPlan(editingHazard.actionPlan || '');
      setCorrectiveNotes(editingHazard.correctiveNotes || '');
      setApplicableLaw(editingHazard.applicableLaw || '');
      setPhotoUrl(editingHazard.photoUrl || '');
      setActiveTab(initialTab || (hasControlMeasures(editingHazard) ? 'controls' : 'report'));
    } else if (initialAiData) {
      // Apply AI Draft
      const draft = initialAiData.recommendedRa01Draft;
      setActivityName(draft.activityName || activityName);
      setUnsafeAct(draft.unsafeAct || '');
      setUnsafeCondition(draft.unsafeCondition || '');
      setConsequences(draft.consequences || '');
      setInitialLikelihood(draft.initialLikelihood || 3);
      setInitialSeverity(draft.initialSeverity || 3);
      setUnforeseenHazards(JSON.stringify(initialAiData.unforeseenHazards));
      setHierarchyElimination(draft.hierarchyControls.elimination || '');
      setHierarchySubstitution(draft.hierarchyControls.substitution || '');
      setHierarchyEngineering(draft.hierarchyControls.engineering || '');
      setHierarchyAdministrative(draft.hierarchyControls.administrative || '');
      setHierarchyPpe(draft.hierarchyControls.ppe || '');
      setResidualLikelihood(draft.residualLikelihood || 1);
      setResidualSeverity(draft.residualSeverity || 2);
      setActionPlan(draft.actionPlan || '');
      if (draft.applicableLawOrStandard) {
        setApplicableLaw(draft.applicableLawOrStandard);
      }
      setActiveTab(initialTab);
    } else {
      setActiveTab('report');
    }
  }, [editingHazard, initialAiData, initialTab]);

  // Calculations
  const initialRiskScore = initialLikelihood * initialSeverity;
  const initialRiskLevel: RiskLevel = calculateRiskLevel(initialRiskScore);
  const initialRiskBadge = getRiskBadgeConfig(initialRiskLevel);

  const residualRiskScore = residualLikelihood * residualSeverity;
  const residualRiskLevel: RiskLevel = calculateRiskLevel(residualRiskScore);
  const residualRiskBadge = getRiskBadgeConfig(residualRiskLevel);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('ขนาดไฟล์ภาพต้องไม่เกิน 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler: Saves either from Tab 1 (Initial Report) or Tab 2 (Controls & Feedback)
  const handleSaveData = async (saveAsReportOnly = false) => {
    if (!activityName.trim()) {
      setErrorMsg('กรุณาระบุกิจกรรม / งานที่ปฏิบัติ');
      setActiveTab('report');
      return;
    }
    if (!workArea.trim()) {
      setErrorMsg('กรุณาระบุสถานที่ / แผนก');
      setActiveTab('report');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      // Determine final status
      let finalStatus = status;
      if (saveAsReportOnly && (!editingHazard || status === 'reported')) {
        finalStatus = 'reported';
      } else if (!saveAsReportOnly && status === 'reported' && (hierarchyElimination || hierarchyEngineering || hierarchyPpe || actionPlan)) {
        // If controls were provided, advance to investigating or in_progress
        finalStatus = 'in_progress';
      }

      await onSave({
        code,
        activityName,
        workArea,
        workStep,
        hazardCategory,
        unsafeAct,
        unsafeCondition,
        consequences,
        initialLikelihood,
        initialSeverity,
        initialRiskScore,
        initialRiskLevel,
        unforeseenHazards,
        hierarchyElimination,
        hierarchySubstitution,
        hierarchyEngineering,
        hierarchyAdministrative,
        hierarchyPpe,
        residualLikelihood,
        residualSeverity,
        residualRiskScore,
        residualRiskLevel,
        status: finalStatus,
        reporterName,
        reporterDepartment,
        assignedTo,
        targetDate,
        actionPlan,
        correctiveNotes,
        applicableLaw,
        photoUrl,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveData(activeTab === 'report');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl text-slate-900 relative">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 p-4 sm:p-5 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shadow-md">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {editingHazard ? 'แบบฟอร์มประเมินความเสี่ยง RA-01' : 'แบบฟอร์มการชี้บ่งอันตรายและประเมินความเสี่ยง (RA-01)'}
                </h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-amber-700 border border-slate-200">
                  {code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                กระบวนการแบ่งเป็น 2 ส่วน: ผู้ชี้บ่งกรอกรายงานเบื้องต้น & จป./ผู้รับผิดชอบตอบกลับมาตรการ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAiAssistant}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              <span className="hidden sm:inline">ให้ AI วิเคราะห์อันตรายแฝง</span>
              <span className="sm:hidden">AI วิเคราะห์</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 2-Phase Mode Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 pt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'report'
                ? 'border-amber-500 text-amber-900 bg-white rounded-t-xl border-t border-x border-slate-200 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList className="h-4 w-4 text-amber-600" />
            <span>ส่วนที่ 1: ชี้บ่งอันตราย & ประเมินเบื้องต้น</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold hidden md:inline">
              ผู้ชี้บ่ง / หน้างาน
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('controls')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'controls'
                ? 'border-indigo-600 text-indigo-950 bg-white rounded-t-xl border-t border-x border-slate-200 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <span>ส่วนที่ 2: มาตรการ 5 ขั้น & Residual Risk</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded font-semibold hidden md:inline">
              จป. / ตอบกลับ Feedback
            </span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 1: ส่วนที่ 1: ชี้บ่งอันตรายและประเมินความเสี่ยงเบื้องต้น (Initial Hazard Identification) */}
          {/* ============================================================ */}
          {activeTab === 'report' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Guidance Callout */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">ขั้นตอนสำหรับผู้ชี้บ่งอันตราย (Hazard Identifier):</strong> กรอกข้อมูลกิจกรรมการทำงาน, สภาพ/การกระทำที่ไม่ปลอดภัย, ผลกระทบ, ประเมินคะแนนความเสี่ยงเบื้องต้น (4×4), และแนบภาพถ่ายสภาพอันตราย
                  เมื่อบันทึกแล้ว รายการจะถูกส่งต่อไปยัง จป.วิชาชีพ / ผู้รับผิดชอบ เพื่อตอบกลับมาตรการควบคุมต่อไป
                </div>
              </div>

              {/* 1.1 ข้อมูลทั่วไปและกิจกรรมการทำงาน */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h4 className="font-bold text-sm text-slate-800">
                    ข้อมูลทั่วไปและกิจกรรมการทำงาน (General Information & Activity)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Activity Name */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      กิจกรรม / งานที่ปฏิบัติ (Work Activity) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={activityName}
                      onChange={(e) => setActivityName(e.target.value)}
                      placeholder="เช่น การถ่ายเทสารเคมีไวไฟ, การซ่อมบำรุงสายพานลำเลียง, การทำงานบนที่สูง..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900"
                    />
                  </div>

                  {/* Work Area */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      สถานที่ / แผนก (Work Area) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={workArea}
                      onChange={(e) => setWorkArea(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {WORK_AREAS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Hazard Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      หมวดหมู่อันตราย (Hazard Category) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={hazardCategory}
                      onChange={(e) => setHazardCategory(e.target.value as HazardCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {HAZARD_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nameTh}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Work Step */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ขั้นตอนการปฏิบัติงานโดยย่อ (Work Step Details)
                    </label>
                    <textarea
                      rows={2}
                      value={workStep}
                      onChange={(e) => setWorkStep(e.target.value)}
                      placeholder="ระบุขั้นตอน เช่น การเตรียมเครื่องมือ, การเปิดเครื่อง, การถ่ายสารเคมี, การเคลื่อนย้าย..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 1.2 การชี้บ่งอันตราย & อันตรายแฝง */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h4 className="font-bold text-sm text-slate-800">
                    การชี้บ่งอันตราย & สภาพแวดล้อมที่ไม่ปลอดภัย (Hazard Identification)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Unsafe Condition */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      สภาพการทำงานที่ไม่ปลอดภัย (Unsafe Condition)
                    </label>
                    <textarea
                      rows={2}
                      value={unsafeCondition}
                      onChange={(e) => setUnsafeCondition(e.target.value)}
                      placeholder="เช่น ไม่มีฝาครอบป้องกันเครื่องจักร, พื้นลื่นมีคราบน้ำมัน, แสงสว่างไม่พอ, มีไอระเหยสะสม..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Unsafe Act */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      การกระทำที่ไม่ปลอดภัย (Unsafe Act)
                    </label>
                    <textarea
                      rows={2}
                      value={unsafeAct}
                      onChange={(e) => setUnsafeAct(e.target.value)}
                      placeholder="เช่น ไม่สวมถุงมือกันสารเคมี, ไม่ตัดแยกระบบไฟฟ้า LOTO, ยื่นมือเข้าจุดหมุน, ยกของผิดท่า..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Consequences */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ผลกระทบ / ความเสียหายที่อาจเกิดขึ้น (Consequences / Potential Harm)
                    </label>
                    <input
                      type="text"
                      value={consequences}
                      onChange={(e) => setConsequences(e.target.value)}
                      placeholder="เช่น บาดเจ็บกระดูกหัก, ไฟลวก, สูดดมไอระเหยเป็นพิษ, สูญเสียอวัยวะ, เพลิงไหม้..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 1.3 การประเมินระดับความเสี่ยงเบื้องต้น (Initial Risk Assessment 4x4) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <h4 className="font-bold text-sm text-slate-800">
                      การประเมินระดับความเสี่ยงเบื้องต้น (Initial Risk 4×4: L × S)
                    </h4>
                  </div>

                  <div className={`px-3 py-1 rounded-xl text-xs font-bold border ${initialRiskBadge.bg}`}>
                    ระดับความเสี่ยงเบื้องต้น: {initialRiskScore} คะแนน ({initialRiskBadge.labelTh})
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {/* Likelihood 1-4 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-800">
                        โอกาสเกิดอันตราย (Likelihood: L): <strong className="text-amber-700 font-mono text-sm">{initialLikelihood}</strong> / 4
                      </label>
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                        {initialLikelihood === 1 && 'ระดับ 1: น้อยมาก'}
                        {initialLikelihood === 2 && 'ระดับ 2: น้อย'}
                        {initialLikelihood === 3 && 'ระดับ 3: ปานกลาง'}
                        {initialLikelihood === 4 && 'ระดับ 4: สูง'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      value={initialLikelihood}
                      onChange={(e) => setInitialLikelihood(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="grid grid-cols-4 text-[10px] text-slate-500 text-center gap-1">
                      <span className="bg-white p-1 rounded border border-slate-200 leading-tight">1: น้อยมาก<br/>(≥10 ปี)</span>
                      <span className="bg-white p-1 rounded border border-slate-200 leading-tight">2: น้อย<br/>(5-10 ปี)</span>
                      <span className="bg-white p-1 rounded border border-slate-200 leading-tight">3: ปานกลาง<br/>(1-5 ปี)</span>
                      <span className="bg-white p-1 rounded border border-slate-200 leading-tight">4: สูง<br/>(&gt;1 ครั้ง/ปี)</span>
                    </div>
                  </div>

                  {/* Severity 1-4 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-800">
                        ความรุนแรงของผลกระทบ (Severity: S): <strong className="text-red-700 font-mono text-sm">{initialSeverity}</strong> / 4
                      </label>
                      <span className="text-[11px] font-semibold text-red-700 bg-red-100/80 px-2 py-0.5 rounded-md">
                        {initialSeverity === 1 && 'ระดับ 1: เล็กน้อย'}
                        {initialSeverity === 2 && 'ระดับ 2: ปานกลาง'}
                        {initialSeverity === 3 && 'ระดับ 3: สูง'}
                        {initialSeverity === 4 && 'ระดับ 4: วิกฤต/ทุพพลภาพ/เสียชีวิต'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      value={initialSeverity}
                      onChange={(e) => setInitialSeverity(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                    <div className="grid grid-cols-4 text-[10px] text-slate-500 text-center gap-1">
                      <span className="bg-white p-1 rounded border border-slate-200 leading-tight">1: เล็กน้อย<br/>(ปฐมพยาบาล)</span>
                      <span className="bg-white p-1 rounded border border-slate-200 leading-tight">2: ปานกลาง<br/>(รักษาแพทย์)</span>
                      <span className="bg-white p-1 rounded border border-slate-200 leading-tight">3: สูง<br/>(ป่วย/บาดเจ็บหนัก)</span>
                      <span className="bg-white p-1 rounded border border-slate-200 leading-tight">4: วิกฤต<br/>(ทุพพลภาพ/เสียชีวิต)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1.4 ข้อมูลผู้รายงาน & ภาพถ่ายสภาพอันตราย */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                    4
                  </span>
                  <h4 className="font-bold text-sm text-slate-800">
                    ข้อมูลผู้ชี้บ่งอันตราย & ภาพถ่ายหน้างาน (Reporter & Photos)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ชื่อผู้ชี้บ่ง / ผู้รายงานอันตราย (Reporter Name)
                    </label>
                    <input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      แผนก / สังกัดของผู้รายงาน (Department)
                    </label>
                    <input
                      type="text"
                      value={reporterDepartment}
                      onChange={(e) => setReporterDepartment(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  </div>

                  {/* Photo upload */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ภาพถ่ายสภาพอันตราย / สภาพหน้างาน (Hazard Photo)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-semibold transition-colors">
                        <Camera className="h-4 w-4 text-amber-500" />
                        <span>{photoUrl ? 'เปลี่ยนรูปภาพ' : 'อัปโหลดภาพถ่ายสภาพอันตราย'}</span>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                      {photoUrl && (
                        <div className="flex items-center gap-2">
                          <img
                            src={photoUrl}
                            alt="สภาพอันตราย"
                            className="h-10 w-10 object-cover rounded-lg border border-slate-200"
                          />
                          <span className="text-xs text-emerald-600 font-medium">
                            ✓ แนบรูปภาพเรียบร้อยแล้ว
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: ส่วนที่ 2: มาตรการควบคุม 5 ลำดับขั้น & ประเมินความเสี่ยงคงเหลือ (Hierarchy of Controls & Residual Risk) */}
          {/* ============================================================ */}
          {activeTab === 'controls' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Guidance Callout */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">ขั้นตอนสำหรับ จป.วิชาชีพ / ผู้รับผิดชอบ (Feedback & Controls):</strong> ระบุมาตรการควบคุม 5 ลำดับขั้น (Hierarchy of Controls), ประเมินความเสี่ยงคงเหลือหลังมีมาตรการ (Residual Risk: L × S 4×4), กำหนดแผนปฏิบัติการ (CAPA), ผู้รับผิดชอบ และวันกำหนดเสร็จ
                </div>
              </div>

              {/* Summary of Initial Risk */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">งานที่ชี้บ่งอันตราย:</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{activityName || '(ยังไม่ระบุกิจกรรม)'}</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">สถานที่: {workArea} | ผู้รายงาน: {reporterName} ({reporterDepartment})</p>
                </div>
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${initialRiskBadge.bg} shrink-0`}>
                  ความเสี่ยงเริ่มต้น: {initialRiskScore} คะแนน ({initialRiskBadge.labelTh})
                </div>
              </div>

              {/* 2.1 มาตรการควบคุม 5 ลำดับขั้น */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    5
                  </span>
                  <h4 className="font-bold text-sm text-slate-800">
                    มาตรการควบคุมความเสี่ยง 5 ลำดับขั้น (Hierarchy of Controls)
                  </h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-red-600 mb-1">
                      1. การขจัดอันตราย (Elimination) - ทางเลือกที่มีประสิทธิภาพสูงสุด
                    </label>
                    <input
                      type="text"
                      value={hierarchyElimination}
                      onChange={(e) => setHierarchyElimination(e.target.value)}
                      placeholder="เช่น ยกเลิกการใช้สารเคมีไวไฟ, เปลี่ยนกระบวนการเป็นระบบอัตโนมัติ..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-orange-600 mb-1">
                      2. การทดแทน (Substitution)
                    </label>
                    <input
                      type="text"
                      value={hierarchySubstitution}
                      onChange={(e) => setHierarchySubstitution(e.target.value)}
                      placeholder="เช่น เปลี่ยนไปใช้สารเคมีสูตรน้ำที่ไม่ติดไฟ, ใช้วัสดุทดแทนที่เบากว่า..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-600 mb-1">
                      3. การควบคุมทางวิศวกรรม (Engineering Controls)
                    </label>
                    <input
                      type="text"
                      value={hierarchyEngineering}
                      onChange={(e) => setHierarchyEngineering(e.target.value)}
                      placeholder="เช่น ติดตั้ง Machine Guard, ติดตั้งระบบสายดิน/Interlock, ติดตั้งระบบดูดระบายอากาศ..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-600 mb-1">
                      4. การควบคุมทางบริหารจัดการ (Administrative Controls)
                    </label>
                    <input
                      type="text"
                      value={hierarchyAdministrative}
                      onChange={(e) => setHierarchyAdministrative(e.target.value)}
                      placeholder="เช่น จัดทำใบอนุญาตทำงาน (Work Permit), ป้ายเตือนอันตราย, อบรม SWI/SOP, กั้นพื้นที่..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-600 mb-1">
                      5. อุปกรณ์คุ้มครองความปลอดภัยส่วนบุคคล (PPE)
                    </label>
                    <input
                      type="text"
                      value={hierarchyPpe}
                      onChange={(e) => setHierarchyPpe(e.target.value)}
                      placeholder="เช่น หน้ากากป้องกันไอระเหย, ถุงมือกันสารเคมี, หมวกนิรภัย, Full Body Harness..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 2.2 การประเมินความเสี่ยงหลังมีมาตรการ (Residual Risk 4x4) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                      6
                    </span>
                    <h4 className="font-bold text-sm text-slate-800">
                      การประเมินความเสี่ยงหลังมีมาตรการ (Residual Risk 4×4: L × S)
                    </h4>
                  </div>

                  <div className={`px-3 py-1 rounded-xl text-xs font-bold border ${residualRiskBadge.bg}`}>
                    ความเสี่ยงคงเหลือ: {residualRiskScore} คะแนน ({residualRiskBadge.labelTh})
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {/* Residual Likelihood */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-800">
                        โอกาสเกิดหลังควบคุม (Residual L): <strong className="text-emerald-700 font-mono text-sm">{residualLikelihood}</strong> / 4
                      </label>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {residualLikelihood === 1 && '1: น้อยมาก (≥10 ปี)'}
                        {residualLikelihood === 2 && '2: น้อย (5-10 ปี)'}
                        {residualLikelihood === 3 && '3: ปานกลาง (1-5 ปี)'}
                        {residualLikelihood === 4 && '4: สูง (>1 ครั้ง/ปี)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      value={residualLikelihood}
                      onChange={(e) => setResidualLikelihood(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="grid grid-cols-4 text-[10px] text-slate-500 text-center gap-1">
                      <span className="bg-white p-1 rounded border border-slate-200 leading-tight">1: น้อยมาก</span>
                      <span className="bg-white p-1 rounded border border-slate-200 leading-tight">2: น้อย</span>
                      <span className="bg-white p-1 rounded border border-slate-200 leading-tight">3: ปานกลาง</span>
                      <span className="bg-white p-1 rounded border border-slate-200 leading-tight">4: สูง</span>
                    </div>
                  </div>

                  {/* Residual Severity */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-800">
                        ความรุนแรงหลังควบคุม (Residual S): <strong className="text-emerald-700 font-mono text-sm">{residualSeverity}</strong> / 4
                      </label>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {residualSeverity === 1 && '1: เล็กน้อย (ปฐมพยาบาล)'}
                        {residualSeverity === 2 && '2: ปานกลาง (รักษาแพทย์)'}
                        {residualSeverity === 3 && '3: สูง (บาดเจ็บหนัก)'}
                        {residualSeverity === 4 && '4: วิกฤต (ทุพพลภาพ/เสียชีวิต)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      value={residualSeverity}
                      onChange={(e) => setResidualSeverity(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="grid grid-cols-4 text-[10px] text-slate-500 text-center gap-1">
                      <span className="bg-white p-1 rounded border border-slate-200 leading-tight">1: เล็กน้อย</span>
                      <span className="bg-white p-1 rounded border border-slate-200 leading-tight">2: ปานกลาง</span>
                      <span className="bg-white p-1 rounded border border-slate-200 leading-tight">3: สูง</span>
                      <span className="bg-white p-1 rounded border border-slate-200 leading-tight">4: วิกฤต</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2.3 แผนปฏิบัติการ, ผู้รับผิดชอบ, สถานะ, ข้อเสนอแนะ */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                    7
                  </span>
                  <h4 className="font-bold text-sm text-slate-800">
                    แผนปฏิบัติการแก้ไข & ผู้รับผิดชอบ (Action Plan & CAPA)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Action Plan */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      แผนปฏิบัติการแก้ไข (Action Plan / CAPA)
                    </label>
                    <textarea
                      rows={2}
                      value={actionPlan}
                      onChange={(e) => setActionPlan(e.target.value)}
                      placeholder="ระบุสิ่งที่ต้องจัดทำ งบประมาณ วิธีการ หรือขั้นตอนการแก้ไข..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  </div>

                  {/* Assignee */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ผู้รับผิดชอบดำเนินการแก้ไข (Assignee)
                    </label>
                    <input
                      type="text"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      placeholder="เช่น วิศวกรซ่อมบำรุง, หัวหน้าแผนกผลิต..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  </div>

                  {/* Target Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      กำหนดเสร็จสิ้น (Target Due Date)
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      สถานะการดำเนินการ (Real-time Status)
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as HazardStatus)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="reported">แจ้งใหม่ / รอตรวจสอบ</option>
                      <option value="investigating">กำลังตรวจประเมิน</option>
                      <option value="in_progress">กำลังดำเนินการแก้ไข</option>
                      <option value="resolved">แก้ไขแล้ว / รอตรวจรับ</option>
                      <option value="verified">จป. ตรวจรับรองแล้ว</option>
                    </select>
                  </div>

                  {/* Applicable Law */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      กฎหมายความปลอดภัยหรือมาตรฐานอ้างอิง
                    </label>
                    <input
                      type="text"
                      value={applicableLaw}
                      onChange={(e) => setApplicableLaw(e.target.value)}
                      placeholder="เช่น กฎกระทรวงสารเคมี 2556, กฎกระทรวงเครื่องจักร 2564..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  </div>

                  {/* Corrective Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      บันทึกข้อเสนอแนะ / ความคืบหน้า (Feedback & Progress Notes)
                    </label>
                    <textarea
                      rows={2}
                      value={correctiveNotes}
                      onChange={(e) => setCorrectiveNotes(e.target.value)}
                      placeholder="บันทึกข้อเสนอแนะเพิ่มเติมจาก จป. หรือความคืบหน้า..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {activeTab === 'report' ? (
                <span>📝 ส่วนที่ 1: สำหรับผู้ชี้บ่งอันตรายหน้างาน</span>
              ) : (
                <span>🛡️ ส่วนที่ 2: สำหรับ จป. / ผู้รับผิดชอบตอบกลับมาตรการ</span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                ยกเลิก
              </button>

              {activeTab === 'report' ? (
                <>
                  {/* Save Report Only (For regular reporters) */}
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSaveData(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>บันทึกชี้บ่งอันตราย (รอมาตรการตอบกลับ)</span>
                  </button>

                  {/* Move to Tab 2 */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!activityName.trim()) {
                        setErrorMsg('กรุณาระบุกิจกรรม / งานที่ปฏิบัติก่อนไปขั้นตอนถัดไป');
                        return;
                      }
                      setErrorMsg(null);
                      setActiveTab('controls');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-98 transition-all"
                  >
                    <span>ไประบุมาตรการ 5 ขั้น</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  {/* Back to Tab 1 */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('report')}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>ย้อนกลับไปส่วนที่ 1</span>
                  </button>

                  {/* Save Full Form (Including Controls & Residual Risk) */}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-98 transition-all disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>กำลังบันทึกลง Firebase...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>บันทึกมาตรการควบคุม & แผนปฏิบัติการ</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
