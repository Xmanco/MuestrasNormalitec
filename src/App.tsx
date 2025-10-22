import { useState } from 'react';
import { RegisterForm } from './components/RegisterForm';
import { SampleList } from './components/SampleList';
import { QRScanner } from './components/QRScanner';
import { ExcelModal } from './components/ExcelModal';
import { ClipboardList, List, QrCode, FileSpreadsheet } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'register' | 'list' | 'scan'>('register');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showExcelModal, setShowExcelModal] = useState(false);

  const handleSampleChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Sistema de Gestión de Muestras
            </h1>
            <button
              onClick={() => setShowExcelModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FileSpreadsheet size={20} />
              Excel
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('register')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === 'register'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ClipboardList size={20} />
              Registrar
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === 'list'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={20} />
              Lista
            </button>
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === 'scan'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <QrCode size={20} />
              Escanear
            </button>
          </div>
        </div>

        <div className="py-6">
          {activeTab === 'register' && (
            <RegisterForm onSampleRegistered={handleSampleChange} />
          )}
          {activeTab === 'list' && (
            <SampleList refresh={refreshKey} />
          )}
          {activeTab === 'scan' && (
            <QRScanner />
          )}
        </div>
      </div>

      {showExcelModal && (
        <ExcelModal
          onClose={() => setShowExcelModal(false)}
          onImportComplete={handleSampleChange}
        />
      )}

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-600 text-sm">
            Sistema de Gestión de Muestras - Almacenamiento Local
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
