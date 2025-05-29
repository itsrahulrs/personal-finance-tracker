import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView, // Added ScrollView for better modal content scrolling
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons"; // Added MaterialCommunityIcons for password icon
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false); // New state for password modal
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false); // Renamed for clarity

  // New states for password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [newPasswordConfirmationError, setNewPasswordConfirmationError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false); // New state for password change loading

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  // Hardcoded API base URL - consider moving to a config file
  const API_BASE_URL = "http://192.168.31.167:8000/api";

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Authentication token not found. Please log in.");
        navigation.replace("Login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setProfile(data);
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setPhone(data.phone || "");
      } else {
        Alert.alert("Error", data.message || "Failed to load profile.");
      }
    } catch (error) {
      console.error("Fetch Profile Error:", error);
      Alert.alert("Error", "Network request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    fetchProfile();
    navigation.setOptions({
      headerShown: true,
      headerTitle: "My Profile",
      headerStyle: {
        backgroundColor: "#fff",
      },
      headerTintColor: "#333",
      headerTitleStyle: {
        fontWeight: "bold",
        fontSize: 24,
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.headerLeftButton}
        >
          <Ionicons name="menu" size={28} color="#343a40" />
        </TouchableOpacity>
      ),
      // No headerRight here, as the edit button is now part of the card
    });
  }, [navigation, fetchProfile]);

  const validateProfileInputs = () => {
    let isValid = true;
    if (!firstName.trim()) {
      setFirstNameError("First name is required.");
      isValid = false;
    } else {
      setFirstNameError("");
    }
    if (!lastName.trim()) {
      setLastNameError("Last name is required.");
      isValid = false;
    } else {
      setLastNameError("");
    }
    if (phone && !/^[0-9]{10,15}$/.test(phone)) {
      setPhoneError("Enter a valid phone number (10-15 digits).");
      isValid = false;
    } else {
      setPhoneError("");
    }
    return isValid;
  };

  const updateProfile = async () => {
    if (!validateProfileInputs()) {
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setProfile((prevProfile) => ({
          ...prevProfile,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
        }));
        setProfileModalVisible(false);
        Alert.alert("Success", "Profile updated successfully!");
      } else {
        Alert.alert("Error", data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Update Profile Error:", error);
      Alert.alert("Error", "Could not update profile. Network request failed.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const openProfileEditModal = () => {
    if (profile) {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
      setPhone(profile.phone || "");
      setFirstNameError("");
      setLastNameError("");
      setPhoneError("");
      setProfileModalVisible(true);
    }
  };

  const closeProfileEditModal = () => {
    setProfileModalVisible(false);
  };

  // --- Password Change Functions ---

  const validatePasswordInputs = () => {
    let isValid = true;
    if (!currentPassword.trim()) {
      setCurrentPasswordError("Current password is required.");
      isValid = false;
    } else {
      setCurrentPasswordError("");
    }

    if (!newPassword.trim()) {
      setNewPasswordError("New password is required.");
      isValid = false;
    } else if (newPassword.length < 8) { // Example: minimum 8 characters
      setNewPasswordError("New password must be at least 8 characters long.");
      isValid = false;
    } else if (newPassword === currentPassword) {
      setNewPasswordError("New password cannot be the same as current password.");
      isValid = false;
    }
    else {
      setNewPasswordError("");
    }

    if (!newPasswordConfirmation.trim()) {
      setNewPasswordConfirmationError("Confirm new password is required.");
      isValid = false;
    } else if (newPassword !== newPasswordConfirmation) {
      setNewPasswordConfirmationError("New password and confirmation do not match.");
      isValid = false;
    } else {
      setNewPasswordConfirmationError("");
    }

    return isValid;
  };

  const changePassword = async () => {
    if (!validatePasswordInputs()) {
      return;
    }

    setIsChangingPassword(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: newPasswordConfirmation,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setPasswordModalVisible(false);
        // Clear password fields after successful change
        setCurrentPassword("");
        setNewPassword("");
        setNewPasswordConfirmation("");
        Alert.alert("Success", data.message || "Password changed successfully!");
      } else {
        // Handle specific error messages from backend, e.g., "current_password is incorrect"
        if (data.message === "The current password field is incorrect.") {
            setCurrentPasswordError("Incorrect current password.");
        } else if (data.message && typeof data.message === 'object') {
            // Handle Laravel-style validation errors
            if (data.message.new_password) {
                setNewPasswordError(data.message.new_password[0]);
            }
            if (data.message.new_password_confirmation) {
                setNewPasswordConfirmationError(data.message.new_password_confirmation[0]);
            }
        }
        Alert.alert("Error", data.message || "Failed to change password.");
      }
    } catch (error) {
      console.error("Change Password Error:", error);
      Alert.alert("Error", "Could not change password. Network request failed.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const openPasswordChangeModal = () => {
    // Reset password form fields and errors when opening
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirmation("");
    setCurrentPasswordError("");
    setNewPasswordError("");
    setNewPasswordConfirmationError("");
    setPasswordModalVisible(true);
  };

  const closePasswordChangeModal = () => {
    setPasswordModalVisible(false);
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
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {profile ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {(profile.first_name?.charAt(0) || "") + (profile.last_name?.charAt(0) || "")}
              </Text>
            </View>

            <Text style={styles.profileName}>{profile.first_name} {profile.last_name}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>

            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Feather name="phone" size={20} color="#6C63FF" />
                <Text style={styles.infoText}>{profile.phone || "N/A"}</Text>
              </View>
              <View style={styles.infoItem}>
                <Feather name="calendar" size={20} color="#6C63FF" />
                <Text style={styles.infoText}>Joined: {new Date(profile.created_at).toLocaleDateString()}</Text>
              </View>
              {profile.email_verified_at && (
                <View style={styles.infoItem}>
                  <Feather name="check-circle" size={20} color="#28a745" />
                  <Text style={styles.infoText}>Email Verified</Text>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.editButton} onPress={openProfileEditModal}>
              <Feather name="edit" size={18} color="#fff" style={styles.editButtonIcon} />
              <Text style={styles.editButtonText}>Edit Profile Details</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.editButton, styles.changePasswordButton]} onPress={openPasswordChangeModal}>
              <MaterialCommunityIcons name="form-textbox-password" size={20} color="#fff" style={styles.editButtonIcon} />
              <Text style={styles.editButtonText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#6C63FF" />
          <Text style={styles.emptyText}>Profile Not Found</Text>
          <Text style={styles.emptySubtext}>Please try again or contact support.</Text>
        </View>
      )}

      {/* Edit Profile Details Modal */}
      <Modal
        transparent={true}
        visible={profileModalVisible}
        animationType="slide"
        onRequestClose={closeProfileEditModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={closeProfileEditModal}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile Details</Text>

            <Text style={styles.inputLabel}>First Name *</Text>
            <TextInput
              placeholder="Enter first name"
              placeholderTextColor="#999"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (text.trim()) setFirstNameError("");
              }}
              style={[
                styles.modalInput,
                firstNameError ? styles.inputError : null,
              ]}
              autoCapitalize="words"
            />
            {firstNameError ? (
              <Text style={styles.errorText}>{firstNameError}</Text>
            ) : null}

            <Text style={styles.inputLabel}>Last Name *</Text>
            <TextInput
              placeholder="Enter last name"
              placeholderTextColor="#999"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (text.trim()) setLastNameError("");
              }}
              style={[
                styles.modalInput,
                lastNameError ? styles.inputError : null,
              ]}
              autoCapitalize="words"
            />
            {lastNameError ? (
              <Text style={styles.errorText}>{lastNameError}</Text>
            ) : null}

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              placeholder="Enter phone number (optional)"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (text.trim()) setPhoneError("");
              }}
              style={[
                styles.modalInput,
                phoneError ? styles.inputError : null,
              ]}
              keyboardType="phone-pad"
            />
            {phoneError ? (
              <Text style={styles.errorText}>{phoneError}</Text>
            ) : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeProfileEditModal}
                disabled={isUpdatingProfile}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={updateProfile}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        transparent={true}
        visible={passwordModalVisible}
        animationType="slide"
        onRequestClose={closePasswordChangeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={closePasswordChangeModal}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <Text style={styles.inputLabel}>Current Password *</Text>
            <View style={styles.passwordInputContainer}>
                <TextInput
                    placeholder="Enter current password"
                    placeholderTextColor="#999"
                    value={currentPassword}
                    onChangeText={(text) => {
                        setCurrentPassword(text);
                        if (text.trim()) setCurrentPasswordError("");
                    }}
                    style={[styles.passwordInput, currentPasswordError ? styles.inputError : null]}
                    secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={styles.passwordToggle}>
                    <Ionicons name={showCurrentPassword ? "eye" : "eye-off"} size={24} color="#666" />
                </TouchableOpacity>
            </View>
            {currentPasswordError ? (
              <Text style={styles.errorText}>{currentPasswordError}</Text>
            ) : null}

            <Text style={styles.inputLabel}>New Password *</Text>
            <View style={styles.passwordInputContainer}>
                <TextInput
                    placeholder="Enter new password"
                    placeholderTextColor="#999"
                    value={newPassword}
                    onChangeText={(text) => {
                        setNewPassword(text);
                        if (text.trim()) setNewPasswordError("");
                    }}
                    style={[styles.passwordInput, newPasswordError ? styles.inputError : null]}
                    secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.passwordToggle}>
                    <Ionicons name={showNewPassword ? "eye" : "eye-off"} size={24} color="#666" />
                </TouchableOpacity>
            </View>
            {newPasswordError ? (
              <Text style={styles.errorText}>{newPasswordError}</Text>
            ) : null}

            <Text style={styles.inputLabel}>Confirm New Password *</Text>
            <View style={styles.passwordInputContainer}>
                <TextInput
                    placeholder="Confirm new password"
                    placeholderTextColor="#999"
                    value={newPasswordConfirmation}
                    onChangeText={(text) => {
                        setNewPasswordConfirmation(text);
                        if (text.trim()) setNewPasswordConfirmationError("");
                    }}
                    style={[styles.passwordInput, newPasswordConfirmationError ? styles.inputError : null]}
                    secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.passwordToggle}>
                    <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={24} color="#666" />
                </TouchableOpacity>
            </View>
            {newPasswordConfirmationError ? (
              <Text style={styles.errorText}>{newPasswordConfirmationError}</Text>
            ) : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closePasswordChangeModal}
                disabled={isChangingPassword}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={changePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Change Password</Text>
                )}
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
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  profileName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  profileEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  infoSection: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 20,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: "#444",
    marginLeft: 15,
  },
  editButton: {
    backgroundColor: "#6C63FF",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 15, // Spacing between buttons
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  changePasswordButton: {
    backgroundColor: "#2196F3", // A different color for distinction
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  editButtonIcon: {
    marginRight: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  // Modal styles (reused from CategoryScreen)
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
    fontSize: 22,
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
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: "#333",
  },
  passwordToggle: {
    padding: 10,
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
  // Header specific styles
  headerLeftButton: {
    marginLeft: 15,
    padding: 5,
  },
});

export default ProfileScreen;