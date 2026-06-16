import { createContext, useContext, useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [chats, setChats] = useState([]);

  const [selectedChat, setSelectedChat] = useState(null);

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const [loadingUser, setLoadingUser] = useState(true);

  // Fetch user
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/data", {
        headers: {
          Authorization: token,
        },
      });

      if (data.success) {
        setUser(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoadingUser(false);
    }
  };

  // Create chat
  const createNewChat = async () => {
    try {
      if (!user) {
        toast("Login to create chat");
        return;
      }

      navigate("/");

      const { data } = await axios.get("/api/chat/create", {
        headers: {
          Authorization: token,
        },
      });

      if (!data.success) {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Fetch chats
  const fetchUserChats = async () => {
    try {
      let { data } = await axios.get("/api/chat/get", {
        headers: {
          Authorization: token,
        },
      });

      if (!data.success) {
        return toast.error(data.message);
      }

      let chatList = data.chats || [];

      if (chatList.length === 0) {
        await createNewChat();

        const refreshed = await axios.get("/api/chat/get", {
          headers: {
            Authorization: token,
          },
        });

        chatList = refreshed.data.chats || [];
      }

      setChats(chatList);

      if (chatList.length > 0) {
        setSelectedChat(chatList[0]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Theme
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  // Load chats
  useEffect(() => {
    if (user) {
      fetchUserChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  // Load user
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setUser(null);
      setLoadingUser(false);
    }
  }, [token]);

  const value = {
    navigate,

    user,
    setUser,

    chats,
    setChats,

    selectedChat,
    setSelectedChat,

    theme,
    setTheme,

    token,
    setToken,

    loadingUser,

    fetchUser,
    fetchUserChats,
    createNewChat,

    axios,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
