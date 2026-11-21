import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const COLORS = {
  primary: '#183D32',
  lightGreen: '#E8F0ED',
  background: '#F5F7F6',
  white: '#FFFFFF',
  text: '#203329',
  muted: '#89958F',
  border: '#E8ECE9',
  online: '#20A464',
  offline: '#9AA49F',
  red: '#D9534F',
};

export default function ViewUsersScreen() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setError('');

      const token = await AsyncStorage.getItem('token');

      const response = await api.get('/auth/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      const userList = Array.isArray(data)
        ? data
        : data.users || data.customers || [];

      setUsers(userList);
    } catch (err) {
      console.log('FETCH USERS ERROR:', err.response?.data || err.message);
      setError(
        err.response?.data?.message || 'Unable to load customer accounts'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  // Last 2 minutes mein activity ho to Online
  const getUserStatus = (user) => {
    if (user.isOnline === true) return 'online';

    if (!user.lastSeen) return 'unknown';

    const lastSeenTime = new Date(user.lastSeen).getTime();
    const currentTime = Date.now();

    if (
      !Number.isNaN(lastSeenTime) &&
      currentTime - lastSeenTime <= 2 * 60 * 1000
    ) {
      return 'online';
    }

    return 'offline';
  };

  const onlineCount = users.filter(
    user => getUserStatus(user) === 'online'
  ).length;

  const offlineCount = users.filter(
    user => getUserStatus(user) === 'offline'
  ).length;

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return users;

    return users.filter(user =>
      `${user.name || ''} ${user.email || ''}`
        .toLowerCase()
        .includes(value)
    );
  }, [users, search]);

  const formatDate = (date) => {
    if (!date) return 'Not available';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Not available';
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderUser = ({ item }) => {
    const status = getUserStatus(item);

    return (
      <View style={styles.userCard}>
        <View style={styles.userTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(item.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {item.name || 'Unknown User'}
            </Text>

            <Text style={styles.userEmail}>
              {item.email || 'Email unavailable'}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              status === 'online' && styles.onlineBadge,
              status === 'offline' && styles.offlineBadge,
              status === 'unknown' && styles.unknownBadge,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                status === 'online' && styles.onlineDot,
                status === 'offline' && styles.offlineDot,
                status === 'unknown' && styles.unknownDot,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                status === 'online' && styles.onlineText,
                status === 'offline' && styles.offlineText,
              ]}
            >
              {status === 'online'
                ? 'Online'
                : status === 'offline'
                ? 'Offline'
                : 'Unknown'}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons
              name="person-outline"
              size={15}
              color={COLORS.muted}
            />
            <Text style={styles.detailText}>
              {item.role || 'customer'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons
              name="calendar-outline"
              size={15}
              color={COLORS.muted}
            />
            <Text style={styles.detailText}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Customer Accounts</Text>
          <Text style={styles.headerSubtitle}>
            Manage and monitor your customers
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons name="people" size={25} color={COLORS.primary} />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: COLORS.lightGreen }]}>
            <Ionicons name="people-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#E6F6ED' }]}>
            <Ionicons name="radio-button-on" size={20} color={COLORS.online} />
          </View>
          <Text style={[styles.statNumber, { color: COLORS.online }]}>
            {onlineCount}
          </Text>
          <Text style={styles.statLabel}>Online</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#F0F2F1' }]}>
            <Ionicons name="time-outline" size={20} color={COLORS.offline} />
          </View>
          <Text style={styles.statNumber}>{offlineCount}</Text>
          <Text style={styles.statLabel}>Offline</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={21} color={COLORS.muted} />

        <TextInput
          style={styles.searchInput}
          placeholder="Search name or email..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />

        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All Customers</Text>
        <Text style={styles.resultCount}>
          {filteredUsers.length} users
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 40 }}
        />
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cloud-offline-outline" size={42} color={COLORS.muted} />
          <Text style={styles.emptyTitle}>Unable to load users</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item, index) =>
            String(item._id || item.id || index)
          }
          renderItem={renderUser}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchUsers();
              }}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={42} color={COLORS.muted} />
              <Text style={styles.emptyTitle}>No customers found</Text>
              <Text style={styles.emptyText}>
                Try searching with another name or email.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: COLORS.primary,
  },
  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 23,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 3,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 13,
    paddingHorizontal: 13,
    height: 49,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 9,
    color: COLORS.text,
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  resultCount: {
    fontSize: 12,
    color: COLORS.muted,
  },
  listContent: {
    paddingBottom: 25,
  },
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  userInfo: {
    flex: 1,
    marginLeft: 11,
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F0F2F1',
  },
  onlineBadge: {
    backgroundColor: '#E6F6ED',
  },
  offlineBadge: {
    backgroundColor: '#F0F2F1',
  },
  unknownBadge: {
    backgroundColor: '#FFF5E5',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },
  onlineDot: {
    backgroundColor: COLORS.online,
  },
  offlineDot: {
    backgroundColor: COLORS.offline,
  },
  unknownDot: {
    backgroundColor: '#D99A32',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.muted,
  },
  onlineText: {
    color: COLORS.online,
  },
  offlineText: {
    color: COLORS.offline,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 13,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 11,
    color: COLORS.muted,
    textTransform: 'capitalize',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 45,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 6,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 15,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '700',
  },
});