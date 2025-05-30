import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import { BASE_URL } from "../config";

const CategoryScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${BASE_URL}/category`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setCategories(data.data);
      } else {
        Alert.alert("Error", data.message || "Failed to load categories.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Error", "Network request failed.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addCategory = async () => {
    if (!categoryName.trim()) {
      setNameError("Category name is required.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${BASE_URL}/category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          name: categoryName, 
          description: categoryDescription 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setCategories([...categories, data.data]);
        resetForm();
        setModalVisible(false);
        Alert.alert("Success", "Category added successfully!");
      } else {
        Alert.alert("Error", data.message || "Failed to add category.");
      }
    } catch (error) {
      console.error("Add Category Error:", error);
      Alert.alert("Error", "Could not add category.");
    }
  };

  const updateCategory = async () => {
    if (!categoryName.trim()) {
      setNameError("Category name is required.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(
        `${BASE_URL}/category/${selectedCategory.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            name: categoryName, 
            description: categoryDescription 
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setCategories(
          categories.map((cat) =>
            cat.id === selectedCategory.id ? data.data : cat
          )
        );
        resetForm();
        setModalVisible(false);
        setEditMode(false);
        Alert.alert("Success", "Category updated successfully!");
      } else {
        Alert.alert("Error", data.message || "Failed to update category.");
      }
    } catch (error) {
      console.error("Update Category Error:", error);
      Alert.alert("Error", "Could not update category.");
    }
  };

  const resetForm = () => {
    setCategoryName("");
    setCategoryDescription("");
    setNameError("");
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setEditMode(true);
    setModalVisible(true);
  };

  const deleteCategory = async (categoryId) => {
    Alert.alert(
      "Delete Category",
      "Are you sure you want to delete this category?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("authToken");
              const response = await fetch(
                `${BASE_URL}/category/${categoryId}`,
                {
                  method: "DELETE",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                  },
                }
              );

              if (response.ok) {
                setCategories(categories.filter((cat) => cat.id !== categoryId));
                Alert.alert("Success", "Category deleted successfully!");
              } else {
                Alert.alert("Error", "Failed to delete category.");
              }
            } catch (error) {
              console.error("Delete Category Error:", error);
              Alert.alert("Error", "Could not delete category.");
            }
          },
        },
      ]
    );
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
        <Text style={styles.headerTitle}>Categories</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditMode(false);
            resetForm();
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
          placeholder="Search categories..."
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

      {/* Categories List */}
      {filteredCategories.length > 0 ? (
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.categoryCard}>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryIcon, { backgroundColor: '#6C63FF20' }]}>
                  <MaterialIcons name="category" size={24} color="#6C63FF" />
                </View>
                <View style={styles.categoryText}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.categoryDescription}>{item.description}</Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.categoryActions}>
                <TouchableOpacity 
                  onPress={() => openEditModal(item)}
                  style={styles.actionButton}
                >
                  <Feather name="edit" size={20} color="#6C63FF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => deleteCategory(item.id)}
                  style={styles.actionButton}
                >
                  <Feather name="trash-2" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No categories found</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open" size={50} color="#6C63FF" />
          <Text style={styles.emptyText}>No categories available</Text>
          <Text style={styles.emptySubtext}>Add a new category to get started</Text>
        </View>
      )}

      {/* Add/Edit Category Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editMode ? "Edit Category" : "Add New Category"}
            </Text>
            
            <Text style={styles.inputLabel}>Category Name *</Text>
            <TextInput
              placeholder="Enter category name"
              placeholderTextColor="#999"
              value={categoryName}
              onChangeText={(text) => {
                setCategoryName(text);
                if (text.trim()) setNameError("");
              }}
              style={[
                styles.modalInput,
                nameError ? styles.inputError : null,
              ]}
              autoFocus
            />
            {nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              placeholder="Enter description (optional)"
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={3}
              value={categoryDescription}
              onChangeText={setCategoryDescription}
              style={[styles.modalInput, styles.descriptionInput]}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={editMode ? updateCategory : addCategory}
              >
                <Text style={styles.submitButtonText}>
                  {editMode ? "Update" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    marginBottom: 15,
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categoryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  categoryText: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 3,
  },
  categoryDescription: {
    fontSize: 14,
    color: "#666",
  },
  categoryActions: {
    flexDirection: "row",
  },
  actionButton: {
    marginLeft: 15,
    padding: 5,
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
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#ff4444",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 14,
    marginTop: 5,
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
});

export default CategoryScreen;