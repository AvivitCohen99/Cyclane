import React, {useState} from 'react';
import {TextInput, TextInputProps, View} from 'react-native';
import {appTextInputStyle} from './appTextInputStyle';

export const AppTextInput: React.FC<TextInputProps> = props => {
  const [value, setValue] = useState<string>('');
  return (
    <TextInput
      {...props}
      style={appTextInputStyle.input}
      onChangeText={setValue}>
      {value}
    </TextInput>
  );
};
