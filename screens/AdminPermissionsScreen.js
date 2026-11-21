
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Switch,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

const GREEN = '#183D32';

// All Admin permissions
const PERMISSIONS = [
  // Main Tabs
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'home-outline',
  },
  {
    key: 'products',
    label: 'Products',
    icon: 'cube-outline',
  },
  {
    key: 'orders',
    label: 'Orders',
    icon: 'receipt-outline',
  },
  {
    key: 'customers',
    label: 'Customers',
    icon: 'people-outline',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: 'notifications-outline',
  },

  // Other Screens / Buttons
  {
    key: 'viewUsers',
    label: 'View Users',
    icon: 'people-circle-outline',
  },
  {
    key: 'adminNotifications',
    label: 'Order Notifications',
    icon: 'notifications-circle-outline',
  },
  {
    key: 'about',
    label: 'About App',
    icon: 'information-circle-outline',
  },
  {
    key: 'account',
    label: 'My Account',
    icon: 'person-circle-outline',
  },
];

export default function AdminPermissionsScreen() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');

  // Fetch all Admin accounts
  const fetchAdmins = async () => {
    try {
      setError('');

      const response = await api.get(
        '/admin/permissions/admins'
      );

      setAdmins(response.data.admins || []);

    } catch (err) {
      console.log(
        'ADMIN FETCH ERROR:',
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        'Unable to load Admin accounts'
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchAdmins();
    }, [])
  );

  // Update Admin permission
  const updatePermission = async (
    admin,
    permission,
    enabled
  ) => {
    if (savingId) return;

    const oldScreens = admin.allowedScreens || [];

    const newScreens = enabled
      ? [...new Set([...oldScreens, permission])]
      : oldScreens.filter(
          item => item !== permission
        );

    setSavingId(admin._id);

    // Update UI immediately
    setAdmins(previous =>
      previous.map(item =>
        item._id === admin._id
          ? {
              ...item,
              allowedScreens: newScreens,
              isApproved: newScreens.length > 0,
            }
          : item
      )
    );

    try {
      await api.put(
        `/admin/permissions/admins/${admin._id}/permissions`,
        {
          allowedScreens: newScreens,
        }
      );

    } catch (err) {
      console.log(
        'PERMISSION UPDATE ERROR:',
        err.response?.data || err.message
      );

      // Restore server data if update fails
      await fetchAdmins();

    } finally {
      setSavingId(null);
    }
  };

  // Render each Admin
  const renderAdmin = ({ item }) => {
    const allowedScreens = item.allowedScreens || [];
    const isSaving = savingId === item._id;

    return (
      <View style={styles.card}>

        {/* Admin Header */}
        <View style={styles.adminHeader}>
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={23}
              color={GREEN}
            />
          </View>

          <View style={styles.adminInfo}>
            <Text style={styles.adminName}>
              {item.name}
            </Text>

            <Text style={styles.adminEmail}>
              {item.email}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              item.isApproved
                ? styles.approvedBadge
                : styles.pendingBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: item.isApproved
                    ? GREEN
                    : '#B47A20',
                },
              ]}
            >
              {item.isApproved ? 'Approved' : 'Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Permission Heading */}
        <View style={styles.permissionHeading}>
          <Text style={styles.permissionTitle}>
            Screen Permissions
          </Text>

          {isSaving && (
            <ActivityIndicator
              size="small"
              color={GREEN}
            />
          )}
        </View>

        {/* All Permission Switches */}
        {PERMISSIONS.map(permission => {
          const isEnabled = allowedScreens.includes(
            permission.key
          );

          return (
            <View
              key={permission.key}
              style={styles.permissionRow}
            >
              <View style={styles.permissionLeft}>
                <View
                  style={[
                    styles.permissionIcon,
                    isEnabled && styles.activeIcon,
                  ]}
                >
                  <Ionicons
                    name={permission.icon}
                    size={19}
                    color={
                      isEnabled ? GREEN : '#89958F'
                    }
                  />
                </View>

                <Text style={styles.permissionName}>
                  {permission.label}
                </Text>
              </View>

              <Switch
                value={isEnabled}
                disabled={!!savingId}
                onValueChange={value =>
                  updatePermission(
                    item,
                    permission.key,
                    value
                  )
                }
                trackColor={{
                  false: '#D8DEDA',
                  true: '#9BB9AD',
                }}
                thumbColor={
                  isEnabled ? GREEN : '#FFFFFF'
                }
              />
            </View>
          );
        })}

        {/* Permission Footer */}
        <View style={styles.footer}>
          <Ionicons
            name="shield-checkmark-outline"
            size={15}
            color={GREEN}
          />

          <Text style={styles.footerText}>
            {allowedScreens.length} of {PERMISSIONS.length} screens enabled
          </Text>
        </View>
      </View>
    );
  };

  const approvedCount = admins.filter(
    admin => admin.isApproved
  ).length;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>
            Admin Permissions
          </Text>

          <Text style={styles.subheading}>
            Manage admin screen access
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="shield-checkmark"
            size={25}
            color={GREEN}
          />
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.stats}>

        <View style={styles.statCard}>
          <Ionicons
            name="people"
            size={21}
            color={GREEN}
          />

          <Text style={styles.statNumber}>
            {admins.length}
          </Text>

          <Text style={styles.statLabel}>
            Total Admins
          </Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons
            name="checkmark-circle"
            size={21}
            color="#20A464"
          />

          <Text
            style={[
              styles.statNumber,
              { color: '#20A464' },
            ]}
          >
            {approvedCount}
          </Text>

          <Text style={styles.statLabel}>
            Approved
          </Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons
            name="time-outline"
            size={21}
            color="#C18A32"
          />

          <Text style={styles.statNumber}>
            {admins.length - approvedCount}
          </Text>

          <Text style={styles.statLabel}>
            Pending
          </Text>
        </View>

      </View>

      {/* Admin List Heading */}
      <View style={styles.listHeading}>
        <Text style={styles.listTitle}>
          All Admin Accounts
        </Text>

        <Text style={styles.listCount}>
          {admins.length} accounts
        </Text>
      </View>

      {/* Loading / Error / Admin List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={GREEN}
          style={{ marginTop: 40 }}
        />

      ) : error ? (
        <View style={styles.empty}>
          <Ionicons
            name="cloud-offline-outline"
            size={40}
            color="#89958F"
          />

          <Text style={styles.emptyTitle}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retry}
            onPress={() => {
              setLoading(true);
              fetchAdmins();
            }}
          >
            <Text style={styles.retryText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>

      ) : (
        <FlatList
          data={admins}
          keyExtractor={item => item._id}
          renderItem={renderAdmin}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 25,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchAdmins();
              }}
              colors={[GREEN]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="people-outline"
                size={42}
                color="#89958F"
              />

              <Text style={styles.emptyTitle}>
                No Admin Accounts
              </Text>

              <Text style={styles.emptyText}>
                Create an Admin account first.
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
    backgroundColor: '#F5F7F6',
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: GREEN,
  },

  subheading: {
    fontSize: 12,
    color: '#89958F',
    marginTop: 5,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#E8F0ED',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E8ECE9',
  },

  statNumber: {
    fontSize: 23,
    fontWeight: '800',
    color: GREEN,
    marginTop: 7,
  },

  statLabel: {
    fontSize: 10,
    color: '#89958F',
    marginTop: 3,
  },

  listHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  listTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#203329',
  },

  listCount: {
    fontSize: 12,
    color: '#89958F',
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 17,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E8ECE9',
  },

  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#E8F0ED',
    justifyContent: 'center',
    alignItems: 'center',
  },

  adminInfo: {
    flex: 1,
    marginLeft: 11,
  },

  adminName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#203329',
  },

  adminEmail: {
    fontSize: 11,
    color: '#89958F',
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },

  approvedBadge: {
    backgroundColor: '#E8F4EC',
  },

  pendingBadge: {
    backgroundColor: '#FFF4DF',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  divider: {
    height: 1,
    backgroundColor: '#E8ECE9',
    marginVertical: 14,
  },

  permissionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },

  permissionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#203329',
  },

  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },

  permissionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  permissionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeIcon: {
    backgroundColor: '#E8F0ED',
  },

  permissionName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#35463D',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F7F4',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },

  footerText: {
    fontSize: 11,
    color: GREEN,
    fontWeight: '700',
  },

  empty: {
    alignItems: 'center',
    marginTop: 45,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    color: '#203329',
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },

  emptyText: {
    color: '#89958F',
    fontSize: 12,
    marginTop: 5,
  },

  retry: {
    backgroundColor: GREEN,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 15,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
