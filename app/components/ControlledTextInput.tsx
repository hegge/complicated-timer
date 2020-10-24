import React from 'react';

import {
  KeyboardTypeOptions,
  TextInput,
  ViewStyle,
} from 'react-native';

interface ControlledTextInputProps {
  style?: ViewStyle,
  text: string,
  placeholder: string,
  keyboardType?: KeyboardTypeOptions,
  onChangeText: (text: string) => void,
}

const ControlledTextInput: React.FC<ControlledTextInputProps> = (props) => {
  const setText = (text: string) => {
    props.onChangeText(text);
  }

  return (
    <TextInput
      style={props.style}
      onChangeText={text => setText(text)}
      value={props.text}
      keyboardType={props.keyboardType}
      placeholder={props.placeholder}
    />
  );
}

export default ControlledTextInput;