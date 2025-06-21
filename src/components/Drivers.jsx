import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Car,
  Mail,
  Phone,
  IdCard,
  Link,
  Unlink,
  Calendar,
  Clock,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAssignVehicleForm, setShowAssignVehicleForm] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [assigningDriver, setAssigningDriver] = useState(null);
  const [selectedDriverForSchedule, setSelectedDriverForSchedule] = useState(null);
  const [driverSchedule, setDriverSchedule] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [newDriver, setNewDriver] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: ''
  });
  const [selectedVehicleIds, setSelectedVehicleIds] = useState([]);

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
  }, []);

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

  const filteredDrivers = drivers.filter(driver =>
    driver.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDriver = async () => {
    if (newDriver.firstName && newDriver.lastName && newDriver.email && newDriver.licenseNumber) {
      try {
        const response = await fetch('https://111-production-573e.up.railway.app/api/drivers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newDriver),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
        }
        setNewDriver({ firstName: '', lastName: '', email: '', phone: '', licenseNumber: '' });
        setShowAddForm(false);
        fetchDrivers(); // Refresh the list
      } catch (error) {
        console.error('Error adding driver:', error);
        alert('Sürücü eklenirken hata oluştu: ' + error.message);
      }
    }
  };

  const handleEditDriver = (driver) => {
    setEditingDriver({
      id: driver.id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber
    });
    setShowEditForm(true);
  };

  const handleUpdateDriver = async () => {
    if (editingDriver.firstName && editingDriver.lastName && editingDriver.email && editingDriver.licenseNumber) {
      try {
        const response = await fetch(`https://111-production-573e.up.railway.app/api/drivers/${editingDriver.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: editingDriver.firstName,
            lastName: editingDriver.lastName,
            email: editingDriver.email,
            phone: editingDriver.phone,
            licenseNumber: editingDriver.licenseNumber
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
        }
        setEditingDriver(null);
        setShowEditForm(false);
        fetchDrivers(); // Refresh the list
      } catch (error) {
        console.error('Error updating driver:', error);
        alert('Sürücü güncellenirken hata oluştu: ' + error.message);
      }
    }
  };

  const handleDeleteDriver = async (id) => {
    if (window.confirm('Bu sürücüyü silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`https://111-production-573e.up.railway.app/api/drivers/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
        }
        fetchDrivers(); // Refresh the list
      } catch (error) {
        console.error('Error deleting driver:', error);
        alert('Sürücü silinirken hata oluştu: ' + error.message);
      }
    }
  };

  const handleAssignVehicles = (driver) => {
    setAssigningDriver(driver);
    setSelectedVehicleIds(driver.assignedVehicles ? driver.assignedVehicles.map(v => v.id) : []);
    setShowAssignVehicleForm(true);
  };

  const handleUpdateVehicleAssignment = async () => {
    try {
      const response = await fetch(`https://111-production-573e.up.railway.app/api/drivers/${assigningDriver.id}/assign-vehicles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleIds: selectedVehicleIds
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
        }
      setAssigningDriver(null);
      setSelectedVehicleIds([]);
      setShowAssignVehicleForm(false);
      fetchDrivers(); // Refresh the list
    } catch (error) {
      console.error('Error updating vehicle assignment:', error);
      alert('Araç ataması güncellenirken hata oluştu: ' + error.message);
    }
  };

  const handleVehicleSelection = (vehicleId) => {
    setSelectedVehicleIds(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      } else {
        return [...prev, vehicleId];
      }
    });
  };

  const getAvailableVehicles = () => {
    return vehicles.filter(vehicle => 
      !vehicle.assignedDriverId || 
      vehicle.assignedDriverId === assigningDriver?.id ||
      selectedVehicleIds.includes(vehicle.id)
    );
  };

  const handleViewSchedule = async (driver) => {
    setSelectedDriverForSchedule(driver);
    setShowScheduleModal(true);
    
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    try {
      const response = await fetch(`https://111-production-573e.up.railway.app/api/drivers/${driver.id}/schedule?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`);
      if (response.ok) {
        const data = await response.json();
        setDriverSchedule(data.schedule || []);
      }
    } catch (error) {
      console.error('Error fetching driver schedule:', error);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
    
    if (showScheduleModal && selectedDriverForSchedule) {
      handleViewSchedule(selectedDriverForSchedule);
    }
  };

  const renderCalendar = () => {
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDay = startDate.getDay();
    const daysInMonth = endDate.getDate();
    
    const days = [];
    const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    
    dayNames.forEach(day => {
      days.push(
        <div key={day} className="p-2 text-center font-semibold text-gray-600 bg-gray-100">
          {day}
        </div>
      );
    });
    
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-gray-200"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      
      const dayBookings = driverSchedule.filter(booking => {
        const bookingStart = new Date(booking.start);
        const bookingEnd = new Date(booking.end);
        return currentDate >= bookingStart && currentDate <= bookingEnd;
      });
      
      days.push(
        <div key={day} className="p-1 border border-gray-200 min-h-[80px] bg-white">
          <div className="font-semibold text-sm mb-1">{day}</div>
          {dayBookings.map(booking => (
            <div
              key={booking.id}
              className="text-xs p-1 mb-1 rounded bg-blue-100 text-blue-800 truncate"
              title={`${booking.title} - ${booking.clientName}`}
            >
              {booking.clientName} - {booking.title}
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-7 gap-0 border border-gray-200">
        {days}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sürücüler</h1>
        <p className="text-gray-600">Sürücü veritabanınızı ve araç atamalarını yönetin</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Sürücü ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Sürücü Ekle
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Yeni Sürücü Ekle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="driverFirstName">Ad</Label>
                <Input
                  id="driverFirstName"
                  value={newDriver.firstName}
                  onChange={(e) => setNewDriver({...newDriver, firstName: e.target.value})}
                  placeholder="Adı girin"
                />
              </div>
              <div>
                <Label htmlFor="driverLastName">Soyad</Label>
                <Input
                  id="driverLastName"
                  value={newDriver.lastName}
                  onChange={(e) => setNewDriver({...newDriver, lastName: e.target.value})}
                  placeholder="Soyadı girin"
                />
              </div>
              <div>
                <Label htmlFor="driverEmail">E-posta</Label>
                <Input
                  id="driverEmail"
                  type="email"
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({...newDriver, email: e.target.value})}
                  placeholder="E-posta adresini girin"
                />
              </div>
              <div>
                <Label htmlFor="driverPhone">Telefon</Label>
                <Input
                  id="driverPhone"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
                  placeholder="Telefon numarasını girin"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="licenseNumber">Ehliyet Numarası</Label>
                <Input
                  id="licenseNumber"
                  value={newDriver.licenseNumber}
                  onChange={(e) => setNewDriver({...newDriver, licenseNumber: e.target.value})}
                  placeholder="Ehliyet numarasını girin"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddDriver}>Sürücü Ekle</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>İptal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showEditForm && editingDriver && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sürücüyü Düzenle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editDriverFirstName">Ad</Label>
                <Input
                  id="editDriverFirstName"
                  value={editingDriver.firstName}
                  onChange={(e) => setEditingDriver({...editingDriver, firstName: e.target.value})}
                  placeholder="Adı girin"
                />
              </div>
              <div>
                <Label htmlFor="editDriverLastName">Soyad</Label>
                <Input
                  id="editDriverLastName"
                  value={editingDriver.lastName}
                  onChange={(e) => setEditingDriver({...editingDriver, lastName: e.target.value})}
                  placeholder="Soyadı girin"
                />
              </div>
              <div>
                <Label htmlFor="editDriverEmail">E-posta</Label>
                <Input
                  id="editDriverEmail"
                  type="email"
                  value={editingDriver.email}
                  onChange={(e) => setEditingDriver({...editingDriver, email: e.target.value})}
                  placeholder="E-posta adresini girin"
                />
              </div>
              <div>
                <Label htmlFor="editDriverPhone">Telefon</Label>
                <Input
                  id="editDriverPhone"
                  value={editingDriver.phone}
                  onChange={(e) => setEditingDriver({...editingDriver, phone: e.target.value})}
                  placeholder="Telefon numarasını girin"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="editLicenseNumber">Ehliyet Numarası</Label>
                <Input
                  id="editLicenseNumber"
                  value={editingDriver.licenseNumber}
                  onChange={(e) => setEditingDriver({...editingDriver, licenseNumber: e.target.value})}
                  placeholder="Ehliyet numarasını girin"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEditForm(false)}>İptal</Button>
              <Button onClick={handleUpdateDriver}>Sürücüyü Güncelle</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showAssignVehicleForm && assigningDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {assigningDriver.firstName} {assigningDriver.lastName} için Araç Ata
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAssignVehicleForm(false)}>
                ×
              </Button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">Bu sürücüye atanacak araçları seçin:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {getAvailableVehicles().map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedVehicleIds.includes(vehicle.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleVehicleSelection(vehicle.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{vehicle.model}</h4>
                        <p className="text-sm text-gray-600">{vehicle.plateNumber}</p>
                        <p className="text-xs text-gray-500">{vehicle.type} - {vehicle.capacity} yolcu</p>
                      </div>
                      <div className={`w-4 h-4 rounded border-2 ${
                        selectedVehicleIds.includes(vehicle.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedVehicleIds.includes(vehicle.id) && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowAssignVehicleForm(false)}>
                İptal
              </Button>
              <Button onClick={handleUpdateVehicleAssignment}>
                Atamayı Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && selectedDriverForSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <User className="mr-2 h-5 w-5" />
                {selectedDriverForSchedule.firstName} {selectedDriverForSchedule.lastName} - Takvim
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowScheduleModal(false)}>
                ×
              </Button>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <Button variant="outline" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
                Önceki
              </Button>
              <h3 className="text-lg font-semibold">
                {currentMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
              </h3>
              <Button variant="outline" onClick={() => navigateMonth(1)}>
                Sonraki
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {renderCalendar()}
            
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3">Bu ayki rezervasyonlar:</h4>
              {driverSchedule.length === 0 ? (
                <p className="text-gray-500">Bu ay için rezervasyon bulunamadı.</p>
              ) : (
                <div className="space-y-2">
                  {driverSchedule.map(booking => (
                    <div key={booking.id} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold">{booking.title}</h5>
                          <p className="text-sm text-gray-600">Müşteri: {booking.clientName}</p>
                          <p className="text-sm text-gray-600">
                            {booking.start} - {booking.end}
                            {booking.startTime && ` (${booking.startTime} - ${booking.endTime || 'Bitiş saati ayarlanmadı'})`}
                          </p>
                          {booking.vehicleInfo && (
                            <p className="text-sm text-gray-600">Araç: {booking.vehicleInfo}</p>
                          )}
                          {booking.notes && (
                            <p className="text-sm text-gray-600">Notlar: {booking.notes}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.bookingStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.bookingStatus === 'confirmed' ? 'Onaylandı' : booking.bookingStatus === 'pending' ? 'Beklemede' : 'Tamamlandı'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowScheduleModal(false)}>
                Kapat
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

