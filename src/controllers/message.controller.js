import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (request, response) => {
  try {
    const loggedInUserId = request.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    response.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSideBar", error.message);
    response.status(500).json({
      message: "Internal Server error",
    });
  }
};

export const getMessages = async (request, response) => {
  try {
    const { id: userToChatId } = request.params;
    const myId = request.user._id;

    const messages = await Message.find({
      $or: [
        {
          senderId: myId,
          receiverId: userToChatId,
        },
        {
          senderId: userToChatId,
          receiverId: myId,
        },
      ],
    });

    response.status(200).json(messages);
  } catch (error) {
    console.log("Error in GetMessages", error.message);
    response.status(500).json({
      message: "Internal Server error",
    });
  }
};

export const sendMessage = async (request, response) => {
  try {
    const { text, image } = request.body;
    const { id: receiverId } = request.params;
    const senderId = request.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    } else {
      console.log("Receiver not connected");
    }

    response.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in SendMessage", error.message);
    response.status(500).json({
      message: "Internal Server error",
    });
  }
};
