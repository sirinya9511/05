import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { Ra01HazardReport, AuthUser } from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Convert Firebase User to AuthUser
export function mapFirebaseUser(user: FirebaseUser | null): AuthUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: 'safety_officer',
  };
}

// Sign in with Google Popup
export async function loginWithGoogle(): Promise<AuthUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const mapped = mapFirebaseUser(result.user);
    if (!mapped) throw new Error('ไม่พบข้อมูลผู้ใช้หลังจากเข้าสู่ระบบ');
    return mapped;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

// Sign out
export async function logoutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Logout Error:', error);
    throw error;
  }
}

// Listen to Auth State Changes
export function subscribeToAuth(callback: (user: AuthUser | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    callback(mapFirebaseUser(user));
  });
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  timestamp: string;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    timestamp: new Date().toISOString(),
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test Connection
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
    return false;
  }
}

const COLLECTION_NAME = 'ra01_hazards';

// The 3 exact sample records representing:
// 1. รอการตอบกลับ (Pending Controls / Feedback)
// 2. กำหนดมาตรการแล้ว (Controls Defined / In Progress)
// 3. ดำเนินการแก้ไขแล้ว (Resolved / Completed)
export const INITIAL_HAZARD_SEEDS: Omit<Ra01HazardReport, 'id'>[] = [
  // 1. รอการตอบกลับ (Pending Controls / Feedback - กรอกเฉพาะส่วนที่ 1)
  {
    code: 'RA01-2026-101',
    activityName: 'การเปลี่ยนใบมีดเครื่องตัดแผ่นเหล็กไฮดรอลิก (Hydraulic Shearing Machine)',
    workArea: 'แผนกตัดและขึ้นรูปโลหะ (Metal Cutting & Forming)',
    workStep: 'พนักงานปิดสวิตช์ควบคุมหลัก แล้วใช้ประแจถอดน็อตยึดใบมีดทันที โดยไม่ได้ตัดแยกระบบวาล์วแรงดันไฮดรอลิก',
    hazardCategory: 'mechanical',
    unsafeAct: 'ใช้มือเปล่าจับขอบใบมีดขณะถอด และไม่ได้ระบายแรงดันไฮดรอลิกตกค้าง (Residual Pressure) ก่อนปฏิบัติงาน',
    unsafeCondition: 'ใบมีดมีความคมสูงมาก และไม่มีอุปกรณ์ค้ำยันใบมีด (Blade Blocking Device) เฉพาะสำหรับล็อกใบมีดขณะซ่อมบำรุง',
    consequences: 'แรงดันไฮดรอลิกสะสมดีดใบมีดลงมาทับมือ นิ้วมือขาด หรือกระดูกแตกหักสูญเสียอวัยวะ',
    initialLikelihood: 3, // 1 ครั้งใน 1-5 ปี
    initialSeverity: 4,   // วิกฤต / ทุพพลภาพ / เสียชีวิต
    initialRiskScore: 12, // 3 x 4 = 12 (Critical)
    initialRiskLevel: 'critical',
    unforeseenHazards: JSON.stringify([
      {
        hazardName: 'แรงดันน้ำมันไฮดรอลิกตกค้างในกระบอกสูบ (Stored Hydraulic Energy)',
        category: 'ระบบแรงดัน/เครื่องจักร',
        whyUnforeseen: 'แม้กดปุ่มปิดเครื่องตัดไฟแล้ว แต่น้ำมันไฮดรอลิกยังมีแรงดันกักอยู่ในท่อ สามารถปลดปล่อยแรงกะทันหันเมื่อคลายน็อต',
        potentialConsequence: 'ใบมีดดีดตกกระแทกฉับพลันตัดนิ้วมือขาด',
        likelihood: 3,
        severity: 4,
        riskScore: 12,
        riskLevel: 'สูง/วิกฤต',
      },
    ]),
    // ส่วนที่ 2: ว่างไว้เพื่อรอการตอบกลับจาก จป. หรือหัวหน้างาน
    hierarchyElimination: '',
    hierarchySubstitution: '',
    hierarchyEngineering: '',
    hierarchyAdministrative: '',
    hierarchyPpe: '',
    residualLikelihood: 1,
    residualSeverity: 1,
    residualRiskScore: 1,
    residualRiskLevel: 'low',
    status: 'reported',
    reporterName: 'กิตติพงษ์ ใจกล้า (พนักงานประจำเครื่องจักร)',
    reporterDepartment: 'แผนกตัดและขึ้นรูป (Production)',
    assignedTo: '',
    targetDate: '',
    actionPlan: '',
    correctiveNotes: '',
    applicableLaw: 'กฎกระทรวงกำหนดมาตรฐานในการบริหาร จัดการ และดำเนินการด้านความปลอดภัย อาชีวอนามัย และสภาพแวดล้อมในการทำงานเกี่ยวกับเครื่องจักร พ.ศ. 2564',
    photoUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },

  // 2. กำหนดมาตรการแล้ว (Controls Defined - กำหนด Hierarchy 5 ขั้นและแผน CAPA แล้ว)
  {
    code: 'RA01-2026-102',
    activityName: 'การถ่ายเทและผสมสารเคมีไวไฟ (ทินเนอร์/ตัวทำละลายอินทรีย์) ลงถังผสม 200 ลิตร',
    workArea: 'พื้นที่จัดเก็บสารเคมี (Chemical Storage)',
    workStep: 'เปิดฝาถัง 200 ลิตร และใช้ปั๊มมือสูบถ่ายตัวทำละลายลงถังผสมเพื่อเตรียมสารเคลือบ',
    hazardCategory: 'chemical',
    unsafeAct: 'เทสารเคมีอย่างรวดเร็วโดยยังไม่ได้หนีบสายดินล้างประจุไฟฟ้าสถิต และไม่ได้เปิดระบบดูดระบายอากาศล่วงหน้า',
    unsafeCondition: 'บริเวณจัดเก็บมีไอระเหยสะสม อากาศถ่ายเทไม่สะดวก ไม่มีระบบตัดการทำงานอัตโนมัติเมื่อไม่ต่อสายดิน',
    consequences: 'ประกายไฟจากไฟฟ้าสถิตจุดติดไอระเหย เกิดเพลิงไหม้หรือระเบิดฉับพลัน ผู้ปฏิบัติงานถูกไฟคลอกสาหัส',
    initialLikelihood: 4, // >1 ครั้งใน 1 ปี
    initialSeverity: 4,   // วิกฤต / เสียชีวิต
    initialRiskScore: 16, // 4 x 4 = 16 (Critical)
    initialRiskLevel: 'critical',
    unforeseenHazards: JSON.stringify([
      {
        hazardName: 'ไฟฟ้าสถิตจากการไหลของของเหลวที่ไม่นำไฟฟ้า (Static Accumulation)',
        category: 'เคมี/อัคคีภัย',
        whyUnforeseen: 'มองไม่เห็นด้วยตาเปล่า การไหลของของเหลวในท่อสามารถสะสมประจุไฟฟ้าสถิตจนเกิดประกายไฟได้เองโดยไม่ต้องมีเปลวไฟภายนอก',
        potentialConsequence: 'ไฟลุกพรึบฉับพลัน (Flash Fire) ร่างกายถูกไฟคลอกระดับ 3',
        likelihood: 4,
        severity: 4,
        riskScore: 16,
        riskLevel: 'วิกฤต',
      },
    ]),
    // ส่วนที่ 2: กำหนดมาตรการควบคุม 5 ลำดับขั้นครบถ้วน
    hierarchyElimination: 'เปลี่ยนกระบวนการผลิตเป็นระบบท่อส่งปิดอัตโนมัติ (Automated Closed-loop Pumping)',
    hierarchySubstitution: 'ใช้น้ำยาทำความสะอาดสูตรน้ำที่มีจุดวาบไฟสูงทดแทนตัวทำละลายไวไฟในขั้นตอนล้างถัง',
    hierarchyEngineering: 'ติดตั้งระบบสายดิน Clamping & Interlock ตัดวงจรปั๊มหากไม่ต่อสายกราวด์ และติดตั้งระบบดูดไอระเหยเฉพาะจุด (LEV Ex-proof)',
    hierarchyAdministrative: 'จัดทำคู่มือ SWI การถ่ายสารเคมี, ติดป้ายเตือนอันตราย, กำหนดใบอนุญาตทำงานกับสารไวไฟ (Hot Work & Chemical Permit)',
    hierarchyPpe: 'ชุดป้องกันสารเคมีกันไฟฟ้าสถิต (Anti-static), หน้ากาก Full-face พร้อมตลับกรองไอระเหยเคมีอินทรีย์, ถุงมือ Nitrile หนาพิเศษ, รองเท้านิรภัย ESD',
    residualLikelihood: 1, // ลดเหลือ 1 (น้อยมาก)
    residualSeverity: 2,   // ลดเหลือ 2 (ปานกลาง/รักษาแพทย์)
    residualRiskScore: 2,  // 1 x 2 = 2 (Low)
    residualRiskLevel: 'low',
    status: 'in_progress',
    reporterName: 'สมชาย รักความปลอดภัย (จป.วิชาชีพ)',
    reporterDepartment: 'ฝ่ายความปลอดภัยและสิ่งแวดล้อม (EHS)',
    assignedTo: 'วิศวกรซ่อมบำรุง (คุณธีรภัทร)',
    targetDate: '2026-08-28',
    actionPlan: 'สั่งซื้อชุดต่อสายดิน Interlock พร้อมติดตั้งพัดลมดูดอากาศ Ex-proof ภายในสัปดาห์นี้',
    correctiveNotes: 'จัดหาอุปกรณ์สายดินชั่วคราวแล้ว อยู่ระหว่างช่างติดตั้งระบบดูดระบายอากาศถาวร',
    applicableLaw: 'กฎกระทรวงกำหนดมาตรฐานในการบริหาร จัดการ และดำเนินการด้านความปลอดภัย อาชีวอนามัย และสภาพแวดล้อมในการทำงานเกี่ยวกับสารเคมีอันตราย พ.ศ. 2556',
    photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },

  // 3. ดำเนินการแก้ไขแล้ว (Resolved / Completed - ปฏิบัติตามแผนและตรวจรับรองผลสำเร็จ)
  {
    code: 'RA01-2026-103',
    activityName: 'การยกและจัดเรียงกระสอบวัตถุดิบน้ำหนัก 25 กิโลกรัม ขึ้นสายพานลำเลียง',
    workArea: 'ไลน์การผลิตหลัก (Main Production Line)',
    workStep: 'พนักงาน 1 คน ก้มยกกระสอบจากพาเลทที่พื้นแล้วบิดเอวเพื่อวางบนสายพานลำเลียง วันละ 300 กระสอบ',
    hazardCategory: 'ergonomic',
    unsafeAct: 'ยกของหนักเกินเกณฑ์มาตรฐานด้วยการก้มหลังและบิดลำตัวอย่างรวดเร็วต่อเนื่องโดยไม่มีการหยุดพัก',
    unsafeCondition: 'ระดับความสูงของพาเลทวางอยู่บนพื้นต่ำกว่าระดับเข่า ทำให้ต้องก้มตัวลึกทุกครั้ง',
    consequences: 'หมอนรองกระดูกทับเส้นประสาท ปวดหลังเรื้อรัง (WMSDs) และกระสอบตกกระแทกหลังเท้า',
    initialLikelihood: 4, // สูง (>1 ครั้งใน 1 ปี)
    initialSeverity: 2,   // ปานกลาง (รักษาแพทย์/หยุดงาน)
    initialRiskScore: 8,  // 4 x 2 = 8 (High)
    initialRiskLevel: 'high',
    unforeseenHazards: JSON.stringify([
      {
        hazardName: 'ความล้าสะสมของกล้ามเนื้อหลังและการสูญเสียการทรงตัวฉับพลัน',
        category: 'การยศาสตร์/กายภาพ',
        whyUnforeseen: 'ไม่รู้สึกเจ็บทันทีในชั่วโมงแรก แต่กล้ามเนื้อล้าสะสมจนเกิดอุบัติเหตุกระสอบหล่นทับเท้าในชั่วโมงท้ายของกะ',
        potentialConsequence: 'กระดูกนิ้วเท้าแตก และกล้ามเนื้อหลังฉีกขาดเฉียบพลัน',
        likelihood: 4,
        severity: 2,
        riskScore: 8,
        riskLevel: 'สูง',
      },
    ]),
    // ส่วนที่ 2: มาตรการควบคุม 5 ลำดับขั้น
    hierarchyElimination: 'นำระบบแขนกลช่วยยกสูญญากาศ (Vacuum Tube Lifter) มาใช้แทนแรงคน',
    hierarchySubstitution: 'สั่งซื้อวัตถุดิบขนาดบรรจุ 15 กิโลกรัมแทนขนาด 25 กิโลกรัม',
    hierarchyEngineering: 'ติดตั้งแท่นปรับระดับพาเลทอัตโนมัติ (Scissor Lift Table) ให้อยู่ระดับเอวเสมอ',
    hierarchyAdministrative: 'กำหนดให้ยกคู่ 2 คนสำหรับของหนัก, สลับหมุนเวียนงาน (Job Rotation) ทุก 2 ชั่วโมง, อบรมท่าทางการยกที่ถูกสุขศาสตร์',
    hierarchyPpe: 'ถุงมือผ้าเคลือบยางกันลื่น, รองเท้านิรภัยหัวเหล็ก, อุปกรณ์พยุงหลัง (Back Support)',
    residualLikelihood: 1, // ลดเหลือ 1 (น้อยมาก)
    residualSeverity: 1,   // ลดเหลือ 1 (เล็กน้อย)
    residualRiskScore: 1,  // 1 x 1 = 1 (Low)
    residualRiskLevel: 'low',
    status: 'resolved',
    reporterName: 'สุภาภรณ์ ชูใจ (พยาบาลอาชีวอนามัย)',
    reporterDepartment: 'ห้องพยาบาลและอาชีวอนามัย (Occupational Health)',
    assignedTo: 'ผู้จัดการฝ่ายผลิต (คุณเกียรติศักดิ์)',
    targetDate: '2026-08-15',
    actionPlan: 'จัดซื้อแท่นปรับระดับพาเลท Scissor Lift Table และจัดตั้งโปรแกรมยืดเหยียดกล้ามเนื้อ',
    correctiveNotes: 'ติดตั้งแท่นปรับระดับพาเลท Scissor Lift เรียบร้อยแล้ว พนักงานไม่ต้องก้มตัว อาการปวดหลังลดลง 90% จป.วิชาชีพเข้าตรวจรับรองผลสำเร็จ',
    applicableLaw: 'กฎกระทรวงกำหนดอัตราน้ำหนักที่นายจ้างให้ลูกจ้างทำงานได้ พ.ศ. 2547 (ชายไม่เกิน 55 กก. หญิงไม่เกิน 25 กก.)',
    photoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

// Subscribe to Realtime Hazards
export function subscribeToHazards(
  onData: (hazards: Ra01HazardReport[]) => void,
  onError?: (error: any) => void
) {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      async (snapshot) => {
        if (snapshot.empty) {
          // If empty, auto-seed with 3 sample data
          try {
            await seedInitialHazards();
          } catch (seedErr) {
            console.warn('Auto-seeding skipped:', seedErr);
          }
          return;
        }
        const reports: Ra01HazardReport[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          reports.push({
            id: docSnap.id,
            ...(data as Omit<Ra01HazardReport, 'id'>),
          });
        });
        onData(reports);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    if (onError) onError(error);
    return () => {};
  }
}

// Seed Initial Hazards
export async function seedInitialHazards() {
  try {
    const existing = await getDocs(collection(db, COLLECTION_NAME));
    if (existing.size === 0) {
      for (const item of INITIAL_HAZARD_SEEDS) {
        const newDocRef = doc(collection(db, COLLECTION_NAME));
        await setDoc(newDocRef, item);
      }
    } else {
      // Check if existing data has old seeds format (e.g. RA01-2026-001)
      const hasOldSeeds = existing.docs.some((d) => {
        const data = d.data();
        return data.code === 'RA01-2026-001' || data.code === 'RA01-2026-004';
      });
      if (hasOldSeeds) {
        // Cleanly replace old seeds with the 3 exact requested scenarios
        for (const docSnap of existing.docs) {
          await deleteDoc(doc(db, COLLECTION_NAME, docSnap.id));
        }
        for (const item of INITIAL_HAZARD_SEEDS) {
          const newDocRef = doc(collection(db, COLLECTION_NAME));
          await setDoc(newDocRef, item);
        }
      }
    }
  } catch (err) {
    console.warn('Error during seed:', err);
  }
}

// Reset/Sync Database to the 3 representative samples
export async function resetTo3SampleHazards(): Promise<void> {
  try {
    const existing = await getDocs(collection(db, COLLECTION_NAME));
    // Delete existing
    for (const docSnap of existing.docs) {
      await deleteDoc(doc(db, COLLECTION_NAME, docSnap.id));
    }
    // Re-seed the 3 standard records
    for (const item of INITIAL_HAZARD_SEEDS) {
      const newDocRef = doc(collection(db, COLLECTION_NAME));
      await setDoc(newDocRef, item);
    }
  } catch (err) {
    console.error('Error resetting to 3 sample hazards:', err);
    throw err;
  }
}

export const seedInitialSampleHazardsIfEmpty = seedInitialHazards;

// Create new Hazard Report
export async function createHazardReport(report: Omit<Ra01HazardReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const path = COLLECTION_NAME;
  try {
    const now = new Date().toISOString();
    const newDocRef = doc(collection(db, COLLECTION_NAME));
    const fullData: Omit<Ra01HazardReport, 'id'> = {
      ...report,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(newDocRef, fullData);
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

// Update Hazard Report
export async function updateHazardReport(id: string, updates: Partial<Ra01HazardReport>): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const now = new Date().toISOString();
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

// Delete Hazard Report
export async function deleteHazardReport(id: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}
