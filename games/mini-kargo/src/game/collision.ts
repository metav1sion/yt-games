import type {Vec2,Rect} from './types';
export function resolveMovement(previous:Vec2,proposed:Vec2,radius:number,obstacles:Rect[],bounds:Rect):Vec2 {
  const dx=proposed.x-previous.x,dz=proposed.z-previous.z;
  const count=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dz))/(radius*0.4)));
  let {x,z}=previous;
  function blocked(px:number,pz:number) {
    return obstacles.some(r=>{const nx=Math.max(r.minX,Math.min(r.maxX,px)),nz=Math.max(r.minZ,Math.min(r.maxZ,pz));return (px-nx)**2+(pz-nz)**2<radius**2;});
  }
  for(let i=0;i<count;i++) {
    const nx=Math.max(bounds.minX+radius,Math.min(bounds.maxX-radius,x+dx/count));
    if(!blocked(nx,z)) x=nx;
    const nz=Math.max(bounds.minZ+radius,Math.min(bounds.maxZ-radius,z+dz/count));
    if(!blocked(x,nz)) z=nz;
  }
  return {x,z};
}
