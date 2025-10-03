# Guía de Migración y Refactorización

## Estructura Modular Nueva

- `src/components/`: Componentes de UI (formularios, tablas, etc.)
- `src/services/`: Lógica de negocio y persistencia (ventas, gastos, arqueo, proveedores)
- `src/utils/`: Utilidades (validaciones, formateadores)
- `src/app.js`: Punto de entrada principal
- `src/styles.css`: Estilos principales

## Proceso de Migración

1. **Inicialización y Estado Global**
   - Migrado a `src/app.js`.
   - Persistencia ahora usa `src/services/storage.js`.

2. **Componentes**
   - Formularios y tablas se migrarán a `src/components/`.
   - Cada componente recibirá props y manejará su propio estado local.

3. **Servicios**
   - Lógica de ventas, gastos, arqueo y proveedores se moverá a `src/services/`.
   - Todos los servicios usan la capa de `storage.js` para persistencia.

4. **Utilidades**
   - Validaciones y formateadores se migrarán a `src/utils/`.

5. **Integración y Modularización**
   - `src/app.js` importará y orquestará componentes y servicios.
   - Cada pestaña cargará su componente correspondiente.

## Mejoras y Bugs Corregidos
- Modularización completa.
- Capa de persistencia unificada.
- Preparado para validaciones sólidas y formularios dinámicos.
- Estructura lista para futuras mejoras y migración a IndexedDB o backend.

## Siguientes pasos
- Migrar la lógica de cada formulario y tabla a sus componentes.
- Implementar servicios y utilidades según los TODOs en cada archivo.
- Probar y validar la funcionalidad completa.

---

**Esta guía se irá actualizando conforme avance la migración.**
