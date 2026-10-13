# The Haunted Hollow — Spooky Town

A small Halloween exploration game made with Three.js. Walk through a foggy town, open haunted-house doors, inspect strange objects, and watch out for zombies and scarecrows.

## Play online with GitHub Pages

1. Upload `index.html`, `main.js`, `style.css`, and `README.md` to the **root** of your GitHub repository.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select branch `main` and folder `/(root)`, then click **Save**.
5. Wait for the published link to appear, then open it in a modern browser.

Three.js is loaded from jsDelivr, so an internet connection is required.

## Controls

- **WASD / arrow keys**: walk around.
- **Drag with mouse**: look around.
- **E**: open/close a nearby door; when inside a house, press E near the doorway to leave.
- **Click/tap a nearby object** or press **Space**: collect/inspect.
- On mobile, use the on-screen direction pad and drag to look.
- Use the sound button to toggle small synthesized sound effects.

## Gameplay notes

- Six real curiosities count toward the 6-item goal.
- The extra objects are cursed decoys. Collecting one makes a ghost appear and say “Boo! Nice try!”
- Zombies and scarecrows begin slowly following the player after the player has been idle for a couple of seconds.
- Houses have doors that swing open and dark interiors with spooky props.

This is a starter game and uses simple procedural shapes rather than downloaded models or textures.

## Latest visual update

- Corrected house-name sign orientation so labels read normally from the street.
- Increased ambient and moon lighting and reduced fog density for better visibility.
- Added brighter, more frequent street lanterns.
- Added orange and purple porch string lights, extra jack-o'-lanterns, and floating ghost decorations to houses.
- Refined zombies and scarecrows with layered clothing, facial details, glowing eyes, ragged edges, straw, and patches.

The monsters are still procedural low-poly characters. For a much more realistic look, a later version could use animated rigged GLB models with detailed textures and walking animations.

## Performance update

This version is tuned to run more smoothly on a wider range of devices:
- Disables real-time shadow maps, which are expensive to render.
- Caps rendering pixel density (more aggressively on mobile devices).
- Removes most decorative point lights; emissive bulbs, windows, eyes, and items still look bright.
- Limits rendering to about 30 FPS on mobile-sized devices and 60 FPS on desktop to avoid unnecessary work.

If you still experience slowdowns, close other browser tabs and try the game in a current version of Chrome, Edge, or Firefox.
