import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import QuizPage from "./pages/QuizPage.jsx";

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Simple Navigation Bar */}
        <nav className="navbar">
          <h2>HanziTwins</h2>
          <div className="nav-links">
            <Link to="/">Quiz Setup</Link>
            <Link to="/explore">Explorer</Link>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <QuizPage />
            } />
            <Route path="/explore" element={
              <div className="placeholder-page">
                <h1>Character Explorer</h1>
                <p>We will build the confusion map visualizer here.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;