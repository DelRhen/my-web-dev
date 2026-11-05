/**
 * compare.js - Logic for Agent Comparison Page (compare.html)
 */
document.addEventListener('DOMContentLoaded', async () => {
  const agent1Select = document.getElementById('agent1Select');
  const agent2Select = document.getElementById('agent2Select');
  const agent1Preview = document.getElementById('agent1Preview');
  const agent2Preview = document.getElementById('agent2Preview');
  const compareBtn = document.getElementById('compareBtn');
  const clearCompareBtn = document.getElementById('clearCompareBtn');
  const comparisonResultsSection = document.getElementById('comparisonResultsSection');
  const comparisonTableBody = document.getElementById('comparisonTableBody');

  let allAgents = [];
  let selectedAgent1 = null;
  let selectedAgent2 = null;

  // Render agent options inside select elements
  const populateDropdowns = () => {
    const defaultOption = '<option value="">-- Choose an Agent --</option>';
    agent1Select.innerHTML = defaultOption;
    agent2Select.innerHTML = defaultOption;

    allAgents.forEach(agent => {
      const opt1 = document.createElement('option');
      opt1.value = agent.uuid;
      opt1.textContent = `${agent.displayName} (${agent.role?.displayName || 'Unknown'})`;
      agent1Select.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = agent.uuid;
      opt2.textContent = `${agent.displayName} (${agent.role?.displayName || 'Unknown'})`;
      agent2Select.appendChild(opt2);
    });
  };

  // Render preview card for selected agent
  const updateAgentPreview = (agent, container, selectElement) => {
    if (!agent) {
      container.innerHTML = `
        <div class="text-archive-muted py-4">
          <i class="bi bi-person-plus display-6 mb-2 d-block"></i>
          <span>No agent selected</span>
        </div>
      `;
      return;
    }

    const portrait = agent.displayIcon || agent.displayIconSmall || Components.PLACEHOLDER_AGENT;
    const roleName = agent.role ? agent.role.displayName : 'Unknown';

    container.innerHTML = `
      <div class="compare-selected-agent-preview">
        <img src="${Components.escapeHtml(portrait)}" alt="${Components.escapeHtml(agent.displayName)}" class="compare-selected-portrait" />
        <h3 class="mb-1">${Components.escapeHtml(agent.displayName)}</h3>
        <span class="role-badge mb-3">${Components.escapeHtml(roleName)}</span>
        <div>
          <button class="btn btn-sm btn-outline-danger btn-remove-selection">
            <i class="bi bi-x-circle"></i> Remove
          </button>
        </div>
      </div>
    `;

    container.querySelector('.btn-remove-selection').addEventListener('click', () => {
      if (agent === selectedAgent1) {
        selectedAgent1 = null;
        agent1Select.value = '';
        Storage.removeFromCompare(agent.uuid);
        updateAgentPreview(null, agent1Preview, agent1Select);
      } else if (agent === selectedAgent2) {
        selectedAgent2 = null;
        agent2Select.value = '';
        Storage.removeFromCompare(agent.uuid);
        updateAgentPreview(null, agent2Preview, agent2Select);
      }
      checkComparisonState();
    });
  };

  // Check state and enable/disable compare button & table
  const checkComparisonState = () => {
    const canCompare = selectedAgent1 && selectedAgent2 && (selectedAgent1.uuid !== selectedAgent2.uuid);
    
    if (compareBtn) {
      compareBtn.disabled = !canCompare;
    }

    if (canCompare) {
      renderComparisonTable();
      if (comparisonResultsSection) {
        comparisonResultsSection.style.display = 'block';
      }
    } else {
      if (comparisonResultsSection) {
        comparisonResultsSection.style.display = 'none';
      }
    }
  };

  // Render side-by-side comparison rows
  const renderComparisonTable = () => {
    if (!selectedAgent1 || !selectedAgent2 || !comparisonTableBody) return;

    const a1 = selectedAgent1;
    const a2 = selectedAgent2;

    const a1Art = a1.fullPortrait || a1.displayIcon || Components.PLACEHOLDER_AGENT;
    const a2Art = a2.fullPortrait || a2.displayIcon || Components.PLACEHOLDER_AGENT;

    // Build ability rows
    const a1Abilities = Array.isArray(a1.abilities) ? a1.abilities : [];
    const a2Abilities = Array.isArray(a2.abilities) ? a2.abilities : [];
    const maxAbilities = Math.max(a1Abilities.length, a2Abilities.length);

    let abilityRowsHtml = '';
    for (let i = 0; i < maxAbilities; i++) {
      const ab1 = a1Abilities[i];
      const ab2 = a2Abilities[i];

      const ab1Slot = ab1 ? (ab1.slot || `Ability ${i + 1}`).toUpperCase() : '';
      const ab2Slot = ab2 ? (ab2.slot || `Ability ${i + 1}`).toUpperCase() : '';
      const label = ab1Slot && ab2Slot && ab1Slot === ab2Slot ? ab1Slot : `ABILITY ${i + 1}`;

      const ab1Content = ab1 ? `
        <div class="d-flex align-items-start gap-2 mb-2">
          ${ab1.displayIcon ? `<img src="${Components.escapeHtml(ab1.displayIcon)}" alt="" style="width:28px; height:28px; object-fit:contain;" />` : ''}
          <div>
            <strong class="text-archive-red">${Components.escapeHtml(ab1.displayName || 'Unknown')}</strong>
            <small class="text-archive-muted ms-1">(${Components.escapeHtml(ab1.slot || '')})</small>
          </div>
        </div>
        <p class="text-archive-secondary small mb-0">${Components.escapeHtml(ab1.description || 'No description available.')}</p>
      ` : '<span class="text-archive-muted fst-italic">No ability in this slot</span>';

      const ab2Content = ab2 ? `
        <div class="d-flex align-items-start gap-2 mb-2">
          ${ab2.displayIcon ? `<img src="${Components.escapeHtml(ab2.displayIcon)}" alt="" style="width:28px; height:28px; object-fit:contain;" />` : ''}
          <div>
            <strong class="text-archive-red">${Components.escapeHtml(ab2.displayName || 'Unknown')}</strong>
            <small class="text-archive-muted ms-1">(${Components.escapeHtml(ab2.slot || '')})</small>
          </div>
        </div>
        <p class="text-archive-secondary small mb-0">${Components.escapeHtml(ab2.description || 'No description available.')}</p>
      ` : '<span class="text-archive-muted fst-italic">No ability in this slot</span>';

      abilityRowsHtml += `
        <tr>
          <th>${Components.escapeHtml(label)}</th>
          <td>${ab1Content}</td>
          <td>${ab2Content}</td>
        </tr>
      `;
    }

    comparisonTableBody.innerHTML = `
      <tr>
        <th>PORTRAIT</th>
        <td class="text-center py-4">
          <img src="${Components.escapeHtml(a1Art)}" alt="${Components.escapeHtml(a1.displayName)}" style="max-height: 220px; max-width: 100%; object-fit: contain;" />
        </td>
        <td class="text-center py-4">
          <img src="${Components.escapeHtml(a2Art)}" alt="${Components.escapeHtml(a2.displayName)}" style="max-height: 220px; max-width: 100%; object-fit: contain;" />
        </td>
      </tr>
      <tr>
        <th>AGENT NAME</th>
        <td><h4 class="mb-0">${Components.escapeHtml(a1.displayName)}</h4></td>
        <td><h4 class="mb-0">${Components.escapeHtml(a2.displayName)}</h4></td>
      </tr>
      <tr>
        <th>ROLE</th>
        <td>
          <span class="role-badge">
            ${a1.role?.displayIcon ? `<img src="${Components.escapeHtml(a1.role.displayIcon)}" alt="" />` : ''}
            <span>${Components.escapeHtml(a1.role?.displayName || 'Unknown')}</span>
          </span>
        </td>
        <td>
          <span class="role-badge">
            ${a2.role?.displayIcon ? `<img src="${Components.escapeHtml(a2.role.displayIcon)}" alt="" />` : ''}
            <span>${Components.escapeHtml(a2.role?.displayName || 'Unknown')}</span>
          </span>
        </td>
      </tr>
      <tr>
        <th>DESCRIPTION</th>
        <td class="text-archive-secondary">${Components.escapeHtml(a1.description || 'No description available.')}</td>
        <td class="text-archive-secondary">${Components.escapeHtml(a2.description || 'No description available.')}</td>
      </tr>
      ${abilityRowsHtml}
    `;
  };

  // Load Compare Data
  const loadCompare = async () => {
    const res = await Api.getPlayableAgents();
    if (!res.success || !res.data) {
      Components.showToast('Unable to load playable agents for comparison.', 'ERROR', true);
      return;
    }

    allAgents = res.data;
    populateDropdowns();

    // Check localStorage for previously selected comparison
    const savedCompare = Storage.getCompareList();
    if (savedCompare.length > 0) {
      selectedAgent1 = allAgents.find(a => a.uuid === savedCompare[0]) || null;
      if (selectedAgent1) {
        agent1Select.value = selectedAgent1.uuid;
        updateAgentPreview(selectedAgent1, agent1Preview, agent1Select);
      }
    }
    if (savedCompare.length > 1) {
      selectedAgent2 = allAgents.find(a => a.uuid === savedCompare[1]) || null;
      if (selectedAgent2) {
        agent2Select.value = selectedAgent2.uuid;
        updateAgentPreview(selectedAgent2, agent2Preview, agent2Select);
      }
    }

    checkComparisonState();
  };

  // Event handlers for dropdown changes
  if (agent1Select) {
    agent1Select.addEventListener('change', (e) => {
      const uuid = e.target.value;
      if (!uuid) {
        if (selectedAgent1) Storage.removeFromCompare(selectedAgent1.uuid);
        selectedAgent1 = null;
        updateAgentPreview(null, agent1Preview, agent1Select);
      } else if (selectedAgent2 && uuid === selectedAgent2.uuid) {
        Components.showToast('Please select two different agents to compare.', 'SELECTION ERROR', true);
        agent1Select.value = selectedAgent1 ? selectedAgent1.uuid : '';
        return;
      } else {
        selectedAgent1 = allAgents.find(a => a.uuid === uuid);
        if (selectedAgent1) {
          Storage.addToCompare(selectedAgent1.uuid);
          updateAgentPreview(selectedAgent1, agent1Preview, agent1Select);
        }
      }
      checkComparisonState();
    });
  }

  if (agent2Select) {
    agent2Select.addEventListener('change', (e) => {
      const uuid = e.target.value;
      if (!uuid) {
        if (selectedAgent2) Storage.removeFromCompare(selectedAgent2.uuid);
        selectedAgent2 = null;
        updateAgentPreview(null, agent2Preview, agent2Select);
      } else if (selectedAgent1 && uuid === selectedAgent1.uuid) {
        Components.showToast('Please select two different agents to compare.', 'SELECTION ERROR', true);
        agent2Select.value = selectedAgent2 ? selectedAgent2.uuid : '';
        return;
      } else {
        selectedAgent2 = allAgents.find(a => a.uuid === uuid);
        if (selectedAgent2) {
          Storage.addToCompare(selectedAgent2.uuid);
          updateAgentPreview(selectedAgent2, agent2Preview, agent2Select);
        }
      }
      checkComparisonState();
    });
  }

  if (compareBtn) {
    compareBtn.addEventListener('click', () => {
      if (comparisonResultsSection) {
        comparisonResultsSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  if (clearCompareBtn) {
    clearCompareBtn.addEventListener('click', () => {
      Storage.clearCompare();
      selectedAgent1 = null;
      selectedAgent2 = null;
      agent1Select.value = '';
      agent2Select.value = '';
      updateAgentPreview(null, agent1Preview, agent1Select);
      updateAgentPreview(null, agent2Preview, agent2Select);
      checkComparisonState();
      Components.showToast('Comparison cleared.');
    });
  }

  loadCompare();
});
