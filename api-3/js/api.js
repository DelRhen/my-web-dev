/**
 * api.js - VALORANT API Client
 * Public endpoint: https://valorant-api.com/v1
 */
const Api = (() => {
  const BASE_URL = 'https://valorant-api.com/v1';
  let cachedAgents = null;
  let cachePromise = null;
  let cachedMaps = null;
  let mapsCachePromise = null;

  // Cosmetic Collection caches
  let cachedPlayerCards = null;
  let playerCardsPromise = null;
  let cachedSprays = null;
  let spraysPromise = null;
  let cachedWeapons = null;
  let weaponsPromise = null;
  let cachedBuddies = null;
  let buddiesPromise = null;

  return {
    /**
     * Fetch all playable agents
     * GET /agents?isPlayableCharacter=true
     */
    async getPlayableAgents(forceRefresh = false) {
      if (!forceRefresh && cachedAgents) {
        return { success: true, data: cachedAgents };
      }

      if (!forceRefresh && cachePromise) {
        return cachePromise;
      }

      cachePromise = (async () => {
        try {
          const res = await fetch(`${BASE_URL}/agents?isPlayableCharacter=true`);
          if (!res.ok) {
            throw new Error(`API returned status ${res.status}`);
          }
          const json = await res.json();
          if (json && Array.isArray(json.data)) {
            // Sort by displayName alphabetically by default
            const sorted = json.data.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
            cachedAgents = sorted;
            return { success: true, data: sorted };
          } else {
            throw new Error('Malformed API response');
          }
        } catch (err) {
          console.error('Failed to fetch agents:', err);
          return { success: false, error: err.message };
        } finally {
          cachePromise = null;
        }
      })();

      return cachePromise;
    },

    /**
     * Fetch a single agent by UUID
     * GET /agents/{uuid}
     */
    async getAgentByUuid(uuid) {
      if (!uuid) return { success: false, error: 'No UUID provided' };

      // Check if already in cache
      if (cachedAgents) {
        const found = cachedAgents.find(a => a.uuid.toLowerCase() === uuid.toLowerCase());
        if (found) return { success: true, data: found };
      }

      try {
        const res = await fetch(`${BASE_URL}/agents/${uuid}`);
        if (!res.ok) {
          if (res.status === 404) {
            return { success: false, notFound: true, error: 'Agent not found' };
          }
          throw new Error(`API returned status ${res.status}`);
        }
        const json = await res.json();
        if (json && json.data) {
          return { success: true, data: json.data };
        } else {
          throw new Error('Agent data missing in response');
        }
      } catch (err) {
        console.error(`Failed to fetch agent ${uuid}:`, err);
        return { success: false, error: err.message };
      }
    },

    /**
     * Fetch all maps
     * GET /maps
     */
    async getMaps(forceRefresh = false) {
      if (!forceRefresh && cachedMaps) {
        return { success: true, data: cachedMaps };
      }

      if (!forceRefresh && mapsCachePromise) {
        return mapsCachePromise;
      }

      mapsCachePromise = (async () => {
        try {
          const res = await fetch(`${BASE_URL}/maps`);
          if (!res.ok) {
            throw new Error(`API returned status ${res.status}`);
          }
          const json = await res.json();
          if (json && Array.isArray(json.data)) {
            // Filter out maps without splash or test duplicates, prioritize playable competitive & active maps
            // Sort alphabetically by default
            const sorted = json.data.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
            cachedMaps = sorted;
            return { success: true, data: sorted };
          } else {
            throw new Error('Malformed API response');
          }
        } catch (err) {
          console.error('Failed to fetch maps:', err);
          return { success: false, error: err.message };
        } finally {
          mapsCachePromise = null;
        }
      })();

      return mapsCachePromise;
    },

    /**
     * Fetch a single map by UUID
     * GET /maps/{uuid}
     */
    async getMapByUuid(uuid) {
      if (!uuid) return { success: false, error: 'No UUID provided' };

      // Check if already in cache
      if (cachedMaps) {
        const found = cachedMaps.find(m => m.uuid.toLowerCase() === uuid.toLowerCase());
        if (found) return { success: true, data: found };
      }

      try {
        const res = await fetch(`${BASE_URL}/maps/${uuid}`);
        if (!res.ok) {
          if (res.status === 404) {
            return { success: false, notFound: true, error: 'Map not found' };
          }
          throw new Error(`API returned status ${res.status}`);
        }
        const json = await res.json();
        if (json && json.data) {
          return { success: true, data: json.data };
        } else {
          throw new Error('Map data missing in response');
        }
      } catch (err) {
        console.error(`Failed to fetch map ${uuid}:`, err);
        return { success: false, error: err.message };
      }
    },

    /**
     * Fetch all player cards
     * GET /playercards
     */
    async getPlayerCards(forceRefresh = false) {
      if (!forceRefresh && cachedPlayerCards) {
        return { success: true, data: cachedPlayerCards };
      }
      if (!forceRefresh && playerCardsPromise) {
        return playerCardsPromise;
      }

      playerCardsPromise = (async () => {
        try {
          const res = await fetch(`${BASE_URL}/playercards`);
          if (!res.ok) throw new Error(`API returned status ${res.status}`);
          const json = await res.json();
          if (json && Array.isArray(json.data)) {
            const sorted = json.data.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
            cachedPlayerCards = sorted;
            return { success: true, data: sorted };
          } else {
            throw new Error('Malformed player cards response');
          }
        } catch (err) {
          console.error('Failed to fetch player cards:', err);
          return { success: false, error: err.message };
        } finally {
          playerCardsPromise = null;
        }
      })();

      return playerCardsPromise;
    },

    /**
     * Fetch all sprays
     * GET /sprays
     */
    async getSprays(forceRefresh = false) {
      if (!forceRefresh && cachedSprays) {
        return { success: true, data: cachedSprays };
      }
      if (!forceRefresh && spraysPromise) {
        return spraysPromise;
      }

      spraysPromise = (async () => {
        try {
          const res = await fetch(`${BASE_URL}/sprays`);
          if (!res.ok) throw new Error(`API returned status ${res.status}`);
          const json = await res.json();
          if (json && Array.isArray(json.data)) {
            // Filter out null sprays (test items)
            const valid = json.data.filter(s => !s.isNullSpray && (s.fullTransparentIcon || s.displayIcon));
            const sorted = valid.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
            cachedSprays = sorted;
            return { success: true, data: sorted };
          } else {
            throw new Error('Malformed sprays response');
          }
        } catch (err) {
          console.error('Failed to fetch sprays:', err);
          return { success: false, error: err.message };
        } finally {
          spraysPromise = null;
        }
      })();

      return spraysPromise;
    },

    /**
     * Fetch all weapons and their skins
     * GET /weapons
     */
    async getWeapons(forceRefresh = false) {
      if (!forceRefresh && cachedWeapons) {
        return { success: true, data: cachedWeapons };
      }
      if (!forceRefresh && weaponsPromise) {
        return weaponsPromise;
      }

      weaponsPromise = (async () => {
        try {
          const res = await fetch(`${BASE_URL}/weapons`);
          if (!res.ok) throw new Error(`API returned status ${res.status}`);
          const json = await res.json();
          if (json && Array.isArray(json.data)) {
            const sorted = json.data.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
            cachedWeapons = sorted;
            return { success: true, data: sorted };
          } else {
            throw new Error('Malformed weapons response');
          }
        } catch (err) {
          console.error('Failed to fetch weapons:', err);
          return { success: false, error: err.message };
        } finally {
          weaponsPromise = null;
        }
      })();

      return weaponsPromise;
    },

    /**
     * Fetch all gun buddies
     * GET /buddies
     */
    async getBuddies(forceRefresh = false) {
      if (!forceRefresh && cachedBuddies) {
        return { success: true, data: cachedBuddies };
      }
      if (!forceRefresh && buddiesPromise) {
        return buddiesPromise;
      }

      buddiesPromise = (async () => {
        try {
          const res = await fetch(`${BASE_URL}/buddies`);
          if (!res.ok) throw new Error(`API returned status ${res.status}`);
          const json = await res.json();
          if (json && Array.isArray(json.data)) {
            const valid = json.data.filter(b => b.displayIcon);
            const sorted = valid.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
            cachedBuddies = sorted;
            return { success: true, data: sorted };
          } else {
            throw new Error('Malformed buddies response');
          }
        } catch (err) {
          console.error('Failed to fetch buddies:', err);
          return { success: false, error: err.message };
        } finally {
          buddiesPromise = null;
        }
      })();

      return buddiesPromise;
    },

    /**
     * Fetch API version
     * GET /version
     */
    async getVersion() {
      try {
        const res = await fetch(`${BASE_URL}/version`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        return { success: true, data: json.data };
      } catch (err) {
        console.warn('Failed to fetch API version:', err);
        return { success: false, error: err.message };
      }
    }
  };
})();
