import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    TextInput
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

// API Base URL (replace with your actual URL or config)
const BASE_URL = 'http://192.168.31.167:8000/api';

const ReportScreen = () => {
    const [filter, setFilter] = useState("monthly");
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    // Custom date range states
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    
    // Amount and type filter states
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");
    const [filterType, setFilterType] = useState("");

    // A list of available filters for the UI
    const filters = [
        { key: 'daily', label: 'Daily' },
        { key: 'weekly', label: 'Weekly' },
        { key: 'monthly', label: 'Monthly' },
        { key: 'yearly', label: 'Yearly' },
        { key: 'custom', label: 'Custom' },
    ];

    // Fetch report data
    const fetchReport = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("authToken");
            if (!token) {
                Alert.alert("Error", "Authentication token not found.");
                return;
            }

            // Build URL with all filter parameters
            let url = `${BASE_URL}/reports?filter=${filter}`;
            
            if (filter === "custom") {
                const formattedStartDate = startDate.toISOString().split("T")[0];
                const formattedEndDate = endDate.toISOString().split("T")[0];
                url += `&start_date=${formattedStartDate}&end_date=${formattedEndDate}`;
            }

            if (minAmount) url += `&amount_gt=${minAmount}`;
            if (maxAmount) url += `&amount_lt=${maxAmount}`;
            if (filterType) url += `&type=${filterType}`;

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (!data.status) {
                Alert.alert("Error", data.message || "Failed to load report.");
                setReport(null);
                return;
            }

            setReport(data.data);
        } catch (error) {
            console.error("Report fetch error:", error);
            Alert.alert("Error", "Could not fetch report. Check your network connection.");
            setReport(null);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch report when component mounts or filter changes (except for custom)
    useEffect(() => {
        if (filter !== "custom") {
            fetchReport();
        }
    }, [filter]);

    // Handle date selection from pickers
    const onDateChange = (event, selectedDate, type) => {
        if (type === 'start') {
            setShowStartPicker(false);
            if (selectedDate) setStartDate(selectedDate);
        } else {
            setShowEndPicker(false);
            if (selectedDate) setEndDate(selectedDate);
        }
    };

    // Transaction row component
    const renderTransaction = ({ item }) => (
        <View style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
                <Ionicons
                    name={item.type === 'income' ? 'arrow-down' : 'arrow-up'}
                    size={20}
                    color={item.type === 'income' ? '#28a745' : '#dc3545'}
                />
            </View>
            <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>{item.name}</Text>
                <Text style={styles.transactionDate}>
                    {new Date(item.transaction_date).toLocaleDateString()}
                </Text>
            </View>
            <Text
                style={[
                    styles.transactionAmount,
                    { color: item.type === 'income' ? '#28a745' : '#dc3545' }
                ]}
            >
                {item.type === 'income' ? '+' : '-'}₹{parseFloat(item.amount).toLocaleString('en-IN')}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
            <ScrollView contentContainerStyle={styles.scrollContainer}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Financial Report</Text>
                </View>
                
                {/* Filter Buttons */}
                <View style={styles.filterContainer}>
                    {filters.map((f) => (
                        <TouchableOpacity
                            key={f.key}
                            style={[
                                styles.filterButton,
                                filter === f.key && styles.activeFilterButton,
                            ]}
                            onPress={() => setFilter(f.key)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    filter === f.key && styles.activeFilterText,
                                ]}
                            >
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Custom Filters Section */}
                {filter === "custom" && (
                    <View style={styles.customFilterCard}>
                        <Text style={styles.sectionTitle}>Custom Date Range</Text>
                        <View style={styles.customDateButtons}>
                            <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
                                <Text style={styles.dateButtonText}>
                                    Start: {startDate.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
                                <Text style={styles.dateButtonText}>
                                    End: {endDate.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {showStartPicker && (
                            <DateTimePicker
                                value={startDate}
                                mode="date"
                                display="default"
                                onChange={(e, date) => onDateChange(e, date, 'start')}
                            />
                        )}
                        {showEndPicker && (
                            <DateTimePicker
                                value={endDate}
                                mode="date"
                                display="default"
                                onChange={(e, date) => onDateChange(e, date, 'end')}
                            />
                        )}
                    </View>
                )}

                {/* Amount and Type Filters */}
                <View style={styles.filterCard}>
                    <Text style={styles.sectionTitle}>Additional Filters</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Minimum Amount"
                        keyboardType="numeric"
                        value={minAmount}
                        onChangeText={setMinAmount}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Maximum Amount"
                        keyboardType="numeric"
                        value={maxAmount}
                        onChangeText={setMaxAmount}
                    />
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={filterType}
                            onValueChange={(value) => setFilterType(value)}
                            style={styles.picker}
                            itemStyle={styles.pickerItem}
                        >
                            <Picker.Item label="All Types" value="" />
                            <Picker.Item label="Income" value="income" />
                            <Picker.Item label="Expense" value="expense" />
                        </Picker>
                    </View>
                    <TouchableOpacity style={styles.applyButton} onPress={fetchReport}>
                        <Text style={styles.applyButtonText}>Apply Filters</Text>
                    </TouchableOpacity>
                </View>

                {/* Loading and Report Display */}
                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#6C63FF" />
                        <Text style={styles.loadingText}>Generating report...</Text>
                    </View>
                ) : report ? (
                    <>
                        {/* Summary Card */}
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryHeader}>
                                <Ionicons name="analytics" size={24} color="#6C63FF" />
                                <Text style={styles.summaryTitle}>
                                    {filter.charAt(0).toUpperCase() + filter.slice(1)} Report
                                </Text>
                            </View>
                            <Text style={styles.reportDateRange}>
                                {report.start_date} to {report.end_date}
                            </Text>

                            <View style={styles.summaryStatsContainer}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Total Income</Text>
                                    <Text style={[styles.statValue, { color: '#28a745' }]}>
                                        ₹{parseFloat(report.total_income).toLocaleString('en-IN')}
                                    </Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Total Expense</Text>
                                    <Text style={[styles.statValue, { color: '#dc3545' }]}>
                                        ₹{parseFloat(report.total_expense).toLocaleString('en-IN')}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.netSavingsContainer}>
                                <Text style={styles.netSavingsLabel}>Net Savings</Text>
                                <Text style={styles.netSavingsValue}>
                                    ₹{parseFloat(report.net_savings).toLocaleString('en-IN')}
                                </Text>
                            </View>
                        </View>

                        {/* Transactions Section */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>All Transactions</Text>
                        </View>
                        
                        <View style={styles.transactionsContainer}>
                            <FlatList
                                data={report.transactions}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderTransaction}
                                scrollEnabled={false}
                                ListEmptyComponent={() => (
                                    <Text style={styles.emptyListText}>No transactions found for this filter.</Text>
                                )}
                            />
                        </View>
                    </>
                ) : (
                    <View style={styles.centerContainer}>
                        <Text style={styles.noDataText}>No report data available.</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={fetchReport}>
                            <Text style={styles.retryButtonText}>Refresh Report</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#343a40',
    },
    loadingText: {
        marginTop: 10,
        color: '#6c757d',
        fontSize: 16,
    },
    noDataText: {
        marginTop: 20,
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 20,
        paddingHorizontal: 25,
        paddingVertical: 12,
        backgroundColor: '#6C63FF',
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Filter Buttons
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        backgroundColor: '#e9ecef',
        borderRadius: 8,
        padding: 4,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeFilterButton: {
        backgroundColor: '#6C63FF',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6c757d',
    },
    activeFilterText: {
        color: '#fff',
    },
    // Custom & Additional Filter Cards
    customFilterCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    filterCard: {
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
    customDateButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    dateButton: {
        flex: 1,
        backgroundColor: '#f1f1f1',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    dateButtonText: {
        color: '#343a40',
        fontWeight: '500',
    },
    input: {
        height: 50,
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    pickerContainer: {
        borderColor: '#f1f1f1',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        backgroundColor: '#f1f1f1',
    },
    pickerItem: {
        fontSize: 16,
    },
    applyButton: {
        backgroundColor: '#6C63FF',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Summary Card
    summaryCard: {
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
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#343a40',
        marginLeft: 10,
    },
    reportDateRange: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 20,
    },
    summaryStatsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 14,
        color: '#6c757d',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
    },
    netSavingsContainer: {
        borderTopWidth: 1,
        borderTopColor: '#f1f1f1',
        paddingTop: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    netSavingsLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#343a40',
    },
    netSavingsValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6C63FF',
    },
    // Transactions Section
    sectionHeader: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
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
    emptyListText: {
        textAlign: 'center',
        color: '#6c757d',
        paddingVertical: 20,
    },
});

export default ReportScreen;