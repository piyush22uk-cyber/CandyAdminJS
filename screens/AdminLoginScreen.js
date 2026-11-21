
import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../services/api';

import { registerAdminPushNotifications } from '../utils/notification';

export default function AdminLoginScreen({ navigation }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {

    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/auth/admin-login', {
        email: email.trim().toLowerCase(),
        password: password,
      });

      const { token, user } = response.data;

      if (!token || !user) {
        Alert.alert('Error', 'Invalid server response.');
        return;
      }

      if (user.role !== 'admin') {
        Alert.alert(
          'Access Denied',
          'Only Admin can login here.'
        );
        return;
      }

      await AsyncStorage.multiSet([
        ['token', token],
        ['user', JSON.stringify(user)],
      ]);

      await registerAdminPushNotifications(token);

      navigation.replace('AdminTabs');

    } catch (error) {

      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'Something went wrong.'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar backgroundColor="#10251D" barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >

        <Text style={styles.logo}>CANDY</Text>
        <Text style={styles.subtitle}>MANAGEMENT PORTAL</Text>

        <Text style={styles.heading}>Welcome Back</Text>
        <Text style={styles.description}>
          Login to your Admin account
        </Text>

        <View style={styles.switchRow}>

          <TouchableOpacity
            style={styles.inactiveButton}
            onPress={() => navigation.navigate('SuperAdminLoginScreen')}
          >
            <Text style={styles.inactiveText}>Super Admin</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.activeButton}
            onPress={() => navigation.navigate('AdminLogin')}
          >
            <Text style={styles.activeText}>Admin</Text>
          </TouchableOpacity>

        </View>

        <View style={styles.card}>

          <Text style={styles.cardTitle}>Admin Login</Text>

          <Text style={styles.label}>Email Address</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>

          <View style={styles.passwordBox}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginText}>LOGIN</Text>
            )}
          </TouchableOpacity>

        </View>

        <Text style={styles.footer}>
          CandyApp Management System
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#10251D',
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
  },

  logo: {
    color: '#8FE0B4',
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 5,
  },

  subtitle: {
    color: '#AAB8AF',
    textAlign: 'center',
    fontSize: 11,
    letterSpacing: 3,
    marginTop: 6,
  },

  heading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
  },

  description: {
    color: '#B8C8BF',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 25,
  },

  switchRow: {
    flexDirection: 'row',
    backgroundColor: '#243A30',
    padding: 5,
    borderRadius: 12,
    marginBottom: 22,
  },

  activeButton: {
    flex: 1,
    backgroundColor: '#168344',
    padding: 14,
    borderRadius: 9,
    alignItems: 'center',
  },

  inactiveButton: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
  },

  activeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  inactiveText: {
    color: '#B8C8BF',
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 23,
    borderRadius: 20,
  },

  cardTitle: {
    color: '#183C29',
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  label: {
    color: '#263C30',
    fontWeight: 'bold',
    marginTop: 13,
    marginBottom: 8,
  },

  input: {
    height: 52,
    backgroundColor: '#F2F5F2',
    borderRadius: 10,
    paddingHorizontal: 14,
    color: '#222',
    borderWidth: 1,
    borderColor: '#E1E8E1',
  },

  passwordBox: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F5F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1E8E1',
    paddingHorizontal: 12,
  },

  passwordInput: {
    flex: 1,
    color: '#222',
  },

  showText: {
    color: '#168344',
    fontWeight: 'bold',
    padding: 5,
  },

  loginButton: {
    backgroundColor: '#168344',
    padding: 16,
    borderRadius: 10,
    marginTop: 28,
    alignItems: 'center',
  },

  loginText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },

  footer: {
    color: '#91A69A',
    textAlign: 'center',
    marginTop: 28,
    fontSize: 12,
  },

});
