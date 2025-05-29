import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Ionicons, Feather, AntDesign } from "@expo/vector-icons";
import { BASE_URL } from "../../config";

const FamilyAccountScreen = ({ navigation }) => {
  // State management
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // Invitation states
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [emailError, setEmailError] = useState("");
  const [members, setMembers] = useState([]);
  const [expandedAccountId, setExpandedAccountId] = useState(null);
  const [memberLoading, setMemberLoading] = useState(false);

  // Fetch family accounts
  const fetchFamilyAccounts = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${BASE_URL}/family-accounts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setAccounts(data.data || []);
      } else {
        Alert.alert("Error", data.message || "Failed to load family accounts.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Error", "Network request failed.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch members for a specific account
  const fetchMembers = async (accountId) => {
    try {
      setMemberLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${BASE_URL}/family-members?family_account_id=${accountId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setMembers(data.data || []);
      } else {
        Alert.alert("Error", data.message || "Failed to load members.");
      }
    } catch (error) {
      console.error("Fetch Members Error:", error);
      Alert.alert("Error", "Failed to load members.");
    } finally {
      setMemberLoading(false);
    }
  };
  useEffect(() => {
    const getUserInfo = async () => {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUserId(user.id);
      }
    };

    getUserInfo();
    fetchFamilyAccounts();
  }, []);
  
  const getCombinedMembers = (account) => {
    // Format owner as a special member
    const ownerMember = {
      id: account.owner.id,
      email: account.owner.email,
      role: 'owner',
      status: 'active',
      user: {
        first_name: account.owner.first_name,
        last_name: account.owner.last_name,
        email: account.owner.email
      },
      isOwner: true
    };

    return [ownerMember, ...account.members];
  };

  // Toggle account expansion
  const toggleExpandAccount = async (accountId) => {
    if (expandedAccountId === accountId) {
      setExpandedAccountId(null);
    } else {
      setExpandedAccountId(accountId);
      // await fetchMembers(accountId);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFamilyAccounts();
  };

  // Filter accounts based on search query
  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add new family account
  const addFamilyAccount = async () => {
    if (!name.trim()) {
      setNameError("Account name is required.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${BASE_URL}/family-accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();
      if (response.ok) {
        setAccounts([...accounts, data.data]);
        resetForm();
        setModalVisible(false);
        Alert.alert("Success", "Family account created successfully!");
      } else {
        Alert.alert("Error", data.message || "Failed to create account.");
      }
    } catch (error) {
      console.error("Create Account Error:", error);
      Alert.alert("Error", "Could not create account.");
    }
  };

  // Update existing family account
  const updateFamilyAccount = async () => {
    if (!name.trim()) {
      setNameError("Account name is required.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(
        `${BASE_URL}/family-accounts/${selectedAccount.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setAccounts(
          accounts.map((acc) =>
            acc.id === selectedAccount.id ? data.data : acc
          )
        );
        resetForm();
        setModalVisible(false);
        setEditMode(false);
        Alert.alert("Success", "Family account updated successfully!");
      } else {
        Alert.alert("Error", data.message || "Failed to update account.");
      }
    } catch (error) {
      console.error("Update Account Error:", error);
      Alert.alert("Error", "Could not update account.");
    }
  };

  // Reset form fields
  const resetForm = () => {
    setName("");
    setNameError("");
  };

  // Open modal for editing
  const openEditModal = (account) => {
    setSelectedAccount(account);
    setName(account.name);
    setEditMode(true);
    setModalVisible(true);
  };

  // Open invite modal
  const openInviteModal = (account) => {
    setSelectedAccount(account);
    setEmail("");
    setRole("member");
    setEmailError("");
    setInviteModalVisible(true);
  };

  // Invite member to family account
  const inviteMember = async () => {
    if (!email.trim()) {
      setEmailError("Email is required.");
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${BASE_URL}/family-members/invite/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          family_account_id: selectedAccount.id,
          email: email,
          role: role
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Invitation sent successfully!");
        setInviteModalVisible(false);
        // Refresh members list
        if (expandedAccountId === selectedAccount.id) {
          fetchMembers(selectedAccount.id);
        }
      } else {
        Alert.alert("Error", data.message || "Failed to send invitation.");
      }
    } catch (error) {
      console.error("Invite Error:", error);
      Alert.alert("Error", "Could not send invitation.");
    }
  };

  // Delete family account
  const deleteFamilyAccount = async (accountId) => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete this family account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("authToken");
              const response = await fetch(
                `${BASE_URL}/family-accounts/${accountId}`,
                {
                  method: "DELETE",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                  },
                }
              );

              if (response.ok) {
                setAccounts(accounts.filter((acc) => acc.id !== accountId));
                Alert.alert("Success", "Account deleted successfully!");
              } else {
                const data = await response.json();
                Alert.alert("Error", data.message || "Failed to delete account.");
              }
            } catch (error) {
              console.error("Delete Account Error:", error);
              Alert.alert("Error", "Could not delete account.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Family Accounts</Text>
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
          placeholder="Search family accounts..."
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
            <View style={styles.accountCard}>
              <TouchableOpacity 
                style={styles.accountHeader}
                onPress={() => toggleExpandAccount(item.id)}
              >
                <View style={styles.accountInfo}>
                  <View style={[styles.accountIcon, { backgroundColor: '#4CAF5020' }]}>
                    <Ionicons name="people" size={24} color="#4CAF50" />
                  </View>
                  <View style={styles.accountText}>
                    <Text style={styles.accountName}>{item.name}</Text>
                  </View>
                </View>
                <View style={styles.accountActions}>
                  <TouchableOpacity 
                    onPress={() => openEditModal(item)}
                    style={styles.actionButton}
                  >
                    <Feather name="edit" size={20} color="#6C63FF" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => deleteFamilyAccount(item.id)}
                    style={styles.actionButton}
                  >
                    <Feather name="trash-2" size={20} color="#ff4444" />
                  </TouchableOpacity>
                  <Ionicons 
                    name={expandedAccountId === item.id ? "chevron-up" : "chevron-down"} 
                    size={24} 
                    color="#666" 
                  />
                </View>
              </TouchableOpacity>
              
              {/* Expanded Member Section */}
              {expandedAccountId === item.id && (
                <View style={styles.expandedSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Members</Text>
                    <TouchableOpacity 
                      style={styles.inviteButton}
                      onPress={() => openInviteModal(item)}
                    >
                      <Feather name="user-plus" size={18} color="#fff" />
                      <Text style={styles.inviteButtonText}>Invite</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {memberLoading ? (
                    <ActivityIndicator size="small" color="#4CAF50" style={styles.memberLoader} />
                  ) : item.members.length > 0 ? (
                    <View style={styles.memberList}>
                      {item.members.map((member) => (
                        <View key={member.id} style={styles.memberItem}>
                          <Ionicons 
                            name="person-circle" 
                            size={32} 
                            color={member.status === 'pending' ? "#FFC107" : "#4CAF50"} 
                          />
                          <View style={styles.memberInfo}>
                            <Text style={styles.memberEmail}>{member.user.first_name} {member.user.last_name}</Text>
                            <View style={styles.memberMeta}>
                              <Text style={[
                                styles.memberRole, 
                                member.role === 'admin' ? styles.adminRole : {}
                              ]}>
                                {member.role}
                              </Text>
                              <Text style={[
                                styles.memberStatus,
                                member.status === 'active' ? styles.activeStatus : {},
                                member.status === 'pending' ? styles.pendingStatus : {}
                              ]}>
                                {member.status}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyMembers}>
                      <Ionicons name="people-outline" size={30} color="#999" />
                      <Text style={styles.emptyMembersText}>No members yet</Text>
                      <Text style={styles.emptyMembersSubtext}>Invite members to join this family account</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={50} color="#4CAF50" />
          <Text style={styles.emptyText}>No family accounts available</Text>
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
              {editMode ? "Edit Family Account" : "Add New Family Account"}
            </Text>
            
            <Text style={styles.inputLabel}>Account Name *</Text>
            <TextInput
              placeholder="Enter account name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (text.trim()) setNameError("");
              }}
              style={[
                styles.modalInput,
                nameError ? styles.inputError : null,
              ]}
              autoFocus
            />
            {nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={editMode ? updateFamilyAccount : addFamilyAccount}
              >
                <Text style={styles.submitButtonText}>
                  {editMode ? "Update" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Invite Member Modal */}
      <Modal
        transparent={true}
        visible={inviteModalVisible}
        animationType="slide"
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setInviteModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invite to {selectedAccount?.name}</Text>
            
            <Text style={styles.inputLabel}>Email Address *</Text>
            <TextInput
              placeholder="Enter email address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (text.trim()) setEmailError("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[
                styles.modalInput,
                emailError ? styles.inputError : null,
              ]}
              autoFocus
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}

            <Text style={styles.inputLabel}>Role</Text>
            <View style={styles.roleContainer}>
              {['member', 'admin'].map((roleOption) => (
                <TouchableOpacity
                  key={roleOption}
                  style={[
                    styles.roleButton,
                    role === roleOption && styles.selectedRole
                  ]}
                  onPress={() => setRole(roleOption)}
                >
                  <Text style={[
                    styles.roleButtonText,
                    role === roleOption && styles.selectedRoleText
                  ]}>
                    {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setInviteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={inviteMember}
              >
                <Text style={styles.submitButtonText}>Send Invite</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

// Updated styles with member section
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
    backgroundColor: "#4CAF50",
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  accountText: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  accountActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: 15,
    padding: 5,
  },
  expandedSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C63FF",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  inviteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  memberList: {
    marginTop: 5,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberEmail: {
    fontSize: 15,
    color: "#333",
  },
  memberMeta: {
    flexDirection: "row",
    marginTop: 4,
  },
  memberRole: {
    fontSize: 13,
    backgroundColor: "#e0e0e0",
    color: "#666",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  adminRole: {
    backgroundColor: "#FFECB3",
    color: "#FF9800",
  },
  memberStatus: {
    fontSize: 13,
    backgroundColor: "#e0e0e0",
    color: "#666",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeStatus: {
    backgroundColor: "#C8E6C9",
    color: "#4CAF50",
  },
  pendingStatus: {
    backgroundColor: "#FFF9C4",
    color: "#FFC107",
  },
  memberLoader: {
    marginVertical: 15,
  },
  emptyMembers: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyMembersText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  emptyMembersSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
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
  inputError: {
    borderColor: "#ff4444",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 14,
    marginTop: 5,
  },
  roleContainer: {
    flexDirection: "row",
    marginTop: 5,
    marginBottom: 10,
  },
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
  },
  selectedRole: {
    backgroundColor: "#6C63FF",
    borderColor: "#6C63FF",
  },
  roleButtonText: {
    color: "#666",
    fontSize: 14,
  },
  selectedRoleText: {
    color: "#fff",
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
    backgroundColor: "#4CAF50",
    marginLeft: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FamilyAccountScreen;