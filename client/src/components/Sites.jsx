import { useState } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Trash2, 
  RefreshCw,
  Play,
  Square,
  Calendar,
  HardDrive,
  AlertCircle,
  Terminal,
  Code,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import LogsModal from './LogsModal';

const API_BASE = 'http://192.168.1.77:3001/api';

const Sites = ({ sites, onDelete, onRefresh }) => {
  const [deletingSite, setDeletingSite] = useState(null);
  const [startingSite, setStartingSite] = useState(null);
  const [stoppingSite, setStoppingSite] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [showLogs, setShowLogs] = useState(false);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (siteName) => {
    if (!confirm(`Are you sure you want to delete "${siteName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingSite(siteName);
    try {
      await onDelete(siteName);
      toast.success(`Site "${siteName}" deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete site');
    } finally {
      setDeletingSite(null);
    }
  };

  const handleStart = async (siteName) => {
    setStartingSite(siteName);
    try {
      const response = await fetch(`${API_BASE}/sites/${siteName}/start`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(`Project "${siteName}" started on port ${result.port}`);
        onRefresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to start project');
      }
    } catch (error) {
      toast.error('Failed to start project');
    } finally {
      setStartingSite(null);
    }
  };

  const handleStop = async (siteName) => {
    setStoppingSite(siteName);
    try {
      const response = await fetch(`${API_BASE}/sites/${siteName}/stop`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast.success(`Project "${siteName}" stopped`);
        onRefresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to stop project');
      }
    } catch (error) {
      toast.error('Failed to stop project');
    } finally {
      setStoppingSite(null);
    }
  };

  const handleViewLogs = (site) => {
    setSelectedSite(site);
    setShowLogs(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'text-green-500 bg-green-500/10';
      case 'stopped':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-yellow-500 bg-yellow-500/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Play className="w-3 h-3" />;
      case 'stopped':
        return <Square className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getProjectTypeIcon = (projectType) => {
    switch (projectType) {
      case 'vite':
        return <Code className="w-4 h-4 text-orange-500" />;
      case 'next':
        return <Code className="w-4 h-4 text-black dark:text-white" />;
      case 'express':
      case 'node':
        return <Package className="w-4 h-4 text-green-500" />;
      default:
        return <Globe className="w-4 h-4 text-blue-500" />;
    }
  };

  const getProjectTypeLabel = (projectType) => {
    switch (projectType) {
      case 'vite':
        return 'Vite';
      case 'next':
        return 'Next.js';
      case 'express':
        return 'Express';
      case 'node':
        return 'Node.js';
      case 'static':
        return 'Static';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Sites</h1>
          <p className="text-text-secondary mt-2">Manage your hosted websites and projects</p>
        </div>
        <button
          onClick={onRefresh}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Sites Grid */}
      {sites.length === 0 ? (
        <div className="card text-center py-12">
          <Globe className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">No sites yet</h3>
          <p className="text-text-secondary mb-4">
            Upload your first website or clone a repository to get started
          </p>
          <a href="#upload" className="btn-primary">
            Upload Site
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <div key={site.name} className="card group">
              {/* Site Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getProjectTypeIcon(site.projectType)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{site.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(site.status)}`}>
                        {getStatusIcon(site.status)}
                        {site.status}
                      </span>
                      <span className="text-xs text-text-muted">
                        {getProjectTypeLabel(site.projectType)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Site Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Size:</span>
                  <span className="text-text-primary font-mono">{formatBytes(site.size)}</span>
                </div>
                {site.hasPackageJson && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Type:</span>
                    <span className="text-text-primary">{getProjectTypeLabel(site.projectType)}</span>
                  </div>
                )}
                {site.port && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Port:</span>
                    <span className="text-text-primary font-mono">{site.port}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Updated:</span>
                  <span className="text-text-primary">{formatDate(site.updatedAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-border">
                {site.hasPackageJson ? (
                  <>
                    {site.status === 'running' ? (
                      <button
                        onClick={() => handleStop(site.name)}
                        disabled={stoppingSite === site.name}
                        className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
                      >
                        {stoppingSite === site.name ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                        Stop
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStart(site.name)}
                        disabled={startingSite === site.name}
                        className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
                      >
                        {startingSite === site.name ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        Start
                      </button>
                    )}
                    <button
                      onClick={() => handleViewLogs(site)}
                      className="btn-secondary p-2 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/20 transition-all duration-200"
                      title="View logs"
                    >
                      <Terminal className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <a
                    href={`http://192.168.1.77:3001/sites/${site.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Site
                  </a>
                )}
                <button
                  onClick={() => handleDelete(site.name)}
                  disabled={deletingSite === site.name}
                  className="btn-secondary p-2 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all duration-200"
                  title="Delete site"
                >
                  {deletingSite === site.name ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Running Project Info */}
              {site.status === 'running' && site.port && (
                <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-500">Running on port {site.port}</span>
                    <a
                      href={`http://localhost:${site.port}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-500 hover:text-green-400 transition-colors"
                    >
                      Open →
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {sites.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Site Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Sites</p>
                <p className="text-lg font-semibold text-text-primary">{sites.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Running</p>
                <p className="text-lg font-semibold text-text-primary">
                  {sites.filter(s => s.status === 'running').length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <HardDrive className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Storage</p>
                <p className="text-lg font-semibold text-text-primary">
                  {formatBytes(sites.reduce((acc, site) => acc + site.size, 0))}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Latest Update</p>
                <p className="text-lg font-semibold text-text-primary">
                  {sites.length > 0 ? formatDate(Math.max(...sites.map(s => new Date(s.updatedAt)))) : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogs && selectedSite && (
        <LogsModal
          site={selectedSite}
          onClose={() => {
            setShowLogs(false);
            setSelectedSite(null);
          }}
        />
      )}
    </div>
  );
};

export default Sites; 