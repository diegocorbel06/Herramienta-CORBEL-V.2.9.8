// Small bundler script: bundle jspdf and html2pdf into a single vendor file using esbuild
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: [require.resolve('./pdf-vendor-entry.js')],
  bundle: true,
  outfile: 'vendor/pdf-bundle.js',
  platform: 'browser',
  format: 'iife',
  globalName: 'PdfVendor',
  sourcemap: false,
  minify: true,
  absWorkingDir: __dirname
}).then(() => {
  console.log('pdf-bundle.js generated in vendor/');
}).catch(err => {
  console.error(err);
  process.exit(1);
});
