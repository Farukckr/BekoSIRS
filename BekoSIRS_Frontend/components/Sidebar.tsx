import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Href } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { getToken } from '../storage/storage.native';

// BEKO PREMIUM COLOR PALETTE
const BEKO_THEME = {
  deepNavy: '#001E3C',    // Çok daha koyu, elit bir lacivert
  primaryBlue: '#00427A',  // Standart Beko Mavisi
  accentBlue: '#007AFF',   // Vurgu rengi
  background: '#F8F9FA',   // Çok açık gri arka plan
  white: '#FFFFFF',
  textMain: '#1A1C1E',     // Neredeyse siyah, net metinler
  textSecondary: '#6C757D',// İkincil metinler
  danger: '#C0392B',       // Soft ama belirgin kırmızı
  border: '#E9ECEF'
};

interface SidebarProps {
  onClose: () => void;
}

type MenuItem = {
  icon: string;
  label: string;
  route: Href;
};

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { logout } = useAuth();
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = await getToken();
      if (token) {
        setUserInfo({
          name: 'Berkan Bey', // Örnek veri
          email: 'berkan@beko.com.tr',
        });
      }
    } catch (error) {
      console.error('Error info error:', error);
    }
  };

  const menuItems: MenuItem[] = [
    { icon: '📂', label: 'Ürün Katalog', route: '/products' as Href },
    { icon: '🛡️', label: 'Cihazlarım', route: '/my-products' as Href },
    { icon: '👤', label: 'Profil Ayarları', route: '/settings' as Href },
  ];

  const handleNavigation = (route: Href) => {
    onClose();
    router.push(route);
  };

  const handleCustomerService = () => {
    Alert.alert(
      'Müşteri Hizmetleri',
      'Beko Danışma Hattı’na hoş geldiniz.',
      [
        { text: 'E-posta', onPress: () => Linking.openURL('mailto:destek@beko.com') },
        { text: 'Hemen Ara', onPress: () => Linking.openURL('tel:08502589898') },
        { text: 'Kapat', style: 'cancel' },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Güvenli Çıkış', 'Oturumunuz sonlandırılacaktır. Onaylıyor musunuz?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: async () => { onClose(); await logout(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* BRANDING HEADER */}
      <View style={styles.brandSection}>
        <View style={styles.bekoBadge}>
          <Text style={styles.bekoText}>BEKO</Text>
        </View>
        <Text style={styles.slogan}>SIRS - Smart Inventory</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* USER PROFILE CARD */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>
              {userInfo?.name?.charAt(0).toUpperCase() || 'B'}
            </Text>
          </View>
          <View style={styles.userMeta}>
            <Text style={styles.userName}>{userInfo?.name || 'Değerli Müşterimiz'}</Text>
            <Text style={styles.userEmail}>{userInfo?.email || 'beko.com.tr'}</Text>
          </View>
        </View>

        {/* NAVIGATION GROUP */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YÖNETİM</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              onPress={() => handleNavigation(item.route)}
              activeOpacity={0.5}
            >
              <View style={styles.iconCircle}>
                <Text style={styles.iconSmall}>{item.icon}</Text>
              </View>
              <Text style={styles.navLabel}>{item.label}</Text>
              <Text style={styles.navArrow}>❯</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SUPPORT CARD - PREMIUM LOOK */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.premiumCard}
            onPress={handleCustomerService}
            activeOpacity={0.9}
          >
            <View style={styles.premiumCardContent}>
              <Text style={styles.premiumCardTitle}>Beko Priority Support</Text>
              <Text style={styles.premiumCardDesc}>7/24 Kesintisiz Teknik Destek</Text>
              <View style={styles.supportButton}>
                <Text style={styles.supportButtonText}>Bize Ulaşın</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
          <View style={styles.logoutCircle}>
            <Text style={{fontSize: 16}}>🔒</Text>
          </View>
          <Text style={styles.logoutText}>Oturumu Güvenli Kapat</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.legal}>Beko SIRS Dashboard v1.2</Text>
        <View style={styles.legalDivider} />
        <Text style={styles.legal}>Arçelik Pazarlama A.Ş.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BEKO_THEME.white,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  brandSection: {
    padding: 24,
    alignItems: 'flex-start',
    backgroundColor: BEKO_THEME.white,
  },
  bekoBadge: {
    backgroundColor: BEKO_THEME.deepNavy,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 2,
  },
  bekoText: {
    color: BEKO_THEME.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  slogan: {
    fontSize: 10,
    color: BEKO_THEME.textSecondary,
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BEKO_THEME.background,
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: BEKO_THEME.deepNavy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: BEKO_THEME.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  userMeta: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: BEKO_THEME.textMain,
  },
  userEmail: {
    fontSize: 12,
    color: BEKO_THEME.textSecondary,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: BEKO_THEME.textSecondary,
    marginBottom: 15,
    letterSpacing: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BEKO_THEME.border,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BEKO_THEME.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconSmall: {
    fontSize: 16,
  },
  navLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: BEKO_THEME.textMain,
  },
  navArrow: {
    fontSize: 12,
    color: BEKO_THEME.border,
  },
  premiumCard: {
    backgroundColor: BEKO_THEME.deepNavy,
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  premiumCardContent: {
    alignItems: 'flex-start',
  },
  premiumCardTitle: {
    color: BEKO_THEME.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  premiumCardDesc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 15,
  },
  supportButton: {
    backgroundColor: BEKO_THEME.white,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  supportButtonText: {
    color: BEKO_THEME.deepNavy,
    fontSize: 12,
    fontWeight: '800',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
  },
  logoutCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutText: {
    color: BEKO_THEME.danger,
    fontWeight: '700',
    fontSize: 14,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: BEKO_THEME.border,
  },
  legal: {
    fontSize: 10,
    color: BEKO_THEME.textSecondary,
  },
  legalDivider: {
    height: 1,
    width: 20,
    backgroundColor: BEKO_THEME.border,
    marginVertical: 4,
  }
});

export default Sidebar;