import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import QuizPage from "./pages/QuizPage.jsx";
import UserStart from "./components/UserStart.jsx";
import { useUser } from "./context/UserContext.jsx";
import ProgressPage from "./pages/ProgressPage.jsx";
import ReviewQuizPage from "./pages/ReviewQuizPage.jsx";
import ExplorerPage from "./pages/ExplorerPage.jsx";


function App() {
  const { user, logoutUser } = useUser();

  const handleSwitchUser = () => {
  const confirmed = window.confirm(
    "Switch user? Unsaved guest progress will be lost."
  );

  if (confirmed) {
    logoutUser();
  }
 };

  if (!user) {
    return <UserStart />;
  }

  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <h2>HanziTwins</h2>

          <div className="nav-links">
              <Link to="/">Quiz</Link>
              <Link to="/explore">Explorer</Link>

              {!user.isGuest && (
                <>
                  <Link to="/progress">Progress</Link>
                  <Link to="/review">Review</Link>
                </>
              )}
            </div>

          <div className="user-panel">
              <div className="user-badge">
                <span className="user-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </span>

                <div className="user-info">
                  <span className="user-name">{user.username}</span>
                  <span className="user-mode">
                    {user.isGuest ? "Guest mode" : "Progress tracking"}
                  </span>
                </div>
              </div>

              <button className="switch-user-button" onClick={handleSwitchUser}>
                Switch
              </button>
            </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<QuizPage />} />
            <Route path="/explore" element={<ExplorerPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/review" element={<ReviewQuizPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;