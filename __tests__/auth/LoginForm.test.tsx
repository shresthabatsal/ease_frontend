import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("@/lib/actions/auth-action", () => ({ handleLogin: jest.fn() }));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));
jest.mock("@/app/(auth)/_components/GoogleAuthButton", () => ({
  __esModule: true,
  default: () => <div />,
}));

import LoginForm from "@/app/(auth)/_components/LoginForm";
import { handleLogin } from "@/lib/actions/auth-action";
import { toast } from "sonner";

describe("LoginForm", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders email field, password field, and Log in button", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^log in$/i })
    ).toBeInTheDocument();
  });

  it("renders Forgot password and Sign up navigation buttons", () => {
    render(<LoginForm />);
    expect(
      screen.getByRole("button", { name: /forgot password\?/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it("shows zod validation error when submitted with empty email", async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /^log in$/i }));
    await waitFor(() =>
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    );
  });

  it("toggles password field from type=password to type=text", () => {
    render(<LoginForm />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    // The eye-toggle is the only type=button inside the relative wrapper of the password field
    const toggleBtn = input
      .closest("div.relative")!
      .querySelector("button[type='button']") as HTMLElement;
    fireEvent.click(toggleBtn);
    expect(input).toHaveAttribute("type", "text");
  });

  it("calls handleLogin with the typed email and password", async () => {
    (handleLogin as jest.Mock).mockResolvedValue({ success: true });
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText("Email"), "user@test.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    fireEvent.click(screen.getByRole("button", { name: /^log in$/i }));
    await waitFor(() =>
      expect(handleLogin).toHaveBeenCalledWith({
        email: "user@test.com",
        password: "password123",
      })
    );
  });

  it("redirects to / and fires success toast on successful login", async () => {
    (handleLogin as jest.Mock).mockResolvedValue({ success: true });
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText("Email"), "user@test.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    fireEvent.click(screen.getByRole("button", { name: /^log in$/i }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
    expect(toast.success).toHaveBeenCalledWith("Welcome back!");
  });

  it("fires error toast and does not redirect on failed login", async () => {
    (handleLogin as jest.Mock).mockResolvedValue({
      success: false,
      message: "Invalid credentials",
    });
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText("Email"), "user@test.com");
    await userEvent.type(screen.getByLabelText("Password"), "wrongpass1");
    fireEvent.click(screen.getByRole("button", { name: /^log in$/i }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials")
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("Log in button is disabled while form is submitting", async () => {
    // Never resolves — keeps the form in pending state
    (handleLogin as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText("Email"), "user@test.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    fireEvent.click(screen.getByRole("button", { name: /^log in$/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /logging in/i })).toBeDisabled()
    );
  });

  it("navigates to /forgot-password when Forgot password button is clicked", () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /forgot password\?/i }));
    expect(mockPush).toHaveBeenCalledWith("/forgot-password");
  });

  it("navigates to /register when Sign up button is clicked", () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    expect(mockPush).toHaveBeenCalledWith("/register");
  });
});
