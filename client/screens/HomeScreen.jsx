import React, { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = ({ navigation, onLogout }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
              <Text style={{ marginRight: 15, fontWeight: "bold" }}>
                {data.first_name} {data.last_name}
              </Text>
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      {userProfile ? (
        <>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Welcome, {userProfile.first_name}!</Text>
          <Text>Email: {userProfile.email}</Text>
          <Button title="Logout" onPress={onLogout} />
        </>
      ) : (
        <Text>Error loading profile</Text>
      )}
    </View>
  );
};

export default HomeScreen;
