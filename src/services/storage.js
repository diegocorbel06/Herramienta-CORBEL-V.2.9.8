// Servicio: Storage (abstracción de persistencia)
// Permite cambiar entre localStorage, IndexedDB, etc.

const storage = {
  get(key) {
    return JSON.parse(localStorage.getItem(key));
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  }
};

export default storage;
