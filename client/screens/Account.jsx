import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { StyleSheet, View, Alert, Text } from 'react-native';
import { Button, Input } from 'react-native-elements';
import { Session } from '@supabase/supabase-js';

import { useSelector } from 'react-redux';

export default function Account({ navigation }) {
    const session = useSelector((state) => state.auth.session);

    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [website, setWebsite] = useState('');
    const [avatar_url, setAvatarUrl] = useState('');

    useEffect(() => {
        if (session.user) {
            console.log('getProfile was called');
            getProfile();
        }
    }, [session]);

    const checkUsername = () => {
        if (!username.trim()) {
            // Username is empty or only contains whitespace
            return false;
        }
        return true;
    }

    async function getProfile() {
        try {
            setLoading(true);
            if (!session?.user) throw new Error('No user on the session');

            const { data, error, status } = await supabase
                .from('profiles')
                .select(`username, website, avatar_url`)
                .eq('id', session?.user.id)
                .single();
            if (error && status !== 406) throw error;
            
            if(data) {
                setUsername(data.username);
                setWebsite(data.website);
                setAvatarUrl(data.avatar_url);
            }
        } catch (error) {
            Alert.alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function updateProfile({ username, website, avatar_url }) {
        try {
            setLoading(true);
            if (checkUsername() === false) throw new Error('Username is required');
            if (!session?.user) throw new Error('No user on the session');

            const updates = {
                id: session?.user.id,
                username,
                website,
                avatar_url,
                updated_at: new Date(),
            };
            const { error } = await supabase.from('profiles').upsert(updates, {
                returning: 'minimal', // Don't return the value after inserting
            });
            if (error) throw error;
            
        } catch (error) {
            Alert.alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleFinish = async () => {
        
        if (checkUsername() === false) {
            Alert.alert('Username is required');
            return;
        }
        await updateProfile({ username, website, avatar_url });
        navigation.navigate('Home'); // Navigate to Home screen if validation passes
    };

    return (
        <View style={styles.container}>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Input label="Email" value={session?.user?.email} disabled />
            </View>
            <View style={styles.verticallySpaced}>
                <Input
                    label="Username"
                    value={username || ''}
                    onChangeText={(value) => setUsername(value)}
                />
            </View>
            <View style={styles.verticallySpaced}>
                <Input
                    label="Website"
                    value={website || ''}
                    onChangeText={(value) => setWebsite(value)}
                />
            </View>

            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Button
                    title={loading ? 'Loading...' : 'Update'}
                    onPress={() => updateProfile({ username, website, avatar_url })}
                    disabled={loading}
                />
            </View>

            <View style={styles.verticallySpaced}>
                <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
            </View>

            <View style={styles.verticallySpaced}>
                <Button title="Finish" onPress={() => {
                    handleFinish();
                }} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        padding: 12,
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 20,
    },
});

