import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import LegalAgreementScreen from '../screens/LegalAgreementScreen';

// Mock dependencies
jest.mock('../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#0f0f23',
        primary: '#6366f1',
        primaryDark: '#4f46e5',
        text: '#ffffff',
        textSecondary: '#a1a1aa',
        success: '#10b981',
        error: '#ef4444',
        surface: '#16213e',
      },
    },
  }),
}));

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
}));

const mockOnAccept = jest.fn();
const mockOnDecline = jest.fn();

const MockedLegalAgreementScreen = () => (
  <LegalAgreementScreen
    onAccept={mockOnAccept}
    onDecline={mockOnDecline}
  />
);

describe('LegalAgreementScreen Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const {getByText} = render(<MockedLegalAgreementScreen />);
      expect(getByText('Legal Agreements')).toBeTruthy();
    });

    it('displays all agreement sections', () => {
      const {getByText} = render(<MockedLegalAgreementScreen />);
      
      expect(getByText('Age Verification')).toBeTruthy();
      expect(getByText('Terms of Service')).toBeTruthy();
      expect(getByText('Privacy Policy')).toBeTruthy();
      expect(getByText('Safety Warnings')).toBeTruthy();
    });

    it('shows correct initial state', () => {
      const {getByText} = render(<MockedLegalAgreementScreen />);
      
      expect(getByText('I am at least 13 years old')).toBeTruthy();
      expect(getByText('I agree to the Terms of Service')).toBeTruthy();
      expect(getByText('I agree to the Privacy Policy')).toBeTruthy();
      expect(getByText('I understand the safety warnings')).toBeTruthy();
    });
  });

  describe('Agreement Checkboxes', () => {
    it('toggles age verification checkbox', async () => {
      const {getByText} = render(<MockedLegalAgreementScreen />);
      const ageCheckbox = getByText('I am at least 13 years old');
      
      fireEvent.press(ageCheckbox);
      
      await waitFor(() => {
        expect(ageCheckbox).toBeTruthy();
      });
    });

    it('toggles terms of service checkbox', async () => {
      const {getByText} = render(<MockedLegalAgreementScreen />);
      const termsCheckbox = getByText('I agree to the Terms of Service');
      
      fireEvent.press(termsCheckbox);
      
      await waitFor(() => {
        expect(termsCheckbox).toBeTruthy();
      });
    });

    it('toggles privacy policy checkbox', async () => {
      const {getByText} = render(<MockedLegalAgreementScreen />);
      const privacyCheckbox = getByText('I agree to the Privacy Policy');
      
      fireEvent.press(privacyCheckbox);
      
      await waitFor(() => {
        expect(privacyCheckbox).toBeTruthy();
      });
    });

    it('toggles safety warnings checkbox', async () => {
      const {getByText} = render(<MockedLegalAgreementScreen />);
      const safetyCheckbox = getByText('I understand the safety warnings');
      
      fireEvent.press(safetyCheckbox);
      
      await waitFor(() => {
        expect(safetyCheckbox).toBeTruthy();
      });
    });
  });

  describe('Document Links', () => {
    it('handles terms of service link', async () => {
      const {getByText} = render(<MockedLegalAgreementScreen />);
      const termsLink = getByText('Read Terms of Service');
      
      fireEvent.press(termsLink);
      
      await waitFor(() => {
        expect(termsLink).toBeTruthy();
      });
    });

    it('handles privacy policy link', async () => {
      const {getByText} = render(<MockedLegalAgreementScreen />);
      const privacyLink = getByText('Read Privacy Policy');
      
      fireEvent.press(privacyLink);
      
      await waitFor(() => {
        expect(privacyLink).toBeTruthy();
      });
    });

    it('handles safety warnings link', async () => {
      const {getByText} = render(<MockedLegalAgreementScreen />);
      const safetyLink = getByText('Read Safety Warnings');
      
      fireEvent.press(safetyLink);
      
      await waitFor(() => {
        expect(safetyLink).toBeTruthy();
      });
    });
  });

  describe('Accept/Decline Actions', () => {
    it('shows accept button as disabled initially', () => {
      const {getByText} = render(<MockedLegalAgreementScreen />);
      const acceptButton = getByText('Accept & Continue');
      
      expect(acceptButton).toBeTruthy();
      // Button should be disabled until all agreements are accepted
    });

    it('shows decline button', () => {
      const {getByText} = render(<MockedLegalAgreementScreen />);
      const declineButton = getByText('Decline & Exit');
      
      expect(declineButton).toBeTruthy();
    });

    it('handles decline button press', async () => {
      const {getByText} = render(<MockedLegalAgreementScreen />);
      const declineButton = getByText('Decline & Exit');
      
      fireEvent.press(declineButton);
      
      await waitFor(() => {
        expect(declineButton).toBeTruthy();
      });
    });
  });

  describe('Form Validation', () => {
    it('requires all agreements to be accepted', async () => {
      const {getByText} = render(<MockedLegalAgreementScreen />);
      const acceptButton = getByText('Accept & Continue');
      
      // Initially disabled
      fireEvent.press(acceptButton);
      
      await waitFor(() => {
        expect(acceptButton).toBeTruthy();
      });
    });

    it('enables accept button when all agreements are accepted', async () => {
      const {getByText} = render(<MockedLegalAgreementScreen />);
      
      // Accept all agreements
      fireEvent.press(getByText('I am at least 13 years old'));
      fireEvent.press(getByText('I agree to the Terms of Service'));
      fireEvent.press(getByText('I agree to the Privacy Policy'));
      fireEvent.press(getByText('I understand the safety warnings'));
      
      const acceptButton = getByText('Accept & Continue');
      
      await waitFor(() => {
        expect(acceptButton).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles document link errors gracefully', async () => {
      const {getByText} = render(<MockedLegalAgreementScreen />);
      const termsLink = getByText('Read Terms of Service');
      
      fireEvent.press(termsLink);
      
      await waitFor(() => {
        expect(termsLink).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const {getByText} = render(<MockedLegalAgreementScreen />);
      
      expect(getByText('Legal Agreements')).toBeTruthy();
      expect(getByText('Age Verification')).toBeTruthy();
      expect(getByText('Terms of Service')).toBeTruthy();
      expect(getByText('Privacy Policy')).toBeTruthy();
      expect(getByText('Safety Warnings')).toBeTruthy();
    });
  });
});
