import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  TextInput,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";

const AccountScreen = ({ navigation, onLogout }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [balance, setBalance] = useState("");
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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
      if (response.ok) {
        setAccounts(data.data);
      } else {
        console.error("Failed to load accounts:", data);
        Alert.alert("Error", data.message || "Failed to load accounts.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Error", "Network request failed.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAccounts();
  };

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (account.description && account.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    account.account_category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addAccount = async () => {
    if (!name.trim() || !categoryValue || !balance) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    try {
      const formattedBalance = parseFloat(balance).toFixed(2);
      const token = await AsyncStorage.getItem("authToken");

      let url = "http://192.168.31.167:8000/api/account";
      let method = "POST";

      if (editMode) {
        url = `http://192.168.31.167:8000/api/account/${selectedAccount.id}`;
        method = "PUT";
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
          account_category_id: categoryValue,
          balance: formattedBalance,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setModalVisible(false);
        resetForm();
        setEditMode(false);
        fetchAccounts();
        Alert.alert("Success", `Account ${editMode ? "updated" : "added"} successfully!`);
      } else {
        console.error("Failed to save account:", data);
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
      "Are you sure you want to delete this account? All associated transactions will be removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("authToken");

              const response = await fetch(
                `http://192.168.31.167:8000/api/account/${accountId}`,
                {
                  method: "DELETE",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                  },
                }
              );

              if (response.ok) {
                Alert.alert("Success", "Account deleted successfully.");
                fetchAccounts();
              } else {
                const data = await response.json();
                console.error("Failed to delete account:", data);
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
    setCategoryValue(account.account_category.id);
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
        console.error("Fetch Categories Error:", data);
        Alert.alert("Error", data.message || "Failed to load categories.");
      }
    } catch (error) {
      console.error("Fetch Categories Error:", error);
      Alert.alert("Error", "Network request failed.");
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategoryValue(null);
    setBalance("");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
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
        <Text style={styles.headerTitle}>Accounts</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditMode(false);
            resetForm();
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
          placeholder="Search accounts..."
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

      {/* Accounts List */}
      {filteredAccounts.length > 0 ? (
        <FlatList
          data={filteredAccounts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.accountCard}
              onPress={() => navigation.navigate('AccountDetail', { accountId: item.id })}
            >
              <View style={styles.accountHeader}>
                <View style={[styles.accountIcon, { backgroundColor: '#6C63FF20' }]}>
                  <Ionicons name="wallet-outline" size={20} color="#6C63FF" />
                </View>
                <Text style={styles.accountName}>{item.name}</Text>
                <Text style={[
                  styles.accountBalance,
                  item.balance >= 0 ? styles.positiveBalance : styles.negativeBalance
                ]}>
                  {formatCurrency(item.balance)}
                </Text>
              </View>
              
              <View style={styles.accountDetails}>
                <Text style={styles.accountCategory}>
                  {item.account_category.name}
                </Text>
                {item.description ? (
                  <Text style={styles.accountDescription} numberOfLines={1}>
                    {item.description}
                  </Text>
                ) : null}
              </View>

              <View style={styles.accountActions}>
                <TouchableOpacity 
                  onPress={() => editAccount(item)}
                  style={styles.actionButton}
                >
                  <Feather name="edit" size={18} color="#6C63FF" />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => deleteAccount(item.id)}
                  style={styles.actionButton}
                >
                  <Feather name="trash-2" size={18} color="#ff4444" />
                  <Text style={[styles.actionText, { color: '#ff4444' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#6C63FF']}
              tintColor="#6C63FF"
            />
          }
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={50} color="#6C63FF" />
          <Text style={styles.emptyText}>No accounts found</Text>
          <Text style={styles.emptySubtext}>Add a new account to get started</Text>
        </View>
      )}

      {/* Add/Edit Account Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editMode ? "Edit Account" : "Add New Account"}
            </Text>
            
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <Text style={styles.inputLabel}>Account Name *</Text>
              <TextInput
                placeholder="Enter account name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                style={styles.modalInput}
                autoFocus
              />

              <Text style={styles.inputLabel}>Category *</Text>
              <DropDownPicker
                open={open}
                value={categoryValue}
                items={categories}
                setOpen={setOpen}
                setValue={setCategoryValue}
                setItems={setCategories}
                placeholder="Select category"
                placeholderStyle={{ color: "#999" }}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
              />

              <Text style={styles.inputLabel}>Balance *</Text>
              <TextInput
                placeholder="Enter initial balance"
                placeholderTextColor="#999"
                value={balance}
                onChangeText={setBalance}
                style={styles.modalInput}
                keyboardType="numeric"
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
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setEditMode(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={addAccount}
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
  accountCard: {
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
  accountHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  accountIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: "600",
  },
  positiveBalance: {
    color: "#4CAF50",
  },
  negativeBalance: {
    color: "#F44336",
  },
  accountDetails: {
    marginLeft: 40, // Align with account name
  },
  accountCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  accountDescription: {
    fontSize: 14,
    color: "#999",
  },
  accountActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 5,
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
    maxHeight: "80%",
  },
  modalScrollContent: {
    paddingBottom: 20,
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
  dropdown: {
    backgroundColor: "#f8f9fa",
    borderColor: "#eee",
    borderRadius: 10,
    paddingHorizontal: 15,
    minHeight: 50,
  },
  dropdownContainer: {
    backgroundColor: "#f8f9fa",
    borderColor: "#eee",
    marginTop: 2,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
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

export default AccountScreen;