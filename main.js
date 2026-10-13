import * as THREE from "three";

const mount = document.querySelector("#game");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0916);
scene.fog = new THREE.FogExp2(0x100d20, 0.027);

const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.1, 180);
camera.position.set(0, 1.75, 8);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
mount.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x9b9ad5, 0x201323, 1.7));
const moonLight = new THREE.DirectionalLight(0xb6c5ff, 2.0);
moonLight.position.set(-8, 15, 6); moonLight.castShadow = true; scene.add(moonLight);
const orangeGlow = new THREE.PointLight(0xff6a24, 2.4, 28); orangeGlow.position.set(0, 3, -3); scene.add(orangeGlow);

const mats = {
  ground: new THREE.MeshStandardMaterial({ color: 0x24212b, roughness: 1 }),
  road: new THREE.MeshStandardMaterial({ color: 0x191820, roughness: 1 }),
  wall: new THREE.MeshStandardMaterial({ color: 0x42364b, roughness: .95 }),
  wall2: new THREE.MeshStandardMaterial({ color: 0x4c3a3a, roughness: .95 }),
  roof: new THREE.MeshStandardMaterial({ color: 0x211b31, roughness: 1 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x38212a, roughness: .9 }),
  door: new THREE.MeshStandardMaterial({ color: 0x24151f, roughness: .9 }),
  window: new THREE.MeshStandardMaterial({ color: 0xffa84a, emissive: 0xff741b, emissiveIntensity: 1.4 }),
  darkWindow: new THREE.MeshStandardMaterial({ color: 0x171225, emissive: 0x170d28 }),
  pumpkin: new THREE.MeshStandardMaterial({ color: 0xff7927, roughness: .65 }),
  green: new THREE.MeshStandardMaterial({ color: 0x617344, roughness: 1 }),
  straw: new THREE.MeshStandardMaterial({ color: 0xb59a51, roughness: 1 }),
  white: new THREE.MeshStandardMaterial({ color: 0xd9d8e8, roughness: .8 }),
  ghost: new THREE.MeshStandardMaterial({ color: 0xe9e6ff, emissive: 0x6550a8, emissiveIntensity: .25, transparent: true, opacity: .9 }),
  red: new THREE.MeshStandardMaterial({ color: 0x742f3d, roughness: 1 }),
  black: new THREE.MeshStandardMaterial({ color: 0x15111c, roughness: 1 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xffc45f, emissive: 0xff8b26, emissiveIntensity: .8, metalness: .25 })
};

const boxGeo = new THREE.BoxGeometry(1,1,1);
function box(parent, x,y,z, sx,sy,sz, mat, opts={}) {
  const m = new THREE.Mesh(boxGeo, mat);
  m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.castShadow = opts.castShadow !== false; m.receiveShadow = true;
  parent.add(m); return m;
}
function sphere(parent,x,y,z,sx,sy,sz,mat, seg=16) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1,seg,Math.max(8,seg/2)),mat);
  m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.castShadow=true; parent.add(m); return m;
}
function cone(parent,x,y,z,r,h,mat,rot=0) {
  const m=new THREE.Mesh(new THREE.ConeGeometry(r,h,5),mat);m.position.set(x,y,z);m.rotation.y=rot;m.castShadow=true;parent.add(m);return m;
}
function addTextSign(text,x,z) {
  const canvas=document.createElement("canvas");canvas.width=512;canvas.height=128;
  const c=canvas.getContext("2d");c.fillStyle="#24182f";c.fillRect(0,0,512,128);c.strokeStyle="#c08b59";c.lineWidth=8;c.strokeRect(6,6,500,116);
  c.fillStyle="#ffcf87";c.font="bold 48px Georgia";c.textAlign="center";c.fillText(text,256,79);
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.6,.65),new THREE.MeshStandardMaterial({map:tex,emissive:0x3a1d0a,emissiveIntensity:.6,side:THREE.DoubleSide}));
  sign.position.set(x,2.5,z);scene.add(sign);return sign;
}

// Town ground and crooked main street
box(scene,0,-.18,0,90,.3,90,mats.ground,{castShadow:false});
box(scene,0,-.01,0,8,.08,76,mats.road,{castShadow:false});
for(let z=-34;z<38;z+=7) box(scene,0,.04,z,.13,.03,2.4,new THREE.MeshStandardMaterial({color:0x665c60}),{castShadow:false});
const moon=sphere(scene,-19,21,-32,4,4,4,new THREE.MeshBasicMaterial({color:0xd7dcff}),24);
for(let i=0;i<100;i++){
  const star=sphere(scene,(Math.random()-.5)*100,10+Math.random()*26,-30-Math.random()*50,.045,.045,.045,new THREE.MeshBasicMaterial({color:0xb8b8ff}),6);
}
function makeTree(x,z,scale=1){
  const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);scene.add(g);
  box(g,0,2,0,.48,4,.48,mats.wood);
  const branches=[[-.8,2.4,.0,-.9,.15,0],[.8,2.8,.1,.9,.15,0],[-.45,3.4,0,-.5,.15,0],[.5,3.5,0,.6,.15,0]];
  for(const [bx,by,bz,dx,dy,dz] of branches){const b=box(g,bx,by,bz,1.9,.2,.2,mats.wood);b.rotation.z=dx<0?-.55:.55;}
  cone(g,-.7,4.3,0,.55,1.7,mats.black,.3);cone(g,.7,4.5,0,.48,1.6,mats.black,1.1);cone(g,0,5.1,0,.62,1.8,mats.black,.4);
}
for(let z=-34;z<=32;z+=8){makeTree(-7.2,z,.85+Math.random()*.35);makeTree(7.2,z,.9+Math.random()*.35);}
for(let i=0;i<20;i++){const x=(Math.random()-.5)*50,z=(Math.random()-.5)*68;if(Math.abs(x)>8)makeTree(x,z,.45+Math.random()*.5);}

// Houses with a hinged door; player can enter into a furnished spooky interior.
const houses=[];
function makeHouse(x,z,opts={}){
  const w=opts.w||5.6,h=opts.h||3.5,d=opts.d||5.2;
  const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  const wallmat=opts.color?new THREE.MeshStandardMaterial({color:opts.color,roughness:1}):mats.wall;
  box(g,0,h/2,0,w,h,d,wallmat);
  // Roof pitched as two slabs
  const roof1=box(g,-w*.25,h+.55,0,w*.62,.22,d*1.12,mats.roof);roof1.rotation.z=-.32;
  const roof2=box(g,w*.25,h+.55,0,w*.62,.22,d*1.12,mats.roof);roof2.rotation.z=.32;
  // Front facade details face -Z
  for(const wx of [-w*.31,w*.31]){
    box(g,wx,2.1,-d/2-.055,.85,1.05,.09,mats.darkWindow);
    box(g,wx,2.1,-d/2-.11,.1,1.15,.06,mats.wood);
    box(g,wx,2.1,-d/2-.11,.95,.1,.06,mats.wood);
    box(g,wx,2.1,-d/2-.17,.82,.96,.025,mats.window,{castShadow:false});
    box(g,wx,2.1,-d/2-.2,.07,1,.03,mats.wood,{castShadow:false});
    box(g,wx,2.1,-d/2-.2,.9,.07,.03,mats.wood,{castShadow:false});
  }
  box(g,0,.65,-d/2-.08,1.15,1.3,.18,mats.wood);
  const hinge=new THREE.Group();hinge.position.set(-.57,.65,-d/2-.19);g.add(hinge);
  const door=box(hinge,.57,0,0,1.14,1.3,.1,mats.door);
  sphere(hinge,1.02,0,-.07,.06,.06,.06,mats.gold,8);
  // Front steps
  box(g,0,.12,-d/2-.5,1.8,.24,.75,mats.wood);
  // chimney
  box(g,w*.3,h+1.0,d*.18,.6,1.5,.7,mats.wood);
  // Interior is a dark room that becomes visible through the doorway when opened
  const inside=new THREE.Group();inside.position.set(x,0,z);scene.add(inside);
  box(inside,0,.04,0,w-.3,.08,d-.3,new THREE.MeshStandardMaterial({color:0x181321}));
  box(inside,0,1.45,-d/2+.18,w-.35,2.8,.12,mats.wall2);
  box(inside,0,1.45,d/2-.18,w-.35,2.8,.12,mats.wall2);
  box(inside,-w/2+.18,1.45,0,.12,2.8,d-.35,mats.wall2);
  box(inside,w/2-.18,1.45,0,.12,2.8,d-.35,mats.wall2);
  box(inside,0,2.85,0,w-.3,.12,d-.3,mats.roof);
  box(inside,-.9,.45,.25,1.5,.65,.7,mats.wood); // old table
  sphere(inside,.8,.4,-.7,.42,.4,.42,mats.pumpkin,12);
  const candle=new THREE.PointLight(0xff7b32,1.4,7);candle.position.set(0,1.8,0);inside.add(candle);
  inside.visible=false;
  houses.push({x,z,w,d,g,hinge,inside,door,opened:false,enterZ:z-d/2-1.3,exitZ:z-d/2-1.3});
  addTextSign(opts.name||"NO VACANCY",x,z-d/2-.7);
  // porch jack-o-lanterns
  for(const side of [-1,1]){
    sphere(g,side*w*.42,.35,-d/2-.6,.28,.3,.28,mats.pumpkin,12);
    cone(g,side*w*.42,.67,-d/2-.6,.09,.18,mats.green);
    const lamp=new THREE.PointLight(0xff741e,.7,4);lamp.position.set(x+side*w*.42,.6,z-d/2-.6);scene.add(lamp);
  }
}
makeHouse(-13,-17,{name:"THE WIDOW'S",color:0x40384c});
makeHouse(13,-15,{name:"BONE & BROOM",color:0x493337});
makeHouse(-14,1,{name:"CROW COTTAGE",color:0x373b4a});
makeHouse(14,5,{name:"THE LAST LAUGH",color:0x4a3932});
makeHouse(-13,20,{name:"WITCH WAY",color:0x3d3549});
makeHouse(13,22,{name:"NO VACANCY",color:0x4b353e});

// Pumpkins and graveyard-ish town clutter
function makePumpkin(x,z,s=.55){
  sphere(scene,x,s*.65,z,s,s*.72,s,mats.pumpkin,14);
  cone(scene,x,s*1.42,z,.12,.25,mats.green);
  const eyeMat=new THREE.MeshBasicMaterial({color:0xffe1a0});
  for(const dx of [-.2,.2]){const eye=cone(scene,x+dx,s*.8,z-s*.8,.09,.18,eyeMat,Math.PI);eye.rotation.x=Math.PI/2;}
}
for(let i=0;i<22;i++){const x=(Math.random()-.5)*40,z=(Math.random()-.5)*60;if(Math.abs(x)>4)makePumpkin(x,z,.25+Math.random()*.25);}

// Decorative lanterns along the street
for(let z=-30;z<34;z+=10){
  for(const x of [-4.7,4.7]){
    box(scene,x,1.5,z,.12,3,.12,mats.black);
    box(scene,x,2.85,z,.5,.5,.5,mats.black);
    sphere(scene,x,2.85,z,.16,.16,.16,mats.gold,10);
    const l=new THREE.PointLight(0xff9b3d,.9,7);l.position.set(x,2.8,z);scene.add(l);
  }
}
addTextSign("SLEEPY HOLLOW",0,-37);

// Collectibles: a mix of real finds and cursed decoys.
const collectibles=[];
function makeItem(type,x,y,z,decoy=false){
  const group=new THREE.Group();group.position.set(x,y,z);scene.add(group);
  let mesh;
  if(type==="candy"){mesh=sphere(group,0,0,0,.28,.3,.2,new THREE.MeshStandardMaterial({color:0xff7ba8,emissive:0x5d1530,emissiveIntensity:.4}),12);}
  else if(type==="skull"){mesh=sphere(group,0,0,0,.28,.24,.22,mats.white,12);sphere(group,-.1,-.03,-.18,.045,.06,.03,mats.black,8);sphere(group,.1,-.03,-.18,.045,.06,.03,mats.black,8);}
  else if(type==="book"){mesh=box(group,0,0,0,.48,.12,.35,new THREE.MeshStandardMaterial({color:0x8a1f40,emissive:0x350012,emissiveIntensity:.6}));}
  else if(type==="potion"){mesh=sphere(group,0,0,0,.2,.27,.2,new THREE.MeshStandardMaterial({color:0x8e6bff,emissive:0x4422aa,emissiveIntensity:.9}),12);box(group,0,.28,0,.12,.12,.12,mats.gold);}
  else if(type==="bat"){mesh=sphere(group,0,0,0,.18,.12,.14,mats.black,12);cone(group,-.25,.02,0,.2,.35,mats.black,.8);cone(group,.25,.02,0,.2,.35,mats.black,2.4);}
  else {mesh=sphere(group,0,0,0,.25,.25,.25,mats.gold,12);}
  const glow=new THREE.PointLight(decoy?0xb08aff:0xffb14e,decoy?1.1:.8,4);group.add(glow);glow.position.set(0,.25,0);
  group.userData={type,decoy,mesh,phase:Math.random()*6};
  collectibles.push(group);
}
makeItem("candy",-2,.7,-12,false);makeItem("skull",2,.7,-24,false);makeItem("book",-10,.7,8,false);
makeItem("potion",10,.7,16,false);makeItem("bat",-2,.7,27,false);makeItem("charm",3,.7,3,false);
makeItem("skull",-13,.7,-16,true);makeItem("book",13,.7,-14,true);makeItem("candy",-14,.7,1,true);makeItem("potion",14,.7,6,true);makeItem("bat",-13,.7,20,true);makeItem("charm",13,.7,22,true);

// Monsters: stylized zombies and scarecrows that chase only when the player is moving too slowly.
const monsters=[];
function makeMonster(kind,x,z){
  const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  if(kind==="zombie"){
    box(g,0,1.05,0,.72,1.15,.42,mats.green);
    sphere(g,0,1.9,0,.42,.43,.38,mats.green,12);
    box(g,-.13,1.95,-.33,.08,.07,.05,mats.red,{castShadow:false});box(g,.13,1.95,-.33,.08,.07,.05,mats.red,{castShadow:false});
    box(g,0,.4,0,.65,.65,.4,mats.black);
    for(const s of [-1,1]){const arm=box(g,s*.55,1.22,0,.18,.75,.2,mats.green);arm.rotation.z=s*.35;}
  } else {
    box(g,0,1.05,0,.62,1.15,.38,mats.straw);
    sphere(g,0,1.95,0,.42,.42,.4,mats.straw,12);
    box(g,0,2.15,-.02,.9,.12,.14,mats.wood);
    cone(g,0,2.5,0,.48,.48,mats.black);
    box(g,-.5,1.25,0,.75,.13,.13,mats.wood);box(g,.5,1.25,0,.75,.13,.13,mats.wood);
    box(g,-.2,.4,0,.15,.75,.15,mats.wood);box(g,.2,.4,0,.15,.75,.15,mats.wood);
  }
  const eyeGlow=new THREE.PointLight(kind==="zombie"?0x6cff83:0xffa14d,.7,3);eyeGlow.position.set(0,1.9,-.3);g.add(eyeGlow);
  monsters.push({g,kind,speed:kind==="zombie"?.65:.48,phase:Math.random()*5});
}
makeMonster("zombie",-5,-20);makeMonster("scarecrow",5,-7);makeMonster("zombie",5,17);makeMonster("scarecrow",-4,29);

// Controls / state
const keys={};let started=false,dragging=false,lastX=0,lastY=0,yaw=0,pitch=0,score=0,activeDoor=null,insideHouse=null;
let playerSpeed=0;let lastMoveTime=performance.now();let soundOn=false;let audioCtx=null;let ghostTimer=null;let toastTimer=null;
const player=new THREE.Vector3(0,0,8);
const ghostModal=document.querySelector("#ghostModal");
const ghostLine=document.querySelector("#ghostLine");
const doorPrompt=document.querySelector("#doorPrompt");
const toast=document.querySelector("#toast");
const hud=document.querySelector("#hud");
const mobilePad=document.querySelector("#mobilePad");

function sayToast(text,ms=1800){toast.textContent=text;toast.classList.remove("hidden");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.add("hidden"),ms);}
function ghostBoo(){ghostLine.textContent="Boo! Nice try!";ghostModal.classList.remove("hidden");clearTimeout(ghostTimer);ghostTimer=setTimeout(()=>ghostModal.classList.add("hidden"),2600);playTone(180,.14);}
function playTone(freq=440,duration=.12){
  if(!soundOn)return;
  try{audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),gain=audioCtx.createGain();o.type="sine";o.frequency.value=freq;gain.gain.value=.07;o.connect(gain);gain.connect(audioCtx.destination);o.start();gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);o.stop(audioCtx.currentTime+duration);}catch(e){}
}
function updateHUD(){document.querySelector("#score").textContent=`${score} / 6`;document.querySelector("#progressFill").style.width=`${score/6*100}%`;document.querySelector("#statusText").textContent=score===6?"The town's curse is nearly broken!":"Six real curiosities are hidden in the streets and houses.";}
function openHouse(h){
  if(insideHouse===h){h.opened=false;h.inside.visible=false;h.hinge.rotation.y=0;insideHouse=null;player.set(h.x,0,h.exitZ-1.8);camera.position.set(player.x,1.75,player.z);yaw=0;sayToast("You step back into the fog.");document.querySelector("#modeLabel").textContent="Explore the town";return;}
  if(insideHouse){sayToast("Find the exit before visiting another house.");return;}
  h.opened=!h.opened;h.hinge.rotation.y=h.opened?-1.3:0;
  if(h.opened){h.inside.visible=true;insideHouse=h;player.set(h.x,0,h.z);camera.position.set(h.x,1.65,h.z+1.5);yaw=Math.PI;pitch=0;document.querySelector("#modeLabel").textContent="Inside a haunted house";sayToast("The door creaks open... go inside!");}
  else sayToast("The door closes with a groan.");
}
function closestHouse(){
  let best=null,dist=Infinity;
  for(const h of houses){const d=Math.hypot(player.x-h.x,player.z-h.enterZ);if(d<2.3&&d<dist){best=h;dist=d;}}
  return best;
}
function collect(item){
  if(!item.visible)return;
  item.visible=false;
  if(item.userData.decoy){ghostBoo();sayToast("That was a cursed decoy!",1800);}
  else {score++;updateHUD();playTone(540,.16);sayToast(["A curious candy!","A skull with a story...","A book of forbidden spells!","A bubbling potion!","A bat-shaped trinket!","A strange little charm!"][score-1]||"A curiosity collected!");}
  if(score===6){setTimeout(()=>sayToast("All six curiosities found! You survived the Hollow.",4000),500);}
}
function nearestItem(){
  let best=null,dist=2.5;
  for(const item of collectibles){if(!item.visible)continue;const d=player.distanceTo(item.position);if(d<dist){dist=d;best=item;}}
  return best;
}
function checkInteractions(){
  const h=closestHouse();
  if(h){activeDoor=h;doorPrompt.innerHTML=`Press <b>E</b> to ${insideHouse===h?"leave the house":"open door"}`;doorPrompt.classList.remove("hidden");}
  else {activeDoor=null;doorPrompt.classList.add("hidden");}
}
function tryInteract(){
  if(insideHouse){openHouse(insideHouse);return;}
  if(activeDoor){openHouse(activeDoor);return;}
  const item=nearestItem();if(item)collect(item);
}
function beginGame(){started=true;document.querySelector("#intro").classList.add("hidden");hud.classList.remove("hidden");mobilePad.classList.remove("hidden");updateHUD();sayToast("The town is quiet... a little too quiet.",2400);}
document.querySelector("#startBtn").addEventListener("click",beginGame);
document.querySelector("#soundBtn").addEventListener("click",()=>{soundOn=!soundOn;document.querySelector("#soundLabel").textContent=soundOn?"Sound on":"Sound off";if(soundOn)playTone(440,.1);});
addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=true;if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(e.key.toLowerCase()))e.preventDefault();if(!started)return;if(e.key.toLowerCase()==="e")tryInteract();if(e.key.toLowerCase()===" "){const item=nearestItem();if(item)collect(item);}});
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
renderer.domElement.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture?.(e.pointerId);});
renderer.domElement.addEventListener("pointerup",e=>{dragging=false;const item=nearestItem();if(started&&item){const projected=item.position.clone().project(camera);const px=(projected.x*.5+.5)*innerWidth,py=(-projected.y*.5+.5)*innerHeight;if(Math.hypot(px-e.clientX,py-e.clientY)<90)collect(item);}});
renderer.domElement.addEventListener("pointermove",e=>{if(!dragging||!started)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;yaw-=dx*.004;pitch=Math.max(-.6,Math.min(.6,pitch+dy*.003));});
for(const btn of mobilePad.querySelectorAll("button")){const keyMap={forward:"w",back:"s",left:"a",right:"d"};const key=keyMap[btn.dataset.move];btn.addEventListener("pointerdown",e=>{e.preventDefault();keys[key]=true;});for(const ev of ["pointerup","pointerleave","pointercancel"])btn.addEventListener(ev,()=>keys[key]=false);}

// The player's camera moves in a walkable area; entering houses temporarily switches to a small interior.
function updatePlayer(dt){
  if(!started)return;
  let f=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0);
  let s=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
  const len=Math.hypot(f,s);if(len>0){f/=len;s/=len;}
  const speed=4.2;
  const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
  const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  const next=player.clone().addScaledVector(forward,f*speed*dt).addScaledVector(right,s*speed*dt);
  if(insideHouse){
    const h=insideHouse;next.x=THREE.MathUtils.clamp(next.x,h.x-h.w/2+.65,h.x+h.w/2-.65);next.z=THREE.MathUtils.clamp(next.z,h.z-h.d/2+.55,h.z+h.d/2-.55);
    if(Math.hypot(player.x-h.x,player.z-h.exitZ)<1.6 && f>0){/* exit is handled with E */}
  }else{
    next.x=THREE.MathUtils.clamp(next.x,-31,31);next.z=THREE.MathUtils.clamp(next.z,-39,39);
    // Gentle collision around house footprints
    for(const h of houses){if(Math.abs(next.x-h.x)<h.w/2+.35&&Math.abs(next.z-h.z)<h.d/2+.35){const oldDist=Math.abs(player.x-h.x)-h.w/2; if(Math.abs(next.x-h.x)>Math.abs(next.z-h.z))next.x=player.x;else next.z=player.z;}}
  }
  playerSpeed=len?speed:0;if(len){lastMoveTime=performance.now();player.copy(next);}
  const eyeY=insideHouse?1.62:1.72;
  camera.position.set(player.x,eyeY,player.z);
  camera.rotation.order="YXZ";camera.rotation.y=yaw;camera.rotation.x=pitch;
  checkInteractions();
}
function updateMonsters(dt,t){
  const idleSeconds=(performance.now()-lastMoveTime)/1000;
  const chase=idleSeconds>2.2;
  for(const m of monsters){
    const p=m.g.position;const dx=player.x-p.x,dz=player.z-p.z;const d=Math.hypot(dx,dz);
    if(chase&&d>1.4&&d<28){p.x+=(dx/d)*m.speed*dt;p.z+=(dz/d)*m.speed*dt;m.g.rotation.y=Math.atan2(dx,dz);}
    m.g.position.y=Math.sin(t*2+m.phase)*.04;
    if(d<1.4){sayToast(m.kind==="zombie"?"The zombie groans right behind you!":"The scarecrow creaks closer!",900);lastMoveTime=performance.now();}
  }
}
function animate(now=0){
  requestAnimationFrame(animate);const dt=Math.min(.04,clock.getDelta());const t=now/1000;
  for(const item of collectibles){if(item.visible){item.position.y=.72+Math.sin(t*2+item.userData.phase)*.12;item.rotation.y+=dt*.65;}}
  updatePlayer(dt);updateMonsters(dt,t);
  renderer.render(scene,camera);
}
const clock=new THREE.Clock();
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
animate();
