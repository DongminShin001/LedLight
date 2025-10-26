import React, {useState, useEffect} from 'react';
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
  const [isPowerOn, setIsPowerOn] = useState(false);

  const colors = [
    {name: 'Indigo', value: '#6366f1'},
    {name: 'Red', value: '#ef4444'},
    {name: 'Green', value: '#10b981'},
    {name: 'Yellow', value: '#f59e0b'},
    {name: 'Purple', value: '#8b5cf6'},
    {name: 'Cyan', value: '#06b6d4'},
    {name: 'Pink', value: '#ec4899'},
    {name: 'Orange', value: '#f97316'},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SmartLED Controller</Text>
          <Text style={styles.subtitle}>Professional LED Control System</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v2.0.0</Text>
          </View>
        </View>

        {/* Connection Status */}
        <View style={styles.statusCard}>
          <View
            style={[styles.statusDot, {backgroundColor: isConnected ? '#10b981' : '#ef4444'}]}
          />
          <Text style={styles.statusText}>{isConnected ? '🟢 Connected' : '🔴 Disconnected'}</Text>
        </View>

        {/* Power Control */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Power Control</Text>
          <TouchableOpacity
            style={[
              styles.powerButton,
              {
                backgroundColor: isPowerOn ? '#10b981' : '#ef4444',
              },
            ]}
            onPress={() => {
              setIsPowerOn(!isPowerOn);
              setIsConnected(!isConnected);
            }}>
            <Text style={styles.powerIcon}>{isPowerOn ? '🔆' : '🔅'}</Text>
            <Text style={styles.powerButtonText}>{isPowerOn ? 'Turn Off' : 'Turn On'}</Text>
          </TouchableOpacity>
        </View>

        {/* Brightness Control */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 Brightness Control</Text>
          <Text style={styles.brightnessLabel}>Brightness: {brightness}%</Text>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderFill,
                  {
                    width: `${brightness}%`,
                    backgroundColor: selectedColor,
                  },
                ]}
              />
            </View>
          </View>
          <View style={styles.brightnessButtons}>
            {[0, 25, 50, 75, 100].map(value => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.brightnessButton,
                  {
                    backgroundColor: brightness === value ? selectedColor : '#374151',
                  },
                ]}
                onPress={() => setBrightness(value)}>
                <Text style={styles.brightnessButtonText}>{value}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color Picker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎨 Color Selection</Text>
          <View style={styles.colorGrid}>
            {colors.map(color => (
              <TouchableOpacity
                key={color.value}
                style={[
                  styles.colorButton,
                  {backgroundColor: color.value},
                  selectedColor === color.value && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor(color.value)}>
                {selectedColor === color.value && <Text style={styles.checkmark}>✓</Text>}
                <Text style={styles.colorName}>{color.name}</Text>
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
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Device Name</Text>
              <Text style={styles.infoValue}>SmartLED Pro</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Firmware</Text>
              <Text style={styles.infoValue}>v2.1.0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Battery</Text>
              <Text style={styles.infoValue}>85%</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Signal</Text>
              <Text style={styles.infoValue}>Strong</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>✨ SmartLED Controller v2.0.0</Text>
          <Text style={styles.footerSubtext}>Ready to control your LED strips!</Text>
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
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#6366f1',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#e2e8f0',
    marginBottom: 15,
    textAlign: 'center',
  },
  versionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
  },
  versionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 15,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 15,
  },
  powerButton: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  powerIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  powerButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  brightnessLabel: {
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 15,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderTrack: {
    height: 12,
    backgroundColor: '#374151',
    borderRadius: 6,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 6,
  },
  brightnessButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brightnessButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  brightnessButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorButton: {
    width: (width - 100) / 4,
    height: 90,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#ffffff',
    transform: [{scale: 1.08}],
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  colorName: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - 100) / 2,
    backgroundColor: '#374151',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  quickActionText: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 15,
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 5,
  },
  infoValue: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    padding: 30,
    marginBottom: 30,
  },
  footerText: {
    color: '#6366f1',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  footerSubtext: {
    color: '#64748b',
    fontSize: 14,
  },
});
