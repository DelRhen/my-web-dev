/**
 * map-strategies.js - Curated Competitive Strategies Database
 * Covers ATTACK, DEFENSE, RETAKE, and POST-PLANT tactics for VALORANT maps.
 */
const MapStrategies = (() => {
  const curatedDatabase = {
    // ----------------------------------------------------
    // ASCENT
    // ----------------------------------------------------
    "Ascent": [
      // ATTACK
      {
        id: "ascent-att-a-standard",
        name: "A SITE STANDARD EXECUTE",
        category: "ATTACK",
        site: "A SITE",
        difficulty: "Beginner",
        description: "A synchronized assault down A Main with smokes isolating Heaven and Tree, paired with early recon utility to reveal site anchors.",
        objective: "Isolate defenders on site, close the Tree door, and establish a safe plant before Heaven reinforcements arrive.",
        recommendedRoles: ["Controller", "Initiator", "Duelist"],
        steps: [
          { stepNumber: 1, title: "STEP 01 — ESTABLISH A MAIN CONTROL", description: "Send an early drone or recon dart down A Main to clear aggressive defender pushes and trigger early utility.", callout: "A Main" },
          { stepNumber: 2, title: "STEP 02 — SMOKE HEAVEN & TREE", description: "Controller drops dual smokes blocking vision from A Heaven and Tree door entrance.", callout: "A Heaven" },
          { stepNumber: 3, title: "STEP 03 — DUAL ENTRY FLASH & DASH", description: "Initiator flashes high over A Main while Duelist entry dashes onto generator and clears rafters.", callout: "A Site" },
          { stepNumber: 4, title: "STEP 04 — LEVER CLOSE TREE & SPIKE PLANT", description: "Close the mechanical door toward Tree, clear Dice/Wine, and plant the Spike behind green boxes.", callout: "Tree" },
          { stepNumber: 5, title: "STEP 05 — POST-PLANT CROSSFIRE", description: "Hold crossfires from A Main and Wine with utility ready to stall defuse attempts.", callout: "A Lobby" }
        ],
        recommendedAgents: [
          { name: "Omen", role: "Controller", ability: "Dark Cover", explanation: "Deploys reliable hollow smokes for Heaven and Tree while retaining flash utility." },
          { name: "Sova", role: "Initiator", ability: "Recon Bolt", explanation: "High bounce dart from A Lobby tags back-site defenders and Dice campers." },
          { name: "Jett", role: "Duelist", ability: "Tailwind", explanation: "Explosive dash into smoke on site forces defenders in Rafters to turn." }
        ]
      },
      {
        id: "ascent-att-b-split",
        name: "B SITE MID SPLIT PUSH",
        category: "ATTACK",
        site: "B SITE",
        difficulty: "Intermediate",
        description: "Split the defense by taking Mid Courtyard and Marketplace while teammates push through B Main simultaneously.",
        objective: "Pincer B Site defenders from both Market and Main, cutting off Mid rotation paths.",
        recommendedRoles: ["Controller", "Initiator", "Duelist"],
        steps: [
          { stepNumber: 1, title: "STEP 01 — SMOKE MID BOTTOM & TILES RECON", description: "Smoke Mid Bottom/Arch to prevent defender AWP picks into Courtyard.", callout: "Mid Courtyard" },
          { stepNumber: 2, title: "STEP 02 — TAKE MID MARKET", description: "Flash into Market from Mid Pizza and break the Market door switch.", callout: "Mid Market" },
          { stepNumber: 3, title: "STEP 03 — PINCH B SITE", description: "Coordinate simultaneous entry from B Main and Market doors onto the site.", callout: "B Main" },
          { stepNumber: 4, title: "STEP 04 — CLEAR SHED & BACK SITE", description: "Use molly or stun on Boathouse/Back Site while planting safe behind default box.", callout: "B Site" },
          { stepNumber: 5, title: "STEP 05 — LOCKDOWN DEFUSE LANES", description: "Close B door and hold defensive angles from Market and B Main.", callout: "B Window" }
        ],
        recommendedAgents: [
          { name: "Fade", role: "Initiator", ability: "Haunt", explanation: "Reveals Mid Market and Courtyard before team commits through Mid." },
          { name: "Killjoy", role: "Sentinel", ability: "Lockdown", explanation: "Ultimate planted in B Main detains the entire site for an uncontested execute." },
          { name: "Raze", role: "Duelist", ability: "Paint Shells", explanation: "Clears Boathouse and logs corners without exposing teammates." }
        ]
      },
      // DEFENSE
      {
        id: "ascent-def-mid-control",
        name: "MID DOMINANCE & INFO TRAP",
        category: "DEFENSE",
        site: "MID",
        difficulty: "Intermediate",
        description: "Deny attackers quick access to Mid Courtyard using sniper cover and early utility to channel them into heavy crossfires.",
        objective: "Prevent attackers from splitting sites and gather early sound cues on team rotations.",
        recommendedRoles: ["Sentinel", "Initiator", "Duelist"],
        steps: [
          { stepNumber: 1, title: "STEP 01 — EARLY CATWALK FLASH", description: "Initiator flashes Catwalk from Mid Cubby to detect fast rushes from Top Mid.", callout: "Mid Catwalk" },
          { stepNumber: 2, title: "STEP 02 — BOTTOMLINK SNIPER HOLD", description: "Duelist or Chamber holds Mid Courtyard from Bottom Mid / Market with Operator.", callout: "Mid Market" },
          { stepNumber: 3, title: "STEP 03 — TRAP PLACEMENT ON B MAIN", description: "Sentinel places alarm or tripwire across B Main to detect flankers while holding Mid.", callout: "B Main" },
          { stepNumber: 4, title: "STEP 04 — ROTATION SIGNAL", description: "Call rotation early if attackers commit heavy numbers toward A Lobby.", callout: "Tree" }
        ],
        recommendedAgents: [
          { name: "Killjoy", role: "Sentinel", ability: "Turret", explanation: "Placed on Catwalk or Mid Cubby to monitor Mid Link continuously." },
          { name: "KAY/O", role: "Initiator", ability: "ZERO/point", explanation: "Suppresses attacking utility at Top Mid before they can throw smokes." },
          { name: "Jett", role: "Duelist", ability: "Updraft", explanation: "Gains off-angle sightlines over Mid boxes for early pickoffs." }
        ]
      },
      // RETAKE
      {
        id: "ascent-ret-a-coordinated",
        name: "A SITE DUAL PINCH RETAKE",
        category: "RETAKE",
        site: "A SITE",
        difficulty: "Advanced",
        description: "Reclaim A Site through coordinated utility from both Heaven and Tree door simultaneously.",
        objective: "Flush out attackers hiding behind Dice and Generator, and safely tap the defuse.",
        recommendedRoles: ["Controller", "Initiator", "Duelist"],
        steps: [
          { stepNumber: 1, title: "STEP 01 — SMOKE A MAIN CHOKE", description: "Drop smoke on A Main entrance to blind attackers holding post-plant angles.", callout: "A Main" },
          { stepNumber: 2, title: "STEP 02 — FLUSH GENERATOR & DICE", description: "Throw damaging utility behind Green Box and Generator from Heaven.", callout: "A Site" },
          { stepNumber: 3, title: "STEP 03 — SIMULTANEOUS TREE & HEAVEN FLOOD", description: "Tree players break the mechanical door while Heaven players drop to trade.", callout: "Tree" },
          { stepNumber: 4, title: "STEP 04 — HALF-DEFUSE BAIT", description: "First player taps defuse while teammates cover Wine and A Main flank.", callout: "A Site" }
        ],
        recommendedAgents: [
          { name: "Breach", role: "Initiator", ability: "Rolling Thunder", explanation: "Concusses the entirety of A Site from Heaven for an effortless sweep." },
          { name: "Brimstone", role: "Controller", ability: "Incendiary", explanation: "Clears Wine or behind Dice without having to peek." },
          { name: "Skye", role: "Initiator", ability: "Guiding Light", explanation: "Navigates blind spots from Tree into site to collect defuse info." }
        ]
      },
      // POST-PLANT
      {
        id: "ascent-post-b-delay",
        name: "B SITE UTILITY DELAY HOLD",
        category: "POST-PLANT",
        site: "B SITE",
        difficulty: "Beginner",
        description: "Post-plant lineup discipline from B Main to deny the defuser while holding Market flanks.",
        objective: "Burn out the 45-second Spike timer using molly lineups and flash stalls.",
        recommendedRoles: ["Initiator", "Controller", "Sentinel"],
        steps: [
          { stepNumber: 1, title: "STEP 01 — DEFAULT BOX PLANT", description: "Spike is planted on the outer edge of default box, visible clearly from B Main.", callout: "B Site" },
          { stepNumber: 2, title: "STEP 02 — FALL BACK TO B MAIN", description: "Planter and support player retreat safely into B Main corridor.", callout: "B Main" },
          { stepNumber: 3, title: "STEP 03 — LISTEN FOR SOUND CUE", description: "Wait for the auditory tap cue before launching delayed mollies or shock darts.", callout: "B Site" },
          { stepNumber: 4, title: "STEP 04 — JIGGLE PEAK TRADE", description: "Alternate peeks with teammates when defuser is forced off the Spike.", callout: "B Main" }
        ],
        recommendedAgents: [
          { name: "Sova", role: "Initiator", ability: "Shock Bolt", explanation: "Double shock dart lineup from B Main deals lethal damage to the defuser." },
          { name: "Viper", role: "Controller", ability: "Snake Bite", explanation: "Vulnerable status and corrosive pool halts defuses for 10+ seconds." },
          { name: "Cypher", role: "Sentinel", ability: "Spycam", explanation: "Monitors the Spike from deep safe positions without peeking." }
        ]
      }
    ],

    // ----------------------------------------------------
    // BIND
    // ----------------------------------------------------
    "Bind": [
      {
        id: "bind-att-b-hookah",
        name: "B SITE HOOKAH & LONG EXECUTE",
        category: "ATTACK",
        site: "B SITE",
        difficulty: "Beginner",
        description: "Pinch B Site through Hookah (B Window) and B Long with teleporter rotation threat.",
        objective: "Overwhelm B Site defenders from high and low ground, isolating Elbow and Back Site.",
        recommendedRoles: ["Controller", "Initiator", "Duelist"],
        steps: [
          { stepNumber: 1, title: "STEP 01 — HOOKAH CLEAR & TRAP TRIGGER", description: "Use boombot, flash, or grenade into Hookah before entering to clear shotgun campers.", callout: "B Window" },
          { stepNumber: 2, title: "STEP 02 — SMOKE ELBOW & CT BACKSITE", description: "Controller smokes B Hall/Elbow and CT spawn entrance to block rotation sightlines.", callout: "B Hall" },
          { stepNumber: 3, title: "STEP 03 — DROP HOOKAH & FLOOD LONG", description: "Drop from Hookah window simultaneously with teammates pushing garden and fountain.", callout: "B Site" },
          { stepNumber: 4, title: "STEP 04 — SECURE HOOKAH POST-PLANT", description: "Hold post-plant angles from B Window and Long with teleporter exit awareness.", callout: "B Window" }
        ],
        recommendedAgents: [
          { name: "Brimstone", role: "Controller", ability: "Sky Smoke", explanation: "Simultaneous 3 smokes completely cover B Elbow, CT, and Garden." },
          { name: "Raze", role: "Duelist", ability: "Paint Shells", explanation: "Unrivaled capability to clear Hookah corners without line of sight." },
          { name: "Fade", role: "Initiator", ability: "Seize", explanation: "Tethers defenders on B Site for instant combo utility." }
        ]
      },
      {
        id: "bind-def-tp-faker",
        name: "TELEPORTER ROTATION & AGGRESSION",
        category: "DEFENSE",
        site: "A SITE",
        difficulty: "Intermediate",
        description: "Utilize the one-way teleporter from A Short to B Long to flank attackers from behind.",
        objective: "Catch attackers off-guard by pinching them from their own spawn route.",
        recommendedRoles: ["Duelist", "Controller"],
        steps: [
          { stepNumber: 1, title: "STEP 01 — LISTEN TO SHOWER & SHORT CUES", description: "Anchor A Site and monitor A Short audio before committing utility.", callout: "A Short" },
          { stepNumber: 2, title: "STEP 02 — THROW TELEPORTER DUST", description: "Throw utility into TP to disguise player entry and clear exit corners.", callout: "Teleporter" },
          { stepNumber: 3, title: "STEP 03 — RAPID PINCH FROM BEHIND", description: "Exit teleporter into B Long and sweep backward toward attacker spawn.", callout: "B Long" }
        ],
        recommendedAgents: [
          { name: "Yoru", role: "Duelist", ability: "Gatecrash", explanation: "Teleports behind attackers while flashing teleporter exits." },
          { name: "Cypher", role: "Sentinel", ability: "Trapwire", explanation: "Holds A Showers silently while the team plays aggressive TP rotations." }
        ]
      }
    ],

    // ----------------------------------------------------
    // HAVEN (3 SITES)
    // ----------------------------------------------------
    "Haven": [
      {
        id: "haven-att-c-long-execute",
        name: "C SITE LONG OVERWHELM",
        category: "ATTACK",
        site: "C SITE",
        difficulty: "Beginner",
        description: "Exploit the extended sightline on C Long to overwhelm the isolated C anchor.",
        objective: "Take C Long control, smoke Garage and Back Site, and plant safe behind C Platform.",
        recommendedRoles: ["Controller", "Duelist", "Initiator"],
        steps: [
          { stepNumber: 1, title: "STEP 01 — C LONG SNIPER CHALLENGE", description: "Duelist jiggles or drones C Long to contest enemy Operator angles.", callout: "C Long" },
          { stepNumber: 2, title: "STEP 02 — SMOKE GARAGE CONNECTOR & CT", description: "Controller isolates C Link / Garage connector and CT Defender spawn.", callout: "C Link" },
          { stepNumber: 3, title: "STEP 03 — DUAL ENTRY ONTO C PLATFORM", description: "Flash high above site and push onto C Platform while clearing Logs.", callout: "C Site" },
          { stepNumber: 4, title: "STEP 04 — POST-PLANT ON C LONG", description: "Plant for C Long and retreat to hold defuse from distance.", callout: "C Long" }
        ],
        recommendedAgents: [
          { name: "Breach", role: "Initiator", ability: "Fault Line", explanation: "Stuns the entire C Long corridor from spawn, forcing anchors off angle." },
          { name: "Omen", role: "Controller", ability: "Dark Cover", explanation: "Blocks C Link and Defender spawn with long-range smokes." },
          { name: "Jett", role: "Duelist", ability: "Cloudburst", explanation: "Provides instant localized cover to cross C Long entrance." }
        ]
      },
      {
        id: "haven-def-garage-anchor",
        name: "GARAGE (C SHORT) FORTRESS",
        category: "DEFENSE",
        site: "MID",
        difficulty: "Intermediate",
        description: "Heavy anchor on Garage doors to protect both B Site and C Site rotations.",
        objective: "Prevent attackers from splitting into B or C through the central Garage choke.",
        recommendedRoles: ["Sentinel", "Controller"],
        steps: [
          { stepNumber: 1, title: "STEP 01 — FORTIFY GARAGE DOORS", description: "Place trapwire or slow orb at Garage double doors before round start.", callout: "Garage" },
          { stepNumber: 2, title: "STEP 02 — SMOKE GARAGE ENTRY", description: "Drop smoke on door frame to deny attackers vision into Garage window.", callout: "Garage" },
          { stepNumber: 3, title: "STEP 03 — CROSSFIRE WITH C LINK", description: "Coordinate with C Site player to trade whoever pushes past double doors.", callout: "C Link" }
        ],
        recommendedAgents: [
          { name: "Killjoy", role: "Sentinel", ability: "Nanoswarm", explanation: "Destroys attackers trapped at the double doors." },
          { name: "Sage", role: "Sentinel", ability: "Barrier Orb", explanation: "Completely seals Garage doors, forcing attackers onto external lanes." }
        ]
      }
    ],

    // ----------------------------------------------------
    // LOTUS (3 SITES)
    // ----------------------------------------------------
    "Lotus": [
      {
        id: "lotus-att-c-mound-push",
        name: "C SITE MOUND & WATER FLOOD",
        category: "ATTACK",
        site: "C SITE",
        difficulty: "Beginner",
        description: "Take control of C Mound and C Lobby to flood C Site through Waterfall and Main.",
        objective: "Secure C Site and utilize C Waterfall to cut off defender rotations.",
        recommendedRoles: ["Initiator", "Controller", "Duelist"],
        steps: [
          { stepNumber: 1, title: "STEP 01 — SECURE C MOUND", description: "Clear C Mound with recon dart or flash to deny early defender aggression.", callout: "C Mound" },
          { stepNumber: 2, title: "STEP 02 — SMOKE CT ROTATION & WATERFALL", description: "Drop smokes on CT connector and Waterfall back-site to isolate the point.", callout: "C Site" },
          { stepNumber: 3, title: "STEP 04 — PLANT ON C FRONT", description: "Plant on front edge where team can defend from C Mound and Main.", callout: "C Site" }
        ],
        recommendedAgents: [
          { name: "Fade", role: "Initiator", ability: "Haunt", explanation: "Throws eye atop C Mound to reveal all defenders holding site boxes." },
          { name: "Omen", role: "Controller", ability: "Paranoia", explanation: "Blinds both front and back site players simultaneously." }
        ]
      }
    ]
  };

  /**
   * Dynamic fallback strategy generator for maps not explicitly listed above
   * (e.g. Split, Icebox, Breeze, Sunset, Abyss, etc.)
   */
  const generateDynamicStrategies = (map) => {
    const isThreeSites = (map.tacticalDescription || '').toLowerCase().includes('c') || (map.displayName || '').toLowerCase() === 'haven' || (map.displayName || '').toLowerCase() === 'lotus';
    const sites = isThreeSites ? ['A SITE', 'B SITE', 'C SITE'] : ['A SITE', 'B SITE'];

    const strategies = [];

    // 1. ATTACK STRATEGIES
    sites.forEach((siteName) => {
      const siteLetter = siteName.charAt(0);
      strategies.push({
        id: `${map.uuid}-att-${siteLetter.toLowerCase()}-exec`,
        name: `${siteName} STANDARD EXECUTE`,
        category: "ATTACK",
        site: siteName,
        difficulty: "Beginner",
        description: `Coordinated assault toward ${siteName} on ${map.displayName}. Uses dual supporting smokes to isolate the bomb site and secure early map control.`,
        objective: `Isolate ${siteName} anchors, establish defensive crossfires, and plant the Spike safely before rotations arrive.`,
        recommendedRoles: ["Controller", "Initiator", "Duelist"],
        steps: [
          { stepNumber: 1, title: "STEP 01 — GATHER INTEL & RECON", description: `Launch early recon utility down ${siteLetter} Main to detect defender positioning and clear shotguns.`, callout: `${siteLetter} Main` },
          { stepNumber: 2, title: "STEP 02 — ISOLATE ROTATION CHOKES", description: `Controller deploys smokes on primary defender rotation links and high-ground sightlines into ${siteName}.`, callout: `${siteName}` },
          { stepNumber: 3, title: "STEP 03 — COHORTS FLASH & ENTRY", description: `Initiator flashes over chokepoints while Duelist entries to create space on ${siteName}.`, callout: `${siteName}` },
          { stepNumber: 4, title: "STEP 04 — PLANT & SECURE POST-PLANT", description: `Secure a protected Spike plant location and transition to post-plant holding positions.`, callout: `${siteLetter} Main` }
        ],
        recommendedAgents: [
          { name: "Omen", role: "Controller", ability: "Dark Cover", explanation: "Flexible long-range hollow smokes to block primary defender lanes." },
          { name: "Sova", role: "Initiator", ability: "Recon Bolt", explanation: "Scans deep into the site to reveal defenders before entry." },
          { name: "Jett", role: "Duelist", ability: "Tailwind", explanation: "Fast entry dash disrupts enemy crosshair placement on the main choke." }
        ]
      });
    });

    // 2. DEFENSE STRATEGIES
    sites.forEach((siteName) => {
      const siteLetter = siteName.charAt(0);
      strategies.push({
        id: `${map.uuid}-def-${siteLetter.toLowerCase()}-anchor`,
        name: `${siteName} ANCHOR & CROSSFIRE SETUP`,
        category: "DEFENSE",
        site: siteName,
        difficulty: "Intermediate",
        description: `Defensive anchor discipline on ${siteName}. Stalls attacker execution with defensive utility and holds trade angles.`,
        objective: `Delay the initial assault by at least 15-20 seconds to allow teammates to rotate through Mid and Spawn.`,
        recommendedRoles: ["Sentinel", "Controller"],
        steps: [
          { stepNumber: 1, title: "STEP 01 — SET CHOKEPOINT TRAPS", description: `Place defensive traps or tripwires at ${siteLetter} entrance chokepoint before barrier drop.`, callout: `${siteLetter} Main` },
          { stepNumber: 2, title: "STEP 02 — EARLY INFORMATION CALLOUT", description: `Signal footsteps or utility deployment immediately over team comms to trigger rotations.`, callout: `${siteName}` },
          { stepNumber: 3, title: "STEP 03 — CROSSFIRE STALL", description: `Deploy slowing or damaging utility on the entrance choke to break attacker momentum.`, callout: `${siteName}` }
        ],
        recommendedAgents: [
          { name: "Killjoy", role: "Sentinel", ability: "Turret", explanation: "Provides non-peek information on attacker entry commits." },
          { name: "Cypher", role: "Sentinel", ability: "Trapwire", explanation: "Halts aggressive duelists dead in their tracks at chokepoints." }
        ]
      });
    });

    // 3. RETAKE STRATEGIES
    sites.forEach((siteName) => {
      const siteLetter = siteName.charAt(0);
      strategies.push({
        id: `${map.uuid}-ret-${siteLetter.toLowerCase()}-flood`,
        name: `${siteName} COORDINATED RETAKE`,
        category: "RETAKE",
        site: siteName,
        difficulty: "Advanced",
        description: `Grouped retake coordination reclaiming ${siteName} on ${map.displayName} using combo utility and simultaneous entry paths.`,
        objective: `Clear post-plant attackers from hiding spots and defuse before the timer expires.`,
        recommendedRoles: ["Initiator", "Controller", "Duelist"],
        steps: [
          { stepNumber: 1, title: "STEP 01 — GROUP OUTSIDE SITE", description: `Wait for teammates to arrive so you can enter together rather than peeking one by one.`, callout: "Defender Spawn" },
          { stepNumber: 2, title: "STEP 02 — SMOKE ATTACKER POST-PLANT LANES", description: `Smoke the main entrances attackers are holding from to deny their long sightlines.`, callout: `${siteLetter} Main` },
          { stepNumber: 3, title: "STEP 03 — FLASH & SWEEP SITE", description: `Pop flash into site corners, trade teammates, and begin half-defuse.`, callout: `${siteName}` }
        ],
        recommendedAgents: [
          { name: "Breach", role: "Initiator", ability: "Rolling Thunder", explanation: "Stuns all post-plant defenders across the entire site." },
          { name: "Fade", role: "Initiator", ability: "Nightfall", explanation: "Deafens and decays attackers so your team can sweep in with sound advantage." }
        ]
      });
    });

    // 4. POST-PLANT STRATEGIES
    sites.forEach((siteName) => {
      const siteLetter = siteName.charAt(0);
      strategies.push({
        id: `${map.uuid}-post-${siteLetter.toLowerCase()}-delay`,
        name: `${siteName} DELAY & CROSSFIRE HOLD`,
        category: "POST-PLANT",
        site: siteName,
        difficulty: "Beginner",
        description: `Post-plant defensive formation protecting the Spike on ${siteName} by playing time and denying defusal attempts.`,
        objective: `Prevent retakers from tapping the Spike for 45 seconds using crossfires and delayed utility.`,
        recommendedRoles: ["Initiator", "Controller", "Sentinel"],
        steps: [
          { stepNumber: 1, title: "STEP 01 — OPEN SPIKE PLANT", description: `Plant the Spike where it is visible from the primary attacker retreat routes.`, callout: `${siteName}` },
          { stepNumber: 2, title: "STEP 02 — FALL BACK TO DEFENSIVE COVERS", description: `Hold positions with safe cover instead of hunting for exit kills.`, callout: `${siteLetter} Main` },
          { stepNumber: 3, title: "STEP 03 — TIME-WASTING UTILITY", description: `Use mollies, slow orbs, or blind utility only after hearing the defuse sound cue.`, callout: `${siteName}` }
        ],
        recommendedAgents: [
          { name: "Viper", role: "Controller", ability: "Snake Bite", explanation: "Prevents defusing for up to 11 seconds with well-timed poison pools." },
          { name: "Brimstone", role: "Controller", ability: "Incendiary", explanation: "Long-duration molly to burn out the defuse timer." }
        ]
      });
    });

    return strategies;
  };

  return {
    /**
     * Get all strategies for a specific map
     */
    getStrategiesForMap(map) {
      if (!map) return [];
      const mapName = map.displayName || "";
      if (curatedDatabase[mapName]) {
        return curatedDatabase[mapName];
      }
      return generateDynamicStrategies(map);
    },

    /**
     * Get single strategy by ID
     */
    getStrategyById(map, strategyId) {
      const all = this.getStrategiesForMap(map);
      return all.find(s => s.id === strategyId) || null;
    }
  };
})();
