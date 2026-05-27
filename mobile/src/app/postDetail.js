import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_URL from "../../config";

export default function PostDetailScreen({ route, navigation }) {
  const { post } = route.params;
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      }
    };
    loadUser();
  }, []);

  const joinPost = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/sessions/join`,
        { post_id: post.id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      navigation.navigate("Session", { session: res.data, post });
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || "Could not join");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.categoryBadge}>
        <Text style={styles.category}>{post.category}</Text>
      </View>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.poster}>Posted by {post.name}</Text>
      <Text style={styles.description}>{post.description}</Text>
      <Text style={styles.price}>€{post.price}</Text>
      {currentUser?.id !== post.user_id && (
        <TouchableOpacity style={styles.joinButton} onPress={joinPost}>
          <Text style={styles.joinText}>JOIN SESSION</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 20, paddingTop: 60 },
  back: { marginBottom: 20 },
  backText: { color: "#2D6BE4", fontSize: 16 },
  categoryBadge: {
    backgroundColor: "#1A1A1A",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  category: { color: "#2D6BE4", fontSize: 12 },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  poster: { color: "#888", fontSize: 14, marginBottom: 16 },
  description: {
    color: "#aaa",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  price: {
    color: "#2D6BE4",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
  },
  joinButton: {
    backgroundColor: "#2D6BE4",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  joinText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
