import { 
  Cpu, 
  HardDrive, 
  Clock, 
  Monitor, 
  Server,
  Activity,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const System = ({ stats }) => {
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
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getLoadColor = (load, cores) => {
    const percentage = (load / cores) * 100;
    if (percentage < 50) return 'text-green-500';
    if (percentage < 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMemoryColor = (percentage) => {
    if (percentage < 50) return 'text-green-500';
    if (percentage < 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">System</h1>
          <p className="text-text-secondary mt-2">System monitoring and statistics</p>
        </div>
        <div className="card text-center py-12">
          <Activity className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary">Loading system statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">System</h1>
        <p className="text-text-secondary mt-2">Real-time system monitoring and statistics</p>
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Platform</p>
              <p className="text-lg font-semibold text-text-primary capitalize">{stats.platform}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Server className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Hostname</p>
              <p className="text-lg font-semibold text-text-primary">{stats.hostname}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Monitor className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">CPU Cores</p>
              <p className="text-lg font-semibold text-text-primary">{stats.cpu.cores}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Cpu className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Uptime</p>
              <p className="text-lg font-semibold text-text-primary">{formatUptime(stats.uptime)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Running Projects</p>
              <p className="text-lg font-semibold text-text-primary">{stats.runningProjects || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* CPU Usage */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" />
          CPU Usage
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">1 minute</span>
                <span className={`font-mono ${getLoadColor(stats.cpu.loadAverage[0], stats.cpu.cores)}`}>
                  {stats.cpu.loadAverage[0].toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-background-tertiary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((stats.cpu.loadAverage[0] / stats.cpu.cores) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">5 minutes</span>
                <span className={`font-mono ${getLoadColor(stats.cpu.loadAverage[1], stats.cpu.cores)}`}>
                  {stats.cpu.loadAverage[1].toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-background-tertiary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((stats.cpu.loadAverage[1] / stats.cpu.cores) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">15 minutes</span>
                <span className={`font-mono ${getLoadColor(stats.cpu.loadAverage[2], stats.cpu.cores)}`}>
                  {stats.cpu.loadAverage[2].toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-background-tertiary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((stats.cpu.loadAverage[2] / stats.cpu.cores) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
          <p className="text-xs text-text-muted">
            Load average represents the average system load over time. Values below the number of CPU cores indicate normal load.
          </p>
        </div>
      </div>

      {/* Memory Usage */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-blue-500" />
          Memory Usage
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-secondary">Used Memory</span>
              <span className={`font-mono ${getMemoryColor(stats.memory.percentage)}`}>
                {formatBytes(stats.memory.used)} / {formatBytes(stats.memory.total)}
              </span>
            </div>
            <div className="w-full bg-background-tertiary rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${stats.memory.percentage}%` }}
              ></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Total:</span>
              <span className="text-text-primary font-mono">{formatBytes(stats.memory.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Used:</span>
              <span className="text-text-primary font-mono">{formatBytes(stats.memory.used)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Free:</span>
              <span className="text-text-primary font-mono">{formatBytes(stats.memory.free)}</span>
            </div>
          </div>
          <p className="text-xs text-text-muted">
            {stats.memory.percentage}% of memory is currently in use.
          </p>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Performance Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">CPU Status</span>
              <span className={`text-sm font-medium ${
                (stats.cpu.loadAverage[0] / stats.cpu.cores) < 0.7 ? 'text-green-500' : 'text-yellow-500'
              }`}>
                {((stats.cpu.loadAverage[0] / stats.cpu.cores) * 100).toFixed(1)}% load
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Memory Status</span>
              <span className={`text-sm font-medium ${getMemoryColor(stats.memory.percentage)}`}>
                {stats.memory.percentage}% used
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">System Health</span>
              <span className="text-sm font-medium text-green-500">
                Good
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-purple-500" />
            System Information
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Operating System:</span>
              <span className="text-text-primary capitalize">{stats.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Hostname:</span>
              <span className="text-text-primary font-mono">{stats.hostname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">CPU Architecture:</span>
              <span className="text-text-primary">{stats.cpu.cores} cores</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Total Memory:</span>
              <span className="text-text-primary">{formatBytes(stats.memory.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default System; 