
import { useCallback, useState } from 'react';

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

// Available order statuses
const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

// Get color according to order status
const getStatusColor = (status) => {
  switch (status) {
    case 'Pending':
      return '#D98B19';
    case 'Confirmed':
      return '#3478D4';
    case 'Processing':
      return '#8755C7';
    case 'Shipped':
      return '#168C9A';
    case 'Delivered':
      return '#218653';
    case 'Cancelled':
      return '#D64C4C';
    default:
      return '#718078';
  }
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState('');

  // Status popup states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusPopupVisible, setStatusPopupVisible] = useState(false);

  // Result popup states
  const [resultPopupVisible, setResultPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState('success');
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');

  // Show success or error popup
  const showResultPopup = (type, title, message) => {
    setPopupType(type);
    setPopupTitle(title);
    setPopupMessage(message);
    setResultPopupVisible(true);
  };

  // Close result popup
  const closeResultPopup = () => {
    setResultPopupVisible(false);
  };

  // Load orders from backend
  const loadOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const response = await api.get('/orders/admin/all');

      const orderList = response.data?.orders;

      if (!Array.isArray(orderList)) {
        throw new Error('Invalid orders response from backend.');
      }

      setOrders(orderList);

    } catch (err) {
      console.log(
        'FETCH ORDERS ERROR:',
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        'Unable to load orders. Please check your connection.'
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load orders whenever this screen becomes active
  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  // Open status popup
  const openStatusPopup = (order) => {
    setSelectedOrder(order);
    setStatusPopupVisible(true);
  };

  // Close status popup
  const closeStatusPopup = () => {
    setStatusPopupVisible(false);
    setSelectedOrder(null);
  };

  // Update order status in backend
  const updateOrderStatus = async (newStatus) => {
    if (!selectedOrder) {
      return;
    }

    const orderId = selectedOrder._id || selectedOrder.id;

    if (!orderId) {
      showResultPopup(
        'error',
        'Order Error',
        'Order ID is missing.'
      );
      return;
    }

    const currentStatus = selectedOrder.orderStatus || 'Pending';

    if (newStatus === currentStatus) {
      closeStatusPopup();
      return;
    }

    try {
      setUpdatingId(orderId);

      const response = await api.put(
        `/orders/${orderId}/status`,
        {
          orderStatus: newStatus,
        }
      );

      const updatedOrder = response.data?.order;

      if (!updatedOrder) {
        throw new Error('Updated order was not returned by backend.');
      }

      // Update order in current screen
      setOrders(currentOrders =>
        currentOrders.map(order =>
          (order._id || order.id) === orderId
            ? updatedOrder
            : order
        )
      );

      closeStatusPopup();

      showResultPopup(
        'success',
        'Status Updated!',
        `Order status has been changed to ${newStatus}.`
      );

    } catch (err) {
      console.log(
        'UPDATE ORDER ERROR:',
        err.response?.data || err.message
      );

      showResultPopup(
        'error',
        'Update Failed',
        err.response?.data?.message ||
        err.message ||
        'Unable to update order status.'
      );

    } finally {
      setUpdatingId(null);
    }
  };

  // Calculate order summary
  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    order => order.orderStatus === 'Pending'
  ).length;

  const deliveredOrders = orders.filter(
    order => order.orderStatus === 'Delivered'
  ).length;

  const cancelledOrders = orders.filter(
    order => order.orderStatus === 'Cancelled'
  ).length;

  // Show loading screen
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#287A50" />

        <Text style={styles.loadingText}>
          Loading orders...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <View style={styles.header}>

          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerLabel}>
                CANDYAPP ADMIN
              </Text>

              <Text style={styles.headerTitle}>
                Order Center
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>
                O
              </Text>
            </View>
          </View>

          <Text style={styles.headerDescription}>
            Track customer orders and manage delivery
            progress from one place.
          </Text>

          <View style={styles.headerBottom}>
            <Text style={styles.headerBottomText}>
              ORDER MANAGEMENT
            </Text>

            <Text style={styles.headerBottomText}>
              {totalOrders} TOTAL
            </Text>
          </View>

        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>

          <Text style={styles.sectionTitle}>
            Order Overview
          </Text>

          <View style={styles.summaryGrid}>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {totalOrders}
              </Text>

              <Text style={styles.summaryLabel}>
                All Orders
              </Text>

              <View style={[styles.summaryLine, { backgroundColor: '#3478D4' }]} />
            </View>

            <View style={styles.summaryCard}>
              <Text style={[styles.summaryNumber, { color: '#D98B19' }]}>
                {pendingOrders}
              </Text>

              <Text style={styles.summaryLabel}>
                Pending
              </Text>

              <View style={[styles.summaryLine, { backgroundColor: '#D98B19' }]} />
            </View>

            <View style={styles.summaryCard}>
              <Text style={[styles.summaryNumber, { color: '#218653' }]}>
                {deliveredOrders}
              </Text>

              <Text style={styles.summaryLabel}>
                Delivered
              </Text>

              <View style={[styles.summaryLine, { backgroundColor: '#218653' }]} />
            </View>

            <View style={styles.summaryCard}>
              <Text style={[styles.summaryNumber, { color: '#D64C4C' }]}>
                {cancelledOrders}
              </Text>

              <Text style={styles.summaryLabel}>
                Cancelled
              </Text>

              <View style={[styles.summaryLine, { backgroundColor: '#D64C4C' }]} />
            </View>

          </View>
        </View>

        {/* Orders Heading */}
        <View style={styles.ordersHeading}>

          <View>
            <Text style={styles.sectionTitle}>
              Recent Orders
            </Text>

            <Text style={styles.sectionSubtitle}>
              View and update customer orders
            </Text>
          </View>

          <Pressable
            style={styles.refreshButton}
            onPress={() => loadOrders(true)}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.refreshText}>
                Refresh
              </Text>
            )}
          </Pressable>

        </View>

        {/* Error Message */}
        {error ? (

          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={() => loadOrders()}
            >
              <Text style={styles.retryText}>
                Try Again
              </Text>
            </Pressable>
          </View>

        ) : orders.length === 0 ? (

          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              No Orders Yet
            </Text>

            <Text style={styles.emptyDescription}>
              Customer orders will appear here when available.
            </Text>
          </View>

        ) : (

          orders.map(order => {
            const orderId = order._id || order.id;
            const currentStatus = order.orderStatus || 'Pending';

            return (
              <View key={orderId} style={styles.orderCard}>

                {/* Order Information */}
                <View style={styles.orderTop}>

                  <View>
                    <Text style={styles.orderSmallLabel}>
                      ORDER ID
                    </Text>

                    <Text style={styles.orderId}>
                      #{String(orderId).slice(-8)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getStatusColor(currentStatus) + '18',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: getStatusColor(currentStatus),
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color: getStatusColor(currentStatus),
                        },
                      ]}
                    >
                      {currentStatus}
                    </Text>
                  </View>

                </View>

                <View style={styles.cardDivider} />

                {/* Customer Information */}
                <Text style={styles.customerLabel}>
                  CUSTOMER
                </Text>

                <Text style={styles.customerEmail}>
                  {order.userEmail || 'Customer'}
                </Text>

                {/* Ordered Products */}
                <View style={styles.productsSection}>

                  <View style={styles.productsHeading}>
                    <Text style={styles.productsTitle}>
                      ORDERED PRODUCTS
                    </Text>

                    <Text style={styles.productsCount}>
                      {Array.isArray(order.items) ? order.items.length : 0} products
                    </Text>
                  </View>

                  {Array.isArray(order.items) && order.items.length > 0 ? (

                    order.items.map((item, index) => {
                      const productName =
                        item.name ||
                        item.productName ||
                        item.productname ||
                        'Product';

                      const quantity = Number(item.quantity || 1);
                      const price = Number(item.price || 0);

                      const itemTotal =
                        item.totalPrice ?? price * quantity;

                      return (
                        <View
                          key={item.productId || item._id || index}
                          style={styles.productRow}
                        >

                          <View style={styles.productInfo}>
                            <Text style={styles.productName}>
                              {productName}
                            </Text>

                            <Text style={styles.productMeta}>
                              {item.weight ? `${item.weight}  •  ` : ''}
                              Qty: {quantity}
                            </Text>
                          </View>

                          <View style={styles.productPriceInfo}>
                            <Text style={styles.productPrice}>
                              ₹{price}
                            </Text>

                            <Text style={styles.productTotal}>
                              ₹{itemTotal}
                            </Text>
                          </View>

                        </View>
                      );
                    })

                  ) : (

                    <Text style={styles.noProductsText}>
                      Product details are not available for this order.
                    </Text>

                  )}

                </View>

                {/* Order Details */}
                <View style={styles.detailsRow}>

                  <View style={styles.detailBox}>
                    <Text style={styles.detailLabel}>
                      ITEMS
                    </Text>

                    <Text style={styles.detailValue}>
                      {order.totalItems ?? 0}
                    </Text>
                  </View>

                  <View style={styles.detailBox}>
                    <Text style={styles.detailLabel}>
                      PAYMENT
                    </Text>

                    <Text style={styles.detailValue}>
                      {order.paymentMethod || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.detailBox}>
                    <Text style={styles.detailLabel}>
                      TOTAL
                    </Text>

                    <Text style={styles.priceValue}>
                      ₹{order.totalAmount ?? 0}
                    </Text>
                  </View>

                </View>

                {/* Manage Status Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.manageButton,
                    pressed && styles.buttonPressed,
                    updatingId === orderId && styles.disabledButton,
                  ]}
                  onPress={() => openStatusPopup(order)}
                  disabled={updatingId === orderId}
                >
                  <Text style={styles.manageButtonText}>
                    Manage Order Status →
                  </Text>
                </Pressable>

              </View>
            );
          })

        )}

      </ScrollView>

      {/* Status Selection Popup */}
      <Modal
        visible={statusPopupVisible}
        transparent
        animationType="slide"
        onRequestClose={closeStatusPopup}
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalCard}>

            <View style={styles.modalTop}>

              <View>
                <Text style={styles.modalSmallTitle}>
                  ORDER MANAGEMENT
                </Text>

                <Text style={styles.modalTitle}>
                  Update Status
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={closeStatusPopup}
                disabled={updatingId !== null}
              >
                <Text style={styles.closeButtonText}>
                  ×
                </Text>
              </Pressable>

            </View>

            <Text style={styles.modalDescription}>
              Select a new status for order #
              {String(selectedOrder?._id || selectedOrder?.id || '').slice(-8)}.
            </Text>

            <View style={styles.modalInfoBox}>

              <Text style={styles.modalInfoLabel}>
                CUSTOMER
              </Text>

              <Text style={styles.modalInfoValue}>
                {selectedOrder?.userEmail || 'Customer'}
              </Text>

              <View style={styles.modalInfoDivider} />

              <Text style={styles.modalInfoLabel}>
                CURRENT STATUS
              </Text>

              <Text
                style={[
                  styles.modalInfoStatus,
                  {
                    color: getStatusColor(
                      selectedOrder?.orderStatus || 'Pending'
                    ),
                  },
                ]}
              >
                {selectedOrder?.orderStatus || 'Pending'}
              </Text>

            </View>

            <ScrollView
              style={styles.statusScroll}
              showsVerticalScrollIndicator={false}
            >

              <View style={styles.modalStatusList}>

                {ORDER_STATUSES.map(status => {
                  const currentStatus =
                    selectedOrder?.orderStatus || 'Pending';

                  const isSelected = currentStatus === status;

                  return (
                    <Pressable
                      key={status}
                      style={[
                        styles.modalStatusButton,
                        isSelected && {
                          backgroundColor: getStatusColor(status) + '18',
                          borderColor: getStatusColor(status),
                        },
                      ]}
                      disabled={updatingId !== null}
                      onPress={() => updateOrderStatus(status)}
                    >

                      <View
                        style={[
                          styles.modalStatusDot,
                          {
                            backgroundColor: getStatusColor(status),
                          },
                        ]}
                      />

                      <Text
                        style={[
                          styles.modalStatusText,
                          isSelected && {
                            color: getStatusColor(status),
                            fontWeight: '800',
                          },
                        ]}
                      >
                        {status}
                      </Text>

                      <Text style={styles.selectStatusText}>
                        {isSelected ? 'CURRENT' : 'SELECT'}
                      </Text>

                    </Pressable>
                  );
                })}

              </View>

            </ScrollView>

            {updatingId !== null && (
              <View style={styles.updatingBox}>
                <ActivityIndicator color="#218653" />

                <Text style={styles.updatingText}>
                  Updating order...
                </Text>
              </View>
            )}

            <Pressable
              style={styles.cancelButton}
              onPress={closeStatusPopup}
              disabled={updatingId !== null}
            >
              <Text style={styles.cancelButtonText}>
                Close
              </Text>
            </Pressable>

          </View>
        </View>

      </Modal>

      {/* Success and Error Popup */}
      <Modal
        visible={resultPopupVisible}
        transparent
        animationType="fade"
        onRequestClose={closeResultPopup}
      >

        <View style={styles.resultOverlay}>

          <View style={styles.resultCard}>

            <View
              style={[
                styles.resultIcon,
                popupType === 'success'
                  ? styles.successIcon
                  : styles.errorIcon,
              ]}
            >

              <Text
                style={[
                  styles.resultIconText,
                  popupType === 'success'
                    ? styles.successText
                    : styles.errorTextColor,
                ]}
              >
                {popupType === 'success' ? '✓' : '!'}
              </Text>

            </View>

            <Text style={styles.resultTitle}>
              {popupTitle}
            </Text>

            <Text style={styles.resultMessage}>
              {popupMessage}
            </Text>

            <Pressable
              style={[
                styles.resultButton,
                popupType === 'success'
                  ? styles.successButton
                  : styles.errorButton,
              ]}
              onPress={closeResultPopup}
            >

              <Text style={styles.resultButtonText}>
                Okay
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
    backgroundColor: '#F3F6F3',
  },

  container: {
    paddingBottom: 35,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F6F3',
  },

  loadingText: {
    color: '#65756A',
    marginTop: 12,
    fontSize: 13,
  },

  // Header
  header: {
    backgroundColor: '#123D2B',
    paddingTop: 55,
    paddingHorizontal: 22,
    paddingBottom: 25,
    borderBottomLeftRadius: 27,
    borderBottomRightRadius: 27,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLabel: {
    color: '#9DB6C5',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 7,
  },

  headerIcon: {
    width: 49,
    height: 49,
    borderRadius: 16,
    backgroundColor: '#29485B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerIconText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  headerDescription: {
    color: '#C1D0D9',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 16,
    maxWidth: 290,
  },

  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 23,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#365163',
  },

  headerBottomText: {
    color: '#B6C9D3',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Summary
  summarySection: {
    paddingHorizontal: 18,
    marginTop: 24,
  },

  sectionTitle: {
    color: '#203B2B',
    fontSize: 19,
    fontWeight: '800',
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 13,
  },

  summaryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },

  summaryNumber: {
    color: '#3478D4',
    fontSize: 26,
    fontWeight: '800',
  },

  summaryLabel: {
    color: '#7A897F',
    fontSize: 12,
    marginTop: 4,
  },

  summaryLine: {
    height: 3,
    width: 32,
    borderRadius: 5,
    marginTop: 13,
  },

  // Orders Heading
  ordersHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 14,
    marginBottom: 15,
  },

  sectionSubtitle: {
    color: '#849087',
    fontSize: 12,
    marginTop: 5,
  },

  refreshButton: {
    backgroundColor: '#245D42',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 75,
    alignItems: 'center',
  },

  refreshText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Order Card
  orderCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    marginBottom: 15,
    padding: 17,
    borderRadius: 18,
    elevation: 3,
    shadowColor: '#203B2B',
    shadowOpacity: 0.05,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  orderSmallLabel: {
    color: '#98A39B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  orderId: {
    color: '#203B2B',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 4,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#EDF0ED',
    marginVertical: 16,
  },

  customerLabel: {
    color: '#98A39B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  customerEmail: {
    color: '#344B3B',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 5,
  },

  // Products
  productsSection: {
    marginTop: 17,
    padding: 13,
    backgroundColor: '#F8FAF7',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#EAF0EA',
  },

  productsHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  productsTitle: {
    color: '#718078',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  productsCount: {
    color: '#8A978E',
    fontSize: 10,
    fontWeight: '600',
  },

  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E9EFE9',
  },

  productInfo: {
    flex: 1,
    paddingRight: 10,
  },

  productName: {
    color: '#294333',
    fontSize: 13,
    fontWeight: '700',
  },

  productMeta: {
    color: '#849087',
    fontSize: 11,
    marginTop: 4,
  },

  productPriceInfo: {
    alignItems: 'flex-end',
  },

  productPrice: {
    color: '#7C8A80',
    fontSize: 10,
  },

  productTotal: {
    color: '#218653',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },

  noProductsText: {
    color: '#89968D',
    fontSize: 11,
    paddingVertical: 8,
    lineHeight: 17,
  },

  // Order Details
  detailsRow: {
    flexDirection: 'row',
    backgroundColor: '#F6F8F5',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 8,
    marginTop: 16,
  },

  detailBox: {
    flex: 1,
    alignItems: 'center',
  },

  detailLabel: {
    color: '#91A096',
    fontSize: 9,
    fontWeight: '800',
  },

  detailValue: {
    color: '#344B3B',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },

  priceValue: {
    color: '#218653',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 6,
  },

  manageButton: {
    backgroundColor: '#245D42',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },

  manageButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  buttonPressed: {
    opacity: 0.8,
  },

  disabledButton: {
    opacity: 0.5,
  },

  // Empty and Error
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 18,
    padding: 25,
    alignItems: 'center',
  },

  emptyTitle: {
    color: '#263D30',
    fontSize: 17,
    fontWeight: '800',
  },

  emptyDescription: {
    color: '#89968D',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },

  errorCard: {
    backgroundColor: '#FFF0EF',
    marginHorizontal: 18,
    padding: 16,
    borderRadius: 13,
  },

  errorText: {
    color: '#B42318',
    fontSize: 13,
    lineHeight: 19,
  },

  retryButton: {
    backgroundColor: '#B42318',
    padding: 10,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 12,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Status Popup
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 18, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    borderRadius: 22,
    padding: 20,
    elevation: 10,
  },

  modalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  modalSmallTitle: {
    color: '#8B9B90',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  modalTitle: {
    color: '#203B2B',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 5,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#F0F3F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    color: '#52665A',
    fontSize: 25,
    lineHeight: 28,
  },

  modalDescription: {
    color: '#829087',
    fontSize: 12,
    marginTop: 13,
    marginBottom: 17,
  },

  modalInfoBox: {
    backgroundColor: '#F5F8F4',
    borderRadius: 13,
    padding: 13,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8EEE8',
  },

  modalInfoLabel: {
    color: '#91A096',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  modalInfoValue: {
    color: '#344B3B',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
  },

  modalInfoDivider: {
    height: 1,
    backgroundColor: '#E5ECE5',
    marginVertical: 10,
  },

  modalInfoStatus: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 5,
  },

  statusScroll: {
    maxHeight: 260,
  },

  modalStatusList: {
    gap: 9,
  },

  modalStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EDE8',
    borderRadius: 12,
    padding: 13,
    backgroundColor: '#FFFFFF',
  },

  modalStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 11,
  },

  modalStatusText: {
    color: '#3B5142',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },

  selectStatusText: {
    color: '#8A978E',
    fontSize: 9,
    fontWeight: '800',
  },

  updatingBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    gap: 9,
  },

  updatingText: {
    color: '#218653',
    fontSize: 12,
    fontWeight: '700',
  },

  cancelButton: {
    backgroundColor: '#EEF2EE',
    paddingVertical: 13,
    borderRadius: 11,
    alignItems: 'center',
    marginTop: 17,
  },

  cancelButtonText: {
    color: '#405649',
    fontSize: 13,
    fontWeight: '800',
  },

  // Result Popup
  resultOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 18, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  resultCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
  },

  resultIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  successIcon: {
    backgroundColor: '#E4F4E9',
  },

  errorIcon: {
    backgroundColor: '#FCE8E6',
  },

  resultIconText: {
    fontSize: 32,
    fontWeight: '800',
  },

  successText: {
    color: '#218653',
  },

  errorTextColor: {
    color: '#D64C4C',
  },

  resultTitle: {
    color: '#203B2B',
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
  },

  resultMessage: {
    color: '#718078',
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 12,
  },

  resultButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 23,
  },

  successButton: {
    backgroundColor: '#218653',
  },

  errorButton: {
    backgroundColor: '#C74747',
  },

  resultButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

});
