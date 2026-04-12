import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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
  atsScore: number;
  tailoringFeedback: string;
}

export async function tailorResume(jobDescription: string, oldResume: string): Promise<ResumeData> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are an expert ATS (Applicant Tracking System) optimization specialist and professional resume writer.
            
            TASK:
            Tailor the provided resume to match the given job description (JD).
            
            REQUIREMENTS:
            1. ATS FRIENDLY: Use keywords from the JD naturally.
            2. STRUCTURE: Header (Name, Contact, Links), Summary, Skills, Work Experience, Education.
            3. PROJECTS: ONLY include a projects section if the user has explicitly listed projects in their OLD RESUME. DO NOT hallucinate or create fake projects.
            4. RATING: Provide an ATS compatibility score out of 10.
            5. FEEDBACK: Briefly explain what was changed to make it a better match.
            6. FORMAT: Return the response in strict JSON format.
            
            JOB DESCRIPTION:
            ${jobDescription}
            
            OLD RESUME:
            ${oldResume}
            `
          }
        ]
      }
    ],
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
          atsScore: { type: Type.NUMBER },
          tailoringFeedback: { type: Type.STRING }
        },
        required: ["personalInfo", "summary", "skills", "workExperience", "education", "atsScore", "tailoringFeedback"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate tailored resume");
  }

  return JSON.parse(response.text);
}
