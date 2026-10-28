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
});
