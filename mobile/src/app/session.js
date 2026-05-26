import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_URL from "../../config";

export default function SessionScreen({ route, navigation }) {
  const { session, post } = route.params;
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setDuration((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
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
          "Problem Fixed",
          `Payment of €${post.price} will be processed shortly.`,
          [{ text: "OK", onPress: () => navigation.replace("Tabs") }],
        );
      } else {
        Alert.alert("Session Ended", "No payment charged.", [
          { text: "OK", onPress: () => navigation.replace("Tabs") },
        ]);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to end session");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.timer}>{formatTime(duration)}</Text>
      <View style={styles.videoPlaceholder}>
        <Text style={styles.videoText}>📹</Text>
        <Text style={styles.videoSub}>Video call</Text>
      </View>
      <Text style={styles.price}>€{post.price} offered</Text>
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
