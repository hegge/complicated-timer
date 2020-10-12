
import {
  StyleSheet,
} from 'react-native';

import Colors from './Colors';

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
  body: {
    backgroundColor: Colors.white,
    flex: 1
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
export default SharedStyles;