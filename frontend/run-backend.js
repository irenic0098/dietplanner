import { spawn } from 'child_process';
import os from 'os';
import path from 'path';

const isWindows = os.platform() === 'win32';
const pythonPath = isWindows 
  ? path.join('..', '.venv', 'Scripts', 'python.exe')
  : path.join('..', '.venv', 'bin', 'python');

const managePyPath = path.join('..', 'backend', 'manage.py');

console.log(`[Backend Setup] Starting Django backend on port 8000 using ${pythonPath}...`);

const backend = spawn(pythonPath, [managePyPath, 'runserver'], {
  stdio: 'inherit',
  shell: true
});

backend.on('error', (err) => {
  console.error('[Backend Setup] Failed to start Django backend server:', err);
});

process.on('SIGINT', () => {
  backend.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  backend.kill();
  process.exit();
});
