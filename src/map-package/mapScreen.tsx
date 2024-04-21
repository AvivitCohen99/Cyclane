import React from 'react';
import {Alert, Image, SafeAreaView, View} from 'react-native';
import {WithNavigation} from '../common';
import {AppButton} from '../components/atom/appButton/appButton';
import {mapScreenStyle} from './mapScreenStyle';
type MapScreenprops = {} & WithNavigation;

export const MapScreen: React.FC<MapScreenprops> = props => {
  return (
    <SafeAreaView style={mapScreenStyle.mainWrapper}>
      <AppButton
        title={'Back'}
        onPress={() => {
          props.navigation.navigate('WelcomeScreen');
        }}></AppButton>
    </SafeAreaView>
  );
};
