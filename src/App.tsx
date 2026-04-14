/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from "react";
import { ResumeForm } from "./components/ResumeForm";
import { ResumePreview } from "./components/ResumePreview";
import { tailorResume, ResumeData } from "./services/gemini";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, FileText, CheckCircle2 } from "lucide-react";

export default function App() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [tailoredResume, setTailoredResume] = React.useState<ResumeData | null>(null);

  const handleTailor = async (jd: string, resume: string) => {
    // Robust check for API key in various possible locations
    const rawKey = 
      (process.env.GEMINI_API_KEY) || 
      ((import.meta as any).env?.VITE_GEMINI_API_KEY) || 
      ((import.meta as any).env?.GEMINI_API_KEY) || "";
    
    const apiKey = rawKey.replace(/^["']|["']$/g, "").trim();
    
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      toast.error("API Key Not Found in Build", {
        description: "You added the variable, but you MUST click 'Redeploy' in Vercel for it to take effect.",
      });
      return;
    }

    setIsLoading(true);
    console.log("[App] Starting resume tailoring...");
    try {
      const data = await tailorResume(jd, resume);
      console.log("[App] Tailoring successful:", data);
      setTailoredResume(data);
      toast.success("Resume tailored successfully!", {
        description: `ATS Score: ${data.atsScore}/10`,
      });
    } catch (error: any) {
      console.error("[App] Tailoring Error Details:", error);
      
      let message = "Failed to tailor resume. Please try again.";
      let description = error?.message || "An unexpected error occurred.";

      if (error?.message?.includes("API key")) {
        message = "Invalid or missing API Key";
        description = "Check your Vercel environment variables and REDEPLOY.";
      } else if (error?.message?.includes("quota") || error?.message?.includes("429")) {
        message = "Rate Limit Exceeded";
        description = "The free tier limit was reached. Please try again later.";
      } else if (error?.message?.includes("model")) {
        message = "Model Error";
        description = "The AI model is currently unavailable or the name is incorrect.";
      }
      
      toast.error(message, { description });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="py-8 px-4 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">ATS Tailor</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Resume Optimizer</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              ATS Friendly
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <Sparkles className="h-4 w-4 text-amber-500" />
              AI Powered
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 px-4">
        <AnimatePresence mode="wait">
          {!tailoredResume ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <ResumeForm onSubmit={handleTailor} isLoading={isLoading} />
              
              {/* Features Section */}
              <div className="max-w-4xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-slate-900" />
                  </div>
                  <h3 className="font-bold text-slate-900">Smart Keyword Targeting</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Our AI identifies critical keywords in the job description and weaves them naturally into your resume.
                  </p>
                </div>
                <div className="space-y-3 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-slate-900" />
                  </div>
                  <h3 className="font-bold text-slate-900">ATS Optimization</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Structured formatting that ensures your resume passes through automated screening systems with ease.
                  </p>
                </div>
                <div className="space-y-3 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-slate-900" />
                  </div>
                  <h3 className="font-bold text-slate-900">Instant Scoring</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Get immediate feedback on how well your resume matches the job requirements with a 0-10 score.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <ResumePreview 
                data={tailoredResume} 
                onBack={() => setTailoredResume(null)} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 font-medium">
            © 2026 ATS Resume Tailor. Built with Google Gemini.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Privacy</a>
            <a href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Terms</a>
            <a href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

