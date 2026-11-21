
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const GREEN = '#183D32';

export default function AboutScreen() {

  const appVersion =
    Constants.expoConfig?.version || 'Not available';

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* App Header */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Ionicons
            name="storefront"
            size={38}
            color={GREEN}
          />
        </View>

        <Text style={styles.appName}>CandyAdminJS</Text>

        <Text style={styles.tagline}>
          Administration & Management Panel
        </Text>

        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>
            VERSION {appVersion}
          </Text>
        </View>
      </View>

      {/* About App */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About Application</Text>

        <Text style={styles.description}>
          CandyAdminJS is an administration application
          designed to manage the CandyApp shopping platform.

          {'\n\n'}

          It helps authorized administrators manage products,
          orders, customers and notifications from one place.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>App Features</Text>

        <Feature
          icon="home-outline"
          title="Dashboard"
          description="View your admin dashboard and account information."
        />

        <Feature
          icon="cube-outline"
          title="Product Management"
          description="Manage product details, prices, stock and categories."
        />

        <Feature
          icon="receipt-outline"
          title="Order Management"
          description="View customer orders and manage order status."
        />

        <Feature
          icon="notifications-outline"
          title="Notifications"
          description="Send notifications to customers."
        />

        <Feature
          icon="people-outline"
          title="Customer Management"
          description="View registered customer information."
        />
      </View>

      {/* Instructions */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Important Instructions</Text>

        <Instruction
          number="01"
          text="Login using your authorized Admin account."
        />

        <Instruction
          number="02"
          text="Only use the screens allowed by Super Admin."
        />

        <Instruction
          number="03"
          text="Check product stock before updating product quantities."
        />

        <Instruction
          number="04"
          text="Update order status carefully after checking order details."
        />

        <Instruction
          number="05"
          text="Always logout when you finish using the application."
        />
      </View>

      {/* Security */}
      <View style={styles.securityCard}>
        <Ionicons
          name="shield-checkmark"
          size={28}
          color={GREEN}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.securityTitle}>
            Security & Permissions
          </Text>

          <Text style={styles.securityText}>
            Screen access is controlled by Super Admin.
            Do not share your login credentials with anyone.
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>
          CandyAdminJS
        </Text>

        <Text style={styles.footerText}>
          Admin Management Application
        </Text>

        <Text style={styles.copyright}>
          © {new Date().getFullYear()} CandyApp
        </Text>
      </View>

    </ScrollView>
  );
}

// Reusable Feature Component
function Feature({ icon, title, description }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={22} color={GREEN} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>
          {description}
        </Text>
      </View>
    </View>
  );
}

// Reusable Instruction Component
function Instruction({ number, text }) {
  return (
    <View style={styles.instructionRow}>
      <Text style={styles.number}>{number}</Text>
      <Text style={styles.instructionText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F5',
  },

  header: {
    backgroundColor: GREEN,
    alignItems: 'center',
    paddingTop: 35,
    paddingBottom: 35,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  logoBox: {
    width: 75,
    height: 75,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  appName: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '800',
  },

  tagline: {
    color: '#D5E5DB',
    fontSize: 12,
    marginTop: 6,
  },

  versionBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 16,
  },

  versionText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: '800',
  },

  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    elevation: 2,
  },

  sectionTitle: {
    color: GREEN,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 15,
  },

  description: {
    color: '#68736C',
    fontSize: 13,
    lineHeight: 22,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 19,
  },

  featureIcon: {
    width: 43,
    height: 43,
    backgroundColor: '#EAF2ED',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  featureTitle: {
    color: '#26352D',
    fontSize: 14,
    fontWeight: '700',
  },

  featureDescription: {
    color: '#89938D',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 17,
  },

  instructionRow: {
    flexDirection: 'row',
    marginBottom: 17,
    alignItems: 'flex-start',
  },

  number: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: '#EAF2ED',
    padding: 7,
    borderRadius: 8,
    marginRight: 12,
  },

  instructionText: {
    flex: 1,
    color: '#59665E',
    fontSize: 12,
    lineHeight: 20,
    paddingTop: 3,
  },

  securityCard: {
    backgroundColor: '#E8F1EB',
    marginHorizontal: 16,
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },

  securityTitle: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '800',
  },

  securityText: {
    color: '#64736A',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 5,
  },

  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  footerTitle: {
    color: GREEN,
    fontSize: 17,
    fontWeight: '800',
  },

  footerText: {
    color: '#89938D',
    fontSize: 11,
    marginTop: 5,
  },

  copyright: {
    color: '#A5ADA7',
    fontSize: 10,
    marginTop: 10,
  },
});
