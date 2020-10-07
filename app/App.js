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
          name="SessionList"
          component={SessionList}
          options={{ title: 'Complicated Timer' }}
        />
        <Stack.Screen
          name="Play"
          component={Play}
          options={({ route }) => ({ title: route.params.name })} />
        <Stack.Screen
          name="EditSession"
          component={EditSession}
          options={{ title: 'Edit session' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

const SessionListItem = ({ name, description, duration, workDuration, item, navigation }) => (
  <View style={styles.sessionContainer}>
    <Pressable
      style={{
        flexDirection: "row",
      }}
      onPress={() => {
        navigation.navigate('Play', { item: item, name: name })
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
      item={item} navigation={navigation} />
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
              color={Colors.darkblue}
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

const Play = ({ route, navigation }) => {
  const { item } = route.params;

  const [timerValue, setTimerValue] = useState(20);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const progress = "1/2 1/3";

  const currentStepName = "Prepare"
  const currentStepDuration = 20;
  const currentStepCategory = "prepare";

  const nextStepName = "Work";
  const nextStepDuration = 7;
  const nextStepCategory = "work";

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.prepare}>
        <View style={styles.currentStep}>
          <Text style={styles.stepProgress}>{progress}</Text>
          <Text style={styles.stepName}>{currentStepName}</Text>
          <Text style={styles.timer}>{timerValue}</Text>
          <Button
            color={Colors.darkblue}
            onPress={() => {
              setIsRunning(!isRunning);
            }}
            title={isRunning ? "Pause" : "Start"}
          />
          <View
            style={{
              flexDirection: "row",
              paddingVertical: 12,
              justifyContent: 'space-between'
            }}>
            <Button
              color={Colors.darkblue}
              onPress={() => {
                {
                  isRunning ?
                    setTimerValue(currentStepDuration) :
                    setCurrentStep(currentStep - 1)
                }
                setIsRunning(false);
              }}
              title="Back" />
            <View style={styles.stepProgressBar} />
            <Button
              color={Colors.darkblue}
              onPress={() => {
                setCurrentStep(currentStep + 1);
                setIsRunning(false);
              }}
              title="Next" />
          </View>
          <View style={styles.sessionProgressBar} />
        </View>
      </View >

      <View style={styles.work}>
        <View style={styles.nextStep}>
          <Text style={styles.nextTitle}>Next</Text>
          <Text style={styles.nextName}>{nextStepName}</Text>
          <Text style={styles.nextDuration}>00:0{nextStepDuration}</Text>
        </View>
      </View>

      <Button
        color={Colors.darkblue}
        onPress={() => {
          navigation.navigate('EditSession', { item: item })
        }}
        title="Edit"
      />
    </>
  );
};

const UselessTextInput = ({ text, placeholder }) => {
  const [value, setText] = React.useState(text);

  return (
    <TextInput
      onChangeText={text => setText(text)}
      value={value}
      placeholder={placeholder}
    />
  );
}

const emptyStep = () => {
  return (
    {
      "type": "countdown",
      "category": "work",
      "duration": 60
    }
  );
}

const emptyRepeat = () => {
  return (
    {
      "type": "repeat",
      "repetitions": 4,
      "group": []
    }
  );
}

const RepeatSessionItem = ({ repetitions, item, }) => (
  <View style={styles.editItemContainer}>
    <View style={styles.repeat} >
      <Pressable
        style={{
          flexDirection: "row",
        }}
        onPress={() => {
        }}>
        <Text>Repeat</Text>
        <Text>{repetitions}</Text>
      </Pressable>
    </View>
  </View>
);

const CountdownSessionItem = ({ category, duration, item, }) => {
  const itemStyle = category === "work" ?
    styles.work :
    category == "pause" ?
      styles.pause :
      styles.prepare;

  return <View style={styles.editItemContainer}>
    <View style={itemStyle}>
      <Pressable
        style={{
          flexDirection: "row",
        }}
        onPress={() => {
        }}>
        <Text>{category}</Text>
        <Text>{duration}</Text>
      </Pressable>
    </View>
  </View>
};

const EditSession = ({ route, navigation }) => {
  const { item } = route.params;

  const [session, setSession] = React.useState(item.session);
  console.log(item.session);

  const renderSessionItem = ({ item }) => {
    if (item.type === "repeat") {
      return <RepeatSessionItem repetitions={item.repetitions} item={item} />;
    } else {
      return <CountdownSessionItem category={item.category} duration={item.duration} item={item} />
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.body}>
        <View style={styles.sectionContainer}>
          <UselessTextInput style={styles.textInput} text={item.name} placeholder="Enter name" />
          <UselessTextInput style={styles.textInput} text={item.description} placeholder="Enter description" />
        </View>
        <FlatList
          data={session}
          renderItem={renderSessionItem}
        />
        <Button
          color={Colors.darkblue}
          onPress={() => {
            setSession([...session, emptyStep()]);
          }}
          title="Add step"
        />
        <Button
          color={Colors.darkblue}
          onPress={() => {
            setSession([...session, emptyRepeat()]);
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
    fontSize: 24,
    paddingVertical: 8,
    color: Colors.lighter,
  },
  stepProgress: {
    fontSize: 32,
    paddingVertical: 8,
    color: Colors.lighter,
  },
  timer: {
    fontSize: 128,
    color: Colors.lighter,
  },
  currentStep: {
    fontSize: 12,
    alignItems: 'center',
    height: "75%",
  },
  nextStep: {
    alignItems: 'center',
    height: "15%",
  },
  nextTitle: {
    fontSize: 18,
    color: Colors.lighter,
  },
  nextName: {
    fontSize: 18,
    color: Colors.lighter,
  },
  nextDuration: {
    fontSize: 18,
    color: Colors.lighter,
  },
  work: {
    backgroundColor: Colors.red,
    width: '100%',
  },
  prepare: {
    backgroundColor: Colors.blue,
    width: '100%',
  },
  pause: {
    backgroundColor: Colors.green,
    width: '100%',
  },
  repeat: {
    backgroundColor: Colors.yellow,
    width: '100%',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
  },
  editItemContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
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
