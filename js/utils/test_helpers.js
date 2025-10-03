// Small test helpers for basic unit checks in Node (requires jsdom when running tests)
if (typeof app === 'undefined') global.app = {};

app.testAssert = function(condition, message) {
    if (!condition) throw new Error('Assertion failed: ' + message);
};

app.runBasicChecks = function() {
    // ensure utils exist
    app.testAssert(typeof app.registroUtils !== 'undefined', 'registroUtils debe existir');
    app.testAssert(typeof app.registroUtils.calcularTotalProductos === 'function', 'calcularTotalProductos debe existir');
    // sample calculation
    const total = app.registroUtils.calcularTotalProductos([{price:10,quantity:2},{price:5,quantity:1}]);
    app.testAssert(total === 25, 'Total calculado incorrecto');
    // Levenshtein simple test if available in registro module
    try {
        const reg = require('../js/modules/Registro/registro.js');
    } catch (e) {
        // ignore; we'll test our local implementation if present
    }
    return true;
};
