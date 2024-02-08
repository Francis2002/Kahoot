import React from "react";
import { supabase } from "../lib/supabase";
import { View, Text, Button, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useState, useEffect } from "react";

import { Session } from "@supabase/supabase-js";

import { useSelector } from "react-redux";

export default function Home({ navigation }) {
    const session = useSelector((state) => state.auth.session);
    const [sessionId, setSessionId] = useState('');

    const createKahootSession = async () => {
      try {
        const response = await axios.post('http://192.168.1.126:80/create-session', { creator_id: session.user.id });
        setSessionId(response.data.sessionId);
      } catch (error) {
        console.error(error);
      }
    };

    useEffect(() => {
      if (sessionId) {
        navigation.navigate('SessionHome', { sessionId });
      }
    }, [sessionId]);

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Button title="Create Session" onPress={async () => {
                createKahootSession()
            }} />
            <Button title="Join Session" onPress={() => navigation.navigate('JoinSession')} />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Account')}
            >
                <Text style={styles.fabIcon}>➡️</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#007bff',
    borderRadius: 28,
    elevation: 8, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowRadius: 2,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  fabIcon: {
      fontSize: 24,
      color: 'white',
  }
});