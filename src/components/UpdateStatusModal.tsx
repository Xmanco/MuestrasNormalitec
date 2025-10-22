import { useState } from 'react';
import { Sample, SampleStatus } from '../types/sample';
import { storageService } from '../services/storage';
import { X } from 'lucide-react';

interface UpdateStatusModalProps {
  sample: Sample;
  onClose: () => void;
  onUpdate: () => void;
}

const statusOptions: SampleStatus[] = ['En Almacén', 'En Laboratorio', 'Regresada', 'Entregada'];

const statusColors: Record<SampleStatus, string> = {
  'En Almacén': 'bg-blue-500',
  'En Laboratorio': 'bg-yellow-500',
  'Regresada': 'bg-green-500',
  'Entregada': 'bg-gray-500'
};

const statusDefaultComments: Record<SampleStatus, string> = {
  'En Almacén': 'Muestra almacenada',
  'En Laboratorio': 'Muestra enviada a laboratorio para análisis',
  'Regresada': 'Muestra regresada del laboratorio',
  'Entregada': 'Muestra entregada al cliente'
};

export function UpdateStatusModal({ sample, onClose, onUpdate }: UpdateStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<SampleStatus>(sample.currentStatus);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    const updatedSample: Sample = {
      ...sample,
      currentStatus: selectedStatus,
      statusHistory: [
        ...sample.statusHistory,
        {
          status: selectedStatus,
          date: new Date().toISOString(),
          comment: comment || statusDefaultComments[selectedStatus]
        }
      ]
    };

    storageService.updateSample(sample.id, updatedSample);
    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Actualizar Estatus</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Muestra</p>
          <p className="font-semibold">{sample.id} - {sample.marca} {sample.modelo}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nuevo Estatus
          </label>
          <div className="grid grid-cols-2 gap-2">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-3 rounded-lg font-medium transition ${
                  selectedStatus === status
                    ? `${statusColors[status]} text-white`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comentario
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={statusDefaultComments[selectedStatus]}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Si no se especifica, se usará el comentario por defecto
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  );
}
