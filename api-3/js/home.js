/**
 * home.js - Logic for Homepage (index.html)
 */
document.addEventListener('DOMContentLoaded', async () => {
  const heroAgentImg = document.getElementById('heroAgentImg');
  const heroAgentBg = document.getElementById('heroAgentBg');
  const heroFeaturedName = document.getElementById('heroFeaturedName');
  const heroFeaturedRole = document.getElementById('heroFeaturedRole');
  const heroFeaturedTag = document.getElementById('heroFeaturedTag');

  const statAgents = document.getElementById('statAgents');
  const statRoles = document.getElementById('statRoles');
  const statAbilities = document.getElementById('statAbilities');

  const featuredGrid = document.getElementById('featuredAgentsGrid');

  // Load Home Data
  const loadHome = async () => {
    if (featuredGrid) {
      featuredGrid.innerHTML = Components.renderSkeletonCards(6);
    }

    const res = await Api.getPlayableAgents();
    if (!res.success || !res.data) {
      if (featuredGrid) {
        featuredGrid.parentElement.appendChild(
          Components.renderErrorState(res.error, () => loadHome())
        );
        featuredGrid.innerHTML = '';
      }
      return;
    }

    const agents = res.data;

    // 1. DYNAMIC STATISTICS
    const totalAgents = agents.length;
    const distinctRoles = new Set(agents.map(a => a.role?.displayName).filter(Boolean));
    const totalAbilities = agents.reduce((acc, a) => acc + (a.abilities ? a.abilities.length : 0), 0);

    if (statAgents) statAgents.textContent = totalAgents;
    if (statRoles) statRoles.textContent = distinctRoles.size;
    if (statAbilities) statAbilities.textContent = totalAbilities;

    // 2. HERO FEATURED AGENT — Auto-rotating carousel every 4 seconds
    // Build rotation pool: all agents with a full portrait, ordered by preferred list first
    const preferredNames = ['Jett', 'Reyna', 'Omen', 'Phoenix', 'Sage', 'Neon', 'Raze', 'Yoru', 'Clove', 'Iso'];
    const withPortrait = agents.filter(a => a.fullPortrait || a.fullPortraitV2);
    const preferred = preferredNames.map(n => withPortrait.find(a => a.displayName === n)).filter(Boolean);
    const rest = withPortrait.filter(a => !preferredNames.includes(a.displayName));
    const rotationPool = preferred.length >= 3 ? preferred : [...preferred, ...rest];

    if (rotationPool.length === 0) return;

    let currentIndex = 0;
    let rotationInterval = null;

    // Helper: update hero DOM for the given agent
    const showHeroAgent = (agent) => {
      const artUrl = agent.fullPortrait || agent.fullPortraitV2 || agent.displayIcon;
      if (heroAgentImg) {
        heroAgentImg.src = artUrl;
        heroAgentImg.alt = agent.displayName;
      }
      if (heroAgentBg) {
        heroAgentBg.src = agent.background || '';
      }
      if (heroFeaturedName) {
        heroFeaturedName.textContent = agent.displayName;
      }
      if (heroFeaturedRole && agent.role) {
        heroFeaturedRole.textContent = agent.role.displayName;
      }
      if (heroFeaturedTag) {
        heroFeaturedTag.style.display = 'block';
      }
    };

    // Helper: crossfade to the next agent
    const advanceHero = () => {
      currentIndex = (currentIndex + 1) % rotationPool.length;
      if (!heroAgentImg) return;
      heroAgentImg.classList.add('fading');
      setTimeout(() => {
        showHeroAgent(rotationPool[currentIndex]);
        heroAgentImg.classList.remove('fading');
      }, 400); // matches CSS transition duration
    };

    // Show first agent immediately (no fade on load)
    showHeroAgent(rotationPool[currentIndex]);

    // Start auto-rotation
    rotationInterval = setInterval(advanceHero, 4000);

    // Click handlers always use currentIndex (not a stale closure)
    if (heroAgentImg) {
      heroAgentImg.style.cursor = 'pointer';
      heroAgentImg.addEventListener('click', () => {
        window.location.href = `agent.html?uuid=${rotationPool[currentIndex].uuid}`;
      });
    }
    if (heroFeaturedTag) {
      heroFeaturedTag.addEventListener('click', () => {
        window.location.href = `agent.html?uuid=${rotationPool[currentIndex].uuid}`;
      });
    }

    // 3. FEATURED AGENTS SECTION (Display 6 playable agents)
    if (featuredGrid) {
      featuredGrid.innerHTML = '';
      // Pick 6 varied agents
      const spotlightNames = ['Jett', 'Omen', 'Sova', 'Killjoy', 'Gekko', 'Reyna'];
      let selected = spotlightNames.map(name => agents.find(a => a.displayName.toLowerCase() === name.toLowerCase())).filter(Boolean);
      
      // If we don't have 6 from the list, fill with first available
      if (selected.length < 6) {
        const remaining = agents.filter(a => !selected.includes(a));
        selected = selected.concat(remaining.slice(0, 6 - selected.length));
      }

      selected.forEach(agent => {
        const cardCol = Components.createAgentCard(agent);
        featuredGrid.appendChild(cardCol);
      });
    }
  };

  loadHome();
});
