import {describe,it,expect} from 'vitest';
import {resolveMovement} from './collision';
const bounds={minX:-10,maxX:10,minZ:-10,maxZ:10};
const wall={minX:2,maxX:4,minZ:-2,maxZ:2};
describe('obstacles',()=>{
 it('buildingBlocksMovement',()=>{const p=resolveMovement({x:0,z:0},{x:3,z:0},0.65,[wall],bounds);expect(p.x).toBeLessThanOrEqual(1.35);});
 it('wallAllowsSliding',()=>{const p=resolveMovement({x:1.3,z:0},{x:2,z:1},0.65,[wall],bounds);expect(p.x).toBeLessThanOrEqual(1.35);expect(p.z).toBeCloseTo(1);});
 it('boundsContainVehicle',()=>{expect(resolveMovement({x:9,z:0},{x:13,z:12},0.65,[],bounds)).toEqual({x:9.35,z:9.35});});
 it('fastMovementCannotCrossBuilding',()=>{const p=resolveMovement({x:0,z:0},{x:8,z:0},0.65,[wall],bounds);expect(p.x).toBeLessThanOrEqual(1.35);});
});
