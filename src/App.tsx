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
        message = "Gemini API Limit Reached";
        description = "The Google Gemini free tier limit was reached. It usually resets every minute (for RPM) or every 24 hours (for daily limits).";
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
      <header className="py-4 px-4 border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">ATS TAILOR</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">AI RESUME OPTIMIZER</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              ATS Friendly
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Sparkles className="h-4 w-4 text-amber-500" />
              AI Powered
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 px-4 bg-slate-50/30">
        <AnimatePresence mode="wait">
          {!tailoredResume ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="max-w-4xl mx-auto"
            >
              {/* Hero Section */}
              <div className="text-center mb-12 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-100 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-blue-600">1,000+ resumes tailored this month</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                  Get more interviews. <br />
                  <span className="text-blue-600">Match your resume to any job.</span>
                </h2>
                
                <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                  Paste a job description and your resume — get a keyword-optimized, <br className="hidden md:block" />
                  ATS-ready version in seconds.
                </p>

                {/* Steps */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 pt-4 text-slate-600 font-medium">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
                    <span>Paste job description</span>
                  </div>
                  <div className="hidden md:block text-slate-300">→</div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-600 text-white text-xs font-bold">2</span>
                    <span>Add your resume</span>
                  </div>
                  <div className="hidden md:block text-slate-300">→</div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-600 text-white text-xs font-bold">3</span>
                    <span>Get tailored output</span>
                  </div>
                </div>
              </div>

              <ResumeForm onSubmit={handleTailor} isLoading={isLoading} />
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

