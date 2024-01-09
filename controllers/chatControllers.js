import { Chat } from "../models/chatModel.js";
import { User } from "../models/userModel.js";

// Chat access - one on one // Routes - POST ' chat/  '
export async function accessChat(req, res) {
  try {
    // Id of opposite Chat User
    const { userId } = req.body;

    if (!userId) return res.sendStatus(400);

    // Get Chat
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    // Populate Sender of the Chat using USER Schema
    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    if (isChat.length > 0) {
      return res.status(201).send(isChat[0]);
    } else {
      let chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      // Create New Chat
      const createdChat = await Chat.create(chatData);

      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      return res.status(200).json(FullChat);
    }

    //
  } catch (err) {
    console.log("Error in chat controller -- access chat");
    console.log(err);
    return res.status(500).json({ acknowledged: false, error: err });
  }
}

// Fetch Chat - all chats //  Routes - GET ' chat/ '
export async function fetchChat(req, res) {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).json({ acknowledged: true, results });
      });

    //
  } catch (err) {
    console.log("Error in Chat controller -- Fetch chat");
    console.log(err);
    return res.status(500).json({ acknowledged: false, error: err });
  }
}

// Create group - // Routes - POST - ' chat/group '
export async function createGroup(req, res) {
  try {
    if (!req.body.users || !req.body.name) {
      return res
        .status(400)
        .json({ acknowledged: false, error: "Please Fill all the fields" });
    }

    let users = req.body.users;
    if (users.length < 2) {
      return res.status(400).json({
        acknowledged: false,
        error: "More than 2 users are required to form a group chat",
      });
    }

    users.push(req.user);

    // Create Group Chat
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json({ acknowledged: true, fullGroupChat });

    //
  } catch (err) {
    console.log("Error in Chat controller -- Create Group");
    console.log(err);
    return res.status(500).json({ acknowledged: false, error: err });
  }
}

// Rename group - // Route - PUT - ' chat/rename '
export async function renameGroup(req, res) {
  try {
    const { chatId, chatName } = req.body;

    // Rename Group Chat
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName: chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      return res
        .status(404)
        .json({ error: "Chat Not Found", acknowledged: false });
    }

    return res.status(201).json({ acknowledged: true, updatedChat });

    //
  } catch (err) {
    console.log("Error in Chat controller -- Rename Group");
    console.log(err);
    return res.status(500).json({ acknowledged: false, error: err });
  }
}

// Add to group - // Route - PUT - ' chat/groupadd '
export async function addToGroup(req, res) {
  try {
    const { chatId, userId } = req.body;

    // Add New User to Group Chat
    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      return res
        .status(404)
        .json({ acknowledged: false, error: "Chat Not Found" });
    }

    return res.status(201).json({ acknowledged: true, added });

    //
  } catch (err) {
    console.log("Error in Chat controller -- Add To Group");
    console.log(err);
    return res.status(500).json({ acknowledged: false, error: err });
  }
}

// Remove group - // Route - PUT - ' chat/remove '
export async function removeGroup(req, res) {
  try {
    const { chatId, userId } = req.body;

    // Remove user from Group Chat
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      return res
        .status(404)
        .json({ acknowledged: false, error: "Chat Not Found" });
    }

    return res.status(201).json({ acknowledged: true, removed });

    //
  } catch (err) {
    console.log("Error in Chat controller -- Remove from Group");
    console.log(err);
    return res.status(500).json({ acknowledged: false, error: err });
  }
}
