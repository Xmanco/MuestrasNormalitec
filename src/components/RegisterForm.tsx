import { useState } from 'react';
import { Sample, SampleStatus } from '../types/sample';
import { storageService } from '../services/storage';
import { QRLabel } from './QRLabel';
import { X } from 'lucide-react';

interface RegisterFormProps {
  onSampleRegistered: () => void;
}

export function RegisterForm({ onSampleRegistered }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    fechaRecepcion: new Date().toISOString().split('T')[0],
    responsable: '',
    razonSocial: '',
    numeroSolicitud: '',
    descripcion: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLabel, setShowLabel] = useState(false);
  const [createdSample, setCreatedSample] = useState<Sample | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.marca.trim()) newErrors.marca = 'La marca es obligatoria';
    if (!formData.modelo.trim()) newErrors.modelo = 'El modelo es obligatorio';
    if (!formData.fechaRecepcion) newErrors.fechaRecepcion = 'La fecha de recepción es obligatoria';
    if (!formData.responsable.trim()) newErrors.responsable = 'El responsable es obligatorio';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const id = storageService.generateUniqueId();
    const now = new Date().toISOString();

    const newSample: Sample = {
      id,
      marca: formData.marca,
      modelo: formData.modelo,
      fechaRecepcion: formData.fechaRecepcion,
      responsable: formData.responsable,
      razonSocial: formData.razonSocial || undefined,
      numeroSolicitud: formData.numeroSolicitud || undefined,
      descripcion: formData.descripcion || undefined,
      currentStatus: 'En Almacén',
      statusHistory: [
        {
          status: 'En Almacén' as SampleStatus,
          date: now,
          comment: 'Muestra registrada e ingresada al almacén'
        }
      ],
      createdAt: now
    };

    storageService.addSample(newSample);
    setCreatedSample(newSample);
    setShowLabel(true);

    setFormData({
      marca: '',
      modelo: '',
      fechaRecepcion: new Date().toISOString().split('T')[0],
      responsable: '',
      razonSocial: '',
      numeroSolicitud: '',
      descripcion: ''
    });

    onSampleRegistered();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Registrar Nueva Muestra</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marca <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.marca}
              onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.marca ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.marca && <p className="text-red-500 text-xs mt-1">{errors.marca}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modelo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.modelo}
              onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.modelo ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.modelo && <p className="text-red-500 text-xs mt-1">{errors.modelo}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Recepción <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.fechaRecepcion}
              onChange={(e) => setFormData({ ...formData, fechaRecepcion: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.fechaRecepcion ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.fechaRecepcion && <p className="text-red-500 text-xs mt-1">{errors.fechaRecepcion}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsable <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.responsable}
              onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.responsable ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.responsable && <p className="text-red-500 text-xs mt-1">{errors.responsable}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razón Social
            </label>
            <input
              type="text"
              value={formData.razonSocial}
              onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              N° Solicitud
            </label>
            <input
              type="text"
              value={formData.numeroSolicitud}
              onChange={(e) => setFormData({ ...formData, numeroSolicitud: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition font-semibold"
        >
          Registrar Muestra
        </button>
      </form>

      {showLabel && createdSample && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Muestra Registrada</h3>
              <button
                onClick={() => setShowLabel(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">
                Muestra <span className="font-bold">{createdSample.id}</span> registrada exitosamente
              </p>
            </div>

            <QRLabel sample={createdSample} />
          </div>
        </div>
      )}
    </div>
  );
}
