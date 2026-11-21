import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  RefreshControl,
  Alert,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

export default function ProductsScreen() {

  // Product list and loading states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Search and category
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Add and edit form
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [maxQuantity, setMaxQuantity] = useState('');
  const [category, setCategory] = useState('Fruits');
  const [weight, setWeight] = useState('');
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);

  // Custom popup states
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');

  // Product categories
  const categories = [
    'All',
    'Fruits',
    'Vegetables',
    'Dairy',
    'Bakery',
    'Drinks',
  ];

  // Show success or error popup
  const showPopup = (title, message, type = 'success') => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupType(type);
    setPopupVisible(true);
  };

  // Close custom popup
  const closePopup = () => {
    setPopupVisible(false);
  };

  // Get products from backend
  const loadProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get('/fruits');

      setProducts(response.data.fruits || []);

    } catch (error) {
      console.log(
        'Loading Error:',
        error.response?.data || error.message
      );

      showPopup(
        'Loading Failed',
        'Unable to load products from the server.',
        'error'
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load products when screen opens
  useEffect(() => {
    loadProducts();
  }, []);

  // Inventory calculations
  const totalProducts = products.length;

  const inStock = products.filter(
    item => Number(item.quantity) > 5
  ).length;

  const lowStock = products.filter(
    item =>
      Number(item.quantity) > 0 &&
      Number(item.quantity) <= 5
  ).length;

  const outOfStock = products.filter(
    item => Number(item.quantity) <= 0
  ).length;

  // Search and category filter
  const filteredProducts = products.filter(item => {

    const matchesSearch = String(item.name || '')
      .toLowerCase()
      .includes(search.toLowerCase().trim());

    const matchesCategory =
      selectedCategory === 'All' ||
      item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Clear form fields
  const clearForm = () => {
    setName('');
    setPrice('');
    setQuantity('');
    setMaxQuantity('');
    setCategory('Fruits');
    setWeight('');
    setImage(null);
    setEditId(null);
  };

  // Open add product form
  const openAddForm = () => {
    clearForm();
    setModalVisible(true);
  };

  // Open edit product form
  const editProduct = product => {
    setEditId(product._id);
    setName(String(product.name || ''));
    setPrice(String(product.price ?? ''));
    setQuantity(String(product.quantity ?? ''));
    setMaxQuantity(String(product.maxQuantity ?? ''));
    setCategory(product.category || 'Fruits');
    setWeight(String(product.weight || ''));

    // Keep existing image if no new image is selected
    setImage(null);

    setModalVisible(true);
  };

  // Close add or edit form
  const closeForm = () => {
    setModalVisible(false);
    clearForm();
  };

  // Select image from phone gallery
  const chooseImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        showPopup(
          'Permission Required',
          'Please allow gallery access to select an image.',
          'error'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }

    } catch (error) {
      console.log('Image Error:', error.message);

      showPopup(
        'Image Error',
        'Unable to open the image gallery.',
        'error'
      );
    }
  };

  // Check form information before saving
  const validateForm = () => {

    if (
      !name.trim() ||
      !price.trim() ||
      !quantity.trim() ||
      !maxQuantity.trim() ||
      !category.trim() ||
      !weight.trim()
    ) {
      showPopup(
        'Missing Information',
        'Please complete all product details.',
        'error'
      );

      return false;
    }

    const productPrice = Number(price);
    const productQuantity = Number(quantity);
    const productMaxQuantity = Number(maxQuantity);

    if (
      !Number.isFinite(productPrice) ||
      !Number.isInteger(productQuantity) ||
      !Number.isInteger(productMaxQuantity) ||
      productPrice < 0 ||
      productQuantity < 0 ||
      productMaxQuantity <= 0
    ) {
      showPopup(
        'Invalid Information',
        'Enter a valid price and quantity.',
        'error'
      );

      return false;
    }

    // New products must have an image
    if (!editId && !image) {
      showPopup(
        'Image Required',
        'Please select a product image.',
        'error'
      );

      return false;
    }

    return true;
  };

  // Add a new product or update an existing product
  const saveProduct = async () => {

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      // FormData is used to send text and image together
      const formData = new FormData();

      formData.append('name', name.trim());
      formData.append('price', String(Number(price)));
      formData.append('quantity', String(Number(quantity)));
      formData.append('maxQuantity', String(Number(maxQuantity)));
      formData.append('category', category.trim());
      formData.append('weight', weight.trim());

      // Add image only when a new image is selected
      if (image) {
        formData.append('image', {
          uri: image.uri,
          name: image.fileName || 'product.jpg',
          type: image.mimeType || 'image/jpeg',
        });
      }

      const isEditing = Boolean(editId);

      // Update existing product
      if (isEditing) {
        await api.put(`/fruits/${editId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // Add new product
      else {
        await api.post('/fruits', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // Show success only after backend responds successfully
      closeForm();

      showPopup(
        isEditing ? 'Product Updated!' : 'Product Added!',
        isEditing
          ? 'Product details updated successfully.'
          : 'New product added successfully.',
        'success'
      );

      // Refresh product list
      loadProducts();

    } catch (error) {
      console.log(
        'Save Error:',
        error.response?.data || error.message
      );

      showPopup(
        'Save Failed',
        error.response?.data?.message ||
          'Unable to save the product. Please try again.',
        'error'
      );

    } finally {
      setSaving(false);
    }
  };

  // Delete product after confirmation
  const deleteProduct = id => {

    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',

          onPress: async () => {
            try {
              await api.delete(`/fruits/${id}`);

              showPopup(
                'Product Deleted!',
                'Product removed from your inventory.',
                'success'
              );

              loadProducts();

            } catch (error) {
              console.log(
                'Delete Error:',
                error.response?.data || error.message
              );

              showPopup(
                'Delete Failed',
                error.response?.data?.message ||
                  'Unable to delete this product.',
                'error'
              );
            }
          },
        },
      ]
    );
  };

  // Create full image URL for backend images
  const getImageUrl = imagePath => {

    if (!imagePath) {
      return null;
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    const baseURL = (api.defaults.baseURL || '')
      .replace(/\/api\/?$/, '');

    const fileName = imagePath
      .replace(/\\/g, '/')
      .split('/')
      .pop();

    return `${baseURL}/uploads/${fileName}`;
  };

  // Get product stock status
  const getStockStatus = value => {
    const stock = Number(value);

    if (stock <= 0) {
      return 'Out of Stock';
    }

    if (stock <= 5) {
      return 'Low Stock';
    }

    return 'Available';
  };

  // Get stock status color
  const getStockColor = value => {
    const stock = Number(value);

    if (stock <= 0) {
      return '#E15B5B';
    }

    if (stock <= 5) {
      return '#D69B35';
    }

    return '#26976B';
  };

  // Inventory summary card
  const InventoryCard = ({ label, value, color, icon }) => {
    return (
      <View style={styles.inventoryCard}>
        <View
          style={[
            styles.inventoryIcon,
            { backgroundColor: color + '20' },
          ]}
        >
          <Text style={styles.inventoryEmoji}>{icon}</Text>
        </View>

        <Text style={styles.inventoryLabel}>{label}</Text>

        <Text style={[styles.inventoryValue, { color }]}>
          {value}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProducts(true)}
            colors={['#25835B']}
          />
        }
      >

        {/* HEADER */}
        <View style={styles.header}>

          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerEyebrow}>
                CANDYAPP MARKET
              </Text>

              <Text style={styles.headerTitle}>
                Fresh Inventory.
              </Text>

              <Text style={styles.headerSubtitle}>
                Everything your store needs.
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Text style={styles.headerEmoji}>🥬</Text>
            </View>
          </View>

          <View style={styles.headerBottom}>
            <View>
              <Text style={styles.headerSmallText}>
                TOTAL CATALOGUE
              </Text>

              <Text style={styles.headerCount}>
                {totalProducts} Products
              </Text>
            </View>

            <Pressable
              style={styles.headerAddButton}
              onPress={openAddForm}
            >
              <Text style={styles.headerAddText}>
                + Add Product
              </Text>
            </Pressable>
          </View>
        </View>

        {/* STOCK OVERVIEW */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Stock Overview
          </Text>

          <Text style={styles.sectionSubtitle}>
            CURRENT INVENTORY
          </Text>
        </View>

        <View style={styles.inventoryGrid}>
          <InventoryCard
            label="Available"
            value={inStock}
            color="#26976B"
            icon="✓"
          />

          <InventoryCard
            label="Low Stock"
            value={lowStock}
            color="#D69B35"
            icon="!"
          />

          <InventoryCard
            label="Out of Stock"
            value={outOfStock}
            color="#E15B5B"
            icon="×"
          />
        </View>

        {/* PRODUCT LIST HEADER */}
        <View style={styles.catalogueHeader}>
          <Text style={styles.sectionTitle}>
            Market Shelf
          </Text>

          <Text style={styles.productCount}>
            {filteredProducts.length} Items
          </Text>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Find something fresh..."
            placeholderTextColor="#9AA69E"
            value={search}
            onChangeText={setSearch}
          />

          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Text style={styles.clearSearch}>×</Text>
            </Pressable>
          )}
        </View>

        {/* CATEGORY FILTER */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {categories.map(item => (
            <Pressable
              key={item}
              style={[
                styles.categoryButton,
                selectedCategory === item &&
                  styles.activeCategory,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item &&
                    styles.activeCategoryText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* PRODUCT LIST */}
        {loading ? (

          <View style={styles.loadingBox}>
            <ActivityIndicator
              size="large"
              color="#25835B"
            />

            <Text style={styles.loadingText}>
              Loading market products...
            </Text>
          </View>

        ) : filteredProducts.length === 0 ? (

          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🧺</Text>

            <Text style={styles.emptyTitle}>
              Nothing on this shelf
            </Text>

            <Text style={styles.emptyDescription}>
              Try another category or search for a different product.
            </Text>
          </View>

        ) : (

          filteredProducts.map(product => (
            <View
              key={product._id}
              style={styles.productCard}
            >

              {/* PRODUCT IMAGE */}
              <View style={styles.productImageContainer}>
                {getImageUrl(product.image) ? (
                  <Image
                    source={{ uri: getImageUrl(product.image) }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.placeholderEmoji}>
                      🍎
                    </Text>
                  </View>
                )}
              </View>

              {/* PRODUCT INFORMATION */}
              <View style={styles.productDetails}>
                <Text style={styles.productCategory}>
                  {product.category}
                </Text>

                <Text
                  style={styles.productName}
                  numberOfLines={2}
                >
                  {product.name}
                </Text>

                <Text style={styles.productPrice}>
                  ₹{product.price}
                  <Text style={styles.weightText}>
                    {' '}/ {product.weight}
                  </Text>
                </Text>

                <View style={styles.stockRow}>
                  <View
                    style={[
                      styles.stockDot,
                      {
                        backgroundColor:
                          getStockColor(product.quantity),
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.stockText,
                      {
                        color: getStockColor(product.quantity),
                      },
                    ]}
                  >
                    {getStockStatus(product.quantity)}
                  </Text>
                </View>

                <Text style={styles.stockQuantity}>
                  {product.quantity} units available
                </Text>

                {/* EDIT AND DELETE */}
                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.editButton}
                    onPress={() => editProduct(product)}
                  >
                    <Text style={styles.editButtonText}>
                      Edit
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => deleteProduct(product._id)}
                  >
                    <Text style={styles.deleteButtonText}>
                      Delete
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))
        )}

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>
            FRESHNESS MEETS MANAGEMENT
          </Text>

          <Text style={styles.footerSubtitle}>
            CandyApp Inventory System
          </Text>
        </View>

      </ScrollView>

      {/* ADD AND EDIT PRODUCT MODAL */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeForm}
      >
        <View style={styles.modalScreen}>
          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>
                  INVENTORY WORKSPACE
                </Text>

                <Text style={styles.modalTitle}>
                  {editId ? 'Edit Product' : 'New Product'}
                </Text>

                <Text style={styles.modalSubtitle}>
                  Add your product information below.
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={closeForm}
              >
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            {/* IMAGE PICKER */}
            <Pressable
              style={styles.imagePicker}
              onPress={chooseImage}
            >
              {image ? (
                <Image
                  source={{ uri: image.uri }}
                  style={styles.previewImage}
                />
              ) : (
                <View style={styles.imagePickerContent}>
                  <Text style={styles.imagePickerEmoji}>
                    📷
                  </Text>

                  <Text style={styles.imagePickerTitle}>
                    Choose Product Image
                  </Text>

                  <Text style={styles.imagePickerSubtitle}>
                    Select an image from your gallery
                  </Text>
                </View>
              )}
            </Pressable>

            {/* PRODUCT NAME */}
            <Text style={styles.inputLabel}>
              Product Name
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter product name"
              value={name}
              onChangeText={setName}
            />

            {/* PRICE */}
            <Text style={styles.inputLabel}>
              Price (₹)
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter product price"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />

            {/* AVAILABLE QUANTITY */}
            <Text style={styles.inputLabel}>
              Available Quantity
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter available stock"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />

            {/* MAXIMUM QUANTITY */}
            <Text style={styles.inputLabel}>
              Maximum Quantity
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter maximum order quantity"
              value={maxQuantity}
              onChangeText={setMaxQuantity}
              keyboardType="numeric"
            />

            {/* CATEGORY */}
            <Text style={styles.inputLabel}>
              Category
            </Text>

            <View style={styles.formCategoryContainer}>
              {categories.slice(1).map(item => (
                <Pressable
                  key={item}
                  style={[
                    styles.formCategoryButton,
                    category === item &&
                      styles.formCategoryActive,
                  ]}
                  onPress={() => setCategory(item)}
                >
                  <Text
                    style={[
                      styles.formCategoryText,
                      category === item &&
                        styles.formCategoryActiveText,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* WEIGHT */}
            <Text style={styles.inputLabel}>
              Product Weight
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Example: 1 kg, 500 g"
              value={weight}
              onChangeText={setWeight}
            />

            {/* SAVE BUTTON */}
            <Pressable
              style={[
                styles.saveButton,
                saving && styles.disabledButton,
              ]}
              onPress={saveProduct}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {editId ? 'Update Product' : 'Add to Inventory'}
                </Text>
              )}
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={closeForm}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </Pressable>

          </ScrollView>
        </View>
      </Modal>

      {/* CUSTOM SUCCESS AND ERROR POPUP */}
      <Modal
        visible={popupVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closePopup}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupCard}>

            <View
              style={[
                styles.popupIconCircle,
                popupType === 'success'
                  ? styles.popupSuccessCircle
                  : styles.popupErrorCircle,
              ]}
            >
              <Text style={styles.popupIcon}>
                {popupType === 'success' ? '✓' : '!'}
              </Text>
            </View>

            <Text style={styles.popupTitle}>
              {popupTitle}
            </Text>

            <Text style={styles.popupMessage}>
              {popupMessage}
            </Text>

            <Pressable
              style={[
                styles.popupButton,
                popupType === 'error' &&
                  styles.popupErrorButton,
              ]}
              onPress={closePopup}
            >
              <Text style={styles.popupButtonText}>
                Continue
              </Text>
            </Pressable>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: '#F5F5EC',
  },

  container: {
    padding: 18,
    paddingTop: 28,
    paddingBottom: 90,
  },

  // Header
  header: {
    backgroundColor: '#163D2B',
    borderRadius: 23,
    padding: 21,
    marginBottom: 27,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerEyebrow: {
    color: '#9DD9B5',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
    marginTop: 10,
  },

  headerSubtitle: {
    color: '#B9D1C1',
    fontSize: 12,
    marginTop: 6,
  },

  headerIcon: {
    width: 58,
    height: 58,
    backgroundColor: '#28563D',
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerEmoji: {
    fontSize: 29,
  },

  headerBottom: {
    borderTopWidth: 1,
    borderTopColor: '#41634C',
    marginTop: 23,
    paddingTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerSmallText: {
    color: '#9FC1A9',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  headerCount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 5,
  },

  headerAddButton: {
    backgroundColor: '#B8E4C7',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 11,
  },

  headerAddText: {
    color: '#163D2B',
    fontSize: 11,
    fontWeight: '900',
  },

  // Section headings
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#20382A',
  },

  sectionSubtitle: {
    fontSize: 9,
    color: '#829188',
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Inventory cards
  inventoryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },

  inventoryCard: {
    width: '31.5%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
  },

  inventoryIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },

  inventoryEmoji: {
    fontSize: 17,
    fontWeight: '900',
    color: '#20382A',
  },

  inventoryLabel: {
    color: '#89968D',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 12,
  },

  inventoryValue: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 5,
  },

  // Search and catalogue
  catalogueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  productCount: {
    color: '#829188',
    fontSize: 11,
    fontWeight: '700',
  },

  searchBox: {
    backgroundColor: '#FFFFFF',
    height: 51,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E8EDE7',
  },

  searchIcon: {
    color: '#25835B',
    fontSize: 25,
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    color: '#20382A',
    fontSize: 13,
  },

  clearSearch: {
    color: '#829188',
    fontSize: 24,
  },

  // Category filters
  categoryScroll: {
    marginBottom: 20,
  },

  categoryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E6EBE5',
  },

  activeCategory: {
    backgroundColor: '#163D2B',
    borderColor: '#163D2B',
  },

  categoryText: {
    color: '#69786E',
    fontSize: 11,
    fontWeight: '800',
  },

  activeCategoryText: {
    color: '#FFFFFF',
  },

  // Product cards
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#EDF0E9',
  },

  productImageContainer: {
    width: 116,
    height: 145,
    borderRadius: 13,
    overflow: 'hidden',
    backgroundColor: '#EEF2EA',
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderEmoji: {
    fontSize: 35,
  },

  productDetails: {
    flex: 1,
    marginLeft: 13,
    justifyContent: 'center',
  },

  productCategory: {
    color: '#25835B',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  productName: {
    color: '#20382A',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 5,
  },

  productPrice: {
    color: '#25835B',
    fontSize: 19,
    fontWeight: '900',
    marginTop: 7,
  },

  weightText: {
    color: '#89968D',
    fontSize: 10,
    fontWeight: '600',
  },

  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
  },

  stockDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    marginRight: 6,
  },

  stockText: {
    fontSize: 10,
    fontWeight: '900',
  },

  stockQuantity: {
    color: '#89968D',
    fontSize: 10,
    marginTop: 4,
  },

  // Product buttons
  actionRow: {
    flexDirection: 'row',
    marginTop: 11,
  },

  editButton: {
    backgroundColor: '#E5F3E9',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 7,
  },

  editButtonText: {
    color: '#25835B',
    fontSize: 10,
    fontWeight: '900',
  },

  deleteButton: {
    backgroundColor: '#FCEAEA',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 8,
  },

  deleteButtonText: {
    color: '#D94D4D',
    fontSize: 10,
    fontWeight: '900',
  },

  // Loading and empty states
  loadingBox: {
    padding: 40,
    alignItems: 'center',
  },

  loadingText: {
    color: '#829188',
    fontSize: 12,
    marginTop: 12,
  },

  emptyBox: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 18,
    alignItems: 'center',
  },

  emptyEmoji: {
    fontSize: 38,
  },

  emptyTitle: {
    color: '#20382A',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 12,
  },

  emptyDescription: {
    color: '#89968D',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 18,
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 25,
  },

  footerTitle: {
    color: '#25835B',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  footerSubtitle: {
    color: '#9AA69E',
    fontSize: 10,
    marginTop: 5,
  },

  // Add and edit modal
  modalScreen: {
    flex: 1,
    backgroundColor: '#F5F5EC',
  },

  modalContent: {
    padding: 22,
    paddingTop: 35,
    paddingBottom: 45,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },

  modalEyebrow: {
    color: '#25835B',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  modalTitle: {
    color: '#163D2B',
    fontSize: 27,
    fontWeight: '900',
    marginTop: 6,
  },

  modalSubtitle: {
    color: '#89968D',
    fontSize: 11,
    marginTop: 5,
  },

  closeButton: {
    width: 40,
    height: 40,
    backgroundColor: '#E7EDE5',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeText: {
    fontSize: 24,
    color: '#20382A',
  },

  // Image picker
  imagePicker: {
    backgroundColor: '#E6F1E7',
    borderRadius: 17,
    height: 155,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CFE3D3',
    borderStyle: 'dashed',
  },

  imagePickerContent: {
    alignItems: 'center',
  },

  imagePickerEmoji: {
    fontSize: 29,
  },

  imagePickerTitle: {
    color: '#25835B',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 8,
  },

  imagePickerSubtitle: {
    color: '#829188',
    fontSize: 10,
    marginTop: 5,
  },

  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // Form inputs
  inputLabel: {
    color: '#344C3C',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EAE2',
    borderRadius: 12,
    padding: 14,
    color: '#20382A',
    fontSize: 13,
    marginBottom: 18,
  },

  // Form categories
  formCategoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 17,
  },

  formCategoryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EAE2',
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 7,
    marginBottom: 8,
  },

  formCategoryActive: {
    backgroundColor: '#163D2B',
    borderColor: '#163D2B',
  },

  formCategoryText: {
    color: '#69786E',
    fontSize: 10,
    fontWeight: '800',
  },

  formCategoryActiveText: {
    color: '#FFFFFF',
  },

  // Save and cancel buttons
  saveButton: {
    backgroundColor: '#163D2B',
    padding: 16,
    borderRadius: 13,
    alignItems: 'center',
    marginTop: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  cancelButton: {
    padding: 15,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#69786E',
    fontSize: 12,
    fontWeight: '800',
  },

  // Custom popup
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  popupCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
  },

  popupIconCircle: {
    width: 75,
    height: 75,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  popupSuccessCircle: {
    backgroundColor: '#E2F5E8',
  },

  popupErrorCircle: {
    backgroundColor: '#FCE8E8',
  },

  popupIcon: {
    fontSize: 38,
    fontWeight: '900',
    color: '#163D2B',
  },

  popupTitle: {
    color: '#163D2B',
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
  },

  popupMessage: {
    color: '#7C8A80',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 22,
  },

  popupButton: {
    width: '100%',
    backgroundColor: '#163D2B',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  popupErrorButton: {
    backgroundColor: '#C94D4D',
  },

  popupButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

});