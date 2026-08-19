export type HazardCategory =
  | 'mechanical'
  | 'electrical'
  | 'chemical'
  | 'physical'
  | 'ergonomic'
  | 'biological'
  | 'fire'
  | 'working_at_height'
  | 'confined_space'
  | 'simops';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export type HazardStatus =
  | 'reported'
  | 'investigating'
  | 'in_progress'
  | 'resolved'
  | 'verified';

export interface HierarchyControls {
  elimination: string;
  substitution: string;
  engineering: string;
  administrative: string;
  ppe: string;
}

export interface UnforeseenHazardItem {
  hazardName: string;
  category: string;
  whyUnforeseen: string;
  potentialConsequence: string;
  likelihood: number;
  severity: number;
  riskScore: number;
  riskLevel: string;
  suggestedControls: HierarchyControls;
}

export interface Ra01HazardReport {
  id: string;
  code: string;
  activityName: string;
  workArea: string;
  workStep: string;
  hazardCategory: HazardCategory | string;
  unsafeAct: string;
  unsafeCondition: string;
  consequences: string;
  initialLikelihood: number; // 1-4
  initialSeverity: number; // 1-4
  initialRiskScore: number; // 1-16
  initialRiskLevel: RiskLevel;
  unforeseenHazards: string; // JSON string or text summary
  unforeseenList?: UnforeseenHazardItem[];
  hierarchyElimination: string;
  hierarchySubstitution: string;
  hierarchyEngineering: string;
  hierarchyAdministrative: string;
  hierarchyPpe: string;
  residualLikelihood: number; // 1-4
  residualSeverity: number; // 1-4
  residualRiskScore: number; // 1-16
  residualRiskLevel: RiskLevel;
  status: HazardStatus;
  reporterName: string;
  reporterDepartment: string;
  assignedTo: string;
  targetDate: string;
  actionPlan: string;
  correctiveNotes: string;
  applicableLaw: string;
  photoUrl?: string;
  resolvedPhotoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalysisResult {
  summary: string;
  unforeseenHazards: UnforeseenHazardItem[];
  recommendedRa01Draft: {
    activityName: string;
    hazardType: string;
    unsafeAct: string;
    unsafeCondition: string;
    consequences: string;
    initialLikelihood: number;
    initialSeverity: number;
    hierarchyControls: HierarchyControls;
    residualLikelihood: number;
    residualSeverity: number;
    actionPlan: string;
    applicableLawOrStandard?: string;
  };
  quickSafetyTips: string[];
}

export const HAZARD_CATEGORIES: { id: HazardCategory; nameTh: string; color: string; icon: string }[] = [
  { id: 'mechanical', nameTh: 'ทางกล / เครื่องจักร (Mechanical)', color: 'amber', icon: 'Cog' },
  { id: 'electrical', nameTh: 'ทางไฟฟ้า (Electrical)', color: 'yellow', icon: 'Zap' },
  { id: 'chemical', nameTh: 'สารเคมีอันตราย (Chemical)', color: 'rose', icon: 'FlaskConical' },
  { id: 'physical', nameTh: 'กายภาพ เช่น เสียง/ความร้อน (Physical)', color: 'orange', icon: 'Volume2' },
  { id: 'ergonomic', nameTh: 'การยศาสตร์ / ท่าทางการทำงาน (Ergonomics)', color: 'cyan', icon: 'Activity' },
  { id: 'working_at_height', nameTh: 'การทำงานบนที่สูง (Working at Height)', color: 'red', icon: 'TrendingUp' },
  { id: 'confined_space', nameTh: 'ที่อับอากาศ (Confined Space)', color: 'purple', icon: 'Box' },
  { id: 'fire', nameTh: 'อัคคีภัย / ระเบิด (Fire & Explosion)', color: 'red', icon: 'Flame' },
  { id: 'biological', nameTh: 'ชีวภาพ / เชื้อโรค (Biological)', color: 'emerald', icon: 'Bug' },
  { id: 'simops', nameTh: 'ปฏิบัติงานร่วมกัน (SIMOPs)', color: 'indigo', icon: 'Users' },
];

export const WORK_AREAS = [
  'แผนกซ่อมบำรุง (Maintenance)',
  'ไลน์การผลิตหลัก (Main Production Line)',
  'คลังสินค้าและโลจิสติกส์ (Warehouse & Logistics)',
  'ห้องควบคุมไฟฟ้า / ห้อง MDB (Electrical Room)',
  'พื้นที่จัดเก็บสารเคมี (Chemical Storage)',
  'ลานโหลดสินค้า / ท่าเทียบ (Loading Bay)',
  'งานก่อสร้าง / ปรับปรุง (Construction Area)',
  'ห้องปฏิบัติการ / QC Lab (Laboratory)',
  'โรงอาหารและพื้นที่ส่วนกลาง (Canteen & Facilities)',
  'บ่อบำบัดน้ำเสีย (Wastewater Treatment)',
];

export function calculateRiskLevel(score: number): RiskLevel {
  if (score >= 12) return 'critical';
  if (score >= 8) return 'high';
  if (score >= 3) return 'moderate';
  return 'low';
}

/**
 * Checks if a hazard report has completed control measures / feedback phase
 */
export function hasControlMeasures(hazard: Ra01HazardReport): boolean {
  if (!hazard) return false;
  const hasHierarchy = Boolean(
    hazard.hierarchyElimination?.trim() ||
    hazard.hierarchySubstitution?.trim() ||
    hazard.hierarchyEngineering?.trim() ||
    hazard.hierarchyAdministrative?.trim() ||
    hazard.hierarchyPpe?.trim()
  );
  const hasAction = Boolean(hazard.actionPlan?.trim());
  const isPostReportStatus = hazard.status === 'in_progress' || hazard.status === 'resolved' || hazard.status === 'verified';
  return hasHierarchy || hasAction || isPostReportStatus;
}

export const LIKELIHOOD_CRITERIA = [
  {
    level: 1,
    name: 'น้อยมาก',
    description: 'มีโอกาสเกิดน้อยมาก เช่น ไม่เคยเกิดขึ้นเลยในช่วงเวลาตั้งแต่ 10 ปีขึ้นไป',
    shortDesc: 'ไม่เคยเกิดในรอบ ≥10 ปี',
  },
  {
    level: 2,
    name: 'น้อย',
    description: 'มีโอกาสเกิดน้อย เช่น ความถี่ในการเกิดขึ้น 1 ครั้ง ในช่วง 5-10 ปี',
    shortDesc: 'เกิด 1 ครั้งใน 5-10 ปี',
  },
  {
    level: 3,
    name: 'ปานกลาง',
    description: 'มีโอกาสเกิดปานกลาง เช่น ความถี่ในการเกิดขึ้น 1 ครั้ง ในช่วง 1-5 ปี',
    shortDesc: 'เกิด 1 ครั้งใน 1-5 ปี',
  },
  {
    level: 4,
    name: 'สูง',
    description: 'มีโอกาสเกิดสูง เช่น ความถี่ในการเกิดมากขึ้นมากกว่า 1 ครั้ง ใน 1 ปี',
    shortDesc: 'เกิดมากกว่า 1 ครั้ง/ปี',
  },
];

export const SEVERITY_CRITERIA = [
  {
    level: 1,
    name: 'เล็กน้อย',
    description: 'ความรุนแรงเล็กน้อย มีการบาดเจ็บเล็กน้อยในระดับปฐมพยาบาล',
    shortDesc: 'บาดเจ็บระดับปฐมพยาบาล (First Aid)',
  },
  {
    level: 2,
    name: 'ปานกลาง',
    description: 'ความรุนแรงปานกลาง มีการบาดเจ็บที่ต้องได้รับการรักษาทางการแพทย์',
    shortDesc: 'ต้องรักษาทางการแพทย์',
  },
  {
    level: 3,
    name: 'สูง',
    description: 'ความรุนแรงสูง มีการบาดเจ็บหรือป่วยที่รุนแรง',
    shortDesc: 'บาดเจ็บหรือป่วยรุนแรง',
  },
  {
    level: 4,
    name: 'วิกฤต',
    description: 'ทุพพลภาพหรือเสียชีวิต',
    shortDesc: 'ทุพพลภาพ หรือเสียชีวิต',
  },
];

export const RISK_LEVEL_CRITERIA = [
  {
    levelKey: 'critical' as RiskLevel,
    scoreRange: '12 - 16',
    labelTh: 'ความเสี่ยงที่ยอมรับไม่ได้',
    englishLabel: 'Unacceptable / Critical Risk',
    actionRequired: 'ต้องหยุดการดำเนินงาน และต้องปรับปรุงแก้ไขเพื่อลดความเสี่ยงทันที',
    badgeColor: 'bg-red-500/15 text-red-700 border-red-500/30',
    dotColor: 'bg-red-500',
    colorHex: '#ef4444',
  },
  {
    levelKey: 'high' as RiskLevel,
    scoreRange: '8 - 9',
    labelTh: 'ความเสี่ยงสูง',
    englishLabel: 'High Risk',
    actionRequired: 'ต้องมีการดำเนินการลดความเสี่ยง',
    badgeColor: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
    dotColor: 'bg-amber-500',
    colorHex: '#f59e0b',
  },
  {
    levelKey: 'moderate' as RiskLevel,
    scoreRange: '3 - 6',
    labelTh: 'ความเสี่ยงปานกลาง',
    englishLabel: 'Moderate Risk',
    actionRequired: 'ต้องมีการทบทวนมาตรการควบคุม',
    badgeColor: 'bg-yellow-500/15 text-yellow-800 border-yellow-500/30',
    dotColor: 'bg-yellow-500',
    colorHex: '#eab308',
  },
  {
    levelKey: 'low' as RiskLevel,
    scoreRange: '1 - 2',
    labelTh: 'ความเสี่ยงเล็กน้อย',
    englishLabel: 'Low / Minor Risk',
    actionRequired: 'ยอมรับได้ ปฏิบัติตามมาตรฐานการทำงานปกติ',
    badgeColor: 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30',
    dotColor: 'bg-emerald-500',
    colorHex: '#10b981',
  },
];

export function getRiskBadgeConfig(level: RiskLevel) {
  switch (level) {
    case 'critical':
      return {
        labelTh: 'ความเสี่ยงที่ยอมรับไม่ได้ (12-16)',
        shortLabel: 'ยอมรับไม่ได้ (12-16)',
        actionTh: 'ต้องหยุดการดำเนินงาน และต้องปรับปรุงแก้ไขเพื่อลดความเสี่ยงทันที',
        bg: 'bg-red-50 text-red-700 border-red-300',
        dot: 'bg-red-500',
        scoreColor: 'text-red-600',
      };
    case 'high':
      return {
        labelTh: 'ความเสี่ยงสูง (8-9)',
        shortLabel: 'สูง (8-9)',
        actionTh: 'ต้องมีการดำเนินการลดความเสี่ยง',
        bg: 'bg-amber-50 text-amber-800 border-amber-300',
        dot: 'bg-amber-500',
        scoreColor: 'text-amber-600',
      };
    case 'moderate':
      return {
        labelTh: 'ความเสี่ยงปานกลาง (3-6)',
        shortLabel: 'ปานกลาง (3-6)',
        actionTh: 'ต้องมีการทบทวนมาตรการควบคุม',
        bg: 'bg-yellow-50 text-yellow-800 border-yellow-300',
        dot: 'bg-yellow-500',
        scoreColor: 'text-yellow-600',
      };
    case 'low':
    default:
      return {
        labelTh: 'ความเสี่ยงเล็กน้อย (1-2)',
        shortLabel: 'เล็กน้อย (1-2)',
        actionTh: 'ยอมรับได้ ปฏิบัติตามมาตรฐานงานปกติ',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-500',
        scoreColor: 'text-emerald-600',
      };
  }
}

export function getStatusBadgeConfig(status: HazardStatus) {
  switch (status) {
    case 'reported':
      return {
        labelTh: 'แจ้งใหม่ / รอตรวจสอบ',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        color: 'blue',
      };
    case 'investigating':
      return {
        labelTh: 'กำลังตรวจประเมิน',
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        color: 'purple',
      };
    case 'in_progress':
      return {
        labelTh: 'กำลังดำเนินการแก้ไข',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        color: 'amber',
      };
    case 'resolved':
      return {
        labelTh: 'แก้ไขแล้ว / รอตรวจรับ',
        bg: 'bg-teal-50 text-teal-700 border-teal-200',
        color: 'teal',
      };
    case 'verified':
      return {
        labelTh: 'จป. ตรวจรับรองแล้ว',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        color: 'emerald',
      };
  }
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  department?: string;
  role?: 'safety_officer' | 'supervisor' | 'worker' | 'admin';
}


