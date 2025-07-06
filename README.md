# Hostly - Modern Web Hosting Platform

A sleek, modern web hosting platform similar to Vercel/Netlify with a beautiful dark-themed UI inspired by Cursor.com. Built with Node.js, Express, React, and Tailwind CSS.

![Hostly Dashboard](https://img.shields.io/badge/Status-Ready-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-19-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3-purple)

## ✨ Features

- **🎨 Modern Dark UI** - Beautiful interface inspired by Cursor.com with glass morphism effects
- **📁 File Upload** - Drag & drop file upload for static websites
- **🔗 GitHub Integration** - Clone repositories directly from GitHub
- **📊 Real-time Monitoring** - CPU, memory, and system statistics
- **🚀 Auto-serving** - Sites automatically served at `/sites/[site-name]`
- **📱 Responsive Design** - Works perfectly on desktop and mobile
- **⚡ Fast & Lightweight** - Built with Vite for optimal performance
- **🔔 Notifications** - Toast notifications for all actions
- **🗑️ Site Management** - Delete, view, and manage hosted sites

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git (for GitHub cloning feature)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd hostly
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start both the backend server (port 3001) and frontend development server (port 5173).

### Manual Setup

If you prefer to run servers separately:

**Backend (Server)**
```bash
cd server
npm install
npm run dev
```

**Frontend (Client)**
```bash
cd client
npm install
npm run dev
```

## 📁 Project Structure

```
hostly/
├── server/                 # Backend API (Express.js)
│   ├── index.js           # Main server file
│   └── package.json       # Server dependencies
├── client/                # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx        # Main app component
│   │   └── index.css      # Global styles
│   └── package.json       # Client dependencies
├── sites/                 # Hosted websites storage
└── package.json           # Root package.json
```

## 🎯 Usage

### Uploading a Website

1. **Navigate to the Upload tab**
2. **Choose upload method:**
   - **File Upload**: Drag & drop your website files
   - **GitHub Clone**: Enter a GitHub repository URL

3. **Enter a site name** (this becomes your URL path)
4. **Upload/Clone** your site
5. **Access your site** at `http://localhost:3001/sites/[site-name]`

### Managing Sites

- **Dashboard**: Overview of all sites and system stats
- **Sites**: Detailed view of all hosted sites with management options
- **System**: Real-time CPU and memory monitoring

### Supported File Types

- HTML files (`.html`, `.htm`)
- CSS files (`.css`)
- JavaScript files (`.js`)
- Images (`.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.ico`)
- Fonts (`.woff`, `.woff2`, `.ttf`, `.eot`)
- Other web assets (`.json`, `.txt`, `.md`, `.pdf`)

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
PORT=3001
NODE_ENV=development
```

### Customizing the UI

The UI uses Tailwind CSS with custom colors defined in `client/tailwind.config.js`. You can modify:

- Color scheme in the `colors` section
- Fonts in the `fontFamily` section
- Animations in the `animation` section

## 🛠️ Development

### Available Scripts

**Root Directory:**
- `npm run dev` - Start both frontend and backend
- `npm run install:all` - Install all dependencies
- `npm run build` - Build the frontend for production

**Server Directory:**
- `npm run dev` - Start server with nodemon
- `npm start` - Start server in production mode

**Client Directory:**
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### API Endpoints

- `GET /api/sites` - Get all hosted sites
- `POST /api/sites/upload` - Upload site files
- `POST /api/sites/clone` - Clone GitHub repository
- `DELETE /api/sites/:siteName` - Delete a site
- `GET /api/system/stats` - Get system statistics
- `GET /sites/:siteName` - Serve a hosted site

## 🎨 UI Components

The application includes several reusable components:

- **Sidebar** - Navigation with modern styling
- **Dashboard** - Overview cards and statistics
- **Sites** - Site management with grid layout
- **Upload** - File upload with drag & drop
- **System** - Real-time system monitoring

## 🔒 Security Features

- File type validation for uploads
- CORS configuration
- Helmet.js for security headers
- Input sanitization
- Error handling middleware

## 🚀 Deployment

### Production Build

1. **Build the frontend:**
   ```bash
   cd client
   npm run build
   ```

2. **Start the production server:**
   ```bash
   cd server
   npm start
   ```

### Docker Deployment (Optional)

Create a `Dockerfile` in the root directory:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm run install:all

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Inspired by Vercel and Netlify
- UI design inspired by Cursor.com
- Built with modern web technologies
- Icons from Lucide React

---

**Happy Hosting! 🚀** 