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
                      setEditingCompany({...company});
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
                <Users className="h-4 w-4" />
                <span>{company.clientCount || 0} Müşteri</span>
                {company.bookingCount && (
                  <>
                    <span>•</span>
                    <span>{company.bookingCount} Rezervasyon</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{company.email}</span>
              </div>
              
              {company.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{company.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building className="h-4 w-4" />
                <span>{company.contactPerson}</span>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCompany(company);
                    fetchCompanyClients(company.id);
                    setShowClientDetails(true);
                  }}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Müşterileri Görüntüle
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCompany(company);
                    fetchExcelInvoiceData(company.id, monthlyInvoiceData.month, monthlyInvoiceData.year);
                  }}
                  className="flex-1"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                  Excel Faturası
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCompany(company);
                    setShowAddClientModal(true);
                  }}
                  className="flex-1"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Müşteri Ekle
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCompany(company);
                    generateExcelInvoice();
                  }}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-1" />
                  PDF İndir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Excel Invoice Modal - MAXIMIZED */}
      <Dialog open={showExcelInvoiceModal} onOpenChange={setShowExcelInvoiceModal}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] w-[98vw] h-[98vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Excel Faturası - {excelInvoiceData?.company?.name}</DialogTitle>
            <DialogDescription>
              {excelInvoiceData?.period && (
                <span>
                  {months.find(m => m.value === excelInvoiceData.period.month)?.label} {excelInvoiceData.period.year}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {excelInvoiceData && (
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium mb-1">Ay</label>
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
                  <label className="block text-sm font-medium mb-1">Yıl</label>
                  <Input
                    type="number"
                    value={monthlyInvoiceData.year}
                    onChange={(e) => setMonthlyInvoiceData({...monthlyInvoiceData, year: parseInt(e.target.value)})}
                    className="w-24"
                  />
                </div>
                <Button
                  onClick={() => fetchExcelInvoiceData(selectedCompany.id, monthlyInvoiceData.month, monthlyInvoiceData.year)}
                  className="mt-6"
                >
                  Verileri Güncelle
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto" style={{maxHeight: '70vh'}}>
                  <table className="w-full min-w-[1200px]">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 min-w-[200px]">Müşteri</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 min-w-[120px]">Varış Tarihi</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 min-w-[120px]">Toplam Tutar</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 min-w-[120px]">Ödenen Tutar</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 min-w-[120px]">Kalan Tutar</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 min-w-[120px]">Ödeme Durumu</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 min-w-[200px]">Hizmetler</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 min-w-[150px]">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {excelInvoiceData.clients.map((client) => (
                        <tr key={client.clientId} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium">{client.clientName}</p>
                              {client.email && <p className="text-sm text-gray-600">{client.email}</p>}
                              {client.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {client.arrivalDate ? new Date(client.arrivalDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            {safeToFixed(client.totalAmount)}
                          </td>
                          <td className="px-6 py-4">
                            <Input
                              type="number"
                              step="0.01"
                              value={client.paidAmount || 0}
                              onChange={(e) => {
                                const newAmount = parseFloat(e.target.value) || 0;
                                // Update local state immediately for UI responsiveness
                                if (excelInvoiceData && excelInvoiceData.clients) {
                                  const updatedClients = excelInvoiceData.clients.map(c => {
                                    if (c.clientId === client.clientId) {
                                      return {
                                        ...c,
                                        paidAmount: newAmount,
                                        dueAmount: c.totalAmount - newAmount
                                      };
                                    }
                                    return c;
                                  });
                                  
                                  setExcelInvoiceData({
                                    ...excelInvoiceData,
                                    clients: updatedClients
                                  });
                                }
                              }}
                              onBlur={(e) => {
                                const newAmount = parseFloat(e.target.value) || 0;
                                // Determine payment status based on amount
                                let status = 'pending';
                                if (newAmount >= client.totalAmount) {
                                  status = 'paid';
                                } else if (newAmount > 0) {
                                  status = 'partial';
                                }
                                updatePaymentStatus(client.clientId, newAmount, status);
                              }}
                              className="w-32"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-red-600">
                            {safeToFixed(client.dueAmount)}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={client.paymentStatus === 'paid' ? 'success' : client.paymentStatus === 'partial' ? 'warning' : 'destructive'}>
                              {client.paymentStatus}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="space-y-1">
                              <p>{client.serviceCount} hizmet</p>
                              {client.services && client.services.slice(0, 2).map((service, idx) => (
                                <p key={idx} className="text-xs text-gray-600">
                                  {service.serviceName} - {safeToFixed(service.amount)}
                                </p>
                              ))}
                              {client.services && client.services.length > 2 && (
                                <p className="text-xs text-gray-500">
                                  +{client.services.length - 2} daha fazla hizmet
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              size="sm"
                              onClick={() => updatePaymentStatus(client.clientId, client.totalAmount, 'paid')}
                            >
                              Ödendi Olarak İşaretle
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedCompany) {
                  generateExcelInvoice();
                }
              }}
            >
              Download PDF
            </Button>
            <Button
              onClick={() => {
                if (selectedCompany) {
                  generateMyCompanyInvoice();
                }
              }}
              variant="outline"
            >
              My Company Detailed Invoice
            </Button>
            <Button variant="outline" onClick={() => setShowExcelInvoiceModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Company Modal */}
      <Dialog open={showAddCompanyModal} onOpenChange={setShowAddCompanyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name *</label>
              <Input
                value={newCompany.name}
                onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                placeholder="Company Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Person *</label>
              <Input
                value={newCompany.contactPerson}
                onChange={(e) => setNewCompany({...newCompany, contactPerson: e.target.value})}
                placeholder="Contact Person Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <Input
                type="email"
                value={newCompany.email}
                onChange={(e) => setNewCompany({...newCompany, email: e.target.value})}
                placeholder="Email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                value={newCompany.phone}
                onChange={(e) => setNewCompany({...newCompany, phone: e.target.value})}
                placeholder="Phone Number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addCompany} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Company'}
            </Button>
            <Button variant="outline" onClick={() => setShowAddCompanyModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Company Modal */}
      <Dialog open={showEditCompanyModal} onOpenChange={setShowEditCompanyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          {editingCompany && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name *</label>
                <Input
                  value={editingCompany.name}
                  onChange={(e) => setEditingCompany({...editingCompany, name: e.target.value})}
                  placeholder="Company Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Person *</label>
                <Input
                  value={editingCompany.contactPerson}
                  onChange={(e) => setEditingCompany({...editingCompany, contactPerson: e.target.value})}
                  placeholder="Contact Person Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  value={editingCompany.email}
                  onChange={(e) => setEditingCompany({...editingCompany, email: e.target.value})}
                  placeholder="Email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  value={editingCompany.phone || ''}
                  onChange={(e) => setEditingCompany({...editingCompany, phone: e.target.value})}
                  placeholder="Phone Number"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={updateCompany} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Company'}
            </Button>
            <Button variant="outline" onClick={() => setShowEditCompanyModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Client Modal */}
      <Dialog open={showAddClientModal} onOpenChange={setShowAddClientModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Add a new client to {selectedCompany?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <Input
                  value={newClient.firstName}
                  onChange={(e) => setNewClient({...newClient, firstName: e.target.value})}
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <Input
                  value={newClient.lastName}
                  onChange={(e) => setNewClient({...newClient, lastName: e.target.value})}
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <Input
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                placeholder="Email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                value={newClient.phone}
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                placeholder="Phone Number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Amount</label>
              <Input
                type="number"
                step="0.01"
                value={newClient.totalAmount}
                onChange={(e) => setNewClient({...newClient, totalAmount: e.target.value})}
                placeholder="Total Amount"
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
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Input
                value={newClient.notes}
                onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                placeholder="Additional Notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addClientToCompany} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Client'}
            </Button>
            <Button variant="outline" onClick={() => setShowAddClientModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Details Modal */}
      <Dialog open={showClientDetails} onOpenChange={setShowClientDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Clients for {selectedCompany?.name}</DialogTitle>
          </DialogHeader>
          {companyClients && (
            <div className="space-y-4">
              {companyClients.clients && companyClients.clients.length > 0 ? (
                <div className="space-y-3">
                  {companyClients.clients.map((client) => (
                    <Card key={client.clientId}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{client.clientName}</h3>
                            <p className="text-sm text-gray-600">{client.email}</p>
                            <p className="text-sm font-medium mt-2">
                              Total Amount: {safeToFixed(client.totalAmount)}
                            </p>
                            {client.paidAmount !== undefined && (
                              <>
                                <p className="text-sm text-green-600">
                                  Paid Amount: {safeToFixed(client.paidAmount)}
                                </p>
                                <p className="text-sm text-red-600">
                                  Due Amount: {safeToFixed(client.dueAmount)}
                                </p>
                              </>
                            )}
                          </div>
                          <div className="text-left">
                            <Badge variant={client.paymentStatus === 'paid' ? 'success' : client.paymentStatus === 'partial' ? 'warning' : 'destructive'}>
                              {client.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No clients found for this company.</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClientDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

