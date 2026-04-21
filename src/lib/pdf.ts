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

  // Header band
  doc.setFillColor(15, 12, 41);
  doc.rect(0, 0, pageWidth, 90, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("ZERO  ·  Intelligence Report", 40, 45);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generated ${new Date().toLocaleString()}`, 40, 65);
  if (data.author) doc.text(`Analyst: ${data.author}`, 40, 78);

  doc.setTextColor(20, 20, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(data.title, 40, 130);
  if (data.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(120, 120, 130);
    doc.text(data.subtitle, 40, 150);
  }

  let y = 180;
  doc.setTextColor(20, 20, 30);
  data.sections.forEach((s) => {
    if (y > 720) { doc.addPage(); y = 60; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(110, 80, 220);
    doc.text(s.heading, 40, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 50);
    const lines = doc.splitTextToSize(s.body, pageWidth - 80);
    lines.forEach((line: string) => {
      if (y > 760) { doc.addPage(); y = 60; }
      doc.text(line, 40, y);
      y += 14;
    });
    y += 12;
  });

  if (data.table) {
    autoTable(doc, {
      startY: y + 10,
      head: [data.table.columns],
      body: data.table.rows,
      theme: "grid",
      headStyles: { fillColor: [110, 80, 220], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 40, right: 40 },
    });
  }

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 160);
    doc.text(`ZERO Intelligence · Page ${i} of ${pageCount} · Confidential`, 40, doc.internal.pageSize.getHeight() - 20);
  }

  doc.save(`zero-report-${data.title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
};
