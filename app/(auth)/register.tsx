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
  ScrollView,
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

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const { signUp, loading } = useAuthStore();
  const { animatedStyle, onPressIn, onPressOut } = useAnimatedPress(0.97);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Tum alanlari doldurun');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Sifreler eslesmiyor');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Sifre en az 6 karakter olmali');
      return;
    }
    const { error } = await signUp(email, password);
    if (error) {
      Alert.alert('Kayit Hatasi', error);
    } else {
      Alert.alert('Hosgeldin!', '1.000 TL bakiyen yuklendi!', [
        { text: 'Oynamaya Basla →', onPress: () => router.replace('/(tabs)') },
      ]);
    }
  };

  const inputStyle = (field: string) => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
          <BallIcon size={44} color={COLORS.accent} />
          <Text style={styles.appName}>SOCCERA</Text>
          <Text style={styles.subTitle}>Hesap Olustur</Text>
        </Animated.View>

        {/* Bonus banner */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.bonusBanner}>
          <Text style={styles.bonusIcon}>🎁</Text>
          <View>
            <Text style={styles.bonusTitle}>Hosgeldin Bonusu</Text>
            <Text style={styles.bonusAmount}>1.000 TL Ucretsiz Bakiye</Text>
          </View>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.form}>
          <TextInput
            style={inputStyle('email')}
            placeholder="E-posta adresi"
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField('')}
          />
          <TextInput
            style={inputStyle('password')}
            placeholder="Sifre (en az 6 karakter)"
            placeholderTextColor={COLORS.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField('')}
          />
          <TextInput
            style={inputStyle('confirm')}
            placeholder="Sifre tekrar"
            placeholderTextColor={COLORS.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            onFocus={() => setFocusedField('confirm')}
            onBlur={() => setFocusedField('')}
          />

          <Animated.View style={animatedStyle}>
            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Hesap olusturuluyor...' : 'Ucretsiz Basla →'}
              </Text>
            </Pressable>
          </Animated.View>

          <Link href="/(auth)/login" style={styles.linkContainer}>
            <Text style={styles.linkText}>Zaten hesabin var mi? </Text>
            <Text style={styles.linkAccent}>Giris Yap</Text>
          </Link>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xxl,
    paddingTop: 80,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
    gap: SPACING.sm,
  },
  appName: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 4,
  },
  subTitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    letterSpacing: 0.3,
  },
  bonusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.accentGlow,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  bonusIcon: {
    fontSize: 28,
  },
  bonusTitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bonusAmount: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
  },
  form: {
    gap: SPACING.sm,
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
    marginTop: SPACING.sm,
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
});
