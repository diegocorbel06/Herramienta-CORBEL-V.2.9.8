// Test rápido de calcularArqueoPorRango en src/services/arqueoCaja.js
// Ejecutar: node --input-type=module tools/test-calcular-arqueo.js

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svcPath = path.join(__dirname, '..', 'src', 'services', 'arqueoCaja.js');

(async function(){
  try {
    const { default: arqueoSvc } = await import('file://' + svcPath);
    const testData = [
      { fecha: '2025-10-01', tipo: 'VENTA', total: 100, metodosPago: [{metodo: 'Efectivo', monto: 60}, {metodo: 'Tarjeta', monto:40}] },
      { fecha: '2025-10-01', tipo: 'GASTO', total: 20, metodosPago: [{metodo: 'Efectivo', monto: 20}] },
      { fecha: '2025-10-02', tipo: 'VENTA', total: 50, metodosPago: [{metodo: 'Efectivo', monto: 50}] }
    ];

    const res1 = arqueoSvc.calcularArqueoPorRango(testData, '2025-10-01', '2025-10-01');
    console.log('Test 1 (2025-10-01):', res1);
    if (res1.ingresos !== 100) throw new Error('Ingresos incorrectos');
    if (res1.egresos !== 20) throw new Error('Egresos incorrectos');
    if (!res1.totalesPorMetodo['Efectivo'] || Math.abs(res1.totalesPorMetodo['Efectivo'] - 40) > 0.001) throw new Error('Totales por metodo incorrecto (efectivo)');

    const res2 = arqueoSvc.calcularArqueoPorRango(testData, '2025-10-01', '2025-10-02');
    console.log('Test 2 (2025-10-01 a 02):', res2);
    if (res2.ingresos !== 150) throw new Error('Ingresos rango incorrectos');

    const res3 = arqueoSvc.calcularArqueoPorRango([], '2025-10-01', '2025-10-01');
    console.log('Test 3 (vacío):', res3);
    if (res3.ingresos !== 0 || res3.egresos !== 0) throw new Error('Debería ser 0 para vacío');

    console.log('Todos los tests pasaron.');
  } catch (e) {
    console.error('Error en tests:', e);
    process.exit(1);
  }
})();
