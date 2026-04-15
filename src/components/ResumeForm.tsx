import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import * as mammoth from "mammoth";
import * as pdfjs from "pdfjs-dist";

// Set up PDF.js worker - using a more reliable CDN link
const PDFJS_VERSION = '4.0.379';
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

interface ResumeFormProps {
  onSubmit: (jd: string, resume: string) => void;
  isLoading: boolean;
}

export function ResumeForm({ onSubmit, isLoading }: ResumeFormProps) {
  const [jd, setJd] = React.useState("");
  const [resume, setResume] = React.useState("");
  const [isParsing, setIsParsing] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jd && resume) {
      onSubmit(jd, resume);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    if (fileType === 'doc') {
      toast.error("Old .doc format not supported", {
        description: "Please convert your file to .docx or .pdf first."
      });
      return;
    }

    if (!['pdf', 'docx'].includes(fileType || '')) {
      toast.error("Unsupported file format", {
        description: "Please upload a .pdf or .docx file."
      });
      return;
    }

    setIsParsing(true);
    const reader = new FileReader();

    reader.onerror = () => {
      toast.error("Failed to read file");
      setIsParsing(false);
    };

    try {
      if (fileType === 'docx') {
        reader.onload = async (event) => {
          try {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const result = await mammoth.extractRawText({ arrayBuffer });
            setResume(result.value);
            toast.success("Resume uploaded successfully!");
          } catch (error) {
            console.error("Docx parsing error:", error);
            toast.error("Failed to parse Word document");
          } finally {
            setIsParsing(false);
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (fileType === 'pdf') {
        reader.onload = async (event) => {
          try {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            
            // Initialize PDF.js
            const loadingTask = pdfjs.getDocument({ 
              data: arrayBuffer,
              useWorkerFetch: true,
              isEvalSupported: false,
            });
            
            const pdf = await loadingTask.promise;
            let fullText = "";
            
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items
                .map((item: any) => item.str)
                .join(" ");
              fullText += pageText + "\n";
            }
            
            if (fullText.trim().length === 0) {
              throw new Error("No text found in PDF");
            }

            setResume(fullText);
            toast.success("Resume uploaded successfully!");
          } catch (error: any) {
            console.error("PDF parsing error:", error);
            toast.error("Failed to parse PDF", {
              description: error.message || "The file might be encrypted or corrupted."
            });
          } finally {
            setIsParsing(false);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        setIsParsing(false);
      }
    } catch (error) {
      console.error("File upload error:", error);
      setIsParsing(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border-none shadow-xl bg-white/50 backdrop-blur-sm">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
          Tailor Your Resume
        </CardTitle>
        <CardDescription className="text-slate-500 text-lg">
          Upload your resume or paste the text to get started.
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
                className="min-h-[350px] resize-none border-slate-200 focus:ring-2 focus:ring-slate-900 transition-all"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                required
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="resume" className="text-sm font-semibold uppercase tracking-wider text-slate-700">
                  Current Resume
                </Label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.docx"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isParsing}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 rounded-full border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    {isParsing ? (
                      <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    ) : (
                      <Upload className="mr-1.5 h-3 w-3" />
                    )}
                    {isParsing ? "Parsing..." : "Upload File"}
                  </Button>
                </div>
              </div>
              <Textarea
                id="resume"
                placeholder="Paste your resume text here or upload a file..."
                className="min-h-[350px] resize-none border-slate-200 focus:ring-2 focus:ring-slate-900 transition-all"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || !jd || !resume}
              className="w-full md:w-auto px-12 py-6 text-lg font-bold rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
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
