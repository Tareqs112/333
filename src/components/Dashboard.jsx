import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Plus,
  Car,
  Building2,
  Hotel,
  Home,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState({
    upcomingBookings: 0,
    totalRevenue: 0,
    totalProfit: 0,
    activeClients: 0
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [accommodationStats, setAccommodationStats] = useState({
    totalNights: 0,
    totalRevenue: 0,
    totalProfit: 0,
    accommodationBreakdown: {}
  });
  const [detailedStats, setDetailedStats] = useState({
    totalCounts: { clients: 0, drivers: 0, vehicles: 0, bookings: 0 },
    bookingStatusBreakdown: {},
    serviceTypeBreakdown: {}
  });

  useEffect(() => {
    fetchDashboardSummary();
    fetchUpcomingBookings();
    fetchAccommodationStats();
    fetchDetailedStats();
  }, []);

  const fetchDashboardSummary = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard/summary');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStats(data);
      setRecentBookings(data.recentBookings || []);
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
    }
  };

  const fetchUpcomingBookings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard/upcoming-bookings');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUpcomingBookings(data);
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
    }
  };

  const fetchAccommodationStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard/accommodation-stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAccommodationStats(data);
    } catch (error) {
      console.error('Error fetching accommodation stats:', error);
    }
  };

  const fetchDetailedStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard/stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDetailedStats(data);
    } catch (error) {
      console.error('Error fetching detailed stats:', error);
    }
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'Hotel': return <Hotel className="h-4 w-4 text-blue-600" />;
      case 'Cabin': return <Home className="h-4 w-4 text-green-600" />;
      case 'Vehicle': return <Car className="h-4 w-4 text-purple-600" />;
      case 'Transfer': return <MapPin className="h-4 w-4 text-orange-600" />;
      case 'Tour': return <Calendar className="h-4 w-4 text-red-600" />;
      default: return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntil = (dateString) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Yarın';
    if (diffDays < 0) return 'Süresi geçti';
    return `${diffDays} gün`;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kontrol Paneli</h1>
        <p className="text-gray-600 text-sm md:text-base">Turizm yönetim sisteminize hoş geldiniz</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yaklaşan Rezervasyonlar</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
            <p className="text-xs text-muted-foreground">Sonraki 7 gün</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}</div>
            <p className="text-xs text-muted-foreground">Bu ay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kar</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalProfit ? stats.totalProfit.toLocaleString() : '0'}</div>
            <p className="text-xs text-muted-foreground">Bu ay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Müşteriler</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClients}</div>
            <p className="text-xs text-muted-foreground">Toplam kayıtlı</p>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Müşteriler</p>
                <p className="text-2xl font-bold">{detailedStats.totalCounts.clients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Şoförler</p>
                <p className="text-2xl font-bold">{detailedStats.totalCounts.drivers}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Araçlar</p>
                <p className="text-2xl font-bold">{detailedStats.totalCounts.vehicles}</p>
              </div>
              <Car className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Rezervasyonlar</p>
                <p className="text-2xl font-bold">{detailedStats.totalCounts.bookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bookings & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Calendar className="h-5 w-5" />
              Yaklaşan Rezervasyonlar (Sonraki 7 Gün)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      {getServiceIcon(booking.serviceType)}
                      <div>
                        <p className="font-medium text-sm md:text-base">{booking.client}</p>
                        <p className="text-xs text-gray-600">{booking.service}</p>
                        {booking.isAccommodation && booking.hotelName && (
                          <p className="text-xs text-blue-600">{booking.hotelName} • {booking.numNights} gece</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(booking.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right sm:text-left">
                      <p className="font-bold text-green-600 text-sm md:text-base">${booking.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{getDaysUntil(booking.startDate)}</p>
                      <p className="text-xs text-gray-400">{booking.startDate}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm md:text-base">Önümüzdeki 7 gün içinde yaklaşan rezervasyon bulunmamaktadır</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Clock className="h-5 w-5" />
              Son Rezervasyonlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      {getServiceIcon(booking.serviceType)}
                      <div>
                        <p className="font-medium text-sm md:text-base">{booking.client}</p>
                        <p className="text-xs text-gray-600">{booking.service}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(booking.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right sm:text-left">
                      <p className="font-bold text-green-600 text-sm md:text-base">${booking.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{booking.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm md:text-base">Yakın zamanda rezervasyon bulunmamaktadır</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accommodation Stats */}
      {accommodationStats.totalRevenue > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Hotel className="h-5 w-5" />
              Konaklama İstatistikleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-600">Toplam Gece</p>
                <p className="text-xl md:text-2xl font-bold text-blue-900">{accommodationStats.totalNights}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-600">Gelir</p>
                <p className="text-xl md:text-2xl font-bold text-green-900">${accommodationStats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-600">Kar</p>
                <p className="text-xl md:text-2xl font-bold text-purple-900">${accommodationStats.totalProfit.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-orange-600">Mülkler</p>
                <p className="text-xl md:text-2xl font-bold text-orange-900">{Object.keys(accommodationStats.accommodationBreakdown).length}</p>
              </div>
            </div>

            {Object.keys(accommodationStats.accommodationBreakdown).length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-base md:text-lg">En İyi Mülkler</h4>
                <div className="space-y-2">
                  {Object.entries(accommodationStats.accommodationBreakdown)
                    .sort(([,a], [,b]) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map(([name, stats]) => (
                      <div key={name} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 sm:mb-0">
                          {stats.type === 'Hotel' ? <Hotel className="h-4 w-4 text-blue-600" /> : <Home className="h-4 w-4 text-green-600" />}
                          <div>
                            <p className="font-medium text-sm md:text-base">{name}</p>
                            <p className="text-xs text-gray-600">{stats.bookings} rezervasyon • {stats.nights} gece</p>
                          </div>
                        </div>
                        <div className="text-right sm:text-left">
                          <p className="font-bold text-green-600 text-sm md:text-base">${stats.revenue.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">${stats.profit.toFixed(2)} kar</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Booking Status Breakdown */}
      {Object.keys(detailedStats.bookingStatusBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <CheckCircle className="h-5 w-5" />
              Rezervasyon Durum Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(detailedStats.bookingStatusBreakdown).map(([status, count]) => (
                <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    {getStatusIcon(status)}
                  </div>
                  <p className="text-sm font-medium text-gray-600 capitalize">{status}</p>
                  <p className="text-xl md:text-2xl font-bold">{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Type Breakdown */}
      {Object.keys(detailedStats.serviceTypeBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Building2 className="h-5 w-5" />
              Hizmet Türü Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(detailedStats.serviceTypeBreakdown).map(([serviceType, count]) => (
                <div key={serviceType} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    {getServiceIcon(serviceType)}
                  </div>
                  <p className="text-sm font-medium text-gray-600">{serviceType}</p>
                  <p className="text-xl md:text-2xl font-bold">{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

