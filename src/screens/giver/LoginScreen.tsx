
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS } from '../../lib/theme';
import { Button } from '../../components/Button';
import { ArrowLeft } from 'lucide-react-native';

// Needs to be manually called for web, but is automatic for native
WebBrowser.maybeCompleteAuthSession();

export default function GiverLoginScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);

  // Configure Google Sign-In
  // IMPORTANT: You need to set up your Google Cloud Console and add the client IDs here or in app.json
  // For Supabase, we usually use the "authorization_code" flow or "implicit" flow.
  // This example uses the Supabase helper method.
  
  // NOTE: For Expo Go, we use a proxy. For production, you need native schemes.
  const redirectUri = makeRedirectUri({
    path: '/auth/callback',
  });

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true, // We handle the redirect manually with WebBrowser
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Open the browser for auth
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri
        );

        if (result.type === 'success' && result.url) {
          // Supabase handles the session via the URL parameters usually,
          // but we might need to parse the tokens if using implicit flow.
          // However, Supabase's signInWithOAuth usually handles the callback 
          // if we pass the URL back to it or if it detects the session storage.
          
          // Extract access_token and refresh_token from result.url
          // Supabase returns these in the URL fragment (#) or query params depending on config.
          const params = new URLSearchParams(result.url.split('#')[1] || result.url.split('?')[1]);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) throw error;
            navigation.navigate('GiverDashboard');
          } else {
             // Fallback: Check session again
             const { data: sessionData } = await supabase.auth.getSession();
             if (sessionData.session) {
                navigation.navigate('GiverDashboard');
             } else {
                Alert.alert('Login Failed', 'Could not establish session.');
             }
          }
        }
      }
    } catch (error: any) {
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if already logged in
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigation.navigate('GiverDashboard');
      }
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigation.navigate('GiverDashboard');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={COLORS.foreground} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giver Login</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in to manage your VLOO gifts and create new ones.
        </Text>

        <View style={styles.authContainer}>
          <Button 
            title={loading ? "Connecting..." : "Continue with Google"} 
            onPress={handleGoogleLogin}
            variant="primary"
            disabled={loading}
            style={styles.googleButton}
          />
          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    paddingTop: 60, 
    paddingHorizontal: 24, 
    paddingBottom: 20, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  backButton: { marginRight: 16 },
  headerTitle: { 
    fontFamily: FONTS.displayBold, 
    fontSize: 20, 
    color: COLORS.foreground 
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 40,
    color: COLORS.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: COLORS.foreground,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 48,
    maxWidth: '80%',
  },
  authContainer: {
    width: '100%',
    gap: 16,
  },
  googleButton: {
    width: '100%',
  },
  disclaimer: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.foreground,
    textAlign: 'center',
    opacity: 0.5,
    marginTop: 16,
  }
});
