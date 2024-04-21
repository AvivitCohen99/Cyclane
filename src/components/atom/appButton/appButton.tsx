import React from 'react';
import {Button, Text, TouchableOpacity} from 'react-native';
import {appButtonStyle} from './appButtonStyle';

type ButtonProps = {
  title: string;
  onPress: () => void;
};

export const AppButton: React.FC<ButtonProps> = props => {
  return (
    <TouchableOpacity onPress={props.onPress} style={appButtonStyle.button}>
      <Text style={appButtonStyle.text}>{props.title}</Text>
    </TouchableOpacity>
  );
};
