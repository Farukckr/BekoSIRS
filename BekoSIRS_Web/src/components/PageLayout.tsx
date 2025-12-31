// src/components/PageLayout.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Bu component iki "prop" alacak:
// title: Sayfanın başlığını göstermek için (Örn: "Kategori Yönetimi")
// children: Sayfanın kendi içeriğini göstermek için
export default function PageLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BU BÖLÜM TÜM SAYFALARDA OTOMATİK GÖZÜKECEK OLAN BAŞLIK KISMI
      */}
      <header className="bg-white border-b border-gray-200 sticky top-16 z-40"> {/* Navbar'ın altında kalması için top-16 */}
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            {/* Geri Dön Butonu */}
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-700" />
            </button>
            
            <div className="w-px h-6 bg-gray-200"></div>

            {/* Dinamik Sayfa Başlığı */}
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
        </div>
      </header>

      {/* BU BÖLÜM İSE SAYFANIN KENDİ İÇERİĞİ (CHILDREN)
      */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}