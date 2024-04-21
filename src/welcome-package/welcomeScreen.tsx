import React from 'react';
import {Alert, Image, SafeAreaView, View} from 'react-native';
import {WithNavigation} from '../common';
import {AppButton} from '../components/atom/appButton/appButton';
import {Title} from '../components/atom/title/title';
import {welcomeScreenStyle} from './welcomeScreenStyle';

type WelcomeScreenProps = {} & WithNavigation;

export const WelcomeScreen: React.FC<WelcomeScreenProps> = props => {
  return (
    <SafeAreaView style={welcomeScreenStyle.mainWrapper}>
      <View style={welcomeScreenStyle.titleWrapper}>
        <Title skin="logo" text="Cyclane" />
      </View>
      <View style={welcomeScreenStyle.contentWrapper}>
        <Image
          style={welcomeScreenStyle.image}
          source={require('../../assets/images/cover-image.jpeg')}></Image>
        <View style={welcomeScreenStyle.buttonsWrapper}>
          <AppButton
            title={'Register'}
            onPress={() => {
              props.navigation.navigate('MapScreen');
            }}
          />
          <AppButton
            title={'Log in'}
            onPress={() => {
              Alert.alert('Log in');
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
