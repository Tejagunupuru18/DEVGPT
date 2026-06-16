import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets.js";
import moment from "moment";
import toast from "react-hot-toast";

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {
  const {
    chats,
    setSelectedChat,
    theme,
    setTheme,
    user,
    navigate,
    createNewChat,
    axios,
    setChats,
    fetchUserChats,
    setToken,
    token,
  } = useAppContext();

  const [search, setSearch] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    toast.success("Logged Out Successfully");
  };

  const deleteChat = async (e, chatId) => {
    e.stopPropagation();

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this chat?",
    );

    if (!confirmDelete) {
      throw new Error("Deletion cancelled");
    }

    try {
      const { data } = await axios.post(
        "/api/chat/delete",
        { chatId },
        {
          headers: {
            Authorization: token,
          },
        },
      );

      if (!data.success) {
        throw new Error(data.message);
      }

      setChats((prev) => prev.filter((chat) => chat._id !== chatId));

      await fetchUserChats();

      return data.message;
    } catch (error) {
      toast(error.message);
    }
  };

  return (
    <div
      className={`flex flex-col h-screen min-w-72 p-5
      dark:bg-gradient-to-b
      from-[#242124]/30
      to-[#000000]/30
      border-r-[#806095]/30
      backdrop-blur-3xl
      transition-all
      duration-500
      max-md:absolute
      left-0 z-1
      ${!isMenuOpen ? "max-md:-translate-x-full" : ""}`}
    >
      {/* Logo */}
      <img
        src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
        alt="logo"
        className="w-full max-w-48"
      />

      {/* New Chat */}
      <button
        onClick={createNewChat}
        className="flex justify-center items-center w-full py-2 mt-10 text-white bg-gradient-to-r from-[#A456F7] to-[#3D81F6] text-sm rounded-md cursor-pointer"
      >
        <span className="mr-2 text-xl">+</span>
        New Chat
      </button>

      {/* Search */}
      <div className="flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-white/20 rounded-md">
        <img src={assets.search_icon} className="w-4 not-dark:invert" alt="" />

        <input
          type="text"
          value={search}
          placeholder="Search Conversations"
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs placeholder:text-gray-400 outline-none"
        />
      </div>

      {/* Recent Chats */}
      {chats.length > 0 && <p className="mt-4 text-sm">Recent Chats</p>}

      <div className="flex-1 min-h-0 overflow-y-auto mt-3 text-sm space-y-3">
        {chats
          .filter((chat) =>
            chat.messages[0]
              ? chat.messages[0]?.content
                  ?.toLowerCase()
                  .includes(search.toLowerCase())
              : chat.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map((chat) => (
            <div
              key={chat._id}
              onClick={() => {
                navigate("/");
                setSelectedChat(chat);
                setIsMenuOpen(false);
              }}
              className="p-2 px-4 dark:bg-[#57317C]/10 border border-gray-300 dark:border-[#80609F]/15 rounded-md cursor-pointer flex justify-between group"
            >
              <div>
                <p className="truncate">
                  {chat.messages.length > 0
                    ? chat.messages[0].content.slice(0, 32)
                    : chat.name}
                </p>

                <p className="text-xs text-gray-500 dark:text-[#B1A6C0]">
                  {moment(chat.updatedAt).fromNow()}
                </p>
              </div>

              <img
                src={assets.bin_icon}
                alt=""
                className="hidden group-hover:block w-4 cursor-pointer not-dark:invert"
                onClick={(e) =>
                  toast.promise(deleteChat(e, chat._id), {
                    loading: "Deleting...",
                    success: "Chat deleted",
                    error: (err) => err.message,
                  })
                }
              />
            </div>
          ))}
      </div>

      {/* Community */}
      <div
        onClick={() => {
          navigate("/community");
          setIsMenuOpen(false);
        }}
        className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer"
      >
        <img src={assets.gallery_icon} className="w-4" alt="" />

        <p>Community Images</p>
      </div>

      {/* Credits */}
      <div
        onClick={() => {
          navigate("/credits");
          setIsMenuOpen(false);
        }}
        className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer"
      >
        <img src={assets.diamond_icon} className="w-4 dark:invert" alt="" />

        <div>
          <p>
            Credits:
            {user?.credits}
          </p>

          <p className="text-sm text-gray-400">Purchase credits</p>
        </div>
      </div>

      {/* Theme */}
      <div className="flex items-center justify-between gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md">
        <p>Dark Mode</p>

        <input
          type="checkbox"
          checked={theme === "dark"}
          onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
      </div>

      {/* User */}
      <div className="flex items-center gap-3 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md group">
        <img src={assets.user_icon} className="w-7 rounded-full" alt="" />

        <p className="flex-1 truncate">
          {user ? user.name : "Login your account"}
        </p>

        {user && (
          <img
            src={assets.logout_icon}
            alt=""
            onClick={logout}
            className="h-5 hidden group-hover:block cursor-pointer"
          />
        )}
      </div>

      {/* Close */}
      <img
        src={assets.close_icon}
        alt=""
        onClick={() => setIsMenuOpen(false)}
        className="absolute top-3 right-3 w-5 h-5 cursor-pointer md:hidden"
      />
    </div>
  );
};

export default Sidebar;
