import { useState, useRef } from 'react';
import { storageService } from '../services/storage';
import { excelService, ImportResult } from '../services/excelService';
import { X, Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';

interface ExcelModalProps {
  onClose: () => void;
  onImportComplete: () => void;
}

export function ExcelModal({ onClose, onImportComplete }: ExcelModalProps) {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const samples = storageService.getAllSamples();
    excelService.exportToExcel(samples);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const result = await excelService.importFromExcel(file);
      setImportResult(result);

      if (result.success > 0 || result.updated > 0) {
        onImportComplete();
      }
    } catch (error) {
      setImportResult({
        success: 0,
        updated: 0,
        errors: ['Error al importar el archivo']
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Gestión con Excel</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Exportar a Excel</h4>
                <p className="text-blue-800 text-sm mb-3">
                  Descarga un archivo Excel con 3 hojas: Muestras (datos completos), Resumen (cantidades por estatus) e Historial (todos los cambios de estatus).
                </p>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  <Download size={18} />
                  Exportar Muestras
                </button>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Upload className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 mb-2">Importar desde Excel</h4>
                <p className="text-green-800 text-sm mb-3">
                  Sube un archivo Excel con las columnas: Marca, Modelo, Fecha Recepción, Responsable (obligatorios) y opcionalmente: Razón Social, N° Solicitud, Descripción, ID.
                </p>
                <p className="text-green-800 text-sm mb-3">
                  Si incluyes el ID de una muestra existente, se actualizará. Si no, se creará una nueva.
                </p>

                <label className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition cursor-pointer">
                  <Upload size={18} />
                  {importing ? 'Importando...' : 'Seleccionar Archivo'}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleImport}
                    disabled={importing}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {importResult && (
            <div className={`border rounded-lg p-4 ${
              importResult.errors.length === 0
                ? 'bg-green-50 border-green-200'
                : importResult.success + importResult.updated > 0
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {importResult.errors.length === 0 ? (
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
                ) : (
                  <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Resultado de Importación</h4>

                  <div className="space-y-2 mb-3">
                    {importResult.success > 0 && (
                      <p className="text-sm text-green-800">
                        Muestras creadas: <span className="font-bold">{importResult.success}</span>
                      </p>
                    )}
                    {importResult.updated > 0 && (
                      <p className="text-sm text-blue-800">
                        Muestras actualizadas: <span className="font-bold">{importResult.updated}</span>
                      </p>
                    )}
                  </div>

                  {importResult.errors.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-red-800 mb-2">
                        Errores encontrados ({importResult.errors.length}):
                      </p>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {importResult.errors.map((error, index) => (
                          <p key={index} className="text-sm text-red-700">
                            • {error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Formato de Ejemplo</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p><span className="font-semibold">Columnas obligatorias:</span></p>
              <ul className="list-disc list-inside ml-4">
                <li>Marca</li>
                <li>Modelo</li>
                <li>Fecha Recepción (formato: DD/MM/YYYY o YYYY-MM-DD)</li>
                <li>Responsable</li>
              </ul>
              <p className="mt-2"><span className="font-semibold">Columnas opcionales:</span></p>
              <ul className="list-disc list-inside ml-4">
                <li>ID (para actualizar muestras existentes)</li>
                <li>Razón Social</li>
                <li>N° Solicitud</li>
                <li>Descripción</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
