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

    // 2. HERO FEATURED AGENT
    // Try to pick a visually iconic agent like Jett, Reyna, or Omen, else fallback to first
    const preferredFeatured = ['Jett', 'Reyna', 'Omen', 'Phoenix', 'Sage'];
    let featuredAgent = agents.find(a => preferredFeatured.includes(a.displayName) && a.fullPortrait) || agents[0];

    if (featuredAgent) {
      const artUrl = featuredAgent.fullPortrait || featuredAgent.fullPortraitV2 || featuredAgent.displayIcon;
      if (heroAgentImg) {
        heroAgentImg.src = artUrl;
        heroAgentImg.alt = featuredAgent.displayName;
        heroAgentImg.addEventListener('click', () => {
          window.location.href = `agent.html?uuid=${featuredAgent.uuid}`;
        });
      }
      if (heroAgentBg && featuredAgent.background) {
        heroAgentBg.src = featuredAgent.background;
      }
      if (heroFeaturedName) {
        heroFeaturedName.textContent = featuredAgent.displayName;
      }
      if (heroFeaturedRole && featuredAgent.role) {
        heroFeaturedRole.textContent = featuredAgent.role.displayName;
      }
      if (heroFeaturedTag) {
        heroFeaturedTag.style.display = 'block';
        heroFeaturedTag.addEventListener('click', () => {
          window.location.href = `agent.html?uuid=${featuredAgent.uuid}`;
        });
      }
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
