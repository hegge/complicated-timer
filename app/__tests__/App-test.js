/**
 * @format
 */

import 'react-native';
import React from 'react';
import App, {
  capitalize,
  formatDuration,
  getSessionProgress,
  getSessionEntry
} from '../App';
import 'react-native/jest/setup';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ rates: { CAD: 1.42 } }),
  })
);

/*
it('renders correctly', () => {
  renderer.create(<App />);
});
*/

const session = [
  {
    "type": "repeat",
    "repetitions": 2,
    "description": "Sets",
    "group": [
      {
        "type": "countdown",
        "category": "pause",
        "duration": 300,
        "pause_when_complete": true,
        "skip": "first"
      },
      {
        "type": "repeat",
        "repetitions": 3,
        "description": "Reps",
        "group": [
          {
            "type": "countdown",
            "category": "pause",
            "duration": 180,
            "pause_when_complete": true,
            "skip": "first"
          },
          {
            "type": "countdown",
            "category": "prepare",
            "duration": 20
          },
          {
            "type": "countdown",
            "category": "work",
            "duration": 7
          }
        ]
      }
    ]
  }
]

it('gets correct step', () => {
  expect(getSessionEntry(session, 0).category).toBe('prepare');
  expect(getSessionEntry(session, 1).category).toBe('work');
  expect(getSessionEntry(session, 2).category).toBe('pause');
  expect(getSessionEntry(session, 5).category).toBe('pause');
  expect(getSessionEntry(session, 16).category).toBe('work');
  expect(getSessionEntry(session, 17).category).toBe('done');
});

it('gets correct session progress', () => {
  expect(getSessionProgress(session, 0)).toBe('1/2 1/3');
  expect(getSessionProgress(session, 1)).toBe('1/2 1/3');
  expect(getSessionProgress(session, 2)).toBe('1/2 2/3');
  expect(getSessionProgress(session, 16)).toBe('2/2 3/3');
});

it('can capitalize words', () => {
  expect(capitalize("foo")).toBe('Foo');
});

it('can format duration', () => {
  expect(formatDuration(61)).toBe('01:01');
  expect(formatDuration(59)).toBe('00:59');
  expect(formatDuration(59, compact = true)).toBe('59');
  expect(formatDuration(0)).toBe('00:00');
});