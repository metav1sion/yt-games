import type {VehicleState,Vec2} from './types';
export type DeliveryState={phase:'loading'|'delivering'|'returning'|'result';completed:number;targetIndex:number;holdSeconds:number;secondsLeft:number;score:number};
export function createDeliveryState():DeliveryState{return{phase:'loading',completed:0,targetIndex:0,holdSeconds:0,secondsLeft:45,score:0};}
export function stepDelivery(state:DeliveryState,vehicle:VehicleState,depot:Vec2,homes:Vec2[],dt:number):DeliveryState {
  if(state.phase==='result')return state;
  const s={...state};
  const target=s.phase==='delivering'?homes[s.targetIndex]:depot;
  if(s.phase==='delivering')s.secondsLeft=Math.max(0,s.secondsLeft-dt);
  const inZone=Math.hypot(vehicle.position.x-target.x,vehicle.position.z-target.z)<=2;
  const stopped=Math.hypot(vehicle.velocity.x,vehicle.velocity.z)<=0.5;
  s.holdSeconds=inZone&&stopped?s.holdSeconds+dt:0;
  if(s.holdSeconds+1e-9>=1) {
    s.holdSeconds=0;
    if(s.phase==='delivering') {
      s.score+=100+Math.floor(s.secondsLeft*2);s.completed++;
      s.phase=s.completed===3?'result':'returning';
      if(s.phase!=='result')s.targetIndex=s.completed;
    } else {s.phase='delivering';s.secondsLeft=45;}
  }
  return s;
}
