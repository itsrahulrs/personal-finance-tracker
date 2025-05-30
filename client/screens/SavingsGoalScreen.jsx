import React, { useEffect, useState } from "react";
import {
  View, Text, ActivityIndicator, Alert, TouchableOpacity,
  Modal, TextInput, FlatList, StyleSheet, SafeAreaView,
  StatusBar, KeyboardAvoidingView, Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { BASE_URL } from "../config";

const SavingsGoalScreen = ({ navigation }) => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [goalName, setGoalName] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [deadline, setDeadline] = useState("");
    const [goalNameError, setGoalNameError] = useState("");
    const [targetAmountError, setTargetAmountError] = useState("");
    const [deadlineError, setDeadlineError] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [date, setDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            setRefreshing(true);
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch(`${BASE_URL}/savings-goals`, {
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
            setRefreshing(false);
        }
    };

    const filteredGoals = goals.filter(goal =>
        goal.goal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.target_amount.toString().includes(searchQuery)
    );

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
        if (!deadline) {
            setDeadlineError("Deadline is required.");
            valid = false;
        } else {
            setDeadlineError("");
        }
        return valid;
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setDeadline(formattedDate);
            setDeadlineError("");
        }
    };

    const addGoal = async () => {
        if (!validateInputs()) return;

        try {
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch(`${BASE_URL}/savings-goals`, {
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
                Alert.alert("Success", "Savings goal added successfully!");
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
            const response = await fetch(`${BASE_URL}/savings-goals/${selectedGoal.id}`, {
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
                Alert.alert("Success", "Savings goal updated successfully!");
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
        setDate(new Date());
    };

    const openEditModal = (goal) => {
        setSelectedGoal(goal);
        setGoalName(goal.goal_name);
        setTargetAmount(goal.target_amount.toString());
        setDeadline(goal.deadline);
        setDate(new Date(goal.deadline));
        setEditMode(true);
        setModalVisible(true);
    };

    const openViewModal = (goal) => {
        setSelectedGoal(goal);
        setViewModalVisible(true);
    };

    const deleteGoal = async (goalId) => {
        Alert.alert(
            "Delete Savings Goal",
            "Are you sure you want to delete this savings goal?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("authToken");
                            const response = await fetch(`${BASE_URL}/savings-goals/${goalId}`, {
                                method: "DELETE",
                                headers: {
                                    "Authorization": `Bearer ${token}`,
                                },
                            });

                            if (response.ok) {
                                setGoals(goals.filter(goal => goal.id !== goalId));
                                Alert.alert("Success", "Savings goal deleted successfully!");
                            } else {
                                Alert.alert("Error", "Failed to delete savings goal.");
                            }
                        } catch (error) {
                            console.error("Delete Goal Error:", error);
                            Alert.alert("Error", "Could not delete savings goal.");
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C63FF" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Savings Goals</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        setEditMode(false);
                        clearForm();
                        setModalVisible(true);
                    }}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search goals..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
                {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Goals List */}
            {filteredGoals.length > 0 ? (
                <FlatList
                    data={filteredGoals}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.goalCard}
                            onPress={() => openViewModal(item)}
                        >
                            <View style={styles.goalInfo}>
                                <View style={[styles.goalIcon, { backgroundColor: '#6C63FF20' }]}>
                                    <MaterialIcons name="savings" size={24} color="#6C63FF" />
                                </View>
                                <View style={styles.goalText}>
                                    <Text style={styles.goalName}>{item.goal_name}</Text>
                                    <Text style={styles.goalAmount}>₹{item.target_amount.toLocaleString()}</Text>
                                    <Text style={styles.goalDeadline}>Target: {item.deadline}</Text>
                                </View>
                            </View>
                            <View style={styles.goalActions}>
                                <TouchableOpacity 
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        openEditModal(item);
                                    }}
                                    style={styles.actionButton}
                                >
                                    <Feather name="edit" size={18} color="#6C63FF" />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        deleteGoal(item.id);
                                    }}
                                    style={styles.actionButton}
                                >
                                    <Feather name="trash-2" size={18} color="#ff4444" />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    )}
                    refreshing={refreshing}
                    onRefresh={fetchGoals}
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="wallet-outline" size={50} color="#6C63FF" />
                    <Text style={styles.emptyText}>No savings goals found</Text>
                    <Text style={styles.emptySubtext}>
                        {searchQuery ? "Try a different search" : "Add a new goal to get started"}
                    </Text>
                </View>
            )}

            {/* Add/Edit Goal Modal */}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => {
                    setModalVisible(false);
                    clearForm();
                }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalContainer}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => {
                            setModalVisible(false);
                            clearForm();
                        }}
                    />
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editMode ? "Edit Savings Goal" : "Add Savings Goal"}
                        </Text>
                        
                        <Text style={styles.inputLabel}>Goal Name *</Text>
                        <TextInput
                            placeholder="Enter goal name"
                            placeholderTextColor="#999"
                            value={goalName}
                            onChangeText={(text) => {
                                setGoalName(text);
                                if (text.trim()) setGoalNameError("");
                            }}
                            style={[
                                styles.modalInput,
                                goalNameError ? styles.inputError : null,
                            ]}
                            autoFocus
                        />
                        {goalNameError ? (
                            <Text style={styles.errorText}>{goalNameError}</Text>
                        ) : null}

                        <Text style={styles.inputLabel}>Target Amount *</Text>
                        <TextInput
                            placeholder="Enter target amount"
                            placeholderTextColor="#999"
                            value={targetAmount}
                            onChangeText={(text) => {
                                setTargetAmount(text);
                                if (text.trim() && !isNaN(text)) setTargetAmountError("");
                            }}
                            style={[
                                styles.modalInput,
                                targetAmountError ? styles.inputError : null,
                            ]}
                            keyboardType="numeric"
                        />
                        {targetAmountError ? (
                            <Text style={styles.errorText}>{targetAmountError}</Text>
                        ) : null}

                        <Text style={styles.inputLabel}>Deadline *</Text>
                        <TouchableOpacity
                            style={[
                                styles.modalInput,
                                styles.dateInput,
                                deadlineError ? styles.inputError : null,
                            ]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={deadline ? {} : { color: '#999' }}>
                                {deadline || "Select deadline (YYYY-MM-DD)"}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                                minimumDate={new Date()}
                            />
                        )}
                        {deadlineError ? (
                            <Text style={styles.errorText}>{deadlineError}</Text>
                        ) : null}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setModalVisible(false);
                                    clearForm();
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.submitButton]}
                                onPress={editMode ? updateGoal : addGoal}
                            >
                                <Text style={styles.submitButtonText}>
                                    {editMode ? "Update" : "Add"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* View Goal Modal */}
            <Modal
                transparent={true}
                visible={viewModalVisible}
                animationType="fade"
                onRequestClose={() => setViewModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setViewModalVisible(false)}
                    />
                    {selectedGoal && (
                        <View style={styles.viewModalContent}>
                            <View style={styles.viewModalHeader}>
                                <MaterialIcons name="savings" size={30} color="#6C63FF" />
                                <Text style={styles.viewModalTitle}>{selectedGoal.goal_name}</Text>
                            </View>
                            
                            <View style={styles.viewModalSection}>
                                <Text style={styles.viewModalLabel}>Target Amount</Text>
                                <Text style={styles.viewModalValue}>₹{selectedGoal.target_amount.toLocaleString()}</Text>
                            </View>
                            
                            <View style={styles.viewModalSection}>
                                <Text style={styles.viewModalLabel}>Deadline</Text>
                                <Text style={styles.viewModalValue}>{selectedGoal.deadline}</Text>
                            </View>
                            
                            <View style={styles.viewModalSection}>
                                <Text style={styles.viewModalLabel}>Progress</Text>
                                <View style={styles.progressBar}>
                                    <View 
                                        style={[
                                            styles.progressFill,
                                            { width: `${Math.min(100, (selectedGoal.current_amount / selectedGoal.target_amount) * 100)}%` }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.progressText}>
                                    ₹{selectedGoal.current_amount.toLocaleString()} of ₹{selectedGoal.target_amount.toLocaleString()} saved
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.viewModalClose}
                                onPress={() => setViewModalVisible(false)}
                            >
                                <Text style={styles.viewModalCloseText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        paddingBottom: 10,
        backgroundColor: "#fff",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    addButton: {
        backgroundColor: "#6C63FF",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginHorizontal: 20,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: "#333",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    goalCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    goalInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    goalIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    goalText: {
        flex: 1,
    },
    goalName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 3,
    },
    goalAmount: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#6C63FF",
        marginBottom: 3,
    },
    goalDeadline: {
        fontSize: 14,
        color: "#666",
    },
    goalActions: {
        flexDirection: "row",
    },
    actionButton: {
        marginLeft: 15,
        padding: 5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        color: "#333",
        marginTop: 15,
        textAlign: "center",
    },
    emptySubtext: {
        fontSize: 14,
        color: "#666",
        marginTop: 5,
        textAlign: "center",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 25,
        paddingBottom: 30,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 20,
        textAlign: "center",
    },
    inputLabel: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
        marginTop: 15,
    },
    modalInput: {
        backgroundColor: "#f8f9fa",
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        color: "#333",
        borderWidth: 1,
        borderColor: "#eee",
    },
    dateInput: {
        justifyContent: 'center',
    },
    inputError: {
        borderColor: "#ff4444",
    },
    errorText: {
        color: "#ff4444",
        fontSize: 14,
        marginTop: 5,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 25,
    },
    modalButton: {
        flex: 1,
        borderRadius: 10,
        padding: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#f8f9fa",
        marginRight: 10,
    },
    cancelButtonText: {
        color: "#333",
        fontSize: 16,
        fontWeight: "600",
    },
    submitButton: {
        backgroundColor: "#6C63FF",
        marginLeft: 10,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    viewModalContent: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 25,
        width: '90%',
        alignSelf: 'center',
    },
    viewModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    viewModalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 15,
        color: '#333',
    },
    viewModalSection: {
        marginBottom: 20,
    },
    viewModalLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    viewModalValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    progressBar: {
        height: 10,
        backgroundColor: '#eee',
        borderRadius: 5,
        marginVertical: 10,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#6C63FF',
        borderRadius: 5,
    },
    progressText: {
        fontSize: 14,
        color: '#666',
    },
    viewModalClose: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#6C63FF',
        borderRadius: 10,
        alignItems: 'center',
    },
    viewModalCloseText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SavingsGoalScreen;