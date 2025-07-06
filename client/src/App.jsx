import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Sites from './components/Sites';
import Upload from './components/Upload';
import System from './components/System';
import { 
  LayoutDashboard, 
  Globe, 
  Upload as UploadIcon, 
  Activity,
  Settings
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sites, setSites] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sites', label: 'Sites', icon: Globe },
    { id: 'upload', label: 'Upload', icon: UploadIcon },
    { id: 'system', label: 'System', icon: Activity },
  ];

  useEffect(() => {
    fetchSites();
    fetchSystemStats();
    const interval = setInterval(fetchSystemStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchSites = async () => {
    try {
      const response = await fetch(`${API_BASE}/sites`);
      const data = await response.json();
      setSites(data);
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/system/stats`);
      const data = await response.json();
      setSystemStats(data);
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const handleSiteDelete = async (siteName) => {
    try {
      const response = await fetch(`${API_BASE}/sites/${siteName}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSites(sites.filter(site => site.name !== siteName));
      }
    } catch (error) {
      console.error('Error deleting site:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard sites={sites} systemStats={systemStats} loading={loading} />;
      case 'sites':
        return <Sites sites={sites} onDelete={handleSiteDelete} onRefresh={fetchSites} />;
      case 'upload':
        return <Upload onUpload={fetchSites} />;
      case 'system':
        return <System stats={systemStats} />;
      default:
        return <Dashboard sites={sites} systemStats={systemStats} loading={loading} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a1a',
            color: '#ffffff',
            border: '1px solid #333333',
          },
        }}
      />
      
      <Sidebar 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
