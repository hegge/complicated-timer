/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';

import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();

import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { store, persistor } from './store/store';

import SessionList from './components/SessionList';
import PlaySession from './components/PlaySession';
import EditSession, { EditRepeat, EditCountdown } from './components/EditSession';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="SessionList"
              component={SessionList}
              options={{ title: 'Sessions' }}
            />
            <Stack.Screen
              name="PlaySession"
              component={PlaySession}
              options={({ navigation, route }) => ({
                headerTitle: route.params.name,
              })} />
            <Stack.Screen
              name="EditSession"
              component={EditSession}
              options={{ title: 'Edit session' }} />
            <Stack.Screen
              name="EditRepeat"
              component={EditRepeat}
              options={{ title: 'Edit repeat' }} />
            <Stack.Screen
              name="EditCountdown"
              component={EditCountdown}
              options={{ title: 'Edit countdown' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider >
  );
};
export default App;