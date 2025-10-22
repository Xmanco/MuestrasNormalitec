import { Sample, SampleStatus } from '../types/sample';
import { X, Clock } from 'lucide-react';

interface StatusHistoryModalProps {
  sample: Sample;
  onClose: () => void;
}

const statusColors: Record<SampleStatus, string> = {
  'En Almacén': 'bg-blue-100 text-blue-800 border-blue-300',
  'En Laboratorio': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Regresada': 'bg-green-100 text-green-800 border-green-300',
  'Entregada': 'bg-gray-100 text-gray-800 border-gray-300'
};

export function StatusHistoryModal({ sample, onClose }: StatusHistoryModalProps) {
  const getDaysInSystem = () => {
    const created = new Date(sample.createdAt);
    const now = new Date();
    const diff = now.getTime() - created.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Historial de Estatus - {sample.id}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Marca</p>
              <p className="font-semibold">{sample.marca}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Modelo</p>
              <p className="font-semibold">{sample.modelo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Responsable</p>
              <p className="font-semibold">{sample.responsable}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Días en Sistema</p>
              <p className="font-semibold flex items-center gap-1">
                <Clock size={16} />
                {getDaysInSystem()} días
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700 mb-3">Historial de Cambios</h4>
          {sample.statusHistory.slice().reverse().map((change, index) => (
            <div
              key={index}
              className="border-l-4 pl-4 py-3 bg-gray-50 rounded-r-lg"
              style={{ borderLeftColor: statusColors[change.status].split(' ')[0].replace('bg-', '') }}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[change.status]}`}>
                  {change.status}
                </span>
                <span className="text-sm text-gray-600">
                  {new Date(change.date).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700 mt-2">{change.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
