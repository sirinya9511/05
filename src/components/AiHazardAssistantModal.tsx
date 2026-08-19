import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Send,
  Loader2,
  CheckCircle2,
  PlusCircle,
  FileSpreadsheet,
  Zap,
  Flame,
  Volume2,
  Activity,
  Layers,
  ChevronRight,
  Info,
  Camera,
  Upload,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  WORK_AREAS,
  HAZARD_CATEGORIES,
  AIAnalysisResult,
  UnforeseenHazardItem,
  Ra01HazardReport,
} from '../types';

interface AiHazardAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToForm: (aiResult: AIAnalysisResult) => void;
}

export const AiHazardAssistantModal: React.FC<AiHazardAssistantModalProps> = ({
  isOpen,
  onClose,
  onApplyToForm,
}) => {
  const [activity, setActivity] = useState('');
  const [location, setLocation] = useState(WORK_AREAS[0]);
  const [workstep, setWorkstep] = useState('');
  const [toolsUsed, setToolsUsed] = useState('');
  const [environment, setEnvironment] = useState('');
  const [knownHazards, setKnownHazards] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick Scenario Presets for instant testing
  const presets = [
    {
      title: 'งานเชื่อมตัดโลหะใกล้พื้นที่จัดเก็บกล่องกระดาษและสารเคมี',
      activity: 'การตัดและเชื่อมท่อเหล็กด้วยแก๊สออกซิเจน-อะเซทิลีน (Hot Work)',
      location: 'แผนกซ่อมบำรุง (Maintenance)',
      workstep: 'ช่างใช้ชุดตัดแก๊สเพื่อตัดท่อน้ำทิ้งเก่าที่รั่ว โดยวางแนวตัดเหนือพื้น 1.5 เมตร',
      tools: 'ชุดตัดแก๊ส Oxy-Acetylene, เครื่องเจียรลูกหมู 4 นิ้ว, ถังดับเพลิง CO2',
      env: 'ในอาคารปิด มีลมพัดผ่านเบาๆ ใกล้เคียงมีกล่องกระดาษเก็บสินค้าห่างไป 4 เมตร',
    },
    {
      title: 'การตักถ่ายผงสารเคมีและผสมสารในถังใบพัดกวน',
      activity: 'การชั่ง ตวง และเทผงเคมีลงถังผสมขนาด 500 ลิตร',
      location: 'พื้นที่จัดเก็บสารเคมี (Chemical Storage)',
      workstep: 'พนักงานฉีกถุงผงเคมีและเทลงกรวยด้านบนถังกวนขณะที่ใบพัดกำลังหมุน',
      tools: 'ใบพัดกวนมอเตอร์ไฟฟ้า, สกูปตักสแตนเลส, ถุงพลาสติก 25 กก.',
      env: 'ห้องปรับอากาศ อากาศค่อนข้างแห้ง มีแสงสว่างเพียงพอ',
    },
    {
      title: 'การทำความสะอาดบ่อดักไขมัน/บ่อบำบัดน้ำเสียใต้ดิน',
      activity: 'การลอกตะกอนและล้างทำความสะอาดก้นบ่อบำบัดน้ำเสียลึก 3 เมตร',
      location: 'บ่อบำบัดน้ำเสีย (Wastewater Treatment)',
      workstep: 'หย่อนบันไดลงไปและพนักงาน 2 คนลงไปขูดตักกากตะกอนด้วยพลั่ว',
      tools: 'พลั่วตัก, ถังหิ้ว, ปั๊มจุ่ม Submersible, สายยางฉีดน้ำแรงดันสูง',
      env: 'บ่อปิดใต้ดิน ฝาเปิดขนาด 80x80 ซม. มีกลิ่นอับชื้น',
    },
    {
      title: 'การหยิบสินค้าบนชั้นแร็คสูง 7 เมตรในคลังสินค้า',
      activity: 'การจัดเก็บและเบิกจ่ายพาเลทสินค้าบนชั้นวาง Selective Rack',
      location: 'คลังสินค้าและโลจิสติกส์ (Warehouse & Logistics)',
      workstep: 'ขับรถโฟล์คลิฟต์ Reach Truck ยกพาเลทขึ้นไปวางที่ชั้น 4 ของแร็ค',
      tools: 'รถโฟล์คลิฟต์ Reach Truck ไฟฟ้า, พาเลทไม้, บาร์โค้ดสแกนเนอร์',
      env: 'ทางวิ่งระหว่างแร็คกว้าง 2.8 เมตร มีรถโฟล์คลิฟต์คันอื่นวิ่งร่วมทาง',
    },
  ];

  const handleApplyPreset = (p: (typeof presets)[0]) => {
    setActivity(p.activity);
    setLocation(p.location);
    setWorkstep(p.workstep);
    setToolsUsed(p.tools);
    setEnvironment(p.env);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg('รูปภาพมีขนาดใหญ่เกินไป (กรุณาเลือกไฟล์ขนาดไม่เกิน 8MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAiAnalysis = async () => {
    if (!activity.trim() && !imageBase64) {
      setErrorMsg('กรุณากรอกกิจกรรม/งานที่ปฏิบัติ หรืออัปโหลดภาพถ่ายพื้นที่งาน');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/gemini/analyze-hazard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity,
          location,
          workstep,
          toolsUsed,
          environment,
          knownHazards,
          imageBase64,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'การวิเคราะห์ล้มเหลว');
      }

      setAnalysisResult(data.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการติดต่อระบบ AI');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl text-slate-900 relative">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 p-5 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md">
              <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  AI ช่วยชี้บ่งอันตรายที่อาจคาดไม่ถึง (Unforeseen Hazards AI)
                </h3>
                <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                  Gemini 3.7 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                วิเคราะห์ความเสี่ยงแฝง, สาเหตุรากเหง้า, เมทริกซ์ 4x4 และจัดทำมาตรการควบคุม Hierarchy of Controls สำหรับ RA-01
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Quick Scenario Selector */}
          <div>
            <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-600" />
              <span>เลือกสถานการณ์จำลองตัวอย่างในโรงงาน/สถานประกอบกิจการ (Quick Presets):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  className="text-left p-3 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 text-xs transition-all flex items-start justify-between gap-2 group"
                >
                  <span className="font-semibold text-slate-800 group-hover:text-purple-900">
                    {p.title}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-purple-600 shrink-0 mt-0.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Form Inputs for AI Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Activity Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                กิจกรรม / งานที่ปฏิบัติ (Work Activity) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="เช่น การถ่ายเทสารเคมีไวไฟ, การซ่อมบำรุงสายพานลำเลียง, การทำงานบนที่สูง..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            {/* Location / Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                สถานที่ / แผนก / พื้นที่ปฏิบัติงาน
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                {WORK_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* Tools / Machinery Used */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เครื่องมือ / เครื่องจักร / สารเคมีที่เกี่ยวข้อง
              </label>
              <input
                type="text"
                value={toolsUsed}
                onChange={(e) => setToolsUsed(e.target.value)}
                placeholder="เช่น รถโฟล์คลิฟต์, ปั๊มสูบ, เครื่องเจียร, สารทินเนอร์..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            {/* Workstep Breakdown */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ขั้นตอนการปฏิบัติงานโดยละเอียด (Work Steps)
              </label>
              <textarea
                rows={2}
                value={workstep}
                onChange={(e) => setWorkstep(e.target.value)}
                placeholder="ระบุว่าพนักงานทำอะไรบ้าง เช่น เปิดฝาถัง, ใช้มือจับชิ้นงาน, ปืนขึ้นนั่งร้าน..."
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            {/* Environment / Known Hazards */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                สภาพแวดล้อมโดยรอบ (แสง/เสียง/ความร้อน/อากาศ)
              </label>
              <input
                type="text"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                placeholder="เช่น พื้นลื่นมีคราบน้ำมัน, อากาศร้อนอบอ้าว, เสียงดัง..."
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            {/* Photo upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                แนบภาพถ่ายหน้างาน / เครื่องจักร (ไม่บังคับ)
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-dashed border-slate-300 hover:border-purple-500 text-xs text-slate-700 transition-colors">
                  <Camera className="h-4 w-4 text-purple-600" />
                  <span>{imageBase64 ? 'เปลี่ยนภาพถ่าย' : 'อัปโหลดภาพถ่ายพื้นที่งาน'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {imageBase64 && (
                  <button
                    onClick={() => setImageBase64(null)}
                    className="px-2.5 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium"
                  >
                    ลบรูป
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Button: Start AI Scan */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={runAiAnalysis}
              disabled={isAnalyzing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:brightness-110 text-white font-bold text-sm shadow-lg shadow-purple-600/20 active:scale-98 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-yellow-300" />
                  <span>AI กำลังประมวลผลชี้บ่งอันตรายแฝงและกฎหมายความปลอดภัย...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  <span>เริ่มต้นวิเคราะห์ชี้บ่งอันตรายด้วย AI (Scan Hazards)</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Results Display */}
          {analysisResult && (
            <div className="space-y-6 pt-4 border-t border-slate-200 animate-fadeIn">
              {/* Top Banner Summary */}
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-800 flex items-center gap-1.5 mb-1">
                      <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                      ผลการวิเคราะห์ภาพรวมความเสี่ยง (Executive Summary)
                    </span>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      {analysisResult.summary}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onApplyToForm(analysisResult);
                      onClose();
                    }}
                    className="shrink-0 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-amber-400" />
                    <span>นำข้อมูลลงฟอร์ม RA-01 ทันที</span>
                  </button>
                </div>
              </div>

              {/* 1. Unforeseen Hazards Section (อันตรายแฝงที่มักคาดไม่ถึง) */}
              <div>
                <h4 className="font-bold text-base text-slate-900 flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span>อันตรายแฝงที่อาจคาดไม่ถึง (Unforeseen & Hidden Hazards):</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysisResult.unforeseenHazards.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-300 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                          {item.hazardName}
                        </h5>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 whitespace-nowrap">
                          {item.riskLevel} (L:{item.likelihood} × S:{item.severity})
                        </span>
                      </div>

                      <div className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                        <strong className="text-amber-950">💡 ทำไมถึงมักคาดไม่ถึง:</strong> {item.whyUnforeseen}
                      </div>

                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">💥 ผลกระทบ:</strong> {item.potentialConsequence}
                      </div>

                      {/* Controls snippet */}
                      <div className="text-xs text-slate-600 pt-1.5 border-t border-slate-200 space-y-1">
                        {item.suggestedControls.engineering && (
                          <div>
                            <span className="text-indigo-700 font-bold">🛡️ วิศวกรรม:</span>{' '}
                            {item.suggestedControls.engineering}
                          </div>
                        )}
                        {item.suggestedControls.administrative && (
                          <div>
                            <span className="text-emerald-700 font-bold">📋 บริหารจัดการ:</span>{' '}
                            {item.suggestedControls.administrative}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Hierarchy of Controls (5 ลำดับขั้นการควบคุม) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-emerald-600" />
                  <span>มาตรการควบคุมความเสี่ยงตามลำดับขั้น (Hierarchy of Controls for RA-01):</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="font-bold text-red-600 block mb-1">1. ขจัดอันตราย</span>
                    <span className="text-slate-700">
                      {analysisResult.recommendedRa01Draft.hierarchyControls.elimination || 'ไม่มี/ไม่สามารถขจัดได้'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="font-bold text-orange-600 block mb-1">2. ทดแทน</span>
                    <span className="text-slate-700">
                      {analysisResult.recommendedRa01Draft.hierarchyControls.substitution || 'ไม่มี/ใช้วิธีการเดิม'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="font-bold text-amber-600 block mb-1">3. วิศวกรรม</span>
                    <span className="text-slate-700">
                      {analysisResult.recommendedRa01Draft.hierarchyControls.engineering || '-'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="font-bold text-blue-600 block mb-1">4. บริหารจัดการ</span>
                    <span className="text-slate-700">
                      {analysisResult.recommendedRa01Draft.hierarchyControls.administrative || '-'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="font-bold text-emerald-600 block mb-1">5. อุปกรณ์ PPE</span>
                    <span className="text-slate-700">
                      {analysisResult.recommendedRa01Draft.hierarchyControls.ppe || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Quick Safety Tips */}
              {analysisResult.quickSafetyTips && analysisResult.quickSafetyTips.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <h5 className="font-bold text-xs text-amber-900 mb-2 flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-amber-600" />
                    <span>ข้อควรระวังด่วนก่อนเริ่มงาน (Quick Safety Checkpoint):</span>
                  </h5>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800">
                    {analysisResult.quickSafetyTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-amber-100">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky top-full bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 flex items-center justify-between z-20">
          <div className="text-xs text-slate-500">
            ระบบจัดเก็บข้อมูลลงบน Firestore คอลเลกชัน <strong>ra01_hazards</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              ปิดหน้าต่าง
            </button>
            {analysisResult && (
              <button
                onClick={() => {
                  onApplyToForm(analysisResult);
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
              >
                + ส่งข้อมูลเข้าแบบฟอร์ม RA-01
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
