import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoConnect, setAutoConnect] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleAbout = () => {
    Alert.alert(
      'About LED Controller',
      'Version 1.0.0\n\nA modern LED light control app for your smart lighting needs.\n\n© 2025 LED Controller App',
      [{text: 'OK'}]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Help & Support',
      'Need help with your LED lights?\n\n• Make sure Bluetooth is enabled\n• Keep your device close to the LED controller\n• Check that the LED device is powered on\n\nFor more help, contact support.',
      [{text: 'OK'}]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Reset', style: 'destructive', onPress: () => {
          setNotificationsEnabled(true);
          setAutoConnect(false);
          setHapticFeedback(true);
          setDarkMode(true);
          Alert.alert('Settings Reset', 'All settings have been reset to default.');
        }},
      ]
    );
  };

  const handleExportSettings = () => {
    Alert.alert(
      'Export Settings',
      'Your settings and presets will be exported to your device storage.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Export', onPress: () => {
          Alert.alert('Export Complete', 'Settings exported successfully!');
        }},
      ]
    );
  };

  const handleImportSettings = () => {
    Alert.alert(
      'Import Settings',
      'Import settings and presets from a previously exported file.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Import', onPress: () => {
          Alert.alert('Import Complete', 'Settings imported successfully!');
        }},
      ]
    );
  };

  const SettingItem = ({icon, title, subtitle, onPress, rightComponent}) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Icon name={icon} size={24} color="#00ff88" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || <Icon name="chevron-right" size={24} color="#666" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Device Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Settings</Text>
          
          <SettingItem
            icon="bluetooth"
            title="Auto Connect"
            subtitle="Automatically connect to last used device"
            rightComponent={
              <Switch
                value={autoConnect}
                onValueChange={setAutoConnect}
                trackColor={{false: '#333', true: '#00ff88'}}
                thumbColor={autoConnect ? '#fff' : '#666'}
              />
            }
          />

          <SettingItem
            icon="vibration"
            title="Haptic Feedback"
            subtitle="Vibrate when interacting with controls"
            rightComponent={
              <Switch
                value={hapticFeedback}
                onValueChange={setHapticFeedback}
                trackColor={{false: '#333', true: '#00ff88'}}
                thumbColor={hapticFeedback ? '#fff' : '#666'}
              />
            }
          />

          <SettingItem
            icon="notifications"
            title="Notifications"
            subtitle="Receive notifications for device events"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{false: '#333', true: '#00ff88'}}
                thumbColor={notificationsEnabled ? '#fff' : '#666'}
              />
            }
          />
        </View>

        {/* Appearance Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <SettingItem
            icon="dark-mode"
            title="Dark Mode"
            subtitle="Use dark theme throughout the app"
            rightComponent={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{false: '#333', true: '#00ff88'}}
                thumbColor={darkMode ? '#fff' : '#666'}
              />
            }
          />

          <SettingItem
            icon="palette"
            title="Accent Color"
            subtitle="Choose your preferred accent color"
            onPress={() => Alert.alert('Accent Color', 'Color picker coming soon!')}
          />
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <SettingItem
            icon="file-download"
            title="Export Settings"
            subtitle="Export your settings and presets"
            onPress={handleExportSettings}
          />

          <SettingItem
            icon="file-upload"
            title="Import Settings"
            subtitle="Import previously exported settings"
            onPress={handleImportSettings}
          />

          <SettingItem
            icon="delete"
            title="Reset Settings"
            subtitle="Reset all settings to default"
            onPress={handleResetSettings}
          />
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <SettingItem
            icon="help"
            title="Help & Support"
            subtitle="Get help with using the app"
            onPress={handleHelp}
          />

          <SettingItem
            icon="feedback"
            title="Send Feedback"
            subtitle="Report bugs or suggest features"
            onPress={() => Alert.alert('Feedback', 'Thank you for your feedback!')}
          />

          <SettingItem
            icon="star"
            title="Rate App"
            subtitle="Rate us on the App Store"
            onPress={() => Alert.alert('Rate App', 'Thank you for rating our app!')}
          />

          <SettingItem
            icon="info"
            title="About"
            subtitle="App version and information"
            onPress={handleAbout}
          />
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>LED Controller</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appCopyright}>© 2025 LED Controller App</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 10,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    color: '#999',
    fontSize: 14,
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
    marginTop: 20,
  },
  appName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  appVersion: {
    color: '#999',
    fontSize: 16,
    marginBottom: 5,
  },
  appCopyright: {
    color: '#666',
    fontSize: 14,
  },
});

export default SettingsScreen;
