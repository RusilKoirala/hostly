import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload as UploadIcon, 
  Github, 
  File, 
  FolderOpen,
  X,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = 'http://192.168.1.77:3001/api';

const Upload = ({ onUpload }) => {
  const [siteName, setSiteName] = useState('');
  const [uploadMethod, setUploadMethod] = useState('files'); // 'files' or 'github'
  const [githubUrl, setGithubUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setUploadedFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/html': ['.html', '.htm'],
      'text/css': ['.css'],
      'application/javascript': ['.js'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'],
      'font/*': ['.woff', '.woff2', '.ttf', '.eot'],
      'application/json': ['.json'],
      'text/plain': ['.txt', '.md'],
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const handleFileUpload = async () => {
    if (!siteName.trim()) {
      toast.error('Please enter a site name');
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('siteName', siteName.trim());
    
    uploadedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${API_BASE}/sites/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Site "${result.siteName}" uploaded successfully!`);
        setSiteName('');
        setUploadedFiles([]);
        onUpload();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleGitHubClone = async () => {
    if (!siteName.trim()) {
      toast.error('Please enter a site name');
      return;
    }

    if (!githubUrl.trim()) {
      toast.error('Please enter a GitHub repository URL');
      return;
    }

    setUploading(true);
    try {
      const response = await fetch(`${API_BASE}/sites/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoUrl: githubUrl.trim(),
          siteName: siteName.trim(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Repository "${result.siteName}" cloned successfully!`);
        setSiteName('');
        setGithubUrl('');
        onUpload();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Clone failed');
      }
    } catch (error) {
      toast.error('Clone failed. Please check your repository URL and try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(files => files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Upload Site</h1>
        <p className="text-text-secondary mt-2">Upload files or clone from GitHub</p>
      </div>

      {/* Upload Method Tabs */}
      <div className="flex space-x-1 bg-background-tertiary p-1 rounded-lg">
        <button
          onClick={() => setUploadMethod('files')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            uploadMethod === 'files'
              ? 'bg-background-secondary text-text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <File className="w-4 h-4 inline mr-2" />
          Upload Files
        </button>
        <button
          onClick={() => setUploadMethod('github')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            uploadMethod === 'github'
              ? 'bg-background-secondary text-text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Github className="w-4 h-4 inline mr-2" />
          Clone GitHub
        </button>
      </div>

      {/* Site Name Input */}
      <div className="card">
        <label className="block text-sm font-medium text-text-primary mb-2">
          Site Name
        </label>
        <input
          type="text"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          placeholder="my-awesome-site"
          className="input w-full"
          disabled={uploading}
        />
        <p className="text-xs text-text-muted mt-2">
          This will be the URL path: 192.168.1.77:3001/sites/[site-name]
        </p>
      </div>

      {/* Upload Method Content */}
      {uploadMethod === 'files' ? (
        <div className="space-y-4">
          {/* File Drop Zone */}
          <div
            {...getRootProps()}
            className={`card border-2 border-dashed transition-all duration-200 cursor-pointer ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-border-hover'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-center py-8">
              <UploadIcon className="w-12 h-12 text-text-muted mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-primary font-medium">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-text-primary font-medium mb-2">
                    Drag & drop files here, or click to select
                  </p>
                  <p className="text-text-muted text-sm">
                    Supports HTML, CSS, JS, images, and other web assets
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* File List */}
          {uploadedFiles.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Selected Files ({uploadedFiles.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <File className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{file.name}</p>
                        <p className="text-xs text-text-muted">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-text-muted hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleFileUpload}
            disabled={uploading || uploadedFiles.length === 0 || !siteName.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon className="w-4 h-4" />
                Upload Site
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* GitHub URL Input */}
          <div className="card">
            <label className="block text-sm font-medium text-text-primary mb-2">
              GitHub Repository URL
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="input w-full"
              disabled={uploading}
            />
            <p className="text-xs text-text-muted mt-2">
              Make sure the repository is public or you have access to it
            </p>
          </div>

          {/* Clone Button */}
          <button
            onClick={handleGitHubClone}
            disabled={uploading || !siteName.trim() || !githubUrl.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cloning...
              </>
            ) : (
              <>
                <Github className="w-4 h-4" />
                Clone Repository
              </>
            )}
          </button>
        </div>
      )}

      {/* Tips */}
      <div className="card bg-blue-500/5 border-blue-500/20">
        <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-blue-500" />
          Tips for Best Results
        </h3>
        <ul className="space-y-2 text-sm text-text-secondary">
          <li>• Include an <code className="bg-background-tertiary px-1 rounded">index.html</code> file for automatic serving</li>
          <li>• Use relative paths for CSS, JS, and image references</li>
          <li>• Keep file sizes reasonable for faster loading</li>
          <li>• For GitHub repos, ensure they contain static web files</li>
        </ul>
      </div>
    </div>
  );
};

export default Upload; 