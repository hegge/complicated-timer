import {
  CountdownEntry,
} from './session'

var Sound = require('react-native-sound');
Sound.setCategory('Playback');

const files = new Map([
  ["END", "end.ogg"],
  ["PAUSE", "pause.ogg"],
  ["PAUSEBEEP", "pausebeep.ogg"],
  ["PAUSESHORT", "pauseshort.ogg"],
  ["PREALARM", "prealarm.ogg"],
  ["PREPAUSETICK", "prepausetick.ogg"],
  ["PREWORKTICK", "preworktick.ogg"],
  ["WORK", "work.ogg"],
  ["WORKBEEP", "workbeep.ogg"],
  ["WORKSHORT", "workshort.ogg"],
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

export function maybePlaySound(timerValueMillis: number, currentStep: CountdownEntry, nextStep: CountdownEntry) {
  if (timerValueMillis === 0) {
    if (nextStep.category === "work") {
      if (nextStep.duration > 3) {
        playSound('WORK');
      } else {
        playSound('SHORTWORK');
      }
    } else if (nextStep.category === "pause") {
      if (nextStep.duration > 3) {
        playSound('PAUSE');
      } else {
        playSound('SHORTPAUSE');
      }
    } else if (nextStep.category === "done") {
      playSound('END');
    }
  } else if (currentStep.countdownBell !== false && (timerValueMillis === 2000 || timerValueMillis === 1000)) {
    if (nextStep.category === "work") {
      playSound('PREWORKTICK');
    } else if (nextStep.category === "pause") {
      playSound('PREPAUSETICK');
    }
  }
}
