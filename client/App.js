import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

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
    await AsyncStorage.removeItem("authToken");
    setIsAuthenticated(false);
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
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? (
          <Stack.Screen name="Home">
            {(props) => <HomeScreen {...props} onLogout={logout} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={login} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
