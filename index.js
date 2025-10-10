import {AppRegistry} from 'react-native';
import {App} from './src/App';
import {name as appName} from './package.json';

// Register the OOP App component
AppRegistry.registerComponent(appName, () => App);
