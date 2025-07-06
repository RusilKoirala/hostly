import { 
  Globe, 
  HardDrive, 
  Activity, 
  Clock,
  ExternalLink,
  Loader2,
  Play,
  Code
} from 'lucide-react';

const Dashboard = ({ sites, systemStats, loading }) => {
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const totalSize = sites.reduce((acc, site) => acc + site.size, 0);
  const runningSites = sites.filter(site => site.status === 'running');
  const staticSites = sites.filter(site => !site.hasPackageJson);
  const dynamicSites = sites.filter(site => site.hasPackageJson);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary mt-2">Overview of your hosting platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Sites</p>
              <p className="text-2xl font-bold text-text-primary">{sites.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Running Projects</p>
              <p className="text-2xl font-bold text-text-primary">{runningSites.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Dynamic Projects</p>
              <p className="text-2xl font-bold text-text-primary">{dynamicSites.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Uptime</p>
              <p className="text-2xl font-bold text-text-primary">
                {systemStats ? formatUptime(systemStats.uptime) : '--'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Running Projects */}
      {runningSites.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-green-500" />
            Running Projects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {runningSites.map((site) => (
              <div key={site.name} className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-text-primary">{site.name}</h4>
                  <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">
                    {site.projectType}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Port:</span>
                    <span className="text-text-primary font-mono">{site.port}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Type:</span>
                    <span className="text-text-primary capitalize">{site.projectType}</span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <a
                    href={`http://localhost:${site.port}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs flex-1 flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open App
                  </a>
                  <a
                    href={`http://192.168.1.77:3001/sites/${site.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs flex items-center justify-center gap-1"
                  >
                    <Globe className="w-3 h-3" />
                    Files
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Stats */}
      {systemStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-text-primary mb-4">CPU Usage</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-secondary">Load Average</span>
                  <span className="text-text-primary font-mono">
                    {systemStats.cpu.loadAverage[0].toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-background-tertiary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((systemStats.cpu.loadAverage[0] / systemStats.cpu.cores) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              <p className="text-xs text-text-muted">
                {systemStats.cpu.cores} CPU cores available
              </p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Memory Usage</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-secondary">Used Memory</span>
                  <span className="text-text-primary font-mono">
                    {formatBytes(systemStats.memory.used)} / {formatBytes(systemStats.memory.total)}
                  </span>
                </div>
                <div className="w-full bg-background-tertiary rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${systemStats.memory.percentage}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-xs text-text-muted">
                {systemStats.memory.percentage}% of memory used
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Sites */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Sites</h3>
        {sites.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">No sites uploaded yet</p>
            <p className="text-text-muted text-sm mt-1">Upload your first site to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sites.slice(0, 5).map((site) => (
              <div key={site.name} className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    {site.hasPackageJson ? (
                      <Code className="w-4 h-4 text-primary" />
                    ) : (
                      <Globe className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{site.name}</p>
                    <p className="text-xs text-text-muted">
                      {formatBytes(site.size)} • {new Date(site.updatedAt).toLocaleDateString()} • {site.projectType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {site.status === 'running' && site.port && (
                    <a
                      href={`http://localhost:${site.port}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      App
                    </a>
                  )}
                  <a
                    href={`http://192.168.1.77:3001/sites/${site.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 