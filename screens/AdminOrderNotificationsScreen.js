
import { useCallback, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import api from '../services/api';

export default function AdminOrderNotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);

  // Fetch notifications from backend
  const fetchNotifications = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get('/admin-notifications');

      setNotifications(response.data.notifications || []);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Unable to load order notifications.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh screen whenever it becomes active
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  // Delete one notification
  const handleDelete = (id) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(id);

              await api.delete(`/admin-notifications/${id}`);

              setNotifications((previous) =>
                previous.filter((item) => item._id !== id)
              );
            } catch (error) {
              Alert.alert(
                'Error',
                error.response?.data?.message ||
                  'Unable to delete notification.'
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  // Delete all notifications
  const handleDeleteAll = () => {
    if (notifications.length === 0) return;

    Alert.alert(
      'Delete All',
      'Are you sure you want to delete all order notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingAll(true);

              await api.delete('/admin-notifications/delete-all');

              setNotifications([]);
              Alert.alert('Success', 'All notifications deleted.');
            } catch (error) {
              Alert.alert(
                'Error',
                error.response?.data?.message ||
                  'Unable to delete notifications.'
              );
            } finally {
              setDeletingAll(false);
            }
          },
        },
      ]
    );
  };

  // Format date and time
  const formatDate = (date) => {
    if (!date) return 'Date unavailable';

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Notification card
  const renderNotification = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Ionicons
            name="cart"
            size={22}
            color="#168344"
          />
        </View>

        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>
            {item.title || 'New Customer Order'}
          </Text>

          <Text style={styles.date}>
            {formatDate(item.createdAt)}
          </Text>
        </View>

        <Pressable
          onPress={() => handleDelete(item._id)}
          disabled={deletingId === item._id}
          style={styles.deleteButton}
        >
          {deletingId === item._id ? (
            <ActivityIndicator size="small" color="#D93636" />
          ) : (
            <Ionicons
              name="trash-outline"
              size={20}
              color="#D93636"
            />
          )}
        </Pressable>
      </View>

      <Text style={styles.message}>
        {item.message}
      </Text>

      <View style={styles.divider} />

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Customer</Text>
        <Text style={styles.detailValue}>
          {item.customerName}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Order ID</Text>
        <Text style={styles.orderId}>
          {item.orderId}
        </Text>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.detailLabel}>Total Amount</Text>
        <Text style={styles.amount}>
          ₹{Number(item.totalAmount || 0).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSmall}>
            CANDYAPP ADMIN
          </Text>

          <Text style={styles.headerTitle}>
            Order Notifications
          </Text>

          <Text style={styles.headerSubtitle}>
            Customer order activity and updates
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="notifications"
            size={25}
            color="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.contentHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Recent Orders
          </Text>

          <Text style={styles.countText}>
            {notifications.length} notifications
          </Text>
        </View>

        <Pressable
          style={[
            styles.deleteAllButton,
            (notifications.length === 0 || deletingAll) &&
              styles.disabledButton,
          ]}
          onPress={handleDeleteAll}
          disabled={notifications.length === 0 || deletingAll}
        >
          {deletingAll ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={15} color="#FFFFFF" />
              <Text style={styles.deleteAllText}>Delete All</Text>
            </>
          )}
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#168344" />
          <Text style={styles.loadingText}>
            Loading notifications...
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderNotification}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNotifications(true)}
              colors={['#168344']}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color="#A0AAA3"
              />

              <Text style={styles.emptyTitle}>
                No Order Notifications
              </Text>

              <Text style={styles.emptyText}>
                New customer orders will appear here.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7F2',
  },
  header: {
    backgroundColor: '#123D2B',
    paddingTop: 55,
    paddingHorizontal: 22,
    paddingBottom: 27,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSmall: {
    color: '#A6C7B1',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
    marginTop: 8,
  },
  headerSubtitle: {
    color: '#C4D7CA',
    fontSize: 12,
    marginTop: 7,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#24563E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentHeader: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#183A29',
    fontSize: 19,
    fontWeight: '800',
  },
  countText: {
    color: '#849087',
    fontSize: 12,
    marginTop: 4,
  },
  deleteAllButton: {
    backgroundColor: '#D93636',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  deleteAllText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.45,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 105,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 17,
    marginBottom: 13,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#E8F4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleContainer: {
    flex: 1,
    marginLeft: 11,
  },
  cardTitle: {
    color: '#203A2A',
    fontSize: 14,
    fontWeight: '800',
  },
  date: {
    color: '#929D95',
    fontSize: 10,
    marginTop: 5,
  },
  deleteButton: {
    padding: 8,
  },
  message: {
    color: '#657369',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF1ED',
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 11,
    gap: 12,
  },
  detailLabel: {
    color: '#89958C',
    fontSize: 12,
  },
  detailValue: {
    color: '#263B2D',
    fontSize: 12,
    fontWeight: '700',
  },
  orderId: {
    color: '#526B59',
    fontSize: 10,
    flex: 1,
    textAlign: 'right',
  },
  amountRow: {
    backgroundColor: '#F2F8F1',
    padding: 11,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amount: {
    color: '#168344',
    fontSize: 15,
    fontWeight: '800',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#849087',
    marginTop: 12,
    fontSize: 13,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    minHeight: 300,
  },
  emptyTitle: {
    color: '#294334',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 15,
  },
  emptyText: {
    color: '#929D95',
    fontSize: 12,
    marginTop: 7,
    textAlign: 'center',
  },
});
