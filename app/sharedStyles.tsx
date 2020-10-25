
import {
  StyleSheet,
} from 'react-native';

import Colors from './colors';

const SharedStyles = StyleSheet.create({
  work: {
    backgroundColor: Colors.red,
  },
  prepare: {
    backgroundColor: Colors.blue,
  },
  pause: {
    backgroundColor: Colors.green,
  },
  repeat: {
    backgroundColor: Colors.yellow,
  },
  selected: {
    backgroundColor: Colors.darkblue,
  },
  body: {
    backgroundColor: Colors.white,
    flex: 1
  },
  highlight: {
    fontWeight: '700',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
  },
  descriptiveTextInputContainer: {
    flexDirection: "row",
    alignItems: 'center',
    padding: 8,
  },
  descriptiveTextInputTitle: {
    paddingEnd: 4,
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
export default SharedStyles;