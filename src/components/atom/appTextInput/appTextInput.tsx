import React, {useState} from 'react';
import {
  KeyboardTypeOptions,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import {appTextInputStyle} from './appTextInputStyle';

type AppTextInputProps = {
  placeholder?: string;
  initialValue?: string;
  secureTextEntry?: boolean;
  onEndEditing?: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
};

export const AppTextInput: React.FC<AppTextInputProps> = props => {
  const [value, setValue] = useState<string>(props.initialValue || '');
  return (
    <TextInput
      placeholder={props.placeholder}
      style={appTextInputStyle.input}
      secureTextEntry={props.secureTextEntry}
      onEndEditing={e => props.onEndEditing?.(value)}
      onChangeText={setValue}
      keyboardType={props.keyboardType}
      autoComplete={'off'}>
      {value}
    </TextInput>
  );
};
