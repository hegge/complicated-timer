import React from 'react';

import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ViewProps,
} from 'react-native';

import { bindActionCreators } from 'redux';
import { connect, ConnectedProps } from 'react-redux';
import { RouteProp } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

import { RootStackParamList } from '../App';

import {
  setDuration,
  setCategory,
} from '../actions/editActions';

import {
  durationSelector,
  categorySelector,
} from '../reducers/editReducer';

import { RootState } from '../reducers/index';

import ControlledTextInput from './ControlledTextInput';

import {
  capitalize,
} from '../utils';
import SharedStyles from '../sharedStyles';

interface RadioButtonProps {
  style?: ViewProps,
  selected: boolean
}

const RadioButton: React.FC<RadioButtonProps> = (props) => {
  return (
    <View style={[{
      height: 24,
      width: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#000',
      alignItems: 'center',
      justifyContent: 'center',
    }, props.style]}>
      {
        props.selected ?
          <View style={{
            height: 12,
            width: 12,
            borderRadius: 6,
            backgroundColor: '#000',
          }} />
          : null
      }
    </View>
  );
}

enum Category {
  Work = "work",
  Pause = "pause",
  Prepare = "prepare",
}

interface RadioButtonElementProps {
  selectedCategory: string,
  buttonCategory: Category,
  setCategory: (category: Category) => void,
}

const RadioButtonElement: React.FC<RadioButtonElementProps> = (props) => {
  return (
    <Pressable
      style={styles.ratioButtonElement}
      onPress={() => props.setCategory(props.buttonCategory)}
    >
      <RadioButton selected={props.selectedCategory === props.buttonCategory}></RadioButton>
      <Text style={styles.ratioButtonElementText}>{capitalize(props.buttonCategory)}</Text>
    </Pressable>
  );
};

interface Props extends PropsFromRedux {
  route: RouteProp<RootStackParamList, 'EditCountdown'>;
}

export const EditCountdown: React.FC<Props> = (props) => {
  const { route } = props;
  const { index } = route.params;

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={SharedStyles.body}>
        <View style={SharedStyles.descriptiveTextInputContainer}>
          <Text style={SharedStyles.descriptiveTextInputTitle}>Duration:</Text>
          <ControlledTextInput
            style={SharedStyles.textInput}
            keyboardType="number-pad"
            text={props.duration.toString()}
            placeholder="Enter duration"
            onChangeText={(text: string) => props.setDuration(index, parseInt(text))}
          />
        </View>
        <View style={styles.descriptiveRatioButtonContainer}>
          <Text style={SharedStyles.descriptiveTextInputTitle}>Category:</Text>
          <View style={styles.ratioButtonContainer}>
            <RadioButtonElement selectedCategory={props.category} buttonCategory={Category.Work} setCategory={(category) => props.setCategory(index, category)} />
            <RadioButtonElement selectedCategory={props.category} buttonCategory={Category.Pause} setCategory={(category) => props.setCategory(index, category)} />
            <RadioButtonElement selectedCategory={props.category} buttonCategory={Category.Prepare} setCategory={(category) => props.setCategory(index, category)} />
          </View>
        </View>
      </View>
    </>
  );
};

function mapStateToProps(state: RootState, props: StackScreenProps<RootStackParamList, 'EditCountdown'>) {
  return {
    duration: durationSelector(state.edit, props),
    category: categorySelector(state.edit, props),
  };
}
function matchDispatchToProps(dispatch: any) {
  return bindActionCreators({
    setDuration,
    setCategory,
  }, dispatch)
}

const connector = connect(mapStateToProps, matchDispatchToProps)
type PropsFromRedux = ConnectedProps<typeof connector>
export default connector(EditCountdown)

const styles = StyleSheet.create({
  descriptiveRatioButtonContainer: {
    padding: 8,
  },
  ratioButtonContainer: {
    flexDirection: "column",
  },
  ratioButtonElement: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  ratioButtonElementText: {
    paddingHorizontal: 4,
  },
});