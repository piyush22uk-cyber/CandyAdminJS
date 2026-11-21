
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function CustomersScreen() {
  const navigation = useNavigation();

  const [user, setUser] = useState({});

  // Load logged-in user information
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.log('PROFILE ERROR:', error.message);
    }
  };

  // Open Account Screen
  const openAccount = () => {
    navigation.getParent()?.navigate('Account');
  };

  const menuItems = [
    {
      title: 'View Users',
      subtitle: 'Manage registered customers',
      icon: 'people-outline',
      color: '#287A50',
      background: '#E8F5EC',
      action: () => {
        navigation.getParent()?.navigate('ViewUsers');
      },
    },

    ...(user.role === 'superadmin'
      ? [
          {
            title: 'Create Admin',
            subtitle: 'Add a new admin account',
            icon: 'person-add-outline',
            color: '#4775C5',
            background: '#EAF0FC',
            action: () => {
              navigation.getParent()?.navigate('ManageAdmins');
            },
          },

          {
            title: 'Screen Permissions',
            subtitle: 'Control admin screen access',
            icon: 'shield-checkmark-outline',
            color: '#A36B20',
            background: '#FFF3DF',
            action: () => {
              navigation.getParent()?.navigate('AdminPermissions');
            },
          },
        ]
      : []),

    {
      title: 'About App',
      subtitle: 'Version and application details',
      icon: 'information-circle-outline',
      color: '#8055B5',
      background: '#F1EAFB',
      action: () => {
        navigation.getParent()?.navigate('About');
      },
    },
  ];

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerLabel}>
              CANDYAPP CONTROL PANEL
            </Text>

            <Text style={styles.headerTitle}>
              {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
            </Text>
          </View>

          <View style={styles.profileIcon}>
            <Ionicons
              name="shield-checkmark"
              size={29}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* CLICKABLE ACCOUNT CARD */}
        <Pressable
          style={({ pressed }) => [
            styles.profileCard,
            pressed && { opacity: 0.75 },
          ]}
          onPress={openAccount}
        >
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={27} color="#FFFFFF" />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.welcomeText}>
              Welcome back,
            </Text>

            <Text style={styles.profileName}>
              {user.name || 'Admin'}
            </Text>

            <Text style={styles.profileEmail}>
              {user.email || 'Admin Account'}
            </Text>
          </View>

          <View style={styles.adminBadge}>
            <Ionicons
              name="checkmark-circle"
              size={13}
              color="#A5E8BD"
            />

            <Text style={styles.adminBadgeText}>
              {user.role === 'superadmin' ? 'OWNER' : 'ADMIN'}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={17}
            color="#C7E0D0"
          />
        </Pressable>
      </View>

      <View style={styles.content}>

        {/* NOTIFICATIONS */}
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Text style={styles.sectionCaption}>YOUR UPDATES</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.notificationCard,
            pressed && { opacity: 0.75 },
          ]}
          onPress={() => navigation.getParent()?.navigate('AdminOrderNotifications')}
        >
          <View style={styles.notificationIcon}>
            <Ionicons
              name="notifications-outline"
              size={25}
              color="#287A50"
            />
          </View>

          <View style={styles.notificationInfo}>
            <Text style={styles.notificationTitle}>
              Stay Updated
            </Text>

            <Text style={styles.notificationText}>
              Admin requests and important app updates will appear here.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color="#8A988E"
          />
        </Pressable>

        {/* MANAGEMENT */}
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Management</Text>
          <Text style={styles.sectionCaption}>QUICK ACCESS</Text>
        </View>

        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.menuCard,
                pressed && styles.menuCardPressed,
              ]}
              onPress={item.action}
            >
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: item.background },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={27}
                  color={item.color}
                />
              </View>

              <Text style={styles.menuTitle}>
                {item.title}
              </Text>

              <Text style={styles.menuSubtitle}>
                {item.subtitle}
              </Text>

              <View style={styles.menuArrow}>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#287A50"
                />
              </View>
            </Pressable>
          ))}
        </View>

        {/* SECURITY CARD */}
        <View style={styles.securityCard}>
          <View style={styles.securityIcon}>
            <Ionicons
              name="lock-closed-outline"
              size={23}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.securityInfo}>
            <Text style={styles.securityTitle}>
              Secure Administration
            </Text>

            <Text style={styles.securityText}>
              Manage your application and control administrative access.
            </Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color="#789184"
          />

          <Text style={styles.footerText}>
            CandyApp Admin Panel
          </Text>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F6F3',
    marginBottom: 50,
  },

  header: {
    backgroundColor: '#183D32',
    paddingTop: 55,
    paddingHorizontal: 21,
    paddingBottom: 27,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLabel: {
    color: '#A8C7B5',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.7,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '900',
    marginTop: 7,
  },

  profileIcon: {
    width: 51,
    height: 51,
    borderRadius: 17,
    backgroundColor: '#315B49',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileCard: {
    backgroundColor: '#285342',
    borderRadius: 19,
    padding: 15,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileAvatar: {
    width: 49,
    height: 49,
    borderRadius: 16,
    backgroundColor: '#477B60',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },

  welcomeText: {
    color: '#C2D8CA',
    fontSize: 11,
  },

  profileName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 3,
  },

  profileEmail: {
    color: '#C2D8CA',
    fontSize: 10,
    marginTop: 3,
  },

  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#35654D',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 7,
  },

  adminBadgeText: {
    color: '#C7F0D5',
    fontSize: 9,
    fontWeight: '900',
    marginLeft: 4,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 24,
  },

  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
    marginTop: 7,
  },

  sectionTitle: {
    color: '#203B2B',
    fontSize: 19,
    fontWeight: '900',
  },

  sectionCaption: {
    color: '#91A096',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 5,
  },

  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    elevation: 2,
    shadowColor: '#183D32',
    shadowOpacity: 0.04,
    shadowRadius: 7,
  },

  notificationIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: '#E8F5EC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  notificationInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 7,
  },

  notificationTitle: {
    color: '#263D30',
    fontSize: 14,
    fontWeight: '800',
  },

  notificationText: {
    color: '#849087',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  menuCard: {
    width: '48.2%',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    minHeight: 165,
    marginBottom: 13,
    elevation: 2,
    shadowColor: '#183D32',
    shadowOpacity: 0.04,
    shadowRadius: 7,
  },

  menuCardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  menuIcon: {
    width: 49,
    height: 49,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
  },

  menuTitle: {
    color: '#263D30',
    fontSize: 14,
    fontWeight: '900',
  },

  menuSubtitle: {
    color: '#87948A',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
    paddingRight: 3,
  },

  menuArrow: {
    position: 'absolute',
    right: 13,
    bottom: 13,
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: '#E8F5EC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  securityCard: {
    backgroundColor: '#214B38',
    borderRadius: 17,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    marginBottom: 20,
  },

  securityIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#35654D',
    justifyContent: 'center',
    alignItems: 'center',
  },

  securityInfo: {
    flex: 1,
    marginLeft: 12,
  },

  securityTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  securityText: {
    color: '#C3D8CA',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 4,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginBottom: 15,
  },

  footerText: {
    color: '#789184',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 7,
  },
});
