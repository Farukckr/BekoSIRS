import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { Package, Plus, Search, Filter, Eye, X } from "lucide-react";

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal (Detay penceresi) için state'ler
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  // 🔹 Ürünleri backend'den çek
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("access");

        if (!token) {
          throw new Error("Token bulunamadı. Lütfen tekrar giriş yapın.");
        }

        const response = await fetch("http://127.0.0.1:8000/api/products/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          throw new Error("Yetkilendirme hatası: Lütfen tekrar giriş yapın.");
        }

        if (!response.ok) {
          throw new Error("Veri çekme başarısız. Backend yanıt vermiyor.");
        }

        const data = await response.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/";
  };

  // Detay gösterme fonksiyonu
  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tümü" || product.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["Tümü", ...Array.from(new Set(products.map(p => p.category_name).filter(Boolean)))];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sol Menü */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Package size={28} className="text-blue-500" />
                <h1 className="text-2xl font-bold text-gray-900">Beko Ürün Paneli</h1>
              </div>
              <button
                onClick={handleLogout}
                className="bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-all font-medium"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-2">YÖNETİM PANELİ</p>
                <h2 className="text-4xl font-bold mb-3">Ürünlerinizi Yönetin</h2>
                <p className="text-gray-300 text-lg">Tüm Beko ürünlerinizi tek bir yerden kontrol edin</p>
              </div>
              <button
                onClick={() => navigate("/dashboard/products/add")}
                className="bg-white text-black px-8 py-3.5 rounded-full hover:bg-gray-100 transition-all font-semibold flex items-center space-x-2 shadow-lg"
              >
                <Plus size={20} />
                <span>Yeni Ürün Ekle</span>
              </button>
            </div>
          </div>
        </div>

        {/* Ana İçerik Alanı */}
        <main className="max-w-7xl mx-auto w-full px-6 py-8">
          {/* Arama ve Filtreler */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black cursor-pointer bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ürün Listesi Grid */}
          {!loading && !error && filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                // ❗ STOK KONTROLÜ (DÜZELTİLDİ)
                // Veritabanından gelen 'stock' alanını kontrol ediyoruz
                const stockCount = product.stock ?? 0;
                const isAvailable = stockCount > 0;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 group"
                  >
                    {/* Ürün Görseli */}
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                      {/* Görsel URL'si varsa kullan, yoksa placeholder göster */}
                      <img
                        src={product.image ? `http://127.0.0.1:8000${product.image}` : "https://via.placeholder.com/300?text=Resim+Yok"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/300?text=Hata")}
                      />
                      <div className="absolute top-4 right-4">
                        <span
                          className={`${
                            isAvailable ? "bg-green-500" : "bg-red-500"
                          } text-white px-3 py-1 rounded-full text-sm font-medium`}
                        >
                          {isAvailable ? `Stokta (${stockCount})` : "Stok Yok"}
                        </span>
                      </div>
                    </div>

                    {/* Ürün Bilgileri */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-500 mb-4">{product.category_name || "Kategori Yok"}</p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-blue-600">{product.price} ₺</span>
                      </div>

                      <button 
                        onClick={() => handleViewProduct(product)}
                        className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-full hover:bg-black hover:text-white transition-all font-medium flex items-center justify-center space-x-2"
                      >
                        <Eye size={18} />
                        <span>Detayları Görüntüle</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* MODAL: Ürün Detayları */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 flex justify-between items-center border-b">
              <h2 className="text-2xl font-bold text-gray-900">Ürün Detayı</h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-gray-50 rounded-2xl p-4 flex justify-center">
                <img 
                  src={selectedProduct.image ? `http://127.0.0.1:8000${selectedProduct.image}` : "https://via.placeholder.com/300?text=Resim+Yok"}
                  className="max-h-64 object-contain rounded-lg" 
                  alt={selectedProduct.name} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ürün Adı</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedProduct.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kategori</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedProduct.category_name || "Belirtilmemiş"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fiyat</p>
                  <p className="text-lg font-bold text-blue-600">{selectedProduct.price} ₺</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stok Durumu</p>
                  {/* Modal İçinde de Stok Kontrolü */}
                  <p className={`text-lg font-semibold ${(selectedProduct.stock ?? 0) > 0 ? "text-green-600" : "text-red-600"}`}>
                    {(selectedProduct.stock ?? 0) > 0 ? `${selectedProduct.stock} Adet` : "Stok Yok"}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ürün Açıklaması</p>
                <p className="text-gray-600 leading-relaxed">
                  {selectedProduct.description || "Bu ürün için bir açıklama girilmemiş."}
                </p>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <button 
                onClick={() => setShowModal(false)} 
                className="w-full bg-black text-white py-3.5 rounded-full font-bold hover:bg-gray-800 transition-all"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}