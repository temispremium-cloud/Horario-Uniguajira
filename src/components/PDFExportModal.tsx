import React, { useState } from 'react';
import {
  X,
  Download,
  Share2,
  Printer,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  FileText
} from 'lucide-react';
import { vibrateDevice, isAndroidDevice } from '../utils/androidBridge';

interface PDFExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlob: Blob | null;
  imgData: string | null;
  pdfBase64?: string;
  filename?: string;
}

export const PDFExportModal: React.FC<PDFExportModalProps> = ({
  isOpen,
  onClose,
  pdfBlob,
  imgData,
  pdfBase64,
  filename = 'Horario_Oficial_UniGuajira_C1.pdf'
}) => {
  const [downloadedAction, setDownloadedAction] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadPDFAgain = () => {
    vibrateDevice(40);
    setDownloadedAction('pdf');
    try {
      if (pdfBlob) {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (a.parentNode) a.parentNode.removeChild(a);
          URL.revokeObjectURL(url);
        }, 1500);
      } else if (pdfBase64) {
        const a = document.createElement('a');
        a.href = `data:application/pdf;base64,${pdfBase64}`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (a.parentNode) a.parentNode.removeChild(a);
        }, 1500);
      }
    } catch (e) {
      console.error('Manual PDF download failed:', e);
    }
    setTimeout(() => setDownloadedAction(null), 3500);
  };

  const handleSaveAsImage = () => {
    vibrateDevice(50);
    if (!imgData) return;
    setDownloadedAction('image');
    try {
      const imgFilename = filename.replace(/\.pdf$/i, '.jpg');
      const a = document.createElement('a');
      a.href = imgData;
      a.download = imgFilename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) a.parentNode.removeChild(a);
      }, 1500);
    } catch (e) {
      console.error('Save image failed:', e);
    }
    setTimeout(() => setDownloadedAction(null), 3500);
  };

  const handleShare = async () => {
    vibrateDevice(40);
    setDownloadedAction('share');
    const shareTitle = 'Horario Oficial UniGuajira - Licenciatura C1';
    const shareText = 'Horario Oficial de Clases Grupo C1 - Licenciatura en Educación Básica Primaria (Uribia) - Universidad de La Guajira';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        if (pdfBlob && navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], filename, { type: 'application/pdf' })] })) {
          const file = new File([pdfBlob], filename, { type: 'application/pdf' });
          await navigator.share({
            files: [file],
            title: shareTitle,
            text: shareText
          });
          setTimeout(() => setDownloadedAction(null), 2500);
          return;
        } else {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: window.location.href
          });
          setTimeout(() => setDownloadedAction(null), 2500);
          return;
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          setDownloadedAction(null);
          return;
        }
      }
    }

    // Fallback: clipboard
    try {
      await navigator.clipboard.writeText(`${shareTitle}\n${shareText}\n${window.location.href}`);
      alert('Texto del horario copiado al portapapeles para compartir por WhatsApp.');
    } catch {
      // Ignore
    }
    setTimeout(() => setDownloadedAction(null), 3500);
  };

  const handleNativePrint = () => {
    vibrateDevice(40);
    try {
      window.print();
    } catch (err) {
      console.warn('Native print not supported in this container:', err);
    }
  };

  const handleOpenInBrowser = () => {
    vibrateDevice(40);
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
    } else if (imgData) {
      window.open(imgData, '_blank');
    }
  };

  return (
    <div
      id="pdf-export-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl border border-slate-200 my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#b7191f] flex items-center justify-center border border-red-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                Horario Oficial Generado
              </h3>
              <p className="text-[11px] text-slate-500">
                Grupo C1 • Licenciatura Primaria Uribia
              </p>
            </div>
          </div>
          <button
            id="btn-close-pdf-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Thumbnail */}
        {imgData && (
          <div className="mt-3 relative rounded-xl border border-slate-200 bg-slate-50 p-2 max-h-48 overflow-hidden flex items-center justify-center shadow-inner">
            <img
              src={imgData}
              alt="Previsualización Horario Oficial UniGuajira"
              className="max-h-44 w-auto object-contain rounded shadow-xs"
            />
            <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Documento listo
            </div>
          </div>
        )}

        {/* Action Buttons specifically optimized for Android WebViews and Mobile */}
        <div className="mt-4 space-y-2">
          {/* Main: Download PDF */}
          <button
            id="btn-modal-action-pdf"
            onClick={handleDownloadPDFAgain}
            className="w-full min-h-[46px] px-4 py-2.5 bg-[#b7191f] hover:bg-[#9c151a] active:bg-[#851216] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-transform active:scale-[0.99]"
          >
            {downloadedAction === 'pdf' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>¡Descarga de PDF Solicitada!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Descargar Archivo PDF (.pdf)</span>
              </>
            )}
          </button>

          {/* Secondary 1: Save as high quality image (100% Android WebView compatible) */}
          <button
            id="btn-modal-action-image"
            onClick={handleSaveAsImage}
            className="w-full min-h-[44px] px-4 py-2.5 bg-slate-800 hover:bg-slate-900 active:bg-black text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-transform active:scale-[0.99]"
          >
            {downloadedAction === 'image' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>¡Imagen Guardada en Galería!</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>Guardar en Galería como Imagen (.jpg)</span>
              </>
            )}
          </button>

          {/* Secondary 2: Share via WhatsApp / Native Share */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              id="btn-modal-action-share"
              onClick={handleShare}
              className="min-h-[42px] px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Compartir</span>
            </button>

            <button
              id="btn-modal-action-print"
              onClick={handleNativePrint}
              className="min-h-[42px] px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Imprimir / PDF OS</span>
            </button>
          </div>

          {/* Extra fallback: open in browser tab if inside WebView */}
          <button
            id="btn-modal-action-open-browser"
            onClick={handleOpenInBrowser}
            className="w-full text-center text-[11px] text-slate-500 hover:text-slate-800 underline pt-1 cursor-pointer flex items-center justify-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Abrir documento en pestaña o visor completo</span>
          </button>
        </div>

        {/* Android Guidance Note */}
        {isAndroidDevice() && (
          <div className="mt-3 p-2.5 bg-amber-50/80 border border-amber-200/70 rounded-xl text-[11px] text-amber-900 leading-snug">
            <p className="font-semibold text-amber-950">💡 Ayuda para tu celular Android:</p>
            <p className="mt-0.5 text-amber-800">
              En aplicaciones Android convertidas, la opción <strong>&quot;Guardar en Galería (.jpg)&quot;</strong> o <strong>&quot;Imprimir / PDF OS&quot;</strong> te garantiza guardar el horario al 100% directamente en tus fotos o en la carpeta Descargas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
