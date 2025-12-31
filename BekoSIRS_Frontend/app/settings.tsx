import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import api from '../services/api';

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState<'password' | 'email'>('password');
  const [loading, setLoading] = useState(false);

  // Şifre değiştirme state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // E-posta değiştirme state
  const [newEmail, setNewEmail] = useState('');
  const [passwordForEmail, setPasswordForEmail] = useState('');

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Yeni şifreler birbiriyle eşleşmiyor.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Güvenlik Uyarısı', 'Yeni şifreniz en az 6 karakterden oluşmalıdır.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/change-password/', {
        old_password: currentPassword,
        new_password: newPassword,
      });

      Alert.alert('Başarılı', 'Güvenlik bilgileriniz güncellendi.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'İşlem gerçekleştirilemedi.';
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail || !passwordForEmail) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert('Geçersiz Format', 'Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/change-email/', {
        new_email: newEmail,
        password: passwordForEmail,
      });

      Alert.alert('Başarılı', 'İletişim bilgileriniz güncellendi.');
      setNewEmail('');
      setPasswordForEmail('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'E-posta güncellenemedi.';
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Modern Tab Seçici */}
        <View style={styles.tabWrapper}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'password' && styles.tabActive]}
              onPress={() => setActiveTab('password')}
            >
              <Text style={[styles.tabText, activeTab === 'password' && styles.tabTextActive]}>
                Güvenlik
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'email' && styles.tabActive]}
              onPress={() => setActiveTab('email')}
            >
              <Text style={[styles.tabText, activeTab === 'email' && styles.tabTextActive]}>
                İletişim
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Alanı */}
        <View style={styles.formCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeTab === 'password' ? 'Şifre Güncelleme' : 'E-posta Bilgileri'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {activeTab === 'password' 
                ? 'Hesap güvenliğinizi korumak için şifrenizi güncel tutun.' 
                : 'Bildirimleri alabilmek için güncel adresinizi girin.'}
            </Text>
          </View>

          {activeTab === 'password' ? (
            <View style={styles.formGroup}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mevcut Şifre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Yeni Şifre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="En az 6 karakter"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Yeni Şifre (Tekrar)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tekrar giriniz"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          ) : (
            <View style={styles.formGroup}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Yeni E-posta Adresi</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ornek@beko.com"
                  value={newEmail}
                  onChangeText={setNewEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Onay Şifresi</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Doğrulama için şifreniz"
                  value={passwordForEmail}
                  onChangeText={setPasswordForEmail}
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={activeTab === 'password' ? handlePasswordChange : handleEmailChange}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Profesyonel açık gri arka plan
  },
  tabWrapper: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#000', // Beko Kurumsal Siyah
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFF',
  },
  formCard: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  sectionHeader: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#000', // Kurumsal buton rengi
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});