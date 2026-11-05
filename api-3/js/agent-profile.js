/**
 * agent-profile.js - Logic for Individual Agent Profile (agent.html)
 */
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const uuid = urlParams.get('uuid');

  const profileContent = document.getElementById('profileContent');
  const profileLoading = document.getElementById('profileLoading');
  const profileError = document.getElementById('profileError');

  // Breadcrumbs
  const breadcrumbAgentName = document.getElementById('breadcrumbAgentName');

  // Hero Profile Elements
  const agentDisplayName = document.getElementById('agentDisplayName');
  const agentRoleBadge = document.getElementById('agentRoleBadge');
  const agentRoleName = document.getElementById('agentRoleName');
  const agentDescription = document.getElementById('agentDescription');
  const agentArtwork = document.getElementById('agentArtwork');
  const agentBackdropArt = document.getElementById('agentBackdropArt');
  const favActionBtn = document.getElementById('favActionBtn');
  const compareActionBtn = document.getElementById('compareActionBtn');

  // Overview Elements
  const overviewName = document.getElementById('overviewName');
  const overviewRole = document.getElementById('overviewRole');
  const overviewDeveloperName = document.getElementById('overviewDeveloperName');
  const overviewTags = document.getElementById('overviewTags');
  const overviewUuid = document.getElementById('overviewUuid');

  // Abilities Container
  const abilitiesContainer = document.getElementById('abilitiesContainer');

  // Related Agents
  const relatedAgentsGrid = document.getElementById('relatedAgentsGrid');

  // Prev / Next Navigation
  const prevAgentBtn = document.getElementById('prevAgentBtn');
  const nextAgentBtn = document.getElementById('nextAgentBtn');

  if (!uuid) {
    showNotFoundError();
    return;
  }

  function showNotFoundError(message = "The agent you're looking for may be unavailable or the profile link may be invalid.") {
    if (profileLoading) profileLoading.style.display = 'none';
    if (profileContent) profileContent.style.display = 'none';
    if (profileError) {
      profileError.innerHTML = `
        <div class="state-box my-5">
          <div class="state-icon text-archive-red">
            <i class="bi bi-question-circle"></i>
          </div>
          <h3 class="mb-2">AGENT NOT FOUND</h3>
          <p class="text-archive-secondary mb-4">${Components.escapeHtml(message)}</p>
          <a href="agents.html" class="btn btn-archive-primary">
            <i class="bi bi-arrow-left"></i> BACK TO AGENTS
          </a>
        </div>
      `;
      profileError.style.display = 'block';
    }
  }

  const loadProfile = async () => {
    if (profileLoading) profileLoading.style.display = 'block';
    if (profileContent) profileContent.style.display = 'none';
    if (profileError) profileError.style.display = 'none';

    // Fetch agent and all agents list (for prev/next and related)
    const [agentRes, allAgentsRes] = await Promise.all([
      Api.getAgentByUuid(uuid),
      Api.getPlayableAgents()
    ]);

    if (!agentRes.success || !agentRes.data) {
      if (agentRes.notFound) {
        showNotFoundError();
      } else {
        if (profileLoading) profileLoading.style.display = 'none';
        if (profileError) {
          profileError.innerHTML = '';
          profileError.appendChild(
            Components.renderErrorState(agentRes.error, () => loadProfile())
          );
          profileError.style.display = 'block';
        }
      }
      return;
    }

    const agent = agentRes.data;
    const allAgents = (allAgentsRes.success && allAgentsRes.data) ? allAgentsRes.data : [];

    // Set page title
    document.title = `${agent.displayName} | VALORANT Agent Archive`;

    // 1. BREADCRUMBS
    if (breadcrumbAgentName) {
      breadcrumbAgentName.textContent = agent.displayName;
    }

    // 2. HERO PROFILE
    if (agentDisplayName) agentDisplayName.textContent = agent.displayName;
    if (agentDescription) agentDescription.innerHTML = Components.formatGameText(agent.description || 'No description available for this agent.');
    
    if (agentRoleName && agent.role) {
      agentRoleName.textContent = agent.role.displayName;
    }
    if (agentRoleBadge && agent.role && agent.role.displayIcon) {
      agentRoleBadge.querySelector('img').src = agent.role.displayIcon;
    }

    // Artwork Fallback order: fullPortrait -> fullPortraitV2 -> displayIcon -> displayIconSmall -> placeholder
    const artUrl = agent.fullPortrait || agent.fullPortraitV2 || agent.displayIcon || agent.displayIconSmall || Components.PLACEHOLDER_AGENT;
    if (agentArtwork) {
      agentArtwork.src = artUrl;
      agentArtwork.alt = agent.displayName;
      agentArtwork.onerror = () => {
        agentArtwork.src = Components.PLACEHOLDER_AGENT;
      };
    }

    if (agentBackdropArt && agent.background) {
      agentBackdropArt.src = agent.background;
    }

    // Update Favorites Button
    const updateFavButton = () => {
      if (!favActionBtn) return;
      const isFav = Storage.isFavorite(agent.uuid);
      if (isFav) {
        favActionBtn.innerHTML = '<i class="bi bi-heart-fill me-2"></i> REMOVE FROM FAVORITES';
        favActionBtn.className = 'btn btn-archive-secondary';
      } else {
        favActionBtn.innerHTML = '<i class="bi bi-heart me-2"></i> ADD TO FAVORITES';
        favActionBtn.className = 'btn btn-archive-primary';
      }
    };

    updateFavButton();

    if (favActionBtn) {
      favActionBtn.addEventListener('click', () => {
        const updated = Storage.toggleFavorite(agent.uuid);
        updateFavButton();
        if (updated) {
          Components.showToast(`${agent.displayName} added to your favorites.`);
        } else {
          Components.showToast(`${agent.displayName} removed from your favorites.`);
        }
      });
    }

    // Update Compare Button
    const updateCompareButton = () => {
      if (!compareActionBtn) return;
      const inCompare = Storage.isInCompare(agent.uuid);
      if (inCompare) {
        compareActionBtn.innerHTML = '<i class="bi bi-check2-circle me-2"></i> COMPARE AGENTS';
        compareActionBtn.className = 'btn btn-archive-outline-red';
      } else {
        compareActionBtn.innerHTML = '<i class="bi bi-intersect me-2"></i> ADD TO COMPARE';
        compareActionBtn.className = 'btn btn-archive-secondary';
      }
    };

    updateCompareButton();

    if (compareActionBtn) {
      compareActionBtn.addEventListener('click', () => {
        const inCompare = Storage.isInCompare(agent.uuid);
        if (inCompare) {
          // Navigate to compare page
          window.location.href = 'compare.html';
        } else {
          const res = Storage.addToCompare(agent.uuid);
          if (res.success) {
            updateCompareButton();
            Components.showToast(`${agent.displayName} added to comparison.`);
          } else if (res.limitReached) {
            Components.showToast('Two agents are already selected for comparison. Please remove one in Compare.', 'COMPARISON FULL', true);
          } else if (res.alreadyAdded) {
            window.location.href = 'compare.html';
          }
        }
      });
    }

    // 3. OVERVIEW METADATA
    if (overviewName) overviewName.textContent = agent.displayName;
    if (overviewRole) overviewRole.textContent = agent.role ? agent.role.displayName : 'Unknown';
    if (overviewDeveloperName) overviewDeveloperName.textContent = agent.developerName || 'N/A';
    if (overviewUuid) overviewUuid.textContent = agent.uuid;
    if (overviewTags) {
      if (Array.isArray(agent.characterTags) && agent.characterTags.length > 0) {
        overviewTags.innerHTML = agent.characterTags.map(tag => 
          `<span class="badge bg-archive-secondary border border-archive me-1">${Components.escapeHtml(tag)}</span>`
        ).join('');
      } else {
        overviewTags.textContent = 'None';
      }
    }

    // 4. ABILITIES SHOWCASE
    if (abilitiesContainer) {
      abilitiesContainer.innerHTML = '';
      const abilities = Array.isArray(agent.abilities) ? agent.abilities : [];

      if (abilities.length === 0) {
        abilitiesContainer.innerHTML = '<p class="text-archive-muted">No ability data available.</p>';
      } else {
        abilities.forEach(ability => {
          const cardCol = document.createElement('div');
          cardCol.className = 'col-lg-3 col-md-6 col-12';

          const iconSrc = ability.displayIcon || Components.PLACEHOLDER_ABILITY;
          const slotName = ability.slot ? ability.slot.toUpperCase() : 'ABILITY';
          const name = ability.displayName || 'Unknown Ability';
          const desc = ability.description || 'No description available.';

          cardCol.innerHTML = `
            <div class="ability-card" tabindex="0" role="button" aria-label="Details for ${Components.escapeHtml(name)}">
              <div class="ability-icon-wrap">
                <img src="${Components.escapeHtml(iconSrc)}" 
                     alt="${Components.escapeHtml(name)}" 
                     onerror="this.onerror=null;this.src='${Components.PLACEHOLDER_ABILITY}';" />
              </div>
              <div class="ability-slot-badge">${Components.escapeHtml(slotName)}</div>
              <h4 class="ability-name">${Components.escapeHtml(name)}</h4>
              <p class="ability-desc-preview">${Components.formatGameText(desc)}</p>
            </div>
          `;

          // Ability Click -> Bootstrap Modal
          const card = cardCol.querySelector('.ability-card');
          const openAbilityModal = () => {
            const modalEl = document.getElementById('abilityModal');
            if (!modalEl) return;

            document.getElementById('modalAbilityIcon').src = iconSrc;
            document.getElementById('modalAbilitySlot').textContent = slotName;
            document.getElementById('modalAbilityName').textContent = name;
            document.getElementById('modalAbilityDesc').innerHTML = Components.formatGameText(desc);

            const modal = new bootstrap.Modal(modalEl);
            modal.show();
          };

          card.addEventListener('click', openAbilityModal);
          card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openAbilityModal();
            }
          });

          abilitiesContainer.appendChild(cardCol);
        });
      }
    }

    // 5. RELATED AGENTS (4 agents from same role if possible)
    if (relatedAgentsGrid && allAgents.length > 0) {
      relatedAgentsGrid.innerHTML = '';
      const currentRole = agent.role ? agent.role.displayName : '';
      
      // Filter other agents
      let related = allAgents.filter(a => a.uuid !== agent.uuid && a.role && a.role.displayName === currentRole);
      
      // If fewer than 4 share the role, fill with other agents
      if (related.length < 4) {
        const others = allAgents.filter(a => a.uuid !== agent.uuid && !related.some(r => r.uuid === a.uuid));
        related = related.concat(others.slice(0, 4 - related.length));
      } else {
        related = related.slice(0, 4);
      }

      related.forEach(relAgent => {
        const cardCol = Components.createAgentCard(relAgent);
        // Adjust column sizes for 4 items: col-6 col-md-3
        cardCol.className = 'col-6 col-md-3';
        relatedAgentsGrid.appendChild(cardCol);
      });
    }

    // 6. PREVIOUS / NEXT NAVIGATION
    if (allAgents.length > 1) {
      // Find current index in sorted list
      const currentIndex = allAgents.findIndex(a => a.uuid.toLowerCase() === agent.uuid.toLowerCase());
      
      if (currentIndex !== -1) {
        const prevIndex = (currentIndex - 1 + allAgents.length) % allAgents.length;
        const nextIndex = (currentIndex + 1) % allAgents.length;

        const prevAgent = allAgents[prevIndex];
        const nextAgent = allAgents[nextIndex];

        if (prevAgentBtn) {
          prevAgentBtn.href = `agent.html?uuid=${prevAgent.uuid}`;
          prevAgentBtn.innerHTML = `<i class="bi bi-arrow-left"></i> ${Components.escapeHtml(prevAgent.displayName)}`;
        }
        if (nextAgentBtn) {
          nextAgentBtn.href = `agent.html?uuid=${nextAgent.uuid}`;
          nextAgentBtn.innerHTML = `${Components.escapeHtml(nextAgent.displayName)} <i class="bi bi-arrow-right"></i>`;
        }
      }
    }

    // Show loaded content
    if (profileLoading) profileLoading.style.display = 'none';
    if (profileContent) profileContent.style.display = 'block';
  };

  loadProfile();
});
