import { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_URL from "../../config";
import { getSocket } from "../socket";

export default function HelperWaitingScreen({ route, navigation }) {
  const { session, post } = route.params;

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.on("session_accepted", (data) => {
        navigation.replace("Session", {
          session: { ...session, ...data },
          post,
        });
      });
      socket.on("session_rejected", () => {
        Alert.alert("Rejected", "Your request was rejected");
        navigation.replace("Tabs");
      });
    }
    return () => {
      if (socket) {
        socket.off("session_accepted");
        socket.off("session_rejected");
      }
    };
  }, []);

  const cancelJoin = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.put(
        `${API_URL}/sessions/${session.id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (err) {}
    navigation.replace("Tabs");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Waiting for response...</Text>
      <View style={styles.post}>
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postPrice}>€{post.price}</Text>
      </View>
      <TouchableOpacity style={styles.cancelBtn} onPress={cancelJoin}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 24,
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: "#888",
    fontSize: 14,
    marginBottom: 40,
    textAlign: "center",
  },
  post: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginBottom: 40,
  },
  postTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  postPrice: { color: "#2D6BE4", fontSize: 22, fontWeight: "bold" },
  cancelBtn: {
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  cancelText: { color: "#FF3B3B", fontWeight: "bold", fontSize: 16 },
});
