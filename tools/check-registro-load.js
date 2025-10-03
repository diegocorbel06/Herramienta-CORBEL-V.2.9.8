// Check load for Registro module with minimal DOM mocks
const path = require('path');
const fs = require('fs');

global.app = global.app || {};
// Minimal document/window mocks to satisfy registro.js expectations
global.window = global.window || {};
global.document = global.document || {};
if (typeof document.addEventListener !== 'function') document.addEventListener = function() {};
if (typeof document.createElement !== 'function') document.createElement = function() { return { style:{}, appendChild: function(){}, innerHTML: '' }; };
if (typeof document.getElementById !== 'function') document.getElementById = function() { return null; };
if (typeof document.querySelector !== 'function') document.querySelector = function() { return null; };
if (typeof document.querySelectorAll !== 'function') document.querySelectorAll = function() { return []; };

try {
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'validation.js'));
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'utils.js'));
  require(path.join(__dirname, '..', 'js', 'modules', 'Registro', 'registro.js'));
  console.log('Loaded registro modules. registroUtils:', !!app.registroUtils, 'updateRegisterTable:', typeof app.updateRegisterTable === 'function');
} catch (e) {
  console.error('Error loading registro modules:', e);
  process.exit(2);
}
