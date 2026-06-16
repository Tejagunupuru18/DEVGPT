import React from "react";
import Sidebar from "./components/Sidebar.jsx";
import { Route, Routes, useLocation } from "react-router-dom";
import Chatbox from "./components/Chatbox.jsx";
import Credits from "./pages/Credits.jsx";
import Community from "./pages/Community.jsx";
import { assets } from "./assets/assets.js";
import "./assets/prism.css";
import { useState } from "react";
import Loading from "./pages/Loading.jsx";
import { useAppContext } from "./context/AppContext.jsx";
import Login from "./pages/Login.jsx";
import { Toaster } from "react-hot-toast";
const App = () => {
  const { user, loadingUser } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  if (pathname === "/loading" || loadingUser) {
    return <Loading />;
  }
  return (
    <>
      <Toaster />
      {!isMenuOpen && (
        <img
          src={assets.menu_icon}
          className="w-6 h-6 absolute top-4 left-4 cursor-pointer not-dark:invert md:hidden"
          onClick={() => setIsMenuOpen(true)}
          alt=""
        />
      )}
      {user ? (
        <div className="dark:bg-gradient-to-b from-[#242124] to-[#000000] dark:text-white">
          <div className="flex h-screen w-screen">
            <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <Routes>
              <Route path="/" element={<Chatbox />} />
              <Route path="/credits" element={<Credits />} />
              <Route path="/community" element={<Community />} />
            </Routes>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-b from-[#242124] to-[#000000] flex items-center justify-center h-screen w-screen">
          <Login />
        </div>
      )}
    </>
  );
};

export default App;
