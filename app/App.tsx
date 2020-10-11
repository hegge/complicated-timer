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
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  View,
  Text,
  TextInput,
  StatusBar,
  ViewProps,
  ViewStyle,
} from 'react-native';

import 'react-native-gesture-handler';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import UUIDGenerator from 'react-native-uuid-generator';

import Slider from '@react-native-community/slider';

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

interface SessionListItemProps {
  name: string,
  description: string,
  duration: number,
  workDuration: number,
  item: Session,
}

const SessionListItem = (props: SessionListItemProps) => {
  const navigation = useNavigation();

  return (
    <View style={styles.sessionContainer}>
      <Pressable
        style={{
          flexDirection: "row",
        }}
        onPress={() => {
          navigation.navigate('Play', { item: props.item, name: props.name })
        }}>
        <View
          style={{
            flexDirection: "column",
            flex: 1,
          }}>
          <Text style={styles.sessionName}>{props.name}</Text>
          <Text style={styles.sessionDescription}>{props.description}</Text>
        </View>
        <View
          style={{
            flexDirection: "column",
            justifyContent: "flex-end",
            flex: 0,
          }}>
          <Text style={styles.sessionDuration}>{formatDuration(props.duration)}</Text>
          <Text style={styles.sessionWorkDuration}>{formatDuration(props.workDuration)}</Text>
        </View>
      </Pressable>
    </View>
  )
};

interface Session {
  name: string,
  description: string,
  session: Entry[],
  id?: string,
}

type Entry = RepeatEntry | CountdownEntry;

interface RepeatEntry {
  type: string,
  repetitions: number,
  group: Entry[],
}

interface CountdownEntry {
  type: string,
  category: string,
  duration: number,
  skip?: string
}

export const getSessionDuration = (session: Entry[]) => {
  var totalDuration = 0;
  var totalWorkDuration = 0;
  traverseSession(session, (entry, count, rep1, total1, rep2, total2) => {
    totalDuration += entry.duration;
    if (entry.category === "work") {
      totalWorkDuration += entry.duration;
    }
    return false;
  });
  return { totalDuration, totalWorkDuration };
}

const SessionList: React.FC = () => {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const fetchSessions = () => {
    setLoading(true);
    fetch('https://complicated-timer.herokuapp.com/sessions')
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const renderSessionListItem = ({ item }: { item: Session }) => {
    const { totalDuration, totalWorkDuration } = getSessionDuration(item.session);

    return (
      <SessionListItem name={item.name} description={item.description}
        duration={totalDuration} workDuration={totalWorkDuration}
        item={item} />
    );
  }

  const emptySession = ({ uuid }: { uuid: string }): Session => {
    return (
      {
        id: uuid,
        name: "",
        description: "",
        session: []
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
          <View
            style={{
              flexDirection: "column",
              flex: 1,
            }}>
            <FlatList
              data={data}
              keyExtractor={({ id }, index) => id == null ? index.toString() : id.toString()}
              renderItem={renderSessionListItem}
              onRefresh={() => { fetchSessions() }}
              refreshing={isLoading}
            />
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
        )}
    </>
  );
};

export const capitalize = (str: string) => (
  str.charAt(0).toUpperCase() + str.slice(1)
)

export const formatDuration = (duration: number, compact = false) => {
  if (duration < 60 && compact) {
    return new Date(duration * 1000).toISOString().substr(17, 2);
  } else if (duration < 3600) {
    return new Date(duration * 1000).toISOString().substr(14, 5);
  } else {
    return new Date(duration * 1000).toISOString().substr(11, 8);
  }
}

const itemStyle = (category: string) => {
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

const doneSessionEntry: CountdownEntry = {
  type: "countdown",
  category: "done",
  duration: 0,
}

export const getSessionProgress = (session: Entry[], index: number) => {
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
      return true;
    } else {
      return false;
    }
  });
  return progress
}

type EntryCallback = (entry: CountdownEntry, count: number, rep1: number, total1: number, rep2: number, total2: number) => boolean

export const getSessionEntry = (session: Entry[], index: number): CountdownEntry | null => {
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

export const getSessionEntryCount = (session: Entry[]) => {
  var entryCount = 0;
  traverseSession(session, (entry, count, rep1, total1, rep2, total2) => {
    if (entry.type === "done") {
      return true;
    } else {
      entryCount++;
      return false;
    }
  });
  return entryCount;
}

const isSkipped = (entry: CountdownEntry, parentEntry: RepeatEntry, repNumber: number) => {
  return ('skip' in entry &&
    (entry.skip === 'first' && repNumber === 0) ||
    (entry.skip === 'last' && repNumber === (parentEntry.repetitions - 1)));
}

export const traverseSession = (session: Entry[], callback: EntryCallback) => {
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

const Play: React.FC = ({ route, navigation }) => {
  const { item } = route.params;

  const [session, setSession] = useState(item.session);
  const [currentStepCount, setCurrentStepCount] = useState(0);

  const prevStep = getSessionEntry(session, currentStepCount - 1);
  const currentStep = getSessionEntry(session, currentStepCount);
  const nextStep = getSessionEntry(session, currentStepCount + 1);
  const progress = getSessionProgress(session, currentStepCount);

  const [timerValue, setTimerValue] = useState(currentStep!.duration);
  const [isRunning, setIsRunning] = useState(false);

  const sessionEntryCount = getSessionEntryCount(item.session);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setTimerValue(timerValue - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  });

  useEffect(() => {
    if (isRunning && currentStep!.category === "done") {
      setIsRunning(false);
      setTimerValue(0);
    }
  });

  useEffect(() => {
    if (timerValue < 0) {
      setTimerValue(nextStep!.duration);
      setCurrentStepCount(currentStepCount + 1);
    }
  });

  const onPlayPauseClicked = () => {
    console.log("play/pause clicked");
    setIsRunning(!isRunning);
  }

  const onForwardClicked = () => {
    console.log("forward clicked");
    setTimerValue(timerValue - 1);
  }

  const onReverseClicked = () => {
    console.log("reverse clicked");
    if (timerValue < currentStep!.duration) {
      setTimerValue(timerValue + 1);
    }
  }

  const onBackClicked = () => {
    console.log("back clicked")
    if (isRunning) {
      setTimerValue(currentStep!.duration);
    } else if (currentStepCount === 0) {
      setTimerValue(currentStep!.duration);
    } else {
      setCurrentStepCount(currentStepCount - 1);
      setTimerValue(prevStep!.duration);
    }
    setIsRunning(false);
  }

  const onNextClicked = () => {
    console.log("next clicked")
    if (nextStep!.category !== "done") {
      setCurrentStepCount(currentStepCount + 1);
      setTimerValue(nextStep!.duration);
    }
    setIsRunning(false);
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.currentStep, itemStyle(currentStep!.category)]}>
        <Text style={styles.stepProgress}>{progress}</Text>
        <Text style={styles.stepName}>{capitalize(currentStep!.category)}</Text>
        <Text style={styles.timer}>{formatDuration(timerValue, true)}</Text>
        <Button
          color={Colors.darkblue}
          onPress={() => { onPlayPauseClicked() }}
          title={isRunning ? "Pause" : "Start"}
        />
        <View
          style={{
            flexDirection: "row",
            paddingVertical: 4,
            justifyContent: 'space-between'
          }}>
          <Button
            color={Colors.darkblue}
            onPress={() => { onReverseClicked() }}
            title="Reverse" />
          <Slider
            style={{ width: 200, height: 40 }}
            inverted={true}
            minimumValue={0}
            maximumValue={currentStep!.duration}
            step={1}
            value={timerValue}
            onValueChange={(value) => setTimerValue(value)}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
          />
          <Button
            color={Colors.darkblue}
            onPress={() => { onForwardClicked() }}
            title="Forward" />
        </View>
        <View
          style={{
            flexDirection: "row",
            paddingVertical: 4,
            justifyContent: 'space-between'
          }}>
          <Button
            color={Colors.darkblue}
            onPress={() => { onBackClicked() }}
            title="Back" />
          <Slider
            style={{ width: 200, height: 40 }}
            minimumValue={0}
            maximumValue={sessionEntryCount}
            step={1}
            value={currentStepCount}
            onValueChange={(value) => {
              setCurrentStepCount(value);
              setTimerValue(-1);
            }}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
          />
          <Button
            color={Colors.darkblue}
            onPress={() => { onNextClicked() }}
            title="Next" />
        </View>
      </View>

      {currentStep!.category === "done" ||
        <View style={[styles.nextStep, itemStyle(nextStep!.category)]}>
          <Text style={styles.nextTitle}>Next</Text>
          <Text style={styles.nextName}>{capitalize(nextStep!.category)}</Text>
          {nextStep!.category === "done" ||
            <Text style={styles.nextDuration}>{formatDuration(nextStep!.duration)}</Text>
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

interface ControlledTextInputProps {
  style?: ViewStyle,
  text: string,
  placeholder: string,
  keyboardType?: KeyboardTypeOptions,
  onChangeText: (text: string) => void,
}

const ControlledTextInput = (props: ControlledTextInputProps) => {
  const setText = (text: string) => {
    props.onChangeText(text);
  }

  return (
    <TextInput
      style={props.style}
      onChangeText={text => setText(text)}
      value={props.text}
      keyboardType={props.keyboardType}
      placeholder={props.placeholder}
    />
  );
}

const emptyStep: CountdownEntry = {
  type: "countdown",
  category: "work",
  duration: 60
}

const emptyRepeat: RepeatEntry = {
  type: "repeat",
  repetitions: 4,
  group: []
}

interface NestedEntry {
  nested: number,
}

interface RepeatSessionItemProps {
  repetitions: number,
  item: RepeatEntry & NestedEntry
}

const RepeatSessionItem = (props: RepeatSessionItemProps) => {
  const navigation = useNavigation();
  const indent = 'nested' in props.item ? props.item.nested * 24 : 0;

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
        navigation.navigate('EditRepeat', { item: props.item })
      }}>
      <Text>Repeat</Text>
      <Text>{props.repetitions}</Text>
    </Pressable>
  </View>
};

interface CountdownSessionItemProps {
  category: string
  duration: number
  item: CountdownEntry & NestedEntry
}

const CountdownSessionItem = (props: CountdownSessionItemProps) => {
  const navigation = useNavigation();
  const indent = 'nested' in props.item ? props.item.nested * 24 : 0;

  return <View style={styles.editItemContainer}>
    <Pressable
      style={[
        itemStyle(props.category),
        {
          flexDirection: "row",
          marginStart: indent,
          padding: 10,
          justifyContent: "space-around",
        }]}
      onPress={() => {
        navigation.navigate('EditCountdown', { item: props.item })
      }}>
      <Text>{capitalize(props.category)}</Text>
      <Text>{formatDuration(props.duration)}</Text>
    </Pressable>
  </View>
};

function extend(target: any, source: any): any {
  for (var key in source) {
    target[key] = source[key];
  }
  return target;
}

const flattenSession = (session: Entry[]) => {
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

const EditSession: React.FC = ({ route }) => {
  const { item } = route.params;

  const [session, setSession] = useState(item.session);
  const [sessionName, setSessionName] = useState(item.name);
  const [sessionDescription, setSessionDescription] = useState(item.description);

  const addSessionContent = (entry: Entry) => {
    setSession([...session, entry]);
  }

  const renderSessionItem = ({ item }: { item: Entry }) => {
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
        <View style={styles.descriptiveTextInputContainer}>
          <Text>Session name:</Text>
          <ControlledTextInput
            style={styles.textInput}
            text={sessionName}
            placeholder="Enter name"
            onChangeText={(text: string) => setSessionName(text)}
          />
        </View>
        <View style={styles.descriptiveTextInputContainer}>
          <Text>Session description:</Text>
          <ControlledTextInput
            style={styles.textInput}
            text={sessionDescription}
            placeholder="Enter description"
            onChangeText={(text: string) => setSessionDescription(text)}
          />
        </View>
        <FlatList
          style={{
            flexDirection: "column",
            flex: 1,
          }}
          data={flattenSession(session)}
          keyExtractor={({ id }, index) => id == null ? index.toString() : id.toString()}
          renderItem={renderSessionItem}
        />
        <Button
          color={Colors.darkblue}
          onPress={() => {
            addSessionContent(emptyStep);
          }}
          title="Add step"
        />
        <Button
          color={Colors.darkblue}
          onPress={() => {
            addSessionContent(emptyRepeat);
          }}
          title="Add repeat"
        />
      </View>
    </>
  );
};

const EditRepeat: React.FC = ({ route }) => {
  const { item } = route.params;

  const [repetitions, setRepetitions] = useState(item.repetitions);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.body}>
        <View style={styles.descriptiveTextInputContainer}>
          <Text>Number of repetitions:</Text>
          <ControlledTextInput
            style={styles.textInput}
            keyboardType="number-pad"
            text={repetitions.toString()}
            placeholder="Enter repetitions"
            onChangeText={(text: string) => setRepetitions(text)}
          />
        </View>
      </View>
    </>
  );
};

interface RadioButtonProps {
  style?: ViewProps,
  selected: boolean
}

function RadioButton(props: RadioButtonProps) {
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

const EditCountdown: React.FC = ({ route }) => {
  const { item } = route.params;

  const [duration, setDuration] = useState(item.duration);
  const [category, setCategory] = useState(item.category);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.body}>
        <View style={styles.descriptiveTextInputContainer}>
          <Text>Duration:</Text>
          <ControlledTextInput
            style={styles.textInput}
            keyboardType="number-pad"
            text={duration.toString()}
            placeholder="Enter duration"
            onChangeText={(text: string) => setDuration(text)}
          />
        </View>
        <View style={styles.descriptiveRatioButtonContainer}>
          <Text>Category:</Text>
          <View style={styles.ratioButtonContainer}>
            <Pressable
              style={styles.ratioButtonElement}
              onPress={() => setCategory("work")}
            >
              <RadioButton selected={category === "work"}></RadioButton>
              <Text>Work</Text>
            </Pressable>
            <Pressable
              style={styles.ratioButtonElement}
              onPress={() => { setCategory("pause") }}
            >
              <RadioButton selected={category === "pause"}></RadioButton>
              <Text>Pause</Text>
            </Pressable>
            <Pressable
              style={styles.ratioButtonElement}
              onPress={() => setCategory("prepare")}
            >
              <RadioButton selected={category === "prepare"}></RadioButton>
              <Text>Prepare</Text>
            </Pressable>
          </View>
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
    flex: 1
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
    paddingVertical: 4,
    color: Colors.lighter,
  },
  stepProgress: {
    fontSize: 32,
    paddingVertical: 4,
    color: Colors.lighter,
  },
  timer: {
    fontSize: 128,
    color: Colors.lighter,
  },
  currentStep: {
    fontSize: 12,
    alignItems: 'center',
    flex: 5,
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
  descriptiveRatioButtonContainer: {
    padding: 8,
  },
  ratioButtonContainer: {
    flexDirection: "column",
  },
  ratioButtonElement: {
    flexDirection: "row",
    alignContent: "center",
    padding: 4,
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
