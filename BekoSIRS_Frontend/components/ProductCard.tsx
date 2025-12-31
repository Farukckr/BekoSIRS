// components/ProductCard.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { wishlistAPI, viewHistoryAPI } from '../services/api';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    brand: string;
    price: string;
    image_url?: string;
    image?: string;
    stock?: number;
    category_name?: string;
  };
  onPress?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const router = useRouter();
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  const imageSource = product.image_url || product.image;

  useEffect(() => {
    checkWishlistStatus();
  }, [product.id]);

  const checkWishlistStatus = async () => {
    try {
      const response = await wishlistAPI.checkItem(product.id);
      setInWishlist(response.data.in_wishlist);
    } catch (error) {
      // Ignore error - user might not be logged in
    }
  };

  const handleWishlistToggle = async () => {
    setLoading(true);
    try {
      if (inWishlist) {
        await wishlistAPI.removeItem(product.id);
        setInWishlist(false);
      } else {
        await wishlistAPI.addItem(product.id);
        setInWishlist(true);
      }
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.error || 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handlePress = async () => {
    // Record view when product is clicked
    try {
      await viewHistoryAPI.recordView(product.id);
    } catch (error) {
      // Ignore error
    }
    if (onPress) {
      onPress();
    } else {
      // Navigate to product detail page
      router.push(`/product/${product.id}`);
    }
  };

  const isInStock = (product.stock ?? 0) > 0;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.card}>
        {imageSource && <Image source={{ uri: imageSource }} style={styles.image} />}

        {/* Wishlist Button */}
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={handleWishlistToggle}
          disabled={loading}
        >
          <FontAwesome
            name={inWishlist ? "heart" : "heart-o"}
            size={22}
            color={inWishlist ? "#f44336" : "#999"}
          />
        </TouchableOpacity>

        {/* Stock Badge */}
        {product.stock !== undefined && (
          <View style={[styles.stockBadge, { backgroundColor: isInStock ? '#4CAF50' : '#f44336' }]}>
            <Text style={styles.stockText}>
              {isInStock ? `Stokta` : 'Stok Yok'}
            </Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.brand}>{product.brand}</Text>
          {product.category_name && (
            <Text style={styles.category}>{product.category_name}</Text>
          )}
          <Text style={styles.price}>
            {parseFloat(product.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 200,
        backgroundColor: '#eee',
    },
    wishlistButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    stockBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        zIndex: 1,
    },
    stockText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    infoContainer: {
        padding: 15,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    brand: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 4,
    },
    category: {
        fontSize: 12,
        color: '#999',
        marginBottom: 8,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A237E',
        textAlign: 'right',
    },
});