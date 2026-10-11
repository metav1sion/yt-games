import {describe,it,expect} from 'vitest';
import {createLoop,type FrameScheduler} from './loop';
function fixture(){let callback:((t:number)=>void)|undefined;const scheduler:FrameScheduler={request(cb){callback=cb;return 1;},cancel(){callback=undefined;}};const steps:number[]=[];const loop=createLoop(dt=>steps.push(dt),()=>{},scheduler);loop.start();return {loop,steps,frame(t:number){callback?.(t);}};}
describe('fixed game clock',()=>{
 it('longFrameIsClamped',()=>{const f=fixture();f.frame(0);f.frame(1000);expect(f.steps.length).toBeGreaterThan(0);expect(f.steps.length).toBeLessThanOrEqual(6);expect(f.steps[0]).toBeCloseTo(1/60);f.loop.dispose();});
 it('resumeIgnoresHiddenElapsedTime',()=>{const f=fixture();f.frame(0);f.frame(20);const before=f.steps.length;f.loop.setPaused(true);f.frame(60000);f.loop.setPaused(false);f.frame(60020);expect(f.steps.length).toBe(before);f.frame(60040);expect(f.steps.length).toBe(before+1);f.loop.dispose();});
 it('startDoesNotDuplicateFrames',()=>{const f=fixture();f.loop.start();f.frame(0);f.frame(20);expect(f.steps).toHaveLength(1);f.loop.dispose();});
});
