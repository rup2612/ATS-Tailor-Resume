import * as React from "react";
import { ResumeData } from "@/src/services/gemini";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Linkedin, Github, MapPin, ExternalLink, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { exportToDocx } from "@/src/lib/export";
import { FileText } from "lucide-react";

interface ResumePreviewProps {
  data: ResumeData;
  onBack: () => void;
}

export function ResumePreview({ data, onBack }: ResumePreviewProps) {
  const { personalInfo, summary, skills, workExperience, education, projects, atsScore, tailoringFeedback } = data;

  const handleDownloadDocx = async () => {
    try {
      await exportToDocx(data);
    } catch (error) {
      console.error("Error exporting to DOCX:", error);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center px-4">
        <Button variant="ghost" onClick={onBack} className="text-slate-600 hover:text-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Editor
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">ATS Score</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">{atsScore}</span>
              <span className="text-slate-400 font-medium">/10</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadDocx} className="rounded-full px-6 border-slate-200">
              <FileText className="mr-2 h-4 w-4" />
              Word (.docx)
            </Button>
            <Button className="bg-slate-900 text-white rounded-full px-6">
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left Sidebar: Feedback */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-md bg-slate-50">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Tailoring Feedback</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {tailoringFeedback}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Resume Content */}
        <Card className="lg:col-span-2 border-none shadow-2xl bg-white min-h-[1000px]">
          <CardContent className="p-12 space-y-10">
            {/* Header */}
            <header className="text-center space-y-4">
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">{personalInfo.name}</h1>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {personalInfo.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {personalInfo.phone}
                </span>
                <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                  <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                </a>
                <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                  <Github className="h-3.5 w-3.5" /> GitHub
                </a>
              </div>
            </header>

            <Separator className="bg-slate-100" />

            {/* Summary */}
            <section className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Professional Summary</h2>
              <p className="text-slate-700 leading-relaxed text-[15px]">
                {summary}
              </p>
            </section>

            {/* Skills */}
            <section className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span key={i} className="text-slate-700 text-[14px] font-medium">
                    {skill}{i < skills.length - 1 ? " • " : ""}
                  </span>
                ))}
              </div>
            </section>

            {/* Experience */}
            <section className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Work Experience</h2>
              <div className="space-y-8">
                {workExperience.map((exp, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{exp.role}</h3>
                        <p className="text-slate-600 font-medium">{exp.company}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{exp.period}</p>
                        <p className="text-xs text-slate-500 flex items-center justify-end gap-1">
                          <MapPin className="h-3 w-3" /> {exp.location}
                        </p>
                      </div>
                    </div>
                    <ul className="list-disc list-outside ml-4 space-y-2">
                      {exp.description.map((bullet, j) => (
                        <li key={j} className="text-slate-700 text-[14px] leading-relaxed pl-1">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Education</h2>
              <div className="space-y-6">
                {education.map((edu, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                      <p className="text-slate-600">{edu.school}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{edu.period}</p>
                      <p className="text-xs text-slate-500">{edu.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Projects */}
            {projects && projects.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Key Projects</h2>
                <div className="grid grid-cols-1 gap-6">
                  {projects.map((project, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900">{project.name}</h3>
                        {project.link && (
                          <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-slate-700 text-[14px] leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
