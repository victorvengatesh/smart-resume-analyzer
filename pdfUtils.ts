import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';

// The workerSrc property needs to be set to the path of the PDF worker script.
// We are pinning pdfjs-dist to version 4.10.38 in the importmap (index.html).
// Therefore, we explicitly use the worker from that same version path on esm.sh.
// This ensures the API version of the main library matches the Worker version.
const pdfJsWorkerSrc = 'https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.mjs';

try {
    if (typeof Worker !== 'undefined') { // Check if Worker is available (not in all environments like some server-side rendering)
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfJsWorkerSrc;
    }
} catch (error) {
    console.error("Error setting PDF.js worker source:", error);
    // Fallback or further error handling if needed
}


export const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  
  try {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // 'str' is the property holding the text for TextItem
        const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
        fullText += pageText + (pdf.numPages > 1 && i < pdf.numPages ? '\n\n' : ''); // Add double newline between pages for better separation if multiple pages
      } catch (pageError) {
        console.error(`Error processing page ${i}:`, pageError);
        fullText += `[Error extracting text from page ${i}]\n\n`;
      }
    }
    return fullText.trim();
  } catch (docError) {
    console.error("Error loading PDF document:", docError);
    if (docError && typeof docError === 'object' && 'message' in docError) {
        if ((docError as Error).message.toLowerCase().includes("invalid pdf structure")) {
            throw new Error("Invalid PDF structure. The file may be corrupted or not a valid PDF.");
        }
        throw new Error(`Failed to load PDF: ${(docError as Error).message}`);
    }
    throw new Error("An unknown error occurred while loading the PDF document.");
  }
};