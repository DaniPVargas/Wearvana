import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Explore from "./pages/Explore";

function Root() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:username" element={<UserProfile />} />
          <Route path="/explore" element={<Explore />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default Root;
