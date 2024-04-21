import React from 'react';
import {Text} from 'react-native';
import {titleStyle} from './titleStyle';

type TitleProps = {
  text: string;
  skin?: 'logo';
};

export const Title: React.FC<TitleProps> = props => {
  return (
    <Text
      style={{
        ...titleStyle.title,
        ...(props.skin === 'logo' ? titleStyle.logo : {}),
      }}>
      {props.text}
    </Text>
  );
};
