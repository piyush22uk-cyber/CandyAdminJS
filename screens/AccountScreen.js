import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  Modal,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const GREEN = '#183D32';

export default function AccountScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  // Load logged-in user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user');

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.log('Account loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const name =
    user?.name ||
    user?.fullName ||
    user?.username ||
    'Admin User';

  const email = user?.email || 'Not available';

  const role =
    user?.role === 'superadmin' ? 'Super Admin' : 'Admin';

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const formatDate = (date) => {
    if (!date) return 'Not available';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Not available';
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Logout
  const handleLogout = () => {
  setLogoutModal(true);
};

const performLogout = async () => {
  try {
    setLoggingOut(true);

    await AsyncStorage.multiRemove(['token', 'user']);

    const loginScreen =
      user?.role === 'superadmin'
        ? 'SuperAdminLoginScreen'
        : 'AdminLogin';

    let parentNavigation = navigation;

    while (parentNavigation.getParent()) {
      parentNavigation = parentNavigation.getParent();
    }

    parentNavigation.reset({
      index: 0,
      routes: [{ name: loginScreen }],
    });

  } catch (error) {
    console.log('Logout error:', error);
    setLoggingOut(false);
  }
};
  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={19} color={GREEN} />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Not available'}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>Unable to load account details.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F4F7F5" barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>My Account</Text>
          <Text style={styles.subHeading}>
            Manage your account information
          </Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || 'A'}</Text>
          </View>

          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>

          <View style={styles.roleBadge}>
            <Ionicons
              name={user.role === 'superadmin' ? 'shield-checkmark' : 'person'}
              size={14}
              color={GREEN}
            />
            <Text style={styles.roleText}>{role}</Text>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          <View style={styles.infoCard}>
            <InfoRow
              icon="person-outline"
              label="Full Name"
              value={name}
            />

            <View style={styles.separator} />

            <InfoRow
              icon="mail-outline"
              label="Email Address"
              value={email}
            />

            <View style={styles.separator} />

            <InfoRow
              icon="shield-checkmark-outline"
              label="Account Role"
              value={role}
            />

            <View style={styles.separator} />

            <InfoRow
              icon="finger-print-outline"
              label="Account ID"
              value={user._id || user.id}
            />

            {user.phone ? (
              <>
                <View style={styles.separator} />
                <InfoRow
                  icon="call-outline"
                  label="Phone Number"
                  value={user.phone}
                />
              </>
            ) : null}

            {user.createdAt ? (
              <>
                <View style={styles.separator} />
                <InfoRow
                  icon="calendar-outline"
                  label="Account Created"
                  value={formatDate(user.createdAt)}
                />
              </>
            ) : null}

            {typeof user.isActive === 'boolean' ? (
              <>
                <View style={styles.separator} />
                <InfoRow
                  icon="checkmark-circle-outline"
                  label="Account Status"
                  value={user.isActive ? 'Active' : 'Inactive'}
                />
              </>
            ) : null}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.85}
        >
          {loggingOut ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={21} color="#FFFFFF" />
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          CandyAdminJS · Account Settings
        </Text>
      </ScrollView>

      <Modal
  visible={logoutModal}
  transparent
  animationType="fade"
  statusBarTranslucent
  onRequestClose={() => setLogoutModal(false)}
>
  <View style={styles.logoutOverlay}>
    <View style={styles.logoutCard}>

      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setLogoutModal(false)}
        disabled={loggingOut}
      >
        <Ionicons name="close" size={21} color="#64748B" />
      </TouchableOpacity>

      {/* Icon */}
      <View style={styles.logoutIconCircle}>
        <View style={styles.logoutIconInner}>
          <Ionicons
            name="log-out-outline"
            size={34}
            color="#183D32"
          />
        </View>
      </View>

      {/* Text */}
      <Text style={styles.logoutTitle}>
        Leaving So Soon?
      </Text>

      <Text style={styles.logoutSubtitle}>
        Are you sure you want to logout from your account?
        You'll need to sign in again to continue.
      </Text>

      {/* Buttons */}
      <View style={styles.logoutButtons}>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setLogoutModal(false)}
          disabled={loggingOut}
        >
          <Text style={styles.cancelButtonText}>
            Stay Logged In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmLogoutButton}
          onPress={performLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons
                name="log-out-outline"
                size={19}
                color="#FFFFFF"
              />
              <Text style={styles.confirmLogoutText}>
                Logout
              </Text>
            </>
          )}
        </TouchableOpacity>

      </View>

      <Text style={styles.logoutFooter}>
        YOUR ACCOUNT • YOUR CONTROL
      </Text>

    </View>
  </View>
</Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F5',
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 125,
  },

  header: {
    marginTop: 15,
    marginBottom: 22,
  },

  heading: {
    fontSize: 27,
    fontWeight: '800',
    color: GREEN,
  },

  subHeading: {
    fontSize: 13,
    color: '#7B8982',
    marginTop: 5,
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5ECE8',
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  avatarText: {
    fontSize: 27,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  name: {
    fontSize: 21,
    fontWeight: '800',
    color: '#1D3028',
  },

  email: {
    fontSize: 13,
    color: '#7B8982',
    marginTop: 6,
  },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EAF2ED',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 15,
  },

  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: GREEN,
  },

  section: {
    marginTop: 27,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#263A30',
    marginBottom: 13,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5ECE8',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EAF2ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 11,
    color: '#89958E',
    marginBottom: 5,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#263A30',
  },

  separator: {
    height: 1,
    backgroundColor: '#EEF1EF',
  },

  logoutButton: {
    height: 55,
    backgroundColor: '#C94343',
    borderRadius: 15,
    marginTop: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  logoutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  footerText: {
    textAlign: 'center',
    color: '#9AA59F',
    fontSize: 11,
    marginTop: 22,
  },

  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F7F5',
  },

  errorText: {
    color: '#66736C',
    fontSize: 14,
  },

  logoutOverlay: {
  flex: 1,
  backgroundColor: 'rgba(8, 20, 16, 0.72)',
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 25,
},

logoutCard: {
  width: '100%',
  maxWidth: 380,
  backgroundColor: '#FFFFFF',
  borderRadius: 28,
  paddingHorizontal: 24,
  paddingTop: 35,
  paddingBottom: 24,
  alignItems: 'center',
  elevation: 15,
},

closeButton: {
  position: 'absolute',
  right: 16,
  top: 16,
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: '#F1F5F3',
  justifyContent: 'center',
  alignItems: 'center',
},

logoutIconCircle: {
  width: 88,
  height: 88,
  borderRadius: 44,
  backgroundColor: '#E8F1EC',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 22,
},

logoutIconInner: {
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: '#FFFFFF',
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 3,
},

logoutTitle: {
  fontSize: 23,
  fontWeight: '800',
  color: '#183D32',
  marginBottom: 10,
},

logoutSubtitle: {
  fontSize: 14,
  color: '#718078',
  textAlign: 'center',
  lineHeight: 22,
  marginBottom: 27,
  paddingHorizontal: 5,
},

logoutButtons: {
  width: '100%',
  gap: 11,
},

cancelButton: {
  height: 52,
  borderRadius: 15,
  backgroundColor: '#EDF3EF',
  justifyContent: 'center',
  alignItems: 'center',
},

cancelButtonText: {
  color: '#183D32',
  fontSize: 15,
  fontWeight: '700',
},

confirmLogoutButton: {
  height: 52,
  borderRadius: 15,
  backgroundColor: '#183D32',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 9,
},

confirmLogoutText: {
  color: '#FFFFFF',
  fontSize: 15,
  fontWeight: '700',
},

logoutFooter: {
  fontSize: 9,
  letterSpacing: 2,
  color: '#9AA9A0',
  fontWeight: '700',
  marginTop: 22,
},

});