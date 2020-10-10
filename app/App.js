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

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="SessionList"
          component={SessionList}
          options={{ title: 'Sessions' }}
        />
        <Stack.Screen
          name="Play"
          component={Play}
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
        <Text style={styles.sessionDuration}>{formatDuration(duration)}</Text>
        <Text style={styles.sessionWorkDuration}>{formatDuration(workDuration)}</Text>
      </View>
    </Pressable>
  </View>
);

export const getSessionDuration = (session) => {
  var totalDuration = 0;
  var totalWorkDuration = 0;
  traverseSession(session, (entry, count, rep1, total1, rep2, total2) => {
    totalDuration += entry.duration;
    if (entry.category === "work") {
      totalWorkDuration += entry.duration;
    }
  });
  return { totalDuration, totalWorkDuration };
}

const SessionList = ({ navigation }) => {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const fetchSessions = () => {
    setLoading(true);
    fetch('https://complicated-timer.herokuapp.com/sessions')
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
      console.log("fetched")
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const renderSessionListItem = ({ item }) => {
    const { totalDuration, totalWorkDuration } = getSessionDuration(item.session);

    return (
      <SessionListItem name={item.name} description={item.description}
        duration={totalDuration} workDuration={totalWorkDuration}
        item={item} navigation={navigation} />
    );
  }

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

      {isLoading ?
        <View style={{
          flex: 1,
          justifyContent: "center",
          alignContent: "center",
          padding: 10
        }}>
          <ActivityIndicator size="large" color={Colors.darkblue} />
        </View>
        : (
          <FlatList
            data={data}
            keyExtractor={({ id }, index) => id.toString()}
            renderItem={renderSessionListItem}
            onRefresh={() => { fetchSessions() }}
            refreshing={isLoading}
            scrollEnabled={false}
            ListFooterComponent={
              !isLoading &&
              <Button
                color={Colors.darkblue}
                onPress={() => {
                  UUIDGenerator.getRandomUUID().then((uuid) => {
                    setData([...data, emptySession({ uuid })]);
                  });
                }}
                title="Create new session"
              />
            }
          />
        )}
    </>
  );
};

export const capitalize = (str) => (
  str.charAt(0).toUpperCase() + str.slice(1)
)

export const formatDuration = (duration, compact = false) => {
  if (duration < 60 && compact) {
    return new Date(duration * 1000).toISOString().substr(17, 2);
  } else if (duration < 3600) {
    return new Date(duration * 1000).toISOString().substr(14, 5);
  } else {
    return new Date(duration * 1000).toISOString().substr(11, 8);
  }
}

const itemStyle = (category) => {
  switch (category) {
    case "work":
      return styles.work;
    case "pause":
    case "done":
      return styles.pause;
    case "prepare":
      return styles.prepare;
  }
}

const doneSessionEntry = {
  category: "done",
  duration: 0
}

export const getSessionProgress = (session, index) => {
  var progress = "";
  traverseSession(session, (entry, count, rep1, total1, rep2, total2) => {
    if (total1 === 0) {
      progress = "";
    } else if (total2 === 0) {
      progress = (rep1 + 1) + "/" + total1;
    } else {
      progress = (rep1 + 1) + "/" + total1 + " " + (rep2 + 1) + "/" + total2;
    }
    if (index === count) {
      entryAtIndex = entry;
      return true;
    } else {
      return false;
    }
  });
  return progress
}

export const getSessionEntry = (session, index) => {
  var entryAtIndex = null;
  traverseSession(session, (entry, count, rep1, total1, rep2, total2) => {
    if (index === count) {
      entryAtIndex = entry;
      return true;
    } else {
      return false;
    }
  });
  return entryAtIndex;
}

const isSkipped = (entry, parentEntry, repNumber) => {
  return ('skip' in entry &&
    (entry.skip === 'first' && repNumber === 0) ||
    (entry.skip === 'last' && repNumber === (parentEntry.repetitions - 1)));
}

export const traverseSession = (session, callback) => {
  var count = 0;

  for (var i = 0; i < session.length; i++) {
    var entry = session[i];

    if (entry.type !== "repeat") {
      if (callback(entry, count++, 0, 0, 0, 0)) {
        return;
      }
    } else {
      for (var ii = 0; ii < entry.repetitions; ii++) {
        for (var j = 0; j < entry.group.length; j++) {
          var subEntry = entry.group[j];

          if (subEntry.type !== "repeat") {
            if (!isSkipped(subEntry, entry, ii) && callback(subEntry, count++, ii, entry.repetitions, 0, 0)) {
              return;
            }
          } else {
            for (var jj = 0; jj < subEntry.repetitions; jj++) {
              for (var k = 0; k < subEntry.group.length; k++) {
                var subSubEntry = subEntry.group[k];

                if (subSubEntry.type !== "repeat") {
                  if (!isSkipped(subSubEntry, subEntry, jj) && callback(subSubEntry, count++, ii, entry.repetitions, jj, subEntry.repetitions)) {
                    return;
                  }
                } else {
                  throw new Error("Deep nesting not supported");
                }
              }
            }
          }
        }
      }
    }
  }
  callback(doneSessionEntry, count++, 0, 0, 0, 0);
}

const Play = ({ route, navigation }) => {
  const { item } = route.params;

  const [session, setSession] = useState(item.session);
  const [currentStepCount, setCurrentStepCount] = useState(0);

  const prevStep = getSessionEntry(session, currentStepCount - 1);
  const currentStep = getSessionEntry(session, currentStepCount);
  const nextStep = getSessionEntry(session, currentStepCount + 1);
  const progress = getSessionProgress(session, currentStepCount);

  const [timerValue, setTimerValue] = useState(currentStep.duration);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setTimerValue(timerValue - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  });

  useEffect(() => {
    if (isRunning && currentStep.category === "done") {
      setIsRunning(false);
      setTimerValue(0);
    }
  });

  useEffect(() => {
    if (isRunning && timerValue < 0) {
      setTimerValue(nextStep.duration);
      setCurrentStepCount(currentStepCount + 1);
    }
  });

  const onPlayPauseClicked = () => {
    console.log("play/pause clicked")
    setIsRunning(!isRunning);
  }

  const onBackClicked = () => {
    console.log("back clicked")
    if (isRunning) {
      setTimerValue(currentStep.duration);
    } else if (currentStepCount === 0) {
      setTimerValue(currentStep.duration);
    } else {
      setCurrentStepCount(currentStepCount - 1);
      setTimerValue(prevStep.duration);
    }
    setIsRunning(false);
  }

  const onNextClicked = () => {
    console.log("next clicked")
    if (nextStep.category !== "done") {
      setCurrentStepCount(currentStepCount + 1);
      setTimerValue(nextStep.duration);
    }
    setIsRunning(false);
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.currentStep, itemStyle(currentStep.category)]}>
        <Text style={styles.stepProgress}>{progress}</Text>
        <Text style={styles.stepName}>{capitalize(currentStep.category)}</Text>
        <Text style={styles.timer}>{formatDuration(timerValue, compact = true)}</Text>
        <Button
          color={Colors.darkblue}
          onPress={() => { onPlayPauseClicked() }}
          title={isRunning ? "Pause" : "Start"}
        />
        <View style={styles.stepProgressBar} />
        <View
          style={{
            flexDirection: "row",
            paddingVertical: 12,
            justifyContent: 'space-between'
          }}>
          <Button
            color={Colors.darkblue}
            onPress={() => { onBackClicked() }}
            title="Back" />
          <View style={styles.sessionProgressBar} />
          <Button
            color={Colors.darkblue}
            onPress={() => { onNextClicked() }}
            title="Next" />
        </View>
      </View>

      {currentStep.category === "done" ||
        <View style={[styles.nextStep, itemStyle(nextStep.category)]}>
          <Text style={styles.nextTitle}>Next</Text>
          <Text style={styles.nextName}>{capitalize(nextStep.category)}</Text>
          {nextStep.category === "done" ||
            <Text style={styles.nextDuration}>{formatDuration(nextStep.duration)}</Text>
          }
        </View>
      }

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
  const [value, setText] = useState(text);

  return (
    <TextInput
      onChangeText={text => setText(text)}
      value={value}
      placeholder={placeholder}
    />
  );
}

const emptyStep = {
  "type": "countdown",
  "category": "work",
  "duration": 60
}

const emptyRepeat = {
  "type": "repeat",
  "repetitions": 4,
  "group": []
}

const RepeatSessionItem = ({ repetitions, item, navigation }) => {
  const indent = 'nested' in item ? item.nested * 24 : 0;

  return <View style={styles.editItemContainer}>
    <Pressable
      style={[
        styles.repeat,
        {
          flexDirection: "row",
          marginStart: indent,
          padding: 10,
          justifyContent: "space-around",
        }]}
      onPress={() => {
        navigation.navigate('EditRepeat', { item: item })
      }}>
      <Text>Repeat</Text>
      <Text>{repetitions}</Text>
    </Pressable>
  </View>
};

const CountdownSessionItem = ({ category, duration, item, navigation }) => {
  const indent = 'nested' in item ? item.nested * 24 : 0;

  return <View style={styles.editItemContainer}>
    <Pressable
      style={[
        itemStyle(category),
        {
          flexDirection: "row",
          marginStart: indent,
          padding: 10,
          justifyContent: "space-around",
        }]}
      onPress={() => {
        navigation.navigate('EditCountdown', { item: item })
      }}>
      <Text>{capitalize(category)}</Text>
      <Text>{formatDuration(duration)}</Text>
    </Pressable>
  </View>
};

function extend(target, source) {
  for (var key in source) {
    target[key] = source[key];
  }
  return target;
}

const flattenSession = (session) => {
  var flattened = [];
  for (var i = 0; i < session.length; i++) {
    var entry = session[i];
    flattened.push(entry);

    if ('group' in entry) {
      for (var j = 0; j < entry.group.length; j++) {
        var subEntry = entry.group[j];
        flattened.push(extend(subEntry, { nested: 1 }));

        if ('group' in subEntry) {
          for (var k = 0; k < subEntry.group.length; k++) {
            var subSubEntry = subEntry.group[k];
            flattened.push(extend(subSubEntry, { nested: 2 }));

            if (subSubEntry.type === "repeat") {
              throw new Error("Deep nesting not supported");
            }
          }
        }
      }
    }
  }
  return flattened;
}

const EditSession = ({ route, navigation }) => {
  const { item } = route.params;

  const [session, setSession] = useState(item.session);

  const renderSessionItem = ({ item }) => {
    if (item.type === "repeat") {
      return <RepeatSessionItem repetitions={item.repetitions} item={item} navigation={navigation} />;
    } else {
      return <CountdownSessionItem category={item.category} duration={item.duration} item={item} navigation={navigation} />
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.body}>
        <View style={styles.descriptiveTextInputContainer}>
          <Text style={styles.padAfter}>Session name:</Text>
          <UselessTextInput style={styles.textInput} text={item.name} placeholder="Enter name" />
        </View>
        <View style={styles.descriptiveTextInputContainer}>
          <Text style={styles.padAfter}>Session description:</Text>
          <UselessTextInput style={styles.textInput} text={item.description} placeholder="Enter description" />
        </View>
        <FlatList
          data={flattenSession(session)}
          keyExtractor={({ id }, index) => id == null ? index.toString() : id.toString()}
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

const EditRepeat = ({ route, navigation }) => {
  const { item } = route.params;

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.body}>
        <View style={styles.descriptiveTextInputContainer}>
          <Text style={styles.padAfter}>Number of repetitions:</Text>
          <UselessTextInput style={styles.textInput} text={item.repetitions.toString()} placeholder="Enter repetitions" />
        </View>
      </View>
    </>
  );
};

function RadioButton(props) {
  console.log(props)
  return (
    <View style={[{
      height: 24,
      width: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#000',
      alignItems: 'center',
      justifyContent: 'center',
    }, props.style]}>
      {
        props.selected ?
          <View style={{
            height: 12,
            width: 12,
            borderRadius: 6,
            backgroundColor: '#000',
          }} />
          : null
      }
    </View>
  );
}

const EditCountdown = ({ route, navigation }) => {
  const { item } = route.params;

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.body}>
        <View style={styles.descriptiveTextInputContainer}>
          <Text style={styles.padAfter}>Duration:</Text>
          <UselessTextInput style={styles.textInput} text={item.duration.toString()} placeholder="Enter duration" />
        </View>
        <View style={styles.descriptiveTextInputContainer}>
          <Text style={styles.padAfter}>Category:</Text>
          <RadioButton selected={true}></RadioButton>
          <Text>{item.category}</Text>
        </View>
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
    flex: 4,
  },
  nextStep: {
    alignItems: 'center',
    flex: 1,
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
  },
  prepare: {
    backgroundColor: Colors.blue,
  },
  pause: {
    backgroundColor: Colors.green,
  },
  repeat: {
    backgroundColor: Colors.yellow,
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
  descriptiveTextInputContainer: {
    flexDirection: "row",
    alignItems: 'center',
    padding: 8,
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
