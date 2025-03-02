import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const HomeScreen = ({ onLogout }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Home</Text>
      <Button title="Logout" onPress={onLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
});

export default HomeScreen;
