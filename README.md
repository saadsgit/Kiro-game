# Flappy Kiro

A retro, browser-based endless scroller. Guide the ghost through the pipes. Reach a score of 5 and a door appears. Touch the door to enter a room, then walk up to the other ghost.

## Play

Open `index.html` in a browser. No build step and no server are needed. If you prefer a local server, run `node tools/serve.js` and open http://127.0.0.1:8765.

## Controls

| Where | Input | Action |
|---|---|---|
| Sky | Space, Up Arrow, click or tap | Flap |
| Room | Arrow keys, or press and hold a point on touch screens | Walk |
| Anywhere | M key or the speaker button | Mute / unmute |
| Start, pause and game over screens | Space, click or tap | Start, resume or retry |

The high score and the mute setting are saved in the browser.

## Project layout

- `index.html`, `style.css`: page and layout.
- `js/`: game code (plain scripts, no modules, so it runs from disk).
- `assets/`: sprites, the room image and sounds.
- `img/`: reference screenshots.
- `tools/measure-bounds.py`: measures the visible edges of each sprite (needs Pillow). The results are stored in `js/config.js`.
- `.kiro/specs/flappy-kiro/` (in the workspace root): requirements, design and tasks.
