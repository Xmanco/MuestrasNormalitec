import { Sample } from '../types/sample';

const STORAGE_KEY = 'samples_data';

export const storageService = {
  getAllSamples(): Sample[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  saveSamples(samples: Sample[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  addSample(sample: Sample): void {
    const samples = this.getAllSamples();
    samples.push(sample);
    this.saveSamples(samples);
  },

  updateSample(id: string, updatedSample: Sample): void {
    const samples = this.getAllSamples();
    const index = samples.findIndex(s => s.id === id);
    if (index !== -1) {
      samples[index] = updatedSample;
      this.saveSamples(samples);
    }
  },

  deleteSample(id: string): void {
    const samples = this.getAllSamples();
    const filtered = samples.filter(s => s.id !== id);
    this.saveSamples(filtered);
  },

  getSampleById(id: string): Sample | undefined {
    const samples = this.getAllSamples();
    return samples.find(s => s.id === id);
  },

  generateUniqueId(): string {
    const samples = this.getAllSamples();
    const maxId = samples.reduce((max, sample) => {
      const num = parseInt(sample.id.replace('M-', ''));
      return num > max ? num : max;
    }, 0);
    return `M-${String(maxId + 1).padStart(4, '0')}`;
  }
};
