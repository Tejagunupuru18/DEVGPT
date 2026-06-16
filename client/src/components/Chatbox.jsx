import React, { useRef, useState, useEffect } from "react";

import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import Message from "./Message";
import toast from "react-hot-toast";

const Chatbox = () => {
  const containerRef = useRef(null);

  const { selectedChat, theme, user, axios, token, setUser } = useAppContext();

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

  const [prompt, setPrompt] = useState("");

  const [mode, setMode] = useState("text");

  const [isPublished, setIsPublished] = useState(false);

  // Send message
  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!user) {
        return toast("Login to send message");
      }

      if (!selectedChat?._id) {
        return toast.error("Create or select a chat first");
      }

      if (!prompt.trim()) {
        return;
      }

      setLoading(true);

      const promptCopy = prompt.trim();

      setPrompt("");

      // Add user message instantly
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: promptCopy,
          timestamp: Date.now(),
          isImage: false,
        },
      ]);

      const { data } = await axios.post(
        `/api/message/${mode}`,
        {
          chatId: selectedChat._id,
          prompt: promptCopy,
          isPublished,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.reply]);

        setUser((prev) => ({
          ...prev,
          credits: prev.credits - (mode === "image" ? 2 : 1),
        }));
      } else {
        toast.error(data.message);

        setPrompt(promptCopy);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update messages
  useEffect(() => {
    setMessages(selectedChat?.messages || []);
  }, [selectedChat]);

  // Auto scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40">
      {/* Messages */}
      <div ref={containerRef} className="flex-1 mb-5 overflow-y-scroll min-h-0">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-primary">
            <img
              src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
              alt=""
              className="w-full max-w-56 sm:max-w-68"
            />

            <p className="mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white">
              Ask Me Anything
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}

        {loading && (
          <div className="loader flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>

            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>

            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
          </div>
        )}
      </div>

      {/* Image Publish */}
      {mode === "image" && (
        <label className="inline-flex items-center gap-2 mb-3 text-sm mx-auto">
          <p className="text-xs">Publish Generated Image To Community</p>

          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </label>
      )}

      {/* Input */}
      <form
        onSubmit={onSubmit}
        className="bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center"
      >
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="text-sm outline-none"
        >
          <option value="text">Text</option>

          <option value="image">Image</option>
        </select>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your prompt here..."
          className="flex-1 text-sm outline-none"
        />

        <button type="submit" disabled={loading}>
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            className="w-8 cursor-pointer"
            alt=""
          />
        </button>
      </form>
    </div>
  );
};

export default Chatbox;
