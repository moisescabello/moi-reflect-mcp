import { test } from 'node:test';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test('server --test exits cleanly', async () => {
  const serverPath = join(__dirname, '..', 'server.js');

  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [serverPath, '--test'], {
      env: {
        ...process.env,
        REFLECT_TOKEN: process.env.REFLECT_TOKEN || 'dummy-token',
        GRAPH_ID: process.env.GRAPH_ID || 'dummy-graph'
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stderr = '';
    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });

    child.on('error', reject);

    child.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`server --test exited with code ${code}. stderr: ${stderr}`));
      }
    });
  });

});
