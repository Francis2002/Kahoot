import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Text } from 'react-native';
import axios from 'axios';

import { useSelector } from 'react-redux';

const JoinSession = ({ navigation }) => {
    const session = useSelector((state) => state.auth.session);
    
    const [inputId, setInputId] = useState('');
    
    const joinKahootSession = async () => {
        try {
            await axios.post('http://192.168.1.126:80/join-session', { sessionId: inputId, participant_id: session.user.id });
            console.log('Session joined');
        } catch (error) {
            console.error(error);
        }
        // Navigate to the session page or show an error if joining fails
        navigation.navigate('SessionHome', { sessionId: inputId });
    };

    return (
        <View style={styles.container}>
          <TextInput
              style={styles.input}
              placeholder="Enter Session ID"
              value={inputId}
              onChangeText={setInputId}
          />
          <Button title="Join Session" onPress={joinKahootSession} />

          <TouchableOpacity
              style={styles.fab}
              onPress={() => navigation.navigate('Home')}
          >
              <Text style={styles.fabIcon}>➡️</Text>
          </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    left: 20,
    top: 20,
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

export default JoinSession;
