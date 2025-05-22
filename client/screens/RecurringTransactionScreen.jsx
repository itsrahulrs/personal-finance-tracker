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
  ScrollView, // Added for better form scrolling
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

const RecurringTransactionsScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // State for new recurring transaction fields
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState(""); // 'income' or 'expense'
  const [frequency, setFrequency] = useState(""); // 'daily', 'weekly', 'monthly', 'yearly'
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState(""); // YYYY-MM-DD

  const [errors, setErrors] = useState({});

  const API_BASE_URL = "http://192.168.31.167:8000/api/recurring-transactions";

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
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
        setTransactions(data.data); // Assuming 'data.data' holds the array of transactions
      } else {
        Alert.alert("Error", data.message || "Failed to load recurring transactions");
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
    if (!title.trim()) newErrors.title = "Title is required";
    if (!amount.trim() || isNaN(amount) || Number(amount) <= 0) {
      newErrors.amount = "Enter a valid amount";
    }
    if (!type.trim() || !["income", "expense"].includes(type.toLowerCase())) {
      newErrors.type = "Type must be 'income' or 'expense'";
    }
    if (!frequency.trim() || !["daily", "weekly", "monthly", "yearly"].includes(frequency.toLowerCase())) {
      newErrors.frequency = "Frequency must be 'daily', 'weekly', 'monthly', or 'yearly'";
    }
    if (!startDate.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      newErrors.startDate = "Enter start date in YYYY-MM-DD format";
    }
    // End date can be optional, but if present, validate format
    if (endDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        newErrors.endDate = "Enter end date in YYYY-MM-DD format or leave blank";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearForm = () => {
    setTitle("");
    setAmount("");
    setType("");
    setFrequency("");
    setStartDate("");
    setEndDate("");
    setErrors({});
  };

  const openAddModal = () => {
    clearForm();
    setEditMode(false);
    setSelectedTransaction(null);
    setModalVisible(true);
  };

  const openEditModal = (transaction) => {
    setSelectedTransaction(transaction);
    setTitle(transaction.title);
    setAmount(transaction.amount.toString());
    setType(transaction.type);
    setFrequency(transaction.frequency);
    setStartDate(transaction.start_date);
    setEndDate(transaction.end_date || ""); // Handle cases where end_date might be null
    setEditMode(true);
    setModalVisible(true);
  };

  const addTransaction = async () => {
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
          title: title,
          amount: Number(amount),
          type: type.toLowerCase(),
          frequency: frequency.toLowerCase(),
          start_date: startDate,
          end_date: endDate.trim() ? endDate : null, // Send null if end_date is empty
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setTransactions([...transactions, data.data]); // Assuming data.data is the new transaction object
        setModalVisible(false);
        clearForm();
      } else {
        Alert.alert("Error", data.message || "Failed to add recurring transaction");
      }
    } catch (error) {
      console.error("Add error:", error);
      Alert.alert("Error", "Network error");
    }
  };

  const updateTransaction = async () => {
    if (!validate()) return;
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}/${selectedTransaction.id}`,
        {
          method: "PUT", // Or 'PATCH' depending on your API
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title,
            amount: Number(amount),
            type: type.toLowerCase(),
            frequency: frequency.toLowerCase(),
            start_date: startDate,
            end_date: endDate.trim() ? endDate : null,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setTransactions(
          transactions.map((t) => (t.id === selectedTransaction.id ? data.data : t))
        );
        setModalVisible(false);
        clearForm();
        setEditMode(false);
      } else {
        Alert.alert("Error", data.message || "Failed to update recurring transaction");
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Network error");
    }
  };

  const deleteTransaction = (id) => {
    Alert.alert("Confirm", "Delete this recurring transaction?", [
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
              setTransactions(transactions.filter((t) => t.id !== id));
            } else {
              Alert.alert("Error", "Failed to delete recurring transaction");
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
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.header}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEditModal(item)}>
                  <MaterialIcons name="edit" size={24} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTransaction(item.id)}>
                  <MaterialIcons name="delete" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.amount}>
              {item.type === 'expense' ? 'Paid:' : 'Received:'} ₹{item.amount.toLocaleString()}
            </Text>
            <Text style={styles.type}>Type: {item.type}</Text>
            <Text style={styles.frequency}>Frequency: {item.frequency}</Text>
            <Text style={styles.dates}>Starts: {item.start_date}</Text>
            {item.end_date && <Text style={styles.dates}>Ends: {item.end_date}</Text>}
          </View>
        )}
      />
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText}>+ Add Recurring Transaction</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>
                {editMode ? "Edit Recurring Transaction" : "Add Recurring Transaction"}
              </Text>

              <TextInput
                placeholder="Title (e.g., Amazon Subscription)"
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (text.trim()) setErrors((e) => ({ ...e, title: "" }));
                }}
                style={[styles.input, errors.title && styles.inputError]}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

              <TextInput
                placeholder="Amount"
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  if (text.trim()) setErrors((e) => ({ ...e, amount: "" }));
                }}
                style={[styles.input, errors.amount && styles.inputError]}
                keyboardType="numeric"
              />
              {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}

              <TextInput
                placeholder="Type (income or expense)"
                value={type}
                onChangeText={(text) => {
                  setType(text);
                  if (text.trim()) setErrors((e) => ({ ...e, type: "" }));
                }}
                style={[styles.input, errors.type && styles.inputError]}
                autoCapitalize="none"
              />
              {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}

              <TextInput
                placeholder="Frequency (daily, weekly, monthly, or yearly)"
                value={frequency}
                onChangeText={(text) => {
                  setFrequency(text);
                  if (text.trim()) setErrors((e) => ({ ...e, frequency: "" }));
                }}
                style={[styles.input, errors.frequency && styles.inputError]}
                autoCapitalize="none"
              />
              {errors.frequency && <Text style={styles.errorText}>{errors.frequency}</Text>}

              <TextInput
                placeholder="Start Date (YYYY-MM-DD)"
                value={startDate}
                onChangeText={(text) => {
                  setStartDate(text);
                  if (text.trim()) setErrors((e) => ({ ...e, startDate: "" }));
                }}
                style={[styles.input, errors.startDate && styles.inputError]}
                maxLength={10}
              />
              {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}

              <TextInput
                placeholder="End Date (YYYY-MM-DD) - Optional"
                value={endDate}
                onChangeText={(text) => {
                  setEndDate(text);
                  if (text.trim()) setErrors((e) => ({ ...e, endDate: "" }));
                }}
                style={[styles.input, errors.endDate && styles.inputError]}
                maxLength={10}
              />
              {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}

              <TouchableOpacity
                style={styles.modalButton}
                onPress={editMode ? updateTransaction : addTransaction}
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
  title: { fontSize: 18, fontWeight: "bold", color: "#333" },
  amount: { fontSize: 16, fontWeight: "bold", color: "#28a745", marginTop: 4 }, // Green for income, adjust as needed
  type: { fontSize: 14, color: "#6c757d" },
  frequency: { fontSize: 14, color: "#6c757d" },
  dates: { fontSize: 14, color: "#6c757d", marginTop: 2 },
  actions: { flexDirection: "row", gap: 15 },
  addButton: {
    backgroundColor: "#007BFF",
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
    paddingVertical: 20, // Add some vertical padding for scrolling
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
    backgroundColor: "#007BFF",
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
  modalCancelText: { color: "#007BFF", fontSize: 16 },
});

export default RecurringTransactionsScreen;