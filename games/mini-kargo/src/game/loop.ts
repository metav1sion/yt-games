export type FrameScheduler = {
  request(callback: (timestampMs: number) => void): number;
  cancel(id: number): void;
};
export function createLoop(
  step: (dt: number) => void,
  render: () => void,
  scheduler: FrameScheduler = {
    request: (callback) => requestAnimationFrame(callback),
    cancel: (id) => cancelAnimationFrame(id),
  },
) {
  let running = false,
    paused = false,
    id = 0,
    last: number | null = null,
    accumulator = 0;
  function frame(now: number) {
    if (!running) return;
    if (!paused) {
      if (last !== null)
        accumulator += Math.max(0, Math.min(0.1, (now - last) / 1000));
      const fixed = 1 / 60;
      while (accumulator + 1e-10 >= fixed) {
        step(fixed);
        accumulator -= fixed;
      }
      render();
    }
    last = now;
    id = scheduler.request(frame);
  }
  return {
    start() {
      if (running) return;
      running = true;
      last = null;
      id = scheduler.request(frame);
    },
    setPaused(value: boolean) {
      if (value === paused) return;
      paused = value;
      last = null;
      accumulator = 0;
    },
    dispose() {
      running = false;
      scheduler.cancel(id);
    },
  };
}
