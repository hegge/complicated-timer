import {
  CountdownEntry,
} from './session'

import Sound from 'react-native-sound';

Sound.setCategory('Playback');

type SoundType = 'END' | 'PAUSE' | 'PAUSEBEEP' | 'PAUSESHORT' | 'PREALARM'
  | 'PREPAUSETICK' | 'PREWORKTICK' | 'WORK' | 'WORKBEEP' | 'WORKSHORT';

const files = new Map<SoundType, string>([
  ['END', 'end.ogg'],
  ['PAUSE', 'pause.ogg'],
  ['PAUSEBEEP', 'pausebeep.ogg'],
  ['PAUSESHORT', 'pauseshort.ogg'],
  ['PREALARM', 'prealarm.ogg'],
  ['PREPAUSETICK', 'prepausetick.ogg'],
  ['PREWORKTICK', 'preworktick.ogg'],
  ['WORK', 'work.ogg'],
  ['WORKBEEP', 'workbeep.ogg'],
  ['WORKSHORT', 'workshort.ogg'],
]);

let sounds = new Map<SoundType, Sound>([]);

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

function playSound(type: SoundType) {
  let sound = sounds.get(type) as Sound;

  if (sound == undefined) {
    console.log('not loaded sound file for type: ' + type);
    return;
  }

  console.log(type + ': playing');

  const timeout = setTimeout(() => {
    console.log(type + ': stopping');
    sound.stop();
  }, 900);

  sound.play((success: boolean) => {
    clearTimeout(timeout);
    if (success) {
      console.log(type + ': successfully finished playing');
    } else {
      console.log(type + ': playback failed due to audio decoding errors');
    }
  });
}

export function maybePlaySound(timerValueMillis: number, currentStep: CountdownEntry, nextStep: CountdownEntry) {
  if (timerValueMillis === 0) {
    if (nextStep.category === "done") {
      playSound('END');
    } else if (nextStep.category === "work") {
      if (nextStep.duration > 3) {
        playSound('WORK');
      } else {
        playSound('WORKSHORT');
      }
    } else {
      if (nextStep.duration > 3) {
        playSound('PAUSE');
      } else {
        playSound('PAUSESHORT');
      }
    }
  } else if (currentStep.countdownBell !== false && (timerValueMillis === 2000 || timerValueMillis === 1000)) {
    if (nextStep.category === "work") {
      playSound('PREWORKTICK');
    } else {
      playSound('PREPAUSETICK');
    }
  }
}
