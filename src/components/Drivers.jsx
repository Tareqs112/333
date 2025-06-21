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
      if (response.ok) {
        const data = await response.json();
        setDrivers(data);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch('https://111-production-573e.up.railway.app/api/vehicles');
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleAddDriver = async () => {
    try {
      const response = await fetch('https://111-production-573e.up.railway.app/api/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDriver),
      });
      
      if (response.ok) {
        await fetchDrivers();
        setNewDriver({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          licenseNumber: ''
        });
        setShowAddForm(false);
        alert('Driver added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to add driver: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding driver:', error);
      alert('Failed to add driver');
    }
  };

  const handleEditDriver = (driver) => {
    setEditingDriver(driver);
    setShowEditForm(true);
  };

  const handleUpdateDriver = async () => {
    try {
      const response = await fetch(`https://111-production-573e.up.railway.app/api/drivers/${editingDriver.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingDriver),
      });
      
      if (response.ok) {
        await fetchDrivers();
        setShowEditForm(false);
        setEditingDriver(null);
        alert('Driver updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to update driver: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating driver:', error);
      alert('Failed to update driver');
    }
  };

  const handleDeleteDriver = async (driverId) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        const response = await fetch(`https://111-production-573e.up.railway.app/api/drivers/${driverId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchDrivers();
          await fetchVehicles();
          alert('Driver deleted successfully!');
        } else {
          const errorData = await response.json();
          alert(`Failed to delete driver: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error deleting driver:', error);
        alert('Failed to delete driver');
      }
    }
  };

  const handleAssignVehicles = (driver) => {
    setAssigningDriver(driver);
    setSelectedVehicleIds(driver.assignedVehicles?.map(v => v.id) || []);
    setShowAssignVehicleForm(true);
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

  const handleSaveVehicleAssignment = async () => {
    try {
      const response = await fetch(`https://111-production-573e.up.railway.app/api/drivers/${assigningDriver.id}/assign-vehicles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vehicleIds: selectedVehicleIds }),
      });
      
      if (response.ok) {
        await fetchDrivers();
        await fetchVehicles();
        setShowAssignVehicleForm(false);
        setAssigningDriver(null);
        setSelectedVehicleIds([]);
        alert('Vehicle assignment updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to update vehicle assignment: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating vehicle assignment:', error);
      alert('Failed to update vehicle assignment');
    }
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
    
    // Get start and end dates for current month
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
    
    // Refresh schedule if modal is open
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
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Add day headers
    dayNames.forEach(day => {
      days.push(
        <div key={day} className="p-2 text-center font-semibold text-gray-600 bg-gray-100">
          {day}
        </div>
      );
    });
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-gray-200"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Find bookings for this day
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
              title={`${booking.title} - ${booking.clientName} ${booking.startTime ? `(${booking.startTime})` : ''}`}
            >
              {booking.startTime && <Clock className="inline w-3 h-3 mr-1" />}
              {booking.title}
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

  const filteredDrivers = drivers.filter(driver =>
    driver.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Drivers</h1>
            <p className="text-gray-600">Manage your drivers and their vehicle assignments</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Driver
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Drivers List */}
      <Card>
        <CardHeader>
          <CardTitle>All Drivers ({filteredDrivers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDrivers.map((driver) => (
              <div key={driver.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Car className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{driver.firstName} {driver.lastName}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <Mail className="mr-1 h-3 w-3" />
                          {driver.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="mr-1 h-3 w-3" />
                          {driver.phone || 'N/A'}
                        </span>
                        <span className="flex items-center">
                          <IdCard className="mr-1 h-3 w-3" />
                          {driver.licenseNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                        <span className="flex items-center">
                          <Car className="mr-1 h-3 w-3" />
                          {driver.assignedVehicles?.length || 0} vehicles assigned
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          Total: {driver.totalBookings || 0} bookings
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          Active: {driver.activeBookings || 0}
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                          Completed: {driver.completedBookings || 0}
                        </span>
                      </div>
                      {driver.assignedVehicles && driver.assignedVehicles.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 mb-1">Assigned Vehicles:</div>
                          <div className="flex flex-wrap gap-1">
                            {driver.assignedVehicles.map(vehicle => (
                              <span key={vehicle.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {vehicle.model} - {vehicle.plateNumber}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewSchedule(driver);
                    }}
                    title="View Schedule"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssignVehicles(driver);
                    }}
                    title="Assign Vehicles"
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditDriver(driver);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDriver(driver.id);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Driver Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Driver</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                ×
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newDriver.firstName}
                  onChange={(e) => setNewDriver({...newDriver, firstName: e.target.value})}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newDriver.lastName}
                  onChange={(e) => setNewDriver({...newDriver, lastName: e.target.value})}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({...newDriver, email: e.target.value})}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={newDriver.licenseNumber}
                  onChange={(e) => setNewDriver({...newDriver, licenseNumber: e.target.value})}
                  placeholder="Enter license number"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDriver}>
                Add Driver
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {showEditForm && editingDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Driver</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowEditForm(false)}>
                ×
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={editingDriver.firstName}
                  onChange={(e) => setEditingDriver({...editingDriver, firstName: e.target.value})}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={editingDriver.lastName}
                  onChange={(e) => setEditingDriver({...editingDriver, lastName: e.target.value})}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editingDriver.email}
                  onChange={(e) => setEditingDriver({...editingDriver, email: e.target.value})}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  value={editingDriver.phone || ''}
                  onChange={(e) => setEditingDriver({...editingDriver, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="editLicenseNumber">License Number</Label>
                <Input
                  id="editLicenseNumber"
                  value={editingDriver.licenseNumber}
                  onChange={(e) => setEditingDriver({...editingDriver, licenseNumber: e.target.value})}
                  placeholder="Enter license number"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowEditForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateDriver}>
                Update Driver
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Vehicles Modal */}
      {showAssignVehicleForm && assigningDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Assign Vehicles to {assigningDriver.firstName} {assigningDriver.lastName}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAssignVehicleForm(false)}>
                ×
              </Button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">Select vehicles to assign to this driver:</p>
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
                        <p className="text-xs text-gray-500">{vehicle.type} - {vehicle.capacity} passengers</p>
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
                Cancel
              </Button>
              <Button onClick={handleSaveVehicleAssignment}>
                Save Assignment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Schedule Modal */}
      {showScheduleModal && selectedDriverForSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <User className="mr-2 h-5 w-5" />
                {selectedDriverForSchedule.firstName} {selectedDriverForSchedule.lastName} - Schedule
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowScheduleModal(false)}>
                ×
              </Button>
            </div>
            
            {/* Month Navigation */}
            <div className="flex justify-between items-center mb-4">
              <Button variant="outline" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <h3 className="text-lg font-semibold">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <Button variant="outline" onClick={() => navigateMonth(1)}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Calendar */}
            {renderCalendar()}
            
            {/* Schedule List */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3">Bookings for this month:</h4>
              {driverSchedule.length === 0 ? (
                <p className="text-gray-500">No bookings found for this month.</p>
              ) : (
                <div className="space-y-2">
                  {driverSchedule.map(booking => (
                    <div key={booking.id} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold">{booking.title}</h5>
                          <p className="text-sm text-gray-600">Client: {booking.clientName}</p>
                          <p className="text-sm text-gray-600">
                            {booking.start} to {booking.end}
                            {booking.startTime && ` (${booking.startTime} - ${booking.endTime || 'End time not set'})`}
                          </p>
                          {booking.vehicleInfo && (
                            <p className="text-sm text-gray-600">Vehicle: {booking.vehicleInfo}</p>
                          )}
                          {booking.notes && (
                            <p className="text-sm text-gray-600">Notes: {booking.notes}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.bookingStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.bookingStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowScheduleModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

