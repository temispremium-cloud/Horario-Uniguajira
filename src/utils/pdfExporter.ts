import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { saveFileToDevice } from './androidBridge';

export interface ExportPDFOptions {
  filename?: string;
  landscape?: boolean;
  fitToOnePage?: boolean;
}

export interface ExportPDFResult {
  pdfBlob: Blob;
  imgData: string;
  pdfBase64?: string;
  success: boolean;
  method: string;
}

/**
 * Exports a DOM element directly into a high-quality PDF file.
 * Completely bypasses iframe window.print() sandbox restrictions!
 */
export async function exportElementToPDF(
  element: HTMLElement,
  options: ExportPDFOptions = {}
): Promise<ExportPDFResult> {
  const {
    filename = 'Horario_Oficial_UniGuajira_C1.pdf',
    landscape = true,
    fitToOnePage = true
  } = options;

  // Save current scroll position
  const originalScrollX = window.scrollX;
  const originalScrollY = window.scrollY;

  try {
    const targetWidth = landscape ? 1220 : 860;

    // Clone or capture target element with crisp 2.2x scale
    const canvas = await html2canvas(element, {
      scale: 2.2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: targetWidth + 50,
      onclone: (clonedDoc) => {
        // Ensure all sheet elements are fully visible and properly proportioned in the clone
        const clonedTarget = clonedDoc.getElementById(element.id);
        if (clonedTarget) {
          clonedTarget.style.width = `${targetWidth}px`;
          clonedTarget.style.maxWidth = `${targetWidth}px`;
          clonedTarget.style.boxShadow = 'none';
          clonedTarget.style.border = 'none';
          clonedTarget.style.padding = landscape ? '16px 20px' : '20px 16px';
          clonedTarget.style.margin = '0';
        }
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.96);

    // Create PDF document (A4 landscape or portrait)
    const orientation = landscape ? 'landscape' : 'portrait';
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Balanced margins: 6mm for landscape (maximizes readable area), 8mm for portrait
    const margin = landscape ? 6 : 8;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const imgRatio = imgWidth / imgHeight;

    const pageCanvasHeight = (canvas.width * usableHeight) / usableWidth;

    if (fitToOnePage || canvas.height <= pageCanvasHeight * 1.15) {
      // Fits on a single page, maximizing width & height without distortion
      let printWidth = usableWidth;
      let printHeight = usableWidth / imgRatio;

      if (printHeight > usableHeight) {
        printHeight = usableHeight;
        printWidth = usableHeight * imgRatio;
      }

      // Center horizontally and vertically
      const posX = margin + (usableWidth - printWidth) / 2;
      const posY = margin + (usableHeight - printHeight) / 2;

      pdf.addImage(imgData, 'JPEG', posX, posY, printWidth, printHeight);
    } else {
      // Multi-page slicing for longer documents
      let remainingHeight = canvas.height;
      let currentSourceY = 0;
      let pageNum = 0;

      while (remainingHeight > 5) {
        if (pageNum > 0) {
          pdf.addPage();
        }

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        const currentSliceHeight = Math.min(remainingHeight, pageCanvasHeight);
        sliceCanvas.height = currentSliceHeight;

        const sliceCtx = sliceCanvas.getContext('2d');
        if (sliceCtx) {
          sliceCtx.fillStyle = '#ffffff';
          sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          sliceCtx.drawImage(
            canvas,
            0,
            currentSourceY,
            canvas.width,
            currentSliceHeight,
            0,
            0,
            canvas.width,
            currentSliceHeight
          );

          const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.95);
          const slicePrintHeight = (currentSliceHeight * usableWidth) / canvas.width;
          pdf.addImage(sliceData, 'JPEG', margin, margin, usableWidth, slicePrintHeight);
        }

        remainingHeight -= currentSliceHeight;
        currentSourceY += currentSliceHeight;
        pageNum++;
      }
    }

    // Save and download or share the file using Android/Mobile device bridge
    const pdfBlob = pdf.output('blob');
    const saveResult = await saveFileToDevice(pdfBlob, filename, 'application/pdf', 'Horario Oficial UniGuajira');

    return {
      pdfBlob,
      imgData,
      pdfBase64: saveResult.base64,
      success: saveResult.success,
      method: saveResult.method
    };
  } finally {
    // Restore scroll position
    window.scrollTo(originalScrollX, originalScrollY);
  }
}
