# Wizard With a Gun — Project Handoff

> Last updated: 2026-08-12  
> Purpose: Give a new Codex chat enough verified context to continue designing, implementing, balancing, and testing the game without reconstructing the full conversation.

## Quick Start for a New Chat

The playable game is a self-contained browser prototype:

- Main game: `index.html`
- Absolute path: `/Users/djfreeman/Documents/Codex/2026-08-10/le/outputs/wizard_with_a_gun/index.html`
- Open it directly in a modern desktop or mobile browser. No server, build process, package installation, or external assets are required.
- The entire game currently lives in this one HTML file: markup, CSS, JavaScript, procedural pixel art, audio, fixtures, and focused assertions.
- Desktop keyboard/mouse and mobile touch are supported. On phones and touch tablets, the live arena uses a compact HUD, an etched movement seal, touch card dragging, and dedicated stance/reload hardware.

When continuing work, distinguish carefully between:

- **Implemented**: present in `index.html` now.
- **Needs iteration**: present, but the user has identified a design or balance problem.
- **Planned / next**: requested direction that has not been implemented yet.
- **Saved for later**: deliberately deferred idea; do not silently treat it as implemented.
- **Fixed / historical**: an earlier problem that has already been addressed and should not be reintroduced.

## High-Level Game Vision

An 8/16-bit action roguelite about a spellcasting outlaw. The player is a Wizard who moves through a finite occult frontier, draws quick sigils directly onto the battlefield, drags slower and more expensive spell cards from a hand, and pulls a revolver only when necessary.

The important fantasy is not simply “wizard plus gun.” Magic should reward deliberate spell rhythms, shapes, targeting, and build choices. The gun is a mutually exclusive fallback stance, not an extra attack layered on top of casting.

Each class now reinterprets mana differently. Wizard, Hexslinger, and Debtmancer are playable.

## Additional Classes — Implemented

- **Hexslinger · Spellshot:** 80 mana, a seven-round cylinder, faster reload and movement. Every non-neutral spell loads two Hex Rounds (up to six). Hex Rounds deal +40% revolver damage and restore 2 mana when they hit.
- **Debtmancer · Blood Ledger:** 125 health and 75 mana. When mana is insufficient, spell costs consume health down to a 15 HP floor. Missing mana grants up to +28% spell power; every 15 kill credits restore 4 mana and 2 health (plus Debt Collector ranks). Each one-second burst awards 1/√kill-number credit per kill; summoned enemies earn none. Fractional progress carries forward and resets each run.
- Both classes have dedicated resource-instrument readouts and class-aware level-up pools; Wizard-only Harmony sockets and Overcasting rewards are excluded from their drafts.

## Additional Spells — Implemented

Large spell cards added:

- **Arc Burst (Energy):** ten outward sparks, with extra sparks from its signature skill.
- **Witch Mire (Earth):** persistent slowing damage field.
- **Prism Covenant (Ward):** raises a shield and shatters into a damaging ward pulse.
- **Reaping Moon (Bone):** broad forward crescent made from overlapping damage lanes.

Drawn sigils added:

- **Storm Scrawl (Lightning):** a zigzag gesture that creates a short lightning chain.
- **Grave Hook (Hook):** an open hooked gesture that pulls enemies into a bone burst.

## Core Controls and Combat Rules — Implemented

- `WASD` or arrow keys: move.
- Touch: hold and slide the lower-left etched movement seal. It works simultaneously with a second finger used for aiming, sigil drawing, or card casting.
- Normal left-button drawing: draw a sigil while magic-ready.
- Touching and tracing on the arena draws a sigil while magic-ready. The drawing pointer is tracked independently, so lifting another finger cannot prematurely finish the sigil.
- Drag a spell card into the arena: aim/channel and cast a large spell.
- Spell cards can also be dragged by touch; the mobile hand stays compact and readable without hover.
- Dragging a spell card slows the world.
- Right click: draw or holster the revolver.
- Touch: tap the lower-right `GUN` / `HOLSTER` hardware to change stance.
- The revolver starts **holstered**.
- While the revolver is drawn:
  - left click fires;
  - `R` reloads;
  - touching the arena aims and fires;
  - the lower-right `RELOAD` hardware reloads;
  - all cards and sigils are locked.
- While the revolver is holstered:
  - spell cards and drawn sigils are available;
  - left click does not fire the gun.
- Taking damage creates a brief hit-stop/slowdown effect. It does not drain mana.
- Enemies can drop ammunition, small mana dots, and XP.

## Run Structure — Implemented

1. Select Wizard, Hexslinger, or Debtmancer; each has a distinct resource/combat loop.
2. Choose starting spell cards from the currently unlocked collection.
3. Choose three starting drawn sigils from the currently unlocked collection.
4. Review the loadout and enter the arena.
5. Kill enemies, collect XP, and fill the XP bar.
6. On level-up, choose one of three rewards.
7. Continue until death, then retry the loadout or return to loadout selection.

### Card ownership and loadout

- A player can own more spell cards than they can equip.
- Starting maximum equipped large spells: **2**.
- The Wizard's Arcane Bandolier skill can add up to three more large-spell slots.
- Learning a fourth large spell does not silently replace an equipped spell.
- When the bandolier is full, the player chooses which card to replace or keeps the new card owned for later.
- The earlier crash involving a newly unlocked spell after death/loadout switching has been fixed through card-state sanitization.

## Wizard Class Feature: Harmony — Implemented

**Harmony** is the Wizard's primary class mechanic. It is one signed scale:

- `+4` to `+1`: **Resonance**, positive spell flow.
- `0`: neutral; no spell cost, power, or regeneration modifiers.
- `−1` to `−4`: **Stagnation**, poor or repetitive spell flow.

The source of truth is `manaModel.harmony`, clamped from `−4` to `+4`.

### Current numeric effects

At each positive Resonance tier, non-basic spells receive approximately:

- Mana cost: `−2.5%` per tier.
- Spell power: `+4%` per tier.
- Mana regeneration: `+10%` per tier.

At each negative Stagnation tier, non-basic spells receive approximately:

- Mana cost: `+4%` per tier.
- Spell power: `−2%` per tier.
- Mana regeneration: `−12%` per tier.

After roughly eight seconds without a non-basic spell cast, Harmony eases one step toward zero. The separate idle mana-regeneration ramp still exists.

### Magic Missile exception

Magic Missile is the basic cast and is completely Harmony-neutral:

- It does not enter or alter the school sequence.
- Its mana cost is not modified by Resonance or Stagnation.
- Its power is not modified by Resonance or Stagnation.

### Rune sockets and school patterns

- Runs start with **1 Harmony socket**.
- Level-up rewards can unlock up to **5 sockets**.
- The game stores up to six recent non-basic spell schools so it can recognize patterns longer than the visible socket count.
- Current schools/meta include neutral, fire, frost, energy/storm, void, ward, earth, and bone. Not every school has a complete set of abilities yet.

Current pattern behavior:

- First non-basic school: establishes context and leaves Harmony at 0.
- With one socket:
  - repeat the same school: move one tier toward Stagnation;
  - switch school: move one tier toward Resonance.
- With two sockets, retained `A → B → A` triggers **Short Reflection** and raises Resonance.
- Recognized positive patterns include `ABA`, `ABAB`, `ABBA`, `ABCBA`, and retained-history `ABCABC` as the needed sockets unlock.
- Repeating the same school (`AAAA`, `BBBB`, or the shorter available equivalent) pushes toward Stagnation.
- Pattern completion gives named combat feedback such as Alternating, Reflection, Long Cycle, or Repetition.

### Harmony HUD

The Harmony instrument is intertwined with the full-height right-side mana vessel:

- Fixed etched zero at the center.
- Luminous capillary/needle rises for Resonance and sinks for Stagnation.
- Explicit signed state and cost/power/regen modifiers.
- School-colored recent-rune sockets plus sealed future notches.
- Resonance makes mana brighter and faster-flowing; maximum Resonance opens a bright crown.
- Stagnation dims/grays the mana, slows its motion, and adds lower-vessel sediment.
- Mana spending produces a brief arc leaving the vessel.
- Hovering/focusing the instrument opens a teaching tooltip.
- Responsive minimap/Harmony geometry is shared so these HUD elements do not overlap at supported desktop widths.

## Mana and Overcasting — Implemented

- Base mana regeneration is deliberately slower than in early versions.
- If the player leaves mana unused, regeneration ramps from `1×` to approximately `2.3×` over time.
- Resonance or Stagnation then modifies that regeneration multiplier.
- Enemy mana dots currently restore a small flat amount of generic mana.
- Slow motion while dragging a card drains **7 mana per second**.
- Overcasting is an early level-up unlock, not available automatically at the beginning.
- After roughly `0.65s` of channeling with Overcasting unlocked, it adds another **6 mana per second** while it builds, for **13 mana per second total** during that phase.
- Overcasting can add up to roughly `+45%` card power.
- The base spell cost is reserved while channeling. Slowdown/overcast drain cannot consume that reserved amount, so the cast remains payable on release.
- Overcasting and slowdown therefore are not two accidental duplicate charges: the 7/s is channel slowdown, and the additional 6/s is the Overcasting power feed.

## Spell Cards — Implemented

Current cards in the full collection:

| Card | School | Base mana | Cooldown | Current function |
|---|---:|---:|---:|---|
| Meteor Crown | Fire | 38 | 9s | Aimed delayed cluster of meteor impacts. |
| Gravity Well | Void | 32 | 8s | Persistent pull and damage field. |
| Chain Lightning | Storm | 27 | 5.5s | Timed, visible lightning chain with growing hop damage. |
| Frost Nova | Frost | 25 | 6s | Local freezing shock ring. |
| Thorn Ward | Ward | 29 | 8s | Orbiting barbed defensive effect. |
| Cinder Familiar | Fire | 34 | 10s | Temporary familiar that fires embers. |
| Void Step | Void | 22 | 5s | Blink with a damaging void echo at origin. |
| Bone Bell | Bone | 31 | 8.5s | Delayed radial curse/burst. |
| Arc Burst | Energy | 26 | 6.5s | Ten outward sparks. |
| Witch Mire | Earth | 30 | 8s | Persistent slowing damage field. |
| Prism Covenant | Ward | 33 | 9s | Shield plus an immediate damaging ward pulse. |
| Reaping Moon | Bone | 28 | 7s | Broad forward crescent of overlapping damage lanes. |

Starting unlocked cards are Meteor Crown, Gravity Well, Chain Lightning, and Frost Nova. The starting equipped hand is Meteor and Chain Lightning, but the setup screen lets the player select from unlocked cards.

### Card hand presentation

- Cards are arranged as a compact fanned hand near the bottom of the screen.
- Far/not hovered: cards shrink, fade, overlap, and sit partially low as if held in hand.
- Near/hovered: the hand rises and expands.
- Active card: grows to readable full size.
- The hand uses a short proximity hysteresis so it does not flicker between states.

### Meteor targeting

- Meteor is genuinely draggable and aimed in world space.
- It has a full-size pointer-following ghost, range tether, impact-radius preview, and a 600px maximum targeting range.
- Releasing over HUD, including the minimap, meters, and card hand, casts at the arena position underneath. Releasing outside the arena cancels and refunds the channel.
- Camera movement and world coordinates are accounted for.

### Chain Lightning balance

- Base damage: `44`.
- Base unique hits: `8`.
- `+2` hits per card level.
- Up to `+5` more hits from Overcasting.
- Hard cap: `15` hits.
- Base hop range: `260px`.
- `+18px` hop range per card level.
- Up to `+70px` hop range from Overcasting.
- Damage grows by `+6%` per successive hop, capped at `+30%`.
- Applies approximately `0.65s` shock slow.
- Hops occur visibly over time and can continue beyond the original cast radius if each new target is within hop range.

## Drawn Sigils — Implemented

Current sigils:

| Sigil | Gesture label | School | Base mana | Cooldown | Current function |
|---|---|---:|---:|---:|---|
| Magic Missile | Line | Neutral | 11 | 0.8s | Aimed bolt with gentle target seeking. |
| Frost Ring | Circle | Frost | 16 | 1.4s | Freezing radial damage near the caster. |
| Flame Triad | Triangle | Fire | 15 | 1.2s | Three fire lanes separated by 120 degrees. |
| Aegis Box | Square | Ward | 17 | 2.2s | Temporary damage-reducing ward. |
| Astral Stars | Star | Energy | 22 | 2.6s | Eight radial projectiles. |
| Ember Fan | V / zigzag | Fire | 13 | 1s | Three forward flame lanes in a narrow fan. |
| Vortex | Spiral | Void | 20 | 2s | A forward-offset local pull/damage burst. |
| Mend Cross | Cross | Ward | 18 | 4s | Small heal and radiant radial damage. |
| Storm Scrawl | Lightning | Storm | 14 | 1.3s | Short jumping lightning chain. |
| Grave Hook | Hook | Bone | 15 | 1.8s | Pulls enemies into a bone burst. |

Starting unlocked sigils are Magic Missile, Frost Ring, Flame Triad, Aegis Box, and Ember Fan. Three are selected for a run.

## Revolver — Implemented

- Starts holstered and at a full cylinder.
- Right click toggles gun stance.
- Gun stance locks all magic.
- Left click fires toward the mouse.
- Base damage: `33` (`36` for Hexslinger).
- Base cylinder: `6` rounds.
- Base reload time: `1.3s`.
- Enemies can drop bullets; ammunition upgrades and reload upgrades exist.
- There is currently no default Harmony/Stagnation scaling on the gun.

## Enemies and Encounter Director — Implemented

The finite map is `3600 × 2400`, substantially larger than the viewport but not infinite. It includes camera movement, procedural detail/landmarks, boundaries, and a minimap.

Current enemy roles:

| Enemy | Main behavior |
|---|---|
| Husk | Basic direct melee pursuit. |
| Cinder Imp | Curving/orbiting approach, telegraphed pounce, and retreat cycle. |
| Gravehorn | Steered approach followed by a telegraphed high-speed charge and recovery. |
| Hex Wisp | Maintains orbiting range and fires paired curving bolts. |
| Bone Slinger | Maintains long range, strafes, winds up, and fires bone needles. |
| Bell Witch | Uses other enemies as a screen, buffs nearby enemies, summons limited Husks, and fires/arms a growing hex orb. |

Enemies spawn under role caps and timed/level gates. Encounter packages create mixed formations such as Horn screens, Wisp flanks, crossfire, and Witch courts. Separation steering prevents enemies from occupying exactly the same space.

### Loot

- XP shards always drop according to enemy role value.
- Ammo has a chance to drop, with an increased chance from Bone Slingers.
- Generic mana dots have a chance to drop, with an increased chance from Hex Wisps.
- Summoned enemies do not drop loot.

## Experience and Level-Up Rewards — Implemented

- XP pickups fill the top XP bar.
- Level-up presents exactly three choices.
- Exactly **one** choice is explicitly favored toward the player's primary playstyle that run: card, sigil, or gun.
- The other two are broadly weighted open choices. They may match the playstyle, but are not forced to.
- The favored-category bias in open choices is capped at `1.5×`.
- Zero-use ties rotate Card → Sigil → Gun by level rather than always defaulting to gun.
- Low HP increases survival reward weighting; low mana increases resource reward weighting.
- Early Overcasting is guaranteed while still unlearned, but does not create a second forced favored label.

Current reward types include:

- Upgrade all equipped cards.
- Upgrade all equipped sigils.
- Ability-specific mastery for an equipped card or sigil.
- Maximum HP.
- Maximum mana.
- Heal.
- Refill mana.
- Mana regeneration.
- Gun damage.
- Cylinder capacity.
- Reload speed.
- Pickup magnet range.
- Move speed.
- Unlock Overcasting.
- Unlock another Harmony socket.
- Unlock a new spell card.
- Discover a new sigil.

## HUD and Presentation — Implemented

- 8/16-bit occult-western visual direction inspired in part by *The Magus Circle*, without directly copying assets.
- Full-height Health vessel on the left and Mana/Harmony vessel on the right.
- Both animate on gain/loss; mana visibly changes with Harmony.
- XP, level, revolver stance, ammunition, score, and threat are shown in the top HUD.
- Equipped sigil legend sits in the arena.
- Finite-world minimap avoids the Harmony rig at responsive desktop widths.
- Card hand is deliberately faded/collapsed until approached.
- At phone and coarse-pointer widths, the side vessels, Harmony rig, legend, threat label, brand, and minimap are suppressed in favor of HP, mana, XP/level, ammo, help, mute, and stance/reload controls. The setup and decision overlays scroll safely, use larger touch targets, and adapt to short landscape screens.
- The mobile movement instrument is an etched brass occult compass whose cyan center rune follows the thumb.
- Procedural audio and all art are embedded; there are no external dependencies.

## Items Currently Being Worked On

There is no partially applied code change or active implementation task at the time of this handoff. The latest completed work is the signed Harmony system and intertwined vessel UI. It passed independent evaluation after responsive HUD and two-socket progression fixes.

The next chat should treat the following as the **active design iteration queue**, because these are systems the user has recently identified as needing more work:

### 1. Make Harmony create builds, not only modifiers

Status: **implemented foundation; needs expansion**.

Harmony now has clear patterns, readable visuals, and meaningful numeric effects, but it is still mostly a signed cost/power/regen modifier. The next meaningful step is adding level-up synergies and build branches that transform what patterns do.

Important constraint: completed school patterns should not automatically grant every combination effect. These should be **synergy upgrades acquired on level-up**.

### 2. Stagnation gun build

Status: **planned, not implemented**.

The user wants a Wizard build where the revolver becomes stronger as Stagnation increases. The code exposes signed Harmony and `stagnationTier()` helpers, but the gun currently receives no free Stagnation benefit. Design this through acquired upgrades so ordinary Stagnation remains a tradeoff rather than automatically being optimal.

Questions to solve later:

- Does Stagnation increase raw gun damage, reload speed, bullet effects, or “stored spell sludge” shots?
- Does drawing the gun freeze Harmony, accelerate centering, or consume Stagnation?
- How does the build preserve the stance rule that gun and magic cannot be used simultaneously?

### 3. Flame Triad and Ember Fan aiming

Status: **currently functional but still needs a substantial targeting redesign**.

The user reported that both are difficult to aim and hit with.

Saved intended Ember Fan direction:

- Change its gesture to a semicircle/arc.
- The arc's facing/bulging direction defines aim.
- Fire a visibly broad fan of flames in that direction, consistent with the name.
- Consider 7–9 flames across roughly a 70-degree cone rather than the current three narrow lanes.
- Show the projected cone while drawing and use moderate aim assistance within it.

Saved intended Flame Triad direction:

- Use the triangle's sharpest/dominant point as forward intent.
- Fire three bolts or lanes forward around that direction rather than three attacks spaced 120 degrees around the entire player.
- Add clearer preview and forgiving hit widths.

### 4. Horde pressure and long-run population control

Status: **partially improved; needs playtesting and systemic tuning**.

Enemy role caps, separation, encounter packages, ranged enemies, and different movement patterns reduce the old homogeneous swarm. However, the user specifically asked how to prevent a horde from inevitably building up over time.

Potential next work:

- Dynamic spawn budget based on living threat value rather than only time/role caps.
- Reduce or pause spawning when the active threat budget is full.
- Despawn/retreat distant stale enemies safely rather than letting them accumulate forever.
- Add short encounter breaks, extraction shrines, roaming packs, or wave completion states.
- Ensure damage/area-control progression keeps pace with enemy durability and count.
- Profile actual late-run enemy count, time-to-kill, and frame time before choosing exact numbers.

### 5. More detail and content depth

Status: **ongoing art/content direction**.

The user asked to “add some more detail to everything.” Several detail passes have occurred, but this remains a broad ongoing goal:

- More map landmarks and environmental storytelling.
- More spell-specific animation and impact identity.
- More enemy telegraph and death detail.
- More readable school identity in cards, sigils, particles, and rewards.
- More spell and enemy variation without sacrificing clarity.

## Needs to Be Worked On / Known Design Debt

These are not necessarily bugs, but are the clearest known gaps between the current prototype and the intended game.

### Progression persistence and skill tree

Status: **implemented foundation; needs balance and expansion**.

- XP collected from enemy drops both fills the current run's level bar and enters a persistent bank stored in `localStorage`; the skill tree spends this bank directly.
- Upgrade prices scale globally across every tree: the next rank costs `30 + (10 × all purchased ranks)` XP, counting class, large-spell, and sigil ranks together.
- Existing saves automatically convert unspent Arcana to banked XP at 30 XP per Arcana.
- Double-click the Wizard, an owned large-spell card, or an unlocked sigil during outfitting to open its spatial constellation tree. Drag empty parchment to pan; use the footer controls or mouse wheel to zoom, and Recenter to frame the currently revealed graph.
- Skill nodes progressively materialize: roots begin visible, while descendants and their ley-line connectors appear only after an immediate prerequisite has a purchased rank. Connector color distinguishes dormant, purchasable, and completed paths.
- The Wizard tree includes Overchanneling/Overcasting, additional Harmony sockets, Arcane Bandolier spell slots, three mutually exclusive Resonance doctrines, and a Stagnation gun branch.
- Only one Resonance doctrine is active for a run: Crescendo (power), Quickflow (cooldowns), Deep Current (mana cost), or no doctrine. Permanently owning ranks in multiple doctrines does not stack them; unlocked doctrine nodes contain their own run-activation control and the graph footer can clear the active path.
- Every large spell and sigil has persistent Potency, Quickening, and spell-specific signature ranks.
- Magic Missile has a deeper tree with Arcane Volley (additional missiles), Witchseeker homing, and Phantom Round piercing.
- Starting selections remain limited to currently owned cards and unlocked sigils. A broader long-term unlock economy still needs design.

### More classes

Status: **not implemented; Wizard only**.

Future class identities discussed:

- A **Wild Mana** class/build whose center idea is unstable or transformed mana.
- An **Arcane Debt** class/build where casting can borrow against future mana or create repayment pressure.
- The setup UI currently uses placeholder locked names `Hexslinger` and `Debtmancer`; these names and designs are not final commitments.
- Do not move Overcasting out of Wizard without revisiting the user's explicit statement that it should unlock fairly early in the Wizard skill tree.

### Mana depth beyond Harmony

Status: **Harmony pass implemented; more depth intentionally open**.

The user felt mana was one-dimensional. Harmony now adds sequencing and quality, but future additions should complement it rather than adding another generic currency.

Possible directions:

- Pattern-specific Overcasting transformations.
- School synergy upgrades.
- Builds that deliberately use or consume Resonance/Stagnation.
- Timing windows, Crescendo payoffs, or ways to “bank” a completed cadence.
- More interesting mana-dot interactions later.

### Spell recognition and aiming

Status: **working heuristic, not production-grade recognizer**.

- The recognizer uses geometry such as closure, corners, turning, path directness, and intersections.
- Shapes can still be misrecognized depending on drawing style.
- “Rune broken” on right click was historical feedback meaning a right-click stance change canceled an in-progress rune. Current behavior clears drawing cleanly, but cancel feedback/wording may still be revisited.
- Direction calculation is improved compared with early versions, but Ember Fan and Flame Triad remain the strongest known aiming problems.

### Card-specific targeting consistency

Status: **Meteor is strong; other large spells are mostly local**.

- Meteor has full world-target drag behavior.
- Other cards currently preview and activate around the player unless their effect inherently moves/blinks.
- Decide per spell whether it should be aimed, centered on the caster, directional, or placement-based. Avoid one universal targeting model if it hurts spell identity.

### Balance and onboarding

- Chain Lightning received a major buff, but should be tested in real progression rather than assumed final.
- Harmony's modifier values and pattern deltas are first-pass balance.
- Two-socket Short Reflection uses retained `A→B→A` even though only two recent sockets render; the tooltip explains this, but onboarding should be watched.
- The first level-up is gated until enough run time has elapsed to teach the combat loop.
- Reward descriptions are functional but will need more build-specific language as synergies grow.
- Mobile/touch play is not implemented.

### Architecture

- The one-file format is convenient for the prototype but increasingly difficult to maintain.
- Before adding many classes, a skill tree, persistence, and many more spells, consider splitting data, systems, rendering, UI, and tests into modules.
- If splitting files, preserve a simple local way to run the game and update this handoff.

## Saved for Later Ideas — Not Implemented

### Elemental Attunement mana droplets

The user explicitly said **“maybe later.”**

Instead of every mana dot being identical, enemy drops could eventually have school attunements, for example:

- Ember mote.
- Storm/Energy mote.
- Frost/Water mote.
- Void mote.
- Later Ward, Earth, Bone, and other school motes.

Do not implement this as another generic colored currency without first deciding what attunement changes: next spell, Harmony pattern, Overcast transformation, temporary school affinity, or synergy trigger.

### Level-up school synergy upgrades

These are saved concepts and extension hooks exist (`HARMONY_SYNERGIES`), but combat effects are not implemented:

- Fire + Storm/Energy: burning lightning jumps.
- Frost + Void: frozen enemies implode inward.
- Ward + Fire: shield retaliation.
- Storm/Energy + Frost: lightning conducts farther through slowed enemies.

These should be upgrades the player chooses on level-up. They should ideally be offered when relevant schools are equipped/used, while preserving the rule that only one reward is always forced toward playstyle.

### Additional schools

Current and anticipated school vocabulary includes:

- Fire.
- Water/Ice/Frost.
- Energy/Storm/Lightning.
- Void.
- Ward.
- Earth.
- Bone.
- Additional schools can be added later.

School terminology should eventually be normalized. The current code supports both `storm` and `energy` as closely related entries; decide whether Storm is a school under Energy, a separate school, or simply the name used by lightning spells.

### Advanced Harmony visual/payoff ideas

Some of these have partial visual foundations, but their full gameplay payoff is saved for later:

- Colored school bands spiraling through the mana vessel on completed patterns.
- Runes visibly sticking or sinking during Stagnation.
- Near-Crescendo rhythmic vessel pulses.
- Perfect Resonance opening/cracking a brighter crown.
- A temporary “Crescendo” payoff or banked pattern release.
- Mana cost visibly traveling from the vessel toward the caster/spell in a more elaborate form.

### Gun/Stagnation upgrade concepts

- More gun damage at deeper Stagnation.
- Stagnant bullets that carry gray mana sludge or school residue.
- Spending/venting Stagnation through a reload, fan-fire, or empowered last round.
- A reason to intentionally build `AAAA` repetition before switching to the gun.
- These must be acquired build upgrades, not default behavior.

### More spells and spell-shape language

The user wants many more spells using triangles, squares, stars, sigils, arcs, circles, and other shapes. New spells should emphasize differences in gesture, targeting, cadence school, cast time, mana cost, cooldown, and combat role rather than just reskinning radial damage.

## Fixed / Historical Issues

Keep this section so future chats do not repeatedly “fix” already resolved problems.

- The revolver no longer starts equipped.
- Gun stance and spellcasting are mutually exclusive.
- Right click now draws/holsters the gun; normal left click draws spells.
- Taking damage creates brief slowdown without mana drain.
- Enemies drop ammo and mana dots.
- XP and three-choice level-up rewards exist.
- Only one reward is guaranteed to follow the player's primary playstyle.
- New spell acquisition does not automatically overwrite the current hand.
- Full-card replacement flow exists when the current Arcane Bandolier capacity is reached.
- Previously unlocked/new card state is sanitized across death and loadout switching.
- Meteor can be dragged and aimed.
- Invalid Meteor drops refund and do not consume cooldown.
- Magic Missile replaced the earlier Arc Lance concept and has gentle auto-targeting.
- Magic Missile ignores Stagnation/Resonance sequencing and modifiers.
- Chain Arc was renamed Chain Lightning.
- Chain Lightning now chains visibly over time, has more hits/range, grows damage through the chain, and can travel beyond the initial cast radius.
- Health is full-height on the left and Mana is full-height on the right.
- Spell cards collapse/fade low like a held hand and expand on proximity/hover.
- Enemy behavior is no longer one homogeneous direct swarm; ranged/support/charge roles exist.
- The map extends beyond the starting viewport but is finite.
- Harmony is now one signed centered vessel rather than separate competing counters.
- Harmony and the minimap occupy separate responsive HUD lanes.
- The first Harmony socket upgrade now unlocks a positive named cadence.
- Card and sigil ownership now persist in the existing localStorage profile, with old saves migrated and invalid/duplicate ids removed while all starter defaults are retained.
- Valid card and sigil loadouts persist as well; discoveries may fill an empty slot but never silently replace an equipped ability.
- A newly discovered sigil is permanently owned and uses the same explicit replace-or-keep-for-later decision pattern as newly learned cards.
- Drawn rune samples are pointer/screen anchored, so player and camera movement no longer drags the ink or changes recognition.
- Rune recognition now smooths/resamples the gesture, scores only equipped sigils, rejects low-confidence or ambiguous matches, and supports deterministic fixtures for every existing shape.
- While drawing, plausible matches recolor the ink/glow by spell school and show the sigil name, shape, and match percentage.
- The Living Grimoire now keeps fixed node geometry and updates existing node/path DOM in place. Purchases no longer reset pan/zoom or replay reveals; pan/zoom is clamped and resize-safe.

## Testing and Diagnostic Fixtures

The HTML contains embedded focused assertions. A new chat modifying gameplay should preserve and extend them.

Useful query parameters:

- `index.html?test=1` — run focused assertions in the browser console.
- `index.html?fixture=harmony&harmony=neutral`
- `index.html?fixture=harmony&harmony=resonance`
- `index.html?fixture=harmony&harmony=stagnation`
- `index.html?fixture=harmony&harmony=two`
- `index.html?fixture=meteor`
- `index.html?fixture=chain`
- `index.html?fixture=hand`
- `index.html?fixture=rewards`
- `index.html?fixture=mixed`

Current Harmony regression coverage includes:

- Reset at Harmony 0 with one empty socket.
- First school context, repetition, and switch behavior.
- Magic Missile neutrality at both extremes.
- `ABA`, `ABAB`, `ABBA`, `ABCBA`, and `ABCABC` classification.
- Two-socket Short Reflection.
- Clamp at `±4`.
- Eight-second lull centering.
- Signed HUD/readout rendering.
- Harmony socket reward behavior.
- Minimap/Harmony separation at 1440, 800, 768, and 521 widths.

Current interaction regression coverage also includes:

- Collection migration/default retention and persisted loadouts.
- Explicit sigil ownership without automatic replacement.
- Deterministic scored recognition for all ten supported gestures.
- Equipped-only recognition with ambiguous/unequipped rejection.
- Screen-stable stroke coordinates across camera movement.
- Stable skill-tree DOM updates and clamped transforms.

Current supporting screenshots in this folder include:

- `harmony_neutral.png`
- `harmony_resonance.png`
- `harmony_stagnation.png`
- `meteor_drag.png`
- `chain_lightning.png`
- `hand_collapsed.png`
- `hand_expanded.png`
- `rewards.png`

## Guidance for the Next Chat

1. Read this document, then inspect `index.html` before changing behavior.
2. Do not assume a saved-for-later idea already exists.
3. Preserve the stance identity: the gun and magic should not be usable simultaneously.
4. Preserve Magic Missile as the neutral basic cast unless the user explicitly changes that rule.
5. Treat Harmony as the Wizard's main feature and express new Wizard upgrades through patterns, sockets, Resonance, Stagnation, and school synergies.
6. Prefer upgrades and transformations over simply adding more mana currencies.
7. When adding a spell, define its school, cost, cooldown, targeting method, gesture/card interaction, Harmony behavior, and mastery/synergy hooks.
8. When adding an enemy, define a distinct movement/attack role, telegraph, cap, gate, loot relevance, and encounter-package use.
9. Run existing assertions and visually inspect at desktop plus the 521–900px supported breakpoint after UI changes.
10. Update this handoff whenever a major mechanic, balance rule, backlog priority, or deferred idea changes status.

## 2026-11-17 — Run relics and visual pass

- Added 24 run-only relic definitions (`RELICS`), with rank caps, class-aware draft integration, and an expandable `RUN RELICS` build inspector. Relics reset in `resetRun`; they do not write persistent grimoire ranks.
- Combat hooks support critical hits, execute damage, burn, slow synergies, kill recovery, XP bonuses, armor/evasion, retaliation, orbit and storm pulses, regeneration, one-use revival, piercing/ricochet/scatter/final-round gun builds, reload benefits, mana discounts, cooldown recovery, and kill movement bonuses.
- Secondary damage cannot recursively apply burn or critical procs. Dead targets cannot grant duplicate kill credit; summoned kills do not grant relic healing/mana rewards.
- Added regional procedural scenery, ritual inscriptions, soft lighting, motes, sprite detail, damage numbers, shield/orbit/burn visuals, and richer reward cards. No external assets or build dependencies.
- Verified desktop focused assertions and added `runRelicAssertions` for caps, reset isolation, burn kills, revival, reload benefits, combined gun upgrades, ricochet targeting, and cooldown recovery. Verified mobile reward layout at 390×844. Existing focused meteor/minimap assertions assume desktop geometry; run `?test=1` at desktop size.
- Visual fixtures: `?fixture=relics` and `?fixture=relicdraft`.

## 2026-11-17 — Dedicated Magic Missile run upgrades

Eight missile-only relics expand the pool to 32 definitions. Volley/damage/range/speed/cooldown/homing/efficiency have three ranks; piercing has two. `missileRunStats()` supplies casting and target acquisition; speed adjusts lifetime to preserve range, and volley pays mana once. Missile rewards require the equipped sigil and carry `ability: missile` for the existing usage-weighted sigil draft. Existing permanent signature, damage, homing, and piercing skills combine with run ranks. Rank caps, actual cast outputs, mana charging, distant acquisition, unequipped filtering, reset isolation, and speed-independent range are covered by `runMissileAssertions()` under `?test=1`. Verified all desktop assertion suites and clicked the volley reward in-browser.

## 2026-11-17 — Gun upgrades and reload feedback

Three new gun relics bring the pool to 35: Twin Hammer adds one full-damage bullet per rank (one ammo spent per trigger pull); Quicksilver Rounds adds 25% projectile speed per rank while preserving 828px travel range; Thunder Rounds adds contact explosions for 30% bullet damage per rank, with 70/85/100px blast radii. All cap at three ranks, stack with existing gun relics, and reset each run. Scatter pellets keep quarter damage; each projectile has independent hit history. Ricochets retain upgraded speed. Swept projectile collision catches enemies crossed between frames. Explosions credit gun damage without recursive procs or player damage.

Reloading tilts the revolver and displays a rotating cylinder with filling chambers, a percentage bar beside the wizard, and a brief ready flash. Animation follows the reload timer, including pause and reload-speed upgrades. `runGunAssertions()` runs under `?test=1` alongside existing suites; `?fixture=gunupgrades` previews the choices and `?fixture=reload` freezes the reload halfway. All four suites passed; reload visuals checked at desktop and 390×844.
