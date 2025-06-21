import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Search,
  Download,
  Mail,
  FileText,
  Calendar,
  DollarSign,
  Building2,
  Users,
  Eye,
  AlertCircle,
  CheckCircle,
  Trash2
} from 'lucide-react';

export function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://111-production-573e.up.railway.app/api/invoices');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Failed to fetch invoices. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    try {
      setDeletingId(invoiceId);
      const response = await fetch(`https://111-production-573e.up.railway.app/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Remove the deleted invoice from the local state
      setInvoices(prevInvoices => prevInvoices.filter(invoice => invoice.id !== invoiceId));
      
      // Show success message
      alert('تم حذف الفاتورة بنجاح');
      
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('حدث خطأ أثناء حذف الفاتورة: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'generated': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'generated': return <CheckCircle className="h-4 w-4" />;
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type) => {
    return type === 'client' ? <Users className="h-4 w-4" /> : <Building2 className="h-4 w-4" />;
  };

  const handleDownload = (invoice) => {
    if (invoice.pdfPath) {
      window.open(`https://111-production-573e.up.railway.app/${invoice.pdfPath}`, '_blank');
    } else {
      alert('PDF not available for this invoice');
    }
  };

  const handleEmail = (invoice) => {
    // In a real app, this would send email via backend API
    console.log('Emailing invoice:', invoice.id);
    alert('Email functionality would be implemented here');
  };

  const handlePreview = (invoice) => {
    if (invoice.pdfPath) {
      window.open(`https://111-production-573e.up.railway.app/${invoice.pdfPath}`, '_blank');
    } else {
      alert('PDF not available for preview');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading invoices...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Manage client and company invoices</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Invoices</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchInvoices} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-600">Manage client and company invoices</p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={fetchInvoices} variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Generated Invoices ({filteredInvoices.length})
            </div>
            {invoices.length === 0 && (
              <div className="text-sm text-gray-500">
                No invoices found. Generate invoices from the Companies or Clients pages.
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Invoices Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? `No invoices match your search "${searchTerm}"`
                  : "You haven't generated any invoices yet."
                }
              </p>
              {!searchTerm && (
                <div className="text-sm text-gray-500">
                  <p>To generate invoices:</p>
                  <p>• Go to Companies page to generate monthly invoices</p>
                  <p>• Go to Clients page to generate individual client invoices</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        {getTypeIcon(invoice.type)}
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                          {invoice.type === 'client' ? 'Client' : 'Company'} Invoice
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(invoice.status)}
                        <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center min-w-0">
                        <Users className="mr-1 h-3 w-3 flex-shrink-0" />
                        <span className="font-medium truncate" title={invoice.client}>{invoice.client}</span>
                      </div>
                      <div className="flex items-center min-w-0">
                        <FileText className="mr-1 h-3 w-3 flex-shrink-0" />
                        <span className="truncate" title={invoice.service}>{invoice.service}</span>
                      </div>
                      <div className="flex items-center min-w-0">
                        <Calendar className="mr-1 h-3 w-3 flex-shrink-0" />
                        <span className="whitespace-nowrap">{invoice.date}</span>
                      </div>
                      <div className="flex items-center font-medium text-green-600 min-w-0">
                        <DollarSign className="mr-1 h-3 w-3 flex-shrink-0" />
                        <span className="whitespace-nowrap">${invoice.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(invoice)}
                      title="Preview"
                      disabled={!invoice.pdfPath}
                      className="p-2"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(invoice)}
                      disabled={!invoice.pdfPath}
                      title="Download PDF"
                      className="p-2"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEmail(invoice)}
                      disabled={!invoice.pdfPath || invoice.type !== 'client'}
                      title="Email to Client"
                      className="p-2"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      disabled={deletingId === invoice.id}
                      title="Delete Invoice"
                      className="p-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                    >
                      {deletingId === invoice.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

