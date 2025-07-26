const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Socialize Demo...\n');

// Check if we can connect to MongoDB
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/socialize-demo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connection successful');
  mongoose.connection.close();
  startServers();
}).catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
  console.log('\nPlease ensure MongoDB is running:');
  console.log('  brew services start mongodb-community');
  console.log('  or');
  console.log('  mongod --dbpath /usr/local/var/mongodb\n');
  process.exit(1);
});

function startServers() {
  // Start backend
  console.log('Starting backend server...');
  const backend = spawn('node', ['server/index.js'], {
    env: { ...process.env },
    stdio: 'inherit'
  });

  // Start frontend
  console.log('Starting frontend server...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'client'),
    env: { ...process.env },
    stdio: 'inherit',
    shell: true
  });

  console.log('\n🎉 Socialize is starting up!');
  console.log('   Frontend: http://localhost:3000');
  console.log('   Backend:  http://localhost:5000');
  console.log('   API Health: http://localhost:5000/api/health\n');
  console.log('Press Ctrl+C to stop all services...\n');

  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping services...');
    backend.kill();
    frontend.kill();
    process.exit();
  });
}