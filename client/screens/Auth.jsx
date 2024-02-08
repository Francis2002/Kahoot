import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { supabase } from "../lib/supabase";
import { Button, Input } from "react-native-elements";

export default function Auth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function signInWithEmail() {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            //Alert.alert("Check your email for the login link!");
        } catch (error) {
            Alert.alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function signUpWithEmail() {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            //Alert.alert("Check your email for the confirmation link!");
        } catch (error) {
            Alert.alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Input
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />
            <Input
                placeholder="Password"
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
            />
            <Button
                title="Sign In"
                onPress={signInWithEmail}
                loading={loading}
                disabled={loading}
            />
            <Button
                title="Sign Up"
                onPress={signUpWithEmail}
                loading={loading}
                disabled={loading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 20,
    },
});