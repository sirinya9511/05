import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // Shared Gemini client
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Safety Hazard RA01 API" });
  });

  // AI Hazard Identification & Unforeseen Risk Analysis Endpoint
  app.post("/api/gemini/analyze-hazard", async (req, res) => {
    try {
      const {
        activity,
        location,
        workstep,
        toolsUsed,
        environment,
        knownHazards,
        imageBase64,
      } = req.body;

      if (!activity && !location && !workstep && !imageBase64) {
        return res.status(400).json({
          error: "กรุณาระบุกิจกรรม พื้นที่ หรือขั้นตอนการทำงานเพื่อวิเคราะห์",
        });
      }

      const ai = getGeminiClient();

      const systemInstruction = `คุณเป็นผู้เชี่ยวชาญด้านความปลอดภัย อาชีวอนามัย และสภาพแวดล้อมในการทำงาน (Safety Officer / จป.วิชาชีพ) ตามมาตรฐานกฎหมายความปลอดภัยของไทย (พ.ร.บ. ความปลอดภัย อาชีวอนามัยฯ พ.ศ. 2554) และมาตรฐานสากล ISO 45001 / OSHA

ภารกิจหลักของคุณคือ:
1. ชี้บ่งอันตรายที่ชัดเจน และ **อันตรายแฝง/อันตรายที่มักถูกมองข้ามหรือไม่คาดคิด (Hidden & Unforeseen Hazards)** เช่น ปฏิกิริยาลูกโซ่, ไฟฟ้าสถิต, ความล้า/การยศาสตร์สะสม, ก๊าซพิษสะสม, ปฏิบัติการร่วม (SIMOPs), จุดหนีบซ่อน, สภาพอากาศ, Human error
2. ประเมินระดับความเสี่ยงตามเกณฑ์ 4x4 Risk Assessment Matrix (โอกาสเกิด Likelihood: 1-4 x ความรุนแรง Severity: 1-4, คะแนนความเสี่ยง 1-16)
   เกณฑ์โอกาสการเกิด (Likelihood 1-4):
   - ระดับ 1: น้อยมาก (ไม่เคยเกิดขึ้นเลยในช่วงเวลาตั้งแต่ 10 ปีขึ้นไป)
   - ระดับ 2: น้อย (ความถี่ในการเกิดขึ้น 1 ครั้ง ในช่วง 5-10 ปี)
   - ระดับ 3: ปานกลาง (ความถี่ในการเกิดขึ้น 1 ครั้ง ในช่วง 1-5 ปี)
   - ระดับ 4: สูง (ความถี่ในการเกิดมากขึ้นมากกว่า 1 ครั้ง ใน 1 ปี)

   เกณฑ์ความรุนแรง (Severity 1-4):
   - ระดับ 1: ความรุนแรงเล็กน้อย มีการบาดเจ็บเล็กน้อยในระดับปฐมพยาบาล
   - ระดับ 2: ความรุนแรงปานกลาง มีการบาดเจ็บที่ต้องได้รับการรักษาทางการแพทย์
   - ระดับ 3: ความรุนแรงสูง มีการบาดเจ็บหรือป่วยที่รุนแรง
   - ระดับ 4: ทุพพลภาพหรือเสียชีวิต

   การจัดระดับความเสี่ยงและมาตรการ:
   - 1-2: ความเสี่ยงเล็กน้อย (ยอมรับได้ ปฏิบัติตามมาตรฐานงานปกติ)
   - 3-6: ความเสี่ยงปานกลาง (ต้องมีการทบทวนมาตรการควบคุม)
   - 8-9: ความเสี่ยงสูง (ต้องมีการดำเนินการลดความเสี่ยง)
   - 12-16: ความเสี่ยงที่ยอมรับไม่ได้ (ต้องหยุดการดำเนินงาน และต้องปรับปรุงแก้ไขเพื่อลดความเสี่ยงทันที)

3. เสนอแนะมาตรการควบคุมความเสี่ยงตามลำดับขั้นการควบคุม (Hierarchy of Controls: 1. Elimination 2. Substitution 3. Engineering Controls 4. Administrative Controls 5. PPE)
4. สรุปคำแนะนำเชิงปฏิบัติการเพื่อนำไปกรอกในแบบฟอร์มชี้บ่งอันตราย RA-01 ทันที

ตอบกลับเป็นภาษาไทยที่ถูกต้อง เป็นมืออาชีพ ชัดเจน เข้าใจง่าย และตรงประเด็น`;

      const promptText = `ช่วยวิเคราะห์ชี้บ่งอันตรายและประเมินความเสี่ยงด้วย 4x4 Risk Matrix สำหรับแบบฟอร์ม RA01 จากข้อมูลดังนี้:
- กิจกรรม/งานที่ปฏิบัติ: ${activity || "ไม่ระบุ"}
- สถานที่/แผนก/บริเวณ: ${location || "ไม่ระบุ"}
- ขั้นตอนการทำงาน: ${workstep || "ไม่ระบุ"}
- เครื่องมือ/เครื่องจักร/สารเคมีที่ใช้: ${toolsUsed || "ไม่ระบุ"}
- สภาพแวดล้อมโดยรอบ: ${environment || "ไม่ระบุ"}
- อันตรายเบื้องต้นที่สังเกตพบ: ${knownHazards || "ไม่ระบุ"}

โปรดเน้นวิเคราะห์ "อันตรายที่อาจคาดไม่ถึง (Unforeseen Hazards)" อย่างลึกซึ้ง พร้อมแนวทางป้องกันเชิงวิศวกรรมและการบริหารจัดการ โดยให้คะแนนตามเมทริกซ์ 4x4 (L: 1-4, S: 1-4)`;

      let contents: any = promptText;
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const mimeType = imageBase64.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";
        contents = {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: cleanBase64,
              },
            },
            {
              text: promptText,
            },
          ],
        };
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: "สรุปภาพรวมความเสี่ยงของกิจกรรมนี้ใน 1-2 ประโยค",
              },
              unforeseenHazards: {
                type: Type.ARRAY,
                description: "รายการอันตรายแฝง/อันตรายที่อาจคาดไม่ถึง พร้อมเหตุผลที่มักถูกมองข้าม",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    hazardName: { type: Type.STRING, description: "ชื่ออันตรายแฝง" },
                    category: {
                      type: Type.STRING,
                      description: "หมวดหมู่อันตราย เช่น กายภาพ, เคมี, ทางกล/เครื่องจักร, การยศาสตร์, ไฟฟ้า, อัคคีภัย, จิตวิทยาสังคม, ปฏิบัติการร่วม",
                    },
                    whyUnforeseen: {
                      type: Type.STRING,
                      description: "ทำไมถึงมักคาดไม่ถึง หรือถูกมองข้าม",
                    },
                    potentialConsequence: {
                      type: Type.STRING,
                      description: "ผลกระทบหรือความเสียหายร้ายแรงที่อาจเกิดขึ้น",
                    },
                    likelihood: { type: Type.INTEGER, description: "คะแนนโอกาสเกิด 1-4" },
                    severity: { type: Type.INTEGER, description: "คะแนนความรุนแรง 1-4" },
                    riskScore: { type: Type.INTEGER, description: "คะแนนความเสี่ยง (1-16)" },
                    riskLevel: {
                      type: Type.STRING,
                      description: "ระดับความเสี่ยง: ต่ำ (Low: 1-3), ปานกลาง (Moderate: 4-6), สูง (High: 8-11), สูงมาก/วิกฤต (Critical: 12-16)",
                    },
                    suggestedControls: {
                      type: Type.OBJECT,
                      properties: {
                        elimination: { type: Type.STRING, description: "1. การขจัดอันตราย (ถ้าเป็นไปได้)" },
                        substitution: { type: Type.STRING, description: "2. การทดแทนด้วยสิ่งปลอดภัยกว่า" },
                        engineering: { type: Type.STRING, description: "3. การควบคุมทางวิศวกรรม/ติดตั้งอุปกรณ์ป้องกัน" },
                        administrative: { type: Type.STRING, description: "4. การควบคุมทางการบริหารจัดการ/อบรม/ป้ายเตือน/SOP" },
                        ppe: { type: Type.STRING, description: "5. อุปกรณ์คุ้มครองความปลอดภัยส่วนบุคคล (PPE)" },
                      },
                    },
                  },
                  required: [
                    "hazardName",
                    "category",
                    "whyUnforeseen",
                    "potentialConsequence",
                    "likelihood",
                    "severity",
                    "riskScore",
                    "riskLevel",
                    "suggestedControls",
                  ],
                },
              },
              recommendedRa01Draft: {
                type: Type.OBJECT,
                description: "ข้อมูลที่แนะนำสำหรับเติมลงในฟอร์ม RA-01 อัตโนมัติ",
                properties: {
                  activityName: { type: Type.STRING },
                  hazardType: { type: Type.STRING },
                  unsafeAct: { type: Type.STRING, description: "การกระทำที่ไม่ปลอดภัยที่อาจเกิดขึ้น" },
                  unsafeCondition: { type: Type.STRING, description: "สภาพการทำงานที่ไม่ปลอดภัยที่อาจเกิดขึ้น" },
                  consequences: { type: Type.STRING },
                  initialLikelihood: { type: Type.INTEGER },
                  initialSeverity: { type: Type.INTEGER },
                  hierarchyControls: {
                    type: Type.OBJECT,
                    properties: {
                      elimination: { type: Type.STRING },
                      substitution: { type: Type.STRING },
                      engineering: { type: Type.STRING },
                      administrative: { type: Type.STRING },
                      ppe: { type: Type.STRING },
                    },
                  },
                  residualLikelihood: { type: Type.INTEGER, description: "โอกาสเกิดหลังควบคุม (1-4)" },
                  residualSeverity: { type: Type.INTEGER, description: "ความรุนแรงหลังควบคุม (1-4)" },
                  actionPlan: { type: Type.STRING, description: "แผนปฏิบัติการเร่งด่วน" },
                  applicableLawOrStandard: { type: Type.STRING, description: "กฎหมายความปลอดภัยหรือมาตรฐานที่เกี่ยวข้อง" },
                },
                required: [
                  "activityName",
                  "hazardType",
                  "unsafeAct",
                  "unsafeCondition",
                  "consequences",
                  "initialLikelihood",
                  "initialSeverity",
                  "hierarchyControls",
                  "residualLikelihood",
                  "residualSeverity",
                  "actionPlan",
                ],
              },
              quickSafetyTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-5 ข้อควรระวังด่วน (Quick Safety Tips) ก่อนเริ่มงาน",
              },
            },
            required: ["summary", "unforeseenHazards", "recommendedRa01Draft", "quickSafetyTips"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ success: true, data: parsed });
    } catch (error: any) {
      console.error("Gemini Analysis Error:", error);
      res.status(500).json({
        error: error.message || "เกิดข้อผิดพลาดในการวิเคราะห์ด้วย AI",
      });
    }
  });

  // AI Quick Checklist Generation Endpoint
  app.post("/api/gemini/generate-checklist", async (req, res) => {
    try {
      const { areaType, specificMachinery } = req.body;
      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `ช่วยสร้างรายการตรวจสอบความปลอดภัยรายวัน (Daily Safety Inspection Checklist) สำหรับพื้นที่: ${areaType || "ทั่วไปในโรงงาน"} เครื่องจักร/งาน: ${specificMachinery || "ทั่วไป"} จำนวน 6-8 ข้อ พร้อมจุดเน้นอันตรายแฝง`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              areaTitle: { type: Type.STRING },
              inspectionItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING },
                    category: { type: Type.STRING },
                    criticalPoint: { type: Type.STRING, description: "จุดเสี่ยงที่ต้องระวังเป็นพิเศษ" },
                  },
                  required: ["item", "category", "criticalPoint"],
                },
              },
            },
            required: ["areaTitle", "inspectionItems"],
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Checklist Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate checklist" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Safety Hazard RA01 Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
