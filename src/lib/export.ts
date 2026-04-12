import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ExternalHyperlink, BorderStyle } from "docx";
import { saveAs } from "file-saver";
import { ResumeData } from "@/src/services/gemini";

export async function exportToDocx(data: ResumeData) {
  const { personalInfo, summary, skills, workExperience, education, projects } = data;

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({
                text: personalInfo.name.toUpperCase(),
                bold: true,
                size: 32,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `${personalInfo.email} | ${personalInfo.phone}`,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `LinkedIn: ${personalInfo.linkedin} | GitHub: ${personalInfo.github}`,
                size: 20,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Summary
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "PROFESSIONAL SUMMARY", bold: true, size: 24 })],
            border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
          }),
          new Paragraph({
            children: [new TextRun({ text: summary, size: 22 })],
            spacing: { before: 100, after: 200 },
          }),

          // Skills
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "SKILLS", bold: true, size: 24 })],
            border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
          }),
          new Paragraph({
            children: [new TextRun({ text: skills.join(", "), size: 22 })],
            spacing: { before: 100, after: 200 },
          }),

          // Experience
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "WORK EXPERIENCE", bold: true, size: 24 })],
            border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
          }),
          ...workExperience.flatMap((exp) => [
            new Paragraph({
              spacing: { before: 200 },
              children: [
                new TextRun({ text: exp.role, bold: true, size: 24 }),
                new TextRun({ text: `\t${exp.period}`, bold: true, size: 22 }),
              ],
              tabStops: [{ type: "right", position: 9350 }],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: exp.company, italics: true, size: 22 }),
                new TextRun({ text: `\t${exp.location}`, italics: true, size: 22 }),
              ],
              tabStops: [{ type: "right", position: 9350 }],
            }),
            ...exp.description.map(
              (bullet) =>
                new Paragraph({
                  text: bullet,
                  bullet: { level: 0 },
                  spacing: { before: 50 },
                })
            ),
          ]),

          // Education
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300 },
            children: [new TextRun({ text: "EDUCATION", bold: true, size: 24 })],
            border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
          }),
          ...education.flatMap((edu) => [
            new Paragraph({
              spacing: { before: 100 },
              children: [
                new TextRun({ text: edu.school, bold: true, size: 22 }),
                new TextRun({ text: `\t${edu.period}`, bold: true, size: 22 }),
              ],
              tabStops: [{ type: "right", position: 9350 }],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: edu.degree, size: 22 }),
                new TextRun({ text: `\t${edu.location}`, size: 22 }),
              ],
              tabStops: [{ type: "right", position: 9350 }],
            }),
          ]),

          // Projects
          ...(projects && projects.length > 0
            ? [
                new Paragraph({
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 300 },
                  children: [new TextRun({ text: "PROJECTS", bold: true, size: 24 })],
                  border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
                }),
                ...projects.flatMap((project) => [
                  new Paragraph({
                    spacing: { before: 100 },
                    children: [
                      new TextRun({ text: project.name, bold: true, size: 22 }),
                      ...(project.link ? [new TextRun({ text: ` (${project.link})`, size: 18 })] : []),
                    ],
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: project.description, size: 22 })],
                  }),
                ]),
              ]
            : []),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${personalInfo.name.replace(/\s+/g, "_")}_Resume.docx`);
}
