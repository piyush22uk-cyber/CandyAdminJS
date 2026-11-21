
import React, { useCallback, useEffect, useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import DashboardScreen from '../screens/DashboardScreen';
import ProductsScreen from '../screens/ProductsScreen';
import OrdersScreen from '../screens/OrdersScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import CustomersScreen from '../screens/CustomersScreen';

import api from '../services/api';

const Tab = createBottomTabNavigator();

// Theme Colors
const GREEN = '#183D32';

const COLORS = {
  bar: '#FFFFFF',
  border: '#E5ECE8',
  accent: GREEN,
  active: '#FFFFFF',
  inactive: '#89938D',
};

// Tab Bar Dimensions
const BAR_H = 68;
const PAD = 5;
const THUMB_H = BAR_H - PAD * 2;

// All Permissions
const ALL_PERMISSIONS = [
  'dashboard',
  'products',
  'orders',
  'customers',
  'notifications',
  'viewUsers',
  'adminNotifications',
  'about',
  'account',
];

// No Permission Screen
function NoAccessScreen() {
  return (
    <View style={styles.loadingContainer}>
      <Ionicons
        name="lock-closed-outline"
        size={48}
        color={GREEN}
      />

      <Text style={styles.noAccessTitle}>
        No Screens Assigned
      </Text>

      <Text style={styles.noAccessText}>
        Please contact your SuperAdmin to get screen access.
      </Text>
    </View>
  );
}

// Sliding Liquid Tab Bar
function SlidingTabBar({
  state,
  descriptors,
  navigation,
  bottomInset,
}) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const BAR_W = Math.min(SCREEN_WIDTH - 40, 420);

  const n = state.routes.length;

  const tabW = (BAR_W - PAD * 2) / n;

  // Animation Values
  const x = useSharedValue(state.index * tabW);
  const vel = useSharedValue(0);
  const pressed = useSharedValue(0);
  const dragging = useSharedValue(false);

  // Navigate Tab
  const goTo = (index) => {
    if (index < 0 || index >= state.routes.length) return;

    const route = state.routes[index];

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  // Sync Active Tab
  useEffect(() => {
    if (!dragging.value) {
      x.value = withSpring(state.index * tabW, {
        damping: 13,
        stiffness: 140,
        mass: 0.85,
      });
    }
  }, [state.index, tabW]);

  // Swipe Gesture
  const pan = Gesture.Pan()
    .onBegin(() => {
      dragging.value = true;
      pressed.value = withSpring(1);
    })

    .onUpdate((e) => {
      const nextX = state.index * tabW + e.translationX;

      x.value = Math.max(
        0,
        Math.min(nextX, (n - 1) * tabW)
      );

      vel.value = e.velocityX;
    })

    .onEnd((e) => {
      const projected = x.value + e.velocityX * 0.12;

      const target = Math.min(
        Math.max(Math.round(projected / tabW), 0),
        n - 1
      );

      x.value = withSpring(target * tabW, {
        damping: 13,
        stiffness: 140,
        mass: 0.85,
      });

      runOnJS(goTo)(target);
    })

    .onFinalize(() => {
      dragging.value = false;

      pressed.value = withSpring(0, {
        damping: 14,
        stiffness: 160,
      });

      vel.value = withTiming(0, {
        duration: 250,
      });
    });

  // Liquid Thumb Animation
  const thumbStyle = useAnimatedStyle(() => {
    const speed = Math.min(
      Math.abs(vel.value) / 3500,
      1
    );

    return {
      transform: [
        { translateX: x.value },
        {
          scaleX:
            (1 + speed * 0.28) *
            (1 + pressed.value * 0.06),
        },
        {
          scaleY:
            (1 - speed * 0.12) *
            (1 + pressed.value * 0.06),
        },
      ],

      shadowOpacity: 0.35 + pressed.value * 0.45,
      shadowRadius: 14 + pressed.value * 14,
    };
  });

  // Glow Animation
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.18 + pressed.value * 0.35,

    transform: [
      { translateX: x.value },
      {
        scale:
          1.2 +
          pressed.value * 0.25 +
          Math.min(Math.abs(vel.value) / 6000, 0.2),
      },
    ],
  }));

  const icons = {
    Home: 'home',
    Products: 'cube',
    Orders: 'receipt',
    Notifications: 'notifications',
    Users: 'people',
    NoAccess: 'lock-closed',
  };

  return (
    <View
      style={[
        styles.wrap,
        {
          bottom: Math.max(bottomInset, 8) + 16,
        },
      ]}
    >
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.bar,
            { width: BAR_W },
          ]}
        >
          {/* Glow */}
          <Animated.View
            style={[
              styles.glow,
              { width: tabW },
              glowStyle,
            ]}
          />

          {/* Active Sliding Pill */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.thumb,
              { width: tabW },
              thumbStyle,
            ]}
          />

          {/* Tab Items */}
          {state.routes.map((route, index) => {
            const focused = state.index === index;

            const options = descriptors[route.key].options;

            const label =
              typeof options.tabBarLabel === 'string'
                ? options.tabBarLabel
                : options.title ?? route.name;

            const iconName = icons[route.name] || 'ellipse';

            return (
              <TouchableOpacity
                key={route.key}
                style={[
                  styles.item,
                  { width: tabW },
                ]}
                activeOpacity={0.8}
                onPress={() => goTo(index)}
                accessibilityRole="button"
                accessibilityState={{
                  selected: focused,
                }}
              >
                <Ionicons
                  name={`${iconName}${focused ? '' : '-outline'}`}
                  size={22}
                  color={
                    focused
                      ? COLORS.active
                      : COLORS.inactive
                  }
                />

                <Text
                  numberOfLines={1}
                  style={[
                    styles.label,
                    {
                      color: focused
                        ? COLORS.active
                        : COLORS.inactive,
                    },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// Main Admin Tabs
export default function AdminTabs() {
  const insets = useSafeAreaInsets();

  const [allowedScreens, setAllowedScreens] = useState([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  // Fetch Latest Permissions
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadPermissions = async () => {
        try {
          setPermissionsLoading(true);

          const savedUser = await AsyncStorage.getItem('user');

          if (!savedUser) {
            if (active) {
              setAllowedScreens([]);
            }
            return;
          }

          const parsedUser = JSON.parse(savedUser);

          // SuperAdmin Full Access
          if (parsedUser.role === 'superadmin') {
            if (active) {
              setAllowedScreens(ALL_PERMISSIONS);
            }
            return;
          }

          // Admin Latest Permissions
          const response = await api.get(
            '/admin/permissions/my-permissions'
          );

          if (active) {
            const screens =
              response.data?.isApproved === true &&
              Array.isArray(response.data?.allowedScreens)
                ? response.data.allowedScreens
                : [];

            setAllowedScreens(screens);
          }

        } catch (error) {
          console.log(
            'PERMISSION FETCH ERROR:',
            error.response?.data || error.message
          );

          if (active) {
            setAllowedScreens([]);
          }

        } finally {
          if (active) {
            setPermissionsLoading(false);
          }
        }
      };

      loadPermissions();

      return () => {
        active = false;
      };
    }, [])
  );

  // Permission Check
  const hasPermission = (screen) => {
    return allowedScreens.includes(screen);
  };

  // Loading Screen
  if (permissionsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={GREEN}
        />

        <Text style={styles.loadingText}>
          Loading permissions...
        </Text>
      </View>
    );
  }

  // Initial Route
  const initialRoute =
    hasPermission('dashboard') ? 'Home' :
    hasPermission('products') ? 'Products' :
    hasPermission('orders') ? 'Orders' :
    hasPermission('notifications') ? 'Notifications' :
    hasPermission('customers') ? 'Users' :
    'NoAccess';

  return (
    <Tab.Navigator
      key={allowedScreens.slice().sort().join('-')}
      initialRouteName={initialRoute}

      tabBar={(props) => (
        <SlidingTabBar
          {...props}
          bottomInset={insets.bottom}
        />
      )}

      screenOptions={{
        headerShown: false,

        sceneStyle: {
          backgroundColor: '#F4F7F5',
        },
      }}
    >
      {/* Dashboard */}
      {hasPermission('dashboard') && (
        <Tab.Screen
          name="Home"
          component={DashboardScreen}
          options={{
            tabBarLabel: 'Home',
          }}
        />
      )}

      {/* Products */}
      {hasPermission('products') && (
        <Tab.Screen
          name="Products"
          component={ProductsScreen}
        />
      )}

      {/* Orders */}
      {hasPermission('orders') && (
        <Tab.Screen
          name="Orders"
          component={OrdersScreen}
        />
      )}

      {/* Notifications */}
      {hasPermission('notifications') && (
        <Tab.Screen
          name="Notifications"
          component={NotificationsScreen}
        />
      )}

      {/* Customers */}
      {hasPermission('customers') && (
        <Tab.Screen
          name="Users"
          component={CustomersScreen}
          options={{
            tabBarLabel: 'Users',
          }}
        />
      )}

      {/* No Access */}
      {allowedScreens.length === 0 && (
        <Tab.Screen
          name="NoAccess"
          component={NoAccessScreen}
          options={{
            tabBarLabel: 'Access',
          }}
        />
      )}

    </Tab.Navigator>
  );
}

// Styles
const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  bar: {
    height: BAR_H,
    borderRadius: BAR_H / 2,
    backgroundColor: COLORS.bar,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: COLORS.border,
    padding: PAD,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 18,
  },

  thumb: {
    position: 'absolute',
    left: PAD,
    top: PAD,
    height: THUMB_H,
    borderRadius: THUMB_H / 2,
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 10,
  },

  glow: {
    position: 'absolute',
    left: PAD,
    top: PAD,
    height: THUMB_H,
    borderRadius: THUMB_H / 2,
    backgroundColor: COLORS.accent,
  },

  item: {
    height: THUMB_H,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  label: {
    position: 'absolute',
    bottom: 5,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F4F7F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  loadingText: {
    marginTop: 12,
    color: GREEN,
    fontSize: 13,
    fontWeight: '600',
  },

  noAccessTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: GREEN,
    marginTop: 15,
  },

  noAccessText: {
    fontSize: 13,
    color: '#89938D',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
