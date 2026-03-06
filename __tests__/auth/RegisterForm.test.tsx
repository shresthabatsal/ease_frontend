import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("@/lib/actions/auth-action", () => ({ handleRegister: jest.fn() }));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));
jest.mock("@/app/(auth)/_components/GoogleAuthButton", () => ({
  __esModule: true,
  default: () => <div />,
}));

import RegisterForm from "@/app/(auth)/_components/RegisterForm";
import { handleRegister } from "@/lib/actions/auth-action";
import { toast } from "sonner";

async function fillValid(overrides: { confirm?: string } = {}) {
  await userEvent.type(screen.getByLabelText("Full Name"), "Jane Doe");
  await userEvent.type(screen.getByLabelText("Phone Number"), "9800000000");
  await userEvent.type(screen.getByLabelText("Email"), "jane@test.com");
  await userEvent.type(screen.getByLabelText("Password"), "password123");
  await userEvent.type(
    screen.getByLabelText("Confirm Password"),
    overrides.confirm ?? "password123"
  );
  // terms checkboxm
  fireEvent.click(screen.getByRole("checkbox"));
}

describe("RegisterForm", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders all six fields (name, phone, email, password, confirm, terms)", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("shows zod error when passwords do not match", async () => {
    render(<RegisterForm />);
    await fillValid({ confirm: "different456" });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() =>
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    );
  });

  it("calls handleRegister with correct payload on valid submit", async () => {
    (handleRegister as jest.Mock).mockResolvedValue({ success: true });
    render(<RegisterForm />);
    await fillValid();
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() =>
      expect(handleRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: "Jane Doe",
          email: "jane@test.com",
          phoneNumber: "9800000000",
        })
      )
    );
  });

  it("redirects to /login and shows success toast after registration", async () => {
    (handleRegister as jest.Mock).mockResolvedValue({ success: true });
    render(<RegisterForm />);
    await fillValid();
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/login"));
    expect(toast.success).toHaveBeenCalled();
  });

  it("shows error toast and does not redirect on failed registration", async () => {
    (handleRegister as jest.Mock).mockResolvedValue({
      success: false,
      message: "Email already in use",
    });
    render(<RegisterForm />);
    await fillValid();
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Email already in use")
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("Password field toggles visibility", () => {
    render(<RegisterForm />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    const toggle = input
      .closest("div.relative")!
      .querySelector("button[type='button']") as HTMLElement;
    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "text");
  });

  it("navigates to /login when Log in link button is clicked", () => {
    render(<RegisterForm />);
    fireEvent.click(screen.getByRole("button", { name: /^log in$/i }));
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("Confirm Password field toggles visibility independently", () => {
    render(<RegisterForm />);
    const confirmInput = screen.getByLabelText("Confirm Password");
    expect(confirmInput).toHaveAttribute("type", "password");
    const toggle = confirmInput
      .closest("div.relative")!
      .querySelector("button[type='button']") as HTMLElement;
    fireEvent.click(toggle);
    expect(confirmInput).toHaveAttribute("type", "text");
  });

  it("Create Account button is present and enabled before submit", () => {
    render(<RegisterForm />);
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).not.toBeDisabled();
  });

  it("shows empty field errors when form submitted with no data at all", async () => {
    render(<RegisterForm />);
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() =>
      expect(document.querySelectorAll(".text-red-500").length).toBeGreaterThan(
        0
      )
    );
  });
});
