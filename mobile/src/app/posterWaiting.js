import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_URL from "../../config";
import { getSocket } from "../socket";
import { useStripe } from "@stripe/stripe-react-native";

export default function PosterWaitingScreen({ route, navigation }) {
  const { post } = route.params;
  const [helpers, setHelpers] = useState([]);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.on("helper_joined", (data) => {
        setHelpers((prev) => [...prev, data]);
      });
    }
    return () => {
      if (socket) socket.off("helper_joined");
    };
  }, []);

  const acceptHelper = async (session_id, helper_id) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const postRes = await axios.get(`${API_URL}/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const amount = parseFloat(postRes.data.price);

      const intentRes = await axios.post(
        `${API_URL}/payments/create-intent`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      await initPaymentSheet({
        paymentIntentClientSecret: intentRes.data.clientSecret,
        merchantDisplayName: "Pibly",
      });

      const { error } = await presentPaymentSheet();
      if (error) {
        Alert.alert("Payment cancelled");
        return;
      }

      const sessionRes = await axios.put(
        `${API_URL}/sessions/${session_id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      navigation.replace("Session", {
        session: sessionRes.data,
        post: postRes.data,
      });
    } catch (err) {
      console.log("Error accepting helper:", err.response?.data, err.message);
      Alert.alert("Error", "Failed to accept");
    }
  };

  const rejectHelper = async (session_id) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.put(
        `${API_URL}/sessions/${session_id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setHelpers((prev) => prev.filter((h) => h.session_id !== session_id));
    } catch (err) {
      Alert.alert("Error", "Failed to reject");
    }
  };

  const renderHelper = ({ item }) => (
    <View style={styles.helperCard}>
      <View style={styles.helperAvatar}>
        <Text style={styles.helperAvatarText}>
          {item.helper_name?.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.helperName}>{item.helper_name}</Text>
      <View style={styles.helperActions}>
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() => acceptHelper(item.session_id, item.helper_id)}
        >
          <Text style={styles.btnText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => rejectHelper(item.session_id)}
        >
          <Text style={styles.btnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{post.title}</Text>
      <View style={styles.pulse} />
      {helpers.length === 0 ? (
        <Text style={styles.empty}>Waiting for someone to join...</Text>
      ) : (
        <FlatList
          data={helpers}
          keyExtractor={(item) => item.session_id.toString()}
          renderItem={renderHelper}
        />
      )}
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => navigation.replace("Tabs")}
      >
        <Text style={styles.cancelText}>Cancel Post</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 24, paddingTop: 60 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  subtitle: { color: "#888", fontSize: 14, marginBottom: 32 },
  pulse: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2D6BE4",
    opacity: 0.3,
    alignSelf: "center",
    marginBottom: 32,
  },
  empty: { color: "#555", textAlign: "center", marginTop: 20 },
  helperCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  helperAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2D6BE4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  helperAvatarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  helperName: { color: "#fff", fontSize: 16, flex: 1 },
  helperActions: { flexDirection: "row", gap: 8 },
  acceptBtn: {
    backgroundColor: "#1D9E75",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rejectBtn: {
    backgroundColor: "#FF3B3B",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  cancelBtn: {
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  cancelText: { color: "#FF3B3B", fontWeight: "bold" },
});
