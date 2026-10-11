import * as THREE from 'three';
import './style.css';
import {createWorld} from './scene/world';
import {createCar} from './scene/car';
import {updateCamera} from './scene/camera';
import {createMarkers,createDeliveryAnimation} from './scene/markers';
import {createInput} from './game/input';
import {stepVehicle,resetVehicle} from './game/vehicle';
import {resolveMovement} from './game/collision';
import {createLoop} from './game/loop';
import {createDeliveryState,stepDelivery} from './game/delivery';
import {createHud} from './ui/hud';
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML='<canvas id="game" aria-label="Mini Kargo oyun alanı"></canvas>';
const renderer=new THREE.WebGLRenderer({canvas:document.querySelector<HTMLCanvasElement>('#game')!,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.setClearColor('#c9dec0');renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const scene=new THREE.Scene();scene.fog=new THREE.Fog('#c9dec0',48,85);scene.add(new THREE.HemisphereLight('#ffefd5','#739282',2.4));
const sun=new THREE.DirectionalLight('#fff1d7',3);sun.position.set(-18,30,14);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-40;sun.shadow.camera.right=40;sun.shadow.camera.top=40;sun.shadow.camera.bottom=-40;sun.shadow.normalBias=0.04;scene.add(sun);scene.add(sun.target);
const world=createWorld();scene.add(world.group);const car=createCar();scene.add(car.group);const marker=createMarkers();scene.add(marker.group);const deliveryAnimation=createDeliveryAnimation(scene);
const camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,0.1,150);let vehicle=resetVehicle(world.depot),delivery=createDeliveryState(),started=false,bestScore=0,soundEnabled=true;
camera.position.set(vehicle.position.x,27,vehicle.position.z+21);updateCamera(camera,vehicle.position,1);
const ui=document.createElement('div');ui.className='ui';app.append(ui);
const hud=createHud(ui,{restart(){started=true;vehicle=resetVehicle(world.depot);delivery=createDeliveryState();input.reset();},recover(){vehicle=resetVehicle(world.depot);delivery={...delivery,holdSeconds:0};input.reset();},toggleSound(){soundEnabled=!soundEnabled;hud.update(delivery,bestScore,soundEnabled);}});
const input=createInput(document.querySelector<HTMLElement>('#joystick')!);
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}window.addEventListener('resize',resize);resize();
const pause=document.createElement('div');pause.className='pause-overlay';pause.textContent='Kısa bir mola · oyun duraklatıldı';pause.hidden=true;app.append(pause);
const loop=createLoop(dt=>{
  if(started&&delivery.phase!=='result') {
    const previous=vehicle.position;vehicle=stepVehicle(vehicle,input.read(),dt);const proposed=vehicle.position;
    const resolved=resolveMovement(previous,proposed,0.65,world.obstacles,world.bounds);
    if(Math.abs(resolved.x-proposed.x)>0.001)vehicle.velocity.x=0;
    if(Math.abs(resolved.z-proposed.z)>0.001)vehicle.velocity.z=0;
    vehicle.position=resolved;
    const old=delivery;delivery=stepDelivery(delivery,vehicle,world.depot,world.homes,dt);
    if(delivery.completed>old.completed)deliveryAnimation.play(vehicle.position,world.homes[old.targetIndex]);
    if(delivery.phase==='result') {bestScore=Math.max(bestScore,delivery.score);input.reset();}
  }
  const target=delivery.phase==='delivering'?world.homes[delivery.targetIndex]:world.depot;
  marker.group.visible=delivery.phase!=='result';marker.update(target,delivery.phase==='delivering',dt);
  car.update(vehicle,delivery.phase==='delivering',dt);deliveryAnimation.update(dt);updateCamera(camera,vehicle.position,dt);
  hud.update(delivery,bestScore,soundEnabled);hud.setNavigation(Math.hypot(target.x-vehicle.position.x,target.z-vehicle.position.z),Math.atan2(target.x-vehicle.position.x,-(target.z-vehicle.position.z)));
},()=>renderer.render(scene,camera));
function visibility(){loop.setPaused(document.hidden);pause.hidden=!document.hidden;input.reset();}
document.addEventListener('visibilitychange',visibility);visibility();hud.update(delivery,bestScore,soundEnabled);loop.start();
