
import { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';

import api from '../services/api';

export default function NotificationsScreen() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState('success');
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');

  // Show success or error popup
  const showPopup = (type, heading, text) => {
    setPopupType(type);
    setPopupTitle(heading);
    setPopupMessage(text);
    setPopupVisible(true);
  };

  // Close popup
  const closePopup = () => {
    setPopupVisible(false);
  };

  // Send notification to customer devices
  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      showPopup(
        'error',
        'Missing Information',
        'Please enter both notification title and message.'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/notifications/send', {
        title: title.trim(),
        message: message.trim(),
      });

      const result = response.data;

      setTitle('');
      setMessage('');

      showPopup(
        'success',
        'Notification Submitted!',
        `Accepted by Expo: ${result.acceptedByExpo || 0}\nFailed: ${result.failed || 0}\nTotal Tokens: ${result.totalTokens || 0}`
      );

    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Unable to send notification. Please try again.';

      showPopup(
        'error',
        'Sending Failed',
        errorMessage
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <View style={styles.header}>

          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerSmall}>
                CANDYAPP ADMIN
              </Text>

              <Text style={styles.headerTitle}>
                Broadcast Center
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Text style={styles.bellIcon}>N</Text>
            </View>
          </View>

          <Text style={styles.headerDescription}>
            Keep your customers informed with updates,
            announcements and special offers.
          </Text>

          <View style={styles.headerTag}>
            <View style={styles.onlineDot} />

            <Text style={styles.headerTagText}>
              CUSTOMER NOTIFICATIONS
            </Text>
          </View>

        </View>

        {/* Main Content */}
        <View style={styles.content}>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>
              Create Notification
            </Text>

            <Text style={styles.sectionSubtitle}>
              Compose your message below
            </Text>
          </View>

          {/* Notification Form */}
          <View style={styles.card}>

            <Text style={styles.label}>
              Notification Title
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Example: Fresh products are here!"
              placeholderTextColor="#A0AAA3"
              value={title}
              onChangeText={setTitle}
              maxLength={80}
              editable={!loading}
            />

            <Text style={styles.counter}>
              {title.length}/80
            </Text>

            <Text style={styles.label}>
              Message
            </Text>

            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Write something useful for your customers..."
              placeholderTextColor="#A0AAA3"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={300}
              textAlignVertical="top"
              editable={!loading}
            />

            <Text style={styles.counter}>
              {message.length}/300
            </Text>

            {/* Live Preview */}
            <View style={styles.previewSection}>

              <Text style={styles.previewLabel}>
                LIVE PREVIEW
              </Text>

              <View style={styles.previewCard}>

                <View style={styles.previewIcon}>
                  <Text style={styles.previewIconText}>
                    C
                  </Text>
                </View>

                <View style={styles.previewContent}>

                  <Text style={styles.previewTitle}>
                    {title.trim() || 'Your notification title'}
                  </Text>

                  <Text style={styles.previewMessage}>
                    {message.trim() || 'Your notification message will appear here.'}
                  </Text>

                  <Text style={styles.previewTime}>
                    CANDYAPP · NOW
                  </Text>

                </View>
              </View>
            </View>

            {/* Send Button */}
            <Pressable
              style={({ pressed }) => [
                styles.sendButton,
                pressed && !loading && styles.buttonPressed,
                loading && styles.disabledButton,
              ]}
              onPress={handleSendNotification}
              disabled={loading}
            >

              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.sendButtonText}>
                  Send Notification  →
                </Text>
              )}

            </Pressable>

            <Text style={styles.helperText}>
              Your message will be submitted to the backend
              for delivery to eligible customer devices.
            </Text>

          </View>

          {/* Information Card */}
          <View style={styles.infoCard}>

            <Text style={styles.infoTitle}>
              Before You Send
            </Text>

            <Text style={styles.infoText}>
              • Keep your message short and clear.
            </Text>

            <Text style={styles.infoText}>
              • Check the preview before sending.
            </Text>

            <Text style={styles.infoText}>
              • Only eligible devices with valid push tokens
              can receive notifications.
            </Text>

          </View>

        </View>

      </ScrollView>

      {/* Custom Popup */}
      <Modal
        visible={popupVisible}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >

        <View style={styles.popupBackground}>

          <View style={styles.popupCard}>

            <View
              style={[
                styles.popupIcon,
                popupType === 'success'
                  ? styles.successIcon
                  : styles.errorIcon,
              ]}
            >

              <Text style={styles.popupIconText}>
                {popupType === 'success' ? '✓' : '!'}
              </Text>

            </View>

            <Text style={styles.popupTitle}>
              {popupTitle}
            </Text>

            <Text style={styles.popupMessage}>
              {popupMessage}
            </Text>

            <Pressable
              style={[
                styles.popupButton,
                popupType === 'success'
                  ? styles.successButton
                  : styles.errorButton,
              ]}
              onPress={closePopup}
            >

              <Text style={styles.popupButtonText}>
                Okay
              </Text>

            </Pressable>

          </View>

        </View>

      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: '#F4F7F2',
    marginBottom:80,
  },

  container: {
    paddingBottom: 80,
  },

  // Header
  header: {
    backgroundColor: '#123D2B',
    paddingTop: 55,
    paddingHorizontal: 22,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerSmall: {
    color: '#A6C7B1',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '800',
    marginTop: 8,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#24563E',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bellIcon: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },

  headerDescription: {
    color: '#C4D7CA',
    fontSize: 13,
    lineHeight: 21,
    marginTop: 18,
    maxWidth: 290,
  },

  headerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#24563E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 20,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#8FE0A9',
    marginRight: 8,
  },

  headerTagText: {
    color: '#D8E9DD',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Content
  content: {
    paddingHorizontal: 18,
    paddingTop: 25,
  },

  sectionHeading: {
    marginBottom: 17,
  },

  sectionTitle: {
    color: '#183A29',
    fontSize: 21,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: '#849087',
    fontSize: 13,
    marginTop: 5,
  },

  // Form Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    elevation: 3,
    shadowColor: '#173D29',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  label: {
    color: '#294334',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 9,
    marginTop: 12,
  },

  input: {
    backgroundColor: '#F7F9F6',
    borderWidth: 1,
    borderColor: '#E5EBE5',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 13,
    fontSize: 14,
    color: '#263B2D',
  },

  messageInput: {
    minHeight: 125,
    paddingTop: 14,
  },

  counter: {
    color: '#A0AAA3',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 6,
  },

  // Preview
  previewSection: {
    marginTop: 23,
  },

  previewLabel: {
    color: '#87958B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  previewCard: {
    backgroundColor: '#F4F8F3',
    borderWidth: 1,
    borderColor: '#E5EDE4',
    borderRadius: 14,
    padding: 13,
    flexDirection: 'row',
  },

  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1B7044',
    alignItems: 'center',
    justifyContent: 'center',
  },

  previewIconText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },

  previewContent: {
    flex: 1,
    marginLeft: 11,
  },

  previewTitle: {
    color: '#203A2A',
    fontSize: 13,
    fontWeight: '800',
  },

  previewMessage: {
    color: '#647369',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  previewTime: {
    color: '#91A096',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 9,
  },

  // Send Button
  sendButton: {
    backgroundColor: '#167345',
    borderRadius: 13,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 23,
  },

  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  buttonPressed: {
    opacity: 0.85,
  },

  disabledButton: {
    opacity: 0.6,
  },

  helperText: {
    color: '#929D95',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 13,
  },

  // Information
  infoCard: {
    backgroundColor: '#EAF2E9',
    borderRadius: 16,
    padding: 17,
    marginTop: 18,
  },

  infoTitle: {
    color: '#244A33',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },

  infoText: {
    color: '#65796A',
    fontSize: 12,
    lineHeight: 20,
    marginTop: 3,
  },

  // Popup
  popupBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
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
    elevation: 10,
  },

  popupIcon: {
    width: 65,
    height: 65,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  successIcon: {
    backgroundColor: '#E4F4E9',
  },

  errorIcon: {
    backgroundColor: '#FCE8E6',
  },

  popupIconText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#167345',
  },

  popupTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#183A29',
    textAlign: 'center',
  },

  popupMessage: {
    fontSize: 13,
    color: '#69776E',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 12,
  },

  popupButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 23,
  },

  successButton: {
    backgroundColor: '#167345',
  },

  errorButton: {
    backgroundColor: '#B94343',
  },

  popupButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

});
