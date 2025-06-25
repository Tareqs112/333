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
  const fetchExcelInvoiceData = async (companyId, month, year, showModal = true) => {
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
      if (showModal) {
        setShowExcelInvoiceModal(true);
      }
    } catch (error) {
      console.error('Error fetching Excel invoice data:', error);
      if (showModal) {
        alert('Error fetching invoice data: ' + error.message + '\n\nPlease check:\n1. Server is running\n2. Company has clients with bookings\n3. Check browser console for details');
      }
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
      
      alert('invoice generated successfully!');
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

  // FIXED: Update payment status with proper state updates and PDF refresh
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

      const result = await response.json();
      alert('Ödeme durumu başarıyla güncellendi! Fatura da güncellenecek.');
      
      // Update local state immediately
      if (excelInvoiceData && excelInvoiceData.clients) {
        const updatedClients = excelInvoiceData.clients.map(client => {
          if (client.clientId === clientId) {
            return {
              ...client,
              paidAmount: paidAmount,
              paymentStatus: paymentStatus,
              dueAmount: client.totalAmount - paidAmount
            };
          }
          return client;
        });
        
        setExcelInvoiceData({
          ...excelInvoiceData,
          clients: updatedClients
        });
      }
      
      // Force refresh Excel invoice data from server to ensure PDF will be updated
      setTimeout(() => {
        fetchExcelInvoiceData(selectedCompany.id, monthlyInvoiceData.month, monthlyInvoiceData.year, false);
      }, 1000);
      
      // Also refresh company clients if viewing them
      if (showClientDetails) {
        fetchCompanyClients(selectedCompany.id);
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Ödeme güncellenirken hata: ' + error.message);
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
    { value: 1, label: 'Ocak' }, { value: 2, label: 'Şubat' }, { value: 3, label: 'Mart' },
    { value: 4, label: 'Nisan' }, { value: 5, label: 'Mayıs' }, { value: 6, label: 'Haziran' },
    { value: 7, label: 'Temmuz' }, { value: 8, label: 'Ağustos' }, { value: 9, label: 'Eylül' },
    { value: 10, label: 'Ekim' }, { value: 11, label: 'Kasım' }, { value: 12, label: 'Aralık' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Şirket Yönetimi</h1>
        <Button onClick={() => setShowAddCompanyModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Şirket Ekle
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Şirket ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Companies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map(company => (
          <Card key={company.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gray-600" /> {company.name}
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={() => {
                  setEditingCompany(company);
                  setShowEditCompanyModal(true);
                }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteCompany(company.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-500 flex items-center gap-2"><Users className="h-4 w-4" /> {company.contactPerson}</p>
              <p className="text-sm text-gray-500 flex items-center gap-2"><Mail className="h-4 w-4" /> {company.email}</p>
              <p className="text-sm text-gray-500 flex items-center gap-2"><Phone className="h-4 w-4" /> {company.phone}</p>
              <p className="text-sm text-gray-500 flex items-center gap-2"><UserPlus className="h-4 w-4" /> Clients: {company.clientCount}</p>
              <div className="flex flex-wrap gap-2 pt-2">
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
                  <Eye className="h-4 w-4" /> View Clients
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
                  <UserPlus className="h-4 w-4" /> Add Client
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
                  <FileSpreadsheet className="h-4 w-4" /> Monthly Invoice
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCompany(company);
                    generateMyCompanyInvoice();
                  }}
                  className="flex items-center gap-1"
                >
                  <Receipt className="h-4 w-4" /> My Company Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Company Modal */}
      <Dialog open={showAddCompanyModal} onOpenChange={setShowAddCompanyModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
            <DialogDescription>Enter the details for the new company.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Company Name"
              value={newCompany.name}
              onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
            />
            <Input
              placeholder="Contact Person"
              value={newCompany.contactPerson}
              onChange={(e) => setNewCompany({ ...newCompany, contactPerson: e.target.value })}
            />
            <Input
              placeholder="Email"
              type="email"
              value={newCompany.email}
              onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
            />
            <Input
              placeholder="Phone"
              type="tel"
              value={newCompany.phone}
              onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button onClick={addCompany} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Company Modal */}
      <Dialog open={showEditCompanyModal} onOpenChange={setShowEditCompanyModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>Update the details for the company.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Company Name"
              value={editingCompany?.name || ''}
              onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
            />
            <Input
              placeholder="Contact Person"
              value={editingCompany?.contactPerson || ''}
              onChange={(e) => setEditingCompany({ ...editingCompany, contactPerson: e.target.value })}
            />
            <Input
              placeholder="Email"
              type="email"
              value={editingCompany?.email || ''}
              onChange={(e) => setEditingCompany({ ...editingCompany, email: e.target.value })}
            />
            <Input
              placeholder="Phone"
              type="tel"
              value={editingCompany?.phone || ''}
              onChange={(e) => setEditingCompany({ ...editingCompany, phone: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button onClick={updateCompany} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Client Modal */}
      <Dialog open={showAddClientModal} onOpenChange={setShowAddClientModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Client to {selectedCompany?.name}</DialogTitle>
            <DialogDescription>Enter the details for the new client.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="First Name"
              value={newClient.firstName}
              onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })}
            />
            <Input
              placeholder="Last Name"
              value={newClient.lastName}
              onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })}
            />
            <Input
              placeholder="Email"
              type="email"
              value={newClient.email}
              onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
            />
            <Input
              placeholder="Phone"
              type="tel"
              value={newClient.phone}
              onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
            />
            <Input
              placeholder="Total Amount"
              type="number"
              value={newClient.totalAmount}
              onChange={(e) => setNewClient({ ...newClient, totalAmount: e.target.value })}
            />
            <Input
              placeholder="Arrival Date (YYYY-MM-DD)"
              type="date"
              value={newClient.arrivalDate}
              onChange={(e) => setNewClient({ ...newClient, arrivalDate: e.target.value })}
            />
            <Input
              placeholder="Service Name"
              value={newClient.serviceName}
              onChange={(e) => setNewClient({ ...newClient, serviceName: e.target.value })}
            />
            <Input
              placeholder="Notes"
              value={newClient.notes}
              onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button onClick={addClientToCompany} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excel Invoice Modal */}
      <Dialog open={showExcelInvoiceModal} onOpenChange={setShowExcelInvoiceModal}>
        <DialogContent className="sm:max-w-[900px] lg:max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Monthly Invoice for {excelInvoiceData?.company?.name} ({monthlyInvoiceData.month}/{monthlyInvoiceData.year})</DialogTitle>
            <DialogDescription>Overview of client payments for the selected month.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2 mb-4">
              <label htmlFor="month-select" className="font-medium">Month:</label>
              <select
                id="month-select"
                value={monthlyInvoiceData.month}
                onChange={(e) => setMonthlyInvoiceData({ ...monthlyInvoiceData, month: parseInt(e.target.value) })}
                className="p-2 border rounded-md"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <label htmlFor="year-input" className="font-medium">Year:</label>
              <Input
                id="year-input"
                type="number"
                value={monthlyInvoiceData.year}
                onChange={(e) => setMonthlyInvoiceData({ ...monthlyInvoiceData, year: parseInt(e.target.value) })}
                className="w-24 p-2 border rounded-md"
              />
              <Button
                onClick={() => fetchExcelInvoiceData(selectedCompany.id, monthlyInvoiceData.month, monthlyInvoiceData.year)}
              >
                Apply Filter
              </Button>
              <Button
                onClick={generateExcelInvoice}
                className="flex items-center gap-1 ml-auto"
              >
                <Download className="h-4 w-4" /> Generate PDF
              </Button>
            </div>

            {excelInvoiceData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg font-semibold">
                  <Card className="p-4">
                    <CardTitle className="text-md">Total Amount Due</CardTitle>
                    <CardContent className="text-2xl">{safeToFixed(excelInvoiceData.summary.totalAmount)}</CardContent>
                  </Card>
                  <Card className="p-4">
                    <CardTitle className="text-md">Total Paid</CardTitle>
                    <CardContent className="text-2xl">{safeToFixed(excelInvoiceData.summary.totalPaid)}</CardContent>
                  </Card>
                  <Card className="p-4">
                    <CardTitle className="text-md">Total Remaining Due</CardTitle>
                    <CardContent className="text-2xl">{safeToFixed(excelInvoiceData.summary.totalDue)}</CardContent>
                  </Card>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {excelInvoiceData.clients.length > 0 ? (
                        excelInvoiceData.clients.map(client => (
                          <tr key={client.clientId}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.clientName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.arrivalDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{safeToFixed(client.totalAmount)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Input
                                type="number"
                                value={client.paidAmount}
                                onChange={(e) => {
                                  const newPaidAmount = parseFloat(e.target.value);
                                  const updatedClients = excelInvoiceData.clients.map(c =>
                                    c.clientId === client.clientId ? { ...c, paidAmount: newPaidAmount } : c
                                  );
                                  setExcelInvoiceData({ ...excelInvoiceData, clients: updatedClients });
                                }}
                                className="w-24"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{safeToFixed(client.totalAmount - client.paidAmount)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <select
                                value={client.paymentStatus}
                                onChange={(e) => {
                                  const newPaymentStatus = e.target.value;
                                  const updatedClients = excelInvoiceData.clients.map(c =>
                                    c.clientId === client.clientId ? { ...c, paymentStatus: newPaymentStatus } : c
                                  );
                                  setExcelInvoiceData({ ...excelInvoiceData, clients: updatedClients });
                                }}
                                className="p-2 border rounded-md"
                              >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="overdue">Overdue</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button
                                onClick={() => updatePaymentStatus(client.clientId, client.paidAmount, client.paymentStatus)}
                                className="flex items-center gap-1"
                              >
                                <Save className="h-4 w-4" /> Save
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            No client data available for this period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p>Loading invoice data...</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowExcelInvoiceModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Details Modal */}
      <Dialog open={showClientDetails} onOpenChange={setShowClientDetails}>
        <DialogContent className="sm:max-w-[900px] lg:max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Clients for {selectedCompany?.name}</DialogTitle>
            <DialogDescription>Detailed list of clients and their services.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {companyClients.length > 0 ? (
              companyClients.map(client => (
                <Card key={client.clientId} className="mb-4">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> {client.clientName}</span>
                      <div className="flex gap-2">
                        <Badge variant="secondary">Total: {safeToFixed(client.totalAmount)}</Badge>
                        <Badge variant="outline" className="text-green-600">Paid: {safeToFixed(client.paidAmount || 0)}</Badge>
                        <Badge variant="outline" className="text-red-600">Due: {safeToFixed(client.dueAmount || client.totalAmount)}</Badge>
                      </div>
                    </CardTitle>
                    <p className="text-sm text-gray-500 flex items-center gap-2"><Mail className="h-4 w-4" /> {client.email}</p>
                    {client.arrivalDate && (
                      <p className="text-sm text-gray-500 flex items-center gap-2"><Calendar className="h-4 w-4" /> Arrival Date: {client.arrivalDate}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> 
                        Payment Status: 
                        <Badge variant={client.paymentStatus === 'paid' ? 'default' : client.paymentStatus === 'overdue' ? 'destructive' : 'secondary'}>
                          {client.paymentStatus || 'pending'}
                        </Badge>
                      </p>
                      {client.paymentDate && (
                        <p className="text-sm text-gray-500">Payment Date: {client.paymentDate}</p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold mb-2">Services:</h4>
                    {client.services && client.services.length > 0 ? (
                      <div className="space-y-2">
                        {client.services.map((service, index) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-3 py-1">
                            <p className="font-medium">{service.serviceName} ({service.serviceType})</p>
                            <p className="text-sm text-gray-600">Date: {service.startDate}</p>
                            <p className="text-sm text-gray-600">Price: {safeToFixed(service.totalSellingPrice)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No services found for this client.</p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-gray-500">No clients found for this company.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowClientDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

