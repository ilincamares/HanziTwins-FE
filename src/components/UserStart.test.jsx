import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UserStart from "./UserStart";
import { createOrLoadUser, getUsers } from "../api/userApi";

const loginUserMock = vi.fn();
const continueAsGuestMock = vi.fn();

vi.mock("../api/userApi", () => ({
  createOrLoadUser: vi.fn(),
  getUsers: vi.fn(),
}));

vi.mock("../context/UserContext", () => ({
  useUser: () => ({
    loginUser: loginUserMock,
    continueAsGuest: continueAsGuestMock,
  }),
}));

describe("UserStart", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getUsers.mockResolvedValue({
      users: [],
    });
  });

  it("renders create user and guest options", async () => {
    render(<UserStart />);

    expect(screen.getByText(/Welcome to HanziTwins/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Create or load user/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Continue$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue as Guest/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(getUsers).toHaveBeenCalled();
    });
  });

  it("loads and displays existing users", async () => {
    getUsers.mockResolvedValueOnce({
      users: [
        {
          id: 1,
          username: "andrei",
          created_at: "2025-05-09T12:00:00",
        },
      ],
    });

    render(<UserStart />);

    await waitFor(() => {
      expect(screen.getByText("andrei")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /andrei/i }));

    expect(loginUserMock).toHaveBeenCalledWith({
      id: 1,
      username: "andrei",
      created_at: "2025-05-09T12:00:00",
    });
  });

  it("creates or loads a user by username", async () => {
    createOrLoadUser.mockResolvedValueOnce({
      id: 2,
      username: "maria",
      created_at: "2025-05-09T12:00:00",
    });

    render(<UserStart />);

    fireEvent.change(screen.getByLabelText(/Create or load user/i), {
      target: { value: "maria" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^Continue$/i }));

    await waitFor(() => {
      expect(createOrLoadUser).toHaveBeenCalledWith("maria");
      expect(loginUserMock).toHaveBeenCalledWith({
        id: 2,
        username: "maria",
        created_at: "2025-05-09T12:00:00",
      });
    });
  });

  it("shows validation error for empty username", () => {
    render(<UserStart />);

    fireEvent.click(screen.getByRole("button", { name: /^Continue$/i }));

    expect(screen.getByText(/Please enter a username/i)).toBeInTheDocument();
    expect(createOrLoadUser).not.toHaveBeenCalled();
  });

  it("continues as guest", () => {
    render(<UserStart />);

    fireEvent.click(screen.getByRole("button", { name: /Continue as Guest/i }));

    expect(continueAsGuestMock).toHaveBeenCalledOnce();
  });

  it("shows an error if user creation fails", async () => {
    const consoleMock = vi.spyOn(console, "error").mockImplementation(() => {});

    createOrLoadUser.mockRejectedValueOnce(new Error("Failed"));

    render(<UserStart />);

    fireEvent.change(screen.getByLabelText(/Create or load user/i), {
      target: { value: "maria" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^Continue$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Could not create or load user/i)).toBeInTheDocument();
    });

    consoleMock.mockRestore();
  });
});