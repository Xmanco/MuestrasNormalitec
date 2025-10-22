export type SampleStatus = 'En Almacén' | 'En Laboratorio' | 'Regresada' | 'Entregada';

export interface StatusChange {
  status: SampleStatus;
  date: string;
  comment: string;
}

export interface Sample {
  id: string;
  marca: string;
  modelo: string;
  fechaRecepcion: string;
  responsable: string;
  razonSocial?: string;
  numeroSolicitud?: string;
  descripcion?: string;
  currentStatus: SampleStatus;
  statusHistory: StatusChange[];
  createdAt: string;
}

export interface ExportData {
  muestras: Sample[];
  resumen: {
    status: SampleStatus;
    cantidad: number;
  }[];
  historial: {
    id: string;
    marca: string;
    modelo: string;
    status: SampleStatus;
    fecha: string;
    comentario: string;
  }[];
}
