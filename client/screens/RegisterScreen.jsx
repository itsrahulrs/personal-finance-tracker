import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleRegister = async () => {
    if (!form.firstName || !form.lastName || !form.phone || !form.email || !form.password || !form.confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Save user data (mock example)
    try {
      await AsyncStorage.setItem('user', JSON.stringify(form));
      Alert.alert('Success', 'Registration successful!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'Something went wrong!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput style={styles.input} placeholder="First Name" onChangeText={(value) => handleChange('firstName', value)} />
      <TextInput style={styles.input} placeholder="Last Name" onChangeText={(value) => handleChange('lastName', value)} />
      <TextInput style={styles.input} placeholder="Phone" keyboardType="phone-pad" onChangeText={(value) => handleChange('phone', value)} />
      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" onChangeText={(value) => handleChange('email', value)} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={(value) => handleChange('password', value)} />
      <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry onChangeText={(value) => handleChange('confirmPassword', value)} />
      <Button title="Register" onPress={handleRegister} />
      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Already have an account? Login</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  link: { color: 'blue', textAlign: 'center', marginTop: 10 },
});

export default RegisterScreen;
