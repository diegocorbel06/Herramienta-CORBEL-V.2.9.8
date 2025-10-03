Resumen rápido de QA y comandos

1) Qué se cambió
- La columna "Mecánicos" en la tabla de historial ahora muestra nombres legibles en lugar de IDs.
- Se mejoró la función de resolución de nombres (`app.registroUtils.obtenerNombresMecanicos`) para aceptar ids, nombres u objetos.
- Se corrigió el forwarding de scroll para no interferir con dropdowns/option lists.

2) Comandos útiles
- Instalar dependencias (ya lo hice en este entorno):
```bash
npm ci
```

- Test de selección múltiple de mecánicos (jsdom):
```bash
node tools/test-multi-mecanicos-jsdom.js
```

- Test de orden en tabla (newest → oldest por createdAt):
```bash
node tools/test-register-order.js
```

3) Pasos para probar manualmente en navegador
- Abrir `index.html` en un servidor local (por ejemplo: `npx http-server .` o abrirlo directamente en el navegador).
- Ir a la pestaña "Registro".
- Crear 3 registros con distintas fechas/horas y verificar que la tabla muestra el más reciente en la parte superior.
- En el formulario, usar el campo de búsqueda de mecánicos, seleccionar varios mecánicos y guardar. Verificar en la tabla que la columna "Mecánicos" muestra los nombres separados por comas.

4) Notas
- Si detectas un caso donde aparece un código en vez de nombre, indícamelo con el ID exacto y lo investigaré.
