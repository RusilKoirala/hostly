import { 
  Globe, 
  Code, 
  Zap, 
  Layers,
  React,
  Database,
  FileText
} from 'lucide-react';

const FrameworkIcon = ({ type, framework, className = "w-4 h-4" }) => {
  const getIcon = () => {
    switch (type) {
      case 'react-vite':
        return <React className={className} />;
      case 'vite':
        return <Zap className={className} />;
      case 'next':
        return <Layers className={className} />;
      case 'express':
        return <Database className={className} />;
      case 'react':
        return <React className={className} />;
      case 'node':
        return <Code className={className} />;
      case 'static':
      default:
        return <Globe className={className} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'react-vite':
      case 'react':
        return 'text-blue-500';
      case 'vite':
        return 'text-purple-500';
      case 'next':
        return 'text-black dark:text-white';
      case 'express':
        return 'text-green-500';
      case 'node':
        return 'text-green-600';
      case 'static':
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`${getColor()} flex items-center gap-1`}>
      {getIcon()}
      <span className="text-xs font-medium">{framework}</span>
    </div>
  );
};

export default FrameworkIcon; 