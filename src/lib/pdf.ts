import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type ReportData = {
  title: string;
  subtitle?: string;
  author?: string;
  sections: { heading: string; body: string }[];
  table?: { columns: string[]; rows: (string | number)[][] };
};

export const generateReportPDF = (data: ReportData) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // === COVER ===
  // Deep gradient-feel background band
  doc.setFillColor(15, 11, 36);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Accent bar
  doc.setFillColor(124, 92, 255);
  doc.rect(0, 0, 6, pageHeight, "F");

  // Brand mark
  doc.setFillColor(124, 92, 255);
  doc.roundedRect(48, 60, 36, 36, 8, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Z", 60, 86);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("ZERO", 96, 78);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(170, 165, 200);
  doc.text("INTELLIGENCE  ·  CONFIDENTIAL BRIEF", 96, 92);

  // Eyebrow
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(190, 170, 255);
  doc.text("INTELLIGENCE BRIEFING", 48, 230);

  // Title
  doc.setFont("times", "bold");
  doc.setFontSize(34);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(data.title, pageWidth - 120);
  doc.text(titleLines, 48, 270);

  if (data.subtitle) {
    doc.setFont("times", "italic");
    doc.setFontSize(15);
    doc.setTextColor(200, 195, 230);
    const sub = doc.splitTextToSize(data.subtitle, pageWidth - 120);
    doc.text(sub, 48, 270 + titleLines.length * 36 + 14);
  }

  // Footer meta on cover
  doc.setDrawColor(80, 70, 130);
  doc.setLineWidth(0.5);
  doc.line(48, pageHeight - 90, pageWidth - 48, pageHeight - 90);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(160, 155, 195);
  doc.text("PREPARED", 48, pageHeight - 70);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), 48, pageHeight - 56);

  if (data.author) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(160, 155, 195);
    doc.text("FOR", 220, pageHeight - 70);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(data.author, 220, pageHeight - 56);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(160, 155, 195);
  doc.text("CLASSIFICATION", pageWidth - 160, pageHeight - 70);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 200, 120);
  doc.text("CONFIDENTIAL", pageWidth - 160, pageHeight - 56);

  // === BODY PAGE ===
  doc.addPage();
  let y = 70;

  // Page header rule
  doc.setDrawColor(220, 215, 235);
  doc.setLineWidth(0.5);
  doc.line(48, 50, pageWidth - 48, 50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(124, 92, 255);
  doc.text("ZERO  ·  " + data.title.toUpperCase(), 48, 42);
  doc.setTextColor(150, 145, 170);
  doc.setFont("helvetica", "normal");
  doc.text(new Date().toLocaleDateString(), pageWidth - 48, 42, { align: "right" });

  data.sections.forEach((s, idx) => {
    if (y > 720) { doc.addPage(); y = 70; }

    // Section number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(124, 92, 255);
    doc.text(String(idx + 1).padStart(2, "0"), 48, y);

    // Heading (editorial serif)
    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.setTextColor(20, 18, 40);
    const headingLines = doc.splitTextToSize(s.heading, pageWidth - 120);
    doc.text(headingLines, 70, y);
    y += headingLines.length * 20 + 6;

    // Decorative rule
    doc.setDrawColor(124, 92, 255);
    doc.setLineWidth(1.2);
    doc.line(70, y, 110, y);
    y += 14;

    // Body
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(50, 48, 70);
    const lines = doc.splitTextToSize(s.body, pageWidth - 120);
    lines.forEach((line: string) => {
      if (y > 760) { doc.addPage(); y = 70; }
      doc.text(line, 70, y);
      y += 15;
    });
    y += 22;
  });

  if (data.table) {
    if (y > 600) { doc.addPage(); y = 70; }
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.setTextColor(20, 18, 40);
    doc.text("Signal Appendix", 48, y);
    y += 14;
    autoTable(doc, {
      startY: y + 4,
      head: [data.table.columns],
      body: data.table.rows,
      theme: "plain",
      headStyles: { fillColor: [124, 92, 255], textColor: 255, fontStyle: "bold", fontSize: 9, cellPadding: 7 },
      bodyStyles: { fontSize: 9, textColor: [40, 38, 60], cellPadding: 6 },
      alternateRowStyles: { fillColor: [248, 246, 252] },
      margin: { left: 48, right: 48 },
    });
  }

  // Footer on every page (skip cover)
  const pageCount = doc.getNumberOfPages();
  for (let i = 2; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 215, 235);
    doc.setLineWidth(0.5);
    doc.line(48, pageHeight - 36, pageWidth - 48, pageHeight - 36);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(150, 145, 170);
    doc.text("ZERO INTELLIGENCE  ·  CONFIDENTIAL", 48, pageHeight - 22);
    doc.text(`${i - 1} / ${pageCount - 1}`, pageWidth - 48, pageHeight - 22, { align: "right" });
  }

  doc.save(`zero-${data.title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.pdf`);
};
