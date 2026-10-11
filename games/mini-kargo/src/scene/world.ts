import * as THREE from 'three';
import type { Rect, Vec2 } from '../game/types';
const materials=new Map<string,THREE.MeshStandardMaterial>();
function mat(color: string) { if(!materials.has(color)) materials.set(color,new THREE.MeshStandardMaterial({color,roughness:0.85})); return materials.get(color)!; }
export function box(parent: THREE.Object3D, size: number[], pos: number[], color: string) {
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(size[0],size[1],size[2]),mat(color)); mesh.position.set(pos[0],pos[1],pos[2]); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
function cylinder(parent: THREE.Object3D, top: number, bottom: number, height: number, pos: number[], color: string, sides=12) {
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,height,sides),mat(color)); mesh.position.set(pos[0],pos[1],pos[2]); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
export function label(text: string, color='#23443d', bg='#fff9e7') {
  const canvas=document.createElement('canvas'); canvas.width=512; canvas.height=128;
  const c=canvas.getContext('2d')!; c.fillStyle=bg; c.beginPath(); c.roundRect(0,0,512,128,24); c.fill(); c.fillStyle=color; c.font='bold 52px system-ui'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(text,256,66);
  const texture=new THREE.CanvasTexture(canvas); texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:true})); sprite.scale.set(5,1.25,1); return sprite;
}
export type World = {group:THREE.Group; obstacles:Rect[]; bounds:Rect; depot:Vec2; homes:Vec2[]};
export function createWorld(): World {
  const group=new THREE.Group(), obstacles:Rect[]=[];
  const bounds={minX:-30,maxX:30,minZ:-25,maxZ:25};
  box(group,[64,0.8,54],[0,-0.5,0],'#a3c895');
  box(group,[64,0.35,54],[0,-1.05,0],'#7f9c79');
  // A connected street grid, with pale curbs and warm asphalt.
  for(const z of [-14,0,14]) { box(group,[60,0.12,6.7],[0,0.04,z],'#eee3c8'); box(group,[60,0.14,5.8],[0,0.10,z],'#647675'); for(let x=-27;x<=27;x+=4) box(group,[1.2,0.015,0.10],[x,0.18,z],'#d7d9c2'); }
  for(const x of [-22,0,22]) { box(group,[6.7,0.12,50],[x,0.055,0],'#eee3c8'); box(group,[5.8,0.14,50],[x,0.12,0],'#647675'); for(let z=-22;z<=22;z+=4) box(group,[0.10,0.015,1.2],[x,0.20,z],'#d7d9c2'); }
  // Crosswalks on each side of the square.
  for(const z of [-4.5,4.5]) for(let x=-2;x<=2;x+=0.8) box(group,[0.45,0.025,1.15],[x,0.23,z],'#fff5dc');
  const homes: Vec2[]=[];
  const plots=[[-12,-8,'#efa66f'],[12,-8,'#f4d57f'],[-12,6,'#89b9af'],[12,6,'#dba4a4'],[-12,20,'#aeb1d5'],[12,20,'#eac18f']] as const;
  plots.forEach(([x,z,color],i)=> {
    const g=new THREE.Group(); g.position.set(x,0,z); group.add(g);
    box(g,[8,0.16,7],[0,0.11,0],'#c9d79c');
    box(g,[5.8,3.6,4.6],[0,1.9,0],color);
    box(g,[6.1,0.28,4.9],[0,3.67,0],'#fff1d2');
    const roof=new THREE.Mesh(new THREE.CylinderGeometry(0,4.7,2,4),mat(i%2?'#ae6550':'#45766b')); roof.rotation.y=Math.PI/4; roof.scale.z=0.85; roof.position.y=4.65; roof.castShadow=true; g.add(roof);
    box(g,[0.62,1.3,0.65],[1.65,5,0.5],'#e9d7b9');
    box(g,[1.05,2.05,0.09],[0,1.15,-2.35],'#47736a');
    box(g,[1.4,0.14,0.8],[0,0.26,-2.7],'#f5edd4');
    for(const wx of [-1.85,1.85]) { box(g,[1.1,1.25,0.12],[wx,2,-2.36],'#fff3d6'); box(g,[0.88,1.02,0.13],[wx,2,-2.44],'#6b9da0'); box(g,[0.06,1.02,0.06],[wx,2,-2.52],'#fff3d6'); box(g,[0.88,0.06,0.06],[wx,2,-2.52],'#fff3d6'); }
    box(g,[1.6,0.035,2.7],[0,0.20,-3.9],'#f2e8cc');
    homes.push({x,z:z-6});
    const sign=label(`${String(i+1).padStart(2,'0')}`); sign.scale.set(1.15,0.4,1); sign.position.set(0,2.7,-2.55); g.add(sign);
    obstacles.push({minX:x-3.1,maxX:x+3.1,minZ:z-2.5,maxZ:z+2.6});
    // Low garden fences leave the driveway open.
    for(const side of [-1,1]) { box(g,[2.4,0.10,0.12],[side*2.75,0.65,-3.7],'#fff0d2'); for(let j=0;j<4;j++) box(g,[0.11,0.9,0.13],[side*(1.7+j*0.65),0.5,-3.7],'#fff0d2'); }
    for(const sx of [-3.5,3.5]) cylinder(g,0.5,0.6,0.8,[sx,0.6,1.5],'#70a365',8);
  });
  const depot={x:-22,z:-21};
  box(group,[5,2.8,4],[-27,1.5,-20],'#f4ba58'); box(group,[5.3,0.3,4.3],[-27,3,-20],'#285b51');
  box(group,[0.12,2,2.6],[-24.44,1.1,-20],'#315f58');
  const depotSign=label('KARGO', '#fff8e4','#285b51'); depotSign.position.set(-27,4,-20); group.add(depotSign);
  obstacles.push({minX:-29.7,maxX:-24.4,minZ:-22.2,maxZ:-17.8});
  for(let i=0;i<3;i++) {box(group,[0.65,0.65,0.65],[-24,0.5,-22+i*0.8],'#d59d5c');box(group,[0.12,0.66,0.66],[-24,0.51,-22+i*0.8],'#f9d592');}
  // A small landscaped square, away from the driving lanes.
  box(group,[7,0.2,7],[10,0.2,-21],'#f0e0ba');
  cylinder(group,1.8,1.8,0.5,[10,0.55,-21],'#eadac0'); cylinder(group,1.5,1.5,0.1,[10,0.83,-21],'#7bbbbb'); cylinder(group,0.25,0.4,1.2,[10,1.2,-21],'#f7eccf');
  obstacles.push({minX:8,maxX:12,minZ:-23,maxZ:-19});
  function tree(x:number,z:number,scale=1) {
    const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);group.add(g);
    cylinder(g,0.18,0.24,1.7,[0,0.9,0],'#a17d53',7);
    const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1.35,1),mat('#5f9970')); crown.position.set(0,2.45,0);crown.scale.set(1,1.1,0.95);crown.castShadow=true;g.add(crown);
    const tip=new THREE.Mesh(new THREE.IcosahedronGeometry(0.85,0),mat('#81ac71'));tip.position.set(0.45,3,0.1);tip.castShadow=true;g.add(tip);
    obstacles.push({minX:x-0.4,maxX:x+0.4,minZ:z-0.4,maxZ:z+0.4});
  }
  for(const [x,z,s] of [[-6,-7,1.1],[6,-7,0.9],[-6,7,0.95],[6,7,1.1],[-6,20,1],[6,20,0.8],[-27,-8,1],[27,-8,1.2],[-27,6,1.1],[27,6,1],[-27,20,1],[27,20,1.2],[-6,-21,1.2],[18,-21,0.9]]) tree(x,z,s);
  for(const [x,z] of [[-5,-3.8],[5,3.8],[-20,11],[20,-11]]) {
    cylinder(group,0.06,0.1,3.3,[x,1.7,z],'#34584f',8);box(group,[0.65,0.2,0.5],[x,3.4,z],'#f8edc6');
  }
  for(const x of [-17,17]) {box(group,[2.2,0.14,0.6],[x,0.6,-21],'#aa7851');box(group,[2.2,0.65,0.12],[x,1,-21.35],'#b8885c');for(const dx of [-0.8,0.8]) box(group,[0.12,0.55,0.4],[x+dx,0.3,-21],'#38594f');}
  return {group,obstacles,bounds,depot,homes};
}
