import { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../../config";
import { getSocket } from "../socket";

export default function HomeScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadUser();
      fetchPosts();

      const socket = getSocket();
      if (socket) {
        socket.on("helper_joined", (data) => {
          Alert.alert(`${data.helper_name} wants to help you`, [
            { text: "Reject", style: "cancel" },
            { text: "Accept", onPress: () => acceptHelper(data.session_id) },
          ]);
        });
      }

      return () => {
        if (socket) socket.off("helper_joined");
      };
    }, []),
  );

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      await fetchPosts(user);
    }
  };

  const fetchPosts = async (user) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const url =
        user?.role === "admin" ? `${API_URL}/posts/all` : `${API_URL}/posts`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
      console.log("Post name:", res.data[0]?.name);
    } catch (err) {
      Alert.alert("Error", "Failed to load posts");
    }
  };
  const joinPost = async (post) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/sessions/join`,
        { post_id: post.id },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      navigation.navigate("Session", { session: res.data, post });
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || "Could not join");
    }
  };
  const acceptHelper = async (session_id) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.put(
        `${API_URL}/sessions/${session_id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Alert.alert("Accepted", "Session started");
    } catch (err) {
      Alert.alert("Error", "Failed to accept");
    }
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("PostDetail", { post: item })}
    >
      <View style={styles.card}>
        {item.media_url && (
          <Image source={{ uri: item.media_url }} style={styles.image} />
        )}
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.price}>€{item.price}</Text>
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.cardBottom}>
            <Text style={styles.poster}>
              {item.name || "Unknown"} {"on "}
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
            {currentUser?.id !== item.user_id && (
              <TouchableOpacity
                style={styles.joinButton}
                onPress={() => joinPost(item)}
              >
                <Text style={styles.joinText}>JOIN</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
        <TouchableOpacity onPress={() => navigation.navigate("CreatePost")}>
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No active posts right now</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  plus: { color: "#2D6BE4", fontSize: 32, fontWeight: "bold" },
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  image: { width: "100%", height: 200 },
  cardBody: { padding: 12 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  category: { color: "#2D6BE4", fontSize: 12 },
  price: { color: "#2D6BE4", fontSize: 16, fontWeight: "bold" },
  title: { color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  poster: { color: "#888", fontSize: 12 },
  joinButton: {
    backgroundColor: "#2D6BE4",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinText: { color: "#fff", fontWeight: "bold" },
  empty: { color: "#888", textAlign: "center", marginTop: 40 },
});
