import {
  CountdownEntry,
} from './session'

var Sound = require('react-native-sound');
Sound.setCategory('Playback');

const files = new Map([
  ["BELL", "bell.ogg"],
  ["PREBELL", "prebell.ogg"],
]);

let sounds = new Map([]);

for (let [type, file] of files.entries()) {
  var sound = new Sound(file, Sound.MAIN_BUNDLE, (error: any) => {
    if (error) {
      console.log('failed to load: ' + file, error);
      return;
    }
    console.log(file + ': duration in seconds: ' + sound.getDuration());
  });
  sounds.set(type, sound);
}

function playSound(type: string) {
  let sound = sounds.get(type) as Sound;

  if (sound == undefined) {
    console.log('not loaded sound file for type: ' + type);
    return;
  }

  sound.play((success: boolean) => {
    if (success) {
      console.log('successfully finished playing');
    } else {
      console.log('playback failed due to audio decoding errors');
    }
  });
}

export function maybePlaySound(timerValue: number, currentStep: CountdownEntry, nextStep: CountdownEntry) {
  if (timerValue === 0) {
    playSound('bell');
  } else if (currentStep.countdownBell && (timerValue === 2 || timerValue === 1)) {
    playSound('prebell');
  }
}