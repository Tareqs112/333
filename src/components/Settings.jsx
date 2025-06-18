import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Settings as SettingsIcon, 
  TestTube, 
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Save,
  RefreshCw
} from 'lucide-react';

const Settings = () => {
  // Meta WhatsApp Settings State
  const [metaSettings, setMetaSettings] = useState({
    access_token: '',
    phone_number_id: '',
    app_id: '',
    app_secret: '',
    webhook_verify_token: '',
    api_version: 'v18.0'
  });

  // Admin Phone Numbers State
  const [adminPhones, setAdminPhones] = useState(['']);

  // Email Settings State
  const [emailSettings, setEmailSettings] = useState({
    smtp_server: '',
    smtp_port: '587',
    username: '',
    password: ''
  });

  // UI State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [configStatus, setConfigStatus] = useState({
    meta_whatsapp: false,
    email: false
  });

  // Test State
  const [testPhone, setTestPhone] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Load Meta WhatsApp settings
      const metaResponse = await fetch("https://111-production-573e.up.railway.app/settings/meta-whatsapp" );
      if (metaResponse.ok) {
        const metaData = await metaResponse.json();
        setMetaSettings(prev => ({
          ...prev,
          phone_number_id: metaData.phone_number_id || '',
          app_id: metaData.app_id || '',
          webhook_verify_token: metaData.webhook_verify_token || ''
        }));
        setConfigStatus(prev => ({ ...prev, meta_whatsapp: metaData.configured }));
      }

      // Load admin phone numbers
      const adminResponse = await fetch('https://111-production-573e.up.railway.app/settings/admin-phones');
      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        setAdminPhones(adminData.admin_phone_numbers.length > 0 ? adminData.admin_phone_numbers : ['']);
      }

      // Load email settings
      const emailResponse = await fetch('https://111-production-573e.up.railway.app/settings/email');
      if (emailResponse.ok) {
        const emailData = await emailResponse.json();
        setEmailSettings({
          smtp_server: emailData.smtp_server || '',
          smtp_port: emailData.smtp_port || '587',
          username: emailData.username || '',
          password: '' // Never load password for security
        });
        setConfigStatus(prev => ({ ...prev, email: emailData.configured }));
      }

    } catch (error) {
      setMessage({ type: 'error', text: 'Ayarlar yüklenirken hata oluştu: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const saveMetaSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://111-production-573e.up.railway.app/settings/meta-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metaSettings)
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setConfigStatus(prev => ({ ...prev, meta_whatsapp: true }));
      } else {
        setMessage({ type: 'error', text: data.error || 'Ayarlar kaydedilirken hata oluştu' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bağlantı hatası: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const saveAdminPhones = async () => {
    setLoading(true);
    try {
      const cleanPhones = adminPhones.filter(phone => phone.trim() !== '');
      
      const response = await fetch('https://111-production-573e.up.railway.app/settings/admin-phones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_numbers: cleanPhones })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.error || 'Telefon numaraları kaydedilirken hata oluştu' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bağlantı hatası: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const saveEmailSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://111-production-573e.up.railway.app/settings/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailSettings)
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setConfigStatus(prev => ({ ...prev, email: true }));
      } else {
        setMessage({ type: 'error', text: data.error || 'E-posta ayarları kaydedilirken hata oluştu' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bağlantı hatası: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const testMetaWhatsApp = async () => {
    if (!testPhone.trim()) {
      setMessage({ type: 'error', text: 'Test için telefon numarası gerekli' });
      return;
    }

    setTestLoading(true);
    try {
      const response = await fetch('https://111-production-573e.up.railway.app/settings/test-meta-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_phone: testPhone })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Test mesajı başarıyla gönderildi!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Test mesajı gönderilemedi' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Test sırasında hata oluştu: ' + error.message });
    } finally {
      setTestLoading(false);
    }
  };

  const testTurkishTemplate = async (recipientType) => {
    setTestLoading(true);
    try {
      const requestBody = { recipient_type: recipientType };
      if (recipientType === 'driver' && testPhone.trim()) {
        requestBody.test_phone = testPhone;
      }

      const response = await fetch('https://111-production-573e.up.railway.app/settings/test-turkish-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage({ type: 'success', text: `Türkçe ${recipientType} şablonu başarıyla test edildi!` });
      } else {
        setMessage({ type: 'error', text: data.message || 'Şablon testi başarısız' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Şablon testi sırasında hata oluştu: ' + error.message });
    } finally {
      setTestLoading(false);
    }
  };

  const addPhoneField = () => {
    setAdminPhones([...adminPhones, '']);
  };

  const removePhoneField = (index) => {
    const newPhones = adminPhones.filter((_, i) => i !== index);
    setAdminPhones(newPhones.length > 0 ? newPhones : ['']);
  };

  const updatePhoneField = (index, value) => {
    const newPhones = [...adminPhones];
    newPhones[index] = value;
    setAdminPhones(newPhones);
  };

  const StatusBadge = ({ status, label }) => (
    <Badge variant={status ? "default" : "secondary"} className="ml-2">
      {status ? (
        <>
          <CheckCircle className="w-3 h-3 mr-1" />
          Yapılandırıldı
        </>
      ) : (
        <>
          <XCircle className="w-3 h-3 mr-1" />
          Yapılandırılmadı
        </>
      )}
    </Badge>
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="w-8 h-8" />
          Sistem Ayarları
        </h1>
        <p className="text-muted-foreground mt-2">
          Meta WhatsApp Business API ve bildirim ayarlarını yönetin
        </p>
      </div>

      {message.text && (
        <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
          {message.type === 'error' ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="meta-whatsapp" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="meta-whatsapp" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Meta WhatsApp
          </TabsTrigger>
          <TabsTrigger value="admin-phones" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Yönetici Telefonları
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            E-posta
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Test
          </TabsTrigger>
        </TabsList>

        {/* Meta WhatsApp Settings */}
        <TabsContent value="meta-whatsapp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Meta WhatsApp Business API Ayarları
                </span>
                <StatusBadge status={configStatus.meta_whatsapp} />
              </CardTitle>
              <CardDescription>
                Meta WhatsApp Business API ile doğrudan entegrasyon için gerekli bilgileri girin.
                Bu ayarlar Twilio yerine Meta'nın resmi API'sini kullanmanızı sağlar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="access_token">Access Token *</Label>
                  <Input
                    id="access_token"
                    type="password"
                    placeholder="EAAxxxxxxxxxxxxxxx..."
                    value={metaSettings.access_token}
                    onChange={(e) => setMetaSettings(prev => ({ ...prev, access_token: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Meta Developer Console'dan alınan erişim token'ı
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number_id">Phone Number ID *</Label>
                  <Input
                    id="phone_number_id"
                    placeholder="123456789012345"
                    value={metaSettings.phone_number_id}
                    onChange={(e) => setMetaSettings(prev => ({ ...prev, phone_number_id: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    WhatsApp Business hesabınızın telefon numarası ID'si
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="app_id">App ID *</Label>
                  <Input
                    id="app_id"
                    placeholder="123456789012345"
                    value={metaSettings.app_id}
                    onChange={(e) => setMetaSettings(prev => ({ ...prev, app_id: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Meta Developer Console'daki uygulama ID'si
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="app_secret">App Secret *</Label>
                  <Input
                    id="app_secret"
                    type="password"
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={metaSettings.app_secret}
                    onChange={(e) => setMetaSettings(prev => ({ ...prev, app_secret: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Webhook doğrulama için uygulama gizli anahtarı
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook_verify_token">Webhook Verify Token</Label>
                  <Input
                    id="webhook_verify_token"
                    placeholder="my_webhook_verify_token"
                    value={metaSettings.webhook_verify_token}
                    onChange={(e) => setMetaSettings(prev => ({ ...prev, webhook_verify_token: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Webhook doğrulama için özel token (isteğe bağlı)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_version">API Version</Label>
                  <Input
                    id="api_version"
                    placeholder="v18.0"
                    value={metaSettings.api_version}
                    onChange={(e) => setMetaSettings(prev => ({ ...prev, api_version: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Kullanılacak Meta Graph API versiyonu
                  </p>
                </div>
              </div>

              <Separator />

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-900">Kurulum Talimatları</h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Meta Developer Console'a gidin ve bir Business App oluşturun</li>
                      <li>WhatsApp ürününü uygulamanıza ekleyin</li>
                      <li>Business Portfolio oluşturun veya mevcut olanı bağlayın</li>
                      <li>Access Token oluşturun ve yukarıdaki alana girin</li>
                      <li>Phone Number ID'yi WhatsApp API Setup sayfasından alın</li>
                      <li>Webhook URL'ini sisteminizin /notifications/webhook endpoint'ine ayarlayın</li>
                    </ol>
                  </div>
                </div>
              </div>

              <Button 
                onClick={saveMetaSettings} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Meta WhatsApp Ayarlarını Kaydet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Phone Numbers */}
        <TabsContent value="admin-phones">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Yönetici Telefon Numaraları
              </CardTitle>
              <CardDescription>
                Bildirim alacak yönetici telefon numaralarını ekleyin. 
                Bu numaralara müşteri varışları ve önemli güncellemeler gönderilecek.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {adminPhones.map((phone, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="+90555123456"
                    value={phone}
                    onChange={(e) => updatePhoneField(index, e.target.value)}
                    className="flex-1"
                  />
                  {adminPhones.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removePhoneField(index)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={addPhoneField}>
                  Telefon Numarası Ekle
                </Button>
                <Button onClick={saveAdminPhones} disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Kaydet
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Önemli Not</h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      Telefon numaralarını uluslararası format ile girin (+90 ile başlayarak).
                      Bu numaralar WhatsApp Business API üzerinden bildirim alacak.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  E-posta Ayarları
                </span>
                <StatusBadge status={configStatus.email} />
              </CardTitle>
              <CardDescription>
                Şirket bildirimleri ve raporlar için e-posta ayarlarını yapılandırın.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_server">SMTP Sunucusu *</Label>
                  <Input
                    id="smtp_server"
                    placeholder="smtp.gmail.com"
                    value={emailSettings.smtp_server}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_server: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_port">SMTP Port *</Label>
                  <Input
                    id="smtp_port"
                    placeholder="587"
                    value={emailSettings.smtp_port}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_port: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email_username">E-posta Adresi *</Label>
                  <Input
                    id="email_username"
                    type="email"
                    placeholder="your-email@company.com"
                    value={emailSettings.username}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email_password">E-posta Şifresi *</Label>
                  <Input
                    id="email_password"
                    type="password"
                    placeholder="••••••••"
                    value={emailSettings.password}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={saveEmailSettings} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    E-posta Ayarlarını Kaydet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Settings */}
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Test ve Doğrulama
              </CardTitle>
              <CardDescription>
                Bildirim sistemini test edin ve ayarlarınızın doğru çalıştığından emin olun.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test_phone">Test Telefon Numarası</Label>
                  <Input
                    id="test_phone"
                    placeholder="+90555123456"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Test mesajlarının gönderileceği telefon numarası
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Meta WhatsApp API Testi</h4>
                  <Button 
                    onClick={testMetaWhatsApp} 
                    disabled={testLoading || !testPhone.trim()}
                    variant="outline"
                    className="w-full"
                  >
                    {testLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Test Mesajı Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Meta WhatsApp API Test Et
                      </>
                    )}
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Türkçe Şablon Testleri</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Button 
                      onClick={() => testTurkishTemplate('admin')} 
                      disabled={testLoading}
                      variant="outline"
                    >
                      {testLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4 mr-2" />
                      )}
                      Yönetici Şablonu Test Et
                    </Button>
                    
                    <Button 
                      onClick={() => testTurkishTemplate('driver')} 
                      disabled={testLoading || !testPhone.trim()}
                      variant="outline"
                    >
                      {testLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Phone className="w-4 h-4 mr-2" />
                      )}
                      Şoför Şablonu Test Et
                    </Button>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Test Başarı Kriterleri</h4>
                      <ul className="text-sm text-green-800 mt-1 space-y-1">
                        <li>• Test mesajı belirtilen telefon numarasına ulaşmalı</li>
                        <li>• Mesaj Türkçe karakterler ile doğru görüntülenmeli</li>
                        <li>• Emoji ve formatlamalar düzgün çalışmalı</li>
                        <li>• Sistem başarı mesajı göstermeli</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

