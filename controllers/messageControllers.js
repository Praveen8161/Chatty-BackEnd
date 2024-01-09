import { Chat } from "../models/chatModel.js";
import { Message } from "../models/messageModel.js";
import { User } from "../models/userModel.js";

//  Sending a Message -- // ROUTE - POST - /message/
export async function sendMessage(req, res) {
  try {
    const { content, chatId } = req.body;
    if (!content || !chatId) {
      console.log("Invalid data passed into request");
      return res.sendStatus(400);
    }

    let newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };

    // Create new Message
    let message = await Message.create(newMessage);

    // Populate Sender field in Message
    message = await message.populate("sender", "name pic");
    // Populate the Chat field in Message
    message = await message.populate("chat");
    // The chat field in Message have a users array populate them by using USER Schema
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    // Update the latest Message in Chat Document
    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    return res.status(201).json({ acknowledged: true, message });
  } catch (err) {
    console.log(err);
    console.log(`---Send Message---`);
    res.status(500).json({ acknowledged: false, error: err });
  }
}

//  Get All Messages for a Chat -- // ROUTE - GET - /message/:chatId
export async function allMessages(req, res) {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    return res.status(201).json({ acknowledged: true, messages });
  } catch (err) {
    console.log(err);
    console.log(`---All Message---`);
    res.status(500).json({ acknowledged: false, error: err });
  }
}
