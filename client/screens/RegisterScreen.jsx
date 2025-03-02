import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';

const RegisterScreen = ({ navigation }) => {
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [loading, setLoading] = useState(false); // Track loading state

    const handleChange = (name, value) => {
        setForm({ ...form, [name]: value });
    };

    const handleRegister = async () => {
        if (!form.first_name) {
            Alert.alert('Error', 'First name required');
            return;
        }

        if (!form.email) {
            Alert.alert('Error', 'Email required');
            return;
        }

        if (!form.password) {
            Alert.alert('Error', 'Password is required');
            return;
        }

        if (form.password !== form.password_confirmation) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true); // Show loader

        try {
            const response = await fetch('http://192.168.31.167:8000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Registration successful! Please verify your email before continuing.');
                navigation.navigate('Login'); // Redirect to Login screen
            } else {
                Alert.alert('Error', data.message || 'Registration failed');
                console.log(data);
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Something went wrong!');
        } finally {
            setLoading(false); // Hide loader after request completes
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <TextInput style={styles.input} placeholder="First Name" onChangeText={(value) => handleChange('first_name', value)} />
            <TextInput style={styles.input} placeholder="Last Name" onChangeText={(value) => handleChange('last_name', value)} />
            <TextInput style={styles.input} placeholder="Phone" keyboardType="phone-pad" onChangeText={(value) => handleChange('phone', value)} />
            <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" onChangeText={(value) => handleChange('email', value)} />
            <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={(value) => handleChange('password', value)} />
            <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry onChangeText={(value) => handleChange('password_confirmation', value)} />

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" /> // Show loader when API is in progress
            ) : (
                <Button title="Register" onPress={handleRegister} />
            )}

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
