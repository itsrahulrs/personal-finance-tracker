import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation }) => {
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

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
            Alert.alert('Error', 'Password are required');
            return;
        }

        if (form.password !== form.password_confirmation) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        // Save user data (mock example)
        try {
            const response = await fetch('http://192.168.31.167:8000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            }) 

            const data = await response.json();
      
            if (response.ok) {
              Alert.alert('Success', 'Registration successful and please verify your email before continue!');
              navigation.navigate('Login');
            } else {
              Alert.alert('Error', data.message || 'Registration failed');
              console.log(data);
              
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Something went wrongs!');
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
