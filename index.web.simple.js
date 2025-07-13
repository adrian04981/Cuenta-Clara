import { AppRegistry } from 'react-native';
import App from './AppSimple';
import { name as appName } from './app.json';

// Registrar la aplicación para web
AppRegistry.registerComponent(appName, () => App);

// Ejecutar la aplicación
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});
