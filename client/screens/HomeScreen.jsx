import React, { useEffect, useState } from "react";
import { 
    View, Text, ActivityIndicator, Alert, 
    TouchableOpacity, Modal, StyleSheet 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = ({ navigation, onLogout }) => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                if (!token) {
                    Alert.alert("Error", "No authentication token found.");
                    return;
                }

                const response = await fetch("http://192.168.31.167:8000/api/profile", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (response.ok) {
                    setUserProfile(data);
                    navigation.setOptions({
                        headerRight: () => (
                            <TouchableOpacity onPress={() => setMenuVisible(true)}>
                                <Text style={{ marginRight: 15, fontWeight: "bold" }}>
                                    {data.first_name} {data.last_name} ⏷
                                </Text>
                            </TouchableOpacity>
                        ),
                    });
                } else {
                    Alert.alert("Error", data.message || "Failed to load profile.");
                }
            } catch (error) {
                console.error("Fetch Error:", error);
                Alert.alert("Error", "Network request failed.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [navigation]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {userProfile ? (
                <>
                    <Text style={styles.welcome}>Welcome, {userProfile.first_name}!</Text>
                    <Text>Email: {userProfile.email}</Text>
                </>
            ) : (
                <Text>Error loading profile</Text>
            )}

            {/* Dropdown Modal */}
            <Modal transparent={true} visible={menuVisible} animationType="fade">
                <TouchableOpacity style={styles.overlay} onPress={() => setMenuVisible(false)}>
                    <View style={styles.dropdown}>
                        <Text style={styles.dropdownItem}>{userProfile?.first_name} {userProfile?.last_name}</Text>
                        <Text style={[styles.dropdownItem, styles.disabled]}>Change Password (Disabled)</Text>
                        <TouchableOpacity>
                            <Text style={styles.dropdownItem} onPress={onLogout}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: "center" },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    welcome: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
    overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" },
    dropdown: { backgroundColor: "#fff", padding: 15, borderRadius: 10, width: 200, elevation: 5 },
    dropdownItem: { fontSize: 16, padding: 10 },
    disabled: { color: "gray" },
});

export default HomeScreen;
