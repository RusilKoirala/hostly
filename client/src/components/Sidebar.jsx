import { Zap } from 'lucide-react';

const Sidebar = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="w-64 bg-background-secondary border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-background" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient">Hostly</h1>
            <p className="text-xs text-text-muted">Web Hosting Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`sidebar-item w-full ${
                activeTab === tab.id ? 'active' : ''
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-text-muted text-center">
          <p>Running on 192.168.1.77:3001</p>
          <p className="mt-1">Sites served at /sites/*</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 