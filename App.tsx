/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  subscribeToHazards,
  createHazardReport,
  updateHazardReport,
  deleteHazardReport,
  seedInitialSampleHazardsIfEmpty,
  resetTo3SampleHazards,
} from './firebase';
import { Ra01HazardReport, HazardStatus, AIAnalysisResult } from './types';
import { Header } from './components/Header';
import { RealtimeDashboard } from './components/RealtimeDashboard';
import { RiskMatrixHeatmap } from './components/RiskMatrixHeatmap';
import { HazardList } from './components/HazardList';
import { HazardFormModal } from './components/HazardFormModal';
import { AiHazardAssistantModal } from './components/AiHazardAssistantModal';
import { HazardDetailModal } from './components/HazardDetailModal';
import { PrintRa01Sheet } from './components/PrintRa01Sheet';
import {
  Sparkles,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  PlusCircle,
} from 'lucide-react';

export default function App() {
  const [hazards, setHazards] = useState<Ra01HazardReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters & Selected State
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedMatrixL, setSelectedMatrixL] = useState<number | null>(null);
  const [selectedMatrixS, setSelectedMatrixS] = useState<number | null>(null);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHazard, setEditingHazard] = useState<Ra01HazardReport | null>(null);
  const [selectedAiDraft, setSelectedAiDraft] = useState<AIAnalysisResult | null>(null);
  const [formInitialTab, setFormInitialTab] = useState<'report' | 'controls'>('report');

  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [viewingHazard, setViewingHazard] = useState<Ra01HazardReport | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [printSingleHazard, setPrintSingleHazard] = useState<Ra01HazardReport | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Initialize and subscribe to Firestore in real-time
  useEffect(() => {
    setIsLoading(true);

    // Initial check to seed sample data if empty
    seedInitialSampleHazardsIfEmpty().catch((err) => {
      console.warn('Seed sample hazards check:', err);
    });

    // Real-time Firestore subscription
    const unsubscribe = subscribeToHazards(
      (data) => {
        setHazards(data);
        setIsLoading(false);
        setIsRealtimeConnected(true);
      },
      (error) => {
        console.error('Realtime Firestore subscription error:', error);
        setErrorMessage(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Firebase Firestore');
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Handle Create or Update Hazard
  const handleSaveHazard = async (reportData: Omit<Ra01HazardReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingHazard) {
        await updateHazardReport(editingHazard.id, reportData);
        showToast(`อัปเดตแบบฟอร์ม ${editingHazard.code} สำเร็จ`, 'success');
      } else {
        const newId = await createHazardReport(reportData);
        showToast(`บันทึกชี้บ่งอันตราย ${reportData.code} ลงใน Firebase RA01 สำเร็จ`, 'success');
      }
      setIsFormOpen(false);
      setEditingHazard(null);
      setSelectedAiDraft(null);
    } catch (err: any) {
      console.error('Save hazard error:', err);
      showToast(`บันทึกไม่สำเร็จ: ${err.message}`, 'error');
      throw err;
    }
  };

  // Handle Quick Status Change in Real-time
  const handleStatusChange = async (id: string, status: HazardStatus) => {
    try {
      await updateHazardReport(id, { status });
      showToast(`อัปเดตสถานะแบบ Real-time เรียบร้อยแล้ว`, 'info');
      // If currently viewing detail, update it
      if (viewingHazard && viewingHazard.id === id) {
        setViewingHazard({ ...viewingHazard, status });
      }
    } catch (err: any) {
      console.error('Status change error:', err);
      showToast(`ไม่สามารถเปลี่ยนสถานะได้: ${err.message}`, 'error');
    }
  };

  // Handle Delete
  const handleDeleteHazard = async (id: string) => {
    try {
      await deleteHazardReport(id);
      showToast(`ลบรายการสำเร็จ`, 'info');
      if (viewingHazard && viewingHazard.id === id) {
        setIsDetailOpen(false);
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast(`ไม่สามารถลบรายการได้: ${err.message}`, 'error');
    }
  };

  // Handle Add Corrective Note
  const handleAddCorrectiveNote = async (id: string, note: string) => {
    try {
      await updateHazardReport(id, { correctiveNotes: note });
      showToast(`บันทึกความคืบหน้าสำเร็จ`, 'success');
      if (viewingHazard && viewingHazard.id === id) {
        setViewingHazard({ ...viewingHazard, correctiveNotes: note });
      }
    } catch (err: any) {
      showToast(`ไม่สามารถบันทึกข้อความได้: ${err.message}`, 'error');
    }
  };

  // Handle Applying AI Result to Form
  const handleApplyAiResult = (aiResult: AIAnalysisResult) => {
    setSelectedAiDraft(aiResult);
    setEditingHazard(null);
    setIsFormOpen(true);
    showToast(`นำผลวิเคราะห์ AI เข้าสู่แบบฟอร์ม RA-01 เรียบร้อยแล้ว`, 'success');
  };

  // Handle Reset/Sync to 3 Standard Sample Hazards
  const handleReset3Samples = async () => {
    try {
      setIsLoading(true);
      await resetTo3SampleHazards();
      showToast('โหลดชุดข้อมูลตัวอย่าง 3 สถานะมาตรฐานสำเร็จ (รอตอบกลับ / กำหนดมาตรการ / แก้ไขแล้ว)', 'success');
    } catch (err: any) {
      console.error('Reset samples error:', err);
      showToast(`ไม่สามารถโหลดข้อมูลตัวอย่างได้: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2 animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-500'
              : toastMessage.type === 'error'
              ? 'bg-red-900 text-red-100 border-red-500'
              : 'bg-slate-900 text-amber-200 border-amber-500'
          }`}
        >
          {toastMessage.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          {toastMessage.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-400" />}
          {toastMessage.type === 'info' && <Sparkles className="h-4 w-4 text-amber-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        hazards={hazards}
        isRealtimeConnected={isRealtimeConnected}
        onOpenNewHazard={() => {
          setEditingHazard(null);
          setSelectedAiDraft(null);
          setFormInitialTab('report');
          setIsFormOpen(true);
        }}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenPrintAll={() => {
          setPrintSingleHazard(null);
          setIsPrintOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold underline"
            >
              ปิด
            </button>
          </div>
        )}

        {/* Real-time KPI Dashboard */}
        <RealtimeDashboard
          hazards={hazards}
          activeFilter={activeFilter}
          onFilterChange={(f) => setActiveFilter(f)}
          onOpenCriticalHazard={(hazard) => {
            setViewingHazard(hazard);
            setIsDetailOpen(true);
          }}
          onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        />

        {/* 4x4 Risk Assessment Matrix Heatmap & AI Quick Action Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: 4x4 Matrix (2 cols on desktop) */}
          <div className="lg:col-span-2">
            <RiskMatrixHeatmap
              hazards={hazards}
              selectedLikelihood={selectedMatrixL}
              selectedSeverity={selectedMatrixS}
              onSelectCell={(l, s) => {
                setSelectedMatrixL(l);
                setSelectedMatrixS(s);
              }}
            />
          </div>

          {/* Right: AI Safety Scanner & Quick Guide */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-2.5 relative z-10">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    AI ผู้ช่วยชี้บ่งอันตรายที่อาจคาดไม่ถึง
                  </h4>
                  <p className="text-[11px] text-purple-300">
                    ตรวจจับความเสี่ยงแฝง & มาตรการ 5 ลำดับขั้น
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed relative z-10">
                ระบบ AI ช่วยค้นหาสภาพและพฤติกรรมที่ไม่ปลอดภัยที่มักถูกมองข้าม (เช่น ไฟฟ้าสถิต, ไอระเหยในที่อับอากาศ, ฝุ่นติดไฟ) พร้อมแนะนำ Hierarchy of Controls สำหรับจัดทำแบบฟอร์ม RA-01 ทันที
              </p>

              <button
                onClick={() => setIsAiAssistantOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:brightness-110 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-2 relative z-10"
              >
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span>เปิดระบบ AI วิเคราะห์อันตราย</span>
              </button>
            </div>

            {/* Safety Compliance & RA01 Standards Box */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5" />
                มาตรฐานการประเมินความเสี่ยง RA-01 (4×4)
              </span>
              <ul className="text-slate-600 space-y-1.5 text-[11px]">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>บันทึกและซิงค์ข้อมูลลง Firebase Firestore แบบ Real-time</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>เมทริกซ์ 4×4 สอดคล้องตามเกณฑ์โอกาสเกิด (หัวตาราง) และความรุนแรง</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>แบ่ง 2 ขั้นตอน: ผู้ชี้บ่งกรอกรายงานเบื้องต้น & จป. ตอบกลับมาตรการ</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Hazard List & Search/Filters */}
        <HazardList
          hazards={hazards}
          activeFilter={activeFilter}
          onFilterChange={(f) => setActiveFilter(f)}
          selectedMatrixL={selectedMatrixL}
          selectedMatrixS={selectedMatrixS}
          onClearMatrixFilter={() => {
            setSelectedMatrixL(null);
            setSelectedMatrixS(null);
          }}
          onView={(h) => {
            setViewingHazard(h);
            setIsDetailOpen(true);
          }}
          onEdit={(h, tab = 'report') => {
            setEditingHazard(h);
            setSelectedAiDraft(null);
            setFormInitialTab(tab);
            setIsFormOpen(true);
          }}
          onDelete={handleDeleteHazard}
          onStatusChange={handleStatusChange}
          onOpenNewHazard={() => {
            setEditingHazard(null);
            setSelectedAiDraft(null);
            setFormInitialTab('report');
            setIsFormOpen(true);
          }}
          onReset3Samples={handleReset3Samples}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ระบบชี้บ่งอันตรายและประเมินความเสี่ยง (แบบฟอร์ม RA-01)</span>
          <span className="text-slate-600 font-medium">
            Real-time Firebase Firestore • Powered by Gemini AI
          </span>
        </div>
      </footer>

      {/* Modal 1: Create / Edit RA-01 Form */}
      <HazardFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingHazard(null);
          setSelectedAiDraft(null);
        }}
        onSave={handleSaveHazard}
        editingHazard={editingHazard}
        initialAiData={selectedAiDraft}
        initialTab={formInitialTab}
        onOpenAiAssistant={() => {
          setIsAiAssistantOpen(true);
        }}
      />

      {/* Modal 2: AI Unforeseen Hazard Assistant */}
      <AiHazardAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onApplyToForm={handleApplyAiResult}
      />

      {/* Modal 3: View Full RA-01 Detail */}
      <HazardDetailModal
        hazard={viewingHazard}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setViewingHazard(null);
        }}
        onEdit={(h, tab = 'report') => {
          setIsDetailOpen(false);
          setEditingHazard(h);
          setSelectedAiDraft(null);
          setFormInitialTab(tab);
          setIsFormOpen(true);
        }}
        onDelete={handleDeleteHazard}
        onStatusChange={handleStatusChange}
        onAddCorrectiveNote={handleAddCorrectiveNote}
        onPrintSingle={(h) => {
          setPrintSingleHazard(h);
          setIsPrintOpen(true);
        }}
      />

      {/* Modal 4: Print RA-01 Sheet */}
      <PrintRa01Sheet
        hazards={hazards}
        singleHazard={printSingleHazard}
        isOpen={isPrintOpen}
        onClose={() => {
          setIsPrintOpen(false);
          setPrintSingleHazard(null);
        }}
      />
    </div>
  );
}
