import { useState, useEffect } from 'react';
import { Sample, SampleStatus } from '../types/sample';
import { storageService } from '../services/storage';
import { StatusHistoryModal } from './StatusHistoryModal';
import { UpdateStatusModal } from './UpdateStatusModal';
import { QRLabel } from './QRLabel';
import { History, Edit, Printer, Trash2, X, Search } from 'lucide-react';

interface SampleListProps {
  refresh: number;
}

const statusColors: Record<SampleStatus, string> = {
  'En Almacén': 'bg-blue-500',
  'En Laboratorio': 'bg-yellow-500',
  'Regresada': 'bg-green-500',
  'Entregada': 'bg-gray-500'
};

export function SampleList({ refresh }: SampleListProps) {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [filteredSamples, setFilteredSamples] = useState<Sample[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    loadSamples();
  }, [refresh]);

  useEffect(() => {
    filterSamples();
  }, [samples, searchTerm]);

  const loadSamples = () => {
    setSamples(storageService.getAllSamples());
  };

  const filterSamples = () => {
    if (!searchTerm.trim()) {
      setFilteredSamples(samples);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = samples.filter((sample) => {
      return (
        sample.id.toLowerCase().includes(term) ||
        sample.marca.toLowerCase().includes(term) ||
        sample.modelo.toLowerCase().includes(term) ||
        sample.responsable.toLowerCase().includes(term) ||
        (sample.razonSocial?.toLowerCase().includes(term)) ||
        (sample.numeroSolicitud?.toLowerCase().includes(term)) ||
        (sample.descripcion?.toLowerCase().includes(term)) ||
        new Date(sample.fechaRecepcion).toLocaleDateString().includes(term)
      );
    });
    setFilteredSamples(filtered);
  };

  const getDaysInSystem = (sample: Sample) => {
    const created = new Date(sample.createdAt);
    const now = new Date();
    const diff = now.getTime() - created.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const handleDelete = () => {
    if (deletePassword !== 'Normalitec') {
      setDeleteError('Contraseña incorrecta');
      return;
    }

    if (selectedSample) {
      storageService.deleteSample(selectedSample.id);
      loadSamples();
      setShowDeleteModal(false);
      setSelectedSample(null);
      setDeletePassword('');
      setDeleteError('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Lista de Muestras</h2>
          <p className="text-gray-600 mt-1">
            Total: {samples.length} muestras
            {searchTerm && ` | Mostrando: ${filteredSamples.length}`}
          </p>

          <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por marca, modelo, fecha, responsable, razón social, solicitud o descripción..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsable</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estatus</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Días</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {samples.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No hay muestras registradas
                  </td>
                </tr>
              ) : filteredSamples.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No se encontraron muestras que coincidan con "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredSamples.map((sample) => (
                  <tr key={sample.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{sample.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{sample.marca}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{sample.modelo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(sample.fechaRecepcion).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{sample.responsable}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${statusColors[sample.currentStatus]}`}>
                        {sample.currentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{getDaysInSystem(sample)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedSample(sample);
                            setShowHistoryModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Ver historial"
                        >
                          <History size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSample(sample);
                            setShowUpdateModal(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                          title="Actualizar estatus"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSample(sample);
                            setShowPrintModal(true);
                          }}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded transition"
                          title="Imprimir etiqueta"
                        >
                          <Printer size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSample(sample);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showHistoryModal && selectedSample && (
        <StatusHistoryModal
          sample={selectedSample}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedSample(null);
          }}
        />
      )}

      {showUpdateModal && selectedSample && (
        <UpdateStatusModal
          sample={selectedSample}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedSample(null);
          }}
          onUpdate={loadSamples}
        />
      )}

      {showPrintModal && selectedSample && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Imprimir Etiqueta</h3>
              <button
                onClick={() => {
                  setShowPrintModal(false);
                  setSelectedSample(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <QRLabel sample={selectedSample} />
          </div>
        </div>
      )}

      {showDeleteModal && selectedSample && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Eliminar Muestra</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSample(null);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800">
                ¿Está seguro que desea eliminar la muestra <span className="font-bold">{selectedSample.id}</span>?
              </p>
              <p className="text-red-600 text-sm mt-1">Esta acción no se puede deshacer.</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingrese la contraseña para confirmar
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setDeleteError('');
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  deleteError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Contraseña"
              />
              {deleteError && <p className="text-red-500 text-sm mt-1">{deleteError}</p>}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSample(null);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
