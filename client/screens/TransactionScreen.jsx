import React, { useEffect, useState } from "react";
import {
    View, Text, ActivityIndicator, Alert,
    TouchableOpacity, Modal, StyleSheet, FlatList, TextInput, Button
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import TransactionTypeSelector from "../components/TransactionTypeSelector";

const TransactionScreen = ({ navigation, onLogout }) => {
    const [accounts, setAccounts] = useState([]);
    const [transacactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [accountCategoryId, setAccountCategoryId] = useState("");
    const [amount, setAmount] = useState("");
    const [categories, setCategories] = useState([]);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [categoryValue, setCategoryValue] = useState(null);
    const [transactionType, setTransactionType] = useState("income");
    const [date, setDate] = useState(new Date());

    const getFormattedDate = () => {
        const date = new Date();
        const pad = (num) => num.toString().padStart(2, "0");

        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
            `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const formattedDate = getFormattedDate();


    useEffect(() => {
        fetchAccounts();
        fetchCategories();
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            if (!token) {
                Alert.alert("Error", "No authentication token found.");
                return;
            }

            const response = await fetch("http://192.168.31.167:8000/api/transaction", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();
            setLoading(false)
            if (response.ok) {
                setTransactions(data.data)
            } else {
                console.error("Failed to load transactions:", data);
                Alert.alert("Error", data.message || "Failed to load transactions.");
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            Alert.alert("Error", "Network request failed.");
        }
    };

    const fetchAccounts = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            if (!token) {
                Alert.alert("Error", "No authentication token found.");
                return;
            }

            const response = await fetch("http://192.168.31.167:8000/api/account", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();
            setLoading(false)
            if (response.ok) {
                const formattedCategories = data.data.map(item => ({
                    label: item.name,
                    value: item.id
                }));
                setAccounts(formattedCategories);  // Update state with API data
            } else {
                console.error("Failed to load transactions:", data);
                Alert.alert("Error", data.message || "Failed to load transactions.");
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            Alert.alert("Error", "Network request failed.");
        }
    };

    const addTransaction = async () => {
        if (!name.trim() || !selectedAccount || !categoryValue || !amount) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }

        try {
            const formattedAmount = parseFloat(amount).toFixed(2);
            const token = await AsyncStorage.getItem("authToken");

            let url = "http://192.168.31.167:8000/api/transaction";
            let method = "POST";

            if (editMode) {
                url = `http://192.168.31.167:8000/api/transaction/${selectedAccount.id}`;
                method = "PUT";
            }

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    account_id: selectedAccount,
                    category_id: categoryValue,
                    type: transactionType,
                    amount: formattedAmount,
                    name,
                    description,
                    transaction_date: formattedDate, // Send date in API request
                }),
            });

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                setModalVisible(false);
                setName("");
                setDescription("");
                setAccountCategoryId("");
                setAmount("");
                setEditMode(false);
                fetchAccounts();
            } else {
                console.error("Failed to save transaction:", data);
                Alert.alert("Error", data.message || "Failed to save transaction.");
            }
        } catch (error) {
            console.error("Save Error:", error);
            Alert.alert("Error", "Network request failed.");
        }
    };

    const deleteTransaction = async (accountId) => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this transaction?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("authToken");

                            const response = await fetch(`http://192.168.31.167:8000/api/transaction/${accountId}`, {
                                method: "DELETE",
                                headers: {
                                    "Authorization": `Bearer ${token}`,
                                },
                            });

                            const data = await response.json();
                            if (response.ok) {
                                Alert.alert("Success", "Account deleted successfully.");
                                fetchAccounts(); // Refresh the list
                            } else {
                                console.error("Failed to delete transaction:", data);
                                Alert.alert("Error", data.messaXge || "Failed to delete transaction.");
                            }
                        } catch (error) {
                            console.error("Delete Error:", error);
                            Alert.alert("Error", "Network request failed.");
                        }
                    },
                },
            ]
        );
    };

    const editTransaction = (account) => {
        setSelectedAccount(account);
        setName(account.name);
        setDescription(account.description || "");
        setAccountCategoryId(account.account_category_id); // Ensure correct format
        setCategoryValue(account.account_category_id); // Set category dropdown value
        // setAmount(account.amount.toString());
        setEditMode(true);
        setModalVisible(true);
    };

    const fetchCategories = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            if (!token) {
                Alert.alert("Error", "No authentication token found.");
                return;
            }

            const response = await fetch("http://192.168.31.167:8000/api/category", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                const formattedCategories = data.data.map(item => ({
                    label: item.name,
                    value: item.id
                }));

                setCategories(formattedCategories);
            } else {
                console.error("Fetch Categories Error:", data);
                Alert.alert("Error", data.message || "Failed to load categories.");
            }
        } catch (error) {
            console.error("Fetch Categories Error:", error);
            Alert.alert("Error", "Network request failed.");
        }
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
                data={transacactions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <View style={styles.textContainer}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text>Amount: {item.amount}</Text>
                            {/* <Text>Category: {item.account_category.name}</Text> */}
                            <Text style={styles.description}>{item.description}</Text>
                        </View>
                        <TouchableOpacity onPress={() => editTransaction(item)}>
                            <MaterialIcons name="edit" size={24} color="blue" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteTransaction(item.id)}>
                            <MaterialIcons name="delete" size={24} color="red" />
                        </TouchableOpacity>
                    </View>
                )}
            />

            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.addButtonText}>{editMode ? "Edit Transaction" : "+ Add Transaction"}</Text>
            </TouchableOpacity>

            <Modal transparent={true} visible={modalVisible} animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>{editMode ? "Edit Transaction" : "Add Transaction"}</Text>
                        <TransactionTypeSelector selectedType={transactionType} onSelect={setTransactionType} />
                        <View style={[styles.dropdownContainer, accountOpen && { zIndex: 2000 }]}>
                            <DropDownPicker
                                open={accountOpen}
                                value={selectedAccount}
                                items={accounts}
                                setOpen={setAccountOpen}
                                setValue={setSelectedAccount}
                                setItems={setAccounts}
                                style={styles.select}
                                placeholder="Select an Account"
                            />
                        </View>
                        <View style={[styles.dropdownContainer, categoryOpen && { zIndex: 1000 }]}>
                            <DropDownPicker
                                open={categoryOpen}
                                value={categoryValue}
                                items={categories}
                                setOpen={setCategoryOpen}
                                setValue={setCategoryValue}
                                setItems={setCategories}
                                style={styles.select}
                                placeholder="Select a Category"
                            />
                        </View>
                        <TextInput placeholder="Amount" value={amount} onChangeText={setAmount} style={styles.input} keyboardType="numeric" />
                        <TextInput placeholder="Title" value={name} onChangeText={setName} style={styles.input} />
                        <TextInput placeholder="Description (optional)"
                            multiline={true}
                            numberOfLines={4} value={description} onChangeText={setDescription} style={styles.textarea} />
                        <TouchableOpacity style={styles.modalButton} onPress={addTransaction}>
                            <Text style={styles.modalButtonText}>{editMode ? "Update Transaction" : "Add Transaction"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalCancel} onPress={() => { setModalVisible(false); setEditMode(false); }}>
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    item: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        padding: 15, backgroundColor: "#f9f9f9", marginVertical: 5, borderRadius: 8, elevation: 3
    },
    textContainer: { flex: 1 },
    name: { fontSize: 18, fontWeight: "bold" },
    description: { fontSize: 14, color: "gray" },
    addButton: { backgroundColor: "#007bff", padding: 15, alignItems: "center", borderRadius: 8, marginTop: 10 },
    addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" },
    modal: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: 300, elevation: 5, alignItems: "center" },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    input: { width: "100%", padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 10 },
    dropdownContainer: {
        width: "100%",
        marginBottom: 10,
        zIndex: 1,
        height: "20px"
    },
    select: {
        width: "100%",
        paddingVertical: 8,  // Reduce input field height
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        fontSize: 14,  // Adjust text size if needed
    },
    modalButton: { backgroundColor: "#28a745", padding: 10, borderRadius: 8, width: "100%", alignItems: "center" },
    modalButtonText: { color: "#fff", fontSize: 16 },
    modalCancel: { marginTop: 10 },
    modalCancelText: { color: "#007bff", fontSize: 16 },
    textarea: { width: "100%", height: 100, borderWidth: 1, borderColor: '#ccc', padding: 10, textAlignVertical: 'top', marginBottom: 8, borderRadius: 8 },
});

export default TransactionScreen;
