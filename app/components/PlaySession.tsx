import React, { useEffect, useState } from 'react';

import {
  Button,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { bindActionCreators } from 'redux';
import { connect, ConnectedProps } from 'react-redux';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp, HeaderBackButton } from '@react-navigation/stack';

import { RootStackParamList } from '../App';

import {
  setSession,
  intervalTick,
  playPressed,
  pausePressed,
  restartPressed,
  reversePressed,
  forwardPressed,
  backPressed,
  nextPressed,
  stepSliderChanged,
  sessionSliderChanged,
} from '../actions/playActions';

import {
  timerValueSecondsSelector,
  currentStepSelector,
  prevStepSelector,
  nextStepSelector,
  progressSelector,
  entryCountSelector,
  sessionNameSelector,
} from '../reducers/playReducer';

import { RootState } from '../reducers/index';

import Slider from '@react-native-community/slider';

import { MaterialDialog } from 'react-native-material-dialog';

import { useKeepAwake } from 'expo-keep-awake';

import {
  capitalize,
  formatDuration,
  itemStyle,
} from '../utils';
import Colors from '../colors';

import Icon from 'react-native-vector-icons/MaterialIcons';

import { maybePlaySound } from '../bell';

interface IconButtonProps {
  name: string,
  size?: number,
  onPress: () => void,
}

const IconButton: React.FC<IconButtonProps> = ({ name, size, onPress }) => {
  return (<Icon.Button
    iconStyle={{
      marginRight: 0,
    }}
    color={Colors.light}
    backgroundColor={Colors.darkblue}
    size={size !== undefined ? size : 24}
    onPress={() => { onPress() }}
    name={name}
  />);
}

interface Props extends PropsFromRedux {
  route: RouteProp<RootStackParamList, 'PlaySession'>;
  navigation: StackNavigationProp<RootStackParamList, 'PlaySession'>;
}

const tickLength = 100; // ms

const PlaySession: React.FC<Props> = (props) => {
  const { route, navigation } = props;

  const index = route.params.index;
  const session = props.sessions[index];
  useEffect(() => {
    props.setSession(session)
  }, [props.sessions]);

  useEffect(() => {
    if (props.isRunning) {
      const interval = setInterval(() => {
        props.intervalTick(tickLength);
      }, tickLength);
      return () => clearInterval(interval);
    }
  }, [props.isRunning]);

  useEffect(() => {
    if (props.isRunning && props.currentStep !== null && props.nextStep !== null) {
      maybePlaySound(props.timerValueMillis, props.currentStep, props.nextStep);
    }
  });

  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View
          style={{
            paddingHorizontal: 8,
          }}>
          <Icon.Button
            iconStyle={{
              marginRight: 0,
            }}
            color={Colors.light}
            backgroundColor={Colors.darkblue}
            onPress={() => {
              navigation.navigate('EditSession', { index })
            }}
            name="edit"
          />
        </View>
      ),
      headerLeft: () => (
        <HeaderBackButton onPress={() => {
          if (props.isRunning) {
            setCancelDialogVisible(true);
          } else {
            navigation.goBack();
          }
        }} />
      ),
      title: (props.sessionName),
    });
  }, [navigation, props.isRunning, props.sessionName]);

  useKeepAwake();

  return (
    <>
      <StatusBar barStyle="default" />
      <MaterialDialog
        title="Stop in-progress session?"
        visible={cancelDialogVisible}
        onOk={() => {
          setCancelDialogVisible(false);
          navigation.goBack();
        }}
        onCancel={() => setCancelDialogVisible(false)}>
        <Text>Current progress will be lost.</Text>
      </MaterialDialog>
      <View style={[styles.currentStep, itemStyle(props.currentStep.category)]}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: 'space-around',
            width: "100%",
          }}>
          {props.progress.length > 0 ?
           props.progress.map((progress) => <Text key={progress} style={styles.stepProgress}>{progress}</Text>) :
           <Text style={styles.stepProgress}></Text>}
        </View>
        <Text style={styles.stepName}>{capitalize(props.currentStep!.category)}</Text>
        <Text style={styles.timer}>{formatDuration(props.timerValue, true, (props.timerValue <= 10 && tickLength < 1000))}</Text>
        <IconButton
          name={props.currentStep.category === "done" ? "refresh" : props.isRunning ? "pause" : "play-arrow"}
          size={36}
          onPress={() => {
            if (props.currentStep.category === "done") {
              props.restartPressed();
            } else if (props.isRunning) {
              props.pausePressed();
            } else {
              props.playPressed();
            }
          }}
        />
        <View
          style={{
            flexDirection: "row",
            paddingVertical: 4,
            justifyContent: 'space-between',
            alignItems: "center",
          }}>
          <IconButton
            name="fast-rewind"
            onPress={() => { props.reversePressed() }}
          />
          <Slider
            style={{ width: 200, height: 40 }}
            inverted={true}
            minimumValue={0}
            maximumValue={props.currentStep.duration}
            step={tickLength / 1000}
            value={props.timerValue}
            onValueChange={(value) => props.stepSliderChanged(value)}
            minimumTrackTintColor={Colors.dark}
            maximumTrackTintColor={Colors.white}
            thumbTintColor={Colors.darkblue}
          />
          <IconButton
            name="fast-forward"
            onPress={() => { props.forwardPressed() }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            paddingVertical: 4,
            justifyContent: 'space-between',
            alignItems: "center",
          }}>
          <IconButton
            name="skip-previous"
            onPress={() => { props.backPressed() }}
          />
          <Slider
            style={{ width: 200, height: 40 }}
            minimumValue={0}
            maximumValue={props.sessionEntryCount - 1}
            step={1}
            value={props.currentStepCount}
            onValueChange={(value) => { props.sessionSliderChanged(value); }}
            minimumTrackTintColor={Colors.white}
            maximumTrackTintColor={Colors.dark}
            thumbTintColor={Colors.darkblue}
          />
          <IconButton
            name="skip-next"
            onPress={() => { props.nextPressed() }}
          />
        </View>
      </View>

      {props.nextStep === null ||
        <View
          style={[
            styles.nextStep,
            itemStyle(props.nextStep.category),
          ]}>
          <Text style={styles.nextTitle}>Next:</Text>
          <View
            style={[
              styles.nextStep,
              itemStyle(props.nextStep.category),
              {
                flexDirection: "row",
                justifyContent: 'space-around',
              }
            ]}>
            <Text style={styles.nextName}>{capitalize(props.nextStep.category)}</Text>
            {props.nextStep.category === "done" ||
              <Text style={styles.nextDuration}>{formatDuration(props.nextStep.duration)}</Text>
            }
          </View>
        </View>
      }
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  sessions: state.sessions.sessions,
  currentStepCount: state.play.currentStepCount,
  timerValue: timerValueSecondsSelector(state.play),
  timerValueMillis: state.play.timerValueMillis,
  isRunning: state.play.isRunning,
  progress: progressSelector(state.play),
  currentStep: currentStepSelector(state.play),
  nextStep: nextStepSelector(state.play),
  prevStep: prevStepSelector(state.play),
  sessionEntryCount: entryCountSelector(state.play),
  sessionName: sessionNameSelector(state.play),
})

function matchDispatchToProps(dispatch: any) {
  return bindActionCreators({
    setSession,
    intervalTick,
    playPressed,
    pausePressed,
    restartPressed,
    reversePressed,
    forwardPressed,
    backPressed,
    nextPressed,
    stepSliderChanged,
    sessionSliderChanged,
  }, dispatch)
}

const connector = connect(mapStateToProps, matchDispatchToProps)
type PropsFromRedux = ConnectedProps<typeof connector>
export default connector(PlaySession)

export const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.white,
    flex: 1
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
    fontSize: 140,
    color: Colors.lighter,
  },
  currentStep: {
    fontSize: 12,
    alignItems: 'center',
    flex: 8,
    width: "100%",
  },
  nextStep: {
    alignItems: 'center',
    flex: 1,
    width: "100%",
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
});
