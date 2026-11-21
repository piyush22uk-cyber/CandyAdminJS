import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function ManageAdminsScreen({ navigation }) {
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [popup, setPopup] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showPopup = (type, title, message) => {
    setPopup({
      visible: true,
      type,
      title,
      message,
    });
  };

  const handleCreateAdmin = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      showPopup('error', 'Missing Details', 'Please fill in all required fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showPopup('error', 'Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      showPopup('error', 'Weak Password', 'Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      showPopup('error', 'Password Mismatch', 'Both passwords must match.');
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('token');

      if (!token) {
        showPopup('error', 'Session Expired', 'Please login again.');
        return;
      }

      await api.post(
        '/auth/admin/create',
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      showPopup(
        'success',
        'Admin Created!',
        'The new Admin account has been successfully generated. It is now waiting for your approval.'
      );

    } catch (error) {
      showPopup(
        'error',
        'Creation Failed',
        error.response?.data?.message || 'Unable to create Admin account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    const wasSuccess = popup.type === 'success';

    setPopup({
      ...popup,
      visible: false,
    });

    if (wasSuccess) {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#26382D" />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Create Admin</Text>
            <Text style={styles.headerSubtitle}>
              Super Admin Management
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons name="shield-checkmark" size={23} color="" />
          </View>
        </View>

        {/* Intro */}
        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <Ionicons name="person-add" size={27} color="#183D32" />
          </View>

          <Text style={styles.introTitle}>Generate New Admin</Text>

          <Text style={styles.introDescription}>
            Create administrator credentials and control their access to the application.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Admin Information</Text>
          <Text style={styles.sectionSubtitle}>
            Enter the details for the new account.
          </Text>

          {/* Name */}
          <Text style={styles.label}>Full Name</Text>

          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={19} color="#829087" />

            <TextInput
              style={styles.input}
              placeholder="Enter admin name"
              placeholderTextColor="#9AA49E"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <Text style={styles.label}>Email Address</Text>

          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={19} color="#829087" />

            <TextInput
              style={styles.input}
              placeholder="admin@example.com"
              placeholderTextColor="#9AA49E"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password</Text>

          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={19} color="#829087" />

            <TextInput
              style={styles.input}
              placeholder="Create password"
              placeholderTextColor="#9AA49E"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>

          <View style={styles.inputBox}>
            <Ionicons name="shield-checkmark-outline" size={19} color="#829087" />

            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#9AA49E"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.hint}>
            Minimum password length: 6 characters
          </Text>

          {/* Button */}
          <TouchableOpacity
            style={[styles.createButton, loading && styles.disabledButton]}
            onPress={handleCreateAdmin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="person-add-outline" size={19} color="#FFFFFF" />
                <Text style={styles.buttonText}>Create Admin Account</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Approval Note */}
        <View style={styles.approvalBox}>
          <Ionicons name="information-circle-outline" size={21} color="#B17A20" />

          <View style={styles.approvalContent}>
            <Text style={styles.approvalTitle}>Approval Required</Text>
            <Text style={styles.approvalDescription}>
              Newly created Admin accounts require Super Admin approval and screen permissions.
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          CANDY ADMIN PANEL
        </Text>

      </ScrollView>

      {/* Custom Success / Error Popup */}
      <Modal
        visible={popup.visible}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.popupCard}>

            <View
              style={[
                styles.popupIcon,
                popup.type === 'success'
                  ? styles.successIcon
                  : styles.errorIcon,
              ]}
            >
              <Ionicons
                name={
                  popup.type === 'success'
                    ? 'checkmark-circle'
                    : 'close-circle'
                }
                size={43}
                color={popup.type === 'success' ? '#168344' : '#DC4B4B'}
              />
            </View>

            <Text style={styles.popupTitle}>
              {popup.title}
            </Text>

            <Text style={styles.popupMessage}>
              {popup.message}
            </Text>

            <TouchableOpacity
              style={[
                styles.popupButton,
                popup.type === 'success'
                  ? styles.successButton
                  : styles.errorButton,
              ]}
              onPress={closePopup}
              activeOpacity={0.85}
            >
              <Text style={styles.popupButtonText}>
                {popup.type === 'success' ? 'Continue' : 'Try Again'}
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F8F6',
  },

  container: {
    padding: 20,
    paddingTop: 35,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4EAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
    marginLeft: 13,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#203329',
  },

  headerSubtitle: {
    fontSize: 12,
    color: '#829087',
    marginTop: 3,
  },

  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#E6F4EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  intro: {
    alignItems: 'center',
    marginBottom: 25,
  },

  introIcon: {
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: '#E4F3E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  introTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#203329',
  },

  introDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: '#7D8981',
    textAlign: 'center',
    marginTop: 7,
    paddingHorizontal: 12,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8EDE9',
    elevation: 2,
    shadowColor: '#26352B',
    shadowOpacity: 0.05,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 3 },
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#203329',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#87928A',
    marginTop: 5,
    marginBottom: 23,
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#435349',
    marginBottom: 9,
  },

  inputBox: {
    height: 51,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E7E1',
    backgroundColor: '#FAFCFA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    marginBottom: 19,
  },

  input: {
    flex: 1,
    marginLeft: 11,
    color: '#26382D',
    fontSize: 13,
    paddingVertical: 10,
  },

  hint: {
    color: '#87928A',
    fontSize: 11,
    marginTop: -7,
    marginBottom: 20,
  },

  createButton: {
    height: 53,
    borderRadius: 11,
    backgroundColor: '#183D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 3,
    shadowColor: '#183D32',
    shadowOpacity: 0.18,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  approvalBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9EB',
    borderWidth: 1,
    borderColor: '#F2E5C7',
    borderRadius: 12,
    padding: 15,
    marginTop: 18,
  },

  approvalContent: {
    flex: 1,
    marginLeft: 10,
  },

  approvalTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8B641F',
  },

  approvalDescription: {
    fontSize: 11,
    color: '#8E805F',
    lineHeight: 18,
    marginTop: 4,
  },

  footer: {
    textAlign: 'center',
    color: '#A2ACA5',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 25,
  },

  // Popup styles

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 30, 22, 0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  popupCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 25,
    alignItems: 'center',
    elevation: 12,
  },

  popupIcon: {
    width: 78,
    height: 78,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  successIcon: {
    backgroundColor: '#E7F5EC',
  },

  errorIcon: {
    backgroundColor: '#FDECEC',
  },

  popupTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#24372B',
    textAlign: 'center',
  },

  popupMessage: {
    fontSize: 13,
    lineHeight: 21,
    color: '#78857C',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 24,
  },

  popupButton: {
    width: '100%',
    height: 49,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  successButton: {
    backgroundColor: '#168344',
  },

  errorButton: {
    backgroundColor: '#DC4B4B',
  },

  popupButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
