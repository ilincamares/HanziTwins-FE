import { useEffect, useState } from "react";
import { createOrLoadUser, getUsers } from "../api/userApi";
import { useUser } from "../context/UserContext";

export default function UserStart() {
  const [username, setUsername] = useState("");
  const [existingUsers, setExistingUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const { loginUser, continueAsGuest } = useUser();

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoadingUsers(true);

        const data = await getUsers();
        setExistingUsers(data.users || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingUsers(false);
      }
    }

    loadUsers();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setErrorMessage("Please enter a username.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const user = await createOrLoadUser(trimmedUsername);
      loginUser(user);
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not create or load user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-container user-start-container">
      <h1>Welcome to HanziTwins</h1>
      <p className="user-start-description">
        Select an existing profile, create a new one, or continue as a guest.
      </p>

      <section className="existing-users-section">
        <h2>Existing Users</h2>

        {loadingUsers ? (
          <p className="empty-message">Loading users...</p>
        ) : existingUsers.length === 0 ? (
          <p className="empty-message">No users have been created yet.</p>
        ) : (
          <div className="existing-users-grid">
            {existingUsers.map((existingUser) => (
              <button
                key={existingUser.id}
                type="button"
                className="existing-user-card"
                onClick={() => loginUser(existingUser)}
              >
                <span className="existing-user-avatar">
                  {existingUser.username.charAt(0).toUpperCase()}
                </span>

                <span>{existingUser.username}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="user-divider">
        <span>or</span>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="username-input">Create or load user:</label>

        <input
          id="username-input"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Enter your name"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Continue"}
        </button>
      </form>

      <button
        type="button"
        className="guest-button"
        onClick={continueAsGuest}
      >
        Continue as Guest
      </button>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}