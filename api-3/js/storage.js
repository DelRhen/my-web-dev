/**
 * storage.js - LocalStorage management for VALORANT Agent Archive
 */
const Storage = (() => {
  const FAVORITES_KEY = 'valorant_archive_favorites';
  const COMPARE_KEY = 'valorant_archive_compare';
  const COSMETIC_FAVORITES_KEY = 'valorant_archive_cosmetic_favorites';

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
    },

    // --- COSMETIC / COLLECTION FAVORITES ---
    getCosmeticFavorites() {
      return getArray(COSMETIC_FAVORITES_KEY);
    },

    isCosmeticFavorite(uuid) {
      if (!uuid) return false;
      const favs = this.getCosmeticFavorites();
      return favs.some(item => (typeof item === 'string' ? item : item.uuid) === uuid);
    },

    addCosmeticFavorite(item) {
      if (!item || !item.uuid) return false;
      let favs = this.getCosmeticFavorites();
      if (!this.isCosmeticFavorite(item.uuid)) {
        favs.push({
          uuid: item.uuid,
          type: item.type || 'item',
          name: item.name || item.displayName || 'Cosmetic Item',
          icon: item.icon || item.displayIcon || '',
          extra: item.extra || ''
        });
        setArray(COSMETIC_FAVORITES_KEY, favs);
        window.dispatchEvent(new CustomEvent('cosmeticFavoritesUpdated', { detail: { item, action: 'add' } }));
        return true;
      }
      return false;
    },

    removeCosmeticFavorite(uuid) {
      if (!uuid) return false;
      let favs = this.getCosmeticFavorites();
      const initialLen = favs.length;
      favs = favs.filter(item => (typeof item === 'string' ? item : item.uuid) !== uuid);
      if (favs.length !== initialLen) {
        setArray(COSMETIC_FAVORITES_KEY, favs);
        window.dispatchEvent(new CustomEvent('cosmeticFavoritesUpdated', { detail: { uuid, action: 'remove' } }));
        return true;
      }
      return false;
    },

    toggleCosmeticFavorite(item) {
      if (!item || !item.uuid) return false;
      if (this.isCosmeticFavorite(item.uuid)) {
        this.removeCosmeticFavorite(item.uuid);
        return false;
      } else {
        this.addCosmeticFavorite(item);
        return true;
      }
    }
  };
})();
