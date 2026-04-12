import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

interface ResumeFormProps {
  onSubmit: (jd: string, resume: string) => void;
  isLoading: boolean;
}

export function ResumeForm({ onSubmit, isLoading }: ResumeFormProps) {
  const [jd, setJd] = React.useState("");
  const [resume, setResume] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jd && resume) {
      onSubmit(jd, resume);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border-none shadow-xl bg-white/50 backdrop-blur-sm">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
          Tailor Your Resume
        </CardTitle>
        <CardDescription className="text-slate-500 text-lg">
          Paste the job description and your current resume to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="jd" className="text-sm font-semibold uppercase tracking-wider text-slate-700">
                Job Description
              </Label>
              <Textarea
                id="jd"
                placeholder="Paste the job description here..."
                className="min-h-[300px] resize-none border-slate-200 focus:ring-2 focus:ring-slate-900 transition-all"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="resume" className="text-sm font-semibold uppercase tracking-wider text-slate-700">
                Current Resume
              </Label>
              <Textarea
                id="resume"
                placeholder="Paste your current resume text here..."
                className="min-h-[300px] resize-none border-slate-200 focus:ring-2 focus:ring-slate-900 transition-all"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex justify-center gap-4 pt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={() => {
                setJd("Software Engineer at TechCorp\n\nResponsibilities:\n- Build scalable web applications using React and TypeScript\n- Collaborate with cross-functional teams\n- Optimize application performance\n- Write clean, maintainable code");
                setResume("John Doe\nEmail: john@example.com\nPhone: 123-456-7890\n\nSummary: Experienced developer with a focus on frontend technologies.\n\nSkills: JavaScript, HTML, CSS, React.\n\nExperience:\nWeb Developer at OldCo (2020-2023)\n- Built websites for clients.\n- Used JavaScript and CSS.");
              }}
              className="px-6 py-6 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
            >
              Load Sample Data
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !jd || !resume}
              className="px-12 py-6 text-lg font-bold rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Tailoring...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Tailored Resume
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
