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
