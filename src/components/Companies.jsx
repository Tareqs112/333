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
  Save
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';

export function Companies() {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyClients, setCompanyClients] = useState([]);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false); // New state for edit modal
  const [newCompany, setNewCompany] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: ''
  });
  const [editingCompany, setEditingCompany] = useState(null); // New state for editing company
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [monthlyInvoiceData, setMonthlyInvoiceData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    invoiceType: 'partner_company'
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('https://111-production-573e.up.railway.app/api/companies');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchCompanyClients = async (companyId, month = null, year = null) => {
    try {
      let url = `https://111-production-573e.up.railway.app/api/companies/${companyId}/clients/detailed`;
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
    }
  };

  const generateMonthlyInvoice = async (companyId) => {
    try {
      const response = await fetch('https://111-production-573e.up.railway.app/api/invoices/monthly/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: companyId,
          month: monthlyInvoiceData.month,
          year: monthlyInvoiceData.year,
          invoiceType: monthlyInvoiceData.invoiceType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate monthly invoice');
      }

      const data = await response.json();
      alert(`Monthly invoice generated successfully! Invoice ID: ${data.id}`);
      
      // Optionally download the PDF immediately
      if (data.pdfPath) {
        window.open(`https://111-production-573e.up.railway.app/${data.pdfPath}`, '_blank');
      }
    } catch (error) {
      console.error('Error generating monthly invoice:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleAddCompany = () => {
    setShowAddCompanyModal(true);
  };

  const handleCloseAddCompanyModal = () => {
    setShowAddCompanyModal(false);
    setNewCompany({
      name: '',
      contactPerson: '',
      email: '',
      phone: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCompany(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitNewCompany = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newCompany.name || !newCompany.contactPerson || !newCompany.email) {
      alert('Please fill in all required fields (Company Name, Contact Person, and Email)');
      return;
    }

    // Validate email format
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(newCompany.email)) {
      alert('Please enter a valid email address');
      return;
    }

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

      const addedCompany = await response.json();
      
      // Add the new company to the list
      setCompanies(prev => [...prev, addedCompany]);
      
      // Close modal and reset form
      handleCloseAddCompanyModal();
      
      alert('Company added successfully!');
    } catch (error) {
      console.error('Error adding company:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      try {
        const response = await fetch(`https://111-production-573e.up.railway.app/api/companies/${companyId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete company');
        }

        setCompanies(companies.filter(company => company.id !== companyId));
        alert('Company deleted successfully!');
      } catch (error) {
        console.error('Error deleting company:', error);
        alert(`Error deleting company: ${error.message}`);
      }
    }
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setShowEditCompanyModal(true);
  };

  const handleCloseEditCompanyModal = () => {
    setShowEditCompanyModal(false);
    setEditingCompany(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingCompany(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    
    if (!editingCompany.name || !editingCompany.contactPerson || !editingCompany.email) {
      alert('Please fill in all required fields (Company Name, Contact Person, and Email)');
      return;
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(editingCompany.email)) {
      alert('Please enter a valid email address');
      return;
    }

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

      const updatedCompany = await response.json();
      setCompanies(prev => prev.map(comp => (comp.id === updatedCompany.id ? updatedCompany : comp)));
      handleCloseEditCompanyModal();
      alert('Company updated successfully!');
    } catch (error) {
      console.error('Error updating company:', error);
      alert(`Error updating company: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCompanyClick = async (company) => {
    setSelectedCompany(company);
    setShowClientDetails(true);
    await fetchCompanyClients(company.id, monthlyInvoiceData.month, monthlyInvoiceData.year);
  };

  const handleCloseDetails = () => {
    setShowClientDetails(false);
    setSelectedCompany(null);
    setCompanyClients([]);
  };

  const handleMonthYearChange = async () => {
    if (selectedCompany) {
      await fetchCompanyClients(selectedCompany.id, monthlyInvoiceData.month, monthlyInvoiceData.year);
    }
  };

  const getMonthName = (month) => {
    const months = [
       "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1];
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
        <p className="text-gray-600">Manage partner companies and generate monthly invoices</p>
      </div>

      {!showClientDetails ? (
        <>
          {/* Search and Add */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAddCompany}>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building2 className="mr-2 h-5 w-5" />
                      {company.name}
                    </div>
                    <Badge variant="secondary">{company.clientCount} clients</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      {company.contactPerson}
                    </div>
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      {company.email}
                    </div>
                    {company.phone && (
                      <div className="flex items-center">
                        <Phone className="mr-2 h-4 w-4" />
                        {company.phone}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompanyClick(company)}
                      className="flex-1"
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      View Clients
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditCompany(company)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCompany(company.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        /* Company Client Details View */
        <div className="space-y-6">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleCloseDetails}>
                <ChevronUp className="mr-2 h-4 w-4" />
                Back to Companies
              </Button>
              <div>
                <h2 className="text-2xl font-bold">{selectedCompany?.name}</h2>
                <p className="text-gray-600">Client Details & Monthly Invoicing</p>
              </div>
            </div>
          </div>

          {/* Month/Year Selection and Invoice Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Monthly Invoice Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium mb-2">Month</label>
                  <select
                    value={monthlyInvoiceData.month}
                    onChange={(e) => {
                      setMonthlyInvoiceData(prev => ({ ...prev, month: parseInt(e.target.value) }));
                    }}
                    className="w-full p-2 border rounded-md"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {getMonthName(i + 1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Year</label>
                  <select
                    value={monthlyInvoiceData.year}
                    onChange={(e) => {
                      setMonthlyInvoiceData(prev => ({ ...prev, year: parseInt(e.target.value) }));
                    }}
                    className="w-full p-2 border rounded-md"
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Invoice Type</label>
                  <select
                    value={monthlyInvoiceData.invoiceType}
                    onChange={(e) => {
                      setMonthlyInvoiceData(prev => ({ ...prev, invoiceType: e.target.value }));
                    }}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="partner_company">Partner Company Invoice</option>
                    <option value="my_company">My Company Invoice (with costs)</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleMonthYearChange} variant="outline">
                    <Search className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button onClick={() => generateMonthlyInvoice(selectedCompany.id)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Invoice
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Summary */}
          {companyClients.company && (
            <Card>
              <CardHeader>
                <CardTitle>Company Summary for {getMonthName(monthlyInvoiceData.month)} {monthlyInvoiceData.year}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{companyClients.clients?.length || 0}</div>
                    <div className="text-sm text-gray-600">Total Clients</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${companyClients.totalRevenue?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {companyClients.clients?.reduce((sum, client) => sum + client.services.length, 0) || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Services</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Client Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Client Details ({companyClients.clients?.length || 0} clients)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companyClients.clients?.map((client) => (
                  <div key={client.clientId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{client.clientName}</h4>
                        <p className="text-sm text-gray-500">
                          Arrival: {new Date(client.arrivalDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ${client.totalSellingPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Company Modal */}
      {showAddCompanyModal && (
        <Dialog open={showAddCompanyModal} onOpenChange={setShowAddCompanyModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
              <DialogDescription>Fill in the details for the new company.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitNewCompany} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">Company Name</label>
                <Input id="name" name="name" value={newCompany.name} onChange={handleInputChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="contactPerson" className="text-right">Contact Person</label>
                <Input id="contactPerson" name="contactPerson" value={newCompany.contactPerson} onChange={handleInputChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right">Email</label>
                <Input id="email" name="email" type="email" value={newCompany.email} onChange={handleInputChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="phone" className="text-right">Phone</label>
                <Input id="phone" name="phone" type="tel" value={newCompany.phone} onChange={handleInputChange} className="col-span-3" />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Company'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Company Modal */}
      {showEditCompanyModal && editingCompany && (
        <Dialog open={showEditCompanyModal} onOpenChange={setShowEditCompanyModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Company</DialogTitle>
              <DialogDescription>Update the details for {editingCompany.name}.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateCompany} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="editName" className="text-right">Company Name</label>
                <Input id="editName" name="name" value={editingCompany.name} onChange={handleEditInputChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="editContactPerson" className="text-right">Contact Person</label>
                <Input id="editContactPerson" name="contactPerson" value={editingCompany.contactPerson} onChange={handleEditInputChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="editEmail" className="text-right">Email</label>
                <Input id="editEmail" name="email" type="email" value={editingCompany.email} onChange={handleEditInputChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="editPhone" className="text-right">Phone</label>
                <Input id="editPhone" name="phone" type="tel" value={editingCompany.phone} onChange={handleEditInputChange} className="col-span-3" />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Company'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

