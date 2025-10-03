#!/usr/bin/env bash
# Ejecuta tests rápidos relacionados con Arqueo
set -euo pipefail
echo "Ejecutando tests de arqueo..."
node tools/test-calcular-arqueo.js
node tools/test-arqueo-ui-behavior.js
echo "Todos los tests de arqueo pasaron." 
