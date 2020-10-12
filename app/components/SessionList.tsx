import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Button,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import UUIDGenerator from 'react-native-uuid-generator';

import {
  Session,
} from '../Session'
import {
  formatDuration,
  getSessionDuration,
} from '../utils';
import Colors from '../Colors.js';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { setSessions, addSession, setLoading } from '../actions/actions';

interface SessionListItemProps {
  name: string,
  description: string,
  duration: number,
  workDuration: number,
  onPress: () => void,
}

const SessionListItem: React.FC<SessionListItemProps> = (props) => {
  return (
    <View style={styles.sessionContainer}>
      <Pressable
        style={{
          flexDirection: "row",
        }}
        onPress={props.onPress}>
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

const SessionList: React.FC = (props) => {
  const { navigation } = props;

  const fetchSessions = () => {
    props.setLoading(true);
    fetch('https://complicated-timer.herokuapp.com/sessions')
      .then((response) => response.json())
      .then((json) => props.setSessions(json))
      .catch((error) => console.error(error))
      .finally(() => props.setLoading(false));
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const renderSessionListItem = ({ item }: { item: Session }) => {
    const { totalDuration, totalWorkDuration } = getSessionDuration(item.session);

    return (
      <SessionListItem name={item.name} description={item.description}
        duration={totalDuration} workDuration={totalWorkDuration}
        onPress={() => navigation.navigate('PlaySession', { item: item })}
      />
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
      {props.isLoading ?
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
              data={props.sessions}
              keyExtractor={({ id }, index) => id == null ? index.toString() : id.toString()}
              renderItem={renderSessionListItem}
              onRefresh={() => { fetchSessions() }}
              refreshing={props.isLoading}
            />
            <Button
              color={Colors.darkblue}
              onPress={() => {
                UUIDGenerator.getRandomUUID().then((uuid) => {
                  props.addSession(emptySession({ uuid }));
                });
              }}
              title="Create new session"
            />
          </View>
        )}
    </>
  );
};

function mapStateToProps(state) {
  return {
    sessions: state.sessionList.sessions,
    isLoading: state.sessionList.isLoading,
  };
}
function matchDispatchToProps(dispatch) {
  return bindActionCreators({
    setSessions,
    addSession,
    setLoading,
  }, dispatch)
}
export default connect(mapStateToProps, matchDispatchToProps)(SessionList);

const styles = StyleSheet.create({
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
});