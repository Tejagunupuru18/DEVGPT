import Chat from "../models/Chat.js";
import User from "../models/user.js";

//Text based Ai chat message controller
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, prompt } = req.body;

    const chat = await Chat.findOne({ userId, _id: chatId });
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });
    const { choices } = await openai.chat.completions.create({
      model: "gemini-3.5-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const reply = {
      ...choices[0].message,
      timestamp: Date.now(),
      isImage: false,
    };
    res.json({ success: true, reply });
    chat.messages.push(reply);
    await chat.save();
    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//IMage Generation Message Controller

export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    //Check credits
    if (req.user.credits < 2) {
      return res.json({
        success: false,
        message: "you don't have enough credits to use this feature",
      });
    }
    const { prompt, chatId, isPublished } = req.body;
    //FIND CHAT
    const chat = await Chat.findOne({ userId, _id: chatId });
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });
  } catch (error) {}
};
