import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert, Modal, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStackNavigator } from "@react-navigation/stack";
import { createNavigationContainerRef, NavigationContainer } from "@react-navigation/native";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import { Text } from "react-native";
import AccountScreen from "./screens/Account/AccountScreen";
import AccountCategoryScreen from "./screens/Account/AccountCategory/AccountCategoryScreen";
import CategoryScreen from "./screens/CategoryScreen";
import TransactionScreen from "./screens/TransactionScreen";
// import AccountScreen from "./screens/Account/AccountScreen";

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [accountSubmenuVisible, setAccountSubmenuVisible] = useState(false);
  const [transactionSubmenuVisible, setTransactionSubmenuVisible] = useState(false);

  useEffect(() => {
    const checkAuthToken = async () => {
      const token = await AsyncStorage.getItem("authToken");
      setIsAuthenticated(!!token);
      setLoading(false);
    };

    checkAuthToken();
  }, []);

  // ✅ Logout function (removes token and redirects to login)
  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        Alert.alert("Error", "No authentication token found.");
        return;
      }

      const response = await fetch("http://192.168.31.167:8000/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await AsyncStorage.removeItem("authToken");
        Alert.alert("Success", "Logged out successfully!");
        setIsAuthenticated(false);
      } else {
        const data = await response.json();
        Alert.alert("Error", data.message || "Logout failed");
      }
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", "Network request failed.");
    }
  };


  // ✅ Login function (sets token state after successful login)
  const login = async () => {
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="Home"
              options={{
                headerLeft: ({ navigation }) => (
                  <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ marginLeft: 15 }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>☰</Text>
                  </TouchableOpacity>
                ),
              }}
            >
              {(props) => <HomeScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="Account"
              options={{
                headerLeft: ({ navigation }) => (
                  <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ marginLeft: 15 }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>☰</Text>
                  </TouchableOpacity>
                ),
              }}
            >
              {(props) => <AccountScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="AccountCategory"
              options={{
                headerLeft: ({ navigation }) => (
                  <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ marginLeft: 15 }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>☰</Text>
                  </TouchableOpacity>
                ),
              }}
            >
              {(props) => <AccountCategoryScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="Category"
              options={{
                headerLeft: ({ navigation }) => (
                  <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ marginLeft: 15 }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>☰</Text>
                  </TouchableOpacity>
                ),
              }}
            >
              {(props) => <CategoryScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="Transaction"
              options={{
                headerLeft: ({ navigation }) => (
                  <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ marginLeft: 15 }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>☰</Text>
                  </TouchableOpacity>
                ),
              }}
            >
              {(props) => <TransactionScreen {...props} onLogout={logout} />}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={login} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>

      {/* Sidebar Menu Modal */}
      <Modal transparent={true} visible={menuVisible} animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>Menu</Text>

            <TouchableOpacity onPress={() => { setMenuVisible(false); navigationRef.current?.navigate("Home"); }}>
              <Text style={styles.sidebarItem}>Home</Text>
            </TouchableOpacity>

            {/* Account Menu with Submenu */}
            <TouchableOpacity onPress={() => setAccountSubmenuVisible(!accountSubmenuVisible)}>
              <Text style={styles.sidebarItem}>
                Accounts {accountSubmenuVisible ? "▼" : "▶"}
              </Text>
            </TouchableOpacity>

            {accountSubmenuVisible && (
              <View style={styles.submenu}>
                <TouchableOpacity onPress={() => { setMenuVisible(false); navigationRef.current?.navigate("Account"); }}>
                  <Text style={styles.submenuItem}>Account</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setMenuVisible(false); navigationRef.current?.navigate("AccountCategory"); }}>
                  <Text style={styles.submenuItem}>Account Category</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Account Menu with Submenu */}
            <TouchableOpacity onPress={() => setTransactionSubmenuVisible(!transactionSubmenuVisible)}>
              <Text style={styles.sidebarItem}>
                Transactions {transactionSubmenuVisible ? "▼" : "▶"}
              </Text>
            </TouchableOpacity>

            {transactionSubmenuVisible && (
              <View style={styles.submenu}>
                <TouchableOpacity onPress={() => { setMenuVisible(false); navigationRef.current?.navigate("Transaction"); }}>
                  <Text style={styles.submenuItem}>Transaction</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setMenuVisible(false); navigationRef.current?.navigate("Category"); }}>
                  <Text style={styles.submenuItem}>Category</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={logout}>
              <Text style={styles.sidebarItem}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>


    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  sidebar: { width: 250, height: "100%", backgroundColor: "#fff", padding: 20, position: "absolute", left: 0, top: 0 },
  sidebarTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  sidebarItem: { fontSize: 18, padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  submenu: { paddingLeft: 20, marginTop: 5 },
  submenuItem: { fontSize: 16, padding: 8, color: "#555" },
});


export const navigationRef = createNavigationContainerRef();
