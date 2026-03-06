import "@testing-library/jest-dom";
import React from "react";

// Mock next/image globally
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement("img", { src, alt, ...props });
  },
}));

// Mock next/link globally
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) =>
    React.createElement("a", { href, ...props }, children),
}));

// Suppress known noisy React/Next warnings in test output
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (
      msg.includes("Warning: ReactDOM.render") ||
      msg.includes("act(...)") ||
      msg.includes("Warning: An update to") ||
      msg.includes("not wrapped in act")
    )
      return;
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});
