import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SAFETY_DISCLAIMER_KEY = '@safety_disclaimer_shown';

/**
 * SafetyDisclaimer Component
 * Shows critical safety warnings before users can control LED devices
 * This provides additional legal protection by reminding users of risks
 */
const SafetyDisclaimer = ({visible, onAccept, onDecline, showEveryTime = false}) => {
  const [hasRead, setHasRead] = useState(false);
  const [isCloseToBottom, setIsCloseToBottom] = useState(false);

  const checkIfBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  const handleScroll = ({nativeEvent}) => {
    if (checkIfBottom(nativeEvent)) {
      setIsCloseToBottom(true);
    }
  };

  const handleAccept = async () => {
    if (!hasRead) {
      Alert.alert('Please Read', 'You must read and acknowledge the safety warnings.');
      return;
    }

    if (!showEveryTime) {
      try {
        await AsyncStorage.setItem(SAFETY_DISCLAIMER_KEY, 'true');
      } catch (error) {
        console.log('Failed to save disclaimer acceptance');
      }
    }

    onAccept();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onDecline}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="warning" size={40} color="#FFD700" />
          <Text style={styles.headerTitle}>SAFETY WARNING</Text>
          <Text style={styles.headerSubtitle}>
            Please read before controlling LED devices
          </Text>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={400}>
          
          {/* Critical Warning */}
          <View style={styles.criticalBox}>
            <Icon name="error" size={30} color="#FF0000" />
            <Text style={styles.criticalText}>
              CRITICAL: LED devices involve electricity. Improper use can cause fire, electric shock, injury, or death.
            </Text>
          </View>

          {/* Safety Requirements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ ELECTRICAL SAFETY REQUIREMENTS</Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                All electrical installations MUST be performed by licensed, qualified electricians
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Ensure all electrical work complies with local building and electrical codes
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Never exceed the voltage, current, or power ratings of your LED devices
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Use appropriate circuit breakers, fuses, and safety devices
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Regularly inspect all equipment for wear, damage, or overheating
              </Text>
            </View>
          </View>

          {/* Before Using */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✓ BEFORE USING THIS APP</Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Verify all LED devices are properly installed by professionals
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Confirm all connections are secure and properly rated
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Check that circuit breakers and safety devices are functioning
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Ensure your device's Bluetooth connection is secure
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Read all manufacturer instructions and warnings
              </Text>
            </View>
          </View>

          {/* Emergency Procedures */}
          <View style={[styles.section, styles.emergencySection]}>
            <Text style={[styles.sectionTitle, styles.emergencyTitle]}>
              🚨 EMERGENCY PROCEDURES
            </Text>
            <Text style={styles.emergencySubtitle}>
              IMMEDIATELY DISCONNECT POWER IF YOU NOTICE:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={[styles.bullet, styles.emergencyBullet]}>▶</Text>
              <Text style={[styles.bulletText, styles.emergencyText]}>
                Smoke, burning smell, or visible fire
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={[styles.bullet, styles.emergencyBullet]}>▶</Text>
              <Text style={[styles.bulletText, styles.emergencyText]}>
                Unusual heat from devices or wiring
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={[styles.bullet, styles.emergencyBullet]}>▶</Text>
              <Text style={[styles.bulletText, styles.emergencyText]}>
                Sparking, arcing, or unusual sounds
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={[styles.bullet, styles.emergencyBullet]}>▶</Text>
              <Text style={[styles.bulletText, styles.emergencyText]}>
                Physical damage to equipment
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={[styles.bullet, styles.emergencyBullet]}>▶</Text>
              <Text style={[styles.bulletText, styles.emergencyText]}>
                Water exposure to electrical components
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={[styles.bullet, styles.emergencyBullet]}>▶</Text>
              <Text style={[styles.bulletText, styles.emergencyText]}>
                Flickering, erratic behavior, or unexpected shutoffs
              </Text>
            </View>
            <View style={styles.emergencyCall}>
              <Text style={styles.emergencyCallText}>
                IN CASE OF FIRE OR SERIOUS EMERGENCY:{'\n'}CALL 911 IMMEDIATELY
              </Text>
            </View>
          </View>

          {/* Liability Reminder */}
          <View style={[styles.section, styles.liabilitySection]}>
            <Text style={[styles.sectionTitle, styles.liabilityTitle]}>
              ⚠️ LIABILITY REMINDER
            </Text>
            <Text style={styles.liabilityText}>
              By using this app, you acknowledge that:
              {'\n\n'}
              • You accept ALL risks associated with LED device control
              {'\n'}
              • The app developers are NOT responsible for any damages, injuries, or losses
              {'\n'}
              • You are solely responsible for proper installation and safe operation
              {'\n'}
              • You will use licensed professionals for all electrical work
              {'\n'}
              • You have read and accepted the full Terms of Service
              {'\n\n'}
              <Text style={styles.liabilityBold}>
                THE DEVELOPERS HAVE ZERO LIABILITY FOR ANY DAMAGES OR INJURIES.
              </Text>
            </Text>
          </View>

          {/* Best Practices */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 BEST PRACTICES</Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Start with low brightness and gradually increase
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Monitor devices during initial testing
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Keep fire extinguishers accessible
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Never leave operating devices unattended initially
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Maintain proper ventilation around LED controllers
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Document your installation for future reference
              </Text>
            </View>
          </View>

          {/* Prohibited Uses */}
          <View style={[styles.section, styles.prohibitedSection]}>
            <Text style={[styles.sectionTitle, styles.prohibitedTitle]}>
              🚫 PROHIBITED USES
            </Text>
            <Text style={styles.prohibitedSubtitle}>
              DO NOT USE THIS APP FOR:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={[styles.bullet, styles.prohibitedBullet]}>✖</Text>
              <Text style={[styles.bulletText, styles.prohibitedText]}>
                Medical devices or life-support systems
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={[styles.bullet, styles.prohibitedBullet]}>✖</Text>
              <Text style={[styles.bulletText, styles.prohibitedText]}>
                Safety-critical applications (exit signs, emergency lighting)
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={[styles.bullet, styles.prohibitedBullet]}>✖</Text>
              <Text style={[styles.bulletText, styles.prohibitedText]}>
                Installations where failure could cause injury or death
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={[styles.bullet, styles.prohibitedBullet]}>✖</Text>
              <Text style={[styles.bulletText, styles.prohibitedText]}>
                Illegal purposes or violations of electrical codes
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={[styles.bullet, styles.prohibitedBullet]}>✖</Text>
              <Text style={[styles.bulletText, styles.prohibitedText]}>
                Installations not approved by licensed electricians
              </Text>
            </View>
          </View>

          {/* Acknowledgment */}
          <View style={[styles.section, styles.acknowledgmentSection]}>
            <Text style={[styles.sectionTitle, styles.acknowledgmentTitle]}>
              ✓ ACKNOWLEDGMENT
            </Text>
            <Text style={styles.acknowledgmentText}>
              By clicking "I Understand" below, you confirm that:
              {'\n\n'}
              ✓ You have read and understood all safety warnings above
              {'\n'}
              ✓ Your LED installation was done by licensed professionals
              {'\n'}
              ✓ You will follow all safety guidelines and best practices
              {'\n'}
              ✓ You accept all risks and take full responsibility
              {'\n'}
              ✓ You will immediately disconnect power if issues occur
              {'\n'}
              ✓ The app developers have zero liability
            </Text>
          </View>

          {!isCloseToBottom && (
            <View style={styles.scrollPrompt}>
              <Text style={styles.scrollPromptText}>↓ Scroll to read all warnings ↓</Text>
            </View>
          )}

          <View style={styles.spacer} />
        </ScrollView>

        {/* Acceptance Checkbox */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setHasRead(!hasRead)}>
            <Icon
              name={hasRead ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={hasRead ? '#4CAF50' : '#666'}
            />
            <Text style={styles.checkboxText}>
              I have read and understand all safety warnings above
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
            <Text style={styles.declineButtonText}>Go Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.acceptButton, !hasRead && styles.buttonDisabled]}
            onPress={handleAccept}
            disabled={!hasRead}>
            <Icon name="check-circle" size={20} color="#fff" />
            <Text style={styles.acceptButtonText}>I Understand</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Helper to check if disclaimer should be shown
export const shouldShowDisclaimer = async () => {
  try {
    const shown = await AsyncStorage.getItem(SAFETY_DISCLAIMER_KEY);
    return shown !== 'true';
  } catch (error) {
    return true; // Show by default if can't check
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: '#B71C1C',
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFD700',
    marginTop: 5,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  criticalBox: {
    backgroundColor: '#FF0000',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  criticalText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 15,
    flex: 1,
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  emergencySection: {
    backgroundColor: '#2a1515',
    borderColor: '#FF0000',
    borderWidth: 2,
  },
  liabilitySection: {
    backgroundColor: '#2a2015',
    borderColor: '#FF9800',
    borderWidth: 2,
  },
  prohibitedSection: {
    backgroundColor: '#2a1a1a',
    borderColor: '#FF5252',
    borderWidth: 2,
  },
  acknowledgmentSection: {
    backgroundColor: '#152a15',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  emergencyTitle: {
    color: '#FF6B6B',
  },
  liabilityTitle: {
    color: '#FFB366',
  },
  prohibitedTitle: {
    color: '#FF6B6B',
  },
  acknowledgmentTitle: {
    color: '#66FF66',
  },
  emergencySubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 10,
  },
  prohibitedSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 10,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#FFD700',
    marginRight: 10,
    marginTop: 2,
  },
  emergencyBullet: {
    color: '#FF0000',
  },
  prohibitedBullet: {
    color: '#FF0000',
    fontSize: 16,
  },
  bulletText: {
    fontSize: 13,
    color: '#ccc',
    flex: 1,
    lineHeight: 20,
  },
  emergencyText: {
    color: '#FFB6B6',
    fontWeight: '500',
  },
  prohibitedText: {
    color: '#FFB6B6',
  },
  emergencyCall: {
    backgroundColor: '#FF0000',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  emergencyCallText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  liabilityText: {
    fontSize: 13,
    color: '#FFD699',
    lineHeight: 20,
  },
  liabilityBold: {
    fontWeight: '700',
    color: '#FF9800',
  },
  acknowledgmentText: {
    fontSize: 13,
    color: '#B6FFB6',
    lineHeight: 20,
  },
  scrollPrompt: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 8,
    marginVertical: 15,
    alignItems: 'center',
  },
  scrollPromptText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  spacer: {
    height: 20,
  },
  checkboxContainer: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#333',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  checkboxText: {
    fontSize: 13,
    color: '#fff',
    marginLeft: 10,
    flex: 1,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#1a1a1a',
  },
  declineButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#666',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor: '#4CAF50',
  },
  buttonDisabled: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
});

export default SafetyDisclaimer;

