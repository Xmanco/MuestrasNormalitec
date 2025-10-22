import { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { storageService } from '../services/storage';
import { Sample } from '../types/sample';
import { UpdateStatusModal } from './UpdateStatusModal';
import { Camera, Upload, X, AlertCircle } from 'lucide-react';

export function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [foundSample, setFoundSample] = useState<Sample | null>(null);
  const [error, setError] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        scanFrame();
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara. Por favor, verifique los permisos.');
      console.error('Camera error:', err);
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setScanning(false);
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      try {
        const data = JSON.parse(code.data);
        if (data.id) {
          const sample = storageService.getSampleById(data.id);
          if (sample) {
            setFoundSample(sample);
            stopScanning();
            setShowUpdateModal(true);
          } else {
            setError('Muestra no encontrada en el sistema');
          }
        }
      } catch (err) {
        console.error('QR parse error:', err);
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError('');
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (event) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');

          if (!ctx) return;

          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            try {
              const data = JSON.parse(code.data);
              if (data.id) {
                const sample = storageService.getSampleById(data.id);
                if (sample) {
                  setFoundSample(sample);
                  setShowUpdateModal(true);
                } else {
                  setError('Muestra no encontrada en el sistema');
                }
              }
            } catch (err) {
              setError('No se pudo leer el código QR');
            }
          } else {
            setError('No se detectó ningún código QR en la imagen');
          }
        };

        img.src = event.target?.result as string;
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError('Error al procesar la imagen');
      console.error('File upload error:', err);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Escanear Código QR</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {!scanning ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={startCamera}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Camera size={24} />
                <span>Usar Cámara</span>
              </button>

              <label className="flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer">
                <Upload size={24} />
                <span>Subir Imagen</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-lg bg-black"
                style={{ maxHeight: '500px' }}
              />
              <canvas ref={canvasRef} className="hidden" />

              <button
                onClick={stopScanning}
                className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
              >
                <X size={24} />
              </button>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-4 border-green-500 rounded-lg" style={{ width: '250px', height: '250px' }}>
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500"></div>
                </div>
              </div>

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
                Apunte la cámara al código QR
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Instrucciones:</h3>
            <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
              <li>Use la cámara para escanear un código QR en tiempo real</li>
              <li>O suba una imagen que contenga un código QR</li>
              <li>Al detectar una muestra, se abrirá un modal para actualizar su estatus</li>
            </ul>
          </div>
        </div>
      </div>

      {showUpdateModal && foundSample && (
        <UpdateStatusModal
          sample={foundSample}
          onClose={() => {
            setShowUpdateModal(false);
            setFoundSample(null);
          }}
          onUpdate={() => {
            setFoundSample(null);
          }}
        />
      )}
    </div>
  );
}
