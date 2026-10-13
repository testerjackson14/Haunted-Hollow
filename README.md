# The Haunted Hollow — Three.js WebXR Starter

A tiny Halloween scavenger hunt built with Three.js. It includes a playable desktop/mobile 3D scene and an experimental real-world AR mode using WebXR hit testing.

## Features
- Spooky graveyard with fog, moon, crooked trees, gravestones, fireflies, and a haunted mansion.
- Five collectible charms, progress meter, clues, sound toggle, win screen, and replay.
- Desktop keyboard movement and drag-to-look.
- Mobile browser layout and tap-to-collect.
- Optional WebXR AR button: scan a flat surface, tap to place the hunt, then aim and tap the charms.
- Optional WebXR VR button on compatible headsets; point a controller at a charm and press the trigger.
- No build step or backend required; Three.js loads from jsDelivr CDN.

## Run it locally

WebXR requires a secure context. Use `localhost` for local testing rather than opening `index.html` directly.

### Option A: VS Code
1. Open this folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.

### Option B: Python
From this folder, run:

```bash
python -m http.server 8000
```

Open `http://localhost:8000` on the same computer.

## Publish online with GitHub Pages
1. Create a new GitHub repository, for example `haunted-hollow`.
2. Upload `index.html`, `main.js`, `style.css`, and `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Choose branch `main` and folder `/ (root)`, then save.
6. Wait for deployment and open the site URL shown in the Pages settings.

GitHub Pages serves the site over HTTPS, which is important for WebXR. See:
https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## AR compatibility notes
- WebXR immersive AR and hit-test are not supported by every browser/device. Test on a supported Android phone/browser with ARCore and a secure HTTPS URL.
- iPhones and Safari may not expose WebXR immersive AR. The standard 3D hunt remains playable there; a production iOS AR version may need a different approach such as a WebXR-compatible browser or a WebAR SDK.
- The AR prototype places a small hunt on a detected surface. It is a starter implementation, not a full persistent world-anchor system. VR support is also a simple controller-based mode, not a fully tuned room-scale experience.
- If the AR button is absent or errors, use the normal 3D mode.

## Controls
- Desktop: WASD / arrow keys to move, drag the mouse to look, click a glowing charm to collect.
- Mobile: touch to interact; keyboard controls are available where a keyboard is connected.
- AR: tap **Try AR Hunt**, scan a surface until the orange ring appears, tap once to place the hunt, then aim at charms and tap to collect.

## Next improvements
- Add a virtual thumbstick for mobile 3D movement.
- Add spatial audio and original 3D models.
- Improve AR selection and add persistent anchors.
- Add more levels, accessibility settings, and a shareable score card.
