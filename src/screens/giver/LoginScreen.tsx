import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS } from '../../lib/theme';
import { Button } from '../../components/Button';
import { ArrowLeft } from 'lucide-react-native';

// Needs to be manually called for web, but is automatic for native
WebBrowser.maybeCompleteAuthSession();

export default function GiverLoginScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);

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
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri
        );

        if (result.type === 'success' && result.url) {
          const params = new URLSearchParams(result.url.split('#')[1] || result.url.split('?')[1]);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) throw error;
            navigation.replace('GiverDashboard');
          } else {
             const { data: sessionData } = await supabase.auth.getSession();
             if (sessionData.session) {
                navigation.replace('GiverDashboard');
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigation.replace('GiverDashboard');
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigation.replace('GiverDashboard');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>VLOO BETA</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.textWrapper}>
            <Text style={styles.headline}>
              Welcome{'\n'}
              <Text style={styles.headlineHighlight}>Back.</Text>
            </Text>
            <Text style={styles.subheadline}>
              Sign in to manage your VLOO gifts and create new ones.
            </Text>
          </View>

          <View style={styles.authContainer}>
            <Button 
              title={loading ? "Connecting..." : "Continue with Google"} 
              onPress={handleGoogleLogin}
              variant="primary"
              disabled={loading}
              style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
            />
            <Text style={styles.disclaimer}>
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  brandBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  brandBadgeText: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  textWrapper: {
    marginBottom: 48,
    alignItems: 'center',
  },
  headline: {
    fontFamily: FONTS.displayBold,
    fontSize: 42,
    lineHeight: 48,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  headlineHighlight: {
    color: COLORS.accent,
  },
  subheadline: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    maxWidth: 300,
  },
  authContainer: {
    width: '100%',
    gap: 16,
  },
  actionButton: {
    width: '100%',
    height: 56,
  },
  disclaimer: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 16,
  }
});
