// Componente: Formulario de Gasto
// Modularizado: campos específicos, auto-cálculo de total, limpieza tras guardar/cancelar
import validaciones from '../utils/validaciones.js';
import gastosService from '../services/gastos.js';

export default function FormGasto({
  formId = 1,
  data = {},
  categorias = [],
  onSubmit = () => {},
  onChange = () => {},
  onCategoriaChange = () => {},
  errores = {},
}) {
  // Renderizado modular (pseudo-código, adaptar a framework si aplica)
  // Aquí se muestra la estructura y lógica, no HTML real
  return {
    render() {
      /*
      - Fecha (input date)
      - Categoría (select)
      - Unidades (input number)
      - Precio (input number)
      - Total (auto-cálculo: unidades × precio)
      - Descripción (input)
      - Botón Guardar (onSubmit)
      - Limpieza automática tras guardar/cancelar
      */
    },
    // Métodos de interacción y validación pueden ir aquí o en servicios
  };
}
