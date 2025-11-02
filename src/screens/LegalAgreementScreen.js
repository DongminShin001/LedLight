import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

const LEGAL_ACCEPTANCE_KEY = '@legal_acceptance_v1';

const LegalAgreementScreen = () => {
  const navigation = useNavigation();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasReadSafety, setHasReadSafety] = useState(false);
  const [hasReadLiability, setHasReadLiability] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  const handleScroll = ({nativeEvent}) => {
    if (isCloseToBottom(nativeEvent)) {
      setHasScrolledToBottom(true);
    }
  };

  const canAccept = hasScrolledToBottom && hasReadSafety && hasReadLiability && hasReadTerms;

  const handleAccept = async () => {
    if (!canAccept) {
      Alert.alert(
        'Please Review All Terms',
        'You must read and acknowledge all sections before accepting.',
      );
      return;
    }

    Alert.alert(
      'Final Confirmation',
      'By accepting, you acknowledge that:\n\n' +
        '• You are 18+ years old\n' +
        '• You will only use licensed electricians\n' +
        '• You accept ALL risks and liability\n' +
        '• The developers are NOT liable for ANY damages\n' +
        '• You waive the right to sue\n\n' +
        'Do you accept these terms?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'I Accept',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.setItem(
                LEGAL_ACCEPTANCE_KEY,
                JSON.stringify({
                  accepted: true,
                  timestamp: new Date().toISOString(),
                  version: '1.0',
                }),
              );
              navigation.replace('Home');
            } catch (error) {
              Alert.alert('Error', 'Failed to save acceptance. Please try again.');
            }
          },
        },
      ],
    );
  };

  const handleDecline = () => {
    Alert.alert(
      'Terms Declined',
      'You must accept the terms to use this app. The app will now close.',
      [
        {
          text: 'Exit App',
          onPress: () => {
            // On React Native, we can't programmatically close the app
            // but we can navigate to a "closed" state
            Alert.alert(
              'App Disabled',
              'Please uninstall the app if you do not accept the terms.',
            );
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#B71C1C" />
      
      <View style={styles.header}>
        <Icon name="warning" size={40} color="#FFD700" />
        <Text style={styles.headerTitle}>LEGAL AGREEMENT REQUIRED</Text>
        <Text style={styles.headerSubtitle}>Please read carefully before proceeding</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={400}>
        
        {/* CRITICAL WARNING */}
        <View style={styles.criticalWarning}>
          <Icon name="error" size={24} color="#FF0000" />
          <Text style={styles.criticalWarningText}>
            CRITICAL: This app controls electrical devices. Improper use can cause fire, injury, or death.
          </Text>
        </View>

        {/* MAIN TERMS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TERMS OF SERVICE</Text>
          <Text style={styles.sectionText}>
            BY USING THIS APP, YOU AGREE TO BE LEGALLY BOUND BY THESE TERMS.
          </Text>
        </View>

        {/* NO WARRANTY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. NO WARRANTY - USE AT YOUR OWN RISK</Text>
          <Text style={styles.sectionText}>
            THIS APP IS PROVIDED "AS IS" WITHOUT ANY WARRANTIES. YOU USE IT ENTIRELY AT YOUR OWN RISK.
            {'\n\n'}
            WE DO NOT GUARANTEE THE APP WILL BE ERROR-FREE, SECURE, OR WORK WITHOUT INTERRUPTION.
          </Text>
        </View>

        {/* LIABILITY LIMITATION */}
        <View style={[styles.section, styles.redSection]}>
          <Text style={[styles.sectionTitle, styles.redText]}>2. LIMITATION OF LIABILITY ⚠️</Text>
          <Text style={[styles.sectionText, styles.redText]}>
            THE DEVELOPERS ARE NOT LIABLE FOR ANY DAMAGES INCLUDING:
            {'\n\n'}
            • Property damage or fire{'\n'}
            • Personal injury or death{'\n'}
            • Electrical hazards{'\n'}
            • Device malfunctions{'\n'}
            • Loss of data or profits{'\n'}
            • Any other damages
            {'\n\n'}
            YOUR SOLE REMEDY IS TO STOP USING THE APP.
            {'\n\n'}
            MAXIMUM LIABILITY: $0 (FREE APP) OR $10 USD
          </Text>
          <TouchableOpacity
            style={[styles.checkbox, hasReadLiability && styles.checkboxChecked]}
            onPress={() => setHasReadLiability(!hasReadLiability)}>
            <Icon
              name={hasReadLiability ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={hasReadLiability ? '#4CAF50' : '#666'}
            />
            <Text style={styles.checkboxText}>I understand and accept these liability limits</Text>
          </TouchableOpacity>
        </View>

        {/* SAFETY WARNINGS */}
        <View style={[styles.section, styles.orangeSection]}>
          <Text style={[styles.sectionTitle, styles.orangeText]}>3. ELECTRICAL SAFETY ⚡</Text>
          <Text style={[styles.sectionText, styles.orangeText]}>
            YOU ACKNOWLEDGE THAT:
            {'\n\n'}
            • LED installations MUST be done by licensed electricians{'\n'}
            • Improper installation can cause FIRE, SHOCK, or DEATH{'\n'}
            • You are responsible for all electrical safety{'\n'}
            • You must follow all local electrical codes{'\n'}
            • This app does NOT replace professional expertise
            {'\n\n'}
            PROHIBITED USES:
            {'\n\n'}
            • Medical or life-support devices{'\n'}
            • Safety-critical systems{'\n'}
            • Any use where failure could cause injury{'\n'}
            • Illegal purposes or code violations
          </Text>
          <TouchableOpacity
            style={[styles.checkbox, hasReadSafety && styles.checkboxChecked]}
            onPress={() => setHasReadSafety(!hasReadSafety)}>
            <Icon
              name={hasReadSafety ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={hasReadSafety ? '#4CAF50' : '#666'}
            />
            <Text style={styles.checkboxText}>I understand these safety requirements</Text>
          </TouchableOpacity>
        </View>

        {/* USER RESPONSIBILITIES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. YOUR RESPONSIBILITIES</Text>
          <Text style={styles.sectionText}>
            YOU AGREE TO:
            {'\n\n'}
            • Be at least 18 years old{'\n'}
            • Use only compatible, properly-rated equipment{'\n'}
            • Follow all manufacturer instructions{'\n'}
            • Comply with all laws and regulations{'\n'}
            • Never exceed device ratings{'\n'}
            • Immediately disconnect power if issues occur{'\n'}
            • Maintain equipment properly{'\n'}
            • Not use for illegal purposes
          </Text>
        </View>

        {/* INDEMNIFICATION */}
        <View style={[styles.section, styles.yellowSection]}>
          <Text style={[styles.sectionTitle, styles.yellowText]}>5. YOU AGREE TO INDEMNIFY US</Text>
          <Text style={[styles.sectionText, styles.yellowText]}>
            YOU AGREE TO DEFEND, INDEMNIFY, AND HOLD US HARMLESS FROM:
            {'\n\n'}
            • Any claims or lawsuits arising from your use{'\n'}
            • Property damage or injuries you cause{'\n'}
            • Your violations of these terms{'\n'}
            • Your violations of any laws{'\n'}
            • Your negligence or misconduct{'\n'}
            • All legal fees and costs
            {'\n\n'}
            This means YOU are responsible, not us.
          </Text>
        </View>

        {/* DISPUTE RESOLUTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. DISPUTE RESOLUTION</Text>
          <Text style={styles.sectionText}>
            YOU AGREE THAT:
            {'\n\n'}
            • All disputes will be resolved by BINDING ARBITRATION{'\n'}
            • You WAIVE THE RIGHT to a jury trial{'\n'}
            • You WAIVE THE RIGHT to class action lawsuits{'\n'}
            • Governing law: [YOUR STATE/COUNTRY]{'\n'}
            • Each party pays their own legal costs
          </Text>
        </View>

        {/* PRIVACY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. PRIVACY & DATA</Text>
          <Text style={styles.sectionText}>
            • We collect minimal data for app functionality{'\n'}
            • Data is stored locally on your device{'\n'}
            • We do not sell your information{'\n'}
            • See our Privacy Policy for details{'\n'}
            • You are responsible for securing your device
          </Text>
        </View>

        {/* MODIFICATIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. MODIFICATIONS</Text>
          <Text style={styles.sectionText}>
            • We may update these terms at any time{'\n'}
            • Continued use means you accept changes{'\n'}
            • We may modify or discontinue the app{'\n'}
            • We may terminate your access for violations
          </Text>
        </View>

        {/* EMERGENCY SAFETY */}
        <View style={[styles.section, styles.redSection]}>
          <Text style={[styles.sectionTitle, styles.redText]}>🚨 EMERGENCY SAFETY NOTICE</Text>
          <Text style={[styles.sectionText, styles.redText]}>
            IMMEDIATELY DISCONNECT POWER IF:
            {'\n\n'}
            • Smoke or burning smell{'\n'}
            • Unusual heat{'\n'}
            • Sparking or arcing{'\n'}
            • Physical damage{'\n'}
            • Water exposure{'\n'}
            • Erratic behavior
            {'\n\n'}
            IN CASE OF FIRE: CALL 911 IMMEDIATELY
          </Text>
        </View>

        {/* FINAL ACKNOWLEDGMENT */}
        <View style={[styles.section, styles.finalSection]}>
          <Text style={styles.sectionTitle}>FINAL ACKNOWLEDGMENT</Text>
          <Text style={styles.sectionText}>
            By accepting, you confirm that:
            {'\n\n'}
            ✓ You have read and understood ALL terms above{'\n'}
            ✓ You are at least 18 years old{'\n'}
            ✓ You accept ALL risks of electrical device use{'\n'}
            ✓ You will use licensed electricians{'\n'}
            ✓ Developers have ZERO liability{'\n'}
            ✓ You waive the right to sue{'\n'}
            ✓ You accept binding arbitration{'\n'}
            ✓ You will use the app safely and legally
          </Text>
          <TouchableOpacity
            style={[styles.checkbox, hasReadTerms && styles.checkboxChecked]}
            onPress={() => setHasReadTerms(!hasReadTerms)}>
            <Icon
              name={hasReadTerms ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={hasReadTerms ? '#4CAF50' : '#666'}
            />
            <Text style={styles.checkboxText}>
              I have read and accept ALL terms above
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scroll indicator */}
        {!hasScrolledToBottom && (
          <View style={styles.scrollIndicator}>
            <Text style={styles.scrollIndicatorText}>
              ↓ Please scroll to read all terms ↓
            </Text>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.declineButton]}
          onPress={handleDecline}>
          <Text style={styles.buttonText}>I DECLINE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.acceptButton,
            !canAccept && styles.buttonDisabled,
          ]}
          onPress={handleAccept}
          disabled={!canAccept}>
          <Icon name="check-circle" size={20} color="#fff" />
          <Text style={styles.buttonText}>I ACCEPT</Text>
        </TouchableOpacity>
      </View>

      {/* Requirements checklist */}
      <View style={styles.requirements}>
        <Text style={styles.requirementsTitle}>Requirements to Accept:</Text>
        <View style={styles.requirementRow}>
          <Icon
            name={hasScrolledToBottom ? 'check-circle' : 'radio-button-unchecked'}
            size={16}
            color={hasScrolledToBottom ? '#4CAF50' : '#999'}
          />
          <Text style={styles.requirementText}>Scroll to read all terms</Text>
        </View>
        <View style={styles.requirementRow}>
          <Icon
            name={hasReadLiability ? 'check-circle' : 'radio-button-unchecked'}
            size={16}
            color={hasReadLiability ? '#4CAF50' : '#999'}
          />
          <Text style={styles.requirementText}>Accept liability limits</Text>
        </View>
        <View style={styles.requirementRow}>
          <Icon
            name={hasReadSafety ? 'check-circle' : 'radio-button-unchecked'}
            size={16}
            color={hasReadSafety ? '#4CAF50' : '#999'}
          />
          <Text style={styles.requirementText}>Understand safety requirements</Text>
        </View>
        <View style={styles.requirementRow}>
          <Icon
            name={hasReadTerms ? 'check-circle' : 'radio-button-unchecked'}
            size={16}
            color={hasReadTerms ? '#4CAF50' : '#999'}
          />
          <Text style={styles.requirementText}>Accept all terms</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: '#B71C1C',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
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
  criticalWarning: {
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  criticalWarningText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 10,
    flex: 1,
  },
  section: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  redSection: {
    backgroundColor: '#2a1515',
    borderColor: '#FF0000',
    borderWidth: 2,
  },
  orangeSection: {
    backgroundColor: '#2a2015',
    borderColor: '#FF9800',
    borderWidth: 2,
  },
  yellowSection: {
    backgroundColor: '#2a2615',
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  finalSection: {
    backgroundColor: '#152a15',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },
  redText: {
    color: '#FF6B6B',
  },
  orangeText: {
    color: '#FFB366',
  },
  yellowText: {
    color: '#FFE066',
  },
  sectionText: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  checkboxChecked: {
    backgroundColor: '#1a3a1a',
  },
  checkboxText: {
    fontSize: 13,
    color: '#fff',
    marginLeft: 10,
    flex: 1,
  },
  scrollIndicator: {
    backgroundColor: '#FFD700',
    padding: 10,
    borderRadius: 8,
    marginVertical: 20,
    alignItems: 'center',
  },
  scrollIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  spacer: {
    height: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  declineButton: {
    backgroundColor: '#666',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  buttonDisabled: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 5,
  },
  requirements: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 5,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  requirementText: {
    fontSize: 11,
    color: '#999',
    marginLeft: 8,
  },
});

export default LegalAgreementScreen;

// Helper function to check if user has accepted terms
export const checkLegalAcceptance = async () => {
  try {
    const acceptance = await AsyncStorage.getItem(LEGAL_ACCEPTANCE_KEY);
    if (acceptance) {
      const data = JSON.parse(acceptance);
      return data.accepted === true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

// Helper function to reset acceptance (for testing or new versions)
export const resetLegalAcceptance = async () => {
  try {
    await AsyncStorage.removeItem(LEGAL_ACCEPTANCE_KEY);
    return true;
  } catch (error) {
    return false;
  }
};
