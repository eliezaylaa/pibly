import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_URL from "../../config";
import { getSocket } from "../socket";

export default function SessionScreen({ route, navigation }) {
  const { session, post } = route.params;
  const [duration, setDuration] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [roomUrl] = useState(`https://meet.jit.si/pibly-session-${session.id}`);

  useEffect(() => {
    const timer = setInterval(() => setDuration((prev) => prev + 1), 1000);
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      }
    };
    loadUser();

    const socket = getSocket();
    if (socket) {
      socket.on("session_ended", () => {
        navigation.replace("Tabs");
      });
    }
    return () => {
      clearInterval(timer);
      if (socket) socket.off("session_ended");
    };
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const endSession = async (isFixed) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.put(
        `${API_URL}/sessions/${session.id}/end`,
        { is_fixed: isFixed },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (isFixed) {
        Alert.alert(
          "Problem Fixed!",
          `Payment of €${post.price} will be processed.`,
          [{ text: "OK", onPress: () => navigation.replace("Tabs") }],
        );
      } else {
        navigation.replace("PosterWaiting", { post });
      }
    } catch (err) {
      Alert.alert("Error", "Failed to end session");
    }
  };

  const isPoster = currentUser?.id === session.poster_id;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.timer}>{formatTime(duration)}</Text>
      <View style={styles.videoPlaceholder}>
        <WebView
          source={{ uri: roomUrl }}
          style={{ flex: 1, width: "100%", height: "100%" }}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsFullscreenVideo={true}
          mediaCapturePermissionGrantType="grant"
        />
      </View>
      <Text style={styles.price}>€{post.price} offered</Text>
      {isPoster && (
        <>
          <TouchableOpacity
            style={styles.fixedButton}
            onPress={() => endSession(true)}
          >
            <Text style={styles.buttonText}>Problem Fixed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notFixedButton}
            onPress={() => endSession(false)}
          >
            <Text style={styles.buttonText}>Not Fixed</Text>
          </TouchableOpacity>
        </>
      )}
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
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  timer: {
    color: "#2D6BE4",
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 24,
  },
  videoPlaceholder: {
    width: "100%",
    height: 250,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    overflow: "hidden",
    position: "relative",
  },
  videoText: { fontSize: 48 },
  videoSub: { color: "#888", fontSize: 14, marginTop: 8 },
  price: {
    color: "#2D6BE4",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 32,
  },
  fixedButton: {
    backgroundColor: "#1D9E75",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  notFixedButton: {
    backgroundColor: "#FF3B3B",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
