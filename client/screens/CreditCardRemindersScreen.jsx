import React, { useEffect, useState, useMemo } from "react";
import {
  View, Text, ActivityIndicator, Alert, TouchableOpacity,
  Modal, TextInput, FlatList, StyleSheet, SafeAreaView,
  StatusBar, KeyboardAvoidingView, Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';

const CreditCardRemindersScreen = ({ navigation }) => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [cardName, setCardName] = useState("");
    const [bankName, setBankName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [dueAmount, setDueAmount] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [date, setDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all"); // 'all', 'upcoming', 'overdue'

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            setRefreshing(true);
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch("http://192.168.31.167:8000/api/credit-card-reminders", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setCards(data.data);
            } else {
                Alert.alert("Error", data.message || "Failed to load credit cards.");
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            Alert.alert("Error", "Network request failed.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filteredCards = useMemo(() => {
        return cards.filter(card => {
            const matchesSearch = card.card_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                               card.bank_name.toLowerCase().includes(searchQuery.toLowerCase());
            
            const today = new Date();
            const due = new Date(card.due_date);
            const isOverdue = due < today;
            const isUpcoming = due >= today;
            
            if (filter === "upcoming") return matchesSearch && isUpcoming;
            if (filter === "overdue") return matchesSearch && isOverdue;
            return matchesSearch;
        });
    }, [cards, searchQuery, filter]);

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setDueDate(formattedDate);
        }
    };

    const validateInputs = () => {
        if (!cardName.trim()) {
            Alert.alert("Error", "Card name is required.");
            return false;
        }
        if (!bankName.trim()) {
            Alert.alert("Error", "Bank name is required.");
            return false;
        }
        if (!dueAmount || isNaN(dueAmount) || Number(dueAmount) <= 0) {
            Alert.alert("Error", "Enter a valid due amount.");
            return false;
        }
        if (!dueDate) {
            Alert.alert("Error", "Due date is required.");
            return false;
        }
        return true;
    };

    const addCard = async () => {
        if (!validateInputs()) return;

        try {
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch("http://192.168.31.167:8000/api/credit-card-reminders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    card_name: cardName,
                    bank_name: bankName,
                    card_number: cardNumber,
                    due_amount: Number(dueAmount),
                    due_date: dueDate,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setCards([...cards, data.data]);
                clearForm();
                setModalVisible(false);
                Alert.alert("Success", "Credit card added successfully!");
            } else {
                Alert.alert("Error", data.message || "Failed to add credit card.");
            }
        } catch (error) {
            console.error("Add Card Error:", error);
            Alert.alert("Error", "Could not add credit card.");
        }
    };

    const updateCard = async () => {
        if (!validateInputs()) return;

        try {
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch(`http://192.168.31.167:8000/api/credit-card-reminders/${selectedCard.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    card_name: cardName,
                    bank_name: bankName,
                    card_number: cardNumber,
                    due_amount: Number(dueAmount),
                    due_date: dueDate,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setCards(cards.map(card => card.id === selectedCard.id ? data.data : card));
                clearForm();
                setModalVisible(false);
                setEditMode(false);
                Alert.alert("Success", "Credit card updated successfully!");
            } else {
                Alert.alert("Error", data.message || "Failed to update credit card.");
            }
        } catch (error) {
            console.error("Update Card Error:", error);
            Alert.alert("Error", "Could not update credit card.");
        }
    };

    const deleteCard = async (cardId) => {
        Alert.alert(
            "Delete Credit Card",
            "Are you sure you want to delete this credit card reminder?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("authToken");
                            const response = await fetch(`http://192.168.31.167:8000/api/credit-card-reminders/${cardId}`, {
                                method: "DELETE",
                                headers: {
                                    "Authorization": `Bearer ${token}`,
                                },
                            });

                            if (response.ok) {
                                setCards(cards.filter(card => card.id !== cardId));
                                Alert.alert("Success", "Credit card deleted successfully!");
                            } else {
                                Alert.alert("Error", "Failed to delete credit card.");
                            }
                        } catch (error) {
                            console.error("Delete Card Error:", error);
                            Alert.alert("Error", "Could not delete credit card.");
                        }
                    }
                }
            ]
        );
    };

    const clearForm = () => {
        setCardName("");
        setBankName("");
        setCardNumber("");
        setDueAmount("");
        setDueDate("");
        setDate(new Date());
    };

    const openEditModal = (card) => {
        setSelectedCard(card);
        setCardName(card.card_name);
        setBankName(card.bank_name);
        setCardNumber(card.card_number);
        setDueAmount(card.due_amount.toString());
        setDueDate(card.due_date);
        setDate(new Date(card.due_date));
        setEditMode(true);
        setModalVisible(true);
    };

    const openViewModal = (card) => {
        setSelectedCard(card);
        setViewModalVisible(true);
    };

    const getCardStatus = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const timeDiff = due.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysDiff < 0) return { status: "Overdue", color: "#FF5252" };
        if (daysDiff <= 7) return { status: `Due in ${daysDiff} day${daysDiff !== 1 ? 's' : ''}`, color: "#FFC107" };
        return { status: `Due on ${due.toDateString()}`, color: "#4CAF50" };
    };

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
            
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Credit Cards</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        setEditMode(false);
                        clearForm();
                        setModalVisible(true);
                    }}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search cards..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
                {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Filter Buttons */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filter === "all" && styles.activeFilter]}
                    onPress={() => setFilter("all")}
                >
                    <Text style={[styles.filterText, filter === "all" && styles.activeFilterText]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === "upcoming" && styles.activeFilter]}
                    onPress={() => setFilter("upcoming")}
                >
                    <Text style={[styles.filterText, filter === "upcoming" && styles.activeFilterText]}>Upcoming</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === "overdue" && styles.activeFilter]}
                    onPress={() => setFilter("overdue")}
                >
                    <Text style={[styles.filterText, filter === "overdue" && styles.activeFilterText]}>Overdue</Text>
                </TouchableOpacity>
            </View>

            {/* Cards List */}
            {filteredCards.length > 0 ? (
                <FlatList
                    data={filteredCards}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => {
                        const status = getCardStatus(item.due_date);
                        return (
                            <TouchableOpacity 
                                style={styles.card}
                                onPress={() => openViewModal(item)}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardIcon}>
                                        <MaterialIcons name="credit-card" size={24} color="#6C63FF" />
                                    </View>
                                    <View style={styles.cardTitle}>
                                        <Text style={styles.cardName}>{item.card_name}</Text>
                                        <Text style={styles.cardBank}>{item.bank_name}</Text>
                                    </View>
                                    <View style={styles.cardActions}>
                                        <TouchableOpacity 
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                openEditModal(item);
                                            }}
                                            style={styles.actionButton}
                                        >
                                            <Feather name="edit" size={18} color="#6C63FF" />
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                deleteCard(item.id);
                                            }}
                                            style={styles.actionButton}
                                        >
                                            <Feather name="trash-2" size={18} color="#ff4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                
                                <View style={styles.cardDetails}>
                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailLabel}>Card Number</Text>
                                        <Text style={styles.detailValue}>{item.card_number}</Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailLabel}>Due Amount</Text>
                                        <Text style={styles.detailValue}>₹{item.due_amount.toLocaleString()}</Text>
                                    </View>
                                </View>
                                
                                <View style={[styles.cardStatus, { backgroundColor: `${status.color}20` }]}>
                                    <Text style={[styles.statusText, { color: status.color }]}>
                                        {status.status}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                    refreshing={refreshing}
                    onRefresh={fetchCards}
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="card-outline" size={50} color="#6C63FF" />
                    <Text style={styles.emptyText}>No credit cards found</Text>
                    <Text style={styles.emptySubtext}>
                        {searchQuery ? "Try a different search" : "Add a credit card to get started"}
                    </Text>
                </View>
            )}

            {/* Add/Edit Card Modal */}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => {
                    setModalVisible(false);
                    clearForm();
                }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalContainer}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => {
                            setModalVisible(false);
                            clearForm();
                        }}
                    />
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editMode ? "Edit Credit Card" : "Add Credit Card"}
                        </Text>
                        
                        <Text style={styles.inputLabel}>Card Name *</Text>
                        <TextInput
                            placeholder="e.g., HDFC Regalia"
                            placeholderTextColor="#999"
                            value={cardName}
                            onChangeText={setCardName}
                            style={styles.modalInput}
                            autoFocus
                        />

                        <Text style={styles.inputLabel}>Bank Name *</Text>
                        <TextInput
                            placeholder="e.g., HDFC Bank"
                            placeholderTextColor="#999"
                            value={bankName}
                            onChangeText={setBankName}
                            style={styles.modalInput}
                        />

                        <Text style={styles.inputLabel}>Card Number</Text>
                        <TextInput
                            placeholder="XXXX-XXXX-XXXX-1234"
                            placeholderTextColor="#999"
                            value={cardNumber}
                            onChangeText={setCardNumber}
                            style={styles.modalInput}
                            keyboardType="numeric"
                            maxLength={19}
                        />

                        <Text style={styles.inputLabel}>Due Amount *</Text>
                        <TextInput
                            placeholder="0.00"
                            placeholderTextColor="#999"
                            value={dueAmount}
                            onChangeText={setDueAmount}
                            style={styles.modalInput}
                            keyboardType="numeric"
                        />

                        <Text style={styles.inputLabel}>Due Date *</Text>
                        <TouchableOpacity
                            style={[styles.modalInput, styles.dateInput]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={dueDate ? {} : { color: '#999' }}>
                                {dueDate || "Select due date"}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                            />
                        )}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setModalVisible(false);
                                    clearForm();
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.submitButton]}
                                onPress={editMode ? updateCard : addCard}
                            >
                                <Text style={styles.submitButtonText}>
                                    {editMode ? "Update" : "Add"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* View Card Modal */}
            <Modal
                transparent={true}
                visible={viewModalVisible}
                animationType="fade"
                onRequestClose={() => setViewModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setViewModalVisible(false)}
                    />
                    {selectedCard && (
                        <View style={styles.viewModalContent}>
                            <View style={styles.viewModalHeader}>
                                <MaterialIcons name="credit-card" size={30} color="#6C63FF" />
                                <Text style={styles.viewModalTitle}>{selectedCard.card_name}</Text>
                            </View>
                            
                            <View style={styles.viewModalSection}>
                                <Text style={styles.viewModalLabel}>Bank</Text>
                                <Text style={styles.viewModalValue}>{selectedCard.bank_name}</Text>
                            </View>
                            
                            <View style={styles.viewModalSection}>
                                <Text style={styles.viewModalLabel}>Card Number</Text>
                                <Text style={styles.viewModalValue}>{selectedCard.card_number}</Text>
                            </View>
                            
                            <View style={styles.viewModalSection}>
                                <Text style={styles.viewModalLabel}>Due Amount</Text>
                                <Text style={styles.viewModalValue}>₹{selectedCard.due_amount.toLocaleString()}</Text>
                            </View>
                            
                            <View style={styles.viewModalSection}>
                                <Text style={styles.viewModalLabel}>Due Date</Text>
                                <Text style={styles.viewModalValue}>
                                    {new Date(selectedCard.due_date).toDateString()}
                                </Text>
                                <View style={[styles.statusBadge, { 
                                    backgroundColor: `${getCardStatus(selectedCard.due_date).color}20` 
                                }]}>
                                    <Text style={{ 
                                        color: getCardStatus(selectedCard.due_date).color,
                                        fontWeight: '600'
                                    }}>
                                        {getCardStatus(selectedCard.due_date).status}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.viewModalClose}
                                onPress={() => setViewModalVisible(false)}
                            >
                                <Text style={styles.viewModalCloseText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        paddingBottom: 10,
        backgroundColor: "#fff",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    addButton: {
        backgroundColor: "#6C63FF",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginHorizontal: 20,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: "#333",
    },
    filterContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    activeFilter: {
        backgroundColor: "#6C63FF",
        borderColor: "#6C63FF",
    },
    filterText: {
        fontSize: 14,
        color: "#666",
    },
    activeFilterText: {
        color: "#fff",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    cardIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#6C63FF20",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    cardTitle: {
        flex: 1,
    },
    cardName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    cardBank: {
        fontSize: 14,
        color: "#666",
    },
    cardActions: {
        flexDirection: "row",
    },
    actionButton: {
        marginLeft: 15,
        padding: 5,
    },
    cardDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: "#999",
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        color: "#333",
    },
    cardStatus: {
        padding: 8,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        color: "#333",
        marginTop: 15,
        textAlign: "center",
    },
    emptySubtext: {
        fontSize: 14,
        color: "#666",
        marginTop: 5,
        textAlign: "center",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 25,
        paddingBottom: 30,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 20,
        textAlign: "center",
    },
    inputLabel: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
        marginTop: 15,
    },
    modalInput: {
        backgroundColor: "#f8f9fa",
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        color: "#333",
        borderWidth: 1,
        borderColor: "#eee",
    },
    dateInput: {
        justifyContent: 'center',
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 25,
    },
    modalButton: {
        flex: 1,
        borderRadius: 10,
        padding: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#f8f9fa",
        marginRight: 10,
    },
    cancelButtonText: {
        color: "#333",
        fontSize: 16,
        fontWeight: "600",
    },
    submitButton: {
        backgroundColor: "#6C63FF",
        marginLeft: 10,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    viewModalContent: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 25,
        width: '90%',
        alignSelf: 'center',
    },
    viewModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    viewModalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 15,
        color: '#333',
    },
    viewModalSection: {
        marginBottom: 20,
    },
    viewModalLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    viewModalValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    statusBadge: {
        padding: 8,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginTop: 10,
    },
    viewModalClose: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#6C63FF',
        borderRadius: 10,
        alignItems: 'center',
    },
    viewModalCloseText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CreditCardRemindersScreen;