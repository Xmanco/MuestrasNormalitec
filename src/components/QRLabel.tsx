import { useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { Sample } from '../types/sample';

interface QRLabelProps {
  sample: Sample;
  onDownload?: () => void;
  downloadQROnly?: boolean;
}

export function QRLabel({ sample, onDownload, downloadQROnly }: QRLabelProps) {
  const labelRef = useRef<HTMLDivElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (qrCanvasRef.current) {
      const qrData = JSON.stringify({
        id: sample.id,
        marca: sample.marca,
        modelo: sample.modelo,
        fechaRecepcion: sample.fechaRecepcion,
        responsable: sample.responsable
      });

      QRCode.toCanvas(qrCanvasRef.current, qrData, {
        width: 110,
        margin: 1
      });
    }
  }, [sample]);

  const handleDownload = async () => {
    try {
      if (downloadQROnly && qrCanvasRef.current) {
        const url = qrCanvasRef.current.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `QR-${sample.id}.png`;
        link.href = url;
        link.click();
      } else if (labelRef.current) {
        const canvas = await html2canvas(labelRef.current, {
          backgroundColor: '#ffffff',
          scale: 2
        });
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Etiqueta-${sample.id}.png`;
        link.href = url;
        link.click();
      }
      onDownload?.();
    } catch (error) {
      console.error('Error generating label:', error);
    }
  };

  useEffect(() => {
    if (onDownload) {
      handleDownload();
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={labelRef}
        className="bg-white border-2 border-gray-800"
        style={{ width: '384px', height: '192px' }}
      >
        <div className="flex items-center justify-between h-full p-4">
          <div className="flex-1 pr-4">
            <div className="text-lg font-bold mb-2">{sample.id}</div>
            <div className="text-sm space-y-1">
              <div><span className="font-semibold">Marca:</span> {sample.marca}</div>
              <div><span className="font-semibold">Modelo:</span> {sample.modelo}</div>
              <div><span className="font-semibold">Fecha:</span> {new Date(sample.fechaRecepcion).toLocaleDateString()}</div>
              <div><span className="font-semibold">Resp:</span> {sample.responsable}</div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <canvas ref={qrCanvasRef} />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleDownload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Descargar Etiqueta Completa
        </button>
        <button
          onClick={async () => {
            if (qrCanvasRef.current) {
              const url = qrCanvasRef.current.toDataURL('image/png');
              const link = document.createElement('a');
              link.download = `QR-${sample.id}.png`;
              link.href = url;
              link.click();
            }
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
        >
          Descargar Solo QR
        </button>
      </div>
    </div>
  );
}
