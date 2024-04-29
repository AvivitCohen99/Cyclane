import React, {useEffect} from 'react';
import {Alert, Image, SafeAreaView, View} from 'react-native';
import {WithNavigation} from '../common';
import {AppButton} from '../components/atom/appButton/appButton';
import {Title} from '../components/atom/title/title';
import {welcomeScreenStyle} from './welcomeScreenStyle';
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';

type WelcomeScreenProps = {} & WithNavigation;

export const WelcomeScreen: React.FC<WelcomeScreenProps> = props => {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '410366735513-dned6t4nri2pmdcnhes7pemme2vmkon4.apps.googleusercontent.com',
    });
  }, []);

  // async function onGoogleButtonPress() {
  //   // Check if your device supports Google Play
  //   await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  //   // Get the users ID token
  //   const { idToken } = await GoogleSignin.signIn();

  //   // Create a Google credential with the token
  //   const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  //   // Sign-in the user with the credential
  //   return auth().signInWithCredential(googleCredential);
  // }

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
