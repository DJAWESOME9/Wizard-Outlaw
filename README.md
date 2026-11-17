# Wizard Outlaw

A self-contained browser action-roguelite prototype about an outlaw wizard who draws sigils, channels spell cards, and keeps a revolver as a fallback.

Cast spells by drawing shapes and playing cards, create strange builds, and chase the highest bounty—with a gun as your backup when magic runs dry.

## Play locally

Open `index.html` in a modern desktop or mobile browser. No build step, server, or external assets are required.

## Controls

- Move: `WASD` or arrow keys
- Sprint: hold `Shift` while moving (25 stamina/second, 1.65× speed)
- Dash: `Space` (30 stamina; movement direction, or aim when stationary)
- Stamina: 100 maximum; regenerates 22/second after 0.8 seconds without sprinting or dashing
- Draw a sigil: left-click and drag on the arena while the gun is holstered
- Cast a large spell: drag a card into the arena
- Draw or holster the revolver: right-click
- Fire: left-click while the revolver is drawn
- Reload: `R`
- Fullscreen: `F` to enter or exit (`Esc` also exits)

Touch controls are included for movement, spell drawing, aiming, stance changes, and reloading.

## Progress

Unlocked cards, sigils, skill-tree ranks, and valid loadouts are saved locally in the browser.

## Run relics

Level-up drafts include 35 stackable run-only relics: burning magic, critical hits, ricochets, piercing bullets, scatter rounds, orbiting sigils, storm pulses, healing, wards, and resource synergies. Click **RUN RELICS** above the arena to inspect your build. Gun upgrades include full-damage extra bullets, faster bullet travel, and explosive impact rounds, alongside piercing, ricochets, and scatter pellets. Reloading displays a spinning cylinder, filling chambers, a progress bar, and a ready flash. Ranks reset on each new run; permanent grimoire progress is preserved.

The arena now includes etched ritual geometry, regional scenery, magical lighting, floating damage numbers, and visible relic effects. All graphics remain procedural and offline.

For verification, open `index.html?test=1` and inspect the browser console. `?fixture=relics` previews relic effects; `?fixture=relicdraft` previews new upgrade choices.

### Magic Missile upgrades

While Magic Missile is equipped, level-up drafts can offer eight dedicated upgrades. Each stacks for three ranks, except piercing (two): +1 full-damage bolt, +25% damage, +25% range, +25% projectile speed, 10% shorter cooldown, +35% homing turn speed, +1 enemy pierced, or 10% lower mana cost per rank. Extra bolts cost no extra mana. These stack with grimoire skills and reset each run. The sigil legend shows current bolt count and damage; RUN RELICS shows each upgrade rank. Preview choices with `?fixture=missileupgrades`.

### Difficulty ramp

After level 5, enemy health grows faster with each level, spawn intervals shrink, and coordinated encounter packages arrive more often. Movement speed also rises gradually, with the added level bonus capped at 18%. Enemy contact and projectile damage increase by 2% per level after level 5, capped at +30%, before armor and wards apply. Levels 1–5 retain their original pacing; enemy role caps and attack telegraphs remain in place.

### Astral Stars

Draw either an outline star or a single-stroke crossing five-point star while Astral Stars is equipped and the gun is holstered. Eight golden stars burst outward and gently curve toward nearby enemies in their forward path. Larger star cores, a golden glow, and curved trails make the volley easier to track. Constellation adds two stars per rank. Preview with `?fixture=astral`; `?test=1` also checks star recognition and homing.

### Drawing Vortex

Equip Vortex, holster the gun, and draw a widening or tightening spiral of roughly 1½–3 turns in one stroke. Either clockwise or counterclockwise works; the endpoints do not need to stay far apart. Recognition accepts varied loop counts while rejecting circles and sharp backtracking strokes.

Run `node tests/vortex-recognition.cjs` to check spiral variations and rejection of other sigil templates.
