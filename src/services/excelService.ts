import * as XLSX from 'xlsx';
import { Sample, SampleStatus } from '../types/sample';
import { storageService } from './storage';

export interface ImportResult {
  success: number;
  updated: number;
  errors: string[];
}

export const excelService = {
  exportToExcel(samples: Sample[]): void {
    const wb = XLSX.utils.book_new();

    const muestrasData = samples.map(s => ({
      ID: s.id,
      Marca: s.marca,
      Modelo: s.modelo,
      'Fecha Recepción': new Date(s.fechaRecepcion).toLocaleDateString(),
      Responsable: s.responsable,
      'Razón Social': s.razonSocial || '',
      'N° Solicitud': s.numeroSolicitud || '',
      Descripción: s.descripcion || '',
      'Estatus Actual': s.currentStatus,
      'Historial de Estatus': JSON.stringify(s.statusHistory),
      'Días en Sistema': this.getDaysInSystem(s),
      'Fecha Registro': new Date(s.createdAt).toLocaleString()
    }));

    const resumenData = this.getStatusSummary(samples);

    const historialData = samples.flatMap(s =>
      s.statusHistory.map(h => ({
        ID: s.id,
        Marca: s.marca,
        Modelo: s.modelo,
        Estatus: h.status,
        Fecha: new Date(h.date).toLocaleString(),
        Comentario: h.comment
      }))
    );

    const ws1 = XLSX.utils.json_to_sheet(muestrasData);
    const ws2 = XLSX.utils.json_to_sheet(resumenData);
    const ws3 = XLSX.utils.json_to_sheet(historialData);

    XLSX.utils.book_append_sheet(wb, ws1, 'Muestras');
    XLSX.utils.book_append_sheet(wb, ws2, 'Resumen');
    XLSX.utils.book_append_sheet(wb, ws3, 'Historial');

    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Muestras_${timestamp}.xlsx`);
  },

  async importFromExcel(file: File): Promise<ImportResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });

          const ws = wb.Sheets[wb.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(ws);

          const result: ImportResult = {
            success: 0,
            updated: 0,
            errors: []
          };

          jsonData.forEach((row: any, index: number) => {
            const rowNum = index + 2;

            if (!row.Marca) {
              result.errors.push(`Fila ${rowNum}: Marca es obligatoria`);
              return;
            }
            if (!row.Modelo) {
              result.errors.push(`Fila ${rowNum}: Modelo es obligatorio`);
              return;
            }
            if (!row['Fecha Recepción'] && !row.FechaRecepcion && !row.fechaRecepcion) {
              result.errors.push(`Fila ${rowNum}: Fecha de Recepción es obligatoria`);
              return;
            }
            if (!row.Responsable) {
              result.errors.push(`Fila ${rowNum}: Responsable es obligatorio`);
              return;
            }

            const fechaRecepcion = this.parseDate(
              row['Fecha Recepción'] || row.FechaRecepcion || row.fechaRecepcion
            );
            if (!fechaRecepcion) {
              result.errors.push(`Fila ${rowNum}: Fecha de Recepción inválida`);
              return;
            }

            const id = row.ID;
            const existingSample = id ? storageService.getSampleById(id) : null;

            let statusHistory: StatusChange[] = [];
            let currentStatus: SampleStatus = 'En Almacén';

            if (row['Historial de Estatus'] || row.HistorialDeEstatus) {
              try {
                const historialStr = row['Historial de Estatus'] || row.HistorialDeEstatus;
                const parsedHistory = JSON.parse(historialStr);
                if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
                  statusHistory = parsedHistory;
                  currentStatus = parsedHistory[parsedHistory.length - 1].status;
                }
              } catch (e) {
                // Si falla el parsing, usar valores por defecto
              }
            }

            if (row['Estatus Actual'] || row.EstatusActual) {
              const estatusValue = row['Estatus Actual'] || row.EstatusActual;
              if (['En Almacén', 'En Laboratorio', 'Regresada', 'Entregada'].includes(estatusValue)) {
                currentStatus = estatusValue as SampleStatus;
              }
            }

            if (existingSample) {
              const updatedSample: Sample = {
                ...existingSample,
                marca: row.Marca,
                modelo: row.Modelo,
                fechaRecepcion,
                responsable: row.Responsable,
                razonSocial: row['Razón Social'] || row.RazonSocial || undefined,
                numeroSolicitud: row['N° Solicitud'] || row.NumeroSolicitud || undefined,
                descripcion: row.Descripción || row.Descripcion || undefined,
                currentStatus: statusHistory.length > 0 ? currentStatus : existingSample.currentStatus,
                statusHistory: statusHistory.length > 0 ? statusHistory : existingSample.statusHistory
              };

              storageService.updateSample(id, updatedSample);
              result.updated++;
            } else {
              const newId = storageService.generateUniqueId();
              const now = new Date().toISOString();

              if (statusHistory.length === 0) {
                statusHistory = [
                  {
                    status: currentStatus,
                    date: now,
                    comment: 'Muestra importada desde Excel'
                  }
                ];
              }

              const newSample: Sample = {
                id: newId,
                marca: row.Marca,
                modelo: row.Modelo,
                fechaRecepcion,
                responsable: row.Responsable,
                razonSocial: row['Razón Social'] || row.RazonSocial || undefined,
                numeroSolicitud: row['N° Solicitud'] || row.NumeroSolicitud || undefined,
                descripcion: row.Descripción || row.Descripcion || undefined,
                currentStatus,
                statusHistory,
                createdAt: now
              };

              storageService.addSample(newSample);
              result.success++;
            }
          });

          resolve(result);
        } catch (error) {
          resolve({
            success: 0,
            updated: 0,
            errors: ['Error al procesar el archivo Excel']
          });
        }
      };

      reader.readAsArrayBuffer(file);
    });
  },

  getDaysInSystem(sample: Sample): number {
    const created = new Date(sample.createdAt);
    const now = new Date();
    const diff = now.getTime() - created.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  },

  getStatusSummary(samples: Sample[]): any[] {
    const statusCounts: Record<SampleStatus, number> = {
      'En Almacén': 0,
      'En Laboratorio': 0,
      'Regresada': 0,
      'Entregada': 0
    };

    samples.forEach(s => {
      statusCounts[s.currentStatus]++;
    });

    return Object.entries(statusCounts).map(([status, cantidad]) => ({
      Estatus: status,
      Cantidad: cantidad
    }));
  },

  parseDate(dateValue: any): string {
    if (!dateValue) return '';

    if (typeof dateValue === 'number') {
      const date = new Date((dateValue - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }

    if (typeof dateValue === 'string') {
      const parts = dateValue.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }

    return '';
  }
};
