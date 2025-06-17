import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Car,
  Truck,
  Calendar,
  FileText,
  Settings,
  Tag
} from 'lucide-react';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Kontrol Paneli' },
  { path: '/clients', icon: Users, label: 'Müşteriler' },
  { path: '/companies', icon: Building2, label: 'Şirketler' },
  { path: '/drivers', icon: Car, label: 'Sürücüler' },
  { path: '/vehicles', icon: Truck, label: 'Araçlar' },
  { path: '/bookings', icon: Calendar, label: 'Rezervasyonlar' },
  { path: "/invoices", icon: FileText, label: "Faturalar" },
  { path: "/settings", icon: Settings, label: "Ayarlar" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-800">Turizm Yöneticisi</h1>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}


