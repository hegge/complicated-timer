/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from 'react';

import {
  Button,
  FlatList,
  KeyboardTypeOptions,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();

import { createStore } from 'redux';
import { Provider } from 'react-redux';
import allReducers from './reducers/index';
const store = createStore(allReducers);

import SessionList from './components/SessionList';
import PlaySession from './components/PlaySession';
import EditSession, { EditRepeat, EditCountdown }from './components/EditSession';

const App: React.FC = () => {
  return (
    <Provider store={store}>
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
            options={({ route }) => ({ title: route.params.name })} />
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
    </Provider>
  );
};
export default App;