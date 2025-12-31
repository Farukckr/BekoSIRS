import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../services/api';

// Helper: Dinamik image URL oluştur (hardcoded IP kullanmadan)
const getImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = (api.defaults.baseURL || '').replace(/\/$/, '');
  return `${baseUrl}${imagePath}`;
};

interface ProductOwnership {
  id: number;
  product: {
    id: number;
    name: string;
    brand: string;
    price: string;
    image: string | null;
    category_name: string | null;
    warranty_duration_months: number;
  };
  purchase_date: string;
  serial_number: string | null;
  warranty_end_date: string | null;
  is_warranty_active: boolean;
  days_until_warranty_expires: number | null;
  active_service_requests: number;
}

export default function MyProductsScreen() {
  const router = useRouter();
  const [ownerships, setOwnerships] = useState<ProductOwnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyProducts = useCallback(async () => {
    try {
      const response = await api.get('/api/product-ownerships/my-ownerships/');
      setOwnerships(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setOwnerships([]);
      } else {
        console.log('Error fetching products:', error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMyProducts();
  }, [fetchMyProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyProducts();
  }, [fetchMyProducts]);

  const getWarrantyStatus = (ownership: ProductOwnership) => {
    if (!ownership.warranty_end_date) {
      return { color: '#9CA3AF', text: 'Garanti bilgisi yok', icon: 'question-circle' };
    }
    if (!ownership.is_warranty_active) {
      return { color: '#EF4444', text: 'Garanti süresi doldu', icon: 'times-circle' };
    }
    if (ownership.days_until_warranty_expires && ownership.days_until_warranty_expires <= 30) {
      return { color: '#F59E0B', text: `${ownership.days_until_warranty_expires} gün kaldı`, icon: 'exclamation-circle' };
    }
    return { color: '#10B981', text: 'Garanti aktif', icon: 'check-circle' };
  };

  const handleProductPress = (ownership: ProductOwnership) => {
    router.push(`/product/${ownership.product.id}`);
  };

  const handleServiceRequest = (ownership: ProductOwnership) => {
    // Navigate to service requests with product info
    router.push({
      pathname: '/service-requests',
      params: { ownershipId: ownership.id }
    });
  };

  const renderProductCard = ({ item }: { item: ProductOwnership }) => {
    const warranty = getWarrantyStatus(item);
    const product = item.product;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.7}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product.image ? (
            <Image
              source={{ uri: getImageUrl(product.image) || '' }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <FontAwesome name="cube" size={40} color="#D1D5DB" />
            </View>
          )}

          {/* Active Service Badge */}
          {item.active_service_requests > 0 && (
            <View style={styles.serviceBadge}>
              <FontAwesome name="wrench" size={10} color="#fff" />
              <Text style={styles.serviceBadgeText}>{item.active_service_requests}</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.brand}>{product.brand}</Text>

          {product.category_name && (
            <Text style={styles.category}>{product.category_name}</Text>
          )}

          {/* Serial Number */}
          {item.serial_number && (
            <View style={styles.serialContainer}>
              <FontAwesome name="barcode" size={12} color="#6B7280" />
              <Text style={styles.serialText}>{item.serial_number}</Text>
            </View>
          )}

          {/* Purchase Date */}
          <View style={styles.dateContainer}>
            <FontAwesome name="calendar" size={12} color="#6B7280" />
            <Text style={styles.dateText}>
              Alım: {new Date(item.purchase_date).toLocaleDateString('tr-TR')}
            </Text>
          </View>

          {/* Warranty Status */}
          <View style={[styles.warrantyContainer, { backgroundColor: `${warranty.color}15` }]}>
            <FontAwesome name={warranty.icon as any} size={14} color={warranty.color} />
            <Text style={[styles.warrantyText, { color: warranty.color }]}>
              {warranty.text}
            </Text>
            {item.warranty_end_date && item.is_warranty_active && (
              <Text style={styles.warrantyDate}>
                (Bitiş: {new Date(item.warranty_end_date).toLocaleDateString('tr-TR')})
              </Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleServiceRequest(item)}
            >
              <FontAwesome name="wrench" size={14} color="#000" />
              <Text style={styles.actionButtonText}>Servis Talebi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.detailButton]}
              onPress={() => handleProductPress(item)}
            >
              <FontAwesome name="info-circle" size={14} color="#fff" />
              <Text style={styles.detailButtonText}>Detay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Ürünleriniz hazırlanıyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {ownerships.length > 0 ? (
        <FlatList
          data={ownerships}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#000']} />
          }
          ListHeaderComponent={
            <View style={styles.headerBadge}>
              <View style={styles.headerTop}>
                <FontAwesome name="cube" size={24} color="#fff" />
                <Text style={styles.badgeTitle}>Kayıtlı Cihazlarım</Text>
              </View>
              <Text style={styles.badgeSubtitle}>
                {ownerships.length} adet ürün kayıtlı
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {ownerships.filter(o => o.is_warranty_active).length}
                  </Text>
                  <Text style={styles.statLabel}>Garantili</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {ownerships.reduce((sum, o) => sum + o.active_service_requests, 0)}
                  </Text>
                  <Text style={styles.statLabel}>Aktif Servis</Text>
                </View>
              </View>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <FontAwesome name="inbox" size={50} color="#D1D5DB" />
          </View>
          <Text style={styles.emptyTitle}>Henüz Ürününüz Yok</Text>
          <Text style={styles.emptyDescription}>
            Size atanmış bir ürün bulunamadı. Ürünleriniz yetkili servis tarafından tanımlandığında burada görünecektir.
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.browseButtonText}>Ürünlere Göz At</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerBadge: {
    backgroundColor: '#000',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  badgeSubtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#374151',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 16,
  },
  productName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  brand: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  serialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  serialText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  warrantyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  warrantyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  warrantyDate: {
    fontSize: 11,
    color: '#6B7280',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  detailButton: {
    backgroundColor: '#000',
  },
  detailButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  browseButton: {
    marginTop: 24,
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
