import {
  Alert,
  Image,
  SafeAreaView,
  TextInput,
  View,
  VirtualizedList,
} from 'react-native';
import {WithNavigation} from '../common';
import {AppButton} from '../components/atom/appButton/appButton';
import {AppTextInput} from '../components/atom/appTextInput/appTextInput';
import {signInScreenStyle} from './signInScreenStyle';
import React from 'react';
import {appTextInputStyle} from '../components/atom/appTextInput/appTextInputStyle';
import {welcomeScreenStyle} from '../welcome-package/welcomeScreenStyle';

type SignInScreenProps = {} & WithNavigation;

export const SignInScreen: React.FC<SignInScreenProps> = props => {
  return (
    <SafeAreaView style={signInScreenStyle.mainWrapper}>
      <View style={signInScreenStyle.innerWrapper}>
        <AppTextInput placeholder="First Name" />
        <AppTextInput placeholder="Last Name" />
        <AppTextInput placeholder="E-mail" />
        <AppTextInput placeholder="Password" secureTextEntry={true} />
        <AppTextInput placeholder="Confirm Password" secureTextEntry={true} />
      </View>
      <AppButton
        title="Sign in"
        onPress={() => {
          Alert.alert('Sign in');
        }}
      />
    </SafeAreaView>
  );
};
