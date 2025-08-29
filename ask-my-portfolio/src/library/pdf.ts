//Etract text from pdf
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export function normalizeText(s: string) {
  return s
    .replace(/\r\n/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/\u00AD/g, "")
    .replace(/([A-Za-z])-\s*\n\s*([A-Za-z])/g, "$1-$2")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/(\S)\n(\S)/g, "$1 $2")
    .replace(/^[\s•·▪◦■]+/gm, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .replace(/ﬁ/g, "fi")
    .replace(/ﬂ/g, "fl");
}

export async function extractTextFromPDF(file: File) {
  const arrayBuffer = await file.arrayBuffer(); //this converts pdf into raw binary data
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise; //this ask pdf.js to load the PDF doc from bthe binary data;

  const pages: { page: number; text: string }[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    const text = normalizeText(strings.join(" "));
    pages.push({ page: i, text });
  }
  return pages;
}
