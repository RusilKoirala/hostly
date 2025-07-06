const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const { simpleGit } = require('simple-git');
const compression = require('compression');
const helmet = require('helmet');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(express.json());

// Serve the built frontend
app.use(express.static(path.join(__dirname, '../client/dist')));

// Process management
const runningProcesses = new Map();
const projectLogs = new Map();
const projectPorts = new Map();
let nextPort = 3002; // Start from 3002 since 3001 is the main server

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const siteName = req.body.siteName || 'unnamed-site';
    const sitePath = path.join(__dirname, '../sites', siteName);
    fs.ensureDirSync(sitePath);
    cb(null, sitePath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allow common web files
    const allowedTypes = /html|css|js|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|pdf|txt|md/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('File type not allowed'));
  }
});

// Ensure directories exist
const sitesDir = path.join(__dirname, '../sites');
const logsDir = path.join(__dirname, '../logs');
fs.ensureDirSync(sitesDir);
fs.ensureDirSync(logsDir);

// Helper function to detect project type
async function detectProjectType(projectPath) {
  try {
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!await fs.pathExists(packageJsonPath)) {
      return { type: 'static', hasPackageJson: false };
    }

    const packageJson = await fs.readJson(packageJsonPath);
    const scripts = packageJson.scripts || {};
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // Check for Vite
    if (dependencies.vite || scripts.dev?.includes('vite')) {
      return { type: 'vite', hasPackageJson: true, packageJson };
    }

    // Check for Next.js
    if (dependencies.next || scripts.dev?.includes('next')) {
      return { type: 'next', hasPackageJson: true, packageJson };
    }

    // Check for Express
    if (dependencies.express || scripts.start?.includes('node') || scripts.dev?.includes('nodemon')) {
      return { type: 'express', hasPackageJson: true, packageJson };
    }

    // Check for other Node.js projects
    if (scripts.start || scripts.dev) {
      return { type: 'node', hasPackageJson: true, packageJson };
    }

    return { type: 'static', hasPackageJson: true, packageJson };
  } catch (error) {
    console.error('Error detecting project type:', error);
    return { type: 'static', hasPackageJson: false };
  }
}

// Helper function to get folder size
async function getFolderSize(folderPath) {
  try {
    const files = await fs.readdir(folderPath);
    let size = 0;
    
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        size += stats.size;
      } else if (stats.isDirectory()) {
        size += await getFolderSize(filePath);
      }
    }
    
    return size;
  } catch (error) {
    return 0;
  }
}

// Helper function to initialize logs for a project
function initializeProjectLogs(projectName) {
  if (!projectLogs.has(projectName)) {
    projectLogs.set(projectName, {
      logs: [],
      maxLogs: 1000,
      logFile: path.join(logsDir, `${projectName}.log`)
    });
  }
}

// Helper function to add log entry
function addLogEntry(projectName, type, message) {
  initializeProjectLogs(projectName);
  const logEntry = {
    timestamp: new Date().toISOString(),
    type, // 'stdout', 'stderr', 'system'
    message: message.toString().trim()
  };

  const projectLog = projectLogs.get(projectName);
  projectLog.logs.push(logEntry);

  // Keep only the last maxLogs entries
  if (projectLog.logs.length > projectLog.maxLogs) {
    projectLog.logs = projectLog.logs.slice(-projectLog.maxLogs);
  }

  // Append to file
  const logLine = `[${logEntry.timestamp}] [${logEntry.type.toUpperCase()}] ${logEntry.message}\n`;
  fs.appendFile(projectLog.logFile, logLine).catch(console.error);
}

// Helper function to start a project
async function startProject(projectName) {
  try {
    const projectPath = path.join(sitesDir, projectName);
    
    if (!await fs.pathExists(projectPath)) {
      throw new Error('Project not found');
    }

    if (runningProcesses.has(projectName)) {
      throw new Error('Project is already running');
    }

    const projectType = await detectProjectType(projectPath);
    
    if (!projectType.hasPackageJson) {
      throw new Error('Not a Node.js project');
    }

    // Check if node_modules exists, if not run npm install
    const nodeModulesPath = path.join(projectPath, 'node_modules');
    if (!await fs.pathExists(nodeModulesPath)) {
      addLogEntry(projectName, 'system', 'Installing dependencies...');
      await new Promise((resolve, reject) => {
        const installProcess = spawn('npm', ['install'], { 
          cwd: projectPath,
          stdio: ['ignore', 'pipe', 'pipe']
        });

        installProcess.stdout.on('data', (data) => {
          addLogEntry(projectName, 'stdout', data);
        });

        installProcess.stderr.on('data', (data) => {
          addLogEntry(projectName, 'stderr', data);
        });

        installProcess.on('close', (code) => {
          if (code === 0) {
            addLogEntry(projectName, 'system', 'Dependencies installed successfully');
            resolve();
          } else {
            reject(new Error(`npm install failed with code ${code}`));
          }
        });
      });
    }

    // Assign a port
    const port = nextPort++;
    projectPorts.set(projectName, port);

    // Determine start command based on project type
    let command, args;
    switch (projectType.type) {
      case 'vite':
        command = 'npm';
        args = ['run', 'dev', '--', '--port', port.toString()];
        break;
      case 'next':
        command = 'npm';
        args = ['run', 'dev', '--', '-p', port.toString()];
        break;
      case 'express':
      case 'node':
        // Check if nodemon is available
        const packageJson = projectType.packageJson;
        const hasNodemon = packageJson.devDependencies?.nodemon || packageJson.dependencies?.nodemon;
        
        if (hasNodemon && packageJson.scripts.dev) {
          command = 'npm';
          args = ['run', 'dev'];
        } else if (packageJson.scripts.start) {
          command = 'npm';
          args = ['start'];
        } else {
          // Try to find the main file
          const mainFile = packageJson.main || 'index.js';
          command = 'node';
          args = [mainFile];
        }
        break;
      default:
        throw new Error('Unsupported project type');
    }

    // Start the process
    addLogEntry(projectName, 'system', `Starting ${projectType.type} project on port ${port}...`);
    
    const process = spawn(command, args, {
      cwd: projectPath,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PORT: port.toString() }
    });

    // Handle process output
    process.stdout.on('data', (data) => {
      addLogEntry(projectName, 'stdout', data);
    });

    process.stderr.on('data', (data) => {
      addLogEntry(projectName, 'stderr', data);
    });

    process.on('close', (code) => {
      addLogEntry(projectName, 'system', `Process exited with code ${code}`);
      runningProcesses.delete(projectName);
      projectPorts.delete(projectName);
    });

    process.on('error', (error) => {
      addLogEntry(projectName, 'system', `Process error: ${error.message}`);
      runningProcesses.delete(projectName);
      projectPorts.delete(projectName);
    });

    runningProcesses.set(projectName, process);
    addLogEntry(projectName, 'system', `Project started successfully`);

    return { success: true, port, type: projectType.type };
  } catch (error) {
    addLogEntry(projectName, 'system', `Failed to start project: ${error.message}`);
    throw error;
  }
}

// Helper function to stop a project
function stopProject(projectName) {
  try {
    const process = runningProcesses.get(projectName);
    if (!process) {
      throw new Error('Project is not running');
    }

    addLogEntry(projectName, 'system', 'Stopping project...');
    process.kill('SIGTERM');
    
    // Force kill after 5 seconds if still running
    setTimeout(() => {
      if (runningProcesses.has(projectName)) {
        process.kill('SIGKILL');
        addLogEntry(projectName, 'system', 'Project force killed');
      }
    }, 5000);

    runningProcesses.delete(projectName);
    projectPorts.delete(projectName);
    
    addLogEntry(projectName, 'system', 'Project stopped');
    return { success: true };
  } catch (error) {
    addLogEntry(projectName, 'system', `Failed to stop project: ${error.message}`);
    throw error;
  }
}

// Routes

// Get all sites with project type detection
app.get('/api/sites', async (req, res) => {
  try {
    const sites = [];
    const siteFolders = await fs.readdir(sitesDir);
    
    for (const folder of siteFolders) {
      const sitePath = path.join(sitesDir, folder);
      const stats = await fs.stat(sitePath);
      
      if (stats.isDirectory()) {
        const indexPath = path.join(sitePath, 'index.html');
        const hasIndex = await fs.pathExists(indexPath);
        
        // Detect project type
        const projectType = await detectProjectType(sitePath);
        const isRunning = runningProcesses.has(folder);
        const port = projectPorts.get(folder);
        
        sites.push({
          name: folder,
          path: sitePath,
          hasIndex,
          status: isRunning ? 'running' : 'stopped',
          projectType: projectType.type,
          hasPackageJson: projectType.hasPackageJson,
          port: port || null,
          createdAt: stats.birthtime,
          updatedAt: stats.mtime,
          size: await getFolderSize(sitePath)
        });
      }
    }
    
    res.json(sites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload site files
app.post('/api/sites/upload', upload.array('files'), async (req, res) => {
  try {
    const { siteName } = req.body;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const sitePath = path.join(sitesDir, siteName);
    await fs.ensureDir(sitePath);
    
    // Move uploaded files to site directory
    for (const file of files) {
      const destPath = path.join(sitePath, file.originalname);
      await fs.move(file.path, destPath, { overwrite: true });
    }
    
    // Detect project type after upload
    const projectType = await detectProjectType(sitePath);
    
    res.json({ 
      message: 'Site uploaded successfully',
      siteName,
      filesCount: files.length,
      projectType: projectType.type,
      hasPackageJson: projectType.hasPackageJson
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clone GitHub repository
app.post('/api/sites/clone', async (req, res) => {
  try {
    const { repoUrl, siteName } = req.body;
    
    if (!repoUrl || !siteName) {
      return res.status(400).json({ error: 'Repository URL and site name are required' });
    }
    
    const sitePath = path.join(sitesDir, siteName);
    
    // Check if directory already exists
    if (await fs.pathExists(sitePath)) {
      return res.status(400).json({ error: 'Site name already exists' });
    }
    
    // Clone the repository
    const git = simpleGit();
    await git.clone(repoUrl, sitePath);
    
    // Detect project type after clone
    const projectType = await detectProjectType(sitePath);
    
    res.json({ 
      message: 'Repository cloned successfully',
      siteName,
      repoUrl,
      projectType: projectType.type,
      hasPackageJson: projectType.hasPackageJson
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start a project
app.post('/api/sites/:projectName/start', async (req, res) => {
  try {
    const { projectName } = req.params;
    const result = await startProject(projectName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop a project
app.post('/api/sites/:projectName/stop', async (req, res) => {
  try {
    const { projectName } = req.params;
    const result = stopProject(projectName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project status
app.get('/api/sites/:projectName/status', async (req, res) => {
  try {
    const { projectName } = req.params;
    const isRunning = runningProcesses.has(projectName);
    const port = projectPorts.get(projectName);
    
    res.json({
      name: projectName,
      running: isRunning,
      port: port || null,
      pid: isRunning ? runningProcesses.get(projectName).pid : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project logs
app.get('/api/sites/:projectName/logs', async (req, res) => {
  try {
    const { projectName } = req.params;
    const { lines = 100 } = req.query;
    
    initializeProjectLogs(projectName);
    const projectLog = projectLogs.get(projectName);
    
    const logs = projectLog.logs.slice(-parseInt(lines));
    res.json({ logs, total: projectLog.logs.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete site
app.delete('/api/sites/:siteName', async (req, res) => {
  try {
    const { siteName } = req.params;
    const sitePath = path.join(sitesDir, siteName);
    
    if (!await fs.pathExists(sitePath)) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Stop the project if it's running
    if (runningProcesses.has(siteName)) {
      stopProject(siteName);
    }

    // Delete the site directory
    await fs.remove(sitePath);
    
    // Delete logs
    const logFile = path.join(logsDir, `${siteName}.log`);
    if (await fs.pathExists(logFile)) {
      await fs.remove(logFile);
    }
    
    // Clean up memory
    projectLogs.delete(siteName);
    projectPorts.delete(siteName);
    
    res.json({ message: 'Site deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system stats
app.get('/api/system/stats', async (req, res) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    const stats = {
      cpu: {
        loadAverage: os.loadavg(),
        cores: os.cpus().length
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        percentage: ((usedMem / totalMem) * 100).toFixed(2)
      },
      uptime: os.uptime(),
      platform: os.platform(),
      hostname: os.hostname(),
      runningProjects: runningProcesses.size
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static sites
app.use('/sites/:siteName', async (req, res, next) => {
  try {
    const { siteName } = req.params;
    const sitePath = path.join(sitesDir, siteName);
    
    if (!await fs.pathExists(sitePath)) {
      return res.status(404).send('Site not found');
    }
    
    // Serve static files from the site directory
    express.static(sitePath)(req, res, async (err) => {
      if (err) return next(err);
      // If no file matched, fallback to index.html if it exists
      const indexPath = path.join(sitePath, 'index.html');
      if (await fs.pathExists(indexPath)) {
        return res.sendFile(indexPath);
      }
      res.status(404).send('File not found');
    });
  } catch (error) {
    next(error);
  }
});

// Catch-all route to serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Hostly server running on http://localhost:${PORT}`);
  console.log(`📁 Sites directory: ${sitesDir}`);
  console.log(`📝 Logs directory: ${logsDir}`);
}); 