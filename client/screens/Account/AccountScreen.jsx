import React, { useEffect, useState } from "react";
import {
    View, Text, ActivityIndicator, Alert,
    TouchableOpacity, Modal, StyleSheet, FlatList, TextInput, Button
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";

const AccountScreen = ({ navigation, onLogout }) => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [accountCategoryId, setAccountCategoryId] = useState("");
    const [balance, setBalance] = useState("");
    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);
    const [categoryValue, setCategoryValue] = useState(null);

    useEffect(() => {
        fetchAccounts();
        fetchCategories();
    }, []);

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
                setAccounts(data.data);  // Update state with API data
            } else {
                Alert.alert("Error", data.message || "Failed to load accounts.");
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            Alert.alert("Error", "Network request failed.");
        }
    };
    const addAccount = async () => {
        if (!name.trim() || !accountCategoryId || !balance) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }

        try {
            const formattedBalance = parseFloat(balance).toFixed(2);
            const token = await AsyncStorage.getItem("authToken");

            let url = "http://192.168.31.167:8000/api/account";
            let method = "POST";  // Default to adding a new account

            if (editMode) {
                url = `http://192.168.31.167:8000/api/account/${selectedAccount.id}`; // Include ID in URL for editing
                method = "PUT"; // Change method to PUT
            }

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    description,
                    account_category_id: accountCategoryId,
                    balance: formattedBalance,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setModalVisible(false);
                setName("");
                setDescription("");
                setAccountCategoryId("");
                setBalance("");
                setEditMode(false);
                fetchAccounts(); // Refresh the list
            } else {
                Alert.alert("Error", data.message || "Failed to save account.");
            }
        } catch (error) {
            console.error("Save Error:", error);
            Alert.alert("Error", "Network request failed.");
        }
    };

    const deleteAccount = async (accountId) => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this account?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("authToken");

                            const response = await fetch(`http://192.168.31.167:8000/api/account/${accountId}`, {
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
                                Alert.alert("Error", data.message || "Failed to delete account.");
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

    const editAccount = (account) => {
        setSelectedAccount(account);
        setName(account.name);
        setDescription(account.description || "");
        setAccountCategoryId(account.account_category_id); // Ensure correct format
        setCategoryValue(account.account_category_id); // Set category dropdown value
        setBalance(account.balance.toString());
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

            const response = await fetch("http://192.168.31.167:8000/api/account-category", {
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
                data={accounts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <View style={styles.textContainer}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text>Balance: {item.balance}</Text>
                            <Text>Category: {item.account_category.name}</Text>
                            <Text style={styles.description}>{item.description}</Text>
                        </View>
                        <TouchableOpacity onPress={() => editAccount(item)}>
                            <MaterialIcons name="edit" size={24} color="blue" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteAccount(item.id)}>
                            <MaterialIcons name="delete" size={24} color="red" />
                        </TouchableOpacity>
                    </View>
                )}
            />

            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.addButtonText}>{editMode ? "Edit Account" : "+ Add Account"}</Text>
            </TouchableOpacity>

            <Modal transparent={true} visible={modalVisible} animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>{editMode ? "Edit Account" : "Add Account"}</Text>
                        <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
                        <TextInput placeholder="Description (optional)" value={description} onChangeText={setDescription} style={styles.input} />
                        <DropDownPicker
                            open={open}
                            value={categoryValue}
                            items={categories}
                            setOpen={setOpen}
                            setValue={setCategoryValue}
                            setItems={setCategories}
                            style={styles.select}
                        />
                        <TextInput placeholder="Balance" value={balance} onChangeText={setBalance} style={styles.input} keyboardType="numeric" />
                        <TouchableOpacity style={styles.modalButton} onPress={addAccount}>
                            <Text style={styles.modalButtonText}>{editMode ? "Update Account" : "Add Account"}</Text>
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
    select: { width: "100%", padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 10 },
    modalButton: { backgroundColor: "#28a745", padding: 10, borderRadius: 8, width: "100%", alignItems: "center" },
    modalButtonText: { color: "#fff", fontSize: 16 },
    modalCancel: { marginTop: 10 },
    modalCancelText: { color: "#007bff", fontSize: 16 },
});

export default AccountScreen;
