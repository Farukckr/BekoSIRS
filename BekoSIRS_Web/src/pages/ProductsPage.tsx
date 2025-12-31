import React, { useEffect, useState } from "react";
import { Package, Plus, Edit2, Trash2, Eye, X, Tag, UserPlus, CheckCircle, Calendar } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modallar için State'ler
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false); // Atama Modalı
  
  // Atama Formu State'leri
  const [activeCustomers, setActiveCustomers] = useState<any[]>([]);
  const [assignData, setAssignData] = useState({
    customerId: "",
    serialNumber: "",
    purchaseDate: new Date().toISOString().split('T')[0] // Bugünün tarihi
  });
  const [assignLoading, setAssignLoading] = useState(false);

  const token = localStorage.getItem("access");

  useEffect(() => {
    fetchProducts();
    fetchActiveCustomers(); // Sayfa açılınca müşterileri de çek
  }, []);

  // 1. Ürünleri Çek
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/products/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setProducts(data);
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Aktif Müşterileri Çek (Dropdown için)
  const fetchActiveCustomers = async () => {
    try {
      // Backend'deki tüm kullanıcıları çekip frontend'de filtreliyoruz
      // (Backend'de ?role=customer filtresi varsa URL'i ona göre güncelleyebilirsin)
      const res = await fetch("http://127.0.0.1:8000/api/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const users = await res.json();
        // Sadece Aktif ve Rolü 'customer' olanları al
        const customers = users.filter((u: any) => u.role === 'customer' && u.is_active);
        setActiveCustomers(customers);
      }
    } catch (error) {
      console.error("Müşteriler çekilemedi", error);
    }
  };

  // 3. Ürün Silme
  const handleDeleteProduct = async (id: number, name: string) => {
    if (!window.confirm(`"${name}" ürününü silmek istediğinizden emin misiniz?`)) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/products/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok || res.status === 204) {
        alert("✅ Ürün başarıyla silindi!");
        await fetchProducts();
      } else {
        throw new Error("Ürün silinemedi.");
      }
    } catch (err: any) {
      alert("❌ Hata: " + err.message);
    }
  };

  // 4. Atama İşlemi (POST)
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignData.customerId || !assignData.serialNumber) {
      alert("Lütfen müşteri seçin ve seri numarası girin.");
      return;
    }

    setAssignLoading(true);
    try {
      // Backend'de bu endpointin urls.py içinde tanımlı olduğundan emin olun.
      // Genellikle router.register('product-ownerships', ...) şeklindedir.
      const res = await fetch("http://127.0.0.1:8000/api/product-ownerships/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: selectedProduct.id,
          customer: assignData.customerId,
          serial_number: assignData.serialNumber,
          purchase_date: assignData.purchaseDate
        }),
      });

      if (res.ok) {
        alert(`✅ ${selectedProduct.name} başarıyla atandı!`);
        setShowAssignModal(false);
        setAssignData({ customerId: "", serialNumber: "", purchaseDate: new Date().toISOString().split('T')[0] });
      } else {
        const errData = await res.json();
        alert("❌ Atama Hatası: " + JSON.stringify(errData));
      }
    } catch (error: any) {
      alert("❌ Bağlantı hatası: " + error.message);
    } finally {
      setAssignLoading(false);
    }
  };

  // Yardımcı Fonksiyonlar
  const openAssignModal = (product: any) => {
    setSelectedProduct(product);
    setShowAssignModal(true);
  };

  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  // İstatistik Hesaplamaları
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const inStockCount = products.filter((p) => (p.stock || 0) > 0).length;
  const outOfStockCount = products.filter((p) => (p.stock || 0) <= 0).length;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package size={28} className="text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900">Ürün Yönetimi</h1>
            </div>
            <button
              onClick={() => (window.location.href = "/dashboard/products/add")}
              className="bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-all font-medium flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Yeni Ürün Ekle</span>
            </button>
          </div>
        </header>

        {/* Ana İçerik */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            
            {/* İstatistikler (DÜZELTİLDİ: Artık gerçek stok verisi kullanıyor) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
                <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                <p className="text-gray-600 text-sm">Toplam Ürün Çeşidi</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
                <p className="text-3xl font-bold text-blue-600">{totalStock}</p>
                <p className="text-gray-600 text-sm">Toplam Stok Adedi</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
                <p className="text-3xl font-bold text-green-600">{inStockCount}</p>
                <p className="text-gray-600 text-sm">Stokta Olanlar</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
                <p className="text-3xl font-bold text-red-600">{outOfStockCount}</p>
                <p className="text-gray-600 text-sm">Stok Tükendi</p>
              </div>
            </div>

            {/* Ürün Listesi Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const stock = product.stock || 0;
                const isAvailable = stock > 0;
                
                return (
                  <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col">
                    
                    {/* Görsel Alanı */}
                    <div className="relative h-56 bg-gray-100">
                      {product.image ? (
                        <img
                          src={`http://127.0.0.1:8000${product.image}`} // URL düzeltmesi
                          alt={product.name}
                          className="w-full h-full object-contain p-4"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={48} className="text-gray-300" />
                        </div>
                      )}

                      {/* Stok Rozeti (DÜZELTİLDİ) */}
                      <div className="absolute top-4 right-4">
                        <span className={`${isAvailable ? "bg-green-500" : "bg-red-500"} text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm`}>
                          {isAvailable ? `${stock} Adet` : "Stok Yok"}
                        </span>
                      </div>
                    </div>

                    {/* Bilgiler ve Butonlar */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="mb-4 flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Tag size={14} className="text-gray-400" />
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            {product.category?.name || "Kategori Yok"}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-2xl font-bold text-blue-600">{product.price}₺</p>
                      </div>

                      {/* Aksiyon Butonları */}
                      <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-100">
                        {/* 1. Atama Butonu (YENİ) */}
                        <button
                          onClick={() => openAssignModal(product)}
                          className="col-span-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
                          title="Müşteriye Ata"
                        >
                          <UserPlus size={18} />
                        </button>

                        {/* 2. Düzenle */}
                        <button
                          onClick={() => (window.location.href = `/dashboard/products/edit/${product.id}`)}
                          className="col-span-1 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                          title="Düzenle"
                        >
                          <Edit2 size={18} />
                        </button>

                        {/* 3. Görüntüle */}
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="col-span-1 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                          title="Detay"
                        >
                          <Eye size={18} />
                        </button>

                        {/* 4. Sil */}
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="col-span-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* --- MODAL: MÜŞTERİYE ÜRÜN ATA --- */}
      {showAssignModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Ürün Atama</h3>
              <button onClick={() => setShowAssignModal(false)}><X size={20} className="text-gray-500" /></button>
            </div>
            
            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3">
                <Package className="text-blue-600" size={20} />
                <div>
                  <p className="text-xs text-blue-600 font-bold uppercase">Seçilen Ürün</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.name}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Seçin</label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={assignData.customerId}
                  onChange={(e) => setAssignData({...assignData, customerId: e.target.value})}
                >
                  <option value="">-- Müşteri Seç --</option>
                  {activeCustomers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name} ({customer.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seri Numarası (Zorunlu)</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: SN-2025-001"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={assignData.serialNumber}
                  onChange={(e) => setAssignData({...assignData, serialNumber: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">Veritabanı yapısı gereği her atama için benzersiz bir seri no girilmelidir.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Satış Tarihi</label>
                <input
                  type="date"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={assignData.purchaseDate}
                  onChange={(e) => setAssignData({...assignData, purchaseDate: e.target.value})}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {assignLoading ? "Atanıyor..." : <><CheckCircle size={18} /> Atamayı Tamamla</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ÜRÜN GÖRÜNTÜLE --- */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Ürün Detayı</h3>
              <button onClick={() => setShowViewModal(false)}><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto">
               <div className="flex justify-center mb-6">
                 <img src={`http://127.0.0.1:8000${selectedProduct.image}`} className="h-64 object-contain" alt={selectedProduct.name}/>
               </div>
               <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
               <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
               <div className="grid grid-cols-2 gap-4 text-sm">
                 <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">Kategori</p>
                    <p className="font-semibold">{selectedProduct.category?.name}</p>
                 </div>
                 <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">Stok</p>
                    <p className="font-semibold">{selectedProduct.stock || 0} Adet</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}