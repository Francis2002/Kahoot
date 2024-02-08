// App.js
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { store } from '../store/store';
import RootNavigator from './navigation/RootNavigator';
import { supabase } from '../lib/supabase';
import { setSession } from '../store/authSlice';

export default function App() {
  useEffect(() => {
    checkSession();
    
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      store.dispatch(setSession(session));
    });

    return () => {
      listener.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    store.dispatch(setSession(session));
  };

  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}
