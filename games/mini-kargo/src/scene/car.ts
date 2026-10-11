import * as THREE from 'three';
import { box } from './world';
import type { VehicleState } from '../game/types';
export function createCar() {
  const group=new THREE.Group(), body=new THREE.Group();group.add(body);
  box(body,[1.25,0.48,2.1],[0,0.65,0],'#f3b544');
  box(body,[1.16,0.58,0.85],[0,1.11,0.55],'#ffe4a2');
  box(body,[1.04,0.38,0.055],[0,1.14,0.99],'#406c73');
  for(const x of [-0.59,0.59]) box(body,[0.04,0.34,0.58],[x,1.15,0.56],'#406c73');
  box(body,[1.34,0.16,0.15],[0,0.48,1.10],'#fff0c7');box(body,[1.30,0.16,0.12],[0,0.49,-1.10],'#326157');
  for(const x of [-0.43,0.43]) {box(body,[0.23,0.18,0.035],[x,0.78,1.07],'#fff8d2');box(body,[0.20,0.14,0.035],[x,0.67,-1.09],'#bc594a');}
  const wheels:THREE.Mesh[]=[];
  for(const x of [-0.65,0.65]) for(const z of [-0.65,0.7]) {
    const w=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,0.18,12),new THREE.MeshStandardMaterial({color:'#283e3d',roughness:1})); w.rotation.z=Math.PI/2;w.position.set(x,0.35,z);w.castShadow=true;body.add(w);wheels.push(w);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.14,0.20,10),new THREE.MeshStandardMaterial({color:'#dce3cf'}));hub.rotation.z=Math.PI/2;hub.position.copy(w.position);body.add(hub);
  }
  const cargo=new THREE.Group();cargo.position.set(0,0.9,-0.43);body.add(cargo);
  box(cargo,[0.85,0.70,0.85],[0,0.35,0],'#c98e51');box(cargo,[0.17,0.71,0.86],[0,0.35,0],'#f6d191');box(cargo,[0.86,0.71,0.13],[0,0.35,0],'#f6d191');
  let wheelSpin=0, time=0,lastHeading=0;
  return {group,update(state:VehicleState,hasPackage:boolean,dt:number) {
    const speed=Math.hypot(state.velocity.x,state.velocity.z);time+=dt;wheelSpin+=speed*dt/0.3;
    const turn=Math.atan2(Math.sin(state.heading-lastHeading),Math.cos(state.heading-lastHeading));lastHeading=state.heading;
    group.position.set(state.position.x,0.08,state.position.z);group.rotation.y=state.heading;
    body.rotation.z=THREE.MathUtils.lerp(body.rotation.z,Math.max(-0.08,Math.min(0.08,-turn*speed)),1-Math.exp(-8*dt));
    body.position.y=Math.sin(time*15)*Math.min(speed/8,1)*0.015;
    wheels.forEach(w=>{w.rotation.x=wheelSpin;});
    cargo.visible=hasPackage;cargo.rotation.z=Math.sin(time*6)*speed*0.006-turn*2;cargo.rotation.x=Math.sin(time*5)*speed*0.004;
  }};
}
