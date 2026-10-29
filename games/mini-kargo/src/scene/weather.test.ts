import { describe, it, expect } from "vitest";
import { createWeatherSystem } from "./weather";

describe("createWeatherSystem", () => {
  it("initializes with clear weather and zero rain intensity", () => {
    const weather = createWeatherSystem();
    const state = weather.getState();
    expect(state.weather).toBe("clear");
    expect(state.weatherIcon).toBe("🌤️");
    expect(state.rainIntensity).toBe(0);
    expect(state.wetness).toBe(0);
    expect(state.isStorm).toBe(false);
    expect(state.lightningFlash).toBe(0);
    expect(weather.group.children.length).toBeGreaterThan(0);
    weather.dispose();
  });

  it("transitions to summer rain and ramps intensity & road wetness", () => {
    const weather = createWeatherSystem();
    weather.setWeather("rain");
    const state0 = weather.getState();
    expect(state0.weather).toBe("rain");
    expect(state0.weatherName).toBe("Yaz Yağmuru");
    expect(state0.weatherIcon).toBe("🌧️");
    expect(state0.isStorm).toBe(false);

    // Advance 2 seconds
    weather.update(2.0, { x: 10, z: 20 });
    const state1 = weather.getState();
    expect(state1.rainIntensity).toBeGreaterThan(0.5);
    expect(state1.wetness).toBeGreaterThan(0.1);

    // Switch back to clear
    weather.setWeather("clear");
    expect(weather.getState().weather).toBe("clear");

    // Advance 5 seconds - rain should fade
    weather.update(5.0, { x: 10, z: 20 });
    const state2 = weather.getState();
    expect(state2.rainIntensity).toBeLessThan(0.01);

    weather.dispose();
  });

  it("handles thunderstorm state with heavy downpour, wind slant and lightning flash", () => {
    const weather = createWeatherSystem();
    weather.setWeather("storm");
    const state0 = weather.getState();
    expect(state0.weather).toBe("storm");
    expect(state0.weatherName).toBe("Gök Gürültülü Fırtına");
    expect(state0.weatherIcon).toBe("⛈️");
    expect(state0.isStorm).toBe(true);

    // Advance 2 seconds into storm
    weather.update(2.0, { x: -10, z: 30 });
    const state1 = weather.getState();
    expect(state1.rainIntensity).toBeGreaterThan(0.9);
    expect(state1.wetness).toBeGreaterThan(0.3);

    // Manually trigger lightning strike
    weather.triggerLightning({ x: -10, z: 30 });
    const flashState = weather.getState();
    expect(flashState.lightningFlash).toBeGreaterThan(0.5);
    expect(flashState.lightningTriggered).toBe(true);

    // Advance small step through the flash decay
    const tickState = weather.update(0.05, { x: -10, z: 30 });
    expect(tickState.lightningFlash).toBeGreaterThan(0);

    // Advance beyond flash timer (0.4s)
    weather.update(0.4, { x: -10, z: 30 });
    expect(weather.getState().lightningFlash).toBe(0);

    weather.dispose();
  });
});
