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
  Unlink
} from 'lucide-react';

export function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAssignVehicleForm, setShowAssignVehicleForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [assigningDriver, setAssigningDriver] = useState(null);
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
        alert('Error adding driver: ' + error.message);
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
        alert('Error updating driver: ' + error.message);
      }
    }
  };

  const handleDeleteDriver = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
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
        alert('Error deleting driver: ' + error.message);
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
      alert('Error updating vehicle assignment: ' + error.message);
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Drivers</h1>
        <p className="text-gray-600">Manage your driver database and vehicle assignments</p>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Driver
        </Button>
      </div>

      {/* Add Driver Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Driver</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="driverFirstName">First Name</Label>
                <Input
                  id="driverFirstName"
                  value={newDriver.firstName}
                  onChange={(e) => setNewDriver({...newDriver, firstName: e.target.value})}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="driverLastName">Last Name</Label>
                <Input
                  id="driverLastName"
                  value={newDriver.lastName}
                  onChange={(e) => setNewDriver({...newDriver, lastName: e.target.value})}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <Label htmlFor="driverEmail">Email</Label>
                <Input
                  id="driverEmail"
                  type="email"
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({...newDriver, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="driverPhone">Phone</Label>
                <Input
                  id="driverPhone"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={newDriver.licenseNumber}
                  onChange={(e) => setNewDriver({...newDriver, licenseNumber: e.target.value})}
                  placeholder="Enter driver license number"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddDriver}>Add Driver</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Driver Form */}
      {showEditForm && editingDriver && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Driver</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editDriverFirstName">First Name</Label>
                <Input
                  id="editDriverFirstName"
                  value={editingDriver.firstName}
                  onChange={(e) => setEditingDriver({...editingDriver, firstName: e.target.value})}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="editDriverLastName">Last Name</Label>
                <Input
                  id="editDriverLastName"
                  value={editingDriver.lastName}
                  onChange={(e) => setEditingDriver({...editingDriver, lastName: e.target.value})}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <Label htmlFor="editDriverEmail">Email</Label>
                <Input
                  id="editDriverEmail"
                  type="email"
                  value={editingDriver.email}
                  onChange={(e) => setEditingDriver({...editingDriver, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="editDriverPhone">Phone</Label>
                <Input
                  id="editDriverPhone"
                  value={editingDriver.phone}
                  onChange={(e) => setEditingDriver({...editingDriver, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="editLicenseNumber">License Number</Label>
                <Input
                  id="editLicenseNumber"
                  value={editingDriver.licenseNumber}
                  onChange={(e) => setEditingDriver({...editingDriver, licenseNumber: e.target.value})}
                  placeholder="Enter driver license number"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateDriver}>Update Driver</Button>
              <Button variant="outline" onClick={() => {
                setShowEditForm(false);
                setEditingDriver(null);
              }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assign Vehicles Form */}
      {showAssignVehicleForm && assigningDriver && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Assign Vehicles to {assigningDriver.firstName} {assigningDriver.lastName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getAvailableVehicles().map(vehicle => (
                <div key={vehicle.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                  <input
                    type="checkbox"
                    id={`vehicle-${vehicle.id}`}
                    checked={selectedVehicleIds.includes(vehicle.id)}
                    onChange={() => handleVehicleSelection(vehicle.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`vehicle-${vehicle.id}`} className="flex-1 cursor-pointer">
                    <div className="font-medium">{vehicle.model}</div>
                    <div className="text-sm text-gray-600">{vehicle.plateNumber}</div>
                    <div className="text-xs text-gray-500">{vehicle.type}</div>
                  </label>
                </div>
              ))}
            </div>
            {getAvailableVehicles().length === 0 && (
              <p className="text-gray-500 text-center py-4">No available vehicles to assign</p>
            )}
            <div className="flex gap-2">
              <Button onClick={handleUpdateVehicleAssignment}>Update Assignment</Button>
              <Button variant="outline" onClick={() => {
                setShowAssignVehicleForm(false);
                setAssigningDriver(null);
                setSelectedVehicleIds([]);
              }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drivers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Car className="mr-2 h-5 w-5" />
            Drivers ({filteredDrivers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDrivers.map((driver) => (
              <div key={driver.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1 cursor-pointer" onClick={() => handleEditDriver(driver)}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
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
                <div className="flex gap-2">
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
    </div>
  );
}

