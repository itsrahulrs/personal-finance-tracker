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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

const CreditCardRemindersScreen = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);

  const [cardName, setCardName] = useState("");
  const [bankName, setBankName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [dueAmount, setDueAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch("http://192.168.31.167:8000/api/credit-card-reminders", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok) {
        setReminders(data.data);
      } else {
        Alert.alert("Error", data.message || "Failed to load reminders");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!cardName.trim()) newErrors.cardName = "Card Name is required";
    if (!bankName.trim()) newErrors.bankName = "Bank Name is required";
    if (!cardNumber.trim()) {
      newErrors.cardNumber = "Card Number is required";
    }
    if (!dueAmount.trim() || isNaN(dueAmount) || Number(dueAmount) <= 0) {
      newErrors.dueAmount = "Enter a valid due amount";
    }
    if (!dueDate.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      newErrors.dueDate = "Enter due date in YYYY-MM-DD format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearForm = () => {
    setCardName("");
    setBankName("");
    setCardNumber("");
    setDueAmount("");
    setDueDate("");
    setErrors({});
  };

  const openAddModal = () => {
    clearForm();
    setEditMode(false);
    setSelectedReminder(null);
    setModalVisible(true);
  };

  const openEditModal = (reminder) => {
    setSelectedReminder(reminder);
    setCardName(reminder.card_name);
    setBankName(reminder.bank_name);
    setCardNumber(reminder.card_number);
    setDueAmount(reminder.due_amount.toString());
    setDueDate(reminder.due_date);
    setEditMode(true);
    setModalVisible(true);
  };

  const addReminder = async () => {
    if (!validate()) return;
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch("http://192.168.31.167:8000/api/credit-card-reminders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          card_name: cardName,
          bank_name: bankName,
          card_number: cardNumber,
          due_amount: Number(dueAmount),
          due_date: dueDate,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setReminders([...reminders, data.data]);
        setModalVisible(false);
        clearForm();
      } else {
        Alert.alert("Error", data.message || "Failed to add reminder");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
    }
  };

  const updateReminder = async () => {
    if (!validate()) return;
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(
        `http://192.168.31.167:8000/api/credit-card-reminders/${selectedReminder.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            card_name: cardName,
            bank_name: bankName,
            card_number: cardNumber,
            due_amount: Number(dueAmount),
            due_date: dueDate,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setReminders(
          reminders.map((r) => (r.id === selectedReminder.id ? data.data : r))
        );
        setModalVisible(false);
        clearForm();
        setEditMode(false);
      } else {
        Alert.alert("Error", data.message || "Failed to update reminder");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
    }
  };

  const deleteReminder = (id) => {
    Alert.alert("Confirm", "Delete this reminder?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch(
              `http://192.168.31.167:8000/api/credit-card-reminders/${id}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (response.ok) {
              setReminders(reminders.filter((r) => r.id !== id));
            } else {
              Alert.alert("Error", "Failed to delete reminder");
            }
          } catch (error) {
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
        data={reminders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.header}>
              <Text style={styles.cardName}>{item.card_name}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEditModal(item)}>
                  <MaterialIcons name="edit" size={24} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteReminder(item.id)}>
                  <MaterialIcons name="delete" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.bankName}>{item.bank_name}</Text>
            <Text style={styles.cardNumber}>{item.card_number}</Text>
            <Text style={styles.dueAmount}>Due: ₹{item.due_amount.toLocaleString()}</Text>
            <Text style={styles.dueDate}>Due Date: {item.due_date}</Text>
          </View>
        )}
      />
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText}>+ Add Credit Card Reminder</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editMode ? "Edit Reminder" : "Add Reminder"}
            </Text>

            <TextInput
              placeholder="Card Name"
              value={cardName}
              onChangeText={(text) => {
                setCardName(text);
                if (text.trim()) setErrors((e) => ({ ...e, cardName: "" }));
              }}
              style={[styles.input, errors.cardName && styles.inputError]}
            />
            {errors.cardName && <Text style={styles.errorText}>{errors.cardName}</Text>}

            <TextInput
              placeholder="Bank Name"
              value={bankName}
              onChangeText={(text) => {
                setBankName(text);
                if (text.trim()) setErrors((e) => ({ ...e, bankName: "" }));
              }}
              style={[styles.input, errors.bankName && styles.inputError]}
            />
            {errors.bankName && <Text style={styles.errorText}>{errors.bankName}</Text>}

            <TextInput
              placeholder="Card Number"
              value={cardNumber}
              onChangeText={(text) => {
                setCardNumber(text);
                if (text.trim()) setErrors((e) => ({ ...e, cardNumber: "" }));
              }}
              style={[styles.input, errors.cardNumber && styles.inputError]}
              maxLength={19}
            />
            {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}

            <TextInput
              placeholder="Due Amount"
              value={dueAmount}
              onChangeText={(text) => {
                setDueAmount(text);
                if (text.trim()) setErrors((e) => ({ ...e, dueAmount: "" }));
              }}
              style={[styles.input, errors.dueAmount && styles.inputError]}
              keyboardType="numeric"
            />
            {errors.dueAmount && <Text style={styles.errorText}>{errors.dueAmount}</Text>}

            <TextInput
              placeholder="Due Date (YYYY-MM-DD)"
              value={dueDate}
              onChangeText={(text) => {
                setDueDate(text);
                if (text.trim()) setErrors((e) => ({ ...e, dueDate: "" }));
              }}
              style={[styles.input, errors.dueDate && styles.inputError]}
              maxLength={10}
            />
            {errors.dueDate && <Text style={styles.errorText}>{errors.dueDate}</Text>}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={editMode ? updateReminder : addReminder}
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
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  item: { padding: 15, borderBottomColor: "#ddd", borderBottomWidth: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardName: { fontSize: 18, fontWeight: "bold" },
  bankName: { fontSize: 14, color: "#555" },
  cardNumber: { fontSize: 14, color: "#333", marginTop: 4 },
  dueAmount: { fontSize: 16, fontWeight: "bold", marginTop: 8, color: "#D9534F" },
  dueDate: { fontSize: 14, marginTop: 2, color: "#777" },
  actions: { flexDirection: "row", gap: 15 },
  addButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 10,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  inputError: { borderColor: "red" },
  errorText: { color: "red", marginBottom: 8 },
  modalButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  modalButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalCancel: {
    padding: 10,
    alignItems: "center",
    marginTop: 10,
  },
  modalCancelText: { color: "#007BFF", fontSize: 16 },
});

export default CreditCardRemindersScreen;
