// RootNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import AuthScreen from '../../screens/Auth';
import HomeScreen from '../../screens/Home';
// Import other screens
import Account from '../../screens/Account';
import JoinSession from '../../screens/quizSession/JoinSession';
import SessionHome from '../../screens/quizSession/SessionHome';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const session = useSelector((state) => state.auth.session);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {session ? (
        <>
          <Stack.Screen name="Account" component={Account} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="JoinSession" component={JoinSession} />
          <Stack.Screen name="SessionHome" component={SessionHome} />
          {/* Add other screens */}
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
