import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import WebSocket from 'ws';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const server = createServer(app);

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const wss = new WebSocketServer({ server });

app.use(express.json());

app.use(cors())

wss.on('connection', function connection(ws) {
    console.log('A new client connected');
    ws.on('message', function incoming(message) {
      console.log('received: %s', message);
    });
  
    // You can send messages to this client using ws.send('some message');
});

// Create a new session
app.post('/create-session', async (req, res) => {
    const sessionId = Math.random().toString().slice(2, 8); // Simple 6-digit ID generation
    const { data, error } = await supabase
        .from('sessions')
        .insert([{ id: sessionId, creator_id: req.body.creator_id }]);

    if (error) {
        console.error(error);
        return res.status(400).json(error);
    }

    res.json({ sessionId });
});

// Join a session
app.post('/join-session', async (req, res) => {
    const { sessionId, participant_id } = req.body;

    //get the username of the participant joining the session
    const { data: participantData, error: participantError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', participant_id)
        .single();

    if (participantError) {
        console.error(participantError);
        return res.status(400).json(participantError);
    }

    console.log('ParticipantUsername:', participantData.username)
    console.log('Joining session:', sessionId);
    console.log('ParticipantId:', participant_id);

    // Insert a new record in the session_participants table
    const { data, error } = await supabase
        .from('session_participants')
        .insert([{ session_id: sessionId, participant_id: participant_id }]);

    if (error) {
        console.error(error);
        return res.status(400).json(error);
    }

    // Broadcast to all connected clients
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'NEW_PARTICIPANT',
            sessionId,
            participantId: participant_id,
            participantUsername: participantData.username,
          }));
        }
    });

    res.json({ message: "Joined session successfully" });
});

// Endpoint to leave a session
app.post('/leave-session', async (req, res) => {
    const { sessionId, participant_id } = req.body;

    //get the username of the participant leaving the session
    const { data: participantData, error: participantError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', participant_id)
        .single();
    
    if (participantError) {
        console.error(participantError);
        return res.status(400).json(participantError);
    }

    console.log('ParticipantUsername:', participantData.username)
    console.log('Leaving session:', sessionId);
    console.log('ParticipantId:', participant_id);
    
    // Delete the record from the session_participants table
    const { error } = await supabase
        .from('session_participants')
        .delete()
        .match({ session_id: sessionId, participant_id: participant_id });
    
    if (error) {
        console.error(error);
        return res.status(400).json(error);
    }

    // Broadcast to all connected clients
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'PARTICIPANT_LEFT',
                sessionId,
                participantId: participant_id,
                participantUsername: participantData.username,
            }));
        }
    });

    res.json({ message: "Left session successfully" });
});

// Endpoint to end a session
app.post('/end-session', async (req, res) => {
    const { sessionId } = req.body;

    console.log('Ending session:', sessionId);
    
    // Optional: Remove all participants from this session
    const participantsDeletion = await supabase
        .from('session_participants')
        .delete()
        .match({ session_id: sessionId });
    
    if (participantsDeletion.error) {
        console.error(participantsDeletion.error);
        return res.status(400).json(participantsDeletion.error);
    }

    // Remove the session
    const sessionDeletion = await supabase
        .from('sessions')
        .delete()
        .match({ id: sessionId });
    
    if (sessionDeletion.error) {
        console.error(sessionDeletion.error);
        return res.status(400).json(sessionDeletion.error);
    }

    // Broadcast to all connected clients that the session has ended
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'SESSION_ENDED',
                sessionId,
            }));
        }
    });

    res.json({ message: "Session ended successfully" });
});

// Get session participants and creator
app.get('/session-details/:sessionId', async (req, res) => {
    const { sessionId } = req.params;

    try {
        // Fetch session creator
        const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .select('creator_id, profile:creator_id (username)')
            .eq('id', sessionId)
            .single();

        if (sessionError) throw sessionError;

        // Fetch session participants
        const { data: participantsData, error: participantsError } = await supabase
            .from('session_participants')
            .select('participant_id, profile:participant_id (username)')
            .eq('session_id', sessionId);

        if (participantsError) throw participantsError;

        // Combine creator and participants
        const participantsIds = participantsData.map(item => item.participant_id);
        const participantsUsernames = participantsData.map(item => item.profile.username);
        const sessionDetails = {
            sessionId,
            creatorId: sessionData.creator_id,
            creatorUsername: sessionData.profile.username,
            participants: participantsIds,
            participantsUsernames: participantsUsernames,
        };

        res.json(sessionDetails);
    } catch (error) {
        console.error('Error fetching session details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
