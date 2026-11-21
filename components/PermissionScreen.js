
import React, { useEffect, useRef, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Easing,
} from 'react-native';

export default function PermissionScreen({
  allowed,
  children,
  screenName = 'this screen',
  userRole,
}) {
  const [visible, setVisible] = useState(false);

  const previousAllowed = useRef(allowed);

  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const isAdmin =
    String(userRole || '').toLowerCase() === 'admin';

  // Show popup only when permission changes false -> true
  useEffect(() => {
    if (
      previousAllowed.current === false &&
      allowed === true &&
      isAdmin
    ) {
      setVisible(true);
    }

    previousAllowed.current = allowed;

  }, [allowed, isAdmin]);

  // Popup animation
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),

        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0.8);
      opacity.setValue(0);
    }
  }, [visible]);

  const closePopup = () => {
    setVisible(false);
  };

  // Permission denied
  if (!allowed) {
    return <View style={styles.blankScreen} />;
  }

  return (
    <>
      {children}

      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closePopup}
      >
        <View style={styles.overlay}>

          <Animated.View
            style={[
              styles.popup,
              {
                opacity,
                transform: [{ scale }],
              },
            ]}
          >

            {/* TOP ICON */}

            <View style={styles.iconCircle}>
              <Text style={styles.icon}>✓</Text>
            </View>

            {/* HEADING */}

            <Text style={styles.title}>
              Access Granted!
            </Text>

            <Text style={styles.subtitle}>
              Your permissions have been updated successfully.
            </Text>

            {/* SCREEN DETAILS */}

            <View style={styles.permissionCard}>

              <View style={styles.smallIcon}>
                <Text style={styles.lockIcon}>🔓</Text>
              </View>

              <View style={styles.screenInfo}>
                <Text style={styles.screenLabel}>
                  NEW ACCESS UNLOCKED
                </Text>

                <Text style={styles.screenName}>
                  {screenName}
                </Text>
              </View>

              <Text style={styles.checkmark}>
                ✓
              </Text>

            </View>

            {/* MESSAGE */}

            <Text style={styles.message}>
              Super Admin has granted you access.
              You can now explore this screen.
            </Text>

            {/* BUTTON */}

            <Pressable
              onPress={closePopup}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonText}>
                Continue
              </Text>

              <Text style={styles.arrow}>
                →
              </Text>
            </Pressable>

          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({

  blankScreen: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 18, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },

  popup: {
    width: '100%',
    maxWidth: 370,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 25,
    alignItems: 'center',

    elevation: 25,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },

  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E1F5DF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#B8E5B3',
    marginBottom: 17,
  },

  icon: {
    fontSize: 38,
    color: '#168044',
    fontWeight: '900',
  },

  title: {
    fontSize: 25,
    fontWeight: '900',
    color: '#183D32',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 13,
    color: '#829084',
    textAlign: 'center',
    marginTop: 9,
    lineHeight: 20,
  },

  permissionCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8EF',
    borderRadius: 17,
    padding: 14,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#D9EED7',
  },

  smallIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#DDF0DA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  lockIcon: {
    fontSize: 21,
  },

  screenInfo: {
    flex: 1,
    marginLeft: 12,
  },

  screenLabel: {
    fontSize: 9,
    color: '#168044',
    fontWeight: '900',
    letterSpacing: 1,
  },

  screenName: {
    fontSize: 15,
    color: '#183D32',
    fontWeight: '800',
    marginTop: 4,
  },

  checkmark: {
    fontSize: 20,
    color: '#168044',
    fontWeight: '900',
  },

  message: {
    fontSize: 12,
    color: '#829084',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 19,
    marginBottom: 23,
  },

  button: {
    width: '100%',
    height: 53,
    backgroundColor: '#183D32',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  arrow: {
    color: '#FFFFFF',
    fontSize: 21,
    marginLeft: 10,
  },

});
