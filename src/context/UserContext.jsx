import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);
const STORAGE_KEY = "hanzitwins_user";

const GUEST_USER = {
  id: null,
  username: "Guest",
  isGuest: true,
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  function loginUser(userData) {
    const normalizedUser = {
      ...userData,
      isGuest: false,
    };

    setUser(normalizedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUser));
  }

  function continueAsGuest() {
    setUser(GUEST_USER);
    localStorage.removeItem(STORAGE_KEY);
  }

  function logoutUser() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        loginUser,
        continueAsGuest,
        logoutUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
}