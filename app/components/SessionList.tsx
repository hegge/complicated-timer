import React, { useEffect } from 'react';

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

import { bindActionCreators } from 'redux';
import { connect, ConnectedProps } from 'react-redux';

import {
  setSessions,
  addSession,
  duplicateSession,
  deleteSession,
  setLoading,
} from '../actions/sessionsActions';

import {
  Menu,
  MenuItem,
  Position,
} from 'react-native-enhanced-popup-menu';

import {
  emptySession,
  Session,
} from '../session'
import {
  formatDuration,
  getSessionDuration,
} from '../utils';
import Colors from '../colors';
import { RootState } from '../reducers';

interface SessionListItemProps {
  index: number,
  name: string,
  description: string,
  duration: number,
  workDuration: number,
  onPress: () => void,
  duplicateSession: (index: number) => void,
  deleteSession: (index: number) => void,
}

const SessionListItem: React.FC<SessionListItemProps> = (props) => {
  let elementRef = React.createRef<View>();
  let menuRef: Menu | null = null;

  const setMenuRef: (instance: Menu | null) => void = (ref) => (menuRef = ref);
  const hideMenu = () => menuRef?.hide();
  const showMenu = () => {
    menuRef?.show(elementRef.current, Position.BOTTOM_LEFT);
  };

  const duplicateSession = () => {
    props.duplicateSession(props.index);
    hideMenu();
  }

  const deleteSession = () => {
    console.log("deleteSession")
    props.deleteSession(props.index);
    hideMenu();
  }

  return (
    <View style={styles.sessionContainer} ref={elementRef}>
      <Pressable
        style={{
          flexDirection: "row",
        }}
        onPress={props.onPress}
        onLongPress={showMenu}>
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
        <Menu ref={setMenuRef}>
          <MenuItem onPress={duplicateSession}>Duplicate</MenuItem>
          <MenuItem
            textStyle={{
              color: Colors.red,
            }}
            onPress={deleteSession}>
            Delete
              </MenuItem>
          <MenuItem onPress={hideMenu} disabled>
            Share
          </MenuItem>
        </Menu>
      </Pressable>
    </View>
  )
};

interface Props extends PropsFromRedux {
}

const SessionList: React.FC<Props> = (props) => {
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
    if (props.sessions.length == 0 && props.isLoading === false) {
      fetchSessions();
    }
  }, []);

  const renderSessionListItem = ({ item, index }: { item: Session }) => {
    const { totalDuration, totalWorkDuration } = getSessionDuration(item.session);

    return (
      <SessionListItem
        index={index}
        name={item.name}
        description={item.description}
        duration={totalDuration}
        workDuration={totalWorkDuration}
        onPress={() => navigation.navigate('PlaySession', { index, name: item.name })}
        duplicateSession={props.duplicateSession}
        deleteSession={props.deleteSession}
      />
    );
  }

  const flatList = React.useRef(null)

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View
          style={{
            paddingHorizontal: 8,
          }}>
          <Button
            color={Colors.darkblue}
            onPress={() => {
              props.addSession(emptySession());
              flatList.current?.scrollToEnd();
            }}
            title="Create new"
          />
        </View>
      ),
    });
  }, [navigation]);

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
              keyExtractor={(props, index) => index.toString()}
              renderItem={renderSessionListItem}
              onRefresh={() => { fetchSessions() }}
              refreshing={props.isLoading}
              ref={flatList}
            />
          </View>
        )}
    </>
  );
};

function mapStateToProps(state: RootState) {
  return {
    sessions: state.sessions.sessions,
    isLoading: state.sessions.isLoading,
  };
}
function matchDispatchToProps(dispatch) {
  return bindActionCreators({
    setSessions,
    addSession,
    duplicateSession,
    deleteSession,
    setLoading,
  }, dispatch)
}
const connector = connect(mapStateToProps, matchDispatchToProps)
type PropsFromRedux = ConnectedProps<typeof connector>
export default connector(SessionList)

const styles = StyleSheet.create({
  sessionContainer: {
    marginVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.lighter,
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