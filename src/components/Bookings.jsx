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
      const response = await fetch('http://localhost:5000/api/bookings');
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
      const response = await fetch('http://localhost:5000/api/clients');
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

  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/companies');
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
      const response = await fetch('http://localhost:5000/api/bookings/service-types');
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
      alert('Please fill in required fields (First Name and Last Name)');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClient),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add client');
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
        licenseNumber: ''
      });
      
      // Update selected client in booking form
      setNewBooking(prev => ({
        ...prev,
        clientId: data.id.toString()
      }));

      // Show success message
      alert(`Client ${data.firstName} ${data.lastName} added successfully!`);
      
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Error adding client: ' + error.message);
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
      alert('Please fill in all required service fields.');
      return;
    }

    if (isAccommodation) {
      if (!newService.hotelName || !newService.hotelCity || !newService.roomType || !newService.numNights || 
          !newService.costPerNight || !newService.sellingPricePerNight) {
        alert('Please fill in all accommodation details including city name.');
        return;
      }
    } else {
      if (!newService.costToCompany || !newService.sellingPrice) {
        alert('Please fill in cost and selling price.');
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
      alert('Please fill in all required booking fields.');
      return;
    }

    if (newBooking.services.length === 0) {
      alert('Please add at least one service to the booking.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
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
      alert('Error adding booking: ' + error.message);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
        }
        fetchBookings();
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking: ' + error.message);
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
        hotelCity: service.hotelCity || '',
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
      alert('Please fill in all required booking fields.');
      return;
    }

    if (editBookingData.services.length === 0) {
      alert('Please add at least one service to the booking.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${editingBooking.id}`, {
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
      alert('Error updating booking: ' + error.message);
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
          <CardTitle>Add Service</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="serviceType">Service Type *</Label>
              <select
                id="serviceType"
                value={newService.serviceType}
                onChange={(e) => handleServiceTypeChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select service type</option>
                {serviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="serviceName">Service Name *</Label>
              <Input
                id="serviceName"
                value={newService.serviceName}
                onChange={(e) => setNewService(prev => ({ ...prev, serviceName: e.target.value }))}
                placeholder="e.g., City Tour, Airport Transfer"
              />
            </div>
            <div>
              <Label htmlFor="serviceStartDate">Start Date *</Label>
              <Input
                id="serviceStartDate"
                type="date"
                value={newService.startDate}
                onChange={(e) => setNewService(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="serviceEndDate">End Date *</Label>
              <Input
                id="serviceEndDate"
                type="date"
                value={newService.endDate}
                onChange={(e) => setNewService(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>

            {/* Tour-specific fields */}
            {isTour && (
              <>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newService.startTime}
                    onChange={(e) => setNewService(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newService.endTime}
                    onChange={(e) => setNewService(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
                {/* Added driver and vehicle fields for tours */}
                <div>
                  <Label htmlFor="tourDriverId">Driver</Label>
                  <select
                    id="tourDriverId"
                    value={newService.driverId}
                    onChange={(e) => setNewService(prev => ({ ...prev, driverId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select driver</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>{driver.firstName} {driver.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="tourVehicleId">Vehicle</Label>
                  <select
                    id="tourVehicleId"
                    value={newService.vehicleId}
                    onChange={(e) => setNewService(prev => ({ ...prev, vehicleId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Vehicle-specific fields */}
            {isVehicle && (
              <>
                <div>
                  <Label htmlFor="is_hourly">Hourly Rental?</Label>
                  <div className="flex items-center mt-2">
                    <input
                      id="is_hourly"
                      type="checkbox"
                      checked={newService.is_hourly}
                      onChange={(e) => setNewService(prev => ({ ...prev, is_hourly: e.target.checked }))}
                      className="mr-2"
                    />
                    <span>Yes</span>
                  </div>
                </div>
                {newService.is_hourly && (
                  <div>
                    <Label htmlFor="hours">Number of Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      value={newService.hours}
                      onChange={(e) => setNewService(prev => ({ ...prev, hours: e.target.value }))}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="with_driver">With Driver?</Label>
                  <div className="flex items-center mt-2">
                    <input
                      id="with_driver_yes"
                      type="radio"
                      name="with_driver"
                      checked={newService.with_driver === true}
                      onChange={() => setNewService(prev => ({ ...prev, with_driver: true }))}
                      className="mr-1"
                    />
                    <span className="mr-4">Yes</span>
                    <input
                      id="with_driver_no"
                      type="radio"
                      name="with_driver"
                      checked={newService.with_driver === false}
                      onChange={() => setNewService(prev => ({ ...prev, with_driver: false }))}
                      className="mr-1"
                    />
                    <span>No</span>
                  </div>
                </div>
                {newService.with_driver && (
                  <div>
                    <Label htmlFor="driverId">Driver</Label>
                    <select
                      id="driverId"
                      value={newService.driverId}
                      onChange={(e) => setNewService(prev => ({ ...prev, driverId: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select driver</option>
                      {drivers.map(driver => (
                        <option key={driver.id} value={driver.id}>{driver.firstName} {driver.lastName}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <Label htmlFor="vehicleId">Vehicle</Label>
                  <select
                    id="vehicleId"
                    value={newService.vehicleId}
                    onChange={(e) => setNewService(prev => ({ ...prev, vehicleId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Hotel-specific fields */}
            {isAccommodation && (
              <>
                <div>
                  <Label htmlFor="hotelName">Hotel Name *</Label>
                  <Input
                    id="hotelName"
                    value={newService.hotelName}
                    onChange={(e) => setNewService(prev => ({ ...prev, hotelName: e.target.value }))}
                    placeholder="Enter hotel name"
                  />
                </div>
                <div>
                  <Label htmlFor="hotelCity">City Name *</Label>
                  <Input
                    id="hotelCity"
                    value={newService.hotelCity}
                    onChange={(e) => setNewService(prev => ({ ...prev, hotelCity: e.target.value }))}
                    placeholder="Enter city name"
                  />
                </div>
                <div>
                  <Label htmlFor="roomType">Room Type *</Label>
                  <Input
                    id="roomType"
                    value={newService.roomType}
                    onChange={(e) => setNewService(prev => ({ ...prev, roomType: e.target.value }))}
                    placeholder="e.g., Double, Suite"
                  />
                </div>
                <div>
                  <Label htmlFor="numNights">Number of Nights</Label>
                  <Input
                    id="numNights"
                    type="number"
                    value={newService.numNights}
                    onChange={(e) => setNewService(prev => ({ ...prev, numNights: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="costPerNight">Cost per Night</Label>
                  <Input
                    id="costPerNight"
                    type="number"
                    step="0.01"
                    value={newService.costPerNight}
                    onChange={(e) => setNewService(prev => ({ ...prev, costPerNight: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="sellingPricePerNight">Selling Price per Night</Label>
                  <Input
                    id="sellingPricePerNight"
                    type="number"
                    step="0.01"
                    value={newService.sellingPricePerNight}
                    onChange={(e) => setNewService(prev => ({ ...prev, sellingPricePerNight: e.target.value }))}
                  />
                </div>
                {newService.numNights && newService.costPerNight && newService.sellingPricePerNight && (
                  <div className="col-span-3">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Total Cost</Label>
                          <p className="font-semibold">
                            {calculateAccommodationTotals(
                              newService.numNights,
                              newService.costPerNight,
                              newService.sellingPricePerNight
                            ).totalCost.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <Label>Total Selling Price</Label>
                          <p className="font-semibold">
                            {calculateAccommodationTotals(
                              newService.numNights,
                              newService.costPerNight,
                              newService.sellingPricePerNight
                            ).totalSelling.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <Label>Profit</Label>
                          <p className="font-semibold">
                            {calculateAccommodationTotals(
                              newService.numNights,
                              newService.costPerNight,
                              newService.sellingPricePerNight
                            ).profit.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Common fields for non-accommodation services */}
            {!isAccommodation && (
              <>
                <div>
                  <Label htmlFor="costToCompany">Cost to Company</Label>
                  <Input
                    id="costToCompany"
                    type="number"
                    step="0.01"
                    value={newService.costToCompany}
                    onChange={(e) => setNewService(prev => ({ ...prev, costToCompany: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="sellingPrice">Selling Price</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    value={newService.sellingPrice}
                    onChange={(e) => setNewService(prev => ({ ...prev, sellingPrice: e.target.value }))}
                  />
                </div>
                {newService.costToCompany && newService.sellingPrice && (
                  <div>
                    <Label>Profit</Label>
                    <p className="font-semibold">
                      {(parseFloat(newService.sellingPrice) - parseFloat(newService.costToCompany)).toFixed(2)}
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="col-span-full">
              <Label htmlFor="serviceNotes">Notes</Label>
              <textarea
                id="serviceNotes"
                value={newService.notes}
                onChange={(e) => setNewService(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Additional notes about this service"
              ></textarea>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={addServiceToBooking}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderServicesList = (services) => {
    return services.length > 0 ? (
      <div className="space-y-3 mt-4">
        <h3 className="font-medium">Services</h3>
        {services.map((service, index) => {
          const isAccommodation = isAccommodationService(service.serviceType);
          let totalCost = 0;
          let totalSelling = 0;
          let profit = 0;

          if (isAccommodation) {
            const totals = calculateAccommodationTotals(
              service.numNights,
              service.costPerNight,
              service.sellingPricePerNight
            );
            totalCost = totals.totalCost;
            totalSelling = totals.totalSelling;
            profit = totals.profit;
          } else {
            totalCost = parseFloat(service.costToCompany) || 0;
            totalSelling = parseFloat(service.sellingPrice) || 0;
            profit = totalSelling - totalCost;
          }

          return (
            <Card key={`service-${index}`} className="bg-gray-50">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getServiceIcon(service.serviceType)}
                      <span className="font-medium">{service.serviceType}</span>
                      <span className="text-gray-600">-</span>
                      <span>{service.serviceName}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Dates:</span>
                        <p>{service.startDate} to {service.endDate}</p>
                      </div>
                      
                      {isAccommodation && (
                        <>
                          <div>
                            <span className="text-gray-600">Hotel:</span>
                            <p>{service.hotelName}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">City:</span>
                            <p>{service.hotelCity}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Room:</span>
                            <p>{service.roomType} ({service.numNights} nights)</p>
                          </div>
                        </>
                      )}
                      
                      <div>
                        <span className="text-gray-600">Cost:</span>
                        <p className="font-medium">${totalCost.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Selling:</span>
                        <p className="font-medium">${totalSelling.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Profit:</span>
                        <p className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${profit.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    {service.notes && (
                      <div className="mt-2">
                        <span className="text-gray-600 text-sm">Notes:</span>
                        <p className="text-sm">{service.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeServiceFromBooking(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    ) : null;
  };

  const renderAddBookingForm = () => {
    return (
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Booking</DialogTitle>
            <DialogDescription>
              Create a new booking by filling in the details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientId">Client *</Label>
                <div className="flex gap-2">
                  <select
                    id="clientId"
                    value={newBooking.clientId}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, clientId: e.target.value }))}
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select client</option>
                    {clients.map(client => (
                      <option key={`client-option-${client.id}`} value={client.id}>
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="overall_startDate">Overall Start Date *</Label>
                <Input
                  id="overall_startDate"
                  type="date"
                  value={newBooking.overall_startDate}
                  onChange={(e) => setNewBooking(prev => ({ ...prev, overall_startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="overall_endDate">Overall End Date *</Label>
                <Input
                  id="overall_endDate"
                  type="date"
                  value={newBooking.overall_endDate}
                  onChange={(e) => setNewBooking(prev => ({ ...prev, overall_endDate: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={newBooking.notes}
                onChange={(e) => setNewBooking(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Additional booking notes"
              ></textarea>
            </div>
            
            {renderServiceForm()}
            
            {renderServicesList(newBooking.services)}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button onClick={handleAddBooking}>Create Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const renderEditBookingForm = () => {
    return (
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Update the booking details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editClientId">Client *</Label>
                <select
                  id="editClientId"
                  value={editBookingData.clientId}
                  onChange={(e) => setEditBookingData(prev => ({ ...prev, clientId: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select client</option>
                  {clients.map(client => (
                    <option key={`edit-client-option-${client.id}`} value={client.id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editOverallStartDate">Overall Start Date *</Label>
                <Input
                  id="editOverallStartDate"
                  type="date"
                  value={editBookingData.overall_startDate}
                  onChange={(e) => setEditBookingData(prev => ({ ...prev, overall_startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editOverallEndDate">Overall End Date *</Label>
                <Input
                  id="editOverallEndDate"
                  type="date"
                  value={editBookingData.overall_endDate}
                  onChange={(e) => setEditBookingData(prev => ({ ...prev, overall_endDate: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="editNotes">Notes</Label>
              <textarea
                id="editNotes"
                value={editBookingData.notes}
                onChange={(e) => setEditBookingData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Additional booking notes"
              ></textarea>
            </div>
            
            {/* Services list for editing */}
            <div className="space-y-3">
              <h3 className="font-medium">Services</h3>
              {editBookingData.services.map((service, index) => (
                <Card key={`edit-service-${index}`} className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label>Service Type</Label>
                        <select
                          value={service.serviceType}
                          onChange={(e) => {
                            const updatedServices = [...editBookingData.services];
                            updatedServices[index].serviceType = e.target.value;
                            setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                          }}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select service type</option>
                          {serviceTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Service Name</Label>
                        <Input
                          value={service.serviceName}
                          onChange={(e) => {
                            const updatedServices = [...editBookingData.services];
                            updatedServices[index].serviceName = e.target.value;
                            setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                          }}
                        />
                      </div>
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={service.startDate}
                          onChange={(e) => {
                            const updatedServices = [...editBookingData.services];
                            updatedServices[index].startDate = e.target.value;
                            setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                          }}
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={service.endDate}
                          onChange={(e) => {
                            const updatedServices = [...editBookingData.services];
                            updatedServices[index].endDate = e.target.value;
                            setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                          }}
                        />
                      </div>
                      
                      {/* Tour-specific fields for editing */}
                      {isTourService(service.serviceType) && (
                        <>
                          <div>
                            <Label>Start Time</Label>
                            <Input
                              type="time"
                              value={service.startTime}
                              onChange={(e) => {
                                const updatedServices = [...editBookingData.services];
                                updatedServices[index].startTime = e.target.value;
                                setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                              }}
                            />
                          </div>
                          <div>
                            <Label>End Time</Label>
                            <Input
                              type="time"
                              value={service.endTime}
                              onChange={(e) => {
                                const updatedServices = [...editBookingData.services];
                                updatedServices[index].endTime = e.target.value;
                                setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                              }}
                            />
                          </div>
                          <div>
                            <Label>Driver</Label>
                            <select
                              value={service.driverId}
                              onChange={(e) => {
                                const updatedServices = [...editBookingData.services];
                                updatedServices[index].driverId = e.target.value;
                                setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                              }}
                              className="w-full p-2 border border-gray-300 rounded-md"
                            >
                              <option value="">Select driver</option>
                              {drivers.map(driver => (
                                <option key={driver.id} value={driver.id}>{driver.firstName} {driver.lastName}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label>Vehicle</Label>
                            <select
                              value={service.vehicleId}
                              onChange={(e) => {
                                const updatedServices = [...editBookingData.services];
                                updatedServices[index].vehicleId = e.target.value;
                                setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                              }}
                              className="w-full p-2 border border-gray-300 rounded-md"
                            >
                              <option value="">Select vehicle</option>
                              {vehicles.map(vehicle => (
                                <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model}</option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}
                      
                      {/* Hotel-specific fields for editing */}
                      {isAccommodationService(service.serviceType) && (
                        <>
                          <div>
                            <Label>Hotel Name</Label>
                            <Input
                              value={service.hotelName}
                              onChange={(e) => {
                                const updatedServices = [...editBookingData.services];
                                updatedServices[index].hotelName = e.target.value;
                                setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                              }}
                            />
                          </div>
                          <div>
                            <Label>City Name</Label>
                            <Input
                              value={service.hotelCity}
                              onChange={(e) => {
                                const updatedServices = [...editBookingData.services];
                                updatedServices[index].hotelCity = e.target.value;
                                setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                              }}
                            />
                          </div>
                          <div>
                            <Label>Room Type</Label>
                            <Input
                              value={service.roomType}
                              onChange={(e) => {
                                const updatedServices = [...editBookingData.services];
                                updatedServices[index].roomType = e.target.value;
                                setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                              }}
                            />
                          </div>
                          <div>
                            <Label>Number of Nights</Label>
                            <Input
                              type="number"
                              value={service.numNights}
                              onChange={(e) => {
                                const updatedServices = [...editBookingData.services];
                                updatedServices[index].numNights = e.target.value;
                                setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                              }}
                            />
                          </div>
                          <div>
                            <Label>Cost per Night</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={service.costPerNight}
                              onChange={(e) => {
                                const updatedServices = [...editBookingData.services];
                                updatedServices[index].costPerNight = e.target.value;
                                setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                              }}
                            />
                          </div>
                          <div>
                            <Label>Selling Price per Night</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={service.sellingPricePerNight}
                              onChange={(e) => {
                                const updatedServices = [...editBookingData.services];
                                updatedServices[index].sellingPricePerNight = e.target.value;
                                setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                              }}
                            />
                          </div>
                        </>
                      )}
                      
                      {/* Common fields for non-accommodation services */}
                      {!isAccommodationService(service.serviceType) && (
                        <>
                          <div>
                            <Label>Cost to Company</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={service.costToCompany}
                              onChange={(e) => {
                                const updatedServices = [...editBookingData.services];
                                updatedServices[index].costToCompany = e.target.value;
                                setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                              }}
                            />
                          </div>
                          <div>
                            <Label>Selling Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={service.sellingPrice}
                              onChange={(e) => {
                                const updatedServices = [...editBookingData.services];
                                updatedServices[index].sellingPrice = e.target.value;
                                setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                              }}
                            />
                          </div>
                        </>
                      )}
                      
                      <div className="col-span-full">
                        <Label>Notes</Label>
                        <textarea
                          value={service.notes}
                          onChange={(e) => {
                            const updatedServices = [...editBookingData.services];
                            updatedServices[index].notes = e.target.value;
                            setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                          }}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          rows="2"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updatedServices = editBookingData.services.filter((_, i) => i !== index);
                          setEditBookingData(prev => ({ ...prev, services: updatedServices }));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove Service
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditForm(false)}>Cancel</Button>
            <Button onClick={handleUpdateBooking}>Update Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Add Client Modal
  const renderAddClientModal = () => {
    return (
      <Dialog open={showAddClientModal} onOpenChange={setShowAddClientModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Create a new client to add to your booking.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newClientFirstName">First Name *</Label>
                <Input
                  id="newClientFirstName"
                  value={newClient.firstName}
                  onChange={(e) => setNewClient(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="newClientLastName">Last Name *</Label>
                <Input
                  id="newClientLastName"
                  value={newClient.lastName}
                  onChange={(e) => setNewClient(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="newClientEmail">Email</Label>
              <Input
                id="newClientEmail"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john.doe@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="newClientPhone">Phone</Label>
              <Input
                id="newClientPhone"
                value={newClient.phone}
                onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1234567890"
              />
            </div>
            
            <div>
              <Label htmlFor="newClientCompany">Company</Label>
              <select
                id="newClientCompany"
                value={newClient.companyId}
                onChange={(e) => setNewClient(prev => ({ ...prev, companyId: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select company (optional)</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="newClientLicense">License Number</Label>
              <Input
                id="newClientLicense"
                value={newClient.licenseNumber}
                onChange={(e) => setNewClient(prev => ({ ...prev, licenseNumber: e.target.value }))}
                placeholder="License number (optional)"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddClientModal(false)}>Cancel</Button>
            <Button onClick={handleAddClient}>Add Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bookings Management</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Booking
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search bookings by client, service, or hotel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No bookings found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={`booking-${booking.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {booking.client}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {booking.overall_startDate} to {booking.overall_endDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditBooking(booking)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {booking.services && booking.services.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Services</h4>
                    {booking.services.map((service, serviceIndex) => (
                      <div key={`booking-${booking.id}-service-${serviceIndex}`} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          {getServiceIcon(service.serviceType)}
                          <span className="font-medium">{service.serviceType}</span>
                          <span className="text-gray-600">-</span>
                          <span>{service.serviceName}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Dates:</span>
                            <p>{service.startDate} to {service.endDate}</p>
                          </div>
                          
                          {isAccommodationService(service.serviceType) && (
                            <>
                              <div>
                                <span className="text-gray-600">Hotel:</span>
                                <p>{service.hotelName}</p>
                              </div>
                              {service.hotelCity && (
                                <div>
                                  <span className="text-gray-600">City:</span>
                                  <p>{service.hotelCity}</p>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-600">Room:</span>
                                <p>{service.roomType} ({service.numNights} nights)</p>
                              </div>
                            </>
                          )}
                          
                          <div>
                            <span className="text-gray-600">Cost:</span>
                            <p className="font-medium">${service.totalCost ? service.totalCost.toFixed(2) : '0.00'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Selling:</span>
                            <p className="font-medium">${service.totalSellingPrice ? service.totalSellingPrice.toFixed(2) : '0.00'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Profit:</span>
                            <p className={`font-medium ${(service.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${service.profit ? service.profit.toFixed(2) : '0.00'}
                            </p>
                          </div>
                        </div>
                        
                        {service.notes && (
                          <div className="mt-2">
                            <span className="text-gray-600 text-sm">Notes:</span>
                            <p className="text-sm">{service.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {booking.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <span className="text-gray-600 text-sm">Booking Notes:</span>
                    <p className="text-sm">{booking.notes}</p>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Cost:</span>
                      <p className="font-semibold text-lg">${booking.totalCost ? booking.totalCost.toFixed(2) : '0.00'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Selling:</span>
                      <p className="font-semibold text-lg">${booking.totalSellingPrice ? booking.totalSellingPrice.toFixed(2) : '0.00'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Profit:</span>
                      <p className={`font-semibold text-lg ${(booking.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${booking.profit ? booking.profit.toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modals */}
      {renderAddBookingForm()}
      {renderEditBookingForm()}
      {renderAddClientModal()}
    </div>
  );
}

