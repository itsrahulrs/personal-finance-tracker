import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
  Easing,
  Platform,
  StatusBar,
  SafeAreaView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStackNavigator } from "@react-navigation/stack";
import { createNavigationContainerRef, NavigationContainer } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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
import { BASE_URL } from "./config";
import ReportScreen from "./screens/ReportScreen";

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [accountSubmenuVisible, setAccountSubmenuVisible] = useState(false);
  const [transactionSubmenuVisible, setTransactionSubmenuVisible] = useState(false);

  // Animation values
  const sidebarPosition = new Animated.Value(-300);
  const overlayOpacity = new Animated.Value(0);

  useEffect(() => {
    const checkAuthToken = async () => {
      const token = await AsyncStorage.getItem("authToken");
      setIsAuthenticated(!!token);
      setLoading(false);
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

      const response = await fetch(`${BASE_URL}/logout`, {
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

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

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
                headerLeft: ({ navigation }) => (
                  <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    style={styles.menuButton}
                  >
                    <Ionicons name="menu" size={28} color="#6C63FF" />
                  </TouchableOpacity>
                ),
              }}
            >
              {(props) => <HomeScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="Account"
              options={{
                title: "Accounts",
                headerLeft: ({ navigation }) => (
                  <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    style={styles.menuButton}
                  >
                    <Ionicons name="menu" size={28} color="#6C63FF" />
                  </TouchableOpacity>
                ),
              }}
            >
              {(props) => <AccountScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="AccountCategory"
              options={{
                title: "Account Categories",
                headerLeft: ({ navigation }) => (
                  <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    style={styles.menuButton}
                  >
                    <Ionicons name="menu" size={28} color="#6C63FF" />
                  </TouchableOpacity>
                ),
              }}
            >
              {(props) => <AccountCategoryScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="Category"
              options={{
                title: "Categories",
                headerLeft: ({ navigation }) => (
                  <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    style={styles.menuButton}
                  >
                    <Ionicons name="menu" size={28} color="#6C63FF" />
                  </TouchableOpacity>
                ),
              }}
            >
              {(props) => <CategoryScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="FamilyAccounts"
              options={{
                title: "Family Accounts",
                headerLeft: ({ navigation }) => (
                  <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    style={styles.menuButton}
                  >
                    <Ionicons name="menu" size={28} color="#6C63FF" />
                  </TouchableOpacity>
                ),
              }}
            >
              {(props) => <FamilyAccountsScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="CreditCardReminders"
              options={{
                title: "Credit Card Reminders",
                headerLeft: ({ navigation }) => (
                  <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    style={styles.menuButton}
                  >
                    <Ionicons name="menu" size={28} color="#6C63FF" />
                  </TouchableOpacity>
                ),
              }}
            >
              {(props) => <CreditCardRemindersScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="RecurringTransactions"
              options={{
                title: "Recurring Transactions",
                headerLeft: ({ navigation }) => (
                  <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    style={styles.menuButton}
                  >
                    <Ionicons name="menu" size={28} color="#6C63FF" />
                  </TouchableOpacity>
                ),
              }}
            >
              {(props) => <RecurringTransactionsScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="Report"
              options={{
                title: "Reports",
                headerLeft: ({ navigation }) => (
                  <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    style={styles.menuButton}
                  >
                    <Ionicons name="menu" size={28} color="#6C63FF" />
                  </TouchableOpacity>
                ),
              }}
            >
              {(props) => <ReportScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="SavingsGoal"
              options={{
                title: "Savings Goal",
                headerLeft: ({ navigation }) => (
                  <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    style={styles.menuButton}
                  >
                    <Ionicons name="menu" size={28} color="#6C63FF" />
                  </TouchableOpacity>
                ),
              }}
            >
              {(props) => <SavingsGoalScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen
              name="Transaction"
              options={{
                title: "Transactions",
                headerLeft: ({ navigation }) => (
                  <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    style={styles.menuButton}
                  >
                    <Ionicons name="menu" size={28} color="#6C63FF" />
                  </TouchableOpacity>
                ),
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

      {/* Sidebar Menu Modal */}
      <Modal transparent={true} visible={menuVisible} animationType="none">
        <Animated.View
          style={[styles.overlay, { opacity: overlayOpacity }]}
          onStartShouldSetResponder={() => true}
          onResponderRelease={() => setMenuVisible(false)}
        >
          {/* This View captures all touches within the sidebar content */}
          <Animated.View
            style={[
              styles.sidebar,
              { transform: [{ translateX: sidebarPosition }] }
            ]}
            onStartShouldSetResponder={() => true} // This view becomes the responder
            onResponderRelease={(e) => {
              // Ensure this touch event does not bubble up to the overlay
              // This is crucial for preventing the sidebar from closing on inner taps
              e.stopPropagation();
            }}
          >
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Menu</Text>
              <TouchableOpacity
                onPress={() => setMenuVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6C63FF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sidebarItemContainer}
              onPress={() => {
                setMenuVisible(false);
                navigationRef.current?.navigate("Home");
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="home-outline" size={22} color="#6C63FF" style={styles.sidebarIcon} />
              <Text style={styles.sidebarItem}>Home</Text>
            </TouchableOpacity>

            {/* Account Menu with Submenu */}
            <TouchableOpacity
              style={styles.sidebarItemContainer}
              onPress={() => setAccountSubmenuVisible(!accountSubmenuVisible)}
              activeOpacity={0.7}
            >
              <Ionicons name="wallet-outline" size={22} color="#6C63FF" style={styles.sidebarIcon} />
              <Text style={styles.sidebarItem}>Accounts</Text>
              <MaterialIcons
                name={accountSubmenuVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={24}
                color="#6C63FF"
                style={styles.arrowIcon}
              />
            </TouchableOpacity>

            {accountSubmenuVisible && (
              <View style={styles.submenu}>
                <TouchableOpacity
                  style={styles.submenuItemContainer}
                  onPress={() => {
                    setMenuVisible(false);
                    navigationRef.current?.navigate("Account");
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.submenuItem}>Account List</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submenuItemContainer}
                  onPress={() => {
                    setMenuVisible(false);
                    navigationRef.current?.navigate("AccountCategory");
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.submenuItem}>Account Categories</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Transaction Menu with Submenu */}
            <TouchableOpacity
              style={styles.sidebarItemContainer}
              onPress={() => setTransactionSubmenuVisible(!transactionSubmenuVisible)}
              activeOpacity={0.7}
            >
              <Ionicons name="swap-horizontal-outline" size={22} color="#6C63FF" style={styles.sidebarIcon} />
              <Text style={styles.sidebarItem}>Transactions</Text>
              <MaterialIcons
                name={transactionSubmenuVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={24}
                color="#6C63FF"
                style={styles.arrowIcon}
              />
            </TouchableOpacity>

            {transactionSubmenuVisible && (
              <View style={styles.submenu}>
                <TouchableOpacity
                  style={styles.submenuItemContainer}
                  onPress={() => {
                    setMenuVisible(false);
                    navigationRef.current?.navigate("Transaction");
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.submenuItem}>Transaction List</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submenuItemContainer}
                  onPress={() => {
                    setMenuVisible(false);
                    navigationRef.current?.navigate("Category");
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.submenuItem}>Categories</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.sidebarItemContainer}
              onPress={() => {
                setMenuVisible(false);
                navigationRef.current?.navigate("SavingsGoal");
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="pie-chart-outline" size={22} color="#6C63FF" style={styles.sidebarIcon} />
              <Text style={styles.sidebarItem}>Savings Goal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarItemContainer}
              onPress={() => {
                setMenuVisible(false);
                navigationRef.current?.navigate("FamilyAccounts");
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="people-outline" size={22} color="#6C63FF" style={styles.sidebarIcon} />
              <Text style={styles.sidebarItem}>Family Accounts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarItemContainer}
              onPress={() => {
                setMenuVisible(false);
                navigationRef.current?.navigate("CreditCardReminders");
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="card-outline" size={22} color="#6C63FF" style={styles.sidebarIcon} />
              <Text style={styles.sidebarItem}>Credit Card Reminders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarItemContainer}
              onPress={() => {
                setMenuVisible(false);
                navigationRef.current?.navigate("RecurringTransactions");
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="repeat-outline" size={22} color="#6C63FF" style={styles.sidebarIcon} />
              <Text style={styles.sidebarItem}>Recurring Transactions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarItemContainer}
              onPress={() => {
                setMenuVisible(false);
                navigationRef.current?.navigate("Report");
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="bar-chart-outline" size={22} color="#6C63FF" style={styles.sidebarIcon} />
              <Text style={styles.sidebarItem}>Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarItemContainer}
              onPress={logout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={22} color="#6C63FF" style={styles.sidebarIcon} />
              <Text style={styles.sidebarItem}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sidebar: {
    width: 280,
    height: "100%",
    backgroundColor: "#fff",
    position: "absolute",
    left: 0,
    top: 0,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 40,
    opacity: 1,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 8,
  },
  sidebarItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sidebarItem: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  sidebarIcon: {
    width: 24,
    textAlign: "center",
  },
  arrowIcon: {
    marginLeft: "auto",
  },
  submenu: {
    backgroundColor: "#f9f9f9",
  },
  submenuItemContainer: {
    paddingVertical: 12,
    paddingLeft: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  submenuItem: {
    fontSize: 15,
    color: "#555",
  },
});

export const navigationRef = createNavigationContainerRef();