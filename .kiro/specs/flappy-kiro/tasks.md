# Implementation Plan

Each task builds on the previous ones, and the game is playable end to end after task 9 (sky scene) and again after task 14 (full game). References point to `requirements.md` (Req) and `design.md`.

## Tasks

- [x] 1. Prepare the assets
  - [x] 1.1 Crop `assets/room.png` to the room only
    - The uploaded image has a black border around the room (the room is about 717 × 483 px inside the 1024 × 559 image). Crop it and keep the original as `img/room-original.png` or delete it.
    - _Requirements: 12.1_
  - [x] 1.2 Measure sprite bounds
    - Write a one-off script `tools/measure-bounds.py` (Pillow) that prints the opaque bounding box of `ghosty.png`, `ghost-front/back/left/right.png`, `door.png` and `shadow.png` as fractions of each image (`l`, `t`, `r`, `b`).
    - Keep the output for `config.js` in task 2.2. Reading pixels at run time fails on `file://`.
    - _Requirements: 2.3, 7.3, 14.7_
  - [x] 1.3 Measure the room rectangles
    - On the cropped `room.png`, work out the floor rectangle, the solid rectangles (bed, bedside tables, desk, desk chair, round coffee table, armchair, bookshelf, dresser), the start point (right third, clear floor) and the friend point, as fractions of the image. Use the estimate table in `design.md` as a starting point.
    - The rug and the cat are not solids.
    - _Requirements: 12.2, 12.3, 13.1_

- [x] 2. Set up the project skeleton
  - [x] 2.1 Replace `index.html` and `style.css`
    - One `<canvas id="game">` centered in a full-window flex container with a dark page background, `touch-action: none`, and no scrolling.
    - Load the scripts in dependency order as classic scripts (not modules): `config`, `util`, `storage`, `assets`, `sound`, `viewport`, `input`, `clouds`, `sky`, `room-data`, `room`, `transition`, `ui`, `game`.
    - _Requirements: 1.1, 1.2, 1.5_
  - [x] 2.2 Create `js/config.js` with the `FK.C` constants and `FK.SPRITE_BOUNDS`
    - Use every value from `design.md` and the measured bounds from task 1.2.
    - Freeze the object.
    - _Requirements: 2.2, 2.3, 5.3, 5.4, 6.1 to 6.6, 11.5, 11.6, 12.4, 14.1, 14.7_
  - [x] 2.3 Create `js/util.js`
    - `clamp`, `rand`, rectangle overlap, rectangle edge-to-edge distance, and a helper that builds the Ghost_Bounds and the Hitbox (12% inset) from a drawn rectangle and the sprite bounds.
    - _Requirements: 7.3, 13.4_

- [x] 3. Build the core services
  - [x] 3.1 Create `js/storage.js`
    - `loadHigh`, `saveHigh`, `loadMuted`, `saveMuted` with try/catch. Validate the stored high score with `/^\d+$/` and `Number.isSafeInteger`. Fall back to in-memory values.
    - _Requirements: 8.4 to 8.7, 9.6_
  - [x] 3.2 Create `js/assets.js`
    - Start loading every image at start-up without blocking. `image(name)` returns the image once `complete && naturalWidth > 0`, else `null`.
    - `tinted(name, color)` builds and caches an offscreen tinted copy with `source-atop`.
    - _Requirements: 1.3, 10.7, 10.8, 13.2_
  - [x] 3.3 Create `js/sound.js`
    - One `Audio` element per clip. `playJump` restarts from 0, `playGameOver` plays once, `setMuted(true)` pauses and rewinds both. All calls are wrapped so that failures are silent.
    - _Requirements: 7.5, 9.1, 9.2, 9.5, 9.7_

- [x] 4. Build viewport and input
  - [x] 4.1 Create `js/viewport.js`
    - `resize()` computes `s = min(innerWidth / 1280, innerHeight / 720)`, sets the canvas CSS size, sets the backing store with `devicePixelRatio`, and sets the context transform. `toLogical(clientX, clientY)` maps pointer positions to 1280 × 720.
    - Call it on load and on `resize`. It must not touch game state.
    - _Requirements: 1.4 to 1.7_
  - [x] 4.2 Create `js/input.js`
    - Keyboard: Space and Up Arrow produce one flap per press (ignore `e.repeat`). Arrow keys feed a held set. M toggles mute. Call `preventDefault()` on Space and the arrows.
    - Pointer: `pointerdown` tests the mute button rectangle first (toggle only, no flap), otherwise sets the flap flag and records the held point. Release on `pointerup`, `pointercancel` and `pointerleave`.
    - Expose `consumeFlap`, `consumeMuteToggle`, `moveVector` (normalized diagonals, opposite keys cancel, pointer-hold direction when no keys are held), `pointerTarget` and `clear`.
    - _Requirements: 5.1, 5.2, 9.4, 12.5, 12.6, 12.9_

- [x] 5. Build the clouds
  - Create `js/clouds.js` with `create`, `update` and `draw`.
    - 5 to 8 clouds. Each gets a size factor that sets its width and its speed (20 to 100 px/s, larger is faster) and its opacity (0.4 to 0.8).
    - A cloud that leaves the left edge wraps to just beyond the right edge at a new random height.
  - _Requirements: 2.5, 2.6, 3.1 to 3.6_

- [x] 6. Build the sky scene logic
  - [x] 6.1 Create `js/sky.js`: ghost physics
    - `create()` places the ghost at `(320, 330)`.
    - Apply a flap by setting `vy = -420`. Integrate with `y += vy·dt + 0.5·g·dt²` and `vy = min(vy + g·dt, 600)`.
    - Compute the tilt (at most 25° each way).
    - Build the Ghost_Bounds and Hitbox from the drawn size (48 px tall, aspect ratio from `ghosty.png`).
    - _Requirements: 4.11, 5.3 to 5.6, 7.3_
  - [x] 6.2 Pipe generation and movement
    - First pipe at `x = 1480`. Gap centers from `nextGapY` (inside `[180, 480]`, at most 200 px from the previous one). Spacing 360 px, speed 240 px/s, body 80 px, cap 92 × 30 px.
    - Cull pipes whose trailing edge has left the screen. Spawn while `spawning && last.x < 1280`.
    - Build each pipe as four rectangles (two bodies, two caps).
    - _Requirements: 4.12, 6.1 to 6.8_
  - [x] 6.3 Collision, scoring and victory
    - Crash on the Hitbox touching the ceiling (`top <= 0`), the floor (`bottom >= 660`), or any pipe rectangle.
    - Score once per pipe when the Ghost_Bounds left edge passes the pipe's trailing edge. Update the live high score and save it. Set a flag when the round raised the high score.
    - At the Victory_Score (5): stop spawning and scoring, remove pipes at `x >= 1280`, create the door at `max(1280, lastTrailing + 360)`.
    - Move the door left at 240 px/s without stopping, and place a new door at the right edge if one passes untouched. Return `'door'` when the Hitbox touches it, after the crash checks.
    - _Requirements: 7.1, 7.2, 8.1 to 8.3, 11.1 to 11.8_
  - [x] 6.4 Sky drawing
    - Draw in this order: sky color, clouds, pipes (green body, darker cap), door (`door.png`, with a brown fallback), ghost (`ghosty.png`, tilted, with a white fallback).
    - _Requirements: 2.1 to 2.4, 10.7, 10.8_

- [x] 7. Build the interface layer
  - Create `js/ui.js`.
    - Status bar: dark 60 px bar, white `Score: N | High: N` centered, mute button (48 × 48 px, speaker icon with a slash when muted) at the right end. Export the button rectangle for `input.js`.
    - Start screen (title, prompt, hovering ghost at 8 px and 1.2 s), game over screen (text, score, high score, "New High Score!" when set, retry prompt), paused screen.
  - _Requirements: 2.7, 2.8, 4.2, 4.6, 4.10, 9.3, 10.4_

- [x] 8. Build the game state machine and loop
  - [x] 8.1 Create `js/game.js`: loop and modes
    - `requestAnimationFrame` loop with `dt = min(elapsed, 1/30)`. Modes `start`, `playing`, `paused`, `gameover`; stages `sky`, `transition`, `room` (only `sky` is wired in this task).
    - Load the high score and mute state at start-up. Always update the clouds. Handle the mute toggle before the stage logic.
    - `startRound()` resets the sky state and score and applies the starting flap with the jump sound. `endRound(crashed)` freezes the scene, records the time, and plays the game over sound only on a crash.
    - Game over: ignore flaps for 500 ms, then retry on a flap.
    - _Requirements: 4.1 to 4.10, 7.4, 7.5, 8.1, 9.1, 10.1, 10.2_
  - [x] 8.2 Pause on focus loss
    - On `visibilitychange` (hidden) and `blur` during a round, set `paused`, clear the input, and show the paused screen. A flap resumes without being applied to the ghost, and the loop timestamp is reset.
    - Only the clouds update while paused.
    - _Requirements: 10.4 to 10.6_
  - [x] 8.3 Draw the frame
    - Clear, draw the current scene, then the status bar, then the overlay for the current mode.
    - _Requirements: 2.4, 4.7, 4.10_

- [x] 9. Checkpoint: sky scene playable
  - Open `index.html` from disk and play through the start screen, flapping, pipes, scoring, a crash, the game over screen and a retry, with sound and mute. Check that the score stops at 5 and a door arrives (touching it can do nothing yet). Fix anything that does not match the requirements before moving on.

- [x] 10. Build the door transition
  - Create `js/transition.js` with the timeline (1.0 s fade out, 0.5 s hold, 1.0 s fade in) that reports the alpha, a one-time `switchNow`, and `done`.
  - In `game.js`, when the sky returns `'door'`, freeze the sky, ignore flaps, set `stage = 'transition'`, draw a black overlay over the Playfield only, and keep the status bar visible. Mute still works. A pause freezes the timeline.
  - _Requirements: 11.8 to 11.12_

- [x] 11. Build the room data and layout
  - [x] 11.1 Create `js/room-data.js`
    - Fill in the measured floor, solids, start and friend points from task 1.3 (normalized to the cropped room image).
    - _Requirements: 12.2, 12.3, 13.1_
  - [x] 11.2 Layout in `js/room.js`
    - `create()` scales the room image to fit the 1280 × 660 Playfield, centers it, converts the data to Playfield pixels, and creates the player ghost and the friend ghost at their points. The player faces down. The room starts locked.
    - Use a fallback rectangle with the same aspect ratio if `room.png` is missing.
    - _Requirements: 12.1, 12.3, 12.4, 10.8_

- [x] 12. Build room movement and the friend
  - [x] 12.1 Walking
    - Move at 220 px/s from `moveVector()`. Test x and y separately with `tryMove` against the floor rectangle, the solids and the friend's Hitbox so that the ghost slides.
    - Set facing from the input vector (horizontal wins on diagonals) and choose the matching sprite. Build the room Hitbox once from the front sprite's bounds.
    - Stop pointer movement within 8 px of the target. Ignore flaps and play no jump sound here.
    - _Requirements: 12.5 to 12.10_
  - [x] 12.2 Friend ghost
    - Draw the friend with tinted copies of the four sprites, standing still, facing the player along the axis with the larger distance.
    - Each update, check the edge-to-edge distance between the two Hitboxes. At 24 px or less, switch to `talking`, stop all movement input, and start a 2.5 s timer. The trigger fires only once.
    - After 2.5 s, return `'done'`.
    - _Requirements: 13.1 to 13.4, 13.7, 13.8_
  - [x] 12.3 Speech bubble
    - Draw "Nice job!" (bold 28 px) in a white rounded box with a dark outline and a tail pointing at the friend's head, placed relative to the friend's resting position and clamped inside the Playfield.
    - _Requirements: 13.5, 13.6, 14.11_

- [x] 13. Build the idle animation and shadows
  - Keep one room clock that advances only in `update`.
  - Ease each ghost's `bob` value toward 1 when idle and toward 0 when moving over 0.15 s. The friend is always idle.
  - Draw the sprite with an offset of `-sin(2π·t / 1.6) · 4 · bob` and a 6 px hover. Do not use the offset for collisions or the trigger distance.
  - Draw a Shadow (44 × 8 px, 35% opacity, `shadow.png` cropped to its visible area, with a dark oval fallback) at each ghost's ground position, never bobbing.
  - Draw in this order: black, room image, shadows, ghosts sorted by ground `y`, bubble.
  - _Requirements: 14.1 to 14.13_

- [x] 14. Connect the room to the game
  - In `game.js`, at `switchNow` create the room and set `stage = 'room'` while the fade-in continues. Unlock the room when the transition is done.
  - When the room returns `'done'`, call `endRound(false)` so that the game over screen shows over the frozen room, with the bubble still visible and no crash sound. Show the final score of 5, the high score, and "New High Score!" when it applies.
  - Retry from this screen resets everything and starts a new sky round.
  - Draw no clouds in the room stage.
  - _Requirements: 4.5 to 4.8, 11.9 to 11.11, 12.11, 13.8 to 13.10_

- [x] 15. Checkpoint: full game playable
  - Play from the start screen to 5 points, touch the door, check the fade, walk the ghost around the room (confirm it cannot enter the bed, tables, chairs or walls and can walk over the rug), reach the friend, see the bubble, and reach the game over screen. Retry and confirm everything is reset.
  - Check that the shadow stays still while the ghost bobs and follows it while walking.

- [ ] 16. Final checks and cleanup
  - [x] 16.1 Failure paths
    - Rename each asset in turn and confirm its fallback appears with no error. Block local storage (private window) and confirm the game still runs. Confirm that a blocked audio file does not raise an error.
    - _Requirements: 8.6, 8.7, 9.6, 9.7, 10.7, 10.8, 14.13_
  - [ ] 16.2 Cross-browser and device checks
    - Check Chrome, Firefox, and Safari when opened from disk. Check window resize mid-round, a high refresh rate display, switching tabs mid-round, touch input in the sky and the room, and mute persistence after a reload.
    - _Requirements: 1.1, 1.6, 9.6, 10.1, 10.4, 12.9_
    - **Result (headless Chromium 151 only):** all of the following passed.
      - Frame rate: the same ghost and pipe positions after 1 s at 30, 60, 120, 144 and 240 steps per second.
      - Scaling: 16:9, centered and fully inside the window at 1920×1080, 1000×900, 800×400, 390×844, 844×390 and 1280×720. A resize in the middle of a round did not restart it. The backing store was 2× at a device pixel ratio of 2.
      - Tab and focus: a hidden tab and a window blur both paused the round and froze the ghost. Space resumed it without a flap.
      - Touch (emulated): a tap started the round, a tap on the mute button muted without a flap, and press-and-hold walked the ghost to within about 5 px of the touched point.
      - Mute: it survived a reload.
      - Held Space gave one flap.
    - **Not done:** Firefox and Safari (desktop and mobile) are not installed in this sandbox. A real high-refresh display, a real touch device, and opening `index.html` from `file://` (blocked in this browser tool) were not tested either.
  - [x] 16.3 Remove the old files and update the README
    - Delete the old `game.js` from the starter kit root. Update `README.md` with how to open the game and the controls (Space, Up Arrow or tap to flap, arrow keys or touch to walk, M to mute).
    - _Requirements: 1.1_
