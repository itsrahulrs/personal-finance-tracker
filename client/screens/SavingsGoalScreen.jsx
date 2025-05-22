import React, { useEffect, useState } from "react";
import {
    View, Text, ActivityIndicator, Alert, TouchableOpacity,
    Modal, TextInput, FlatList, StyleSheet
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

const SavingsGoalScreen = ({ navigation }) => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [goalName, setGoalName] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [deadline, setDeadline] = useState("");
    const [goalNameError, setGoalNameError] = useState("");
    const [targetAmountError, setTargetAmountError] = useState("");
    const [deadlineError, setDeadlineError] = useState("");

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch("http://192.168.31.167:8000/api/savings-goals", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setGoals(data.data);
            } else {
                Alert.alert("Error", data.message || "Failed to load savings goals.");
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            Alert.alert("Error", "Network request failed.");
        } finally {
            setLoading(false);
        }
    };

    const validateInputs = () => {
        let valid = true;
        if (!goalName.trim()) {
            setGoalNameError("Goal name is required.");
            valid = false;
        } else {
            setGoalNameError("");
        }
        if (!targetAmount.trim() || isNaN(targetAmount) || Number(targetAmount) <= 0) {
            setTargetAmountError("Enter a valid target amount.");
            valid = false;
        } else {
            setTargetAmountError("");
        }
        // Simple YYYY-MM-DD date format validation
        if (!deadline.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
            setDeadlineError("Enter deadline in YYYY-MM-DD format.");
            valid = false;
        } else {
            setDeadlineError("");
        }
        return valid;
    };

    const addGoal = async () => {
        if (!validateInputs()) return;

        try {
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch("http://192.168.31.167:8000/api/savings-goals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    goal_name: goalName,
                    target_amount: Number(targetAmount),
                    deadline: deadline,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setGoals([...goals, data.data]);
                clearForm();
                setModalVisible(false);
            } else {
                Alert.alert("Error", data.message || "Failed to add savings goal.");
            }
        } catch (error) {
            console.error("Add Goal Error:", error);
            Alert.alert("Error", "Could not add savings goal.");
        }
    };

    const updateGoal = async () => {
        if (!validateInputs()) return;

        try {
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch(`http://192.168.31.167:8000/api/savings-goals/${selectedGoal.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    goal_name: goalName,
                    target_amount: Number(targetAmount),
                    deadline: deadline,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setGoals(goals.map(goal => goal.id === selectedGoal.id ? data.data : goal));
                clearForm();
                setModalVisible(false);
                setEditMode(false);
            } else {
                Alert.alert("Error", data.message || "Failed to update savings goal.");
            }
        } catch (error) {
            console.error("Update Goal Error:", error);
            Alert.alert("Error", "Could not update savings goal.");
        }
    };

    const clearForm = () => {
        setGoalName("");
        setTargetAmount("");
        setDeadline("");
        setGoalNameError("");
        setTargetAmountError("");
        setDeadlineError("");
    };

    const openEditModal = (goal) => {
        setSelectedGoal(goal);
        setGoalName(goal.goal_name);
        setTargetAmount(goal.target_amount.toString());
        setDeadline(goal.deadline);
        setEditMode(true);
        setModalVisible(true);
    };

    const deleteGoal = async (goalId) => {
        Alert.alert("Confirm", "Are you sure you want to delete this savings goal?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem("authToken");
                        const response = await fetch(`http://192.168.31.167:8000/api/savings-goals/${goalId}`, {
                            method: "DELETE",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                            },
                        });

                        if (response.ok) {
                            setGoals(goals.filter(goal => goal.id !== goalId));
                        } else {
                            Alert.alert("Error", "Failed to delete savings goal.");
                        }
                    } catch (error) {
                        console.error("Delete Goal Error:", error);
                        Alert.alert("Error", "Could not delete savings goal.");
                    }
                }
            }
        ]);
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={goals}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <View style={styles.header}>
                            <Text style={styles.name}>{item.goal_name}</Text>
                            <View style={styles.actions}>
                                <TouchableOpacity onPress={() => openEditModal(item)}>
                                    <MaterialIcons name="edit" size={24} color="blue" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => deleteGoal(item.id)}>
                                    <MaterialIcons name="delete" size={24} color="red" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text style={styles.description}>Target: ₹{item.target_amount.toLocaleString()}</Text>
                        <Text style={styles.description}>Deadline: {item.deadline}</Text>
                    </View>
                )}
            />

            <TouchableOpacity style={styles.addButton} onPress={() => {
                setEditMode(false);
                clearForm();
                setModalVisible(true);
            }}>
                <Text style={styles.addButtonText}>+ Add Savings Goal</Text>
            </TouchableOpacity>

            <Modal transparent={true} visible={modalVisible} animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>{editMode ? "Edit Savings Goal" : "Add Savings Goal"}</Text>
                        <TextInput
                            placeholder="Goal Name"
                            value={goalName}
                            onChangeText={(text) => {
                                setGoalName(text);
                                if (text.trim()) setGoalNameError("");
                            }}
                            style={[styles.input, goalNameError ? styles.inputError : null]}
                        />
                        {goalNameError ? <Text style={styles.errorText}>{goalNameError}</Text> : null}

                        <TextInput
                            placeholder="Target Amount"
                            keyboardType="numeric"
                            value={targetAmount}
                            onChangeText={(text) => {
                                setTargetAmount(text);
                                if (text.trim() && !isNaN(text)) setTargetAmountError("");
                            }}
                            style={[styles.input, targetAmountError ? styles.inputError : null]}
                        />
                        {targetAmountError ? <Text style={styles.errorText}>{targetAmountError}</Text> : null}

                        <TextInput
                            placeholder="Deadline (YYYY-MM-DD)"
                            value={deadline}
                            onChangeText={(text) => {
                                setDeadline(text);
                                if (/^\d{4}-\d{2}-\d{2}$/.test(text)) setDeadlineError("");
                            }}
                            style={[styles.input, deadlineError ? styles.inputError : null]}
                        />
                        {deadlineError ? <Text style={styles.errorText}>{deadlineError}</Text> : null}

                        <TouchableOpacity style={styles.modalButton} onPress={editMode ? updateGoal : addGoal}>
                            <Text style={styles.modalButtonText}>{editMode ? "Update" : "Add"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
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
    name: { fontSize: 18, fontWeight: "bold" },
    description: { fontSize: 14, color: "#555", marginTop: 4 },
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

export default SavingsGoalScreen;
