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

import Colors from './Colors.js';
import Header from './Header.js';

const SessionListItem = ({ name, description, duration, workDuration }) => (
  <View style={styles.sessionContainer}>
    <Pressable
      style={{
        flexDirection: "row",
      }}
      onPress={() => {
        alert('You tapped the button!');
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

const SessionList: () => React$Node = () => {
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
      duration="14:00" workDuration="10:00" />
  );

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
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const Play: () => React$Node = () => {
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
          alert('You tapped the button!');
        }}
        title="Edit"
      />
    </>
  );
};

const UselessTextInput = ({ placeholder }) => {
  const [value, onChangeText] = React.useState("");

  return (
    <TextInput
      onChangeText={text => onChangeText(text)}
      value={value}
      defaultValue={placeholder}
    />
  );
}

const EditSession: () => React$Node = () => {
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

export default SessionList;
