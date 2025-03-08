import React, { useEffect, useState } from "react";
import {
    View, Text, ActivityIndicator, Alert, TouchableOpacity,
    Modal, TextInput, FlatList, StyleSheet
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

const AccountCategoryScreen = ({ navigation }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryName, setCategoryName] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");
    const [nameError, setNameError] = useState("");
    const [expandedCategory, setExpandedCategory] = useState(null);

    const toggleExpand = (categoryId) => {
        setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch("http://192.168.31.167:8000/api/account-category", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setCategories(data.data);
            } else {
                Alert.alert("Error", data.message || "Failed to load categories.");
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            Alert.alert("Error", "Network request failed.");
        } finally {
            setLoading(false);
        }
    };

    const addCategory = async () => {
        if (!categoryName.trim()) {
            setNameError("Category name is required.");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch("http://192.168.31.167:8000/api/account-category", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ name: categoryName, description: categoryDescription }),
            });

            const data = await response.json();
            if (response.ok) {
                setCategories([...categories, data.data]);
                setCategoryName("");
                setCategoryDescription("");
                setModalVisible(false);
            } else {
                Alert.alert("Error", data.message || "Failed to add category.");
            }
        } catch (error) {
            console.error("Add Category Error:", error);
            Alert.alert("Error", "Could not add category.");
        }
    };

    const updateCategory = async () => {
        if (!categoryName.trim()) {
            setNameError("Category name is required.");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch(`http://192.168.31.167:8000/api/account-category/${selectedCategory.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ name: categoryName, description: categoryDescription }),
            });

            const data = await response.json();
            if (response.ok) {
                setCategories(categories.map(cat => cat.id === selectedCategory.id ? data.data : cat));
                setCategoryName("");
                setCategoryDescription("");
                setModalVisible(false);
                setEditMode(false);
            } else {
                Alert.alert("Error", data.message || "Failed to update category.");
            }
        } catch (error) {
            console.error("Update Category Error:", error);
            Alert.alert("Error", "Could not update category.");
        }
    };

    const openEditModal = (category) => {
        setSelectedCategory(category);
        setCategoryName(category.name);
        setCategoryDescription(category.description);
        setEditMode(true);
        setModalVisible(true);
    };

    const deleteCategory = async (categoryId) => {
        Alert.alert("Confirm", "Are you sure you want to delete this category?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem("authToken");
                        const response = await fetch(`http://192.168.31.167:8000/api/account-category/${categoryId}`, {
                            method: "DELETE",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                            },
                        });

                        if (response.ok) {
                            setCategories(categories.filter(cat => cat.id !== categoryId));
                        } else {
                            Alert.alert("Error", "Failed to delete category.");
                        }
                    } catch (error) {
                        console.error("Delete Category Error:", error);
                        Alert.alert("Error", "Could not delete category.");
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
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    // Calculate total balance for the category
                    const totalBalance = item.accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

                    return (
                        <View style={styles.item}>
                            {/* Category Header with Name, Expand Button, Edit, and Delete */}
                            <View style={styles.header}>
                                <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.balance}>₹{totalBalance.toLocaleString()}</Text>
                                </TouchableOpacity>
                                <View style={styles.actions}>
                                    <TouchableOpacity onPress={() => openEditModal(item)}>
                                        <MaterialIcons name="edit" size={24} color="blue" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => deleteCategory(item.id)}>
                                        <MaterialIcons name="delete" size={24} color="red" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                                        <MaterialIcons
                                            name={expandedCategory === item.id ? "expand-less" : "expand-more"}
                                            size={24}
                                            color="black"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.header}>
                                <Text style={styles.description}>{item.description}</Text>
                            </View>

                            {/* Expanded View for Accounts */}
                            {expandedCategory === item.id && (
                                <View style={styles.accountContainer}>
                                    {item.accounts.map((account, index) => (
                                        <View key={index} style={styles.accountRow}>
                                            <Text style={styles.accountName}>{account.name}</Text>
                                            <Text style={styles.accountBalance}>₹{account.balance}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )
                }}
            />


            {/* Add Category Button */}
            <TouchableOpacity style={styles.addButton} onPress={() => {
                setEditMode(false);
                setCategoryName("");
                setCategoryDescription("");
                setModalVisible(true);
            }}>
                <Text style={styles.addButtonText}>+ Add Category</Text>
            </TouchableOpacity>

            {/* Add/Edit Category Modal */}
            <Modal transparent={true} visible={modalVisible} animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>{editMode ? "Edit Category" : "Add Category"}</Text>
                        <TextInput
                            placeholder="Name"
                            value={categoryName}
                            onChangeText={(text) => {
                                setCategoryName(text);
                                if (text.trim()) setNameError(""); // Clear error when user types
                            }}
                            style={[styles.input, nameError ? styles.inputError : null]}
                        />
                        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
                        <TextInput
                            placeholder="Description"
                            multiline={true}
                            numberOfLines={4}
                            value={categoryDescription}
                            onChangeText={setCategoryDescription}
                            style={styles.textarea}
                        />
                        <TouchableOpacity style={styles.modalButton} onPress={editMode ? updateCategory : addCategory}>
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
    container: { flex: 1, padding: 20 },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
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
    modalButton: { backgroundColor: "#28a745", padding: 10, borderRadius: 8, width: "100%", alignItems: "center" },
    modalButtonText: { color: "#fff", fontSize: 16 },
    modalCancel: { marginTop: 10 },
    modalCancelText: { color: "#007bff", fontSize: 16 },
    inputError: { borderColor: "red", borderWidth: 1 },
    errorText: { color: "red", fontSize: 14, marginTop: 2, alignSelf: "flex-start", marginBottom: 15 },
    textarea: { width: "100%", height: 100, borderWidth: 1, borderColor: '#ccc', padding: 10, textAlignVertical: 'top', marginBottom: 8, borderRadius: 8 },
    item: {
        padding: 10,
        marginVertical: 5,
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 5,
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
    },
    accountContainer: {
        marginTop: 10,
        paddingHorizontal: 10,
    },
    accountRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },
    accountName: {
        fontSize: 16,
    },
    accountBalance: {
        fontSize: 16,
        fontWeight: "bold",
        color: "green",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 10,
    },

});

export default AccountCategoryScreen;
