import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Calculator,
  MapPin,
  Car,
  Building2,
  Users,
  Hotel,
  Home,
  X,
  Clock,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';

export function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add state for new client modal
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyId: '',
    licenseNumber: ''
  });
  
  const navigate = useNavigate();

  const [newBooking, setNewBooking] = useState({
    clientId: '',
    overall_startDate: '',
    overall_endDate: '',
    notes: '',
    services: []
  });

  const [editBookingData, setEditBookingData] = useState({
    clientId: '',
    overall_startDate: '',
    overall_endDate: '',
    notes: '',
    services: []
  });

  const [newService, setNewService] = useState({
    serviceType: '',
    serviceName: '',
    driverId: '',
    vehicleId: '',
    startDate: '',
    endDate: '',
    startTime: '', // New field for tour start time
    endTime: '',   // New field for tour end time
    costToCompany: '',
    sellingPrice: '',
    notes: '',
    hotelName: '',
    hotelCity: '', // Add city field for hotels
    roomType: '',
    numNights: '',
    costPerNight: '',
    sellingPricePerNight: '',
    is_hourly: false,
    hours: '',
    with_driver: null
  });

  useEffect(() => {
    fetchBookings();
    fetchClients();
    fetchDrivers();
    fetchVehicles();
    fetchCompanies();
    fetchServiceTypes();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('https://111-production-573e.up.railway.app/api/bookings');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('https://111-production-573e.up.railway.app/api/clients');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch('https://111-production-573e.up.railway.app/api/drivers');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch('https://111-production-573e.up.railway.app/api/vehicles');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch('https://111-production-573e.up.railway.app/api/companies');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchServiceTypes = async () => {
    try {
      const response = await fetch('https://111-production-573e.up.railway.app/api/bookings/service-types');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }
      const data = await response.json();
      setServiceTypes(data);
    } catch (error) {
      console.error('Error fetching service types:', error);
    }
  };

  // Function to add a new client
  const handleAddClient = async () => {
    // Validate required fields
    if (!newClient.firstName || !newClient.lastName) {
      alert('Lütfen gerekli alanları doldurun (Ad ve Soyad)');
      return;
    }

    try {
      const response = await fetch('https://111-production-573e.up.railway.app/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClient),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Müşteri eklenemedi');
      }

      const data = await response.json();
      
      // Update clients list
      fetchClients();
      
      // Close modal
      setShowAddClientModal(false);
      
      // Reset new client form
      setNewClient({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyId: '',
        PassportNumber:'',
        licenseNumber: ''
      });
      
      // Update selected client in booking form
      setNewBooking(prev => ({
        ...prev,
        clientId: data.id.toString()
      }));

      // Show success message
      alert(`Müşteri ${data.firstName} ${data.lastName} başarıyla eklendi!`);
      
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Müşteri ekleme hatası: ' + error.message);
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.services.some(service => 
      service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.hotelName && service.hotelName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (service.hotelCity && service.hotelCity.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const isAccommodationService = (serviceType) => {
    return ['Hotel', 'Cabin'].includes(serviceType);
  };

  const isTourService = (serviceType) => {
    return serviceType === 'Tour';
  };

  const isVehicleService = (serviceType) => {
    return serviceType === 'Vehicle';
  };

  const handleServiceTypeChange = (serviceType) => {
    const updatedService = {
      ...newService,
      serviceType: serviceType,
      // Reset fields based on service type
      startTime: '',
      endTime: '',
      is_hourly: false,
      hours: '',
      with_driver: null
    };

    if (!isAccommodationService(serviceType)) {
      updatedService.hotelName = '';
      updatedService.hotelCity = '';
      updatedService.roomType = '';
      updatedService.numNights = '';
      updatedService.costPerNight = '';
      updatedService.sellingPricePerNight = '';
    } else {
      updatedService.costToCompany = '';
      updatedService.sellingPrice = '';
    }

    setNewService(updatedService);
  };

  const calculateAccommodationTotals = (numNights, costPerNight, sellingPricePerNight) => {
    const nights = parseInt(numNights) || 0;
    const cost = parseFloat(costPerNight) || 0;
    const selling = parseFloat(sellingPricePerNight) || 0;
    
    return {
      totalCost: nights * cost,
      totalSelling: nights * selling,
      profit: nights * (selling - cost)
    };
  };

  const calculateVehicleHourlyTotals = (hours, costPerHour, sellingPricePerHour) => {
    const hrs = parseFloat(hours) || 0;
    const cost = parseFloat(costPerHour) || 0;
    const selling = parseFloat(sellingPricePerHour) || 0;
    
    return {
      totalCost: hrs * cost,
      totalSelling: hrs * selling,
      profit: hrs * (selling - cost)
    };
  };

  const addServiceToBooking = () => {
    const isAccommodation = isAccommodationService(newService.serviceType);
    const isTour = isTourService(newService.serviceType);
    const isVehicle = isVehicleService(newService.serviceType);
    
    if (!newService.serviceType || !newService.serviceName || !newService.startDate || !newService.endDate) {
      alert('Lütfen tüm gerekli hizmet alanlarını doldurun.');
      return;
    }

    if (isAccommodation) {
      if (!newService.hotelName || !newService.hotelCity || !newService.roomType || !newService.numNights || 
          !newService.costPerNight || !newService.sellingPricePerNight) {
        alert('Lütfen şehir adı dahil tüm konaklama detaylarını doldurun.');
        return;
      }
    } else {
      if (!newService.costToCompany || !newService.sellingPrice) {
        alert('Lütfen maliyet ve satış fiyatını doldurun.');
        return;
      }
    }

    const serviceToAdd = { ...newService };
    setNewBooking(prev => ({
      ...prev,
      services: [...prev.services, serviceToAdd]
    }));

    // Reset service form
    setNewService({
      serviceType: '',
      serviceName: '',
      driverId: '',
      vehicleId: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      costToCompany: '',
      sellingPrice: '',
      notes: '',
      hotelName: '',
      hotelCity: '',
      roomType: '',
      numNights: '',
      costPerNight: '',
      sellingPricePerNight: '',
      is_hourly: false,
      hours: '',
      with_driver: null
    });
  };

  const removeServiceFromBooking = (index) => {
    setNewBooking(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleAddBooking = async () => {
    if (!newBooking.clientId || !newBooking.overall_startDate || !newBooking.overall_endDate) {
      alert('Lütfen tüm gerekli rezervasyon alanlarını doldurun.');
      return;
    }

    if (newBooking.services.length === 0) {
      alert('Lütfen rezervasyona en az bir hizmet ekleyin.');
      return;
    }

    try {
      const response = await fetch('https://111-production-573e.up.railway.app/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBooking),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
      }

      setNewBooking({
        clientId: '',
        overall_startDate: '',
        overall_endDate: '',
        notes: '',
        services: []
      });
      setShowAddForm(false);
      fetchBookings();
    } catch (error) {
      console.error('Error adding booking:', error);
      alert('Rezervasyon ekleme hatası: ' + error.message);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (window.confirm('Bu rezervasyonu silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`https://111-production-573e.up.railway.app/api/bookings/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
        }
        fetchBookings();
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Rezervasyon silme hatası: ' + error.message);
      }
    }
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setEditBookingData({
      clientId: booking.clientId,
      overall_startDate: booking.overall_startDate,
      overall_endDate: booking.overall_endDate,
      notes: booking.notes || '',
      services: booking.services.map(service => ({
        serviceType: service.serviceType,
        serviceName: service.serviceName,
        driverId: service.driverId || '',
        vehicleId: service.vehicleId || '',
        startDate: service.startDate,
        endDate: service.endDate,
        startTime: service.startTime || '',
        endTime: service.endTime || '',
        costToCompany: service.costToCompany ? service.costToCompany.toString() : '',
        sellingPrice: service.sellingPrice ? service.sellingPrice.toString() : '',
        notes: service.notes || '',
        hotelName: service.hotelName || '',
        hotelCity: '',
        roomType: service.roomType || '',
        numNights: service.numNights ? service.numNights.toString() : '',
        costPerNight: service.costPerNight ? service.costPerNight.toString() : '',
        sellingPricePerNight: service.sellingPricePerNight ? service.sellingPricePerNight.toString() : '',
        is_hourly: service.is_hourly || false,
        hours: service.hours ? service.hours.toString() : '',
        with_driver: service.with_driver
      }))
    });
    setShowEditForm(true);
  };

  const handleUpdateBooking = async () => {
    if (!editBookingData.clientId || !editBookingData.overall_startDate || !editBookingData.overall_endDate) {
      alert('Lütfen tüm gerekli rezervasyon alanlarını doldurun.');
      return;
    }

    if (editBookingData.services.length === 0) {
      alert('Lütfen rezervasyona en az bir hizmet ekleyin.');
      return;
    }

    try {
      const response = await fetch(`https://111-production-573e.up.railway.app/api/bookings/${editingBooking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editBookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
      }

      setEditingBooking(null);
      setEditBookingData({
        clientId: '',
        overall_startDate: '',
        overall_endDate: '',
        notes: '',
        services: []
      });
      setShowEditForm(false);
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Rezervasyon güncelleme hatası: ' + error.message);
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

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'Hotel': return <Hotel className="h-4 w-4 text-blue-600" />;
      case 'Cabin': return <Home className="h-4 w-4 text-green-600" />;
      case 'Vehicle': return <Car className="h-4 w-4 text-purple-600" />;
      case 'Tour': return <Calendar className="h-4 w-4 text-red-600" />;
      default: return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const renderServiceForm = () => {
    const isAccommodation = isAccommodationService(newService.serviceType);
    const isTour = isTourService(newService.serviceType);
    const isVehicle = isVehicleService(newService.serviceType);

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Hizmet Ekle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <Label htmlFor="serviceType">Hizmet Türü *</Label>
              <select
                id="serviceType"
                value={newService.serviceType}
                onChange={(e) => handleServiceTypeChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Hizmet türü seçin</option>
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <Label htmlFor="serviceName">Hizmet Adı *</Label>
              <Input
                id="serviceName"
                value={newService.serviceName}
                onChange={(e) => setNewService(prev => ({ ...prev, serviceName: e.target.value }))}
                placeholder="Hizmet adını girin"
                className="w-full"
              />
            </div>

            <div className="col-span-1">
              <Label htmlFor="startDate">Başlangıç Tarihi *</Label>
              <Input
                id="startDate"
                type="date"
                value={newService.startDate}
                onChange={(e) => setNewService(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full"
              />
            </div>

            <div className="col-span-1">
              <Label htmlFor="endDate">Bitiş Tarihi *</Label>
              <Input
                id="endDate"
                type="date"
                value={newService.endDate}
                onChange={(e) => setNewService(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full"
              />
            </div>

            {isTour && (
              <>
                <div className="col-span-1">
                  <Label htmlFor="startTime">Başlangıç Saati</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newService.startTime}
                    onChange={(e) => setNewService(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full"
                  />
                </div>

                <div className="col-span-1">
                  <Label htmlFor="endTime">Bitiş Saati</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newService.endTime}
                    onChange={(e) => setNewService(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </>
            )}

            {isVehicle && (
              <>
                <div className="col-span-1">
                  <Label htmlFor="driverId">Şoför</Label>
                  <select
                    id="driverId"
                    value={newService.driverId}
                    onChange={(e) => setNewService(prev => ({ ...prev, driverId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Şoför seçin</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.firstName} {driver.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1">
                  <Label htmlFor="vehicleId">Araç</Label>
                  <select
                    id="vehicleId"
                    value={newService.vehicleId}
                    onChange={(e) => setNewService(prev => ({ ...prev, vehicleId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Araç seçin</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_hourly"
                      checked={newService.is_hourly}
                      onChange={(e) => setNewService(prev => ({ ...prev, is_hourly: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="is_hourly">Saatlik Ücretlendirme</Label>
                  </div>
                </div>

                {newService.is_hourly && (
                  <div className="col-span-1">
                    <Label htmlFor="hours">Saat Sayısı</Label>
                    <Input
                      id="hours"
                      type="number"
                      step="0.5"
                      value={newService.hours}
                      onChange={(e) => setNewService(prev => ({ ...prev, hours: e.target.value }))}
                      placeholder="Saat sayısı"
                      className="w-full"
                    />
                  </div>
                )}

                <div className="col-span-1">
                  <Label htmlFor="with_driver">Şoförlü mü?</Label>
                  <select
                    id="with_driver"
                    value={newService.with_driver === null ? '' : newService.with_driver.toString()}
                    onChange={(e) => setNewService(prev => ({
                      ...prev,
                      with_driver: e.target.value === '' ? null : e.target.value === 'true'
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seçin</option>
                    <option value="true">Evet</option>
                    <option value="false">Hayır</option>
                  </select>
                </div>
              </>
            )}

            {isAccommodation && (
              <>
                <div className="col-span-1">
                  <Label htmlFor="hotelName">Otel/Konaklama Adı *</Label>
                  <Input
                    id="hotelName"
                    value={newService.hotelName}
                    onChange={(e) => setNewService(prev => ({ ...prev, hotelName: e.target.value }))}
                    placeholder="Otel adı"
                    className="w-full"
                  />
                </div>

                <div className="col-span-1">
                  <Label htmlFor="hotelCity">Şehir *</Label>
                  <Input
                    id="hotelCity"
                    value={newService.hotelCity}
                    onChange={(e) => setNewService(prev => ({ ...prev, hotelCity: e.target.value }))}
                    placeholder="Şehir adı"
                    className="w-full"
                  />
                </div>

                <div className="col-span-1">
                  <Label htmlFor="roomType">Oda Tipi *</Label>
                  <Input
                    id="roomType"
                    value={newService.roomType}
                    onChange={(e) => setNewService(prev => ({ ...prev, roomType: e.target.value }))}
                    placeholder="Oda tipi"
                    className="w-full"
                  />
                </div>

                <div className="col-span-1">
                  <Label htmlFor="numNights">Gece Sayısı *</Label>
                  <Input
                    id="numNights"
                    type="number"
                    value={newService.numNights}
                    onChange={(e) => setNewService(prev => ({ ...prev, numNights: e.target.value }))}
                    placeholder="Gece sayısı"
                    className="w-full"
                  />
                </div>

                <div className="col-span-1">
                  <Label htmlFor="costPerNight">Gecelik Maliyet *</Label>
                  <Input
                    id="costPerNight"
                    type="number"
                    step="0.01"
                    value={newService.costPerNight}
                    onChange={(e) => setNewService(prev => ({ ...prev, costPerNight: e.target.value }))}
                    placeholder="Gecelik maliyet"
                    className="w-full"
                  />
                </div>

                <div className="col-span-1">
                  <Label htmlFor="sellingPricePerNight">Gecelik Satış Fiyatı *</Label>
                  <Input
                    id="sellingPricePerNight"
                    type="number"
                    step="0.01"
                    value={newService.sellingPricePerNight}
                    onChange={(e) => setNewService(prev => ({ ...prev, sellingPricePerNight: e.target.value }))}
                    placeholder="Gecelik satış fiyatı"
                    className="w-full"
                  />
                </div>

                {newService.numNights && newService.costPerNight && newService.sellingPricePerNight && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Toplam Hesaplama</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Toplam Maliyet:</span>
                          <div className="font-semibold">
                            ₺{calculateAccommodationTotals(newService.numNights, newService.costPerNight, newService.sellingPricePerNight).totalCost.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Toplam Satış:</span>
                          <div className="font-semibold">
                            ₺{calculateAccommodationTotals(newService.numNights, newService.costPerNight, newService.sellingPricePerNight).totalSelling.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Kar:</span>
                          <div className="font-semibold text-green-600">
                            ₺{calculateAccommodationTotals(newService.numNights, newService.costPerNight, newService.sellingPricePerNight).profit.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {!isAccommodation && (
              <>
                <div className="col-span-1">
                  <Label htmlFor="costToCompany">Şirkete Maliyet *</Label>
                  <Input
                    id="costToCompany"
                    type="number"
                    step="0.01"
                    value={newService.costToCompany}
                    onChange={(e) => setNewService(prev => ({ ...prev, costToCompany: e.target.value }))}
                    placeholder="Maliyet"
                    className="w-full"
                  />
                </div>

                <div className="col-span-1">
                  <Label htmlFor="sellingPrice">Satış Fiyatı *</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    value={newService.sellingPrice}
                    onChange={(e) => setNewService(prev => ({ ...prev, sellingPrice: e.target.value }))}
                    placeholder="Satış fiyatı"
                    className="w-full"
                  />
                </div>
              </>
            )}

            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <Label htmlFor="serviceNotes">Notlar</Label>
              <textarea
                id="serviceNotes"
                value={newService.notes}
                onChange={(e) => setNewService(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Hizmet notları"
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button onClick={addServiceToBooking} className="flex-1 sm:flex-none">
              <Plus className="h-4 w-4 mr-2" />
              Hizmeti Ekle
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Rezervasyonlar</h1>
        <Button onClick={() => setShowAddForm(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Yeni Rezervasyon
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Rezervasyon ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{booking.client}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(booking.overall_startDate).toLocaleDateString('tr-TR')} - {new Date(booking.overall_endDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div className="flex gap-2 ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditBooking(booking)}
                    className="p-2"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {booking.services.map((service, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getServiceIcon(service.serviceType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{service.serviceName}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {service.serviceType}
                        {service.hotelCity && ` - ${service.hotelCity}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(service.startDate).toLocaleDateString('tr-TR')} - {new Date(service.endDate).toLocaleDateString('tr-TR')}
                      </div>
                      {service.startTime && service.endTime && (
                        <div className="text-xs text-gray-500">
                          {service.startTime} - {service.endTime}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {booking.notes && (
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <strong>Notlar:</strong> {booking.notes}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Rezervasyon bulunamadı</h3>
          <p className="text-gray-500">Yeni bir rezervasyon eklemek için yukarıdaki butonu kullanın.</p>
        </div>
      )}

      {/* Add Booking Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Rezervasyon Ekle</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Client Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Müşteri Bilgileri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientId">Müşteri *</Label>
                    <div className="flex gap-2">
                      <select
                        id="clientId"
                        value={newBooking.clientId}
                        onChange={(e) => setNewBooking(prev => ({ ...prev, clientId: e.target.value }))}
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Müşteri seçin</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.firstName} {client.lastName}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddClientModal(true)}
                        className="px-3"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="overall_startDate">Genel Başlangıç Tarihi *</Label>
                    <Input
                      id="overall_startDate"
                      type="date"
                      value={newBooking.overall_startDate}
                      onChange={(e) => setNewBooking(prev => ({ ...prev, overall_startDate: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="overall_endDate">Genel Bitiş Tarihi *</Label>
                    <Input
                      id="overall_endDate"
                      type="date"
                      value={newBooking.overall_endDate}
                      onChange={(e) => setNewBooking(prev => ({ ...prev, overall_endDate: e.target.value }))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="bookingNotes">Rezervasyon Notları</Label>
                    <textarea
                      id="bookingNotes"
                      value={newBooking.notes}
                      onChange={(e) => setNewBooking(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Rezervasyon notları"
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Form */}
            {renderServiceForm()}

            {/* Added Services */}
            {newBooking.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Eklenen Hizmetler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {newBooking.services.map((service, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 mt-1">
                          {getServiceIcon(service.serviceType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{service.serviceName}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {service.serviceType}
                            {service.hotelCity && ` - ${service.hotelCity}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(service.startDate).toLocaleDateString('tr-TR')} - {new Date(service.endDate).toLocaleDateString('tr-TR')}
                          </div>
                          {service.startTime && service.endTime && (
                            <div className="text-sm text-gray-500">
                              {service.startTime} - {service.endTime}
                            </div>
                          )}
                          {service.notes && (
                            <div className="text-sm text-gray-600 mt-2">
                              <strong>Notlar:</strong> {service.notes}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeServiceFromBooking(index)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowAddForm(false)} className="w-full sm:w-auto">
              İptal
            </Button>
            <Button onClick={handleAddBooking} className="w-full sm:w-auto">
              Rezervasyon Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Client Modal */}
      <Dialog open={showAddClientModal} onOpenChange={setShowAddClientModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
            <DialogDescription>
              Yeni bir müşteri ekleyin ve otomatik olarak rezervasyonda seçin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Ad *</Label>
                <Input
                  id="firstName"
                  value={newClient.firstName}
                  onChange={(e) => setNewClient(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Ad"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Soyad *</Label>
                <Input
                  id="lastName"
                  value={newClient.lastName}
                  onChange={(e) => setNewClient(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Soyad"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                placeholder="E-posta adresi"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={newClient.phone}
                onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Telefon numarası"
              />
            </div>

            <div>
              <Label htmlFor="companyId">Şirket</Label>
              <select
                id="companyId"
                value={newClient.companyId}
                onChange={(e) => setNewClient(prev => ({ ...prev, companyId: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Şirket seçin</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

             <div>
              <Label htmlFor="PassportNumber">passport Numarası</Label>
              <Input
                id="PassportNumber"
                value={newClient.PassportNumber}
                onChange={(e) => setNewClient(prev => ({ ...prev, PassportNumber: e.target.value }))}
                placeholder="passport Numarası"
              />
            </div>

            <div>
              <Label htmlFor="licenseNumber">Ehliyet Numarası</Label>
              <Input
                id="licenseNumber"
                value={newClient.licenseNumber}
                onChange={(e) => setNewClient(prev => ({ ...prev, licenseNumber: e.target.value }))}
                placeholder="Ehliyet numarası"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowAddClientModal(false)} className="w-full sm:w-auto">
              İptal
            </Button>
            <Button onClick={handleAddClient} className="w-full sm:w-auto">
              Müşteri Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rezervasyonu Düzenle</DialogTitle>
          </DialogHeader>
          {editingBooking && (
            <div className="space-y-6">
              {/* Client Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Müşteri Bilgileri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editClientId">Müşteri *</Label>
                      <select
                        id="editClientId"
                        value={editBookingData.clientId}
                        onChange={(e) => setEditBookingData(prev => ({ ...prev, clientId: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Müşteri seçin</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.firstName} {client.lastName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="editOverall_startDate">Genel Başlangıç Tarihi *</Label>
                      <Input
                        id="editOverall_startDate"
                        type="date"
                        value={editBookingData.overall_startDate}
                        onChange={(e) => setEditBookingData(prev => ({ ...prev, overall_startDate: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="editOverall_endDate">Genel Bitiş Tarihi *</Label>
                      <Input
                        id="editOverall_endDate"
                        type="date"
                        value={editBookingData.overall_endDate}
                        onChange={(e) => setEditBookingData(prev => ({ ...prev, overall_endDate: e.target.value }))}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="editBookingNotes">Rezervasyon Notları</Label>
                      <textarea
                        id="editBookingNotes"
                        value={editBookingData.notes}
                        onChange={(e) => setEditBookingData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Rezervasyon notları"
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Edit Services */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Hizmetleri Düzenle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {editBookingData.services.map((service, serviceIndex) => (
                      <div key={serviceIndex} className="p-4 border rounded-lg space-y-4 relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditBookingData(prev => ({
                              ...prev,
                              services: prev.services.filter((_, i) => i !== serviceIndex)
                            }));
                          }}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="col-span-1 md:col-span-2 lg:col-span-1">
                            <Label htmlFor={`editServiceType-${serviceIndex}`}>Hizmet Türü *</Label>
                            <select
                              id={`editServiceType-${serviceIndex}`}
                              value={service.serviceType}
                              onChange={(e) => {
                                const updatedServices = [...editBookingData.services];
                                updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], serviceType: e.target.value };
                                setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                              }}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Hizmet türü seçin</option>
                              {serviceTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-1">
                            <Label htmlFor={`editServiceName-${serviceIndex}`}>Hizmet Adı *</Label>
                            <Input
                              id={`editServiceName-${serviceIndex}`}
                              value={service.serviceName}
                              onChange={(e) => {
                                const updatedServices = [...editBookingData.services];
                                updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], serviceName: e.target.value };
                                setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                              }}
                              placeholder="Hizmet adını girin"
                              className="w-full"
                            />
                          </div>

                          <div className="col-span-1">
                            <Label htmlFor={`editStartDate-${serviceIndex}`}>Başlangıç Tarihi *</Label>
                            <Input
                              id={`editStartDate-${serviceIndex}`}
                              type="date"
                              value={service.startDate}
                              onChange={(e) => {
                                const updatedServices = [...editBookingData.services];
                                updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], startDate: e.target.value };
                                setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                              }}
                              className="w-full"
                            />
                          </div>

                          <div className="col-span-1">
                            <Label htmlFor={`editEndDate-${serviceIndex}`}>Bitiş Tarihi *</Label>
                            <Input
                              id={`editEndDate-${serviceIndex}`}
                              type="date"
                              value={service.endDate}
                              onChange={(e) => {
                                const updatedServices = [...editBookingData.services];
                                updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], endDate: e.target.value };
                                setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                              }}
                              className="w-full"
                            />
                          </div>

                          {isTourService(service.serviceType) && (
                            <>
                              <div className="col-span-1">
                                <Label htmlFor={`editStartTime-${serviceIndex}`}>Başlangıç Saati</Label>
                                <Input
                                  id={`editStartTime-${serviceIndex}`}
                                  type="time"
                                  value={service.startTime}
                                  onChange={(e) => {
                                    const updatedServices = [...editBookingData.services];
                                    updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], startTime: e.target.value };
                                    setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                                  }}
                                  className="w-full"
                                />
                              </div>

                              <div className="col-span-1">
                                <Label htmlFor={`editEndTime-${serviceIndex}`}>Bitiş Saati</Label>
                                <Input
                                  id={`editEndTime-${serviceIndex}`}
                                  type="time"
                                  value={service.endTime}
                                  onChange={(e) => {
                                    const updatedServices = [...editBookingData.services];
                                    updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], endTime: e.target.value };
                                    setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                                  }}
                                  className="w-full"
                                />
                              </div>
                            </>
                          )}

                          {isVehicleService(service.serviceType) && (
                            <>
                              <div className="col-span-1">
                                <Label htmlFor={`editDriverId-${serviceIndex}`}>Şoför</Label>
                                <select
                                  id={`editDriverId-${serviceIndex}`}
                                  value={service.driverId}
                                  onChange={(e) => {
                                    const updatedServices = [...editBookingData.services];
                                    updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], driverId: e.target.value };
                                    setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="">Şoför seçin</option>
                                  {drivers.map((driver) => (
                                    <option key={driver.id} value={driver.id}>
                                      {driver.firstName} {driver.lastName}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="col-span-1">
                                <Label htmlFor={`editVehicleId-${serviceIndex}`}>Araç</Label>
                                <select
                                  id={`editVehicleId-${serviceIndex}`}
                                  value={service.vehicleId}
                                  onChange={(e) => {
                                    const updatedServices = [...editBookingData.services];
                                    updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], vehicleId: e.target.value };
                                    setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="">Araç seçin</option>
                                  {vehicles.map((vehicle) => (
                                    <option key={vehicle.id} value={vehicle.id}>
                                      {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="col-span-1">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`editIsHourly-${serviceIndex}`}
                                    checked={service.is_hourly}
                                    onChange={(e) => {
                                      const updatedServices = [...editBookingData.services];
                                      updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], is_hourly: e.target.checked };
                                      setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                                    }}
                                    className="rounded"
                                  />
                                  <Label htmlFor={`editIsHourly-${serviceIndex}`}>Saatlik Ücretlendirme</Label>
                                </div>
                              </div>

                              {service.is_hourly && (
                                <div className="col-span-1">
                                  <Label htmlFor={`editHours-${serviceIndex}`}>Saat Sayısı</Label>
                                  <Input
                                    id={`editHours-${serviceIndex}`}
                                    type="number"
                                    step="0.5"
                                    value={service.hours}
                                    onChange={(e) => {
                                      const updatedServices = [...editBookingData.services];
                                      updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], hours: e.target.value };
                                      setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                                    }}
                                    placeholder="Saat sayısı"
                                    className="w-full"
                                  />
                                </div>
                              )}

                              <div className="col-span-1">
                                <Label htmlFor={`editWithDriver-${serviceIndex}`}>Şoförlü mü?</Label>
                                <select
                                  id={`editWithDriver-${serviceIndex}`}
                                  value={service.with_driver === null ? '' : service.with_driver.toString()}
                                  onChange={(e) => {
                                    const updatedServices = [...editBookingData.services];
                                    updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], with_driver: e.target.value === '' ? null : e.target.value === 'true' };
                                    setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="">Seçin</option>
                                  <option value="true">Evet</option>
                                  <option value="false">Hayır</option>
                                </select>
                              </div>
                            </>
                          )}

                          {isAccommodationService(service.serviceType) && (
                            <>
                              <div className="col-span-1">
                                <Label htmlFor={`editHotelName-${serviceIndex}`}>Otel/Konaklama Adı *</Label>
                                <Input
                                  id={`editHotelName-${serviceIndex}`}
                                  value={service.hotelName}
                                  onChange={(e) => {
                                    const updatedServices = [...editBookingData.services];
                                    updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], hotelName: e.target.value };
                                    setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                                  }}
                                  placeholder="Otel adı"
                                  className="w-full"
                                />
                              </div>

                              <div className="col-span-1">
                                <Label htmlFor={`editHotelCity-${serviceIndex}`}>Şehir *</Label>
                                <Input
                                  id={`editHotelCity-${serviceIndex}`}
                                  value={service.hotelCity}
                                  onChange={(e) => {
                                    const updatedServices = [...editBookingData.services];
                                    updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], hotelCity: e.target.value };
                                    setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                                  }}
                                  placeholder="Şehir adı"
                                  className="w-full"
                                />
                              </div>

                              <div className="col-span-1">
                                <Label htmlFor={`editRoomType-${serviceIndex}`}>Oda Tipi *</Label>
                                <Input
                                  id={`editRoomType-${serviceIndex}`}
                                  value={service.roomType}
                                  onChange={(e) => {
                                    const updatedServices = [...editBookingData.services];
                                    updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], roomType: e.target.value };
                                    setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                                  }}
                                  placeholder="Oda tipi"
                                  className="w-full"
                                />
                              </div>

                              <div className="col-span-1">
                                <Label htmlFor={`editNumNights-${serviceIndex}`}>Gece Sayısı *</Label>
                                <Input
                                  id={`editNumNights-${serviceIndex}`}
                                  type="number"
                                  value={service.numNights}
                                  onChange={(e) => {
                                    const updatedServices = [...editBookingData.services];
                                    updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], numNights: e.target.value };
                                    setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                                  }}
                                  placeholder="Gece sayısı"
                                  className="w-full"
                                />
                              </div>

                              <div className="col-span-1">
                                <Label htmlFor={`editCostPerNight-${serviceIndex}`}>Gecelik Maliyet *</Label>
                                <Input
                                  id={`editCostPerNight-${serviceIndex}`}
                                  type="number"
                                  step="0.01"
                                  value={service.costPerNight}
                                  onChange={(e) => {
                                    const updatedServices = [...editBookingData.services];
                                    updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], costPerNight: e.target.value };
                                    setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                                  }}
                                  placeholder="Gecelik maliyet"
                                  className="w-full"
                                />
                              </div>

                              <div className="col-span-1">
                                <Label htmlFor={`editSellingPricePerNight-${serviceIndex}`}>Gecelik Satış Fiyatı *</Label>
                                <Input
                                  id={`editSellingPricePerNight-${serviceIndex}`}
                                  type="number"
                                  step="0.01"
                                  value={service.sellingPricePerNight}
                                  onChange={(e) => {
                                    const updatedServices = [...editBookingData.services];
                                    updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], sellingPricePerNight: e.target.value };
                                    setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                                  }}
                                  placeholder="Gecelik satış fiyatı"
                                  className="w-full"
                                />
                              </div>

                              {service.numNights && service.costPerNight && service.sellingPricePerNight && (
                                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2">Toplam Hesaplama</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-600">Toplam Maliyet:</span>
                                        <div className="font-semibold">
                                          ₺{calculateAccommodationTotals(service.numNights, service.costPerNight, service.sellingPricePerNight).totalCost.toFixed(2)}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Toplam Satış:</span>
                                        <div className="font-semibold">
                                          ₺{calculateAccommodationTotals(service.numNights, service.costPerNight, service.sellingPricePerNight).totalSelling.toFixed(2)}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Kar:</span>
                                        <div className="font-semibold text-green-600">
                                          ₺{calculateAccommodationTotals(service.numNights, service.costPerNight, service.sellingPricePerNight).profit.toFixed(2)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {!isAccommodationService(service.serviceType) && (
                            <>
                              <div className="col-span-1">
                                <Label htmlFor={`editCostToCompany-${serviceIndex}`}>Şirkete Maliyet *</Label>
                                <Input
                                  id={`editCostToCompany-${serviceIndex}`}
                                  type="number"
                                  step="0.01"
                                  value={service.costToCompany}
                                  onChange={(e) => {
                                    const updatedServices = [...editBookingData.services];
                                    updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], costToCompany: e.target.value };
                                    setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                                  }}
                                  placeholder="Maliyet"
                                  className="w-full"
                                />
                              </div>

                              <div className="col-span-1">
                                <Label htmlFor={`editSellingPrice-${serviceIndex}`}>Satış Fiyatı *</Label>
                                <Input
                                  id={`editSellingPrice-${serviceIndex}`}
                                  type="number"
                                  step="0.01"
                                  value={service.sellingPrice}
                                  onChange={(e) => {
                                    const updatedServices = [...editBookingData.services];
                                    updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], sellingPrice: e.target.value };
                                    setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                                  }}
                                  placeholder="Satış fiyatı"
                                  className="w-full"
                                />
                              </div>
                            </>
                          )}

                          <div className="col-span-1 md:col-span-2 lg:col-span-3">
                            <Label htmlFor={`editServiceNotes-${serviceIndex}`}>Notlar</Label>
                            <textarea
                              id={`editServiceNotes-${serviceIndex}`}
                              value={service.notes}
                              onChange={(e) => {
                                const updatedServices = [...editBookingData.services];
                                updatedServices[serviceIndex] = { ...updatedServices[serviceIndex], notes: e.target.value };
                                setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                              }}
                              placeholder="Hizmet notları"
                              rows={3}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setShowEditForm(false)} className="w-full sm:w-auto">
                  İptal
                </Button>
                <Button onClick={handleUpdateBooking} className="w-full sm:w-auto">
                  Rezervasyonu Güncelle
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


