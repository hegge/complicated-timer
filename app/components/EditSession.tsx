import React, { useEffect, useState } from 'react';

import {
  Button,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { bindActionCreators } from 'redux';
import { connect, ConnectedProps } from 'react-redux';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../App';

import {
  setSession,
  addSessionEntry,
  setSessionName,
  setSessionDescription,
  moveEntryUp,
  moveEntryDown,
  deleteEntry,
} from '../actions/editActions';

import {
  flattenedSessionSelector,
  sessionNameSelector,
  sessionDescriptionSelector,
} from '../reducers/editReducer';

import {
  Entry,
  RepeatEntry,
  CountdownEntry,
} from '../session'

import ControlledTextInput from './ControlledTextInput';

import { RootState } from '../reducers/index';

import {
  capitalize,
  formatDuration,
  itemStyle,
  NestedEntry,
} from '../utils';

import { HeaderBackButton } from '@react-navigation/stack';

import Colors from '../colors';
import SharedStyles from '../sharedStyles';

const emptyStep: CountdownEntry = {
  type: "countdown",
  category: "work",
  duration: 60,
}

const emptyRepeat: RepeatEntry = {
  type: "repeat",
  repetitions: 4,
  group: [],
}

interface RepeatSessionItemProps {
  repetitions: number,
  item: RepeatEntry & NestedEntry,
  onPress: () => void,
  onLongPress: () => void,
  selected: boolean,
}

const RepeatSessionItem: React.FC<RepeatSessionItemProps> = (props) => {
  const indent = 'nested' in props.item ? props.item.nested * 32 : 0;

  return <View style={styles.editItemContainer}>
    <Pressable
      style={[
        props.selected ? SharedStyles.selected : SharedStyles.repeat,
        {
          flexDirection: "row",
          marginStart: indent,
          padding: 8,
          justifyContent: "space-around",
        }]}
      onPress={props.onPress}
      onLongPress={props.onLongPress}>
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
  onLongPress: () => void,
  selected: boolean,
}

const CountdownSessionItem: React.FC<CountdownSessionItemProps> = (props) => {
  const indent = 'nested' in props.item ? props.item.nested * 32 : 0;

  return <View style={styles.editItemContainer}>
    <Pressable
      style={[
        props.selected ? SharedStyles.selected : itemStyle(props.category),
        {
          flexDirection: "row",
          marginStart: indent,
          padding: 8,
          justifyContent: "space-around",
        }]}
      onPress={props.onPress}
      onLongPress={props.onLongPress}>
      <Text>{capitalize(props.category)}</Text>
      <Text>{formatDuration(props.duration)}</Text>
    </Pressable>
  </View>
};

interface Props extends PropsFromRedux {
  route: RouteProp<RootStackParamList, 'EditSession'>;
  navigation: StackNavigationProp<RootStackParamList, 'EditSession'>;
}

const EditSession: React.FC<Props> = (props) => {
  const { route, navigation } = props;

  const index = route.params.index;
  const session = props.sessions[index];
  useEffect(() => {
    props.setSession(session)
    setSelectedEntry(-1);
  }, []);

  const flatList = React.useRef(null)

  const addSessionEntry = (entry: Entry) => {
    props.addSessionEntry(entry);
    flatList.current?.scrollToEnd();
  }

  const renderSessionItem = ({ item, index }: { item: Entry, index: number }) => {
    if (item.type === "repeat") {
      let repeatItem = item as RepeatEntry & NestedEntry;
      return <RepeatSessionItem repetitions={repeatItem.repetitions} item={repeatItem}
        onPress={() => selectedEntry < 0 ? navigation.navigate('EditRepeat', { index }) : setSelectedEntry(index)}
        onLongPress={() => setSelectedEntry(index)}
        selected={selectedEntry === index} />;
    } else {
      let countdownItem = item as CountdownEntry & NestedEntry;
      return <CountdownSessionItem category={countdownItem.category} duration={countdownItem.duration} item={countdownItem}
        onPress={() => selectedEntry < 0 ? navigation.navigate('EditCountdown', { index }) : setSelectedEntry(index)}
        onLongPress={() => { setSelectedEntry(index) }}
        selected={selectedEntry === index} />
    }
  };

  const [selectedEntry, setSelectedEntry] = useState(-1);

  React.useLayoutEffect(() => {
    navigation.setOptions(
      (selectedEntry >= 0) ? {
        headerRight: () => (
          <View
            style={{
              paddingHorizontal: 8,
              flexDirection: "row"
            }}>
            <Button
              color={Colors.darkblue}
              onPress={() => {
                props.moveEntryUp(selectedEntry)
              }}
              title="Up"
            />
            <Button
              color={Colors.darkblue}
              onPress={() => {
                props.moveEntryDown(selectedEntry)
              }}
              title="Down"
            />
            <Button
              color={Colors.darkblue}
              onPress={() => {
                props.deleteEntry(selectedEntry)
              }}
              title="Delete"
            />
          </View>
        ),
        headerLeft: () => (
          <HeaderBackButton onPress={() => { setSelectedEntry(-1) }} />
        ),
      } : {
          headerRight: undefined,
          headerLeft: undefined
        });
  }, [navigation, selectedEntry]);

  return (
    <>
      <StatusBar barStyle="default" />
      <View style={SharedStyles.body}>
        <View style={SharedStyles.descriptiveTextInputContainer}>
          <Text style={SharedStyles.descriptiveTextInputTitle}>Name:</Text>
          <ControlledTextInput
            style={SharedStyles.textInput}
            text={props.sessionName}
            placeholder="Enter name"
            onChangeText={(text: string) => props.setSessionName(text)}
          />
        </View>
        <View style={SharedStyles.descriptiveTextInputContainer}>
          <Text style={SharedStyles.descriptiveTextInputTitle}>Description:</Text>
          <ControlledTextInput
            style={SharedStyles.textInput}
            text={props.sessionDescription}
            placeholder="Enter description"
            onChangeText={(text: string) => props.setSessionDescription(text)}
          />
        </View>
        <FlatList
          style={{
            flexDirection: "column",
            flex: 1,
          }}
          data={props.flattenedSession}
          keyExtractor={(props, index) => index.toString()}
          renderItem={renderSessionItem}
          ref={flatList}
        />
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            backgroundColor: Colors.light
          }}>
          <View
            style={{
              flex: 1,
              marginHorizontal: 1,
            }}>
            <Button
              color={Colors.darkblue}
              onPress={() => {
                addSessionEntry(emptyStep);
              }}
              title="Add step"
            /></View>
          <View
            style={{
              flex: 1,
              marginHorizontal: 1,
            }}>
            <Button
              color={Colors.darkblue}
              onPress={() => {
                addSessionEntry(emptyRepeat);
              }}
              title="Add repeat"
            /></View>
        </View>
      </View>
    </>
  );
};
function mapStateToProps(state: RootState) {
  return {
    sessions: state.sessions.sessions,
    flattenedSession: flattenedSessionSelector(state.edit),
    sessionName: sessionNameSelector(state.edit),
    sessionDescription: sessionDescriptionSelector(state.edit),
  };
}
function matchDispatchToProps(dispatch: any) {
  return bindActionCreators({
    setSession,
    addSessionEntry,
    setSessionName,
    setSessionDescription,
    moveEntryUp,
    moveEntryDown,
    deleteEntry,
  }, dispatch)
}
const connector = connect(mapStateToProps, matchDispatchToProps)
type PropsFromRedux = ConnectedProps<typeof connector>
export default connector(EditSession)

const styles = StyleSheet.create({
  editItemContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: "100%",
  },
});