// Entry point that imports jspdf and html2pdf and exposes them to window for browser use
import jspdf from 'jspdf';
import html2pdf from 'html2pdf.js';

// Expose to global window for usage in app
if (typeof window !== 'undefined') {
  window.jsPDF = jspdf.jsPDF || jspdf;
  window.html2pdf = html2pdf;
}

export default { jsPDF: window.jsPDF, html2pdf: window.html2pdf };
