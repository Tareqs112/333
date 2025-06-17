import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Search,
  Eye,
  X,
  DollarSign,
  Hotel,
  Car,
  MapPin,
  Users,
  FileText,
  Calendar,
  User,
  Mail,
  Phone,
  Building2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export function Clients() {
  const [clients, setClients] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientBookings, setClientBookings] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [clientsPerPage] = useState(10);
  const [expandedClient, setExpandedClient] = useState(null);
  const [invoiceData, setInvoiceData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchClients();
    fetchCompanies();
  }, []);

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

  const fetchClientBookings = async (clientId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/clients/${clientId}/bookings`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setClientBookings(data);
      setShowBookingsModal(true);
    } catch (error) {
      console.error('Error fetching client bookings:', error);
      alert('Error fetching client bookings');
    }
  };

  const generateClientInvoice = async (clientId) => {
    try {
      const client = clients.find(c => c.id === clientId);
      
      let requestBody = {};
      if (client.companyId) {
        // For company clients, use month/year selection
        requestBody = {
          month: invoiceData.month,
          year: invoiceData.year,
        };
      }

      const response = await fetch(`http://localhost:5000/api/invoices/client/${clientId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate invoice');
      }

      const data = await response.json();
      alert(`Client detailed invoice generated successfully!`);
      
      if (data.pdfPath) {
        window.open(`http://localhost:5000${data.pdfPath}`, '_blank');
      }
      
      setShowInvoiceModal(false);
    } catch (error) {
      console.error('Error generating client invoice:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const filteredClients = clients.filter(client =>
    client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  const handleClientClick = (client) => {
    if (expandedClient === client.id) {
      setExpandedClient(null);
    } else {
      setSelectedClient(client);
      setExpandedClient(client.id);
      fetchClientBookings(client.id);
    }
  };

  const handleShowInvoiceModal = (client) => {
    setSelectedClient(client);
    setShowInvoiceModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const renderBookingSection = (bookings, title, icon) => {
    if (!bookings || bookings.length === 0) return null;

    return (
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3 flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
          <span className="ml-2 text-sm text-gray-500">({bookings.length})</span>
        </h4>
        <div className="grid gap-3">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-semibold">{booking.serviceName}</h5>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {booking.startDate} to {booking.endDate}
                      </div>
                      {booking.hotelName && (
                        <div className="flex items-center">
                          <Hotel className="mr-1 h-3 w-3" />
                          {booking.hotelName}
                        </div>
                      )}
                      {booking.roomType && (
                        <div className="flex items-center">
                          <Users className="mr-1 h-3 w-3" />
                          {booking.roomType}
                        </div>
                      )}
                      {booking.numNights && (
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {booking.numNights} Nights
                        </div>
                      )}
                      {booking.hours && (
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {booking.hours} Hours
                        </div>
                      )}
                      {booking.driverName && (
                        <div className="flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          Driver: {booking.driverName}
                        </div>
                      )}
                      {booking.vehicleInfo && (
                        <div className="flex items-center">
                          <Car className="mr-1 h-3 w-3" />
                          {booking.vehicleInfo}
                        </div>
                      )}
                      {booking.notes && (
                        <div className="flex items-center md:col-span-2">
                          <FileText className="mr-1 h-3 w-3" />
                          Notes: {booking.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-green-600">${booking.totalSellingPrice.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Profit: ${booking.profit.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="space-y-4">
        {currentClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {client.firstName} {client.lastName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {client.email && (
                          <div className="flex items-center">
                            <Mail className="mr-1 h-3 w-3" />
                            {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center">
                            <Phone className="mr-1 h-3 w-3" />
                            {client.phone}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Building2 className="mr-1 h-3 w-3" />
                          {client.company}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-4">
                    <p className="text-sm text-gray-500">Bookings: {client.bookingCount}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShowInvoiceModal(client)}
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    Invoice
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleClientClick(client)}
                  >
                    {expandedClient === client.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Expanded Bookings Section */}
              {expandedClient === client.id && clientBookings && (
                <div className="mt-6 pt-4 border-t">
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold mb-2">Client Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-blue-600 font-medium">Total Bookings</p>
                        <p className="text-xl font-bold text-blue-800">{clientBookings.totalBookings}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-green-600 font-medium">Total Revenue</p>
                        <p className="text-xl font-bold text-green-800">${clientBookings.totalRevenue.toFixed(2)}</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <p className="text-purple-600 font-medium">Total Profit</p>
                        <p className="text-xl font-bold text-purple-800">${clientBookings.totalProfit.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Hotels Section */}
                  {renderBookingSection(
                    clientBookings.bookings.hotels,
                    "Hotels",
                    <Hotel className="h-5 w-5 text-blue-600" />
                  )}

                  {/* Tours Section */}
                  {renderBookingSection(
                    clientBookings.bookings.tours,
                    "Tours",
                    <MapPin className="h-5 w-5 text-red-600" />
                  )}

                  {/* Vehicle Rentals Section */}
                  {renderBookingSection(
                    clientBookings.bookings.vehicle_rentals,
                    "Vehicle Rentals",
                    <Car className="h-5 w-5 text-purple-600" />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && selectedClient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative">
            <Button
              className="absolute top-3 right-3" 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowInvoiceModal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold mb-4">Generate Invoice for {selectedClient.firstName} {selectedClient.lastName}</h2>
            
            {selectedClient.companyId && (
              <div className="mb-4">
                <Label htmlFor="invoiceMonth" className="block text-sm font-medium text-gray-700">Month</Label>
                <Input
                  id="invoiceMonth"
                  type="number"
                  min="1"
                  max="12"
                  value={invoiceData.month}
                  onChange={(e) => setInvoiceData({ ...invoiceData, month: parseInt(e.target.value) })}
                  className="mt-1 block w-full"
                />
              </div>
            )}
            {selectedClient.companyId && (
              <div className="mb-4">
                <Label htmlFor="invoiceYear" className="block text-sm font-medium text-gray-700">Year</Label>
                <Input
                  id="invoiceYear"
                  type="number"
                  min="2000"
                  max="2100"
                  value={invoiceData.year}
                  onChange={(e) => setInvoiceData({ ...invoiceData, year: parseInt(e.target.value) })}
                  className="mt-1 block w-full"
                />
              </div>
            )}

            <Button
              onClick={() => generateClientInvoice(selectedClient.id)}
              className="w-full"
            >
              Generate Invoice
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

