/**
 * storage.js - LocalStorage management for VALORANT Agent Archive
 */
const Storage = (() => {
  const FAVORITES_KEY = 'valorant_archive_favorites';
  const COMPARE_KEY = 'valorant_archive_compare';

  // Read array safely from localStorage
  const getArray = (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Error reading ${key} from localStorage:`, e);
      return [];
    }
  };

  // Save array safely to localStorage
  const setArray = (key, arr) => {
    try {
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) {
      console.error(`Error saving ${key} to localStorage:`, e);
    }
  };

  return {
    // --- FAVORITES ---
    getFavorites() {
      return getArray(FAVORITES_KEY);
    },

    isFavorite(uuid) {
      if (!uuid) return false;
      return this.getFavorites().includes(uuid);
    },

    addFavorite(uuid) {
      if (!uuid) return false;
      const favs = this.getFavorites();
      if (!favs.includes(uuid)) {
        favs.push(uuid);
        setArray(FAVORITES_KEY, favs);
        window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { uuid, action: 'add' } }));
        return true;
      }
      return false;
    },

    removeFavorite(uuid) {
      if (!uuid) return false;
      let favs = this.getFavorites();
      if (favs.includes(uuid)) {
        favs = favs.filter(id => id !== uuid);
        setArray(FAVORITES_KEY, favs);
        window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { uuid, action: 'remove' } }));
        return true;
      }
      return false;
    },

    toggleFavorite(uuid) {
      if (this.isFavorite(uuid)) {
        this.removeFavorite(uuid);
        return false; // now false
      } else {
        this.addFavorite(uuid);
        return true; // now true
      }
    },

    // --- COMPARE (Max 2 agents) ---
    getCompareList() {
      return getArray(COMPARE_KEY);
    },

    isInCompare(uuid) {
      if (!uuid) return false;
      return this.getCompareList().includes(uuid);
    },

    addToCompare(uuid) {
      if (!uuid) return { success: false, reason: 'Invalid agent ID' };
      const list = this.getCompareList();
      if (list.includes(uuid)) {
        return { success: false, alreadyAdded: true, message: 'Agent is already in comparison.' };
      }
      if (list.length >= 2) {
        return { success: false, limitReached: true, message: 'Two agents are already selected for comparison.' };
      }
      list.push(uuid);
      setArray(COMPARE_KEY, list);
      window.dispatchEvent(new CustomEvent('compareUpdated', { detail: { list } }));
      return { success: true };
    },

    removeFromCompare(uuid) {
      if (!uuid) return false;
      let list = this.getCompareList();
      if (list.includes(uuid)) {
        list = list.filter(id => id !== uuid);
        setArray(COMPARE_KEY, list);
        window.dispatchEvent(new CustomEvent('compareUpdated', { detail: { list } }));
        return true;
      }
      return false;
    },

    clearCompare() {
      setArray(COMPARE_KEY, []);
      window.dispatchEvent(new CustomEvent('compareUpdated', { detail: { list: [] } }));
    }
  };
})();
