import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen = ({ navigation }) => {
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [loading, setLoading] = useState(false);
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);

    const handleChange = (name, value) => {
        setForm({ ...form, [name]: value });
    };

    const handleRegister = async () => {
        if (!form.first_name) {
            Alert.alert('Error', 'First name is required');
            return;
        }

        if (!form.email) {
            Alert.alert('Error', 'Email is required');
            return;
        }

        if (!form.password) {
            Alert.alert('Error', 'Password is required');
            return;
        }

        if (form.password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        if (form.password !== form.password_confirmation) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('${BASE_URL}/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Registration successful! Please verify your email before continuing.');
                navigation.navigate('Login');
            } else {
                const errorMessage = data.errors 
                    ? Object.values(data.errors).join('\n')
                    : data.message || 'Registration failed';
                Alert.alert('Error', errorMessage);
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Network request failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Fill in your details to get started</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* First Name */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="First Name"
                            placeholderTextColor="#999"
                            value={form.first_name}
                            onChangeText={(value) => handleChange('first_name', value)}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Last Name */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Last Name"
                            placeholderTextColor="#999"
                            value={form.last_name}
                            onChangeText={(value) => handleChange('last_name', value)}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Phone */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="call-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            placeholderTextColor="#999"
                            value={form.phone}
                            onChangeText={(value) => handleChange('phone', value)}
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Email */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            placeholderTextColor="#999"
                            value={form.email}
                            onChangeText={(value) => handleChange('email', value)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Password */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password (min 6 characters)"
                            placeholderTextColor="#999"
                            value={form.password}
                            onChangeText={(value) => handleChange('password', value)}
                            secureTextEntry={secureTextEntry}
                        />
                        <TouchableOpacity 
                            onPress={() => setSecureTextEntry(!secureTextEntry)}
                            style={styles.eyeIcon}
                        >
                            <Ionicons 
                                name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'} 
                                size={20} 
                                color="#6C63FF" 
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            placeholderTextColor="#999"
                            value={form.password_confirmation}
                            onChangeText={(value) => handleChange('password_confirmation', value)}
                            secureTextEntry={confirmSecureTextEntry}
                        />
                        <TouchableOpacity 
                            onPress={() => setConfirmSecureTextEntry(!confirmSecureTextEntry)}
                            style={styles.eyeIcon}
                        >
                            <Ionicons 
                                name={confirmSecureTextEntry ? 'eye-off-outline' : 'eye-outline'} 
                                size={20} 
                                color="#6C63FF" 
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity 
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.footerLink}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingVertical: 40,
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    form: {
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        color: '#333',
        fontSize: 16,
    },
    eyeIcon: {
        padding: 10,
    },
    button: {
        backgroundColor: '#6C63FF',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
    footerLink: {
        color: '#6C63FF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default RegisterScreen;