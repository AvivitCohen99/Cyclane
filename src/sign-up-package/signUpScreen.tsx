import auth from '@react-native-firebase/auth';
import React, {useState} from 'react';
import {Alert, SafeAreaView, View} from 'react-native';
import {WithNavigation} from '../common';
import {AppButton} from '../components/atom/appButton/appButton';
import {AppTextInput} from '../components/atom/appTextInput/appTextInput';
import {signUpScreenStyle} from './signUpScreenStyle';

type SignUpScreenProps = {} & WithNavigation;

export const SignUpScreen: React.FC<SignUpScreenProps> = props => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const signin = () => {
    password === confirmPassword
      ? auth()
          .createUserWithEmailAndPassword(email, password)
          .then(() => {
            Alert.alert('User created');
          })
          .catch(err => {
            Alert.alert('Error: ' + err.text);
          })
      : Alert.alert(
          'Passwords does not match ' +
            '*' +
            password +
            '*' +
            ' ' +
            '*' +
            confirmPassword +
            '*',
        );
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
          placeholder="E-mail"
          initialValue={email}
          onEndEditing={setEmail}
          keyboardType={'email-address'}
        />
        <AppTextInput
          placeholder="Password"
          initialValue={password}
          onEndEditing={setPassword}
          secureTextEntry={true}
        />
        <AppTextInput
          placeholder="Confirm Password"
          initialValue={confirmPassword}
          onEndEditing={setConfirmPassword}
          secureTextEntry={true}
        />
      </View>
      <AppButton title="Sign up" onPress={signin} />
    </SafeAreaView>
  );
};
