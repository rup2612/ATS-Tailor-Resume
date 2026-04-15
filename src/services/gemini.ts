import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () => {
  let key = "";
  try {
    key = process.env.GEMINI_API_KEY || "";
  } catch (e) {}
  
  if (!key || key === "undefined") {
    try {
      key = (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
    } catch (e) {}
  }

  if (!key || key === "undefined") {
    try {
      key = (import.meta as any).env?.GEMINI_API_KEY || "";
    } catch (e) {}
  }

  const finalKey = key.replace(/^["']|["']$/g, "").trim();
  
  if (finalKey && finalKey !== "undefined") {
    console.log(`[Gemini] API Key detected (starts with: ${finalKey.substring(0, 4)}...)`);
    return finalKey;
  }
  
  console.warn("[Gemini] No API Key detected in build!");
  return "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
  };
  summary: string;
  skills: string[];
  workExperience: {
    company: string;
    role: string;
    location: string;
    period: string;
    description: string[];
  }[];
  education: {
    school: string;
    degree: string;
    location: string;
    period: string;
  }[];
  projects?: {
    name: string;
    description: string;
    link?: string;
  }[];
  certifications?: string[];
  languages?: string[];
  atsScore: number;
  tailoringFeedback: string;
}

export async function tailorResume(jobDescription: string, oldResume: string): Promise<ResumeData> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [{
        parts: [{
          text: `You are an expert ATS (Applicant Tracking System) optimization specialist and professional resume writer.
          
          TASK:
          Tailor the provided resume to match the given job description (JD).
          
          REQUIREMENTS:
          1. ATS FRIENDLY: Use keywords from the JD naturally.
          2. SENIORITY STEP-UP: Analyze the seniority of the JD. If it is an entry-level role, tailor the resume to position the candidate as one step ahead (e.g., Junior/Associate level). If it is an executive-level role, position them one step ahead (e.g., Senior Executive/VP level). Generally, always frame the experience to show readiness for the next level of responsibility.
          3. NO PERSONAL PRONOUNS: DO NOT use personal pronouns like "I", "me", "my", "we", or "our". Use professional, action-oriented third-person phrasing (e.g., "Led a team" instead of "I led a team").
          4. PRESERVE ALL DATA: DO NOT remove any sections or information provided in the OLD RESUME. If the user has certifications, languages, awards, or any other section, you MUST include it in the tailored version.
          5. STRUCTURE: Header (Name, Contact, Links), Summary, Skills, Work Experience, Education, Projects (if present), Certifications (if present), Languages (if present).
          6. PROJECTS: ONLY include a projects section if the user has explicitly listed projects in their OLD RESUME.
          7. RATING: Provide an ATS compatibility score out of 10.
          8. FEEDBACK: Briefly explain what was changed to make it a better match and how you "stepped up" the seniority.
          9. FORMAT: Return the response in strict JSON format.
          
          JOB DESCRIPTION:
          ${jobDescription}
          
          OLD RESUME:
          ${oldResume}
          `
        }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personalInfo: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                github: { type: Type.STRING },
              },
              required: ["name", "email", "phone", "linkedin", "github"]
            },
            summary: { type: Type.STRING },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            workExperience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  company: { type: Type.STRING },
                  role: { type: Type.STRING },
                  location: { type: Type.STRING },
                  period: { type: Type.STRING },
                  description: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["company", "role", "location", "period", "description"]
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  school: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  location: { type: Type.STRING },
                  period: { type: Type.STRING }
                },
                required: ["school", "degree", "location", "period"]
              }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  link: { type: Type.STRING }
                },
                required: ["name", "description"]
              }
            },
            certifications: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            languages: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            atsScore: { type: Type.NUMBER },
            tailoringFeedback: { type: Type.STRING }
          },
          required: ["personalInfo", "summary", "skills", "workExperience", "education", "atsScore", "tailoringFeedback"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Failed to generate tailored resume: Empty response from AI");
    }

    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("[Gemini Service Error]:", error);
    const errorMessage = error?.message || String(error);
    throw new Error(`AI Tailoring failed: ${errorMessage}`);
  }
}
