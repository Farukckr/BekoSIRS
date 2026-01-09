import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { customerService } from "../services/customerService";
import { locationService } from "../services/locationService";
import type { Customer, CustomerFormData, District, Area } from "../types/customer";

interface EditCustomerModalProps {
    customer: Customer | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditCustomerModal({
    customer,
    isOpen,
    onClose,
    onSuccess,
}: EditCustomerModalProps) {
    const [formData, setFormData] = useState<CustomerFormData>({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        district: null,
        area: null,
        open_address: "",
    });

    const [districts, setDistricts] = useState<District[]>([]);
    const [areas, setAreas] = useState<Area[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            loadDistricts();
        }
    }, [isOpen]);

    useEffect(() => {
        if (customer && isOpen) {
            setFormData({
                first_name: customer.first_name || "",
                last_name: customer.last_name || "",
                email: customer.email || "",
                phone_number: customer.phone_number || "",
                district: customer.district,
                area: customer.area,
                open_address: customer.open_address || "",
            });

            if (customer.district) {
                loadAreas(customer.district);
            }
        }
    }, [customer, isOpen]);

    const loadDistricts = async () => {
        try {
            const data = await locationService.getDistricts();
            setDistricts(data);
        } catch (err) {
            console.error("Error loading districts:", err);
        }
    };

    const loadAreas = async (districtId: number) => {
        try {
            const data = await locationService.getAreas(districtId);
            setAreas(data);
        } catch (err) {
            console.error("Error loading areas:", err);
        }
    };

    const handleDistrictChange = (districtId: string) => {
        const id = districtId ? parseInt(districtId) : null;
        setFormData((prev) => ({
            ...prev,
            district: id,
            area: null, // Reset area when district changes
        }));

        if (id) {
            loadAreas(id);
        } else {
            setAreas([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!formData.first_name.trim()) {
            setError("Ad alanı zorunludur");
            return;
        }
        if (!formData.last_name.trim()) {
            setError("Soyad alanı zorunludur");
            return;
        }
        if (!formData.email.trim()) {
            setError("E-posta alanı zorunludur");
            return;
        }

        try {
            setLoading(true);
            await customerService.updateCustomer(customer!.id, formData);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Güncelleme başarısız oldu");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !customer) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-gray-900">Müşteriyi Düzenle</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Personal Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kişisel Bilgiler</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ad <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, first_name: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="Ad"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Soyad <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, last_name: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="Soyad"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    E-posta <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="ornek@email.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Telefon
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone_number}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone_number: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="+90 555 123 45 67"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Adres Bilgileri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    İlçe
                                </label>
                                <select
                                    value={formData.district || ""}
                                    onChange={(e) => handleDistrictChange(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
                                >
                                    <option value="">İlçe Seçiniz</option>
                                    {districts.map((district) => (
                                        <option key={district.id} value={district.id}>
                                            {district.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mahalle/Köy
                                </label>
                                <select
                                    value={formData.area || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            area: e.target.value ? parseInt(e.target.value) : null,
                                        })
                                    }
                                    disabled={!formData.district || areas.length === 0}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value="">
                                        {formData.district
                                            ? areas.length === 0
                                                ? "Yükleniyor..."
                                                : "Mahalle/Köy Seçiniz"
                                            : "Önce İlçe Seçiniz"}
                                    </option>
                                    {areas.map((area) => (
                                        <option key={area.id} value={area.id}>
                                            {area.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Açık Adres
                            </label>
                            <textarea
                                value={formData.open_address}
                                onChange={(e) =>
                                    setFormData({ ...formData, open_address: e.target.value })
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
                                rows={3}
                                placeholder="Ev/Apartman numarası, cadde, sokak vb."
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between rounded-b-2xl">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-100 font-medium transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Save size={20} />
                        <span>{loading ? "Kaydediliyor..." : "Kaydet"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
