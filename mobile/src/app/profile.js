import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_URL from "../../config";

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [earnings, setEarnings] = useState("0.00");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userData = await AsyncStorage.getItem("user");
      const parsed = JSON.parse(userData);
      const res = await axios.get(`${API_URL}/users/myprofile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fullUser = { ...parsed, ...res.data, role: parsed.role };
      setUser(fullUser);
      setName(fullUser.name || "");
      setBio(fullUser.bio || "");
      setPhone(fullUser.phone || "");
      setAddress(fullUser.address || "");
      setZipCode(fullUser.zip_code || "");
      setCity(fullUser.city || "");
      setCountry(fullUser.country || "");
      fetchEarnings(fullUser.id, fullUser.role);
    } catch (err) {
      console.log("Error:", err.message);
    }
  };

  const fetchEarnings = async (userId, role) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (role === "admin") {
        const res = await axios.get(`${API_URL}/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEarnings(res.data.total_revenue);
      } else {
        const res = await axios.get(`${API_URL}/payments/mytransactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const total = res.data
          .filter((t) => t.payee_id === userId && t.status === "completed")
          .reduce(
            (sum, t) => sum + parseFloat(t.amount) - parseFloat(t.platform_fee),
            0,
          );
        setEarnings(total.toFixed(2));
      }
    } catch (err) {
      console.error("fetchEarnings error:", err.message);
    }
  };

  const saveProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.put(
        `${API_URL}/users/${user.id}`,
        {
          name: name || null,
          bio: bio || null,
          phone: phone || null,
          address: address || null,
          zip_code: zipCode || null,
          city: city || null,
          country: country || null,
          role: user.role,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const updatedUser = { ...user, ...res.data, role: user.role };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.log("Updated user:", updatedUser);
      setEditing(false);
      Alert.alert("Success", "Profile updated");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || "Failed to update");
    }
  };

  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `${API_URL}/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (err) {}
    await AsyncStorage.clear();
    navigation.replace("Login");
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container}>
      {console.log("Rendering profile with user:", editing)}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{user.role?.toUpperCase()}</Text>
        </View>
        {user.role === "admin" ? (
          <View style={styles.earningsBox}>
            <Text style={styles.earningsLabel}>Platform Revenue</Text>
            <Text style={styles.earningsValue}>€{earnings}</Text>
          </View>
        ) : (
          <View style={styles.earningsBox}>
            <Text style={styles.earningsLabel}>Total Earned</Text>
            <Text style={styles.earningsValue}>€{earnings}</Text>
          </View>
        )}
      </View>

      {!editing ? (
        <View style={styles.infoSection}>
          {console.log("user.bio:", user?.bio)}
          <InfoRow label="Bio" value={user.bio} />
          <InfoRow label="Phone" value={user.phone} />
          <InfoRow label="Address" value={user.address} />
          <InfoRow label="City" value={user.city} />
          <InfoRow label="Zip Code" value={user.zip_code} />
          <InfoRow label="Country" value={user.country} />
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <Field label="Name" value={name} onChangeText={setName} />
          <Field
            label="Bio"
            value={bio}
            onChangeText={setBio}
            multiline={true}
          />
          <Field
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Field label="Address" value={address} onChangeText={setAddress} />
          <Field label="City" value={city} onChangeText={setCity} />
          <Field label="Zip Code" value={zipCode} onChangeText={setZipCode} />
          <Field label="Country" value={country} onChangeText={setCountry} />
          <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setEditing(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "Not set"}</Text>
    </View>
  );
}

function Field({ label, value, onChangeText, multiline, keyboardType }) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { height: 80 }]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#888"
        multiline={multiline}
        keyboardType={keyboardType || "default"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2D6BE4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarText: { fontSize: 40, fontWeight: "bold", color: "#fff" },
  name: { fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 4 },
  email: { fontSize: 14, color: "#888", marginBottom: 8 },
  badge: {
    backgroundColor: "#1A2A4A",
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: { color: "#2D6BE4", fontSize: 11, fontWeight: "bold" },
  earningsBox: {
    backgroundColor: "#1A2A4A",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  earningsLabel: { color: "#888", fontSize: 12, marginBottom: 4 },
  earningsValue: { color: "#2D6BE4", fontSize: 24, fontWeight: "bold" },
  infoSection: { padding: 20 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  infoLabel: { color: "#888", fontSize: 14 },
  infoValue: { color: "#fff", fontSize: 14 },
  editButton: {
    backgroundColor: "#2D6BE4",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  editButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  logoutButton: {
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  logoutText: { color: "#FF3B3B", fontWeight: "bold", fontSize: 16 },
  form: { padding: 20 },
  fieldContainer: { marginBottom: 16 },
  fieldLabel: { color: "#888", fontSize: 13, marginBottom: 6 },
  input: {
    backgroundColor: "#1A1A1A",
    color: "#fff",
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: "#2D6BE4",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelButton: {
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  cancelButtonText: { color: "#888", fontSize: 16 },
});
