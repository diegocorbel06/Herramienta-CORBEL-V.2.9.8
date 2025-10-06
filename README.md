
# Corbel Herramienta

Registro y gestión de ventas, gastos, arqueo de caja y proveedores para talleres mecánicos.

### Novedades UX (septiembre 2025)
- Formularios de registro en pestañas horizontales, seleccionables y numeradas dinámicamente.
- Botón "Limpiar" en cada formulario: limpia todos los campos, productos, mecánicos y métodos de pago.
- Limpieza automática tras cancelar o finalizar edición.
- Integración robusta entre formularios, historial y arqueo de caja.
- Modularización avanzada: cada formulario y servicio es independiente y reutilizable.


## Nueva Estructura Modular (en migración)

- `src/components/`: Componentes de UI (formularios, tablas, etc.)
- `src/services/`: Lógica de negocio y persistencia (ventas, gastos, arqueo, proveedores)
- `src/utils/`: Utilidades (validaciones, formateadores)
- `src/app.js`: Punto de entrada principal
- `src/styles.css`: Estilos principales

## Objetivos de la Refactorización
- Mantener todas las funcionalidades actuales
- Modularizar el código para facilitar mantenimiento y escalabilidad
- Mejorar la persistencia de datos (capa de abstracción)
- Separar lógica de UI y negocio
- Añadir validaciones sólidas y formularios dinámicos
- Documentar todos los cambios

## Guía de Migración
Consulta `src/README-migracion.md` para detalles del proceso y estructura.

## Uso
1. Clona el repositorio
2. Abre `index.html` en tu navegador
3. ¡Listo!

## Estado actual
- Estructura modular creada
- Migración en curso
- Próximos pasos: migrar lógica de formularios y servicios


Al importar un excel con diversa información, los registros de venta o gastos importados tienen que ser totalmente compatibles con los nuevos registros, incluso al momento de editarlos. De tal forma que se puedan aplicar de forma correcta los filtros de busqueda.

Mejora el módulo de “Cuadrar Caja”. 
. Optimiza el conteo de dinero dinámico existente para que los totales se actualicen en tiempo real conforme se ingresan montos o billetes.
. Añade un sistema de Arqueo de Caja Diario por rango de fechas.
. El arqueo debe calcular ingresos (ventas) y egresos (gastos) según método de pago (efectivo, tarjeta, transferencia, etc).
. Al finalizar el arqueo, mostrar resumen detallado: total por método de pago, total general, diferencia contra el dinero contado.
. El total de Efectivo Contado debe ser dinamico y actualizarce en relación a que se añadan los valores del conteo, ademas de incluir una fecha especifica. Los ingresos por medio de pago deben actualizarce con el total de Efectivo Contado y debe ser coherente con el efectivo registrado en las ventas y/o gastos por fecha.  
. Añade filtros de busqueda, botones de editar y/o eliminar registros del historial de cierres de caja en el arqueo de caja

Los registros previos o anteriores deben ser totalmente compatibles con los nuevos registros
filtros de busqueda,botones para editar y/o eliminar los gastos en el arqueo de caja


En el apartado/modulo de relaciones debemos implementar un sistema de proveedores, utilizar los formatos para agregar items, visualizar el catalogo con los items me parece adecuado para ir optimizando este sergmento.

Tengo una lista de nombres de productos y servicios para subir al catalogo, con una codificacion diferente al sistema de ids por lo que el sistema de ids me preocupa como puedo unificar, optimizar y mejorar este punto, debido a que posteriormente ire añadiendo mas items al catalogo u otros.
Vamos a optimizar el modulo de arqueo de caja:
- Solo se realiza un arqueo de caja por día entonces en "Fecha (o rango)" (Cambiar a "Fecha de Arqueo") solo debe existir una entrada de solo una fecha especifica
- Así como se evidencian los montos en relación a los tipos de ingresos tambien deben visualizarce los montos utilizados para los gastos segun correspondan.
- Garantizar y optimizar la maxima la experiencia del usuario
- Identificar mejores necesarias o de referencias que puedan integrarse a nuestra herramienta y que optifimicen este modulo.
