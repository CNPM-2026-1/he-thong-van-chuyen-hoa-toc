const { spawn } = require('node:child_process');
const path = require('node:path');

const isWindows = process.platform === 'win32';
const prismExecutable = path.join(
  __dirname,
  'node_modules',
  '.bin',
  isWindows ? 'prism.cmd' : 'prism',
);

const host = '127.0.0.1';
const port = 4010;
const apiPath = '/api/v1/stations';
const mockProcess = spawn(
  prismExecutable,
  ['mock', path.join('..', 'openapi.yaml'), '--host', host, '--port', String(port)],
  {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: isWindows,
  },
);

let output = '';
mockProcess.stdout.on('data', (chunk) => { output += chunk.toString(); });
mockProcess.stderr.on('data', (chunk) => { output += chunk.toString(); });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function validate() {
  const deadline = Date.now() + 30000;
  let lastError = 'Prism did not start before the timeout';

  while (Date.now() < deadline) {
    if (mockProcess.exitCode !== null) {
      throw new Error(`Prism exited with code ${mockProcess.exitCode}:\n${output}`);
    }

    try {
      const response = await fetch(`http://${host}:${port}${apiPath}`);
      if (response.status >= 200 && response.status < 500) {
        console.log(`OpenAPI parsed and Prism mock responded: GET ${apiPath} -> HTTP ${response.status}`);
        return;
      }
      lastError = `Unexpected HTTP status ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await sleep(500);
  }

  throw new Error(`${lastError}\nPrism output:\n${output}`);
}

validate()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    if (mockProcess.exitCode === null) mockProcess.kill('SIGTERM');
  });
