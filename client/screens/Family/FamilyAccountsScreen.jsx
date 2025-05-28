import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

const FamilyAccountsScreen = () => {
  const [familyAccounts, setFamilyAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // State for family account fields
  const [name, setName] = useState("");
  const [ownerId, setOwnerId] = useState(""); // owner_id is an integer

  const [errors, setErrors] = useState({});

  const API_BASE_URL = "http://192.168.31.167:8000/api/family-accounts";

  useEffect(() => {
    fetchFamilyAccounts();
  }, []);

  const fetchFamilyAccounts = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok) {
        setFamilyAccounts(data.data); // Assuming 'data.data' holds the array of accounts
      } else {
        Alert.alert("Error", data.message || "Failed to load family accounts");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", "Network error or failed to connect to API");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Account Name is required";
    if (!ownerId.trim() || isNaN(ownerId) || Number(ownerId) <= 0) {
      newErrors.ownerId = "Owner ID must be a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearForm = () => {
    setName("");
    setOwnerId("");
    setErrors({});
  };

  const openAddModal = () => {
    clearForm();
    setEditMode(false);
    setSelectedAccount(null);
    setModalVisible(true);
  };

  const openEditModal = (account) => {
    setSelectedAccount(account);
    setName(account.name);
    setOwnerId(account.owner_id.toString()); // Convert owner_id to string for TextInput
    setEditMode(true);
    setModalVisible(true);
  };

  const addFamilyAccount = async () => {
    if (!validate()) return;
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          owner_id: Number(ownerId), // Convert owner_id to Number for API
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setFamilyAccounts([...familyAccounts, data.data]); // Assuming data.data is the new account object
        setModalVisible(false);
        clearForm();
      } else {
        Alert.alert("Error", data.message || "Failed to add family account");
      }
    } catch (error) {
      console.error("Add error:", error);
      Alert.alert("Error", "Network error");
    }
  };

  const updateFamilyAccount = async () => {
    if (!validate()) return;
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}/${selectedAccount.id}`,
        {
          method: "PUT", // Or 'PATCH' depending on your API
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name,
            owner_id: Number(ownerId),
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setFamilyAccounts(
          familyAccounts.map((acc) => (acc.id === selectedAccount.id ? data.data : acc))
        );
        setModalVisible(false);
        clearForm();
        setEditMode(false);
      } else {
        Alert.alert("Error", data.message || "Failed to update family account");
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Network error");
    }
  };

  const deleteFamilyAccount = (id) => {
    Alert.alert("Confirm", "Delete this family account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch(`${API_BASE_URL}/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
              setFamilyAccounts(familyAccounts.filter((acc) => acc.id !== id));
            } else {
              Alert.alert("Error", "Failed to delete family account");
            }
          } catch (error) {
            console.error("Delete error:", error);
            Alert.alert("Error", "Network error");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={familyAccounts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.header}>
              <Text style={styles.accountName}>{item.name}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEditModal(item)}>
                  <MaterialIcons name="edit" size={24} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteFamilyAccount(item.id)}>
                  <MaterialIcons name="delete" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.ownerId}>Owner ID: {item.owner_id}</Text>
            {/* Add more fields here if your API returns them, e.g., created_at */}
          </View>
        )}
      />
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText}>+ Add Family Account</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>
                {editMode ? "Edit Family Account" : "Add Family Account"}
              </Text>

              <TextInput
                placeholder="Account Name (e.g., Trip Expense)"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (text.trim()) setErrors((e) => ({ ...e, name: "" }));
                }}
                style={[styles.input, errors.name && styles.inputError]}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

              <TextInput
                placeholder="Owner ID"
                value={ownerId}
                onChangeText={(text) => {
                  setOwnerId(text);
                  if (text.trim()) setErrors((e) => ({ ...e, ownerId: "" }));
                }}
                style={[styles.input, errors.ownerId && styles.inputError]}
                keyboardType="numeric"
              />
              {errors.ownerId && <Text style={styles.errorText}>{errors.ownerId}</Text>}

              <TouchableOpacity
                style={styles.modalButton}
                onPress={editMode ? updateFamilyAccount : addFamilyAccount}
              >
                <Text style={styles.modalButtonText}>{editMode ? "Update" : "Add"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  setModalVisible(false);
                  clearForm();
                  setEditMode(false);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f8f8f8" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  item: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  accountName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  ownerId: { fontSize: 14, color: "#6c757d" },
  actions: { flexDirection: "row", gap: 15 },
  addButton: {
    backgroundColor: "#28a745", // Green for 'Add Family Account'
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
    elevation: 2,
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  modal: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 15,
  },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#fefefe",
    color: "#333",
  },
  inputError: { borderColor: "red" },
  errorText: { color: "red", marginBottom: 10, fontSize: 12 },
  modalButton: {
    backgroundColor: "#28a745", // Green for modal button
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
    elevation: 3,
  },
  modalButtonText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  modalCancel: {
    padding: 12,
    alignItems: "center",
    marginTop: 10,
  },
  modalCancelText: { color: "#28a745", fontSize: 16 },
});

export default FamilyAccountsScreen;