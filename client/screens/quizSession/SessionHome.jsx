import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';

const SessionHome = ({ navigation, route }) => {
  
  const { sessionId } = route.params;
  const session = useSelector((state) => state.auth.session);

  const [sessionDetails, setSessionDetails] = useState({
    creatorId: '',
    creatorUsername: '',
    participants: [],
    participantsUsernames: [],
  });

  // Leave the session
  const leaveSession = async () => {
    try {
        await axios.post('http://192.168.1.126:80/leave-session', {
            sessionId: sessionId,
            participant_id: session.user.id, // This should be the current user's ID
        });
        navigation.navigate('Home');
    } catch (error) {
        console.error('Error leaving session:', error);
    }
  };

  // End the session
  const endSession = async () => {
    try {
        await axios.post('http://192.168.1.126:80/end-session', {
            sessionId: sessionId,
        });
        navigation.navigate('Home');
    } catch (error) {
        console.error('Error ending session:', error);
    }
  };

  // Fetch participants for the session
  useEffect(() => {
    const fetchSessionDetails = async () => {
        try {
            // Replace 'YOUR_SERVER_ENDPOINT' with your actual server endpoint
            const response = await axios.get(`http://192.168.1.126:80/session-details/${sessionId}`);
            setSessionDetails(response.data);
        } catch (error) {
            console.error('Error fetching session details:', error);
        }
    };

    fetchSessionDetails();

    // Setup WebSocket connection
    const ws = new WebSocket('ws://192.168.1.126:80');

    ws.onopen = () => {
      // Connection opened
      // You can send a message to subscribe to specific session updates if your server supports it
      ws.send(JSON.stringify({ action: 'subscribe', sessionId, user: session.user.id }));
    };

    ws.onmessage = (e) => {
      // A message was received
      const message = JSON.parse(e.data);

      console.log('Received message:', message);

      // Handle the message based on the type
      if (message.type === 'NEW_PARTICIPANT' && message.sessionId === sessionId) {
        // Update your state to include the new participant
        setSessionDetails(prevDetails => ({
            ...prevDetails,
            participants: [...prevDetails.participants, message.participantId],
            participantsUsernames: [...prevDetails.participantsUsernames, message.participantUsername]
        }));
      }

      if (message.type === 'PARTICIPANT_LEFT' && message.sessionId === sessionId) {
        // Update your state to remove the participant
        setSessionDetails(prevDetails => ({
            ...prevDetails,
            participants: prevDetails.participants.filter(id => id !== message.participantId),
            participantsUsernames: prevDetails.participantsUsernames.filter(username => username !== message.participantUsername)
        }));
      }

      if (message.type === 'SESSION_ENDED' && message.sessionId === sessionId) {
        //Show a message that the session has ended and navigate back to the home screen
          navigation.navigate('Home');
        };
      }

    ws.onerror = (e) => {
      // An error occurred
      console.error(e.message);
    };

    ws.onclose = (e) => {
      // Connection closed
    };

    return () => {
      ws.close();
    };
}, [sessionId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session: {sessionId}</Text>
      <Text>Creator: {sessionDetails.creatorUsername}</Text>
      <FlatList
          data={sessionDetails.participantsUsernames}
          keyExtractor={(item, index) => `participant-${index}`}
          renderItem={({ item }) => <Text>Participants: {item}</Text>}
      />
      <Button title="Start Quiz" onPress={() => {/* Start quiz logic here */}} />
      {sessionDetails.creatorId === session.user.id ? (
        <Button title="End Session" onPress={() => endSession()} />
      ) : (
        <Button title="Leave Session" onPress={() => leaveSession()} />
      )}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  // Add more styles as needed
});

export default SessionHome;
