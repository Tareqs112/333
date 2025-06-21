import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Car,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedVehicleForSchedule, setSelectedVehicleForSchedule] = useState(null);
  const [vehicleSchedule, setVehicleSchedule] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [newVehicle, setNewVehicle] = useState({
    model: '',
    plateNumber: '',
    type: '',
    capacity: '',
    assignedDriverId: 'unassigned'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
    fetchAvailableDrivers();
  }, []);

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

  const fetchAvailableDrivers = async () => {
    try {
      const response = await fetch('https://111-production-573e.up.railway.app/api/vehicles/available-drivers');
      if (response.ok) {
        const data = await response.json();
        setAvailableDrivers(data);
      }
    } catch (error) {
      console.error('Error fetching available drivers:', error);
    }
  };

  const handleAddVehicle = async () => {
    try {
      const vehicleData = {
        ...newVehicle,
        assignedDriverId: newVehicle.assignedDriverId === 'unassigned' ? '' : newVehicle.assignedDriverId
      };
      
      const response = await fetch('https://111-production-573e.up.railway.app/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
      }
      await fetchVehicles();
      await fetchAvailableDrivers();
      setNewVehicle({
        model: '',
        plateNumber: '',
        type: '',
        capacity: '',
        assignedDriverId: 'unassigned'
      });
      setShowAddForm(false);
      alert('Vehicle added successfully!');
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert(`Failed to add vehicle: ${error.message}`);
    }
  };

  const handleUpdateVehicle = async () => {
    try {
      const vehicleData = {
        ...selectedVehicle,
        assignedDriverId: selectedVehicle.assignedDriverId === 'unassigned' ? '' : selectedVehicle.assignedDriverId
      };
      
      const response = await fetch(`https://111-production-573e.up.railway.app/api/vehicles/${selectedVehicle.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
      }
      await fetchVehicles();
      await fetchAvailableDrivers();
      setShowEditForm(false);
      setSelectedVehicle(null);
      alert('Vehicle updated successfully!');
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert(`Failed to update vehicle: ${error.message}`);
    }
  };

  const handleViewSchedule = async (vehicle) => {
    setSelectedVehicleForSchedule(vehicle);
    setShowScheduleModal(true);
    
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    try {
      const response = await fetch(`https://111-production-573e.up.railway.app/api/vehicles/${vehicle.id}/schedule?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`);
      if (response.ok) {
        const data = await response.json();
        setVehicleSchedule(data.schedule || []);
      }
    } catch (error) {
      console.error('Error fetching vehicle schedule:', error);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
    
    if (showScheduleModal && selectedVehicleForSchedule) {
      handleViewSchedule(selectedVehicleForSchedule);
    }
  };

  const renderCalendar = () => {
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDay = startDate.getDay();
    const daysInMonth = endDate.getDate();
    
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
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
      
      const dayBookings = vehicleSchedule.filter(booking => {
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

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const response = await fetch(`https://111-production-573e.up.railway.app/api/vehicles/${vehicleId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
        }
        await fetchVehicles();
        await fetchAvailableDrivers();
        alert('Vehicle deleted successfully!');
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert(`Failed to delete vehicle: ${error.message}`);
      }
    }
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle({
      ...vehicle,
      assignedDriverId: vehicle.assignedDriverId || 'unassigned'
    });
    setShowEditForm(true);
  };

  const handleViewVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowViewModal(true);
  };

  const handleAssignDriver = async (vehicleId, driverId) => {
    try {
      const response = await fetch(`https://111-production-573e.up.railway.app/api/vehicles/${vehicleId}/assign-driver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId: driverId === 'unassigned' ? null : driverId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
      }
      await fetchVehicles();
      await fetchAvailableDrivers();
      alert('Driver assignment updated successfully!');
    } catch (error) {
      console.error('Error assigning driver:', error);
      alert(`Failed to assign driver: ${error.message}`);
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'Available':
        return 'text-green-600 bg-green-100';
      case 'Booked':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-600">Manage your fleet of vehicles</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search vehicles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Car className="mr-2 h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{vehicle.model}</CardTitle>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(vehicle.availability)}`}>
                  {vehicle.availability}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plate Number:</span>
                  <span className="font-medium">{vehicle.plateNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{vehicle.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium">{vehicle.capacity} passengers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Driver:</span>
                  <span className="font-medium">
                    {vehicle.assignedDriver ? (
                      <span className="flex items-center text-green-600">
                        <UserCheck className="mr-1 h-3 w-3" />
                        {vehicle.assignedDriver}
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-400">
                        <UserX className="mr-1 h-3 w-3" />
                        Not assigned
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-gray-600">Bookings:</span>
                  <div className="flex gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      Total: {vehicle.totalBookings || 0}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      Active: {vehicle.activeBookings || 0}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                      Completed: {vehicle.completedBookings || 0}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewSchedule(vehicle)}
                  className="flex items-center"
                  title="View Schedule"
                >
                  <Calendar className="mr-1 h-3 w-3" />
                  Schedule
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditVehicle(vehicle)}
                  className="flex items-center"
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteVehicle(vehicle.id)}
                  className="flex items-center text-red-600 hover:text-red-700"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Vehicle Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Vehicle</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                ×
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                  placeholder="Enter vehicle model"
                />
              </div>
              <div>
                <Label htmlFor="plateNumber">Plate Number</Label>
                <Input
                  id="plateNumber"
                  value={newVehicle.plateNumber}
                  onChange={(e) => setNewVehicle({...newVehicle, plateNumber: e.target.value})}
                  placeholder="Enter plate number"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={newVehicle.type}
                  onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                  placeholder="Enter vehicle type"
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newVehicle.capacity}
                  onChange={(e) => setNewVehicle({...newVehicle, capacity: e.target.value})}
                  placeholder="Enter passenger capacity"
                />
              </div>
              <div>
                <Label htmlFor="assignedDriver">Assigned Driver</Label>
                <Select onValueChange={(value) => setNewVehicle({...newVehicle, assignedDriverId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">No driver assigned</SelectItem>
                    {availableDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id.toString()}>
                        {driver.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddVehicle}>
                Add Vehicle
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditForm && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Vehicle</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowEditForm(false)}>
                ×
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editModel">Model</Label>
                <Input
                  id="editModel"
                  value={selectedVehicle.model}
                  onChange={(e) => setSelectedVehicle({...selectedVehicle, model: e.target.value})}
                  placeholder="Enter vehicle model"
                />
              </div>
              <div>
                <Label htmlFor="editPlateNumber">Plate Number</Label>
                <Input
                  id="editPlateNumber"
                  value={selectedVehicle.plateNumber}
                  onChange={(e) => setSelectedVehicle({...selectedVehicle, plateNumber: e.target.value})}
                  placeholder="Enter plate number"
                />
              </div>
              <div>
                <Label htmlFor="editType">Type</Label>
                <Input
                  id="editType"
                  value={selectedVehicle.type}
                  onChange={(e) => setSelectedVehicle({...selectedVehicle, type: e.target.value})}
                  placeholder="Enter vehicle type"
                />
              </div>
              <div>
                <Label htmlFor="editCapacity">Capacity</Label>
                <Input
                  id="editCapacity"
                  type="number"
                  value={selectedVehicle.capacity}
                  onChange={(e) => setSelectedVehicle({...selectedVehicle, capacity: e.target.value})}
                  placeholder="Enter passenger capacity"
                />
              </div>
              <div>
                <Label htmlFor="editAssignedDriver">Assigned Driver</Label>
                <Select onValueChange={(value) => setSelectedVehicle({...selectedVehicle, assignedDriverId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">No driver assigned</SelectItem>
                    {availableDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id.toString()}>
                        {driver.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowEditForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateVehicle}>
                Update Vehicle
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Schedule Modal */}
      {showScheduleModal && selectedVehicleForSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <Car className="mr-2 h-5 w-5" />
                {selectedVehicleForSchedule.model} - {selectedVehicleForSchedule.plateNumber} Schedule
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
              {vehicleSchedule.length === 0 ? (
                <p className="text-gray-500">No bookings found for this month.</p>
              ) : (
                <div className="space-y-2">
                  {vehicleSchedule.map(booking => (
                    <div key={booking.id} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold">{booking.title}</h5>
                          <p className="text-sm text-gray-600">Client: {booking.clientName}</p>
                          <p className="text-sm text-gray-600">
                            {booking.start} to {booking.end}
                            {booking.startTime && ` (${booking.startTime} - ${booking.endTime || 'End time not set'})`}
                          </p>
                          {booking.driverInfo && (
                            <p className="text-sm text-gray-600">Driver: {booking.driverInfo}</p>
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

