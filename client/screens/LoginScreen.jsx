import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";

const LoginScreen = ({ navigation, onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        if (!email) {
            Alert.alert("Error", "Email is required");
            return;
        }

        if (!password) {
            Alert.alert("Error", "Password is required");
            return;
        }

        try {
            const response = await fetch("http://192.168.31.167:8000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log("Response:", data);

            if (response.ok) {
                await AsyncStorage.setItem("authToken", data.token);
                Alert.alert("Success", "Login Successful!");
                
                // ✅ Call the onLogin function to update state and redirect
                onLogin();  
            } else {
                Alert.alert("Error", data.message || "Login failed");
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            Alert.alert("Error", "Network request failed.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Login" onPress={handleLogin} />
            <Text style={styles.link} onPress={() => navigation.navigate("Register")}>
                Don't have an account? Register
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: "center" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
});

export default LoginScreen;
