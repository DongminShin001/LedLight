import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import EnhancedHomeScreen from './src/screens/EnhancedHomeScreen';
import EffectsScreen from './src/screens/EffectsScreen';
import PresetsScreen from './src/screens/PresetsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import EnhancedColorPickerScreen from './src/screens/EnhancedColorPickerScreen';
import EnhancedTextDisplayScreen from './src/screens/EnhancedTextDisplayScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={EnhancedHomeScreen} 
        options={{headerShown: false}}
      />
      <Stack.Screen 
        name="ColorPicker" 
        component={EnhancedColorPickerScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen 
        name="TextDisplay" 
        component={EnhancedTextDisplayScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, color, size}) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Effects') {
              iconName = 'auto-fix-high';
            } else if (route.name === 'Presets') {
              iconName = 'bookmark';
            } else if (route.name === 'Settings') {
              iconName = 'settings';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#00ff88',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#1a1a1a',
            borderTopColor: '#333',
          },
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#fff',
        })}>
        <Tab.Screen 
          name="Home" 
          component={HomeStack}
          options={{headerShown: false}}
        />
        <Tab.Screen 
          name="Effects" 
          component={EffectsScreen}
          options={{title: 'LED Effects'}}
        />
        <Tab.Screen 
          name="Presets" 
          component={PresetsScreen}
          options={{title: 'Presets'}}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{title: 'Settings'}}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
