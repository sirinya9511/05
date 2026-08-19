import React from 'react';
import { Printer, X, ShieldAlert, FileText, CheckSquare, Square } from 'lucide-react';
import { Ra01HazardReport, getRiskBadgeConfig, HAZARD_CATEGORIES } from '../types';

interface PrintRa01SheetProps {
  hazards: Ra01HazardReport[];
  singleHazard?: Ra01HazardReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintRa01Sheet: React.FC<PrintRa01SheetProps> = ({
  hazards,
  singleHazard,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const printItems = singleHazard ? [singleHazard] : hazards;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white text-slate-900 rounded-3xl max-w-5xl w-full max-h-[94vh] overflow-y-auto shadow-2xl p-6 sm:p-8 print:max-w-none print:max-h-none print:shadow-none print:rounded-none print:p-4">
        {/* Print controls (hidden on print) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900">
              {singleHazard
                ? `พิมพ์แบบฟอร์ม RA-01 (${singleHazard.code})`
                : `พิมพ์ทะเบียนชี้บ่งอันตราย RA-01 (${hazards.length} รายการ)`}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>พิมพ์ / ส่งออก PDF (Print / Export)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-wide text-slate-900">
              แบบฟอร์มการชี้บ่งอันตรายและการประเมินความเสี่ยง (RA-01)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              ตาม พ.ร.บ. ความปลอดภัย อาชีวอนามัย และสภาพแวดล้อมในการทำงาน พ.ศ. 2554 และ ISO 45001:2018
            </p>
            <div className="flex justify-between items-center text-xs text-slate-500 mt-3 px-2">
              <span>วันที่พิมพ์: {new Date().toLocaleDateString('th-TH')}</span>
              <span>สถานประกอบกิจการ / แผนกความปลอดภัยและอาชีวอนามัย (EHS)</span>
              <span>ระบบจัดเก็บ: Firebase Cloud RA01</span>
            </div>
          </div>

          {/* Table of Hazards */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="border border-slate-300 p-2 w-16 text-center">รหัส</th>
                  <th className="border border-slate-300 p-2 w-48">กิจกรรม / พื้นที่</th>
                  <th className="border border-slate-300 p-2">อันตราย & อันตรายแฝง</th>
                  <th className="border border-slate-300 p-2 w-20 text-center">
                    ความเสี่ยงเริ่มต้น
                    <br />
                    (L×S)
                  </th>
                  <th className="border border-slate-300 p-2">มาตรการควบคุม (Hierarchy of Controls)</th>
                  <th className="border border-slate-300 p-2 w-20 text-center">
                    ความเสี่ยงคงเหลือ
                    <br />
                    (L×S)
                  </th>
                  <th className="border border-slate-300 p-2 w-28 text-center">สถานะ / ผู้รับผิดชอบ</th>
                </tr>
              </thead>
              <tbody>
                {printItems.map((h) => {
                  const initBadge = getRiskBadgeConfig(h.initialRiskLevel);
                  const resBadge = getRiskBadgeConfig(h.residualRiskLevel);

                  return (
                    <tr key={h.id} className="border-b border-slate-300 align-top">
                      <td className="border border-slate-300 p-2 font-mono font-bold text-center">
                        {h.code}
                      </td>
                      <td className="border border-slate-300 p-2 space-y-1">
                        <strong className="block text-slate-900">{h.activityName}</strong>
                        <span className="text-slate-500 block">📍 {h.workArea}</span>
                        <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 border border-slate-200">
                          {h.hazardCategory}
                        </span>
                      </td>
                      <td className="border border-slate-300 p-2 space-y-1">
                        {h.unsafeCondition && (
                          <div>
                            <strong className="text-slate-700">สภาพไม่ปลอดภัย:</strong> {h.unsafeCondition}
                          </div>
                        )}
                        {h.unsafeAct && (
                          <div>
                            <strong className="text-slate-700">การกระทำไม่ปลอดภัย:</strong> {h.unsafeAct}
                          </div>
                        )}
                        {h.consequences && (
                          <div className="text-red-700">
                            <strong>ผลกระทบ:</strong> {h.consequences}
                          </div>
                        )}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        <span className="font-extrabold font-mono text-sm block">
                          {h.initialRiskScore}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          ({h.initialLikelihood}×{h.initialSeverity})
                        </span>
                        <span className="text-[10px] font-bold block mt-0.5">{initBadge.labelTh}</span>
                      </td>
                      <td className="border border-slate-300 p-2 space-y-1 text-[11px]">
                        {h.hierarchyEngineering && (
                          <div>
                            <strong>วิศวกรรม:</strong> {h.hierarchyEngineering}
                          </div>
                        )}
                        {h.hierarchyAdministrative && (
                          <div>
                            <strong>บริหาร:</strong> {h.hierarchyAdministrative}
                          </div>
                        )}
                        {h.hierarchyPpe && (
                          <div>
                            <strong>PPE:</strong> {h.hierarchyPpe}
                          </div>
                        )}
                        {h.actionPlan && (
                          <div className="pt-1 text-slate-600 border-t border-slate-200">
                            <strong>แผนงาน:</strong> {h.actionPlan}
                          </div>
                        )}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        <span className="font-extrabold font-mono text-sm block">
                          {h.residualRiskScore}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          ({h.residualLikelihood}×{h.residualSeverity})
                        </span>
                        <span className="text-[10px] font-bold block mt-0.5">{resBadge.labelTh}</span>
                      </td>
                      <td className="border border-slate-300 p-2 text-center space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-slate-300">
                          {h.status}
                        </span>
                        <span className="block text-slate-600 text-[11px]">
                          {h.assignedTo || '-'}
                        </span>
                        {h.targetDate && (
                          <span className="block text-[10px] text-slate-400">ครบ: {h.targetDate}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 4x4 Risk Matrix Criteria Reference Table for RA-01 */}
          <div className="bg-slate-50 border border-slate-300 rounded-2xl p-4 text-[11px] space-y-3 print:border-slate-300 print:bg-white print:rounded-none">
            <div className="font-bold text-slate-800 flex items-center justify-between border-b border-slate-300 pb-1.5">
              <span className="text-xs">ตารางเกณฑ์การประเมินความเสี่ยง 4×4 Risk Assessment Matrix (แบบฟอร์ม RA-01)</span>
              <span className="text-[10px] text-slate-500 font-mono">คะแนนความเสี่ยง = โอกาสเกิด (L 1-4) × ความรุนแรง (S 1-4)</span>
            </div>

            {/* Visual 4x4 Matrix Table with Likelihood at the top */}
            <div className="border border-slate-200 rounded-xl p-3 bg-white print:border-slate-300">
              <div className="text-center font-bold text-xs text-slate-800 mb-2 py-1 bg-amber-100 rounded-lg border border-amber-200">
                🎯 โอกาสเกิดอันตราย (Likelihood: L)
              </div>
              <div className="grid grid-cols-[130px_1fr_1fr_1fr_1fr] gap-1.5 text-center text-[10px]">
                <div className="font-bold text-slate-700 self-center text-right pr-2">ความรุนแรง (S) ↓</div>
                <div className="p-1 rounded bg-slate-100 font-bold">1: น้อยมาก<br/>(≥10 ปี)</div>
                <div className="p-1 rounded bg-slate-100 font-bold">2: น้อย<br/>(5-10 ปี)</div>
                <div className="p-1 rounded bg-slate-100 font-bold">3: ปานกลาง<br/>(1-5 ปี)</div>
                <div className="p-1 rounded bg-slate-100 font-bold">4: สูง<br/>(&gt;1 ครั้ง/ปี)</div>

                {/* S=4 */}
                <div className="p-1 text-right pr-2 font-bold text-slate-800">4: วิกฤต (ทุพพลภาพ/เสียชีวิต)</div>
                <div className="p-1.5 rounded bg-yellow-400 font-bold">4 (ปานกลาง)</div>
                <div className="p-1.5 rounded bg-amber-500 font-bold">8 (สูง)</div>
                <div className="p-1.5 rounded bg-red-500 text-white font-bold">12 (วิกฤต)</div>
                <div className="p-1.5 rounded bg-red-500 text-white font-bold">16 (วิกฤต)</div>

                {/* S=3 */}
                <div className="p-1 text-right pr-2 font-bold text-slate-800">3: สูง (ป่วย/บาดเจ็บหนัก)</div>
                <div className="p-1.5 rounded bg-yellow-400 font-bold">3 (ปานกลาง)</div>
                <div className="p-1.5 rounded bg-yellow-400 font-bold">6 (ปานกลาง)</div>
                <div className="p-1.5 rounded bg-amber-500 font-bold">9 (สูง)</div>
                <div className="p-1.5 rounded bg-red-500 text-white font-bold">12 (วิกฤต)</div>

                {/* S=2 */}
                <div className="p-1 text-right pr-2 font-bold text-slate-800">2: ปานกลาง (รักษาแพทย์)</div>
                <div className="p-1.5 rounded bg-emerald-500 text-white font-bold">2 (เล็กน้อย)</div>
                <div className="p-1.5 rounded bg-yellow-400 font-bold">4 (ปานกลาง)</div>
                <div className="p-1.5 rounded bg-yellow-400 font-bold">6 (ปานกลาง)</div>
                <div className="p-1.5 rounded bg-amber-500 font-bold">8 (สูง)</div>

                {/* S=1 */}
                <div className="p-1 text-right pr-2 font-bold text-slate-800">1: เล็กน้อย (ปฐมพยาบาล)</div>
                <div className="p-1.5 rounded bg-emerald-500 text-white font-bold">1 (เล็กน้อย)</div>
                <div className="p-1.5 rounded bg-emerald-500 text-white font-bold">2 (เล็กน้อย)</div>
                <div className="p-1.5 rounded bg-yellow-400 font-bold">3 (ปานกลาง)</div>
                <div className="p-1.5 rounded bg-yellow-400 font-bold">4 (ปานกลาง)</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Likelihood Table */}
              <div className="border border-slate-200 rounded-xl p-2.5 bg-white print:border-slate-300">
                <div className="font-bold text-slate-800 text-[10px] border-b border-slate-200 pb-1 mb-1.5 flex justify-between">
                  <span>โอกาสเกิดเหตุการณ์ (Likelihood: L)</span>
                  <span>ระดับ</span>
                </div>
                <div className="space-y-1 text-[10px] text-slate-700">
                  <p><strong>ระดับ 1 (น้อยมาก):</strong> ไม่เคยเกิดขึ้นเลย ≥ 10 ปี</p>
                  <p><strong>ระดับ 2 (น้อย):</strong> ความถี่ 1 ครั้ง ใน 5-10 ปี</p>
                  <p><strong>ระดับ 3 (ปานกลาง):</strong> ความถี่ 1 ครั้ง ใน 1-5 ปี</p>
                  <p><strong>ระดับ 4 (สูง):</strong> เกิดมากกว่า 1 ครั้ง ใน 1 ปี</p>
                </div>
              </div>

              {/* Severity Table */}
              <div className="border border-slate-200 rounded-xl p-2.5 bg-white print:border-slate-300">
                <div className="font-bold text-slate-800 text-[10px] border-b border-slate-200 pb-1 mb-1.5 flex justify-between">
                  <span>ความรุนแรงของอันตราย (Severity: S)</span>
                  <span>ระดับ</span>
                </div>
                <div className="space-y-1 text-[10px] text-slate-700">
                  <p><strong>ระดับ 1 (เล็กน้อย):</strong> บาดเจ็บระดับปฐมพยาบาล</p>
                  <p><strong>ระดับ 2 (ปานกลาง):</strong> บาดเจ็บต้องรักษาทางการแพทย์</p>
                  <p><strong>ระดับ 3 (สูง):</strong> บาดเจ็บหรือป่วยที่รุนแรง</p>
                  <p><strong>ระดับ 4 (วิกฤต):</strong> ทุพพลภาพหรือเสียชีวิต</p>
                </div>
              </div>

              {/* Risk Level Table */}
              <div className="border border-slate-200 rounded-xl p-2.5 bg-white print:border-slate-300">
                <div className="font-bold text-slate-800 text-[10px] border-b border-slate-200 pb-1 mb-1.5 flex justify-between">
                  <span>การจัดระดับความเสี่ยง & การดำเนินการ</span>
                  <span>คะแนน</span>
                </div>
                <div className="space-y-1 text-[10px]">
                  <p className="text-red-700"><strong>12-16 ยอมรับไม่ได้:</strong> หยุดงานและปรับปรุงแก้ไขทันที</p>
                  <p className="text-amber-700"><strong>8-9 สูง:</strong> ต้องดำเนินการลดความเสี่ยงเร่งด่วน</p>
                  <p className="text-yellow-700"><strong>3-6 ปานกลาง:</strong> ต้องทบทวนมาตรการควบคุม</p>
                  <p className="text-emerald-700"><strong>1-2 เล็กน้อย:</strong> ยอมรับได้ ปฏิบัติตามมาตรฐานปกติ</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sign-off Signature Section */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-slate-900 text-xs text-center">
            <div className="space-y-6">
              <p className="font-bold text-slate-800">ผู้จัดทำ / ผู้ชี้บ่งอันตราย</p>
              <div className="border-b border-dotted border-slate-400 w-40 mx-auto" />
              <p className="text-slate-600">(........................................................)</p>
              <p className="text-[11px] text-slate-500">วันที่ ......../......../............</p>
            </div>

            <div className="space-y-6">
              <p className="font-bold text-slate-800">เจ้าหน้าที่ความปลอดภัยในการทำงาน (จป.วิชาชีพ)</p>
              <div className="border-b border-dotted border-slate-400 w-40 mx-auto" />
              <p className="text-slate-600">(........................................................)</p>
              <p className="text-[11px] text-slate-500">วันที่ ......../......../............</p>
            </div>

            <div className="space-y-6">
              <p className="font-bold text-slate-800">ผู้มีอำนาจอนุมัติ / ผู้จัดการสถานประกอบการ</p>
              <div className="border-b border-dotted border-slate-400 w-40 mx-auto" />
              <p className="text-slate-600">(........................................................)</p>
              <p className="text-[11px] text-slate-500">วันที่ ......../......../............</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
