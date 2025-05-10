import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function TransactionTypeSelector({ selectedType, onSelect }) {
    return (
        <View style={styles.checkboxContainer}>
            {/* Income Checkbox */}
            <TouchableOpacity
                style={[styles.checkbox, selectedType === "income" && styles.selectedCheckbox]}
                onPress={() => onSelect("income")}
            >
                <Text style={[styles.checkboxText, selectedType === "income" && styles.selectedCheckboxText]}>Income</Text>
            </TouchableOpacity>

            {/* Expense Checkbox */}
            <TouchableOpacity
                style={[styles.checkbox, selectedType === "expense" && styles.selectedCheckbox]}
                onPress={() => onSelect("expense")}
            >
                <Text style={[styles.checkboxText, selectedType === "expense" && styles.selectedCheckboxText]}>Expense</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    checkboxContainer: {
        flexDirection: "row",
        width: "103%",
        // justifyContent: "space-between",
        marginVertical: 10,
    },
    checkbox: {
        flex: 1,
        padding: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        marginHorizontal: 5,
        elevation: 3, // Same as item styling
    },
    selectedCheckbox: {
        backgroundColor: "#007bff", // Same as addButton color
        borderColor: "#007bff",
    },
    checkboxText: {
        fontSize: 16,
        color: "gray",
        fontWeight: "bold",
    },
    selectedCheckboxText: {
        color: "#fff",
    },
});
