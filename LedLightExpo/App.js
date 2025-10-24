import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import {StatusBar} from 'expo-status-bar';

const {width} = Dimensions.get('window');

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [brightness, setBrightness] = useState(75);
  const [selectedColor, setSelectedColor] = useState('#6366f1');

  const colors = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SmartLED Controller</Text>
          <Text style={styles.subtitle}>Professional LED Control System</Text>

          {/* Connection Status */}
          <View style={[styles.statusCard, {backgroundColor: isConnected ? '#10b981' : '#ef4444'}]}>
            <Text style={styles.statusIcon}>{isConnected ? '🟢' : '🔴'}</Text>
            <Text style={styles.statusText}>{isConnected ? 'Connected' : 'Disconnected'}</Text>
          </View>
        </View>

        {/* Power Control */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Power Control</Text>
          <TouchableOpacity
            style={[styles.powerButton, {backgroundColor: isConnected ? '#10b981' : '#ef4444'}]}
            onPress={() => setIsConnected(!isConnected)}>
            <Text style={styles.powerButtonText}>{isConnected ? 'Turn Off' : 'Turn On'}</Text>
          </TouchableOpacity>
        </View>

        {/* Brightness Control */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 Brightness Control</Text>
          <View style={styles.brightnessContainer}>
            <Text style={styles.brightnessLabel}>Brightness: {brightness}%</Text>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderTrack}>
                <View
                  style={[
                    styles.sliderFill,
                    {width: `${brightness}%`, backgroundColor: selectedColor},
                  ]}
                />
              </View>
            </View>
            <View style={styles.brightnessButtons}>
              {[25, 50, 75, 100].map(value => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.brightnessButton,
                    {backgroundColor: brightness === value ? selectedColor : '#374151'},
                  ]}
                  onPress={() => setBrightness(value)}>
                  <Text style={styles.brightnessButtonText}>{value}%</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Color Picker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎨 Color Selection</Text>
          <View style={styles.colorGrid}>
            {colors.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  {backgroundColor: color},
                  selectedColor === color && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor(color)}>
                {selectedColor === color && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚀 Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>🌈</Text>
              <Text style={styles.quickActionText}>Rainbow</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>🎭</Text>
              <Text style={styles.quickActionText}>Effects</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>🎵</Text>
              <Text style={styles.quickActionText}>Music</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>⏰</Text>
              <Text style={styles.quickActionText}>Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Device Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📱 Device Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Device Name:</Text>
            <Text style={styles.infoValue}>SmartLED Pro</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Firmware:</Text>
            <Text style={styles.infoValue}>v2.1.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Battery:</Text>
            <Text style={styles.infoValue}>85%</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>✨ SmartLED Controller v1.0.0</Text>
          <Text style={styles.footerSubtext}>Professional LED Control System</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#6366f1',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#10b981',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  statusText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 16,
  },
  powerButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  powerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  brightnessContainer: {
    marginTop: 8,
  },
  brightnessLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 12,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 4,
  },
  brightnessButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brightnessButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  brightnessButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorButton: {
    width: (width - 80) / 3,
    height: 60,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#ffffff',
    transform: [{scale: 1.1}],
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - 80) / 2,
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  infoValue: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 20,
  },
  footerText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    color: '#64748b',
    fontSize: 12,
  },
});
