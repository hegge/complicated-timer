/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  StatusBar,
} from 'react-native';

import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import UUIDGenerator from 'react-native-uuid-generator';

import Colors from './Colors.js';
import Header from './Header.js';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Sessions"
          component={SessionList}
          options={{ title: 'Complicated Timer' }}
        />
        <Stack.Screen name="Play" component={Play} />
        <Stack.Screen name="Edit" component={EditSession} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

const SessionListItem = ({ name, description, duration, workDuration, navigation }) => (
  <View style={styles.sessionContainer}>
    <Pressable
      style={{
        flexDirection: "row",
      }}
      onPress={() => {
        navigation.navigate('Play', { name: { name } })
      }}>
      <View
        style={{
          flexDirection: "column",
          flex: 1,

        }}>
        <Text style={styles.sessionName}>{name}</Text>
        <Text style={styles.sessionDescription}>{description}</Text>
      </View>
      <View
        style={{
          flexDirection: "column",
          justifyContent: "flex-end",
          flex: 0,
        }}>
        <Text style={styles.sessionDuration}>{duration}</Text>
        <Text style={styles.sessionWorkDuration}>{workDuration}</Text>
      </View>
    </Pressable>
  </View>
);

const SessionList = ({ navigation }) => {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://enophook.resisty.net/~torstein/sessions.json')
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const renderSessionListItem = ({ item }) => (
    <SessionListItem name={item.name} description={item.description}
      duration="14:00" workDuration="10:00"
      navigation={navigation} />
  );

  const emptySession = ({ uuid }) => {
    return (
      {
        "id": uuid,
        "name": "",
        "description": "",
        "session": []
      }
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}>
        <Header />
        <View style={styles.body}>
          <View style={{ flex: 1 }}>
            {isLoading ? <ActivityIndicator /> : (
              <FlatList
                data={data}
                keyExtractor={({ id }, index) => id}
                renderItem={renderSessionListItem}
              />
            )}
            <Button
              onPress={() => {
                UUIDGenerator.getRandomUUID().then((uuid) => {
                  setData([...data, emptySession({ uuid })]);
                });
              }}
              title="Create new session"
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const Play = ({ navigation, name }) => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.prepare}>
        <View style={styles.currentStep}>
          <Text style={styles.stepProgress}>1/2 1/3</Text>
          <Text style={styles.stepName}>Prepare</Text>
          <Text style={styles.timer}>20</Text>
          <Button
            onPress={() => {
            }}
            title="Start"
          />
          <View style={styles.stepProgressBar} />
          <View style={styles.sessionProgressBar} />
        </View>
      </View >

      <View style={styles.work}>
        <View style={styles.nextStep}>
          <Text>Next</Text>
          <Text style={styles.nextName}>Work</Text>
          <Text style={styles.nextDuration}>00:07</Text>
        </View>
      </View>

      <Button
        onPress={() => {
          navigation.navigate('Edit', { name: { name } })
        }}
        title="Edit"
      />
    </>
  );
};

const UselessTextInput = ({ placeholder }) => {
  const [value, setText] = React.useState('');

  return (
    <TextInput
      onChangeText={text => setText(text)}
      value={value}
      placeholder={placeholder}
    />
  );
}

const EditSession = ({ name }) => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.body}>
        <View style={styles.sectionContainer}>
          <UselessTextInput style={styles.textInput} placeholder="Enter name"></UselessTextInput>
          <UselessTextInput style={styles.textInput} placeholder="Enter description"></UselessTextInput>
        </View>
        <Button
          onPress={() => {
            alert('You tapped the button!');
          }}
          title="Add step"
        />
        <Button
          onPress={() => {
            alert('You tapped the button!');
          }}
          title="Add repeat"
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },

  body: {
    backgroundColor: Colors.white,
  },
  sessionContainer: {
    marginVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
  },
  sessionName: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sessionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  sessionDuration: {
    textAlign: 'right',
    fontSize: 16,
  },
  sessionWorkDuration: {
    textAlign: 'right',
    fontSize: 14,
  },
  stepName: {
    fontSize: 18,
    color: Colors.lighter,
  },
  stepProgress: {
    fontSize: 18,
    color: Colors.lighter,
  },
  timer: {
    fontSize: 56,
    color: Colors.lighter,
  },
  currentStep: {
    fontSize: 12,
    alignItems: 'center',
  },
  nextStep: {
    alignItems: 'center',
  },
  work: {
    backgroundColor: 'red',
    width: '100%',
  },
  prepare: {
    backgroundColor: 'mediumblue',
    width: '100%',
  },
  pause: {
    backgroundColor: 'green',
    width: '100%',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});
