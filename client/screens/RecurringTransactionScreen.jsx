import React, { useEffect, useState, useMemo } from "react";
import {
  View, Text, ActivityIndicator, Alert, TouchableOpacity,
  Modal, TextInput, FlatList, StyleSheet, SafeAreaView,
  StatusBar, KeyboardAvoidingView, Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from "react-native-dropdown-picker";

const RecurringTransactionsScreen = ({ navigation }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("expense");
    const [frequency, setFrequency] = useState("monthly");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [startDateValue, setStartDateValue] = useState(new Date());
    const [endDateValue, setEndDateValue] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all"); // 'all', 'income', 'expense'
    const [typeOpen, setTypeOpen] = useState(false);
    const [frequencyOpen, setFrequencyOpen] = useState(false);

    const typeItems = [
        { label: "Expense", value: "expense" },
        { label: "Income", value: "income" }
    ];

    const frequencyItems = [
        { label: "Daily", value: "daily" },
        { label: "Weekly", value: "weekly" },
        { label: "Monthly", value: "monthly" },
        { label: "Yearly", value: "yearly" }
    ];

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setRefreshing(true);
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch("http://192.168.31.167:8000/api/recurring-transactions", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setTransactions(data.data);
            } else {
                Alert.alert("Error", data.message || "Failed to load transactions.");
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            Alert.alert("Error", "Network request failed.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction => {
            const matchesSearch = transaction.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filter === "all" || transaction.type === filter;
            return matchesSearch && matchesType;
        });
    }, [transactions, searchQuery, filter]);

    const handleStartDateChange = (event, selectedDate) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setStartDateValue(selectedDate);
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setStartDate(formattedDate);
        }
    };

    const handleEndDateChange = (event, selectedDate) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setEndDateValue(selectedDate);
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setEndDate(formattedDate);
        }
    };

    const validateInputs = () => {
        if (!title.trim()) {
            Alert.alert("Error", "Title is required.");
            return false;
        }
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            Alert.alert("Error", "Enter a valid amount.");
            return false;
        }
        if (!startDate) {
            Alert.alert("Error", "Start date is required.");
            return false;
        }
        if (endDate && new Date(endDate) < new Date(startDate)) {
            Alert.alert("Error", "End date must be after start date.");
            return false;
        }
        return true;
    };

    const addTransaction = async () => {
        if (!validateInputs()) return;

        try {
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch("http://192.168.31.167:8000/api/recurring-transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    amount: Number(amount),
                    type,
                    frequency,
                    start_date: startDate,
                    end_date: endDate || null,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setTransactions([...transactions, data.data]);
                clearForm();
                setModalVisible(false);
                Alert.alert("Success", "Recurring transaction added successfully!");
            } else {
                Alert.alert("Error", data.message || "Failed to add transaction.");
            }
        } catch (error) {
            console.error("Add Error:", error);
            Alert.alert("Error", "Could not add transaction.");
        }
    };

    const updateTransaction = async () => {
        if (!validateInputs()) return;

        try {
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch(`http://192.168.31.167:8000/api/recurring-transactions/${selectedTransaction.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    amount: Number(amount),
                    type,
                    frequency,
                    start_date: startDate,
                    end_date: endDate || null,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setTransactions(transactions.map(t => t.id === selectedTransaction.id ? data.data : t));
                clearForm();
                setModalVisible(false);
                setEditMode(false);
                Alert.alert("Success", "Transaction updated successfully!");
            } else {
                Alert.alert("Error", data.message || "Failed to update transaction.");
            }
        } catch (error) {
            console.error("Update Error:", error);
            Alert.alert("Error", "Could not update transaction.");
        }
    };

    const deleteTransaction = async (transactionId) => {
        Alert.alert(
            "Delete Transaction",
            "Are you sure you want to delete this recurring transaction?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("authToken");
                            const response = await fetch(`http://192.168.31.167:8000/api/recurring-transactions/${transactionId}`, {
                                method: "DELETE",
                                headers: {
                                    "Authorization": `Bearer ${token}`,
                                },
                            });

                            if (response.ok) {
                                setTransactions(transactions.filter(t => t.id !== transactionId));
                                Alert.alert("Success", "Transaction deleted successfully!");
                            } else {
                                Alert.alert("Error", "Failed to delete transaction.");
                            }
                        } catch (error) {
                            console.error("Delete Error:", error);
                            Alert.alert("Error", "Could not delete transaction.");
                        }
                    }
                }
            ]
        );
    };

    const clearForm = () => {
        setTitle("");
        setAmount("");
        setType("expense");
        setFrequency("monthly");
        setStartDate("");
        setEndDate("");
        setStartDateValue(new Date());
        setEndDateValue(new Date());
    };

    const openEditModal = (transaction) => {
        setSelectedTransaction(transaction);
        setTitle(transaction.title);
        setAmount(transaction.amount.toString());
        setType(transaction.type);
        setFrequency(transaction.frequency);
        setStartDate(transaction.start_date);
        setEndDate(transaction.end_date || "");
        setStartDateValue(new Date(transaction.start_date));
        setEndDateValue(transaction.end_date ? new Date(transaction.end_date) : new Date());
        setEditMode(true);
        setModalVisible(true);
    };

    const openViewModal = (transaction) => {
        setSelectedTransaction(transaction);
        setViewModalVisible(true);
    };

    const getFrequencyLabel = (frequency) => {
        switch (frequency) {
            case "daily": return "Daily";
            case "weekly": return "Weekly";
            case "monthly": return "Monthly";
            case "yearly": return "Yearly";
            default: return frequency;
        }
    };

    const getNextOccurrence = (startDate, frequency) => {
        const start = new Date(startDate);
        const today = new Date();
        
        if (frequency === "daily") {
            while (start <= today) {
                start.setDate(start.getDate() + 1);
            }
            return start.toDateString();
        }
        
        if (frequency === "weekly") {
            while (start <= today) {
                start.setDate(start.getDate() + 7);
            }
            return start.toDateString();
        }
        
        if (frequency === "monthly") {
            while (start <= today) {
                start.setMonth(start.getMonth() + 1);
            }
            return start.toDateString();
        }
        
        if (frequency === "yearly") {
            while (start <= today) {
                start.setFullYear(start.getFullYear() + 1);
            }
            return start.toDateString();
        }
        
        return "N/A";
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
                <Text style={styles.headerTitle}>Recurring Transactions</Text>
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
                    placeholder="Search transactions..."
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

            {/* Filter Buttons */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filter === "all" && styles.activeFilter]}
                    onPress={() => setFilter("all")}
                >
                    <Text style={[styles.filterText, filter === "all" && styles.activeFilterText]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === "income" && styles.activeFilter]}
                    onPress={() => setFilter("income")}
                >
                    <Text style={[styles.filterText, filter === "income" && styles.activeFilterText]}>Income</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === "expense" && styles.activeFilter]}
                    onPress={() => setFilter("expense")}
                >
                    <Text style={[styles.filterText, filter === "expense" && styles.activeFilterText]}>Expense</Text>
                </TouchableOpacity>
            </View>

            {/* Transactions List */}
            {filteredTransactions.length > 0 ? (
                <FlatList
                    data={filteredTransactions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.transactionCard}
                            onPress={() => openViewModal(item)}
                        >
                            <View style={styles.transactionHeader}>
                                <View style={[
                                    styles.transactionIcon, 
                                    { backgroundColor: item.type === "income" ? "#4CAF5020" : "#FF525220" }
                                ]}>
                                    <MaterialIcons 
                                        name={item.type === "income" ? "arrow-downward" : "arrow-upward"} 
                                        size={20} 
                                        color={item.type === "income" ? "#4CAF50" : "#FF5252"} 
                                    />
                                </View>
                                <View style={styles.transactionText}>
                                    <Text style={styles.transactionTitle}>{item.title}</Text>
                                    <Text style={[
                                        styles.transactionAmount,
                                        { color: item.type === "income" ? "#4CAF50" : "#FF5252" }
                                    ]}>
                                        {item.type === "income" ? "+" : "-"} ₹{item.amount.toLocaleString()}
                                    </Text>
                                </View>
                                <View style={styles.transactionActions}>
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
                                            deleteTransaction(item.id);
                                        }}
                                        style={styles.actionButton}
                                    >
                                        <Feather name="trash-2" size={18} color="#ff4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            
                            <View style={styles.transactionDetails}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Frequency:</Text>
                                    <Text style={styles.detailValue}>{getFrequencyLabel(item.frequency)}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Next Occurrence:</Text>
                                    <Text style={styles.detailValue}>{getNextOccurrence(item.start_date, item.frequency)}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Started:</Text>
                                    <Text style={styles.detailValue}>{new Date(item.start_date).toDateString()}</Text>
                                </View>
                                {item.end_date && (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Ends:</Text>
                                        <Text style={styles.detailValue}>{new Date(item.end_date).toDateString()}</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    )}
                    refreshing={refreshing}
                    onRefresh={fetchTransactions}
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="repeat-outline" size={50} color="#6C63FF" />
                    <Text style={styles.emptyText}>No recurring transactions found</Text>
                    <Text style={styles.emptySubtext}>
                        {searchQuery ? "Try a different search" : "Add a recurring transaction to get started"}
                    </Text>
                </View>
            )}

            {/* Add/Edit Transaction Modal */}
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
                            {editMode ? "Edit Recurring Transaction" : "Add Recurring Transaction"}
                        </Text>
                        
                        <Text style={styles.inputLabel}>Title *</Text>
                        <TextInput
                            placeholder="e.g., Netflix Subscription"
                            placeholderTextColor="#999"
                            value={title}
                            onChangeText={setTitle}
                            style={styles.modalInput}
                            autoFocus
                        />

                        <Text style={styles.inputLabel}>Amount *</Text>
                        <TextInput
                            placeholder="0.00"
                            placeholderTextColor="#999"
                            value={amount}
                            onChangeText={setAmount}
                            style={styles.modalInput}
                            keyboardType="numeric"
                        />

                        <Text style={styles.inputLabel}>Type *</Text>
                        <View style={[styles.dropdownContainer, typeOpen && { zIndex: 2000 }]}>
                            <DropDownPicker
                                open={typeOpen}
                                value={type}
                                items={typeItems}
                                setOpen={setTypeOpen}
                                setValue={setType}
                                setItems={() => {}}
                                placeholder="Select type"
                                style={styles.dropdown}
                                dropDownContainerStyle={styles.dropdownList}
                            />
                        </View>

                        <Text style={styles.inputLabel}>Frequency *</Text>
                        <View style={[styles.dropdownContainer, frequencyOpen && { zIndex: 1000 }]}>
                            <DropDownPicker
                                open={frequencyOpen}
                                value={frequency}
                                items={frequencyItems}
                                setOpen={setFrequencyOpen}
                                setValue={setFrequency}
                                setItems={() => {}}
                                placeholder="Select frequency"
                                style={styles.dropdown}
                                dropDownContainerStyle={styles.dropdownList}
                            />
                        </View>

                        <Text style={styles.inputLabel}>Start Date *</Text>
                        <TouchableOpacity
                            style={[styles.modalInput, styles.dateInput]}
                            onPress={() => setShowStartDatePicker(true)}
                        >
                            <Text style={startDate ? {} : { color: '#999' }}>
                                {startDate || "Select start date"}
                            </Text>
                        </TouchableOpacity>
                        {showStartDatePicker && (
                            <DateTimePicker
                                value={startDateValue}
                                mode="date"
                                display="default"
                                onChange={handleStartDateChange}
                            />
                        )}

                        <Text style={styles.inputLabel}>End Date (Optional)</Text>
                        <TouchableOpacity
                            style={[styles.modalInput, styles.dateInput]}
                            onPress={() => setShowEndDatePicker(true)}
                        >
                            <Text style={endDate ? {} : { color: '#999' }}>
                                {endDate || "Select end date (optional)"}
                            </Text>
                        </TouchableOpacity>
                        {showEndDatePicker && (
                            <DateTimePicker
                                value={endDateValue}
                                mode="date"
                                display="default"
                                onChange={handleEndDateChange}
                                minimumDate={startDateValue}
                            />
                        )}

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
                                onPress={editMode ? updateTransaction : addTransaction}
                            >
                                <Text style={styles.submitButtonText}>
                                    {editMode ? "Update" : "Add"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* View Transaction Modal */}
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
                    {selectedTransaction && (
                        <View style={styles.viewModalContent}>
                            <View style={styles.viewModalHeader}>
                                <MaterialIcons 
                                    name={selectedTransaction.type === "income" ? "arrow-downward" : "arrow-upward"} 
                                    size={30} 
                                    color={selectedTransaction.type === "income" ? "#4CAF50" : "#FF5252"} 
                                />
                                <Text style={styles.viewModalTitle}>{selectedTransaction.title}</Text>
                            </View>
                            
                            <View style={styles.viewModalSection}>
                                <Text style={styles.viewModalLabel}>Amount</Text>
                                <Text style={[
                                    styles.viewModalValue,
                                    { color: selectedTransaction.type === "income" ? "#4CAF50" : "#FF5252" }
                                ]}>
                                    {selectedTransaction.type === "income" ? "+" : "-"} ₹{selectedTransaction.amount.toLocaleString()}
                                </Text>
                            </View>
                            
                            <View style={styles.viewModalSection}>
                                <Text style={styles.viewModalLabel}>Frequency</Text>
                                <Text style={styles.viewModalValue}>{getFrequencyLabel(selectedTransaction.frequency)}</Text>
                            </View>
                            
                            <View style={styles.viewModalSection}>
                                <Text style={styles.viewModalLabel}>Next Occurrence</Text>
                                <Text style={styles.viewModalValue}>
                                    {getNextOccurrence(selectedTransaction.start_date, selectedTransaction.frequency)}
                                </Text>
                            </View>
                            
                            <View style={styles.viewModalSection}>
                                <Text style={styles.viewModalLabel}>Started On</Text>
                                <Text style={styles.viewModalValue}>
                                    {new Date(selectedTransaction.start_date).toDateString()}
                                </Text>
                            </View>
                            
                            {selectedTransaction.end_date && (
                                <View style={styles.viewModalSection}>
                                    <Text style={styles.viewModalLabel}>Ends On</Text>
                                    <Text style={styles.viewModalValue}>
                                        {new Date(selectedTransaction.end_date).toDateString()}
                                    </Text>
                                </View>
                            )}

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
        marginBottom: 10,
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
    filterContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    activeFilter: {
        backgroundColor: "#6C63FF",
        borderColor: "#6C63FF",
    },
    filterText: {
        fontSize: 14,
        color: "#666",
    },
    activeFilterText: {
        color: "#fff",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    transactionCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    transactionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    transactionText: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    transactionAmount: {
        fontSize: 15,
        fontWeight: "bold",
    },
    transactionActions: {
        flexDirection: "row",
    },
    actionButton: {
        marginLeft: 15,
        padding: 5,
    },
    transactionDetails: {
        marginTop: 10,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 5,
    },
    detailLabel: {
        fontSize: 13,
        color: "#666",
    },
    detailValue: {
        fontSize: 13,
        color: "#333",
        fontWeight: "500",
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
    dropdownContainer: {
        marginBottom: 10,
    },
    dropdown: {
        backgroundColor: "#f8f9fa",
        borderColor: "#eee",
        borderRadius: 10,
    },
    dropdownList: {
        backgroundColor: "#f8f9fa",
        borderColor: "#eee",
        marginTop: 2,
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

export default RecurringTransactionsScreen;