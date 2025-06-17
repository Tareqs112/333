import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Car,
  Plus,
  Edit,
  Trash2,
  User,
  UserCheck,
  UserX,
  Eye,
  Save,
  X
} from 'lucide-react';

export function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    model: '',
    plateNumber: '',
    type: '',
    capacity: '',
    assignedDriverId: 'unassigned' // تغيير القيمة الافتراضية من '' إلى 'unassigned'
  });

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
    fetchAvailableDrivers();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/vehicles');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/drivers');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchAvailableDrivers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/vehicles/available-drivers');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAvailableDrivers(data);
    } catch (error) {
      console.error('Error fetching available drivers:', error);
    }
  };

  const handleAddVehicle = async () => {
    try {
      // تحويل 'unassigned' إلى قيمة فارغة قبل الإرسال إلى الخادم
      const vehicleData = {
        ...newVehicle,
        assignedDriverId: newVehicle.assignedDriverId === 'unassigned' ? '' : newVehicle.assignedDriverId
      };
      
      const response = await fetch('http://localhost:5000/api/vehicles', {
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
        assignedDriverId: 'unassigned' // إعادة تعيين إلى 'unassigned'
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
      // تحويل 'unassigned' إلى قيمة فارغة قبل الإرسال إلى الخادم
      const vehicleData = {
        ...selectedVehicle,
        assignedDriverId: selectedVehicle.assignedDriverId === 'unassigned' ? '' : selectedVehicle.assignedDriverId
      };
      
      const response = await fetch(`http://localhost:5000/api/vehicles/${selectedVehicle.id}`, {
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

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}`, {
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

  const handleAssignDriver = async (vehicleId, driverId) => {
    try {
      // تحويل 'unassigned' إلى null قبل الإرسال
      const actualDriverId = driverId === 'unassigned' ? null : driverId;
      
      const response = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}/assign-driver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId: actualDriverId }),
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

  const handleViewVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowViewModal(true);
  };

  const handleEditVehicle = (vehicle) => {
    // تحويل القيمة الفارغة أو null إلى 'unassigned' للعرض في النموذج
    const vehicleForEdit = {
      ...vehicle,
      assignedDriverId: vehicle.assignedDriverId || 'unassigned'
    };
    setSelectedVehicle(vehicleForEdit);
    setShowEditForm(true);
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

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
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
              </div>
              
              <div className="flex justify-between mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewVehicle(vehicle)}
                  className="flex items-center"
                >
                  <Eye className="mr-1 h-3 w-3" />
                  View
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
                <X className="h-4 w-4" />
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
                <Select value={newVehicle.type} onValueChange={(value) => setNewVehicle({...newVehicle, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedan">Sedan</SelectItem>
                    <SelectItem value="SUV">Taliant</SelectItem>
                    <SelectItem value="Van">Van Marcides</SelectItem>
                    <SelectItem value="Bus">Bus</SelectItem>
                    <SelectItem value="Minibus">Duster</SelectItem>
                    <SelectItem value="Coaster">Coaster</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="assignedDriver">Assigned Driver (Optional)</Label>
                <Select value={newVehicle.assignedDriverId} onValueChange={(value) => setNewVehicle({...newVehicle, assignedDriverId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a driver (optional)" />
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
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddVehicle}>
                <Save className="mr-2 h-4 w-4" />
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
                <X className="h-4 w-4" />
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
                <Select value={selectedVehicle.type} onValueChange={(value) => setSelectedVehicle({...selectedVehicle, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedan">Sedan</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                    <SelectItem value="Bus">Bus</SelectItem>
                    <SelectItem value="Minibus">Minibus</SelectItem>
                    <SelectItem value="Coaster">Coaster</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select value={selectedVehicle.assignedDriverId || 'unassigned'} onValueChange={(value) => setSelectedVehicle({...selectedVehicle, assignedDriverId: value})}>
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
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowEditForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateVehicle}>
                <Save className="mr-2 h-4 w-4" />
                Update Vehicle
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Vehicle Modal */}
      {showViewModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Vehicle Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowViewModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Model:</span>
                <span>{selectedVehicle.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Plate Number:</span>
                <span>{selectedVehicle.plateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Type:</span>
                <span>{selectedVehicle.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Capacity:</span>
                <span>{selectedVehicle.capacity} passengers</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Availability:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(selectedVehicle.availability)}`}>
                  {selectedVehicle.availability}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Assigned Driver:</span>
                <span>
                  {selectedVehicle.assignedDriver ? (
                    <span className="flex items-center text-green-600">
                      <UserCheck className="mr-1 h-3 w-3" />
                      {selectedVehicle.assignedDriver}
                    </span>
                  ) : (
                    <span className="flex items-center text-gray-400">
                      <UserX className="mr-1 h-3 w-3" />
                      Not assigned
                    </span>
                  )}
                </span>
              </div>
              
              {/* Driver Assignment Section */}
              <div className="border-t pt-4">
                <Label htmlFor="assignDriver">Assign/Change Driver</Label>
                <div className="flex space-x-2 mt-2">
                  <Select onValueChange={(value) => handleAssignDriver(selectedVehicle.id, value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Remove driver assignment</SelectItem>
                      {availableDrivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id.toString()}>
                          {driver.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowViewModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

