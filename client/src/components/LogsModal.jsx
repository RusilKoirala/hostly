import { useState, useEffect, useRef } from 'react';
import { X, Download, RefreshCw, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = 'http://192.168.1.77:3001/api';

const LogsModal = ({ site, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const logsEndRef = useRef(null);
  const intervalRef = useRef(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${API_BASE}/sites/${site.name}/logs?lines=200`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      } else {
        toast.error('Failed to fetch logs');
      }
    } catch (error) {
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    if (autoRefresh) {
      intervalRef.current = setInterval(fetchLogs, 2000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [site.name, autoRefresh]);

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const getLogTypeColor = (type) => {
    switch (type) {
      case 'stdout':
        return 'text-green-400';
      case 'stderr':
        return 'text-red-400';
      case 'system':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getLogTypeIcon = (type) => {
    switch (type) {
      case 'stdout':
        return '>';
      case 'stderr':
        return '!';
      case 'system':
        return '#';
      default:
        return '$';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const handleDownload = () => {
    const logContent = logs.map(log => 
      `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${site.name}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background-secondary border border-border rounded-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Logs - {site.name}
              </h2>
              <p className="text-sm text-text-secondary">
                {site.projectType} project logs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh 
                  ? 'bg-green-500/10 text-green-500' 
                  : 'bg-background-tertiary text-text-secondary hover:text-text-primary'
              }`}
              title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={fetchLogs}
              className="p-2 bg-background-tertiary text-text-secondary hover:text-text-primary rounded-lg transition-colors"
              title="Refresh logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-background-tertiary text-text-secondary hover:text-text-primary rounded-lg transition-colors"
              title="Download logs"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-background-tertiary text-text-secondary hover:text-red-500 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Logs Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2 text-text-secondary">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading logs...
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto bg-background p-4 font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-center text-text-muted py-8">
                  <Terminal className="w-8 h-8 mx-auto mb-2" />
                  <p>No logs available</p>
                  <p className="text-xs">Start the project to see logs</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2 group hover:bg-background-tertiary/50 rounded px-1 py-0.5">
                      <span className="text-text-muted text-xs min-w-[60px]">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      <span className={`font-bold ${getLogTypeColor(log.type)}`}>
                        {getLogTypeIcon(log.type)}
                      </span>
                      <span className={`flex-1 ${getLogTypeColor(log.type)}`}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-background-tertiary">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <div className="flex items-center gap-4">
              <span>Total logs: {logs.length}</span>
              <span>Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>stdout</span>
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>stderr</span>
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>system</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogsModal; 