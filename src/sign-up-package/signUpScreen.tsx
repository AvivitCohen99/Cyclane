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
import {signUpScreenStyle} from './signUpScreenStyle';
import React, {useState} from 'react';
import auth from '@react-native-firebase/auth';

type SignUpScreenProps = {} & WithNavigation;

export const SignUpScreen: React.FC<SignUpScreenProps> = props => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const signinTestFn = () => {
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        Alert.alert('User created');
      })
      .catch(err => {
        Alert.alert('Failed creating user');
      });
  };

  return (
    <SafeAreaView style={signUpScreenStyle.mainWrapper}>
      <View style={signUpScreenStyle.innerWrapper}>
        <AppTextInput
          placeholder="First Name"
          initialValue={email}
          onEndEditing={setFirstName}
        />
        <AppTextInput
          placeholder="Last Name"
          initialValue={email}
          onEndEditing={setLastName}
        />
        <AppTextInput
          initialValue={email}
          onEndEditing={setEmail}
          placeholder="E-mail"
        />
        <AppTextInput
          initialValue={password}
          onEndEditing={setPassword}
          placeholder="Password"
          secureTextEntry={true}
        />
        <AppTextInput
          initialValue={confirmPassword}
          onEndEditing={setConfirmPassword}
          placeholder="Confirm Password"
          secureTextEntry={true}
        />
      </View>
      <AppButton title="Sign up" onPress={signinTestFn} />
    </SafeAreaView>
  );
};
