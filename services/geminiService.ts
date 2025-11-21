import { GoogleGenAI, Type } from "@google/genai";
import { EncouragementResponse } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateEncouragement = async (currentSteps: number, targetSteps: number, name: string): Promise<EncouragementResponse> => {
  const percentage = Math.round((currentSteps / targetSteps) * 100);

  if (!apiKey) {
    return {
      message: `${name}님, 오늘도 힘내세요! 한 걸음씩 천천히 나아가요.`,
      tone: 'encouraging'
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `수술 후 회복 중인 시니어 환자 '${name}'님을 위한 짧고 따뜻한 격려 메시지를 한국어로 작성해주세요.
      오늘 현재 ${currentSteps}보를 걸었고, 이는 하루 목표(${targetSteps}보)의 ${percentage}%입니다.
      
      상황별 가이드:
      - 30% 미만: 시작을 격려하는 부드러운 말투.
      - 30%~90%: 잘하고 있다는 칭찬과 응원.
      - 100% 이상: 목표 달성에 대한 큰 축하와 기쁨.
      
      제약 사항:
      - 반드시 '해요체'(존댓말)를 사용하세요.
      - 전문 용어 금지. 쉬운 단어 사용.
      - 20자 이내로 아주 짧게 작성하세요.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING, description: "한국어 격려 메시지" },
            tone: { type: Type.STRING, enum: ['celebratory', 'encouraging', 'gentle'] }
          },
          required: ['message', 'tone']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned");
    
    return JSON.parse(text) as EncouragementResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Korean Fallback
    return {
      message: `참 잘하고 계세요, ${name}님! 건강해지고 있어요.`,
      tone: 'gentle'
    };
  }
};