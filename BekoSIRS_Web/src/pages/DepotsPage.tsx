import React, { useEffect, useState } from "react";
import * as Lucide from "lucide-react";
import Sidebar from "../components/Sidebar";
import Toast, { type ToastType } from "../components/Toast";
import { depotAPI } from "../services/api";
import type { DepotLocation } from "../types/location";

const {
    MapPin = () => <span>📍</span>,
    Plus = () => <span>+</span>,
    Edit = () => <span>✏️</span>,
    Trash2 = () => <span>🗑</span>,
    Star = () => <span>⭐</span>,
    X = () => <span>✕</span>,
    Loader2 = () => <span>↻</span>,
    CheckCircle = () => <span>✓</span>,
} = Lucide as any;

export default function DepotsPage() {
    const [depots, setDepots] = useState<DepotLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [mapModalOpen, setMapModalOpen] = useState(false);
    const [editingDepot, setEditingDepot] = useState<DepotLocation | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [isDefault, setIsDefault] = useState(false);

    // Toast state
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<ToastType>("info");
    const [toastOpen, setToastOpen] = useState(false);

    useEffect(() => {
        fetchDepots();
    }, []);

    const fetchDepots = async () => {
        try {
            setLoading(true);
            const response = await depotAPI.list();

            // Backend returns paginated response: { count, next, previous, results }
            const data = response.data as any;
            const depotList = data?.results || data; // Try results first, fallback to data

            setDepots(Array.isArray(depotList) ? depotList : []);
        } catch (error: any) {
            console.error('Error fetching depots:', error);
            showToast("Depolar yüklenirken hata oluştu", "error");
            setDepots([]); // Reset to empty array on error
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string, type: ToastType) => {
        setToastMessage(message);
        setToastType(type);
        setToastOpen(true);
    };

    const handleOpenModal = (depot?: DepotLocation) => {
        if (depot) {
            setEditingDepot(depot);
            setName(depot.name);
            setLatitude(depot.latitude);
            setLongitude(depot.longitude);
            setIsDefault(depot.is_default);
        } else {
            setEditingDepot(null);
            setName("");
            setLatitude("");
            setLongitude("");
            setIsDefault(false);
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingDepot(null);
        setName("");
        setLatitude("");
        setLongitude("");
        setIsDefault(false);
    };

    const handleOpenMapModal = () => {
        setMapModalOpen(true);
    };

    const handleSelectLocation = (lat: number, lng: number) => {
        setLatitude(lat.toFixed(7));
        setLongitude(lng.toFixed(7));
        setMapModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            showToast("Depo adı zorunludur", "error");
            return;
        }

        if (!latitude || !longitude) {
            showToast("Konum seçilmelidir", "error");
            return;
        }

        const depotData = {
            name: name.trim(),
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            is_default: isDefault,
        };

        try {
            setSubmitting(true);

            if (editingDepot) {
                await depotAPI.update(editingDepot.id, depotData);
                showToast("Depo başarıyla güncellendi", "success");
            } else {
                await depotAPI.create(depotData);
                showToast("Depo başarıyla oluşturuldu", "success");
            }

            handleCloseModal();
            fetchDepots();
        } catch (error: any) {
            const errorMsg = error.response?.data?.name?.[0] || "İşlem başarısız oldu";
            showToast(errorMsg, "error");
            console.error("Error saving depot:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetDefault = async (depot: DepotLocation) => {
        try {
            await depotAPI.setDefault(depot.id);
            showToast(`${depot.name} varsayılan depo olarak ayarlandı`, "success");
            fetchDepots();
        } catch (error) {
            showToast("Varsayılan depo ayarlanamadı", "error");
            console.error("Error setting default depot:", error);
        }
    };

    const handleDelete = async (depot: DepotLocation) => {
        if (!confirm(`${depot.name} deposunu silmek istediğinizden emin misiniz?`)) {
            return;
        }

        try {
            await depotAPI.delete(depot.id);
            showToast("Depo başarıyla silindi", "success");
            fetchDepots();
        } catch (error) {
            showToast("Depo silinemedi", "error");
            console.error("Error deleting depot:", error);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <MapPin className="w-8 h-8 text-blue-600" />
                        Depo Yönetimi
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Teslimat başlangıç noktalarını yönetin
                    </p>
                </div>

                {/* Add Button */}
                <div className="mb-6">
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Yeni Depo Ekle
                    </button>
                </div>

                {/* Depots List */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : depots.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Henüz depo eklenmemiş
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Teslimat rotalarınız için bir depo konumu ekleyin
                        </p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            İlk Depoyu Ekle
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Depo Adı
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Konum
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Durum
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Oluşturan
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        İşlemler
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {depots.map((depot) => (
                                    <tr key={depot.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">
                                                    {depot.name}
                                                </span>
                                                {depot.is_default && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                                                        <Star className="w-3 h-3" />
                                                        Varsayılan
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {depot.latitude}, {depot.longitude}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                                Aktif
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {depot.created_by_name || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {!depot.is_default && (
                                                    <button
                                                        onClick={() => handleSetDefault(depot)}
                                                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded transition"
                                                        title="Varsayılan Yap"
                                                    >
                                                        <Star className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleOpenModal(depot)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                    title="Düzenle"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(depot)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                    title="Sil"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Add/Edit Modal */}
                {modalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                            <div className="flex items-center justify-between p-6 border-b">
                                <h2 className="text-xl font-bold">
                                    {editingDepot ? "Depo Düzenle" : "Yeni Depo Ekle"}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-1 hover:bg-gray-100 rounded transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Depo Adı *
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Örn: Lefkoşa Ana Depo"
                                        required
                                    />
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Konum *
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={latitude}
                                            onChange={(e) => setLatitude(e.target.value)}
                                            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enlem"
                                            readOnly
                                        />
                                        <input
                                            type="text"
                                            value={longitude}
                                            onChange={(e) => setLongitude(e.target.value)}
                                            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Boylam"
                                            readOnly
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleOpenMapModal}
                                        className="mt-2 w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2"
                                    >
                                        <MapPin className="w-4 h-4" />
                                        Harita'dan Seç
                                    </button>
                                </div>

                                {/* Is Default */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        checked={isDefault}
                                        onChange={(e) => setIsDefault(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="isDefault" className="text-sm text-gray-700 cursor-pointer">
                                        Varsayılan depo olarak ayarla
                                    </label>
                                </div>

                                {/* Submit */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Kaydediliyor...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                {editingDepot ? "Güncelle" : "Oluştur"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Map Modal - Placeholder for now */}
                {mapModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 h-[600px] flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b">
                                <h2 className="text-lg font-bold">Depo Konumunu Seçin</h2>
                                <button
                                    onClick={() => setMapModalOpen(false)}
                                    className="p-1 hover:bg-gray-100 rounded transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 p-4 bg-gray-100 flex items-center justify-center">
                                <div className="text-center">
                                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">
                                        Google Maps entegrasyonu için API key gereklidir
                                    </p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Şimdilik manuel koordinat girişi kullanılıyor
                                    </p>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleSelectLocation(35.1856, 33.3823)}
                                            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Örnek: Lefkoşa (35.1856, 33.3823)
                                        </button>
                                        <button
                                            onClick={() => handleSelectLocation(35.3387, 33.3176)}
                                            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Örnek: Girne (35.3387, 33.3176)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Toast */}
            {toastOpen && (
                <div className="fixed top-4 right-4 z-50">
                    <Toast
                        message={toastMessage}
                        type={toastType}
                        onClose={() => setToastOpen(false)}
                    />
                </div>
            )}
        </div>
    );
}
