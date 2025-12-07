import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { EnvValidatorConfigType } from "../env_validator.types";
import { setupEnvValidatorPlugin } from "../env_validator.model";

describe("Env Validator Plugin", () => {
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    logSpy.mockClear();
  });

  const runPlugin = (config: EnvValidatorConfigType) => {
    const pluginFn = setupEnvValidatorPlugin({ config });
    pluginFn();
  };

  it("should do nothing when inactive", () => {
    runPlugin({
      active: false,
      envs: {
        API_URL: "https://test.com",
      },
    });

    expect(logSpy).not.toHaveBeenCalled();
  });

  it("should validate envs and print success when all are valid", () => {
    runPlugin({
      active: true,
      envs: {
        API_URL: "https://test.com",
        TOKEN: "123",
      },
    });

    expect(logSpy).toHaveBeenCalledWith("\n");
    expect(logSpy).toHaveBeenCalledWith(
      "✅ Env Validator Plugin: All required environment variables are valid"
    );
  });

  it("should report invalid envs", () => {
    runPlugin({
      active: true,
      envs: {
        API_URL: "",
        AUTH_TOKEN: undefined,
        VALID: "OK",
      },
    });

    expect(logSpy).toHaveBeenCalledWith("\n");

    expect(logSpy).toHaveBeenCalledWith(
      "❌ Env Validator Plugin: Some environment variable is not valid: API_URL"
    );
  });

  it("should detect null envs as invalid", () => {
    runPlugin({
      active: true,
      envs: {
        B: "value",
        A: undefined,
      },
    });

    expect(logSpy).toHaveBeenCalledWith(
      "❌ Env Validator Plugin: Some environment variable is not valid: A"
    );
  });
});
