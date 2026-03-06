import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));
jest.mock("@/context/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("@/lib/actions/user-action", () => ({
  handleGetProfile: jest.fn(),
  handleUpdateProfile: jest.fn(),
  handleUploadProfilePicture: jest.fn(),
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

import ProfilePage from "@/components/ProfilePage";
import { useAuth } from "@/context/AuthContext";
import {
  handleGetProfile,
  handleUpdateProfile,
} from "@/lib/actions/user-action";
import { toast } from "sonner";

const mockLogout = jest.fn();
const mockCheckAuth = jest.fn().mockResolvedValue(undefined);

const profile = {
  fullName: "Ram Bahadur",
  email: "ram@test.com",
  phoneNumber: "9800000000",
  role: "USER",
};

function setup(profileOverrides = {}, authOverrides = {}) {
  (useAuth as jest.Mock).mockReturnValue({
    isAdmin: false,
    logout: mockLogout,
    checkAuth: mockCheckAuth,
    ...authOverrides,
  });
  (handleGetProfile as jest.Mock).mockResolvedValue({
    success: true,
    data: { ...profile, ...profileOverrides },
  });
}

describe("ProfilePage (src/components/ProfilePage.tsx)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setup();
  });

  it("shows error toast when handleGetProfile returns success=false", async () => {
    (handleGetProfile as jest.Mock).mockResolvedValue({
      success: false,
      message: "Unauthorized",
    });
    render(<ProfilePage />);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Unauthorized")
    );
  });
});
