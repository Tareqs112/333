import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Building2,
  Users,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  X,
  Save,
  UserPlus,
  Receipt,
  FileSpreadsheet,
  Building,
  CreditCard
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';

// Helper function to safely format numbers
const safeToFixed = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00';
  }
  return Number(value).toFixed(decimals);
};

export function Companies() {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyClients, setCompanyClients] = useState([]);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showExcelInvoiceModal, setShowExcelInvoiceModal] = useState(false);
  const [excelInvoiceData, setExcelInvoiceData] = useState(null);
  const [newCompany, setNewCompany] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: ''
  });
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    totalAmount: '',
    arrivalDate: '',
    serviceName: 'Service Package',
    notes: ''
  });
  const [editingCompany, setEditingCompany] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [monthlyInvoiceData, setMonthlyInvoiceData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    invoiceType: 'partner_company'
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  // UPDATED: Use new endpoint for companies with updated counts
  const fetchCompanies = async () => {
    try {
      const response = await fetch('https://111-production-573e.up.railway.app/api/companies/with-counts');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      // Fallback to original endpoint if new one fails
      try {
        const fallbackResponse = await fetch('https://111-production-573e.up.railway.app/api/companies');
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          setCompanies(fallbackData);
        }
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
      }
    }
  };

  // UPDATED: Use simplified endpoint for company clients
  const fetchCompanyClients = async (companyId, month = null, year = null) => {
    try {
      let url = `https://111-production-573e.up.railway.app/api/companies/${companyId}/clients/simple`;
      if (month && year) {
        url += `?month=${month}&year=${year}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCompanyClients(data);
    } catch (error) {
      console.error('Error fetching company clients:', error);
      // Fallback to original endpoint if new one fails
      try {
        let fallbackUrl = `https://111-production-573e.up.railway.app/api/companies/${companyId}/clients/detailed`;
        if (month && year) {
          fallbackUrl += `?month=${month}&year=${year}`;
        }
        const fallbackResponse = await fetch(fallbackUrl);
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          setCompanyClients(fallbackData);
        }
      } catch (fallbackError) {
        console.error('Fallback client fetch also failed:', fallbackError);
      }
    }
  };

  // UPDATED: Fetch Excel-like invoice data with better error handling
  const fetchExcelInvoiceData = async (companyId, month, year) => {
    try {
      console.log(`Fetching Excel invoice data for company ${companyId}, month ${month}, year ${year}`);
      
      const response = await fetch(
        `https://111-production-573e.up.railway.app/api/companies/${companyId}/monthly-invoice-excel?month=${month}&year=${year}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response:', responseText);
        throw new Error('Server returned non-JSON response. Check server logs.');
      }
      
      const data = await response.json();
      console.log('Excel invoice data received:', data);
      
      setExcelInvoiceData(data);
      setShowExcelInvoiceModal(true);
    } catch (error) {
      console.error('Error fetching Excel invoice data:', error);
      alert('Error fetching invoice data: ' + error.message + '\n\nPlease check:\n1. Server is running\n2. Company has clients with bookings\n3. Check browser console for details');
    }
  };

  // UPDATED: Add client directly to company with better error handling
  const addClientToCompany = async () => {
    if (!selectedCompany) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://111-production-573e.up.railway.app/api/companies/${selectedCompany.id}/clients`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newClient),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add client');
      }

      const result = await response.json();
      alert('Client added successfully!');
      setShowAddClientModal(false);
      setNewClient({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        totalAmount: '',
        arrivalDate: '',
        serviceName: 'Service Package',
        notes: ''
      });
      
      // Refresh company clients if currently viewing
      if (showClientDetails) {
        fetchCompanyClients(selectedCompany.id);
      }
      
      // Refresh companies to update client count
      fetchCompanies();
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Error adding client: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate Excel-like invoice
  const generateExcelInvoice = async () => {
    if (!selectedCompany) return;
    
    try {
      const response = await fetch(
        'https://111-production-573e.up.railway.app/api/invoices/monthly-excel/generate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyId: selectedCompany.id,
            month: monthlyInvoiceData.month,
            year: monthlyInvoiceData.year
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate invoice');
      }

      const result = await response.json();
      
      // Download the generated PDF
      const downloadUrl = `https://111-production-573e.up.railway.app${result.pdfPath}`;
      window.open(downloadUrl, '_blank');
      
      alert('Excel-like invoice generated successfully!');
    } catch (error) {
      console.error('Error generating Excel invoice:', error);
      alert('Error generating invoice: ' + error.message);
    }
  };

  // Generate detailed invoice for my company
  const generateMyCompanyInvoice = async () => {
    if (!selectedCompany) return;
    
    try {
      const response = await fetch(
        'https://111-production-573e.up.railway.app/api/invoices/my-company-detailed/generate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyId: selectedCompany.id,
            month: monthlyInvoiceData.month,
            year: monthlyInvoiceData.year
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate invoice');
      }

      const result = await response.json();
      
      // Download the generated PDF
      const downloadUrl = `https://111-production-573e.up.railway.app${result.pdfPath}`;
      window.open(downloadUrl, '_blank');
      
      alert('My company detailed invoice generated successfully!');
    } catch (error) {
      console.error('Error generating my company invoice:', error);
      alert('Error generating invoice: ' + error.message);
    }
  };

  // UPDATED: Update payment status with better error handling and refresh
  const updatePaymentStatus = async (clientId, paidAmount, paymentStatus) => {
    if (!selectedCompany) return;
    
    try {
      const response = await fetch(
        `https://111-production-573e.up.railway.app/api/companies/${selectedCompany.id}/clients/${clientId}/payment`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paidAmount: paidAmount,
            paymentStatus: paymentStatus,
            paymentDate: new Date().toISOString().split('T')[0]
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update payment');
      }

      alert('Payment status updated successfully!');
      
      // Refresh Excel invoice data
      fetchExcelInvoiceData(selectedCompany.id, monthlyInvoiceData.month, monthlyInvoiceData.year);
      
      // Also refresh company clients if viewing them
      if (showClientDetails) {
        fetchCompanyClients(selectedCompany.id);
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Error updating payment: ' + error.message);
    }
  };

  const addCompany = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('https://111-production-573e.up.railway.app/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCompany),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add company');
      }

      const result = await response.json();
      setShowAddCompanyModal(false);
      setNewCompany({ name: '', contactPerson: '', email: '', phone: '' });
      alert('Company added successfully!');
      
      // Refresh companies list
      fetchCompanies();
    } catch (error) {
      console.error('Error adding company:', error);
      alert('Error adding company: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCompany = async () => {
    if (!editingCompany) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`https://111-production-573e.up.railway.app/api/companies/${editingCompany.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingCompany),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update company');
      }

      const result = await response.json();
      setShowEditCompanyModal(false);
      setEditingCompany(null);
      alert('Company updated successfully!');
      
      // Refresh companies list
      fetchCompanies();
    } catch (error) {
      console.error('Error updating company:', error);
      alert('Error updating company: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    
    try {
      const response = await fetch(`https://111-production-573e.up.railway.app/api/companies/${companyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete company');
      }

      alert('Company deleted successfully!');
      
      // Refresh companies list
      fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Error deleting company: ' + error.message);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Companies Management</h1>
        <Button onClick={() => setShowAddCompanyModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{company.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingCompany(company);
                      setShowEditCompanyModal(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCompany(company.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                {company.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                {company.phone || 'No phone'}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                {company.clientCount || 0} clients
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCompany(company);
                    fetchCompanyClients(company.id);
                    setShowClientDetails(true);
                  }}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  View Clients
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCompany(company);
                    setShowAddClientModal(true);
                  }}
                  className="flex items-center gap-1"
                >
                  <UserPlus className="h-3 w-3" />
                  Add Client
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCompany(company);
                    fetchExcelInvoiceData(company.id, monthlyInvoiceData.month, monthlyInvoiceData.year);
                  }}
                  className="flex items-center gap-1"
                >
                  <FileSpreadsheet className="h-3 w-3" />
                  Excel Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client Details Modal - SIMPLIFIED */}
      {showClientDetails && selectedCompany && (
        <Dialog open={showClientDetails} onOpenChange={setShowClientDetails}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {selectedCompany.name} - Clients
              </DialogTitle>
              <DialogDescription>
                Simplified client list for {selectedCompany.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {companyClients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No clients found for this company
                </div>
              ) : (
                <div className="grid gap-4">
                  {companyClients.map((client) => (
                    <Card key={client.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="font-semibold">
                            {client.firstName} {client.lastName}
                          </h3>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {client.email || 'No email'}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {client.phone || 'No phone'}
                            </div>
                            {client.createdAt && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {new Date(client.createdAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            ${safeToFixed(client.totalAmount)}
                          </div>
                          {client.paymentStatus && (
                            <Badge variant={client.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                              {client.paymentStatus}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button onClick={() => setShowClientDetails(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Excel Invoice Modal */}
      {showExcelInvoiceModal && excelInvoiceData && (
        <Dialog open={showExcelInvoiceModal} onOpenChange={setShowExcelInvoiceModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Excel-like Invoice - {excelInvoiceData.company.name}
              </DialogTitle>
              <DialogDescription>
                Monthly invoice for {excelInvoiceData.period.monthName} {excelInvoiceData.period.year}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Period Selection */}
              <div className="flex gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium mb-1">Month</label>
                  <select
                    value={monthlyInvoiceData.month}
                    onChange={(e) => setMonthlyInvoiceData({...monthlyInvoiceData, month: parseInt(e.target.value)})}
                    className="border rounded px-3 py-2"
                  >
                    {months.map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <input
                    type="number"
                    value={monthlyInvoiceData.year}
                    onChange={(e) => setMonthlyInvoiceData({...monthlyInvoiceData, year: parseInt(e.target.value)})}
                    className="border rounded px-3 py-2 w-24"
                    min="2020"
                    max="2030"
                  />
                </div>
                <Button
                  onClick={() => fetchExcelInvoiceData(selectedCompany.id, monthlyInvoiceData.month, monthlyInvoiceData.year)}
                  className="mt-6"
                >
                  Refresh
                </Button>
              </div>

              {/* Excel-like Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-green-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Client Name</th>
                      <th className="px-4 py-3 text-left">Arrival Date</th>
                      <th className="px-4 py-3 text-right">Amount (USD)</th>
                      <th className="px-4 py-3 text-right">Paid</th>
                      <th className="px-4 py-3 text-right">Due</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excelInvoiceData.clients.map((client, index) => (
                      <tr 
                        key={client.clientId} 
                        className={`border-b ${
                          client.paymentStatus === 'paid' ? 'bg-green-50' : 
                          client.paymentStatus === 'partial' ? 'bg-yellow-50' : 'bg-red-50'
                        }`}
                      >
                        <td className="px-4 py-3 font-medium">{client.clientName}</td>
                        <td className="px-4 py-3">
                          {client.arrivalDate ? new Date(client.arrivalDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          ${safeToFixed(client.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600 font-semibold">
                          ${safeToFixed(client.paidAmount)}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600 font-semibold">
                          ${safeToFixed(client.dueAmount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={
                            client.paymentStatus === 'paid' ? 'default' : 
                            client.paymentStatus === 'partial' ? 'secondary' : 'destructive'
                          }>
                            {client.paymentStatus}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newPaidAmount = prompt('Enter paid amount:', client.paidAmount);
                              if (newPaidAmount !== null) {
                                const amount = parseFloat(newPaidAmount);
                                if (!isNaN(amount)) {
                                  const status = amount >= client.totalAmount ? 'paid' : 
                                               amount > 0 ? 'partial' : 'pending';
                                  updatePaymentStatus(client.clientId, amount, status);
                                }
                              }
                            }}
                          >
                            <CreditCard className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Summary Row */}
                    <tr className="bg-blue-100 font-bold">
                      <td className="px-4 py-3">TOTALS</td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3 text-right">${safeToFixed(excelInvoiceData.summary.totalAmount)}</td>
                      <td className="px-4 py-3 text-right text-green-600">${safeToFixed(excelInvoiceData.summary.totalPaid)}</td>
                      <td className="px-4 py-3 text-right text-red-600">${safeToFixed(excelInvoiceData.summary.totalDue)}</td>
                      <td className="px-4 py-3 text-center">{excelInvoiceData.summary.clientCount} clients</td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={generateExcelInvoice} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Partner Invoice
                </Button>
                <Button onClick={generateMyCompanyInvoice} variant="outline" className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Download My Company Invoice
                </Button>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setShowExcelInvoiceModal(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Company Modal */}
      {showAddCompanyModal && (
        <Dialog open={showAddCompanyModal} onOpenChange={setShowAddCompanyModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
              <DialogDescription>
                Enter the company details below
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name *</label>
                <Input
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Person</label>
                <Input
                  value={newCompany.contactPerson}
                  onChange={(e) => setNewCompany({...newCompany, contactPerson: e.target.value})}
                  placeholder="Enter contact person name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  value={newCompany.email}
                  onChange={(e) => setNewCompany({...newCompany, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  value={newCompany.phone}
                  onChange={(e) => setNewCompany({...newCompany, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddCompanyModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={addCompany} 
                disabled={isSubmitting || !newCompany.name || !newCompany.email}
              >
                {isSubmitting ? 'Adding...' : 'Add Company'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Company Modal */}
      {showEditCompanyModal && editingCompany && (
        <Dialog open={showEditCompanyModal} onOpenChange={setShowEditCompanyModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Company</DialogTitle>
              <DialogDescription>
                Update the company details below
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name *</label>
                <Input
                  value={editingCompany.name}
                  onChange={(e) => setEditingCompany({...editingCompany, name: e.target.value})}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Person</label>
                <Input
                  value={editingCompany.contactPerson}
                  onChange={(e) => setEditingCompany({...editingCompany, contactPerson: e.target.value})}
                  placeholder="Enter contact person name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  value={editingCompany.email}
                  onChange={(e) => setEditingCompany({...editingCompany, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  value={editingCompany.phone || ''}
                  onChange={(e) => setEditingCompany({...editingCompany, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditCompanyModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={updateCompany} 
                disabled={isSubmitting || !editingCompany.name || !editingCompany.email}
              >
                {isSubmitting ? 'Updating...' : 'Update Company'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Client Modal */}
      {showAddClientModal && selectedCompany && (
        <Dialog open={showAddClientModal} onOpenChange={setShowAddClientModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Client to {selectedCompany.name}</DialogTitle>
              <DialogDescription>
                Add a new client directly to this company
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <Input
                    value={newClient.firstName}
                    onChange={(e) => setNewClient({...newClient, firstName: e.target.value})}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <Input
                    value={newClient.lastName}
                    onChange={(e) => setNewClient({...newClient, lastName: e.target.value})}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Amount *</label>
                <Input
                  type="number"
                  value={newClient.totalAmount}
                  onChange={(e) => setNewClient({...newClient, totalAmount: e.target.value})}
                  placeholder="Enter total amount"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Arrival Date</label>
                <Input
                  type="date"
                  value={newClient.arrivalDate}
                  onChange={(e) => setNewClient({...newClient, arrivalDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Service Name</label>
                <Input
                  value={newClient.serviceName}
                  onChange={(e) => setNewClient({...newClient, serviceName: e.target.value})}
                  placeholder="Enter service name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Input
                  value={newClient.notes}
                  onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                  placeholder="Enter any notes"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddClientModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={addClientToCompany} 
                disabled={isSubmitting || !newClient.firstName || !newClient.lastName || !newClient.totalAmount}
              >
                {isSubmitting ? 'Adding...' : 'Add Client'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

