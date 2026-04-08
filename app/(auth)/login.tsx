import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Link, router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
  SHADOWS,
} from '../../src/constants/theme';
import { BallIcon } from '../../src/components/icons';
import { useAnimatedPress } from '../../src/hooks/useAnimatedPress';

const FEATURES = ['⚡ Canli Skorlar', '📊 Derin Analiz', '🎯 AI Tahminler', '💰 Akilli Oranlar'];

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const { signIn, loading } = useAuthStore();
  const { animatedStyle, onPressIn, onPressOut } = useAnimatedPress(0.97);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve sifre girin');
      return;
    }
    const { error } = await signIn(email, password);
    if (error) {
      Alert.alert('Giris Hatasi', error);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Hero section */}
      <View style={styles.hero}>
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.logoRow}>
          <BallIcon size={52} color={COLORS.accent} />
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(200).duration(600)} style={styles.appName}>
          SOCCERA
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(300).duration(600)} style={styles.tagline}>
          The AI Football Super App
        </Animated.Text>

        {/* Feature pills */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.featureRow}>
          {FEATURES.map((f) => (
            <View key={f} style={styles.featurePill}>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Form */}
      <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.form}>
        <TextInput
          style={[styles.input, focusedField === 'email' && styles.inputFocused]}
          placeholder="E-posta"
          placeholderTextColor={COLORS.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField('')}
        />
        <TextInput
          style={[styles.input, focusedField === 'password' && styles.inputFocused]}
          placeholder="Sifre"
          placeholderTextColor={COLORS.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField('')}
        />

        <Animated.View style={animatedStyle}>
          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Giris yapiliyor...' : 'Giris Yap'}
            </Text>
          </Pressable>
        </Animated.View>

        <Link href="/(auth)/register" style={styles.linkContainer}>
          <Text style={styles.linkText}>Hesabin yok mu? </Text>
          <Text style={styles.linkAccent}>Kayit Ol →</Text>
        </Link>

        <Text style={styles.disclaimer}>
          1.000 TL baslangic bakiyesi ile basla
        </Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingTop: 60,
  },
  logoRow: {
    marginBottom: SPACING.lg,
  },
  appName: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: SPACING.xs,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    letterSpacing: 0.5,
    marginBottom: SPACING.xl,
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    justifyContent: 'center',
  },
  featurePill: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderBright,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  featureText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  form: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: 48,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  inputFocused: {
    borderColor: COLORS.accent,
    ...SHADOWS.light,
    shadowColor: COLORS.accent,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.xs,
    ...SHADOWS.medium,
    shadowColor: COLORS.accent,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.assistantTextDark,
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    alignSelf: 'center',
  },
  linkText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  linkAccent: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  disclaimer: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});
