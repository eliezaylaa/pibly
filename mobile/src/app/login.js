import { useState } from "react";
import { Image } from "react-native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../../config";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = async () => {
    if (!email || !password) return Alert.alert("Error", "All fields required");
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      await AsyncStorage.setItem("token", res.data.token);
      await AsyncStorage.setItem("refreshToken", res.data.refreshToken);
      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
      navigation.replace("Home");
    } catch (err) {
      Alert.alert("Error", "Login Failed");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/pibly.png")} style={styles.logo} />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />
      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#2D6BE4",
    textAlign: "center",
    marginBottom: 8,
  },
  logo: {
    width: 300,
    height: 150,
    marginBottom: 20,
    alignSelf: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    backgroundColor: "#1A1A1A",
    color: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2D6BE4",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  link: { color: "#888", textAlign: "center", marginTop: 16 },
});
