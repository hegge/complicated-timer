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

import Slider from '@react-native-community/slider';

import {
  capitalize,
  formatDuration,
  getSessionProgress,
  getSessionEntry,
  getSessionEntryCount,
  itemStyle,
} from '../utils';
import Colors from '../Colors.js';
import SharedStyles from '../SharedStyles'

var Sound = require('react-native-sound');
Sound.setCategory('Playback');

var bell = new Sound('bell.mp3', Sound.MAIN_BUNDLE, (error: any) => {
  if (error) {
    console.log('failed to load the bell', error);
    return;
  }
  console.log('bell: duration in seconds: ' + bell.getDuration() + 'number of channels: ' + bell.getNumberOfChannels());
});

var preBell = new Sound('prebell.mp3', Sound.MAIN_BUNDLE, (error: any) => {
  if (error) {
    console.log('failed to load the prebell', error);
    return;
  }
  console.log('prebell: duration in seconds: ' + bell.getDuration() + 'number of channels: ' + bell.getNumberOfChannels());
});

const Play: React.FC = ({ route, navigation }) => {
  const { item } = route.params;
  const session = item.session;

  const [currentStepCount, setCurrentStepCount] = useState(0);

  const prevStep = getSessionEntry(session, currentStepCount - 1);
  const currentStep = getSessionEntry(session, currentStepCount);
  const nextStep = getSessionEntry(session, currentStepCount + 1);
  const progress = getSessionProgress(session, currentStepCount);

  const [timerValue, setTimerValue] = useState(currentStep!.duration);
  const [isRunning, setIsRunning] = useState(false);

  const sessionEntryCount = getSessionEntryCount(session);

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
    if (timerValue < 0 && nextStep != null) {
      setTimerValue(nextStep.duration);
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

  useEffect(() => {
    if (isRunning && timerValue === 0) {
      bell.play((success: boolean) => {
        if (success) {
          console.log('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      });
    }
  });

  useEffect(() => {
    if (currentStep!.countdownBell && isRunning && (timerValue === 2 || timerValue === 1)) {
      preBell.play((success: boolean) => {
        if (success) {
          console.log('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      });
    }
  });

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
            minimumTrackTintColor={Colors.dark}
            maximumTrackTintColor={Colors.white}
            thumbTintColor={Colors.darkblue}
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
            minimumTrackTintColor={Colors.white}
            maximumTrackTintColor={Colors.dark}
            thumbTintColor={Colors.darkblue}
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
export default Play;

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
});
