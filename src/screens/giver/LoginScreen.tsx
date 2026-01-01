import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS } from '../../lib/theme';
import { Button } from '../../components/Button';
import Svg, { Path } from 'react-native-svg';
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
      <StatusBar barStyle="dark-content" />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
            <ArrowLeft color="#000" size={24} />
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
              title="Continue without login" 
              onPress={() => navigation.replace('GiverDashboard')}
              variant="outline"
              style={[styles.actionButton, { borderColor: '#E5E7EB' }]}
              textStyle={{ color: '#000', fontFamily: FONTS.bodySemiBold }}
            />
            <Button 
              title={loading ? "Connecting..." : "Continue with Google"} 
              onPress={handleGoogleLogin}
              variant="primary"
              disabled={loading}
              leftIcon={
                <Svg width={20} height={20} viewBox="0 0 24 24">
                  <Path d="M23.49 12.27c0-.79-.07-1.56-.2-2.31H12v4.37h6.44c-.28 1.48-1.12 2.74-2.38 3.58v2.98h3.85c2.25-2.07 3.58-5.12 3.58-8.62z" fill="#4285F4" />
                  <Path d="M12 24c3.24 0 5.96-1.07 7.95-2.88l-3.85-2.98c-1.07.72-2.44 1.15-4.1 1.15-3.15 0-5.82-2.13-6.78-5.01H1.28v3.12C3.25 21.54 7.32 24 12 24z" fill="#34A853" />
                  <Path d="M5.22 14.28c-.25-.74-.39-1.53-.39-2.34s.14-1.6.39-2.34V6.48H1.28A11.99 11.99 0 0 0 0 12c0 1.94.46 3.78 1.28 5.52l3.94-3.24z" fill="#FBBC05" />
                  <Path d="M12 4.74c1.76 0 3.34.6 4.58 1.78l3.43-3.43C17.94 1.24 15.22 0 12 0 7.32 0 3.25 2.46 1.28 6.48l3.94 3.12C6.18 6.87 8.85 4.74 12 4.74z" fill="#EA4335" />
                </Svg>
              }
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
    backgroundColor: '#fff',
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
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  brandBadgeText: {
    color: 'rgba(0,0,0,0.6)',
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
    color: '#000',
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
    color: 'rgba(0,0,0,0.6)',
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
    color: 'rgba(0,0,0,0.4)',
    textAlign: 'center',
    marginTop: 16,
  }
});
