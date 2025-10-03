// Componente: Formulario de Proveedor
// Modularizado: CRUD de proveedores, integración con gastos
import proveedoresService from '../services/proveedores.js';

export default function FormProveedor({
  formId = 1,
  data = {},
  onSubmit = () => {},
  onChange = () => {},
  onDelete = () => {},
  errores = {},
}) {
  // Renderizado modular (pseudo-código, adaptar a framework si aplica)
  // Aquí se muestra la estructura y lógica, no HTML real
  return {
    render() {
      /*
      - Nombre proveedor (input)
      - Celular (input)
      - Descripción (input)
      - Botón Guardar (onSubmit)
      - Botón Eliminar (onDelete)
      - Listado de proveedores existentes
      */
    },
    // Métodos de interacción y validación pueden ir aquí o en servicios
  };
}
