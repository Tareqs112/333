import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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
  XCircle,
  User
} from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState({
    upcomingBookingsCount: 0,
    totalRevenue: 0,
    totalProfit: 0,
    activeClients: 0
  });

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [todaysBookings, setTodaysBookings] = useState([]);
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
    fetchTodaysBookings();
    fetchAccommodationStats();
    fetchDetailedStats();
  }, [selectedMonth, selectedYear]);

  const fetchDashboardSummary = async () => {
    try {
      const response = await fetch(`https://111-production-573e.up.railway.app/api/dashboard/summary?month=${selectedMonth}&year=${selectedYear}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
    }
  };

  const fetchUpcomingBookings = async () => {
    try {
      console.log('Fetching upcoming bookings...');
      const response = await fetch('https://111-production-573e.up.railway.app/api/dashboard/upcoming-bookings');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Received upcoming bookings:', data);
      setUpcomingBookings(data);
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
    }
  };

  const fetchTodaysBookings = async () => {
    try {
      console.log('Fetching today\'s bookings...');
      const response = await fetch('https://111-production-573e.up.railway.app/api/dashboard/todays-bookings');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Received today\'s bookings:', data);
      setTodaysBookings(data);
    } catch (error) {
      console.error('Error fetching today\'s bookings:', error);
    }
  };

  const fetchAccommodationStats = async () => {
    try {
      const response = await fetch('https://111-production-573e.up.railway.app/api/dashboard/accommodation-stats');
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
      const response = await fetch('https://111-production-573e.up.railway.app/api/dashboard/stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDetailedStats(data);
    } catch (error) {
      console.error('Error fetching detailed stats:', error);
    }
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return months[monthNumber - 1];
  };

  // Format date to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'Mevcut Değil';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kontrol Paneli</h1>
        <p className="text-gray-600">Turizm yönetim sisteminize hoş geldiniz</p>
      </div>

      {/* Month Selector */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label htmlFor="month-select" className="text-sm font-medium">Ay:</label>
          <Select 
            value={selectedMonth.toString()} 
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ay seçin" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <SelectItem key={month} value={month.toString()}>
                  {getMonthName(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="year-select" className="text-sm font-medium">Yıl:</label>
          <Select 
            value={selectedYear.toString()} 
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Yıl seçin" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yaklaşan Rezervasyonlar</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingBookingsCount}</div>
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
            <p className="text-xs text-muted-foreground">{getMonthName(selectedMonth)} {selectedYear}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kar</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalProfit ? stats.totalProfit.toLocaleString() : '0'}</div>
            <p className="text-xs text-muted-foreground">{getMonthName(selectedMonth)} {selectedYear}</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <p className="text-sm font-medium text-gray-600">Toplam Sürücüler</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings - Simplified to show only client name and arrival date */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Yaklaşan Rezervasyonlar (Sonraki 7 Gün)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {upcomingBookings && upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <div key={`upcoming-${booking.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{booking.client}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{formatDate(booking.startDate)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Sonraki 7 gün içinde yaklaşan rezervasyon yok</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Bugünün Rezervasyonları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {todaysBookings.length > 0 ? (
                todaysBookings.map((booking) => (
                  <div key={`today-${booking.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{booking.client}</p>
                        {booking.services && booking.services.map((service, idx) => (
                          <p key={idx} className="text-xs text-gray-500">{service.serviceName} ({service.serviceType})</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Bugün için rezervasyon yok</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

