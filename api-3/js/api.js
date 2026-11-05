/**
 * api.js - VALORANT API Client
 * Public endpoint: https://valorant-api.com/v1
 */
const Api = (() => {
  const BASE_URL = 'https://valorant-api.com/v1';
  let cachedAgents = null;
  let cachePromise = null;

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
