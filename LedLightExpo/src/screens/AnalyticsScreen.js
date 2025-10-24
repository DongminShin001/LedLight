import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LEDController from '../classes/LEDController';
import DeviceManager from '../classes/DeviceManager';
import logger from '../utils/Logger';

const {width} = Dimensions.get('window');

const AnalyticsScreen = () => {
  const [analytics, setAnalytics] = useState({
    totalUsage: 0,
    averageSession: 0,
    totalSessions: 0,
    favoriteColor: '#00ff88',
    favoriteEffect: 'Rainbow',
    energySaved: 0,
    deviceUptime: 0,
    connectionStability: 0,
    performanceScore: 0
  });
  const [timeRange, setTimeRange] = useState('week');
  const [isLoading, setIsLoading] = useState(true);

  const timeRanges = [
    {id: 'day', name: 'Today', icon: 'today'},
    {id: 'week', name: 'This Week', icon: 'date-range'},
    {id: 'month', name: 'This Month', icon: 'calendar-month'},
    {id: 'year', name: 'This Year', icon: 'calendar-today'}
  ];

  const performanceMetrics = [
    {
      id: 'connection',
      name: 'Connection Stability',
      value: analytics.connectionStability,
      unit: '%',
      icon: 'bluetooth-connected',
      color: '#00ff88',
      description: 'Bluetooth connection reliability'
    },
    {
      id: 'performance',
      name: 'App Performance',
      value: analytics.performanceScore,
      unit: '%',
      icon: 'speed',
      color: '#4ecdc4',
      description: 'Overall app responsiveness'
    },
    {
      id: 'energy',
      name: 'Energy Efficiency',
      value: analytics.energySaved,
      unit: 'kWh',
      icon: 'eco',
      color: '#45b7d1',
      description: 'Energy saved vs traditional lighting'
    },
    {
      id: 'uptime',
      name: 'Device Uptime',
      value: analytics.deviceUptime,
      unit: 'hrs',
      icon: 'schedule',
      color: '#96ceb4',
      description: 'Total device operation time'
    }
  ];

  const usageStats = [
    {
      id: 'sessions',
      name: 'Total Sessions',
      value: analytics.totalSessions,
      icon: 'play-circle-filled',
      color: '#ff6b6b'
    },
    {
      id: 'usage',
      name: 'Total Usage',
      value: analytics.totalUsage,
      unit: 'hrs',
      icon: 'timer',
      color: '#feca57'
    },
    {
      id: 'average',
      name: 'Avg Session',
      value: analytics.averageSession,
      unit: 'min',
      icon: 'schedule',
      color: '#48dbfb'
    }
  ];

  const colorStats = [
    {color: '#ff0000', name: 'Red', usage: 25},
    {color: '#00ff00', name: 'Green', usage: 30},
    {color: '#0000ff', name: 'Blue', usage: 20},
    {color: '#ffff00', name: 'Yellow', usage: 15},
    {color: '#ff00ff', name: 'Magenta', usage: 10}
  ];

  const effectStats = [
    {name: 'Rainbow', usage: 35, icon: 'palette'},
    {name: 'Breathing', usage: 25, icon: 'favorite'},
    {name: 'Fire', usage: 20, icon: 'local-fire-department'},
    {name: 'Ocean', usage: 15, icon: 'waves'},
    {name: 'Aurora', usage: 5, icon: 'wb-sunny'}
  ];

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Simulate loading analytics data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAnalytics = {
        totalUsage: Math.floor(Math.random() * 100) + 50,
        averageSession: Math.floor(Math.random() * 60) + 15,
        totalSessions: Math.floor(Math.random() * 200) + 50,
        favoriteColor: '#00ff88',
        favoriteEffect: 'Rainbow',
        energySaved: Math.floor(Math.random() * 50) + 10,
        deviceUptime: Math.floor(Math.random() * 500) + 100,
        connectionStability: Math.floor(Math.random() * 20) + 80,
        performanceScore: Math.floor(Math.random() * 15) + 85
      };
      
      setAnalytics(mockAnalytics);
      setIsLoading(false);
      
      logger.info('Analytics loaded', {timeRange, analytics: mockAnalytics});
    } catch (error) {
      setIsLoading(false);
      logger.error('Failed to load analytics', error);
    }
  };

  const handleExportData = async () => {
    try {
      Alert.alert(
        'Export Data',
        'Export your usage analytics data?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Export',
            onPress: () => {
              logger.info('Analytics data exported', {timeRange});
              Alert.alert('Success', 'Analytics data exported successfully!');
            }
          }
        ]
      );
    } catch (error) {
      logger.error('Failed to export data', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleResetData = async () => {
    Alert.alert(
      'Reset Analytics',
      'Are you sure you want to reset all analytics data? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setAnalytics({
              totalUsage: 0,
              averageSession: 0,
              totalSessions: 0,
              favoriteColor: '#00ff88',
              favoriteEffect: 'Rainbow',
              energySaved: 0,
              deviceUptime: 0,
              connectionStability: 0,
              performanceScore: 0
            });
            logger.info('Analytics data reset');
            Alert.alert('Success', 'Analytics data reset successfully!');
          }
        }
      ]
    );
  };

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {timeRanges.map(range => (
        <TouchableOpacity
          key={range.id}
          style={[
            styles.timeRangeButton,
            timeRange === range.id && styles.selectedTimeRangeButton
          ]}
          onPress={() => setTimeRange(range.id)}>
          <Icon 
            name={range.icon} 
            size={16} 
            color={timeRange === range.id ? '#000' : '#fff'} 
          />
          <Text style={[
            styles.timeRangeText,
            timeRange === range.id && styles.selectedTimeRangeText
          ]}>
            {range.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPerformanceMetrics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Performance Metrics</Text>
      <View style={styles.metricsGrid}>
        {performanceMetrics.map(metric => (
          <View key={metric.id} style={styles.metricCard}>
            <LinearGradient
              colors={[metric.color, `${metric.color}80`]}
              style={styles.metricGradient}>
              <View style={styles.metricHeader}>
                <Icon name={metric.icon} size={24} color="#fff" />
                <Text style={styles.metricName}>{metric.name}</Text>
              </View>
              <View style={styles.metricValue}>
                <Text style={styles.metricNumber}>{metric.value}</Text>
                <Text style={styles.metricUnit}>{metric.unit}</Text>
              </View>
              <Text style={styles.metricDescription}>{metric.description}</Text>
            </LinearGradient>
          </View>
        ))}
      </View>
    </View>
  );

  const renderUsageStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Usage Statistics</Text>
      <View style={styles.statsContainer}>
        {usageStats.map(stat => (
          <View key={stat.id} style={styles.statCard}>
            <View style={styles.statIcon}>
              <Icon name={stat.icon} size={24} color={stat.color} />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>
                {stat.value}{stat.unit && ` ${stat.unit}`}
              </Text>
              <Text style={styles.statName}>{stat.name}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderColorStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Color Usage</Text>
      <View style={styles.colorStatsContainer}>
        {colorStats.map((colorStat, index) => (
          <View key={index} style={styles.colorStatItem}>
            <View style={styles.colorInfo}>
              <View style={[styles.colorSwatch, {backgroundColor: colorStat.color}]} />
              <Text style={styles.colorName}>{colorStat.name}</Text>
            </View>
            <View style={styles.colorUsageBar}>
              <View 
                style={[
                  styles.colorUsageFill, 
                  {backgroundColor: colorStat.color, width: `${colorStat.usage}%`}
                ]} 
              />
            </View>
            <Text style={styles.colorPercentage}>{colorStat.usage}%</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderEffectStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Effect Usage</Text>
      <View style={styles.effectStatsContainer}>
        {effectStats.map((effect, index) => (
          <View key={index} style={styles.effectStatItem}>
            <View style={styles.effectInfo}>
              <Icon name={effect.icon} size={20} color="#00ff88" />
              <Text style={styles.effectName}>{effect.name}</Text>
            </View>
            <View style={styles.effectUsageBar}>
              <View 
                style={[
                  styles.effectUsageFill, 
                  {width: `${effect.usage}%`}
                ]} 
              />
            </View>
            <Text style={styles.effectPercentage}>{effect.usage}%</Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="analytics" size={64} color="#00ff88" />
        <Text style={styles.loadingText}>Loading Analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleExportData}>
            <Icon name="file-download" size={20} color="#00ff88" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleResetData}>
            <Icon name="refresh" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTimeRangeSelector()}
        {renderPerformanceMetrics()}
        {renderUsageStats()}
        {renderColorStats()}
        {renderEffectStats()}
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
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
  },
  timeRangeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  selectedTimeRangeButton: {
    backgroundColor: '#00ff88',
  },
  timeRangeText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  selectedTimeRangeText: {
    color: '#000',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - 60) / 2,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  metricGradient: {
    padding: 15,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricName: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  metricUnit: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 2,
  },
  metricDescription: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  statsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  statName: {
    fontSize: 14,
    color: '#999',
  },
  colorStatsContainer: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 20,
  },
  colorStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  colorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  colorName: {
    fontSize: 14,
    color: '#fff',
  },
  colorUsageBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#444',
    borderRadius: 4,
    marginHorizontal: 15,
    overflow: 'hidden',
  },
  colorUsageFill: {
    height: '100%',
    borderRadius: 4,
  },
  colorPercentage: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
  effectStatsContainer: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 20,
  },
  effectStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  effectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  effectName: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
  },
  effectUsageBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#444',
    borderRadius: 4,
    marginHorizontal: 15,
    overflow: 'hidden',
  },
  effectUsageFill: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 4,
  },
  effectPercentage: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
});

export default AnalyticsScreen;
