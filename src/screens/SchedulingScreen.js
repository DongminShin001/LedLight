import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import LEDController from '../classes/LEDController';
import {ErrorHandler} from '../utils/ErrorHandler';
import logger from '../utils/Logger';

const SchedulingScreen = () => {
  const [schedules, setSchedules] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    time: new Date(),
    days: [],
    action: 'turnOn',
    color: '#00ff88',
    brightness: 75,
    effect: 'none',
    enabled: true
  });

  const daysOfWeek = [
    {id: 0, name: 'Sunday', short: 'Sun'},
    {id: 1, name: 'Monday', short: 'Mon'},
    {id: 2, name: 'Tuesday', short: 'Tue'},
    {id: 3, name: 'Wednesday', short: 'Wed'},
    {id: 4, name: 'Thursday', short: 'Thu'},
    {id: 5, name: 'Friday', short: 'Fri'},
    {id: 6, name: 'Saturday', short: 'Sat'}
  ];

  const actions = [
    {id: 'turnOn', name: 'Turn On', icon: 'power'},
    {id: 'turnOff', name: 'Turn Off', icon: 'power-off'},
    {id: 'setColor', name: 'Set Color', icon: 'palette'},
    {id: 'setBrightness', name: 'Set Brightness', icon: 'brightness-high'},
    {id: 'setEffect', name: 'Set Effect', icon: 'auto-awesome'},
    {id: 'custom', name: 'Custom Scene', icon: 'build'}
  ];

  const effects = [
    {id: 'none', name: 'None'},
    {id: 'rainbow', name: 'Rainbow'},
    {id: 'breathing', name: 'Breathing'},
    {id: 'fire', name: 'Fire'},
    {id: 'ocean', name: 'Ocean'},
    {id: 'aurora', name: 'Aurora'}
  ];

  useEffect(() => {
    loadSchedules();
    startScheduleMonitoring();
  }, []);

  const loadSchedules = async () => {
    try {
      // In a real app, load from storage
      const savedSchedules = [
        {
          id: 1,
          name: 'Morning Wake Up',
          time: new Date(2024, 0, 1, 7, 0),
          days: [1, 2, 3, 4, 5], // Weekdays
          action: 'turnOn',
          color: '#ffa500',
          brightness: 80,
          effect: 'breathing',
          enabled: true
        },
        {
          id: 2,
          name: 'Evening Relax',
          time: new Date(2024, 0, 1, 20, 0),
          days: [0, 1, 2, 3, 4, 5, 6], // Every day
          action: 'setColor',
          color: '#ff6b6b',
          brightness: 50,
          effect: 'none',
          enabled: true
        }
      ];
      setSchedules(savedSchedules);
      logger.info('Schedules loaded', {count: savedSchedules.length});
    } catch (error) {
      logger.error('Failed to load schedules', error);
    }
  };

  const startScheduleMonitoring = () => {
    // Check schedules every minute
    setInterval(() => {
      checkSchedules();
    }, 60000);
  };

  const checkSchedules = async () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const currentDay = now.getDay();

    for (const schedule of schedules) {
      if (!schedule.enabled) continue;

      const scheduleTime = schedule.time.getHours() * 60 + schedule.time.getMinutes();
      const isScheduledDay = schedule.days.includes(currentDay);
      const isScheduledTime = Math.abs(currentTime - scheduleTime) < 1; // Within 1 minute

      if (isScheduledDay && isScheduledTime) {
        await executeSchedule(schedule);
      }
    }
  };

  const executeSchedule = async (schedule) => {
    try {
      logger.info('Executing schedule', {scheduleId: schedule.id, scheduleName: schedule.name});

      switch (schedule.action) {
        case 'turnOn':
          await LEDController.setPower(true);
          break;
        case 'turnOff':
          await LEDController.setPower(false);
          break;
        case 'setColor':
          await LEDController.setColor(schedule.color);
          await LEDController.setBrightness(schedule.brightness);
          break;
        case 'setBrightness':
          await LEDController.setBrightness(schedule.brightness);
          break;
        case 'setEffect':
          if (schedule.effect !== 'none') {
            await LEDController.setEffect(schedule.effect, 50);
          }
          break;
        case 'custom':
          await LEDController.setColor(schedule.color);
          await LEDController.setBrightness(schedule.brightness);
          if (schedule.effect !== 'none') {
            await LEDController.setEffect(schedule.effect, 50);
          }
          break;
      }

      logger.info('Schedule executed successfully', {scheduleId: schedule.id});
    } catch (error) {
      logger.error('Failed to execute schedule', error);
    }
  };

  const handleAddSchedule = () => {
    setNewSchedule({
      name: '',
      time: new Date(),
      days: [],
      action: 'turnOn',
      color: '#00ff88',
      brightness: 75,
      effect: 'none',
      enabled: true
    });
    setShowAddModal(true);
  };

  const handleSaveSchedule = async () => {
    try {
      if (!newSchedule.name.trim()) {
        Alert.alert('Error', 'Please enter a schedule name.');
        return;
      }

      if (newSchedule.days.length === 0) {
        Alert.alert('Error', 'Please select at least one day.');
        return;
      }

      const schedule = {
        ...newSchedule,
        id: Date.now(),
        time: newSchedule.time
      };

      setSchedules(prev => [...prev, schedule]);
      setShowAddModal(false);
      
      logger.info('Schedule created', {scheduleId: schedule.id, scheduleName: schedule.name});
      Alert.alert('Success', 'Schedule created successfully!');
    } catch (error) {
      logger.error('Failed to save schedule', error);
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      Alert.alert('Error', userMessage);
    }
  };

  const handleToggleSchedule = async (scheduleId) => {
    try {
      setSchedules(prev => 
        prev.map(schedule => 
          schedule.id === scheduleId 
            ? {...schedule, enabled: !schedule.enabled}
            : schedule
        )
      );
      
      const schedule = schedules.find(s => s.id === scheduleId);
      logger.info('Schedule toggled', {scheduleId, enabled: !schedule.enabled});
    } catch (error) {
      logger.error('Failed to toggle schedule', error);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
            logger.info('Schedule deleted', {scheduleId});
          }
        }
      ]
    );
  };

  const handleDayToggle = (dayId) => {
    setNewSchedule(prev => ({
      ...prev,
      days: prev.days.includes(dayId)
        ? prev.days.filter(id => id !== dayId)
        : [...prev.days, dayId]
    }));
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const formatDays = (dayIds) => {
    return dayIds.map(id => daysOfWeek.find(day => day.id === id)?.short).join(', ');
  };

  const renderScheduleCard = (schedule) => {
    const action = actions.find(a => a.id === schedule.action);
    
    return (
      <View key={schedule.id} style={styles.scheduleCard}>
        <View style={styles.scheduleHeader}>
          <View style={styles.scheduleInfo}>
            <Text style={styles.scheduleName}>{schedule.name}</Text>
            <Text style={styles.scheduleTime}>{formatTime(schedule.time)}</Text>
            <Text style={styles.scheduleDays}>{formatDays(schedule.days)}</Text>
          </View>
          <View style={styles.scheduleControls}>
            <Switch
              value={schedule.enabled}
              onValueChange={() => handleToggleSchedule(schedule.id)}
              trackColor={{false: '#333', true: '#00ff88'}}
              thumbColor={schedule.enabled ? '#fff' : '#999'}
            />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteSchedule(schedule.id)}>
              <Icon name="delete" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.scheduleDetails}>
          <View style={styles.detailRow}>
            <Icon name={action?.icon} size={16} color="#00ff88" />
            <Text style={styles.detailText}>{action?.name}</Text>
          </View>
          
          {schedule.action === 'setColor' && (
            <View style={styles.detailRow}>
              <View style={[styles.colorPreview, {backgroundColor: schedule.color}]} />
              <Text style={styles.detailText}>Color: {schedule.color}</Text>
            </View>
          )}
          
          {(schedule.action === 'setBrightness' || schedule.action === 'setColor' || schedule.action === 'custom') && (
            <View style={styles.detailRow}>
              <Icon name="brightness-high" size={16} color="#00ff88" />
              <Text style={styles.detailText}>Brightness: {schedule.brightness}%</Text>
            </View>
          )}
          
          {schedule.effect !== 'none' && (
            <View style={styles.detailRow}>
              <Icon name="auto-awesome" size={16} color="#00ff88" />
              <Text style={styles.detailText}>Effect: {schedule.effect}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scheduling</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddSchedule}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {schedules.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="schedule" size={64} color="#666" />
            <Text style={styles.emptyTitle}>No Schedules</Text>
            <Text style={styles.emptyDescription}>
              Create your first schedule to automate your LED lighting
            </Text>
          </View>
        ) : (
          schedules.map(renderScheduleCard)
        )}
      </ScrollView>

      {/* Add Schedule Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Schedule</Text>
            <TouchableOpacity onPress={handleSaveSchedule}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Schedule Name</Text>
              <TextInput
                style={styles.textInput}
                value={newSchedule.name}
                onChangeText={(text) => setNewSchedule(prev => ({...prev, name: text}))}
                placeholder="Enter schedule name"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}>
                <Icon name="access-time" size={20} color="#00ff88" />
                <Text style={styles.timeText}>{formatTime(newSchedule.time)}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Days</Text>
              <View style={styles.daysContainer}>
                {daysOfWeek.map(day => (
                  <TouchableOpacity
                    key={day.id}
                    style={[
                      styles.dayButton,
                      newSchedule.days.includes(day.id) && styles.selectedDayButton
                    ]}
                    onPress={() => handleDayToggle(day.id)}>
                    <Text style={[
                      styles.dayText,
                      newSchedule.days.includes(day.id) && styles.selectedDayText
                    ]}>
                      {day.short}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Action</Text>
              <View style={styles.actionsContainer}>
                {actions.map(action => (
                  <TouchableOpacity
                    key={action.id}
                    style={[
                      styles.actionButton,
                      newSchedule.action === action.id && styles.selectedActionButton
                    ]}
                    onPress={() => setNewSchedule(prev => ({...prev, action: action.id}))}>
                    <Icon name={action.icon} size={20} color="#fff" />
                    <Text style={styles.actionText}>{action.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {newSchedule.action === 'setColor' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Color</Text>
                <View style={styles.colorPreview}>
                  <View style={[styles.colorSwatch, {backgroundColor: newSchedule.color}]} />
                  <Text style={styles.colorText}>{newSchedule.color}</Text>
                </View>
              </View>
            )}

            {(newSchedule.action === 'setBrightness' || newSchedule.action === 'setColor' || newSchedule.action === 'custom') && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Brightness: {newSchedule.brightness}%</Text>
                <View style={styles.sliderContainer}>
                  <Icon name="brightness-low" size={20} color="#666" />
                  <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={100}
                    value={newSchedule.brightness}
                    onValueChange={(value) => setNewSchedule(prev => ({...prev, brightness: value}))}
                    minimumTrackTintColor="#00ff88"
                    maximumTrackTintColor="#333"
                    thumbStyle={styles.sliderThumb}
                  />
                  <Icon name="brightness-high" size={20} color="#666" />
                </View>
              </View>
            )}

            {newSchedule.action === 'setEffect' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Effect</Text>
                <View style={styles.effectsContainer}>
                  {effects.map(effect => (
                    <TouchableOpacity
                      key={effect.id}
                      style={[
                        styles.effectButton,
                        newSchedule.effect === effect.id && styles.selectedEffectButton
                      ]}
                      onPress={() => setNewSchedule(prev => ({...prev, effect: effect.id}))}>
                      <Text style={[
                        styles.effectText,
                        newSchedule.effect === effect.id && styles.selectedEffectText
                      ]}>
                        {effect.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={newSchedule.time}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              setNewSchedule(prev => ({...prev, time: selectedTime}));
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
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
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00ff88',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  scheduleCard: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  scheduleTime: {
    fontSize: 16,
    color: '#00ff88',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scheduleDays: {
    fontSize: 14,
    color: '#999',
  },
  scheduleControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 15,
    padding: 5,
  },
  scheduleDetails: {
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingTop: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 10,
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#999',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  saveButton: {
    fontSize: 16,
    color: '#00ff88',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  timeText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dayButton: {
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  selectedDayButton: {
    backgroundColor: '#00ff88',
  },
  dayText: {
    fontSize: 14,
    color: '#fff',
  },
  selectedDayText: {
    color: '#000',
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  selectedActionButton: {
    backgroundColor: '#00ff88',
  },
  actionText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
  },
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  colorText: {
    fontSize: 16,
    color: '#fff',
  },
  effectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  effectButton: {
    backgroundColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  selectedEffectButton: {
    backgroundColor: '#00ff88',
  },
  effectText: {
    fontSize: 14,
    color: '#fff',
  },
  selectedEffectText: {
    color: '#000',
    fontWeight: 'bold',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  slider: {
    flex: 1,
    marginHorizontal: 15,
  },
  sliderThumb: {
    backgroundColor: '#00ff88',
    width: 20,
    height: 20,
  },
});

export default SchedulingScreen;
