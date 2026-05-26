import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../../config";

const Categories = ["General", "Gardening", "Advice", "Tech", "Other"];

export default function CreatePostScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("General");

  const createPost = async () => {
    if (!title || !description || !price)
      return Alert.alert("Error", "All fields required");
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `${API_URL}/posts`,
        { title, description, price: parseFloat(price), category },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Alert.alert("Success", "Post created");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", "Failed to create post");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Create Post</Text>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="What's your problem?"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
      />
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe in detail..."
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
        multiline={true}
        numberOfLines={4}
      />
      <Text style={styles.label}>Category</Text>
      <View style={styles.categories}>
        {Categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.cat, category === cat && styles.catActive]}
            onPress={() => setCategory(cat)}
          >
            <Text
              style={[styles.catText, category === cat && styles.catTextActive]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Price (€)</Text>
      <TextInput
        style={styles.input}
        placeholder="How much are you offering?"
        placeholderTextColor="#888"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={createPost}>
        <Text style={styles.buttonText}>Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 20, paddingTop: 60 },
  back: { marginBottom: 20 },
  backText: { color: "#2D6BE4", fontSize: 16 },
  header: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 24 },
  label: { color: "#888", fontSize: 14, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: "#1A1A1A",
    color: "#fff",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  categories: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cat: {
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  catActive: { backgroundColor: "#2D6BE4" },
  catText: { color: "#888", fontSize: 14 },
  catTextActive: { color: "#fff" },
  button: {
    backgroundColor: "#2D6BE4",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 32,
    marginBottom: 40,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
