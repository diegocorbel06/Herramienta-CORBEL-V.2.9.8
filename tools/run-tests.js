// Run a few basic checks by loading small modules into a sandboxed VM
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadIntoApp(filePath, app) {
  const code = fs.readFileSync(filePath, 'utf8');
  const sandbox = { app, console, setTimeout };
  vm.createContext(sandbox);
  try {
    vm.runInContext(code, sandbox, { filename: filePath });
    return true;
  } catch (e) {
    console.error('Error loading', filePath, e);
    return false;
  }
}

try {
  const app = {};
  // load registro utils
  const utilsPath = path.resolve(__dirname, '../js/modules/Registro/utils.js');
  const ok = loadIntoApp(utilsPath, app);
  if (!ok) process.exit(3);

  // load test helper
  const helperPath = path.resolve(__dirname, '../js/utils/test_helpers.js');
  loadIntoApp(helperPath, app);

  const result = app.runBasicChecks();
  console.log('Basic checks:', result ? 'PASS' : 'FAIL');
  process.exit(result ? 0 : 1);
} catch (e) {
  console.error('Error running node tests:', e);
  process.exit(4);
}
