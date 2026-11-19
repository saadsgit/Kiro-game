# Requirements Document

## Introduction

Flappy Kiro is a retro, browser-based endless scroller. The player guides a ghost character (Ghosty) through a series of pipes. The reference screenshot `img/example-ui.png` shows the intended look and feel: a light-blue sky with clouds, green pipes with darker caps, a small white ghost, and a dark status bar at the bottom showing the score and high score. The screenshot is a visual reference only. Where it conflicts with these requirements (for example, gap size or proportions), these requirements take precedence, and the game must always be fair and playable.

The game uses the provided assets `assets/ghosty.png`, `assets/jump.wav` and `assets/game_over.wav`. It also uses these additional assets, which must be added to the `assets/` directory: `assets/door.png` (a brown wooden door with a white frame), `assets/room.png` (a top-down pixel-art bedroom with a wooden floor), four ghost sprites for the room scene: `assets/ghost-front.png`, `assets/ghost-back.png`, `assets/ghost-left.png` and `assets/ghost-right.png`, and `assets/shadow.png` (a flat, dark oval shadow). Pipes, clouds, and all screens are drawn by the game itself.

The game has a goal. When the player reaches a Score of 5, the pipes stop appearing and a door appears. When the Ghost touches the door, the screen fades to black and the game continues in a top-down room, where the player walks the Ghost with the arrow keys to a second ghost. Walking up to that ghost makes it say "Nice job!", and then the Game_Over_Screen is shown.

## Glossary

- **Game**: The Flappy Kiro application running in a web browser.
- **Canvas**: The single canvas element on which the Game draws everything.
- **Logical_Size**: The fixed internal drawing resolution of the Canvas, 1280 × 720 logical pixels (16:9). All sizes, speeds and distances in this document are in logical pixels (px).
- **Playfield**: The sky area of the Canvas in which the Ghost, pipes and clouds are displayed. It is 1280 × 660 px and sits at the top of the Canvas.
- **Status_Bar**: The 1280 × 60 px bar at the bottom of the Canvas, below the Playfield.
- **Ghost**: The player-controlled character, drawn with `assets/ghosty.png`.
- **Ghost_Bounds**: The smallest rectangle that contains all non-transparent pixels of the Ghost sprite, as drawn on the Canvas.
- **Hitbox**: The rectangle used for collision detection with the Ghost. It is the Ghost_Bounds inset by 12% of its width on the left and right sides, and by 12% of its height on the top and bottom sides.
- **Pipe**: One vertical green obstacle, made of a body and a cap. The cap counts as part of the Pipe for all purposes, including collision and scoring.
- **Pipe_Pair**: A top Pipe and a bottom Pipe separated by a Gap.
- **Gap**: The vertical opening between the top Pipe and the bottom Pipe of a Pipe_Pair.
- **Cloud**: A decorative semi-transparent shape in the Playfield. Clouds never affect gameplay.
- **Round**: One play-through, from the first Flap until either the Ghost crashes or the player completes the Room_Scene. A Round consists of the Sky_Scene, the Door_Transition, and the Room_Scene, in that order.
- **Sky_Scene**: The side-scrolling part of a Round, in which the Ghost flies through the Pipes and, after the Victory_Score is reached, toward the Door.
- **Victory_Score**: The Score of 5, at which the Pipes stop appearing and the Door appears.
- **Door**: The door drawn with `assets/door.png` that appears in the Sky_Scene after the Victory_Score is reached.
- **Door_Transition**: The sequence that starts when the Ghost touches the Door: fade to black, scene change, and fade in.
- **Room_Scene**: The top-down 2D room, drawn with `assets/room.png`, in which the player walks the Ghost with the arrow keys.
- **Walkable_Area**: The part of the Room_Scene floor that the Ghost can stand on. Walls and furniture are not part of it.
- **Friend_Ghost**: The second ghost standing in the Room_Scene.
- **Speech_Bubble**: The text bubble shown above the Friend_Ghost's head.
- **Idle**: The state of a ghost in the Room_Scene that is not moving. The Ghost is Idle when no arrow key is held down and no touch movement is active, or when it has been stopped next to the Friend_Ghost. The Friend_Ghost is always Idle.
- **Idle_Animation**: The gentle up-and-down motion of a ghost's sprite while it is Idle.
- **Shadow**: The flat oval drawn on the floor under a ghost in the Room_Scene, using `assets/shadow.png`.
- **Ground_Position**: The position on the floor where a ghost stands. The Hitbox, collisions and the Shadow use it. The Idle_Animation never changes it.
- **Score**: The number of Pipe_Pairs the Ghost has passed in the current Round.
- **High_Score**: The highest Score achieved, persisted across browser sessions.
- **Flap**: A player input that gives the Ghost an upward impulse.
- **Start_Screen**: The screen shown when the Game loads, before any Round has started.
- **Game_Over_Screen**: The screen shown after a Round ends.
- **Paused_Screen**: The screen shown when a Round is automatically paused.
- **Mute_Button**: The on-screen control that turns all sound on or off.

## Requirements

### Requirement 1: Browser platform and scaling

**User Story:** As a player, I want to play in my web browser on a computer or a touch device, so that I can start without installing anything.

#### Acceptance Criteria

1. THE Game SHALL run in the current versions of Chrome, Edge, Firefox and Safari on desktop, and in Chrome and Safari on mobile, by opening a static HTML page with no build step and no server-side component.
2. THE Game SHALL draw the Playfield, the Status_Bar, and all screens on the Canvas.
3. THE Game SHALL load all sprites and audio from the local `assets/` directory.
4. THE Game SHALL keep the Canvas at the 16:9 aspect ratio of the Logical_Size and SHALL NOT stretch or distort it.
5. THE Game SHALL scale the Canvas to the largest size that fits entirely inside the browser window in both width and height, and SHALL center it in the window.
6. WHEN the browser window is resized, THE Game SHALL rescale the Canvas to the new window size without restarting the Round.
7. THE Game SHALL render the Canvas at the display's pixel density so that edges stay sharp on high-density screens.

### Requirement 2: Visual style

**User Story:** As a player, I want the game to have a consistent retro look based on the reference screenshot, so that it feels polished.

#### Acceptance Criteria

1. THE Game SHALL display the Playfield with a light-blue sky background.
2. THE Game SHALL draw each Pipe in green, with a cap in a darker green that is 12 px wider than the Pipe body and 30 px tall, at the end of the Pipe that faces the Gap.
3. THE Game SHALL draw the Ghost using `assets/ghosty.png` at a height of 48 px, preserving the sprite's aspect ratio.
4. THE Game SHALL draw elements in the Sky_Scene in this order, from back to front: sky, Clouds, Pipes, Door, Ghost, then the Status_Bar and any screen overlay.
5. THE Game SHALL display 5 to 8 Clouds in the Playfield at all times.
6. THE Game SHALL draw each Cloud in white with an opacity between 40% and 80%, so that the sky behind it remains partly visible.
7. THE Game SHALL display the Status_Bar with a dark background and white text.
8. THE Status_Bar SHALL display the text "Score: {Score} | High: {High_Score}" centered horizontally, and SHALL display the Mute_Button at its right end.

### Requirement 3: Cloud movement

**User Story:** As a player, I want the background to feel deep, so that the game looks lively.

#### Acceptance Criteria

1. THE Game SHALL move every Cloud from right to left at a constant speed.
2. THE Game SHALL assign each Cloud its own speed between 20 px/s and 100 px/s, so that different Clouds move at different speeds and create the appearance of perspective.
3. THE Game SHALL give larger Clouds higher speeds than smaller Clouds.
4. THE Game SHALL move every Cloud more slowly than the Pipes.
5. WHEN a Cloud has moved completely off the left edge of the Playfield, THE Game SHALL place it just beyond the right edge at a new random vertical position within the Playfield.
6. THE Game SHALL keep moving the Clouds on every screen, including when the Ghost and the Pipes are stopped.

### Requirement 4: Screens and game states

**User Story:** As a player, I want clear start, game over and retry screens, so that I always know what state the game is in.

#### Acceptance Criteria

1. WHEN the Game loads, THE Game SHALL show the Start_Screen.
2. THE Start_Screen SHALL display the title "Flappy Kiro", a prompt to press Space or tap to start, and the Ghost hovering up and down gently at its starting position.
3. WHILE the Start_Screen is shown, THE Game SHALL NOT display any Pipes and SHALL NOT apply gravity to the Ghost.
4. WHEN the player applies a Flap on the Start_Screen, THE Game SHALL start a Round and apply that Flap to the Ghost.
5. WHEN a Round ends, either by a crash or by the completion of the Room_Scene, THE Game SHALL show the Game_Over_Screen.
6. THE Game_Over_Screen SHALL display the text "Game Over", the final Score, the High_Score, and a prompt to press Space or tap to retry. WHEN the final Score set a new High_Score, THE Game_Over_Screen SHALL also display "New High Score!".
7. WHILE the Game_Over_Screen is shown, THE Game SHALL keep the scene frozen as it was when the Round ended, and SHALL show the Game_Over_Screen over it.
8. WHEN the player applies a Flap on the Game_Over_Screen, THE Game SHALL reset the Ghost, the Pipes, the Door, the Room_Scene and the Score, start a new Round in the Sky_Scene, and apply that Flap to the Ghost.
9. WHEN the Game_Over_Screen has been shown for less than 500 ms, THE Game SHALL ignore Flap inputs.
10. THE Game SHALL keep the Status_Bar visible on every screen.
11. WHEN a Round starts, THE Game SHALL place the Ghost at a horizontal position of 320 px and at the vertical center of the Playfield.
12. WHEN a Round starts, THE Game SHALL place the leading edge of the first Pipe_Pair at 1480 px horizontally, so that it begins beyond the right edge of the Playfield.

### Requirement 5: Ghost controls and physics

**User Story:** As a player, I want to control the ghost with a single input, so that the game is simple to learn.

#### Acceptance Criteria

1. WHILE the Room_Scene is not active, WHEN the player presses the Space key or the Up Arrow key, or clicks or taps the Canvas outside the Mute_Button, THE Game SHALL apply a Flap.
2. WHEN a Space or Up Arrow key is held down, THE Game SHALL apply only one Flap until the key is released and pressed again.
3. WHEN a Flap is applied during a Round, THE Game SHALL set the Ghost's vertical velocity to 420 px/s upward, replacing its previous vertical velocity.
4. WHILE a Round is in progress, THE Game SHALL accelerate the Ghost downward at 1500 px/s², up to a maximum fall speed of 600 px/s.
5. THE Ghost SHALL stay at a fixed horizontal position while the Pipes scroll toward it.
6. WHILE a Round is in progress, THE Game SHALL tilt the Ghost upward while it is rising and downward while it is falling, by at most 25° in either direction.

### Requirement 6: Endless pipe generation

**User Story:** As a player, I want an endless stream of fair pipes, so that I can keep playing and try to beat my high score.

#### Acceptance Criteria

1. WHILE a Round is in progress, THE Game SHALL move all Pipe_Pairs from right to left at a constant 240 px/s, and SHALL NOT change that speed during the Round.
2. THE Game SHALL draw each Pipe body 80 px wide.
3. THE Game SHALL place the leading edges of consecutive Pipe_Pairs 360 px apart horizontally.
4. THE Game SHALL give every Gap a height of 240 px.
5. WHEN a new Pipe_Pair is created, THE Game SHALL choose the vertical center of its Gap at random, such that the Gap is at least 60 px away from the top and the bottom edge of the Playfield.
6. WHEN a new Pipe_Pair is created, THE Game SHALL choose its Gap center so that it differs from the Gap center of the previous Pipe_Pair by no more than 200 px, so that the Ghost can always reach the next Gap.
7. WHEN a Pipe_Pair has moved completely off the left edge of the Playfield, THE Game SHALL remove it and, WHILE the Score is below the Victory_Score, add a new Pipe_Pair so that the Pipe_Pairs continue without end.
8. WHILE the Score is below the Victory_Score, THE Game SHALL keep at least one Pipe_Pair beyond the right edge of the Playfield at all times.

### Requirement 7: Collision and crash

**User Story:** As a player, I want the round to end when I hit an obstacle, so that the game has a challenge that feels fair.

#### Acceptance Criteria

1. WHILE the Sky_Scene is active, IF the Hitbox overlaps any part of a Pipe, including its cap, THEN THE Game SHALL end the Round.
2. WHILE the Sky_Scene is active, IF the top edge of the Hitbox reaches the top edge of the Playfield, or the bottom edge of the Hitbox reaches the bottom edge of the Playfield, THEN THE Game SHALL end the Round. This applies while the Door is on screen as well.
3. THE Game SHALL use the Hitbox, and not the full image of the Ghost sprite, for every collision check, so that transparent areas of the sprite never cause a collision.
4. WHEN a Round ends, THE Game SHALL stop the movement of the Ghost and the Pipes immediately and show the Game_Over_Screen.
5. WHEN a Round ends by a crash, THE Game SHALL play `assets/game_over.wav` once.

### Requirement 8: Scoring and high score

**User Story:** As a player, I want to see my score and my best score as I play, so that I can measure my progress.

#### Acceptance Criteria

1. THE Game SHALL start each Round with a Score of 0.
2. WHEN the rear edge of the Ghost_Bounds (its leftmost point) moves past the trailing edge of a Pipe_Pair (the rightmost edge of its widest part, including the cap), THE Game SHALL increase the Score by 1, exactly once for that Pipe_Pair.
3. WHEN the Score becomes greater than the High_Score, THE Game SHALL immediately set the High_Score equal to the Score, and the Status_Bar SHALL show the updated values during the Round.
4. WHEN the High_Score changes, THE Game SHALL save it in the browser's local storage.
5. WHEN the Game loads, THE Game SHALL read the High_Score from local storage.
6. IF the stored High_Score is missing, is not a non-negative whole number, or cannot be read, THEN THE Game SHALL use a High_Score of 0.
7. IF the High_Score cannot be saved to local storage, THEN THE Game SHALL keep the High_Score in memory for the current session and continue without showing an error.

### Requirement 9: Sound and mute

**User Story:** As a player, I want audio feedback that I can turn off, so that the game feels responsive without disturbing others.

#### Acceptance Criteria

1. WHEN a Flap is applied during a Round, or starts a Round, THE Game SHALL play `assets/jump.wav`.
2. WHEN a Flap is applied while `assets/jump.wav` is still playing, THE Game SHALL restart the sound from the beginning.
3. THE Game SHALL display the Mute_Button in the Status_Bar on every screen, showing whether sound is currently on or off.
4. WHEN the player clicks or taps the Mute_Button, or presses the M key, THE Game SHALL switch between muted and unmuted, and SHALL NOT apply a Flap.
5. WHILE the Game is muted, THE Game SHALL NOT play any sound, and WHEN the Game becomes muted, THE Game SHALL stop any sound that is currently playing.
6. THE Game SHALL save the mute setting in local storage and restore it when the Game loads. IF the setting cannot be read or saved, THEN THE Game SHALL start unmuted and continue without showing an error.
7. IF the browser blocks a sound or an audio file fails to load, THEN THE Game SHALL continue running without showing an error to the player.

### Requirement 10: Timing, performance and robustness

**User Story:** As a player, I want the game to play the same on any device and to cope with problems, so that it is reliable.

#### Acceptance Criteria

1. THE Game SHALL update the positions of the Ghost, the Pipes and the Clouds from the real time elapsed since the previous update, so that gameplay speed is the same on displays with different refresh rates.
2. THE Game SHALL limit the time step of a single update to 1/30 s, so that the Ghost and the Pipes never jump after a slow frame.
3. THE Game SHALL redraw the Canvas at the display's refresh rate and SHOULD sustain 60 frames per second on a typical laptop.
4. WHEN the browser tab becomes hidden or the window loses focus during a Round, THE Game SHALL pause the Round and show the Paused_Screen.
5. WHILE the Paused_Screen is shown, THE Game SHALL freeze the Ghost and the Pipes, and the Clouds SHALL keep moving while the tab is visible.
6. WHEN the player applies a Flap on the Paused_Screen, THE Game SHALL resume the Round without applying that Flap to the Ghost.
7. IF `assets/ghosty.png` fails to load, THEN THE Game SHALL draw a white rounded shape of the same size as the Ghost_Bounds in its place and continue running.
8. IF any of the ghost sprites for the Room_Scene fails to load, THEN THE Game SHALL draw `assets/ghosty.png` in its place. IF `assets/door.png` or `assets/room.png` fails to load, THEN THE Game SHALL draw a simple shape of the same size and position in its place (a brown rectangle for the Door, a wooden-colored floor rectangle for the room). In every case, THE Game SHALL continue running.

### Requirement 11: Victory score, door and scene change

**User Story:** As a player, I want reaching a score of 5 to lead to a door and a new place, so that the game has a goal and a reward.

#### Acceptance Criteria

1. WHEN the Score reaches the Victory_Score of 5, THE Game SHALL stop creating new Pipe_Pairs and SHALL remove every Pipe_Pair that is still beyond the right edge of the Playfield.
2. WHEN the Score has reached the Victory_Score, THE Game SHALL keep moving the Pipe_Pairs that are already visible at 240 px/s and keep them solid until they leave the Playfield.
3. THE Game SHALL NOT increase the Score above the Victory_Score.
4. WHEN the Score reaches the Victory_Score, THE Game SHALL create the Door just beyond the right edge of the Playfield, at least 360 px beyond the trailing edge of the last remaining Pipe_Pair.
5. THE Game SHALL draw the Door 185 px wide and 330 px tall, vertically centered in the Playfield.
6. THE Game SHALL move the Door from right to left at 240 px/s, and SHALL NOT stop it, because the Ghost keeps a fixed horizontal position and the Door has to come to it. WHEN the Door has moved completely off the left edge of the Playfield without being touched, THE Game SHALL place a new Door at the right edge of the Playfield, so that the Ghost can always reach a Door.
7. WHILE the Door is on screen, THE Game SHALL keep applying gravity, Flaps, and the collision rules of Requirement 7 to the Ghost.
8. IF the Hitbox overlaps the Door, THEN THE Game SHALL start the Door_Transition.
9. WHEN the Door_Transition starts, THE Game SHALL freeze the Ghost, the Door and the Pipes, and SHALL ignore Flap inputs until the Room_Scene is active. The mute control SHALL keep working.
10. THE Door_Transition SHALL fade the Playfield to black over 1.0 s, hold black for 0.5 s while the Game switches to the Room_Scene, and then fade the Room_Scene in from black over 1.0 s. The Status_Bar SHALL stay visible throughout.
11. WHEN the Door_Transition has finished, THE Game SHALL enable the controls of the Room_Scene.
12. WHEN the Game is paused during the Door_Transition, THE Game SHALL pause its timers and resume them when the Round resumes.

### Requirement 12: Room scene and walking

**User Story:** As a player, I want to walk the ghost around a cozy room with the arrow keys, so that I can explore and find the other ghost.

#### Acceptance Criteria

1. THE Game SHALL draw the Room_Scene from `assets/room.png`, scaled uniformly to the largest size that fits inside the Playfield, and centered in it, with black filling the rest of the Playfield.
2. THE Game SHALL define the Walkable_Area of the Room_Scene so that it excludes the walls, the bed, all tables (including the bedside tables, the desk and the round coffee table), all chairs (including the desk chair and the armchair), the other solid furniture, and the Friend_Ghost. Floor decorations such as the rug SHALL be part of the Walkable_Area.
3. WHEN the Room_Scene becomes active, THE Game SHALL place the Ghost at a fixed starting position on clear floor on the right side of the room, in the right third of the room image and not overlapping any furniture, at least 200 px from the Friend_Ghost, facing down. THE Game SHALL fade the Room_Scene in with the Ghost already at this position.
4. THE Game SHALL draw the Ghost in the Room_Scene at a height of 64 px, preserving the sprite's aspect ratio.
5. WHILE the Room_Scene is controllable, THE Game SHALL move the Ghost at 220 px/s in the direction of the arrow keys that are held down (Up, Down, Left, Right), and SHALL stop it when no arrow key is held down.
6. WHEN two arrow keys that are not opposite are held down together, THE Game SHALL move the Ghost diagonally at the same 220 px/s speed. WHEN two opposite arrow keys are held down together, THE Game SHALL not move the Ghost along that axis.
7. IF the Ghost's Hitbox would leave the Walkable_Area, THEN THE Game SHALL prevent that movement and SHALL still allow movement along the free axis, so that the Ghost slides along walls, the bed, tables, chairs and other furniture, and can never overlap them.
8. THE Game SHALL draw the Ghost with `assets/ghost-back.png` when it last moved up, `assets/ghost-front.png` when it last moved down, `assets/ghost-left.png` when it last moved left, and `assets/ghost-right.png` when it last moved right. WHEN it moves diagonally, THE Game SHALL use the sprite for the horizontal direction.
9. WHERE the device has a touch screen, WHEN the player presses or touches a point of the Room_Scene and holds it, THE Game SHALL move the Ghost toward that point at 220 px/s, and SHALL stop it when it is within 8 px of the point or when the touch is released.
10. WHILE the Room_Scene is active, THE Game SHALL NOT apply gravity or Flaps to the Ghost, and SHALL NOT play `assets/jump.wav`.
11. THE Game SHALL keep the Clouds out of the Room_Scene.

### Requirement 13: Friend ghost and ending

**User Story:** As a player, I want to meet another ghost who congratulates me, so that finishing the game feels rewarding.

#### Acceptance Criteria

1. THE Game SHALL place the Friend_Ghost at a fixed position on clear floor in the Room_Scene, reachable by a path on the Walkable_Area from the Ghost's starting position.
2. THE Game SHALL draw the Friend_Ghost at a height of 64 px, using the same four directional sprites as the Ghost with a light-blue tint, so that the two ghosts are easy to tell apart.
3. THE Friend_Ghost SHALL stand still, and THE Game SHALL draw it with the sprite that faces the Ghost (using the axis along which the two are farthest apart).
4. WHEN the Hitbox of the Ghost comes within 24 px of the Friend_Ghost's Hitbox (measured edge to edge, on any side), THE Game SHALL stop the Ghost and ignore all movement input.
5. WHEN the Ghost has stopped next to the Friend_Ghost, THE Game SHALL show the Speech_Bubble above the Friend_Ghost's head with the text "Nice job!".
6. THE Speech_Bubble SHALL be a white rounded rectangle with a dark outline and a small tail that points to the Friend_Ghost's head, with dark text at least 24 px tall, and SHALL stay fully inside the Playfield.
7. THE Game SHALL show the Speech_Bubble only once per Round.
8. WHEN the Speech_Bubble has been shown for 2.5 s, THE Game SHALL end the Round and show the Game_Over_Screen over the frozen Room_Scene, with the Speech_Bubble still visible.
9. WHEN the Round ends by completing the Room_Scene, THE Game SHALL NOT play `assets/game_over.wav`.
10. WHEN the Game_Over_Screen is shown after the Room_Scene, THE Game_Over_Screen SHALL show the final Score of 5, the High_Score, and the retry prompt, and SHALL follow Requirement 4 for retrying.

### Requirement 14: Idle animation and shadows in the room

**User Story:** As a player, I want the ghosts to float gently and cast shadows, so that the room feels alive and the ghosts look like they hover above the floor.

#### Acceptance Criteria

1. WHILE a ghost in the Room_Scene is Idle, THE Game SHALL move its sprite up and down smoothly around its Ground_Position, by 4 px up and 4 px down, in a repeating cycle of 1.6 s.
2. WHILE the Ghost is moving, THE Game SHALL draw its sprite at its Ground_Position without the Idle_Animation.
3. WHEN the Ghost changes between moving and Idle, THE Game SHALL ease the sprite's vertical offset to or from the Idle_Animation over 0.15 s, so that the sprite never jumps.
4. THE Game SHALL apply the Idle_Animation to the Friend_Ghost at all times while the Room_Scene is visible, including while the Speech_Bubble is shown.
5. THE Idle_Animation SHALL change only how the sprite is drawn. It SHALL NOT change the Ground_Position, the Hitbox, collisions, or the distance used to trigger the Speech_Bubble.
6. THE Game SHALL draw a Shadow under each ghost in the Room_Scene, above the floor and below the ghost sprites, horizontally centered on the ghost's Ground_Position.
7. THE Game SHALL draw each Shadow 44 px wide and 8 px tall, with 35% opacity, so that the floor pattern stays visible through it.
8. THE Shadow SHALL stay at the ghost's Ground_Position at all times and SHALL NOT move up and down during the Idle_Animation.
9. WHILE the Ghost is moving, THE Shadow SHALL move together with the Ghost, staying at the Ghost's Ground_Position.
10. WHILE the Ghost is Idle, THE Shadow SHALL stay still while the sprite bobs above it.
11. THE Game SHALL draw the Speech_Bubble relative to the Friend_Ghost's Ground_Position, so that the bubble does not bob with the sprite.
12. WHEN the Game is paused, THE Game SHALL freeze the Idle_Animation, and it SHALL resume from the same point when the Round resumes.
13. IF `assets/shadow.png` fails to load, THEN THE Game SHALL draw a dark oval of the same size and opacity in its place and continue running.

## Assumptions

- Requirement 8.2 reads "furthest ghost point and furthest pipe edge" as: a point is scored once the Ghost has fully cleared the Pipe_Pair.
- The reference values (sizes, speeds, gravity, gap) are starting values. With these values, a Gap is about 5 times the Ghost's height, and a flap rises about 59 px, which keeps every Gap reachable under Requirement 6.6. They can be tuned later without changing the structure of the requirements.
- The images you attached in chat (door, room, four ghost poses) were not saved to the workspace, so only `ghosty.png` exists in `assets/`. The file names in the Introduction are proposed names. I read the four ghost poses as back view, right-facing, left-facing and front view, in the order you sent them.
- The shadow image you just attached is also not in the workspace. The spec proposes the name `assets/shadow.png`. I applied the idle animation and shadow to both ghosts in the room and left the sky scene unchanged. The sizes (4 px, 1.6 s, 44 × 8 px, 35% opacity) are starting values.
- Requirement 11.1 and 11.3 cap the Score at 5 and clear the pipes that have not yet appeared, so the Door arrives soon and the Score never passes 5. Pipes already visible stay solid, because removing them would make them vanish in front of the player.
- Requirement 13.4 reads "right in front of him" as being within 24 px on any side, because the Friend_Ghost always turns to face the Ghost.
- The Room_Scene's Walkable_Area has to be authored by hand from `assets/room.png` once that image is in the workspace.
- Requirement 12.2 blocks the bed, tables, chairs, walls and other solid furniture (bookshelf, dresser). It treats the rug as walkable because it is a floor decoration. I didn't decide whether the sleeping cat blocks the Ghost, so the spec leaves it out. Tell me if you want it solid.
- `game.js`, `index.html` and `style.css` in `kiro-introduction-starter-kit/` were built before this spec and no longer match it (for example, a 170 px gap, per-frame physics, and no Mute_Button or separate Paused_Screen). They need to be reworked when you want to implement the spec.
