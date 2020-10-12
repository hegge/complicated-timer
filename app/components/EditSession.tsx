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

import {
  Session,
  Entry,
  RepeatEntry,
  CountdownEntry,
} from '../Session'
import {
  capitalize,
  formatDuration,
  itemStyle,
} from '../utils';
import Colors from '../Colors.js';
import SharedStyles from '../SharedStyles';

interface ControlledTextInputProps {
  style?: ViewStyle,
  text: string,
  placeholder: string,
  keyboardType?: KeyboardTypeOptions,
  onChangeText: (text: string) => void,
}

const ControlledTextInput: React.FC<ControlledTextInputProps> = (props) => {
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
  item: RepeatEntry & NestedEntry,
  onPress: () => void,
}

const RepeatSessionItem: React.FC<RepeatSessionItemProps> = (props) => {
  const indent = 'nested' in props.item ? props.item.nested * 24 : 0;

  return <View style={styles.editItemContainer}>
    <Pressable
      style={[
        SharedStyles.repeat,
        {
          flexDirection: "row",
          marginStart: indent,
          padding: 10,
          justifyContent: "space-around",
        }]}
      onPress={props.onPress}>
      <Text>Repeat</Text>
      <Text>{props.repetitions}</Text>
    </Pressable>
  </View>
};

interface CountdownSessionItemProps {
  category: string
  duration: number
  item: CountdownEntry & NestedEntry,
  onPress: () => void,
}

const CountdownSessionItem: React.FC<CountdownSessionItemProps> = (props) => {
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
      onPress={props.onPress}>
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

const flattenSession = (session: Entry[]): (CountdownEntry & RepeatEntry & NestedEntry)[] => {
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

const EditSession: React.FC = ({ route, navigation }) => {
  const { item } = route.params;

  const [session, setSession] = useState(item.session);
  const [sessionName, setSessionName] = useState(item.name);
  const [sessionDescription, setSessionDescription] = useState(item.description);

  const addSessionContent = (entry: Entry) => {
    setSession([...session, entry]);
  }

  const renderSessionItem = ({ item }: { item: Entry }) => {
    if (item.type === "repeat") {
      let repeatItem = item as RepeatEntry & NestedEntry;
      return <RepeatSessionItem repetitions={repeatItem.repetitions} item={repeatItem}
        onPress={() => navigation.navigate('EditRepeat', { item: item })} />;
    } else {
      let countdownItem = item as CountdownEntry & NestedEntry;
      return <CountdownSessionItem category={countdownItem.category} duration={countdownItem.duration} item={countdownItem}
        onPress={() => navigation.navigate('EditCountdown', { item: item })} />
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={SharedStyles.body}>
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
export default EditSession;

export const EditRepeat: React.FC = ({ route }) => {
  const { item } = route.params;

  const [repetitions, setRepetitions] = useState(item.repetitions);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={SharedStyles.body}>
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

const RadioButton: React.FC<RadioButtonProps> = (props) => {
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

export const EditCountdown: React.FC = ({ route }) => {
  const { item } = route.params;

  const [duration, setDuration] = useState(item.duration);
  const [category, setCategory] = useState(item.category);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={SharedStyles.body}>
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
});