import React from 'react';

import {
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { bindActionCreators } from 'redux';
import { connect, ConnectedProps } from 'react-redux';
import { RouteProp } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

import { RootStackParamList } from '../App';

import {
  setRepetitions,
} from '../actions/editActions';

import {
  repetitionsSelector,
} from '../reducers/editReducer';

import ControlledTextInput from './ControlledTextInput';

import { RootState } from '../reducers/index';

import SharedStyles from '../sharedStyles';

interface Props extends PropsFromRedux {
  route: RouteProp<RootStackParamList, 'EditRepeat'>;
}

export const EditRepeat: React.FC<Props> = (props) => {
  const { route } = props;
  const { index } = route.params;

  return (
    <>
      <StatusBar barStyle="default" />
      <View style={SharedStyles.body}>
        <View style={SharedStyles.descriptiveTextInputContainer}>
          <Text style={SharedStyles.descriptiveTextInputTitle}>Number of repetitions:</Text>
          <ControlledTextInput
            style={SharedStyles.textInput}
            keyboardType="number-pad"
            text={props.repetitions.toString()}
            placeholder="Enter repetitions"
            onChangeText={(text: string) => props.setRepetitions(index, parseInt(text))}
          />
        </View>
      </View>
    </>
  );
};

function mapStateToProps(state: RootState, props: StackScreenProps<RootStackParamList, 'EditRepeat'>) {
  return {
    repetitions: repetitionsSelector(state.edit, props),
  };
}
function matchDispatchToProps(dispatch: any) {
  return bindActionCreators({
    setRepetitions
  }, dispatch)
}
const connector = connect(mapStateToProps, matchDispatchToProps)
type PropsFromRedux = ConnectedProps<typeof connector>
export default connector(EditRepeat)

const styles = StyleSheet.create({
});