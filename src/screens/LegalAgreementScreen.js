import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../hooks/useTheme';
import logger from '../utils/Logger';

const {width, height} = Dimensions.get('window');

const LegalAgreementScreen = ({navigation, onAccept, onDecline}) => {
  const {theme} = useTheme();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToSafety, setAgreedToSafety] = useState(false);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    setCanProceed(agreedToTerms && agreedToPrivacy && agreedToSafety && isAgeVerified);
  }, [agreedToTerms, agreedToPrivacy, agreedToSafety, isAgeVerified]);

  const handleAccept = () => {
    if (!canProceed) {
      Alert.alert(
        'Agreement Required',
        'Please read and accept all agreements to continue.',
        [{text: 'OK'}]
      );
      return;
    }

    logger.info('User accepted all legal agreements');
    if (onAccept) {
      onAccept({
        termsAccepted: agreedToTerms,
        privacyAccepted: agreedToPrivacy,
        safetyAccepted: agreedToSafety,
        ageVerified: isAgeVerified,
        timestamp: Date.now(),
      });
    }
  };

  const handleDecline = () => {
    Alert.alert(
      'Agreement Required',
      'You must accept the agreements to use this app. Would you like to exit?',
      [
        {text: 'Stay', style: 'cancel'},
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            logger.info('User declined legal agreements');
            if (onDecline) onDecline();
          },
        },
      ]
    );
  };

  const openDocument = (documentType) => {
    const urls = {
      terms: 'https://smartledcontroller.com/legal/terms',
      privacy: 'https://smartledcontroller.com/legal/privacy',
      safety: 'https://smartledcontroller.com/legal/safety',
    };

    Linking.openURL(urls[documentType]).catch((error) => {
      logger.error('Failed to open document', error);
      Alert.alert('Error', 'Unable to open document. Please check your internet connection.');
    });
  };

  const AgreementCheckbox = ({checked, onPress, title, description}) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Icon name="check" size={20} color="#fff" />}
      </View>
      <View style={styles.checkboxText}>
        <Text style={[styles.checkboxTitle, {color: theme.colors.text}]}>
          {title}
        </Text>
        <Text style={[styles.checkboxDescription, {color: theme.colors.textSecondary}]}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const DocumentLink = ({title, onPress}) => (
    <TouchableOpacity style={styles.documentLink} onPress={onPress}>
      <Text style={[styles.documentLinkText, {color: theme.colors.primary}]}>
        {title}
      </Text>
      <Icon name="open-in-new" size={16} color={theme.colors.primary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="gavel" size={48} color={theme.colors.primary} />
          <Text style={[styles.title, {color: theme.colors.text}]}>
            Legal Agreements
          </Text>
          <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
            Please read and accept the following agreements to use SmartLED Controller
          </Text>
        </View>

        {/* Age Verification */}
        <View style={[styles.section, {backgroundColor: theme.colors.surface}]}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Age Verification
          </Text>
          <Text style={[styles.sectionDescription, {color: theme.colors.textSecondary}]}>
            You must be at least 13 years old to use this app. Users under 18 should have parental supervision.
          </Text>
          <AgreementCheckbox
            checked={isAgeVerified}
            onPress={() => setIsAgeVerified(!isAgeVerified)}
            title="I am at least 13 years old"
            description="I confirm that I meet the age requirements to use this app"
          />
        </View>

        {/* Terms of Service */}
        <View style={[styles.section, {backgroundColor: theme.colors.surface}]}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Terms of Service
          </Text>
          <Text style={[styles.sectionDescription, {color: theme.colors.textSecondary}]}>
            Our terms of service outline your rights and responsibilities when using the app.
          </Text>
          <DocumentLink
            title="Read Terms of Service"
            onPress={() => openDocument('terms')}
          />
          <AgreementCheckbox
            checked={agreedToTerms}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            title="I agree to the Terms of Service"
            description="I have read and agree to be bound by the terms of service"
          />
        </View>

        {/* Privacy Policy */}
        <View style={[styles.section, {backgroundColor: theme.colors.surface}]}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Privacy Policy
          </Text>
          <Text style={[styles.sectionDescription, {color: theme.colors.textSecondary}]}>
            Our privacy policy explains how we collect, use, and protect your information.
          </Text>
          <DocumentLink
            title="Read Privacy Policy"
            onPress={() => openDocument('privacy')}
          />
          <AgreementCheckbox
            checked={agreedToPrivacy}
            onPress={() => setAgreedToPrivacy(!agreedToPrivacy)}
            title="I agree to the Privacy Policy"
            description="I understand how my data will be collected and used"
          />
        </View>

        {/* Safety Warnings */}
        <View style={[styles.section, {backgroundColor: theme.colors.surface}]}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Safety Warnings
          </Text>
          <Text style={[styles.sectionDescription, {color: theme.colors.textSecondary}]}>
            Important safety information about using LED devices and this app.
          </Text>
          <DocumentLink
            title="Read Safety Warnings"
            onPress={() => openDocument('safety')}
          />
          <AgreementCheckbox
            checked={agreedToSafety}
            onPress={() => setAgreedToSafety(!agreedToSafety)}
            title="I understand the safety warnings"
            description="I have read and understand the safety warnings and risks"
          />
        </View>

        {/* Important Notice */}
        <View style={[styles.noticeSection, {backgroundColor: theme.colors.warning + '20'}]}>
          <Icon name="warning" size={24} color={theme.colors.warning} />
          <Text style={[styles.noticeText, {color: theme.colors.text}]}>
            By accepting these agreements, you acknowledge that you understand the risks associated with LED devices and agree to use this app responsibly and safely.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionContainer, {backgroundColor: theme.colors.surface}]}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.declineButton,
            {backgroundColor: theme.colors.error + '20'},
          ]}
          onPress={handleDecline}>
          <Text style={[styles.buttonText, {color: theme.colors.error}]}>
            Decline & Exit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.acceptButton,
            {
              backgroundColor: canProceed ? theme.colors.primary : theme.colors.textMuted,
            },
          ]}
          onPress={handleAccept}
          disabled={!canProceed}>
          <Text style={[styles.buttonText, {color: '#fff'}]}>
            Accept & Continue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  documentLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  documentLinkText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#00ff88',
    borderColor: '#00ff88',
  },
  checkboxText: {
    flex: 1,
  },
  checkboxTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  checkboxDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  noticeSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  declineButton: {
    borderWidth: 2,
    borderColor: '#ff4444',
  },
  acceptButton: {
    // Dynamic styling applied in component
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default LegalAgreementScreen;
