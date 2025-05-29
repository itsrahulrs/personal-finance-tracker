import React, { useEffect, useState, useMemo } from "react";
import {
  View, Text, ActivityIndicator, Alert,
  TouchableOpacity, Modal, StyleSheet, FlatList, 
  TextInput, SafeAreaView, StatusBar, KeyboardAvoidingView,
  Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import TransactionTypeSelector from "../components/TransactionTypeSelector";

const TransactionScreen = ({ navigation, onLogout }) => {
    // State management
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [categories, setCategories] = useState([]);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [categoryValue, setCategoryValue] = useState(null);
    const [accountValue, setAccountValue] = useState(null);
    const [transactionType, setTransactionType] = useState("income");
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    // Filter transactions based on search and type filter
    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction => {
            const matchesSearch = transaction.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                (transaction.description && transaction.description.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesType = typeFilter === "all" || transaction.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [transactions, searchQuery, typeFilter]);

    const getFormattedDate = () => {
        const date = new Date();
        const pad = (num) => num.toString().padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
            `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    // Data fetching
    const fetchTransactions = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch("http://192.168.31.167:8000/api/transaction", {
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
            Alert.alert("Error", "Network request failed.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchAccounts = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch("http://192.168.31.167:8000/api/account", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setAccounts(data.data.map(item => ({
                    label: item.name,
                    value: item.id
                })));
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch("http://192.168.31.167:8000/api/category", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setCategories(data.data.map(item => ({
                    label: item.name,
                    value: item.id
                })));
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        }
    };

    // CRUD operations
    const handleAddTransaction = async () => {
        if (!name.trim() || !accountValue || !categoryValue || !amount) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("authToken");
            const formattedAmount = parseFloat(amount).toFixed(2);

            const response = await fetch("http://192.168.31.167:8000/api/transaction", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    account_id: accountValue,
                    category_id: categoryValue,
                    type: transactionType,
                    amount: formattedAmount,
                    name,
                    description,
                    transaction_date: getFormattedDate(),
                }),
            });

            if (response.ok) {
                resetForm();
                setModalVisible(false);
                fetchTransactions();
                Alert.alert("Success", "Transaction added successfully!");
            } else {
                const data = await response.json();
                Alert.alert("Error", data.message || "Failed to add transaction.");
            }
        } catch (error) {
            Alert.alert("Error", "Network request failed.");
        }
    };

    const handleDeleteTransaction = (transactionId) => {
        Alert.alert(
            "Delete Transaction",
            "Are you sure you want to delete this transaction?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("authToken");
                            const response = await fetch(`http://192.168.31.167:8000/api/transaction/${transactionId}`, {
                                method: "DELETE",
                                headers: {
                                    "Authorization": `Bearer ${token}`,
                                },
                            });

                            if (response.ok) {
                                fetchTransactions();
                                Alert.alert("Success", "Transaction deleted successfully!");
                            } else {
                                const data = await response.json();
                                Alert.alert("Error", data.message || "Failed to delete transaction.");
                            }
                        } catch (error) {
                            Alert.alert("Error", "Network request failed.");
                        }
                    },
                },
            ]
        );
    };

    const resetForm = () => {
        setName("");
        setDescription("");
        setAmount("");
        setAccountValue(null);
        setCategoryValue(null);
        setTransactionType("income");
        setEditMode(false);
        setSelectedTransaction(null);
    };

    const openEditModal = (transaction) => {
        setSelectedTransaction(transaction);
        setName(transaction.name);
        setDescription(transaction.description || "");
        setAmount(transaction.amount.toString());
        setAccountValue(transaction.account_id);
        setCategoryValue(transaction.category_id);
        setTransactionType(transaction.type);
        setEditMode(true);
        setModalVisible(true);
    };

    useEffect(() => {
        fetchAccounts();
        fetchCategories();
        fetchTransactions();
    }, []);

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
                <Text style={styles.headerTitle}>Transactions</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        resetForm();
                        setModalVisible(true);
                    }}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Search and Filter Bar */}
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

            {/* Type Filter */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, typeFilter === "all" && styles.activeFilter]}
                    onPress={() => setTypeFilter("all")}
                >
                    <Text style={[styles.filterText, typeFilter === "all" && styles.activeFilterText]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, typeFilter === "income" && styles.activeFilter]}
                    onPress={() => setTypeFilter("income")}
                >
                    <Text style={[styles.filterText, typeFilter === "income" && styles.activeFilterText]}>Income</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, typeFilter === "expense" && styles.activeFilter]}
                    onPress={() => setTypeFilter("expense")}
                >
                    <Text style={[styles.filterText, typeFilter === "expense" && styles.activeFilterText]}>Expense</Text>
                </TouchableOpacity>
            </View>

            {/* Transactions List */}
            {filteredTransactions.length > 0 ? (
                <FlatList
                    data={filteredTransactions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.transactionCard}>
                            <View style={styles.transactionInfo}>
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
                                    <Text style={styles.transactionName}>{item.name}</Text>
                                    <Text style={styles.transactionAmount}>
                                        {item.type === "income" ? "+" : "-"} ₹{parseFloat(item.amount).toFixed(2)}
                                    </Text>
                                    {item.description ? (
                                        <Text style={styles.transactionDescription}>{item.description}</Text>
                                    ) : null}
                                </View>
                            </View>
                            <View style={styles.transactionActions}>
                                <TouchableOpacity 
                                    onPress={() => openEditModal(item)}
                                    style={styles.actionButton}
                                >
                                    <Feather name="edit" size={18} color="#6C63FF" />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => handleDeleteTransaction(item.id)}
                                    style={styles.actionButton}
                                >
                                    <Feather name="trash-2" size={18} color="#ff4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    refreshing={refreshing}
                    onRefresh={fetchTransactions}
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="receipt-outline" size={50} color="#6C63FF" />
                    <Text style={styles.emptyText}>No transactions found</Text>
                    <Text style={styles.emptySubtext}>
                        {searchQuery ? "Try a different search" : "Add a new transaction to get started"}
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
                    resetForm();
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
                            resetForm();
                        }}
                    />
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editMode ? "Edit Transaction" : "Add New Transaction"}
                        </Text>
                        
                        <TransactionTypeSelector 
                            selectedType={transactionType} 
                            onSelect={setTransactionType} 
                        />

                        <Text style={styles.inputLabel}>Account *</Text>
                        <View style={[styles.dropdownContainer, accountOpen && { zIndex: 2000 }]}>
                            <DropDownPicker
                                open={accountOpen}
                                value={accountValue}
                                items={accounts}
                                setOpen={setAccountOpen}
                                setValue={setAccountValue}
                                setItems={setAccounts}
                                placeholder="Select Account"
                                style={styles.dropdown}
                                dropDownContainerStyle={styles.dropdownList}
                            />
                        </View>

                        <Text style={styles.inputLabel}>Category *</Text>
                        <View style={[styles.dropdownContainer, categoryOpen && { zIndex: 1000 }]}>
                            <DropDownPicker
                                open={categoryOpen}
                                value={categoryValue}
                                items={categories}
                                setOpen={setCategoryOpen}
                                setValue={setCategoryValue}
                                setItems={setCategories}
                                placeholder="Select Category"
                                style={styles.dropdown}
                                dropDownContainerStyle={styles.dropdownList}
                            />
                        </View>

                        <Text style={styles.inputLabel}>Amount *</Text>
                        <TextInput
                            placeholder="0.00"
                            placeholderTextColor="#999"
                            value={amount}
                            onChangeText={setAmount}
                            style={styles.modalInput}
                            keyboardType="numeric"
                        />

                        <Text style={styles.inputLabel}>Title *</Text>
                        <TextInput
                            placeholder="Enter transaction title"
                            placeholderTextColor="#999"
                            value={name}
                            onChangeText={setName}
                            style={styles.modalInput}
                        />

                        <Text style={styles.inputLabel}>Description</Text>
                        <TextInput
                            placeholder="Enter description (optional)"
                            placeholderTextColor="#999"
                            multiline={true}
                            numberOfLines={3}
                            value={description}
                            onChangeText={setDescription}
                            style={[styles.modalInput, styles.descriptionInput]}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setModalVisible(false);
                                    resetForm();
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.submitButton]}
                                onPress={editMode ? handleAddTransaction : handleAddTransaction}
                            >
                                <Text style={styles.submitButtonText}>
                                    {editMode ? "Update" : "Add"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    transactionInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
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
    transactionName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 3,
    },
    transactionAmount: {
        fontSize: 15,
        fontWeight: "bold",
        marginBottom: 3,
    },
    transactionDescription: {
        fontSize: 14,
        color: "#666",
    },
    transactionActions: {
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
    descriptionInput: {
        height: 100,
        textAlignVertical: "top",
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
});

export default TransactionScreen;