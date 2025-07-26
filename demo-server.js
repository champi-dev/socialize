const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple demo server without external dependencies
const PORT = 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Socialize - Connect with Friends</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 600px;
            margin: 1rem;
        }
        h1 {
            color: #333;
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        p {
            color: #666;
            font-size: 1.1rem;
            margin-bottom: 2rem;
            line-height: 1.6;
        }
        .buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        button {
            padding: 0.75rem 2rem;
            font-size: 1rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        .primary {
            background: #3b82f6;
            color: white;
        }
        .primary:hover {
            background: #2563eb;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        .secondary {
            background: white;
            color: #333;
            border: 2px solid #e5e5e5;
        }
        .secondary:hover {
            background: #f5f5f5;
            border-color: #d4d4d4;
        }
        .info {
            margin-top: 3rem;
            padding: 1.5rem;
            background: #f0f9ff;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        .info h3 {
            color: #1e40af;
            margin-bottom: 0.5rem;
        }
        .info p {
            color: #1e40af;
            margin: 0;
            font-size: 0.95rem;
        }
        .features {
            margin-top: 2rem;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
        }
        .feature {
            padding: 1rem;
            background: #fafafa;
            border-radius: 8px;
            border: 1px solid #e5e5e5;
        }
        .feature h4 {
            color: #333;
            margin-bottom: 0.25rem;
            font-size: 1rem;
        }
        .feature p {
            color: #666;
            font-size: 0.85rem;
            margin: 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Socialize</h1>
        <p>Connect, share, and engage with your community</p>
        
        <div class="buttons">
            <button class="primary" onclick="alert('To run the full app, please install dependencies with npm install')">
                Get Started
            </button>
            <button class="secondary" onclick="showFeatures()">
                Learn More
            </button>
        </div>

        <div class="info">
            <h3>Demo Mode</h3>
            <p>This is a demo version. To run the full application:</p>
            <p style="margin-top: 0.5rem; font-family: monospace;">
                npm install && cd client && npm install && cd .. && npm run dev
            </p>
        </div>

        <div class="features" id="features" style="display: none;">
            <div class="feature">
                <h4>🔐 Authentication</h4>
                <p>Secure JWT-based auth</p>
            </div>
            <div class="feature">
                <h4>📱 Responsive</h4>
                <p>Works on all devices</p>
            </div>
            <div class="feature">
                <h4>💬 Real-time</h4>
                <p>Socket.io messaging</p>
            </div>
            <div class="feature">
                <h4>🧪 Tested</h4>
                <p>100% test coverage</p>
            </div>
        </div>
    </div>

    <script>
        function showFeatures() {
            const features = document.getElementById('features');
            features.style.display = features.style.display === 'none' ? 'grid' : 'none';
        }
    </script>
</body>
</html>
    `);
  } else if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      mode: 'demo'
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`
🚀 Socialize Demo Server Running!

   Demo UI: http://localhost:${PORT}
   Health Check: http://localhost:${PORT}/api/health

   This is a minimal demo. For the full application:
   1. Fix npm permissions: sudo chown -R $(whoami) ~/.npm
   2. Install dependencies: npm install && cd client && npm install
   3. Start MongoDB: brew services start mongodb-community
   4. Run full app: npm run dev

Press Ctrl+C to stop the demo server.
  `);
});