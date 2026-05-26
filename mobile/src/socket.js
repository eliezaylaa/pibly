import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../config";

let socket = null;

export const connectSocket = async () => {
  const userData = await AsyncStorage.getItem("user");
  if (!userData) return;
  const user = JSON.parse(userData);
  socket = io(API_URL);
  socket.on("connect", () => {
    socket.emit("join_room", user.id);
  });
  return socket;
};

export const getSocket = () => socket;
