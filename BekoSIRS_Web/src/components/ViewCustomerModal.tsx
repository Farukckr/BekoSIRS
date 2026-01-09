import { X } from "lucide-react";
import type { CustomerDetail } from "../types/customer";

interface ViewCustomerModalProps {
    customer: CustomerDetail | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ViewCustomerModal({
    customer,
    isOpen,
    onClose,
}: ViewCustomerModalProps) {
    if (!isOpen || !customer) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-gray-900">Müşteri Detayları</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Personal Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kişisel Bilgiler</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoField label="Ad" value={customer.first_name || "-"} />
                            <InfoField label="Soyad" value={customer.last_name || "-"} />
                            <InfoField label="Kullanıcı Adı" value={customer.username} />
                            <InfoField label="E-posta" value={customer.email} />
                            <InfoField label="Telefon" value={customer.phone_number || "-"} />
                            <InfoField
                                label="Durum"
                                value={customer.is_active ? "Aktif" : "Pasif"}
                                valueClassName={customer.is_active ? "text-green-600" : "text-red-600"}
                            />
                        </div>
                    </div>

                    {/* Address Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Adres Bilgileri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoField label="İlçe" value={customer.district_name || "-"} />
                            <InfoField label="Mahalle/Köy" value={customer.area_name || "-"} />
                        </div>
                        <div className="mt-4">
                            <InfoField
                                label="Açık Adres"
                                value={customer.open_address || "-"}
                                fullWidth
                            />
                        </div>
                    </div>

                    {/* Notification Preferences */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Bildirim Tercihleri
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <CheckField
                                label="Servis Güncellemeleri"
                                checked={customer.notify_service_updates}
                            />
                            <CheckField label="Fiyat Düşüşleri" checked={customer.notify_price_drops} />
                            <CheckField label="Stok Bildirimleri" checked={customer.notify_restock} />
                            <CheckField label="Ürün Önerileri" checked={customer.notify_recommendations} />
                            <CheckField
                                label="Garanti Uyarıları"
                                checked={customer.notify_warranty_expiry}
                            />
                            <CheckField label="Genel Bildirimler" checked={customer.notify_general} />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 font-medium transition-colors"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper Components
function InfoField({
    label,
    value,
    fullWidth = false,
    valueClassName = "text-gray-900",
}: {
    label: string;
    value: string;
    fullWidth?: boolean;
    valueClassName?: string;
}) {
    return (
        <div className={fullWidth ? "col-span-full" : ""}>
            <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
            <p className={`text-sm font-semibold ${valueClassName}`}>{value}</p>
        </div>
    );
}

function CheckField({ label, checked }: { label: string; checked?: boolean }) {
    return (
        <div className="flex items-center space-x-2">
            <div
                className={`w-4 h-4 rounded ${checked ? "bg-green-500" : "bg-gray-300"
                    } flex items-center justify-center`}
            >
                {checked && (
                    <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M5 13l4 4L19 7"></path>
                    </svg>
                )}
            </div>
            <span className="text-sm text-gray-700">{label}</span>
        </div>
    );
}
