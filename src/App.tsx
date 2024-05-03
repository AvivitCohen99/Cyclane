import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';

import {MapScreen} from './map-package/mapScreen';
import {WelcomeScreen} from './welcome-package/welcomeScreen';
import {SignInScreen} from './sign-in-package/signInScreen';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
        <Stack.Screen
          name="MapScreen"
          component={MapScreen}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name="SignInScreen"
          component={SignInScreen}
          options={{headerShown: true}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
