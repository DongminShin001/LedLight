import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Switch,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ThemeManager from '../theme/ThemeManager';
import logger from '../utils/Logger';

const {width} = Dimensions.get('window');

const ThemeSelectionScreen = () => {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [availableThemes, setAvailableThemes] = useState([]);
  const [autoThemeEnabled, setAutoThemeEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemeData();
    setupThemeListener();
  }, []);

  const loadThemeData = async () => {
    try {
      setIsLoading(true);

      // Load current theme
      await ThemeManager.loadSavedTheme();
      const current = ThemeManager.currentTheme;
      setCurrentTheme(current);

      // Load available themes
      const themes = ThemeManager.getAvailableThemes();
      setAvailableThemes(themes);

      // Check auto theme status
      const autoEnabled = await ThemeManager.isAutoThemeEnabled();
      setAutoThemeEnabled(autoEnabled);

      setIsLoading(false);
      logger.info('Theme data loaded', {currentTheme: current, themeCount: themes.length});
    } catch (error) {
      setIsLoading(false);
      logger.error('Failed to load theme data', error);
    }
  };

  const setupThemeListener = () => {
    const handleThemeChange = data => {
      setCurrentTheme(data.currentTheme);
      logger.info('Theme changed via listener', {theme: data.currentTheme});
    };

    ThemeManager.addListener('themeChanged', handleThemeChange);

    return () => {
      ThemeManager.removeListener('themeChanged', handleThemeChange);
    };
  };

  const handleThemeSelect = async themeId => {
    try {
      const success = await ThemeManager.setTheme(themeId);
      if (success) {
        setCurrentTheme(themeId);
        logger.info('Theme selected', {themeId});
      } else {
        Alert.alert('Error', 'Failed to apply theme');
      }
    } catch (error) {
      logger.error('Failed to select theme', error);
      Alert.alert('Error', 'Failed to apply theme');
    }
  };

  const handleAutoThemeToggle = async enabled => {
    try {
      if (enabled) {
        await ThemeManager.enableAutoTheme();
        setAutoThemeEnabled(true);
        Alert.alert('Auto Theme Enabled', 'Theme will automatically change based on time of day');
      } else {
        await ThemeManager.disableAutoTheme();
        setAutoThemeEnabled(false);
        Alert.alert('Auto Theme Disabled', 'Theme will remain fixed');
      }
    } catch (error) {
      logger.error('Failed to toggle auto theme', error);
      Alert.alert('Error', 'Failed to update auto theme setting');
    }
  };

  const renderThemePreview = theme => {
    const isSelected = currentTheme === theme.id;
    const themeData = ThemeManager.getTheme(theme.id);

    return (
      <TouchableOpacity
        key={theme.id}
        style={[styles.themeCard, isSelected && styles.selectedThemeCard]}
        onPress={() => handleThemeSelect(theme.id)}
        activeOpacity={0.8}>
        <LinearGradient
          colors={themeData.gradients.primary}
          style={styles.themePreview}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <View style={styles.previewContent}>
            {/* Theme Name */}
            <Text style={[styles.themeName, {color: themeData.colors.text}]}>{theme.name}</Text>

            {/* Color Palette */}
            <View style={styles.colorPalette}>
              <View style={[styles.colorDot, {backgroundColor: themeData.colors.primary}]} />
              <View style={[styles.colorDot, {backgroundColor: themeData.colors.secondary}]} />
              <View style={[styles.colorDot, {backgroundColor: themeData.colors.accent}]} />
            </View>

            {/* Preview Elements */}
            <View style={styles.previewElements}>
              <View style={[styles.previewCard, {backgroundColor: themeData.colors.surface}]}>
                <View style={[styles.previewDot, {backgroundColor: themeData.colors.primary}]} />
                <View style={styles.previewText}>
                  <View
                    style={[
                      styles.previewLine,
                      {backgroundColor: themeData.colors.text, width: '80%'},
                    ]}
                  />
                  <View
                    style={[
                      styles.previewLine,
                      {backgroundColor: themeData.colors.textSecondary, width: '60%'},
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Selection Indicator */}
            {isSelected && (
              <View style={styles.selectionIndicator}>
                <Icon name="check-circle" size={24} color={themeData.colors.primary} />
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Theme Description */}
        <View style={styles.themeDescription}>
          <Text style={styles.descriptionText}>{theme.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAutoThemeSection = () => (
    <View style={styles.autoThemeSection}>
      <View style={styles.autoThemeHeader}>
        <Icon name="schedule" size={24} color="#00ff88" />
        <Text style={styles.autoThemeTitle}>Auto Theme</Text>
      </View>

      <View style={styles.autoThemeContent}>
        <View style={styles.autoThemeInfo}>
          <Text style={styles.autoThemeDescription}>
            Automatically switch themes based on time of day
          </Text>
          <Text style={styles.autoThemeSchedule}>
            Morning: Light • Afternoon: Ocean • Evening: Sunset • Night: Dark
          </Text>
        </View>

        <Switch
          value={autoThemeEnabled}
          onValueChange={handleAutoThemeToggle}
          trackColor={{false: '#333', true: '#00ff88'}}
          thumbColor={autoThemeEnabled ? '#fff' : '#999'}
        />
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="palette" size={64} color="#00ff88" />
        <Text style={styles.loadingText}>Loading Themes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Themes</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() =>
              Alert.alert(
                'Themes',
                'Choose from different color schemes to personalize your LED controller experience.',
              )
            }>
            <Icon name="info" size={20} color="#00ff88" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Auto Theme Section */}
        {renderAutoThemeSection()}

        {/* Theme Selection */}
        <View style={styles.themesSection}>
          <Text style={styles.sectionTitle}>Choose Theme</Text>
          <View style={styles.themesGrid}>{availableThemes.map(renderThemePreview)}</View>
        </View>

        {/* Theme Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Icon name="lightbulb" size={24} color="#00ff88" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Theme Tips</Text>
              <Text style={styles.infoText}>
                • Dark themes are better for low-light environments{'\n'}• Light themes work well in
                bright rooms{'\n'}• Neon themes create a futuristic atmosphere{'\n'}• Ocean themes
                promote relaxation{'\n'}• Sunset themes create cozy ambiance
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  autoThemeSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  autoThemeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  autoThemeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 12,
  },
  autoThemeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  autoThemeInfo: {
    flex: 1,
    marginRight: 15,
  },
  autoThemeDescription: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  autoThemeSchedule: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 18,
  },
  themesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeCard: {
    width: (width - 60) / 2,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  selectedThemeCard: {
    borderWidth: 3,
    borderColor: '#00ff88',
    shadowColor: '#00ff88',
    shadowOpacity: 0.6,
  },
  themePreview: {
    padding: 20,
    minHeight: 160,
  },
  previewContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  themeName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  colorPalette: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  previewElements: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  previewCard: {
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  previewText: {
    flex: 1,
  },
  previewLine: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  themeDescription: {
    backgroundColor: '#1a1a1a',
    padding: 15,
  },
  descriptionText: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 18,
  },
  infoSection: {
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 20,
  },
});

export default ThemeSelectionScreen;
