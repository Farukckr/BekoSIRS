import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useSegments } from 'expo-router';
import Sidebar from './Sidebar';

const { width } = Dimensions.get('window');

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  showBack?: boolean;
  headerColor?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  showBack = true,
  headerColor = '#000000', // Varsayılan Beko Siyahı
}) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const segments = useSegments();
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;

  // Sayfa her değiştiğinde Sidebar'ı otomatik kapat
  useEffect(() => {
    setSidebarVisible(false);
    slideAnim.setValue(-width * 0.8);
  }, [segments]);

  const openSidebar = () => {
    setSidebarVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: -width * 0.8,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setSidebarVisible(false));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={headerColor} />
      
      {/* HEADER - Profesyonel Beko Tasarımı */}
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={openSidebar}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
            
            {showBack && segments.length > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title.toUpperCase()}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.miniLogo}>
              <Text style={styles.miniLogoText}>BEKO</Text>
            </View>
          </View>
        </View>
      </View>

      {/* PAGE CONTENT */}
      <View style={styles.content}>{children}</View>

      {/* SIDEBAR MODAL */}
      <Modal
        visible={sidebarVisible}
        transparent
        animationType="none"
        onRequestClose={closeSidebar}
      >
        <View style={styles.overlay}>
          {/* Backdrop (Karartma) */}
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.backdrop} 
            onPress={closeSidebar} 
          />

          {/* Animasyonlu Panel */}
          <Animated.View
            style={[
              styles.sidebarContainer,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <Sidebar onClose={closeSidebar} />
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingVertical: Platform.OS === 'ios' ? 15 : 12,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  menuButton: {
    padding: 5,
    marginRight: 10,
  },
  backButton: {
    padding: 5,
  },
  menuIcon: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  miniLogo: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniLogoText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)', // Daha profesyonel karartma
  },
  sidebarContainer: {
    width: width * 0.75, // Biraz daha dar ve şık
    height: '100%',
    backgroundColor: '#FFFFFF',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
});

export default AppLayout;