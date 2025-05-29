// App.js
import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  Animated,
  Easing,
  SafeAreaView,
  TouchableOpacity, // Import TouchableOpacity for the menu button
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStackNavigator } from "@react-navigation/stack";
import { createNavigationContainerRef, NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // Only Ionicons needed here for menu button

// Import your screens
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import AccountScreen from "./screens/Account/AccountScreen";
import AccountCategoryScreen from "./screens/Account/AccountCategory/AccountCategoryScreen";
import CategoryScreen from "./screens/CategoryScreen";
import TransactionScreen from "./screens/TransactionScreen";
import SavingsGoalScreen from "./screens/SavingsGoalScreen";
import CreditCardRemindersScreen from "./screens/CreditCardRemindersScreen";
import RecurringTransactionsScreen from "./screens/RecurringTransactionScreen";
import FamilyAccountsScreen from "./screens/Family/FamilyAccountsScreen";
import ProfileScreen from "./screens/ProfileScreen";

// Import the new SidebarMenu component
import SidebarMenu from './components/SidebarMenu';

const Stack = createStackNavigator();

export const navigationRef = createNavigationContainerRef(); // Keep this global

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  const sidebarPosition = new Animated.Value(-300);
  const overlayOpacity = new Animated.Value(0);

  useEffect(() => {
    const checkAuthToken = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        setIsAuthenticated(!!token);
      } catch (e) {
        console.error("Failed to load auth token:", e);
        Alert.alert("Error", "Could not load session data.");
      } finally {
        setLoading(false);
      }
    };
    checkAuthToken();
  }, []);

  useEffect(() => {
    if (menuVisible) {
      Animated.parallel([
        Animated.timing(sidebarPosition, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(sidebarPosition, {
          toValue: -300,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [menuVisible]);

  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        Alert.alert("Error", "No authentication token found.");
        return;
      }

      // Use an environment variable for the base URL
      const API_BASE_URL = "http://192.168.31.167:8000"; // Replace with process.env.API_BASE_URL in a real app

      const response = await fetch(`${API_BASE_URL}/api/logout`, {
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
        setMenuVisible(false);
      } else {
        const data = await response.json();
        Alert.alert("Error", data.message || "Logout failed");
      }
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", "Network request failed.");
    }
  };

  const login = async () => {
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Reusable Header Left Component
  const MenuHeaderButton = () => (
    <TouchableOpacity
      onPress={() => setMenuVisible(true)}
      style={styles.menuButton}
    >
      <Ionicons name="menu" size={28} color="#6C63FF" />
    </TouchableOpacity>
  );

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#fff",
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTitleStyle: {
            color: "#333",
            fontWeight: "600",
          },
          headerTintColor: "#6C63FF",
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="Home"
              options={{
                title: "Dashboard",
                headerLeft: MenuHeaderButton, // Use the reusable component
              }}
            >
              {(props) => <HomeScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            {/* All other authenticated screens, using MenuHeaderButton */}
            <Stack.Screen
              name="Account"
              options={{
                title: "Accounts",
                headerLeft: MenuHeaderButton,
              }}
            >
              {(props) => <AccountScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="AccountCategory"
              options={{
                title: "Account Categories",
                headerLeft: MenuHeaderButton,
              }}
            >
              {(props) => <AccountCategoryScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="Category"
              options={{
                title: "Categories",
                headerLeft: MenuHeaderButton,
              }}
            >
              {(props) => <CategoryScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="FamilyAccounts"
              options={{
                title: "Family Accounts",
                headerLeft: MenuHeaderButton,
              }}
            >
              {(props) => <FamilyAccountsScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="CreditCardReminders"
              options={{
                title: "Credit Card Reminders",
                headerLeft: MenuHeaderButton,
              }}
            >
              {(props) => <CreditCardRemindersScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="RecurringTransactions"
              options={{
                title: "Recurring Transactions",
                headerLeft: MenuHeaderButton,
              }}
            >
              {(props) => <RecurringTransactionsScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="SavingsGoal"
              options={{
                title: "Savings Goal",
                headerLeft: MenuHeaderButton,
              }}
            >
              {(props) => <SavingsGoalScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="Transaction"
              options={{
                title: "Transactions",
                headerLeft: MenuHeaderButton,
              }}
            >
              {(props) => <TransactionScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="Profile"
              options={{ headerShown: false }}
            >
              {(props) => <ProfileScreen {...props} onLogin={login} />}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              options={{ headerShown: false }}
            >
              {(props) => <LoginScreen {...props} onLogin={login} />}
            </Stack.Screen>
            <Stack.Screen
              name="Register"
              options={{ headerShown: false }}
              component={RegisterScreen}
            />
          </>
        )}
      </Stack.Navigator>

      <SidebarMenu
        menuVisible={menuVisible}
        setMenuVisible={setMenuVisible}
        logout={logout}
        sidebarPosition={sidebarPosition}
        overlayOpacity={overlayOpacity}
      />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6C63FF",
  },
  menuButton: {
    marginLeft: 15,
    padding: 8,
  },
});