import React, { useEffect, useState } from "react";
import { 
    View, 
    Text, 
    ActivityIndicator, 
    Alert, 
    TouchableOpacity, 
    Modal, 
    StyleSheet,
    ScrollView,
    Image,
    SafeAreaView,
    StatusBar,
    Platform
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = ({ navigation, onLogout }) => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);
    const [stats, setStats] = useState({
        totalBalance: 0,
        income: 0,
        expenses: 0,
        recentTransactions: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                if (!token) {
                    Alert.alert("Error", "No authentication token found.");
                    return;
                }

                // Fetch user profile
                const profileResponse = await fetch("http://192.168.31.167:8000/api/profile", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });                

                const profileData = await profileResponse.json();
                console.log(profileData);

                const transactionsResponse = await fetch(`http://192.168.31.167:8000/api/transaction`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                const transactionsData = await transactionsResponse.json();
                console.log(transactionsData);

                if (profileResponse.ok && transactionsResponse.ok) {
                    setUserProfile(profileData);

                    // --- 3. Process Transactions to Calculate Stats ---
                    let totalIncome = 0;
                    let totalExpenses = 0;

                    // Assuming transactionsData is an array of transaction objects
                    transactionsData.data.forEach(transaction => {
                        const amount = parseFloat(transaction.amount); // Ensure amount is a number
                        if (transaction.type === 'income') {
                            totalIncome += amount;
                        } else if (transaction.type === 'expense') {
                            totalExpenses += amount;
                        }
                    });

                    const calculatedTotalBalance = totalIncome - totalExpenses;

                    // Sort transactions by date to get recent ones (optional, but good for "Recent Transactions")
                    const sortedTransactions = transactionsData.data.sort((a, b) =>
                        new Date(b.transaction_date) - new Date(a.transaction_date)
                    );

                    // Take only the top few for "Recent Transactions" section, e.g., 4
                    const recentTransactions = sortedTransactions.slice(0, 4);

                    setStats({
                        totalBalance: calculatedTotalBalance,
                        income: totalIncome,
                        expenses: totalExpenses,
                        recentTransactions: recentTransactions
                    });
                    
                    navigation.setOptions({
                        headerRight: () => (
                            <TouchableOpacity 
                                onPress={() => setMenuVisible(true)}
                                style={styles.profileButton}
                            >
                                <View style={styles.profileInitials}>
                                    <Text style={styles.profileInitialsText}>
                                        {profileData.first_name.charAt(0)}{profileData.last_name.charAt(0)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ),
                    });
                } else {
                    Alert.alert("Error", profileData.message || "Failed to load profile.");
                }
            } catch (error) {
                console.error("Fetch Error:", error);
                Alert.alert("Error", "Network request failed.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigation]);

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C63FF" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.userName}>{userProfile?.first_name} {userProfile?.last_name}</Text>
                </View>

                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceTitle}>Total Balance</Text>
                    <Text style={styles.balanceAmount}>₹{stats.totalBalance.toLocaleString()}</Text>
                    
                    <View style={styles.incomeExpenseContainer}>
                        <View style={styles.incomeExpenseItem}>
                            <View style={[styles.incomeExpenseIcon, { backgroundColor: 'rgba(40, 167, 69, 0.1)' }]}>
                                <Ionicons name="arrow-down" size={20} color="#28a745" />
                            </View>
                            <View>
                                <Text style={styles.incomeExpenseLabel}>Income</Text>
                                <Text style={[styles.incomeExpenseValue, { color: '#28a745' }]}>
                                    +₹{stats.income.toLocaleString()}
                                </Text>
                            </View>
                        </View>
                        
                        <View style={styles.incomeExpenseItem}>
                            <View style={[styles.incomeExpenseIcon, { backgroundColor: 'rgba(220, 53, 69, 0.1)' }]}>
                                <Ionicons name="arrow-up" size={20} color="#dc3545" />
                            </View>
                            <View>
                                <Text style={styles.incomeExpenseLabel}>Expenses</Text>
                                <Text style={[styles.incomeExpenseValue, { color: '#dc3545' }]}>
                                    -₹{stats.expenses.toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                </View>
                
                <View style={styles.quickActions}>
                    <TouchableOpacity 
                        style={styles.quickActionButton}
                        onPress={() => navigation.navigate('Transaction')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#6C63FF' }]}>
                            <MaterialIcons name="attach-money" size={24} color="#fff" />
                        </View>
                        <Text style={styles.quickActionText}>Add Transaction</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.quickActionButton}
                        onPress={() => navigation.navigate('Account')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#4CAF50' }]}>
                            <FontAwesome name="bank" size={20} color="#fff" />
                        </View>
                        <Text style={styles.quickActionText}>Accounts</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.quickActionButton}
                        onPress={() => navigation.navigate('Category')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#FF9800' }]}>
                            <MaterialIcons name="category" size={24} color="#fff" />
                        </View>
                        <Text style={styles.quickActionText}>Categories</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Transactions */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Transactions</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Transaction')}>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>
                
                {stats.recentTransactions.length > 0 ? (
                    <View style={styles.transactionsContainer}>
                        {stats.recentTransactions.map((transaction) => (
                            <TouchableOpacity 
                                key={transaction.id} 
                                style={styles.transactionItem}
                                onPress={() => navigation.navigate('Transaction', { transactionId: transaction.id })}
                            >
                                <View style={styles.transactionIcon}>
                                    <Ionicons 
                                        name={transaction.type === 'income' ? 'arrow-down' : 'arrow-up'} 
                                        size={20} 
                                        color={transaction.type === 'income' ? '#28a745' : '#dc3545'} 
                                    />
                                </View>
                                <View style={styles.transactionDetails}>
                                    <Text style={styles.transactionTitle}>{transaction.name}</Text>
                                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                                </View>
                                <Text 
                                    style={[
                                        styles.transactionAmount,
                                        { color: transaction.type === 'income' ? '#28a745' : '#dc3545' }
                                    ]}
                                >
                                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={styles.noTransactions}>
                        <Text style={styles.noTransactionsText}>No recent transactions</Text>
                    </View>
                )}
            </ScrollView>

            {/* Profile Menu Modal */}
            <Modal transparent={true} visible={menuVisible} animationType="fade">
                <TouchableOpacity 
                    style={styles.menuOverlay} 
                    activeOpacity={1}
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.menuContainer}>
                        <View style={styles.menuHeader}>
                            <View style={styles.menuProfileInitials}>
                                <Text style={styles.menuProfileInitialsText}>
                                    {userProfile?.first_name.charAt(0)}{userProfile?.last_name.charAt(0)}
                                </Text>
                            </View>
                            <View style={styles.menuProfileInfo}>
                                <Text style={styles.menuProfileName}>
                                    {userProfile?.first_name} {userProfile?.last_name}
                                </Text>
                                <Text style={styles.menuProfileEmail}>{userProfile?.email}</Text>
                            </View>
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.menuItem}
                            onPress={() => {
                                setMenuVisible(false);
                                navigation.navigate('Profile');
                            }}
                        >
                            <Ionicons name="person-outline" size={20} color="#6C63FF" />
                            <Text style={styles.menuItemText}>My Profile</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.menuItem}
                            onPress={() => {
                                setMenuVisible(false);
                                onLogout();
                            }}
                        >
                            <Ionicons name="log-out-outline" size={20} color="#6C63FF" />
                            <Text style={styles.menuItemText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    welcomeSection: {
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 18,
        color: '#6c757d',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#343a40',
    },
    balanceCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    balanceTitle: {
        fontSize: 16,
        color: '#6c757d',
        marginBottom: 5,
    },
    balanceAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#343a40',
        marginBottom: 20,
    },
    incomeExpenseContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    incomeExpenseItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    incomeExpenseIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    incomeExpenseLabel: {
        fontSize: 14,
        color: '#6c757d',
    },
    incomeExpenseValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#343a40',
    },
    seeAllText: {
        color: '#6C63FF',
        fontSize: 14,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    quickActionButton: {
        alignItems: 'center',
        width: '30%',
    },
    quickActionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionText: {
        fontSize: 12,
        textAlign: 'center',
        color: '#343a40',
    },
    transactionsContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 16,
        color: '#343a40',
        marginBottom: 3,
    },
    transactionDate: {
        fontSize: 12,
        color: '#6c757d',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '600',
    },
    noTransactions: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    noTransactionsText: {
        color: '#6c757d',
    },
    profileButton: {
        marginRight: 15,
    },
    profileInitials: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#6C63FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInitialsText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    menuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-start',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        alignItems: 'flex-end',
    },
    menuContainer: {
        width: '70%',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginRight: 10,
        paddingVertical: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
    },
    menuProfileInitials: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#6C63FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuProfileInitialsText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    menuProfileInfo: {
        flex: 1,
    },
    menuProfileName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#343a40',
    },
    menuProfileEmail: {
        fontSize: 14,
        color: '#6c757d',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    menuItemText: {
        fontSize: 16,
        color: '#343a40',
        marginLeft: 15,
    },
});

export default HomeScreen;