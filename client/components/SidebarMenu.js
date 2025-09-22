import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const SidebarMenu = ({
  menuVisible,
  setMenuVisible,
  logout,
  sidebarPosition,
  overlayOpacity,
}) => {
  // useNavigation hook gives access to the navigation object within any component
  const navigation = useNavigation();

  const [accountSubmenuVisible, setAccountSubmenuVisible] = React.useState(false);
  const [transactionSubmenuVisible, setTransactionSubmenuVisible] = React.useState(false);

  // Helper function to navigate and close the menu
  const navigateAndCloseMenu = (screenName) => {
    setMenuVisible(false);
    navigation.navigate(screenName);
  };

  return (
    <Modal transparent={true} visible={menuVisible} animationType="none">
      <Animated.View
        style={[styles.overlay, { opacity: overlayOpacity }]}
        // This makes the overlay touchable to close the sidebar
        onStartShouldSetResponder={() => true}
        onResponderRelease={() => setMenuVisible(false)}
      >
        {/* This Animated.View is the sidebar itself */}
        <Animated.View
          style={[
            styles.sidebar,
            { transform: [{ translateX: sidebarPosition }] },
          ]}
          // This prevents touches inside the sidebar from bubbling up to the overlay and closing it
          onStartShouldSetResponder={() => true}
          onResponderRelease={(e) => e.stopPropagation()}
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
            onPress={() => navigateAndCloseMenu("Home")}
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
                onPress={() => navigateAndCloseMenu("Account")}
                activeOpacity={0.7}
              >
                <Text style={styles.submenuItem}>Account List</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submenuItemContainer}
                onPress={() => navigateAndCloseMenu("AccountCategory")}
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
                onPress={() => navigateAndCloseMenu("Transaction")}
                activeOpacity={0.7}
              >
                <Text style={styles.submenuItem}>Transaction List</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submenuItemContainer}
                onPress={() => navigateAndCloseMenu("Category")}
                activeOpacity={0.7}
              >
                <Text style={styles.submenuItem}>Categories</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.sidebarItemContainer}
            onPress={() => navigateAndCloseMenu("SavingsGoal")}
            activeOpacity={0.7}
          >
            <Ionicons name="pie-chart-outline" size={22} color="#6C63FF" style={styles.sidebarIcon} />
            <Text style={styles.sidebarItem}>Savings Goal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sidebarItemContainer}
            onPress={() => navigateAndCloseMenu("FamilyAccounts")}
            activeOpacity={0.7}
          >
            <Ionicons name="people-outline" size={22} color="#6C63FF" style={styles.sidebarIcon} />
            <Text style={styles.sidebarItem}>Family Accounts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sidebarItemContainer}
            onPress={() => navigateAndCloseMenu("CreditCardReminders")}
            activeOpacity={0.7}
          >
            <Ionicons name="card-outline" size={22} color="#6C63FF" style={styles.sidebarIcon} />
            <Text style={styles.sidebarItem}>Credit Card Reminders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sidebarItemContainer}
            onPress={() => navigateAndCloseMenu("RecurringTransactions")}
            activeOpacity={0.7}
          >
            <Ionicons name="repeat-outline" size={22} color="#6C63FF" style={styles.sidebarIcon} />
            <Text style={styles.sidebarItem}>Recurring Transactions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sidebarItemContainer}
            onPress={logout} // Logout still handled by App.js's logout prop
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color="#6C63FF" style={styles.sidebarIcon} />
            <Text style={styles.sidebarItem}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sidebar: {
    width: 280, // Fixed width for the sidebar
    height: "100%",
    backgroundColor: "#fff",
    position: "absolute",
    left: 0,
    top: 0,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 40, // Adjust for status bar on different platforms
    opacity: 1, // Keep opacity at 1, the overlay handles overall dimming
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
    flex: 1, // Allows text to take up available space
  },
  sidebarIcon: {
    width: 24,
    textAlign: "center",
  },
  arrowIcon: {
    marginLeft: "auto", // Pushes the arrow to the right
  },
  submenu: {
    backgroundColor: "#f9f9f9",
    paddingLeft: 20, // Indent submenu items
  },
  submenuItemContainer: {
    paddingVertical: 12,
    paddingLeft: 40, // Further indent for submenu items
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  submenuItem: {
    fontSize: 15,
    color: "#555",
  },
});

export default SidebarMenu;