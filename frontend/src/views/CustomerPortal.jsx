import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  MessageSquare, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  ShoppingBag,
  Laptop,
  Zap,
  Smartphone,
  Headphones,
  Monitor,
  Package,
  AlertTriangle,
  RotateCcw,
  Wrench,
  ShieldAlert,
  Send,
  X,
  Sparkles,
  ChevronRight,
  Check,
  User,
  Users,
  Camera,
  Image as ImageIcon,
  Key,
  Mail,
  Shield,
  Upload,
  RefreshCw,
  Eye,
  Info,
  Database
} from 'lucide-react';
import { 
  trackComplaint, 
  fetchRecentPublicComplaints, 
  submitComplaint, 
  fetchCustomerComplaints, 
  customerReplyTicket, 
  customerCloseTicket,
  syncCustomerPurchases,
  fetchCustomerHistory,
  logCustomerActivity
} from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';

// -------------------------------------------------------------
// 8 PRE-SEEDED REALISTIC CUSTOMER ACCOUNTS (WITH CREDENTIALS)
// -------------------------------------------------------------
export const PRE_SEEDED_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@novastore.com',
    password: 'Customer123!',
    tier: 'VIP',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    headline: 'Audio Enthusiast & VIP Member',
    joined: 'Jan 2025'
  },
  {
    id: 'cust-2',
    name: 'David Miller',
    email: 'david.miller@novastore.com',
    password: 'Customer123!',
    tier: 'Standard',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    headline: 'Software Engineer',
    joined: 'Mar 2025'
  },
  {
    id: 'cust-3',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@novastore.com',
    password: 'Customer123!',
    tier: 'VIP',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    headline: 'Lead Lab Director @ ChemTech',
    joined: 'Nov 2024'
  },
  {
    id: 'cust-4',
    name: 'Alex Chen',
    email: 'alex.chen@novastore.com',
    password: 'Customer123!',
    tier: 'Standard',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    headline: 'Creative Designer & Photographer',
    joined: 'Feb 2025'
  },
  {
    id: 'cust-5',
    name: 'Priya Patel',
    email: 'priya.patel@novastore.com',
    password: 'Customer123!',
    tier: 'Standard',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    headline: 'Data Scientist',
    joined: 'Apr 2025'
  },
  {
    id: 'cust-6',
    name: 'Marcus Vance',
    email: 'marcus.vance@novastore.com',
    password: 'Customer123!',
    tier: 'Standard',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    headline: 'Logistics Supervisor',
    joined: 'Dec 2024'
  },
  {
    id: 'cust-7',
    name: 'Olivia Taylor',
    email: 'olivia.taylor@novastore.com',
    password: 'Customer123!',
    tier: 'VIP',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    headline: 'Marathon Runner & Athlete',
    joined: 'Jan 2025'
  },
  {
    id: 'cust-8',
    name: 'Hassan Raza',
    email: 'hassan.raza@novastore.com',
    password: 'Customer123!',
    tier: 'Standard',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    headline: 'Financial Analyst',
    joined: 'Feb 2025'
  }
];

// -------------------------------------------------------------
// REAL TECH STORE CATALOG (NOVASTORE)
// -------------------------------------------------------------
export const STORE_CATALOG = [
  {
    id: 'PROD-001',
    name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
    category: 'Audio',
    price: '$399.00',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
    specs: 'Industry-leading ANC • 30hr Battery • Speak-to-Chat • Multipoint Bluetooth',
    inStock: true,
    rating: 4.8
  },
  {
    id: 'PROD-002',
    name: 'Apple MacBook Pro 14" M3 Pro (Space Black)',
    category: 'Computers',
    price: '$1,999.00',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    specs: '11-Core CPU • 14-Core GPU • 18GB Unified RAM • 512GB SSD • Liquid Retina XDR',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'PROD-003',
    name: 'NovaPower Smart Battery Backup Pack B-90',
    category: 'Power & Lab',
    price: '$650.00',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop&q=80',
    specs: '9000mAh Solid-State Lithium • Chem-Safe Heat Shield • Dual 100W PD Output',
    inStock: true,
    rating: 4.5
  },
  {
    id: 'PROD-004',
    name: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray)',
    category: 'Smartphones',
    price: '$1,299.00',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
    specs: 'Snapdragon 8 Gen 3 • 200MP Quad Telephoto • S-Pen • 6.8" 120Hz Flat AMOLED',
    inStock: true,
    rating: 4.8
  },
  {
    id: 'PROD-005',
    name: 'Dell UltraSharp 27" 4K OLED Monitor (U2723QE)',
    category: 'Displays',
    price: '$599.00',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
    specs: '4K 3840x2160 IPS Black • 98% DCI-P3 • USB-C 90W Hub • Zero Dead Pixel Guarantee',
    inStock: true,
    rating: 4.7
  },
  {
    id: 'PROD-006',
    name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
    category: 'Peripherals',
    price: '$199.00',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    specs: 'Full CNC Aluminum • QMK/VIA Programmable • Hot-Swappable • Double-Gasket',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'PROD-007',
    name: 'Apple Watch Ultra 2 (Titanium / Ocean Band)',
    category: 'Wearables',
    price: '$799.00',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
    specs: '49mm Titanium Case • Dual-Frequency GPS • 100m Water Resistant • S9 SiP',
    inStock: true,
    rating: 4.9
  },
  {
    id: 'PROD-008',
    name: 'Logitech MX Master 3S Ergonomic Wireless Mouse',
    category: 'Peripherals',
    price: '$99.00',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
    specs: '8K DPI Any-Surface Track • Quiet Clicks • MagSpeed Electromagnetic Scroll',
    inStock: true,
    rating: 4.8
  },
  {
    id: 'PROD-009',
    name: 'Dyson V15 Detect Absolute Cordless Vacuum',
    category: 'Smart Home',
    price: '$749.00',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80',
    specs: 'Laser Slim Fluffy • Piezo Sensor Particle Count • 60min Runtime • HEPA Filter',
    inStock: true,
    rating: 4.6
  },
  {
    id: 'PROD-010',
    name: 'Bose QuietComfort Ultra Wireless Earbuds',
    category: 'Audio',
    price: '$299.00',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    specs: 'Spatial Audio • CustomTune Calibration • World-Class Noise Cancellation',
    inStock: true,
    rating: 4.7
  }
];

// -------------------------------------------------------------
// INITIAL PURCHASED ORDERS MAP BY CUSTOMER EMAIL
// -------------------------------------------------------------
const INITIAL_PURCHASES = {
  'sarah.jenkins@novastore.com': [
    {
      orderId: 'ORD-SARA-9921',
      productName: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
      productImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
      price: '$399.00',
      date: '2026-03-21 (4 days ago)',
      status: 'Delivered',
      serialNumber: 'SN-SONY-884102',
      deliveryNote: 'Delivered via DHL Express. Left at front door with signature verification.',
      suggestedIssue: {
        title: 'Severe Audio Buzzing & Right Hinge Fracture',
        category: 'Hardware Defect & Warranty',
        desc: 'I received these headphones 4 days ago. Right out of the box, the right ear cup emits high-pitch buzzing during ANC mode, and the headband hinge cracked when putting it on.',
        evidenceImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
        evidenceLabel: 'Cracked Headband Hinge Photo'
      }
    }
  ],
  'david.miller@novastore.com': [
    {
      orderId: 'ORD-DAVI-7712',
      productName: 'Apple MacBook Pro 14" M3 Pro (Space Black)',
      productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
      price: '$1,999.00',
      date: '2026-03-22 (3 days ago)',
      status: 'Delivered',
      serialNumber: 'SN-APPL-M3P-4401',
      deliveryNote: 'Signed by building front desk.',
      suggestedIssue: {
        title: 'Battery Rapid Drain & Sudden Thermal Shutdown',
        category: 'Technical Malfunction',
        desc: 'Laptop shuts down abruptly after 30 minutes of light coding. Battery diagnostic reports error code 0x88F. Chassis becomes painfully hot to touch near MagSafe port.',
        evidenceImage: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
        evidenceLabel: 'Thermal Diagnostic Error Screen'
      }
    }
  ],
  'elena.rostova@novastore.com': [
    {
      orderId: 'ORD-ELEN-8841',
      productName: 'NovaPower Smart Battery Backup Pack B-90',
      productImage: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop&q=80',
      price: '$650.00',
      date: '2026-03-20 (5 days ago)',
      status: 'Delivered',
      serialNumber: 'SN-NVBAT-90022',
      deliveryNote: 'Delivered to On-Premise Chemical Laboratory Storage facility.',
      suggestedIssue: {
        title: 'Critical Safety Hazard: Emitting White Smoke and Sparks',
        category: 'Critical Safety Hazard (P1)',
        desc: 'Good afternoon team. No rush, please advise... the server battery pack unit started emitting white smoke and sparked near our lab chemical storage. Need urgent hazardous protocol instructions.',
        evidenceImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
        evidenceLabel: 'Scorched Terminal & Smoke Evidence'
      }
    }
  ],
  'alex.chen@novastore.com': [
    {
      orderId: 'ORD-ALEX-4412',
      productName: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray)',
      productImage: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
      price: '$1,299.00',
      date: '2026-03-19 (6 days ago)',
      status: 'Delivered',
      serialNumber: 'SN-SAMS-S24U-7721',
      deliveryNote: 'Delivered in damaged parcel box.',
      suggestedIssue: {
        title: 'Rear 200MP Camera Lens Shattered on Arrival',
        category: 'Damaged in Shipping',
        desc: 'The outer shipping box was visibly crushed upon courier drop-off. Upon unboxing, the primary 200MP camera lens glass is completely shattered into fragments.',
        evidenceImage: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
        evidenceLabel: 'Cracked Camera Glass Photo'
      }
    }
  ],
  'priya.patel@novastore.com': [
    {
      orderId: 'ORD-PRIY-5531',
      productName: 'Dell UltraSharp 27" 4K OLED Monitor (U2723QE)',
      productImage: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
      price: '$599.00',
      date: '2026-03-18 (1 week ago)',
      status: 'Delivered',
      serialNumber: 'SN-DELL-4K-1109',
      deliveryNote: 'Delivered to corporate office reception.',
      suggestedIssue: {
        title: 'Bright Green Vertical Line of Dead Pixels',
        category: 'Hardware Defect & Warranty',
        desc: 'A permanent vertical line of bright green dead pixels spans from top to bottom across the center of the display. Requesting replacement under Zero Dead Pixel warranty.',
        evidenceImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
        evidenceLabel: 'Vertical Dead Pixel Line Photo'
      }
    }
  ],
  'marcus.vance@novastore.com': [
    {
      orderId: 'ORD-MARC-6624',
      productName: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
      productImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
      price: '$199.00',
      date: '2026-03-17 (1 week ago)',
      status: 'Delivered',
      serialNumber: 'SN-KEYCH-Q1P-302',
      deliveryNote: 'Placed in secure apartment mailbox.',
      suggestedIssue: {
        title: 'Bluetooth Drops Connection Every 2 Minutes',
        category: 'Technical Connectivity',
        desc: 'Wireless Bluetooth 5.1 connection disconnects constantly while typing. Tested on Windows, macOS, and Linux with same behavior. Cable mode works fine.',
        evidenceImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
        evidenceLabel: 'Device Pairing Failure Screen'
      }
    }
  ],
  'olivia.taylor@novastore.com': [
    {
      orderId: 'ORD-OLIV-7789',
      productName: 'Apple Watch Ultra 2 (Titanium / Ocean Band)',
      productImage: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
      price: '$799.00',
      date: '2026-03-15 (10 days ago)',
      status: 'Delivered',
      serialNumber: 'SN-APPL-WUT-9904',
      deliveryNote: 'Signed by recipient.',
      suggestedIssue: {
        title: 'Touchscreen Unresponsive After Swimming (Water Sensor Glitch)',
        category: 'Hardware Defect & Warranty',
        desc: 'Advertised as 100m water resistant. After a standard 30-minute pool swim, display is completely unresponsive to touch and moisture condensation is visible behind sensor glass.',
        evidenceImage: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&auto=format&fit=crop&q=80',
        evidenceLabel: 'Moisture Ingress Sensor Evidence'
      }
    }
  ],
  'hassan.raza@novastore.com': [
    {
      orderId: 'ORD-HASS-8810',
      productName: 'Logitech MX Master 3S Ergonomic Wireless Mouse',
      productImage: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
      price: '$99.00',
      date: '2026-03-14 (11 days ago)',
      status: 'Delivered',
      serialNumber: 'SN-LOGI-MX3S-5501',
      deliveryNote: 'Delivered via standard parcel post.',
      suggestedIssue: {
        title: 'MagSpeed Electromagnetic Scroll Wheel Jammed',
        category: 'Hardware Defect',
        desc: 'The metal scroll wheel mechanism is completely stuck in free-spin mode and ratchet mode does not engage. Grinding noise when attempting to scroll.',
        evidenceImage: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
        evidenceLabel: 'Mechanical Jammed Wheel Inspection'
      }
    }
  ]
};

// -------------------------------------------------------------
export function CustomerPortal({ onTicketSubmitted, onInspectTicket }) {
  // Active Customer profile state
  const [activeCustomer, setActiveCustomer] = useState(PRE_SEEDED_CUSTOMERS[0]);
  const [customerPurchases, setCustomerPurchases] = useState(() => {
    try {
      const saved = localStorage.getItem('supportnova_customer_purchases');
      return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
    } catch (e) {
      return INITIAL_PURCHASES;
    }
  });

  // MongoDB Atlas State & Telemetry
  const [mongoHistory, setMongoHistory] = useState(null);
  const [mongoLoading, setMongoLoading] = useState(false);
  const [mongoSyncing, setMongoSyncing] = useState(false);
  const [mongoConnected, setMongoConnected] = useState(true);

  // Sync purchases to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('supportnova_customer_purchases', JSON.stringify(customerPurchases));
    } catch (e) {
      console.error('Failed to persist customer purchases:', e);
    }
  }, [customerPurchases]);

  // Sync customer purchases to MongoDB Atlas automatically
  useEffect(() => {
    async function syncActivePurchases() {
      const orders = customerPurchases[activeCustomer.email] || [];
      if (orders.length > 0) {
        try {
          const records = orders.map(o => ({
            order_id: o.orderId,
            customer_email: activeCustomer.email,
            customer_name: activeCustomer.name,
            product_name: o.productName,
            price: o.price,
            serial_number: o.serialNumber || null,
            status: o.status || 'Delivered',
            delivery_note: o.deliveryNote || null,
            purchase_date: o.date || null
          }));
          await syncCustomerPurchases(records);
        } catch (e) {
          console.warn('MongoDB purchase auto-sync:', e);
        }
      }
    }
    syncActivePurchases();
  }, [activeCustomer.email, customerPurchases]);

  // Load customer full history from MongoDB Atlas
  const loadMongoHistory = async () => {
    setMongoLoading(true);
    try {
      const history = await fetchCustomerHistory(activeCustomer.email);
      setMongoHistory(history);
      setMongoConnected(!history.error);
    } catch (e) {
      console.warn('Failed to load MongoDB customer history:', e);
      setMongoConnected(false);
    } finally {
      setMongoLoading(false);
    }
  };

  // Sync all pre-seeded customers to MongoDB Atlas at once
  const handleSyncAllToMongo = async () => {
    setMongoSyncing(true);
    try {
      let totalSynced = 0;
      for (const cust of PRE_SEEDED_CUSTOMERS) {
        const orders = customerPurchases[cust.email] || [];
        if (orders.length > 0) {
          const records = orders.map(o => ({
            order_id: o.orderId,
            customer_email: cust.email,
            customer_name: cust.name,
            product_name: o.productName,
            price: o.price,
            serial_number: o.serialNumber || null,
            status: o.status || 'Delivered',
            delivery_note: o.deliveryNote || null,
            purchase_date: o.date || null
          }));
          await syncCustomerPurchases(records);
          totalSynced += records.length;
        }
      }
      toast.success('MongoDB Atlas Sync Complete', {
        description: `Synced ${totalSynced} customer purchases to MongoDB Atlas cluster.`
      });
      await loadMongoHistory();
    } catch (e) {
      toast.error('MongoDB Atlas sync failed', { description: e.message });
    } finally {
      setMongoSyncing(false);
    }
  };
  
  // Navigation tabs in Customer Portal: 'orders', 'tickets', 'store', 'history'
  const [activeSubTab, setActiveSubTab] = useState('orders');
  
  // User's filed tickets list
  const [myTickets, setMyTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  // Customer interactive reply and ticket closure state
  const [replyingTicketId, setReplyingTicketId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyImageUrl, setReplyImageUrl] = useState('');
  const [replyImageMode, setReplyImageMode] = useState('upload'); // 'upload' or 'url'
  const [replyFileName, setReplyFileName] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  // Handle image upload for customer reply
  const handleReplyImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WebP, etc.)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setReplyImageUrl(event.target.result);
      setReplyFileName(file.name);
      toast.success('Defect photo attached to reply', { description: file.name });
    };
    reader.readAsDataURL(file);
  };
  
  // Modal / Filing state
  const [filingModalOpen, setFilingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintCategory, setComplaintCategory] = useState('Hardware Defect & Warranty');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [evidenceImageUrl, setEvidenceImageUrl] = useState('');
  const [imageUploadMode, setImageUploadMode] = useState('upload'); // 'upload' or 'url'
  const [fileName, setFileName] = useState('');
  const [filingSubmitting, setFilingSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState('');

  // Handle local file upload (converts to base64 Data URL)
  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WebP, etc.)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setEvidenceImageUrl(event.target.result);
      setFileName(file.name);
      toast.success('Photo attached successfully', { description: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleClearEvidenceImage = () => {
    setEvidenceImageUrl('');
    setFileName('');
  };

  // Load customer complaints whenever active customer changes or after submission
  const loadMyTickets = async () => {
    setTicketsLoading(true);
    try {
      const tickets = await fetchCustomerComplaints(activeCustomer.email);
      setMyTickets(tickets || []);
    } catch (err) {
      console.error('Failed to load customer tickets:', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    loadMyTickets();
  }, [activeCustomer]);

  // Handle switching customer profile
  const handleSelectCustomer = (customer) => {
    setActiveCustomer(customer);
    setSubmittedTicketId('');
    toast.info(`Switched profile to: ${customer.name}`, {
      description: `Viewing orders for ${customer.email} (${customer.tier} Tier)`
    });
    // Log customer switch/login to MongoDB
    try {
      logCustomerActivity({
        customer_email: customer.email,
        customer_name: customer.name,
        event_type: 'customer_login',
        details: `Customer authenticated as ${customer.tier} user.`
      });
    } catch (e) {}
  };

  // Open modal pre-populated with order details (image is strictly optional)
  const handleOpenFilingModal = (order) => {
    setSelectedOrder(order);
    if (order.suggestedIssue) {
      setComplaintTitle(order.suggestedIssue.title);
      setComplaintCategory(order.suggestedIssue.category);
      setComplaintDesc(order.suggestedIssue.desc);
    } else {
      setComplaintTitle(`Defect reported on ${order.productName}`);
      setComplaintCategory('Hardware Defect & Warranty');
      setComplaintDesc('');
    }
    setEvidenceImageUrl('');
    setFileName('');
    setImageUploadMode('upload');
    setFilingModalOpen(true);
  };

  // Submit complaint
  const handleFilingSubmit = async (e) => {
    e.preventDefault();
    if (!complaintTitle || !complaintDesc) {
      toast.error('Please enter both issue title and detailed description');
      return;
    }
    setFilingSubmitting(true);
    try {
      const payload = {
        customer_name: activeCustomer.name,
        customer_email: activeCustomer.email,
        customer_tier: activeCustomer.tier,
        channel: 'Web Form',
        complaint_title: complaintTitle,
        complaint_description: complaintDesc,
        product_or_service: selectedOrder.productName,
        product_image_url: selectedOrder.productImage,
        evidence_image_url: evidenceImageUrl.trim() ? evidenceImageUrl.trim() : null,
        order_reference: selectedOrder.orderId,
        transaction_date: selectedOrder.date.split(' ')[0],
        previous_complaints_count: 0
      };

      const result = await submitComplaint(payload);
      setSubmittedTicketId(result.complaint_id);
      if (onTicketSubmitted) {
        onTicketSubmitted(result.complaint_id);
      }
      setFilingModalOpen(false);
      toast.success(`Complaint #${result.complaint_id} Submitted!`, {
        description: 'Your complaint has been logged securely. Our support team is reviewing your claim against corporate warranty policies.'
      });

      // Log complaint event to MongoDB Atlas
      try {
        await logCustomerActivity({
          customer_email: activeCustomer.email,
          customer_name: activeCustomer.name,
          event_type: 'complaint_submitted',
          complaint_id: result.complaint_id,
          details: `Filed claim on ${selectedOrder.productName}: "${complaintTitle}"`
        });
      } catch (e) {}

      // Refresh user's tickets and switch to tickets tab
      await loadMyTickets();
      setActiveSubTab('tickets');
    } catch (err) {
      toast.error('Submission failed', { description: err.message });
    } finally {
      setFilingSubmitting(false);
    }
  };

  // Customer replies to support team (reopens ticket, optionally with evidence photo)
  const handleSendCustomerReply = async (complaintId) => {
    if (!replyText.trim()) {
      toast.error('Please write a reply message');
      return;
    }
    setActionInProgress(true);
    try {
      await customerReplyTicket(
        complaintId, 
        replyText.trim(), 
        activeCustomer.email,
        replyImageUrl.trim() ? replyImageUrl.trim() : null
      );
      toast.success(replyImageUrl.trim() ? 'Reply & Defect Photo Sent!' : 'Reply Sent to Support!', {
        description: replyImageUrl.trim() 
          ? 'Your photo and message were attached to your case and escalated to the support specialist.' 
          : 'Your ticket has been reopened and placed in the specialist review queue.'
      });

      // Log reply event to MongoDB Atlas
      try {
        await logCustomerActivity({
          customer_email: activeCustomer.email,
          customer_name: activeCustomer.name,
          event_type: 'customer_reply',
          complaint_id: complaintId,
          details: `Customer sent reply: "${replyText.trim().substring(0, 80)}..."${replyImageUrl ? ' with defect photo' : ''}`
        });
      } catch (e) {}

      setReplyText('');
      setReplyImageUrl('');
      setReplyFileName('');
      setReplyingTicketId(null);
      await loadMyTickets();
    } catch (err) {
      toast.error('Failed to send reply', { description: err.message });
    } finally {
      setActionInProgress(false);
    }
  };

  // Customer accepts resolution and approves ticket closure
  const handleCustomerCloseTicket = async (complaintId) => {
    setActionInProgress(true);
    try {
      await customerCloseTicket(complaintId, 'Resolution accepted by customer');
      toast.success('Ticket Closed with Mutual Agreement', {
        description: 'Thank you for your confirmation! Your issue is marked as Resolved & Closed.'
      });

      // Log closure event to MongoDB Atlas
      try {
        await logCustomerActivity({
          customer_email: activeCustomer.email,
          customer_name: activeCustomer.name,
          event_type: 'ticket_closed',
          complaint_id: complaintId,
          details: 'Customer accepted resolution and mutually closed ticket.'
        });
      } catch (e) {}

      await loadMyTickets();
    } catch (err) {
      toast.error('Failed to close ticket', { description: err.message });
    } finally {
      setActionInProgress(false);
    }
  };

  // Demo "Buy Product" action that adds item to customer's purchased orders
  const handleBuyProduct = (product) => {
    const newOrder = {
      orderId: `ORD-${activeCustomer.name.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      productName: product.name,
      productImage: product.image,
      price: product.price,
      date: '2026-03-24 (Just now)',
      status: 'Delivered',
      serialNumber: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      deliveryNote: 'Express delivery confirmed. Order added to your active account.',
      suggestedIssue: {
        title: `Issue reported with ${product.name}`,
        category: 'Hardware Defect & Warranty',
        desc: `Product malfunction discovered after opening package. Needs technical inspection.`,
        evidenceImage: product.image,
        evidenceLabel: 'Product Receipt & Item Photo'
      }
    };

    setCustomerPurchases(prev => ({
      ...prev,
      [activeCustomer.email]: [newOrder, ...(prev[activeCustomer.email] || [])]
    }));

    // Sync new purchase and log activity to MongoDB Atlas
    try {
      syncCustomerPurchases([{
        order_id: newOrder.orderId,
        customer_email: activeCustomer.email,
        customer_name: activeCustomer.name,
        product_name: newOrder.productName,
        price: newOrder.price,
        serial_number: newOrder.serialNumber,
        status: newOrder.status,
        delivery_note: newOrder.deliveryNote,
        purchase_date: newOrder.date
      }]);
      logCustomerActivity({
        customer_email: activeCustomer.email,
        customer_name: activeCustomer.name,
        event_type: 'product_purchased',
        details: `Purchased ${product.name} (${product.price}) with order ID ${newOrder.orderId}`
      });
    } catch (e) {}

    toast.success(`Order Placed: ${product.name}`, {
      description: `Added to ${activeCustomer.name}'s verified purchases and synced to MongoDB Atlas. You can now file a complaint on it!`
    });
    setActiveSubTab('orders');
  };

  const currentOrders = customerPurchases[activeCustomer.email] || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 sm:px-6 pt-4">
      
      {/* -------------------------------------------------------- */}
      {/* 1. TOP CUSTOMER IDENTITY & QUICK-SWITCHER BAR             */}
      {/* -------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-indigo-900/60 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img 
            src={activeCustomer.avatar} 
            alt={activeCustomer.name} 
            className="w-14 h-14 rounded-full border-2 border-indigo-400 object-cover shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white">{activeCustomer.name}</h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                activeCustomer.tier === 'VIP' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'bg-slate-700 text-slate-200'
              }`}>
                {activeCustomer.tier} Member
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-indigo-200/80 mt-1 font-mono">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                {activeCustomer.email}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                Password: <strong className="text-white">{activeCustomer.password}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 1-Click Quick Customer Persona Switcher */}
        <div className="flex items-center gap-2 self-start lg:self-auto bg-slate-800/80 p-2 rounded-xl border border-slate-700">
          <Users className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">Switch Customer:</span>
          <select
            value={activeCustomer.email}
            onChange={(e) => {
              const found = PRE_SEEDED_CUSTOMERS.find(c => c.email === e.target.value);
              if (found) handleSelectCustomer(found);
            }}
            className="text-xs font-medium bg-slate-900 text-white rounded-lg px-2.5 py-1.5 border border-slate-600 focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            {PRE_SEEDED_CUSTOMERS.map(c => (
              <option key={c.id} value={c.email}>
                {c.name} ({c.tier}) — {c.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* -------------------------------------------------------- */}
      {/* 2. THREE CLEAN ACTION TABS (Store, Orders, Tickets)      */}
      {/* -------------------------------------------------------- */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Purchased Orders ({currentOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tickets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              activeSubTab === 'tickets'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>My Support Tickets & Live Replies</span>
            {myTickets.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-white">
                {myTickets.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('store')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'store'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>NovaStore Catalog ({STORE_CATALOG.length} Products)</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('history');
              loadMongoHistory();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-500" />
            <span>MongoDB Atlas Vault & History</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              Atlas DB
            </span>
          </button>
        </div>

        <button
          onClick={loadMyTickets}
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Updates</span>
        </button>
      </div>

      {/* -------------------------------------------------------- */}
      {/* TAB 1: MY PURCHASED ORDERS & 1-CLICK COMPLAINT FILING     */}
      {/* -------------------------------------------------------- */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Verified Purchases for {activeCustomer.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Found a defective product? Click <strong>"Report Problem & Upload Evidence"</strong> on any item to submit a complaint.
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
              {currentOrders.length} Order(s) Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentOrders.map((order, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-all space-y-4"
              >
                <div className="flex items-start gap-4">
                  <img 
                    src={order.productImage} 
                    alt={order.productName} 
                    className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        {order.orderId}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                        {order.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                      {order.productName}
                    </h4>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {order.price}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Serial: {order.serialNumber} • Purchased: {order.date}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Delivery Status: </span>
                  {order.deliveryNote}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Eligible for Warranty Claim</span>
                  </div>
                  <button
                    onClick={() => handleOpenFilingModal(order)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Report Issue / File Complaint</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB 2: MY SUPPORT TICKETS & REAL-TIME RESOLUTION STATUS  */}
      {/* -------------------------------------------------------- */}
      {activeSubTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Support Tickets for {activeCustomer.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track how SupportNova's dual pipelines and support agents resolve your claims in real time.
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
              {myTickets.length} Registered Ticket(s)
            </span>
          </div>

          {ticketsLoading ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">
              Loading your live resolution tickets...
            </div>
          ) : myTickets.length === 0 ? (
            <div className="p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Open Complaints</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You currently have no active complaints. Select any item from "My Purchased Orders" above and click "Report Problem" to test the tool!
              </p>
              <button
                onClick={() => setActiveSubTab('orders')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
              >
                View My Orders
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myTickets.map((t) => (
                <div 
                  key={t.complaint_id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4"
                >
                  {/* Ticket Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {t.complaint_id}
                        </span>
                        <StatusBadge status={t.status} />
                        {t.is_automated_dispatch_blocked ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300">
                            ⏳ Under Human Specialist Review
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300">
                            ✨ AI Verified & Dispatched
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {t.complaint_title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5 font-mono">
                        <span>Product: <strong className="text-slate-800 dark:text-slate-200">{t.product_or_service || 'N/A'}</strong></span>
                        <span>•</span>
                        <span>Dept: <strong className="text-slate-800 dark:text-slate-200">{t.assigned_department}</strong></span>
                        <span>•</span>
                        <span>SLA: <strong>{t.sla_target_hours || 24}h</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Narrative & Evidence Images */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Your Complaint Description:</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        {t.complaint_description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Attached Defect Evidence:</span>
                      {t.evidence_image_url ? (
                        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video relative group">
                          <img 
                            src={t.evidence_image_url} 
                            alt="Defect Evidence" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                            Verified Evidence
                          </span>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-dashed text-center text-xs text-slate-400">
                          No evidence attached
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Official Response from AI / Support Team */}
                  <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        Official Resolution Message for Customer:
                      </span>
                      <span className="text-[10px] font-mono uppercase bg-white dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-700 font-bold">
                        {t.status === 'Resolved & Closed' || t.is_closed ? 'Closed & Resolved' : (t.status === 'Reopened' ? 'Reopened' : (t.human_reviewer_action === 'Approved' ? 'Agent Approved' : (t.human_reviewer_action === 'Admin Approved' ? 'Admin Authorized' : 'Live Status')))}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-line italic">
                      "{t.customer_response || 'Your complaint has been accepted into the queue and is being evaluated against policy rules.'}"
                    </p>

                    {/* Full Interactive Conversation Thread (if replies exist) */}
                    {t.conversation_history && t.conversation_history.length > 1 && (
                      <div className="mt-3 pt-3 border-t border-indigo-200/60 dark:border-indigo-800/60 space-y-2">
                        <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>Conversation & Resolution History ({t.conversation_history.length} messages)</span>
                        </span>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {t.conversation_history.map((msg, mIdx) => (
                            <div 
                              key={mIdx} 
                              className={`p-2.5 rounded-xl text-xs ${
                                msg.sender === 'customer' 
                                  ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200' 
                                  : msg.action === 'customer_accepted_close' || msg.action === 'ticket_closed'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                                  : 'bg-indigo-100/70 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700 text-indigo-900 dark:text-indigo-100'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                                <span className="font-bold flex items-center gap-1">
                                  {msg.sender === 'customer' ? '👤 ' : (msg.action === 'customer_accepted_close' ? '✅ ' : '🛡️ ')}
                                  {msg.sender_name || (msg.sender === 'customer' ? 'You' : 'Support Specialist')}
                                </span>
                                <span>{msg.timestamp || 'Recent'}</span>
                              </div>
                              <p className="whitespace-pre-line text-xs font-sans leading-relaxed">{msg.message}</p>
                              {msg.image_url && (
                                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 uppercase font-bold block mb-1">
                                    📷 Attached Defect Photo:
                                  </span>
                                  <img 
                                    src={msg.image_url} 
                                    alt="Attached Evidence" 
                                    onClick={() => window.open(msg.image_url, '_blank')}
                                    className="max-h-48 rounded-xl object-cover border-2 border-indigo-300 dark:border-indigo-700 shadow-xs cursor-pointer hover:scale-[1.02] transition-transform" 
                                    title="Click to view full photo"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Customer Action Bar: Accept & Close vs Reply */}
                    <div className="pt-2 border-t border-indigo-200/50 dark:border-indigo-800/50">
                      {t.status === 'Resolved & Closed' || t.is_closed ? (
                        <div className="flex items-center gap-2 p-2.5 bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>This ticket has been officially resolved and closed with customer agreement.</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                              Satisfied with our response, or need further assistance?
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCustomerCloseTicket(t.complaint_id)}
                                disabled={actionInProgress}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Accept Resolution & Close Ticket</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (replyingTicketId === t.complaint_id) {
                                    setReplyingTicketId(null);
                                    setReplyText('');
                                    setReplyImageUrl('');
                                    setReplyFileName('');
                                  } else {
                                    setReplyingTicketId(t.complaint_id);
                                    setReplyText('');
                                    setReplyImageUrl('');
                                    setReplyFileName('');
                                  }
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>{replyingTicketId === t.complaint_id ? 'Cancel Reply' : 'Reply to Support'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Expandable Reply Composer */}
                          {replyingTicketId === t.complaint_id && (
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-400 dark:border-indigo-600 space-y-3 shadow-md animate-in fade-in duration-200">
                              <div>
                                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                                  Write your reply to Support (This will reopen the ticket for specialist review):
                                </label>
                                <textarea
                                  rows={3}
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="State what adjustments you require or provide additional details..."
                                  className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>

                              {/* Evidence Photo Attachment Section for Reply */}
                              <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Camera className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                    <span>Attach Defect Photo <span className="font-normal text-slate-500">(Required if specialist requested photo, or optional)</span></span>
                                  </label>
                                  {replyImageUrl && (
                                    <button
                                      type="button"
                                      onClick={() => { setReplyImageUrl(''); setReplyFileName(''); }}
                                      className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                      <span>Remove Photo</span>
                                    </button>
                                  )}
                                </div>

                                {/* Attachment Mode Switcher Tabs */}
                                <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-900 rounded-lg border border-slate-300/60 dark:border-slate-800 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => setReplyImageMode('upload')}
                                    className={`flex-1 py-1 px-2.5 rounded-md font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                      replyImageMode === 'upload' 
                                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs' 
                                        : 'text-slate-600 dark:text-slate-400'
                                    }`}
                                  >
                                    <Upload className="w-3 h-3" />
                                    <span>Upload from Device</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setReplyImageMode('url')}
                                    className={`flex-1 py-1 px-2.5 rounded-md font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                      replyImageMode === 'url' 
                                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs' 
                                        : 'text-slate-600 dark:text-slate-400'
                                    }`}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Paste Image Link</span>
                                  </button>
                                </div>

                                {/* Upload Dropzone */}
                                {replyImageMode === 'upload' ? (
                                  <div className="border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 rounded-lg p-3 text-center cursor-pointer transition-colors bg-white dark:bg-slate-900 relative">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleReplyImageUpload}
                                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                    {replyImageUrl ? (
                                      <div className="flex items-center gap-3 justify-center">
                                        <img 
                                          src={replyImageUrl} 
                                          alt="Reply Evidence" 
                                          className="w-12 h-12 rounded-lg object-cover border border-slate-300 dark:border-slate-700 shadow-xs"
                                        />
                                        <div className="text-left">
                                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[200px]">
                                            {replyFileName || 'Photo Attached'}
                                          </span>
                                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                                            ✓ Ready to send to specialist
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="py-1 space-y-1">
                                        <Camera className="w-5 h-5 text-slate-400 mx-auto" />
                                        <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                                          Click to choose defect photo or drag & drop
                                        </div>
                                        <div className="text-[10px] text-slate-400">PNG, JPG, WebP supported</div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  /* Paste URL Input */
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="url"
                                        value={replyImageUrl}
                                        onChange={(e) => setReplyImageUrl(e.target.value)}
                                        placeholder="https://... (Paste defect photo URL)"
                                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white"
                                      />
                                      {replyImageUrl && (
                                        <img 
                                          src={replyImageUrl} 
                                          alt="Preview" 
                                          className="w-8 h-8 rounded-lg object-cover border border-slate-300 dark:border-slate-700 flex-shrink-0" 
                                        />
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Quick Sample Defect Photos for Instant 1-Click Testing */}
                                <div className="pt-1">
                                  <span className="text-[10px] text-slate-500 font-medium block mb-1">Quick Sample Photos (Click to attach instantly):</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {[
                                      { label: '📷 Broken OLED Screen', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80' },
                                      { label: '📦 Crushed Transit Box', url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80' },
                                      { label: '🔌 Defective / Burnt Port', url: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=80' }
                                    ].map((sample, sIdx) => (
                                      <button
                                        key={sIdx}
                                        type="button"
                                        onClick={() => {
                                          setReplyImageUrl(sample.url);
                                          setReplyFileName(sample.label);
                                          toast.success(`Attached photo: ${sample.label}`);
                                        }}
                                        className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-[10px] font-medium border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
                                      >
                                        {sample.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => { 
                                    setReplyingTicketId(null); 
                                    setReplyText(''); 
                                    setReplyImageUrl('');
                                    setReplyFileName('');
                                  }}
                                  className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSendCustomerReply(t.complaint_id)}
                                  disabled={actionInProgress || !replyText.trim()}
                                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>{actionInProgress ? 'Sending...' : 'Send Reply & Reopen Ticket'}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB 3: NOVASTORE CATALOG (REAL COMMERCE BROWSING)         */}
      {/* -------------------------------------------------------- */}
      {activeSubTab === 'store' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                NovaStore Consumer Electronics & Computing
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Browse popular tech products. Click <strong>"Buy Demo Order"</strong> to add an item directly to your purchases so you can test reporting an issue!
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Authorized Tech Retailer
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {STORE_CATALOG.map((prod) => (
              <div 
                key={prod.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video w-full overflow-hidden relative">
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-black/70 text-white font-mono text-[10px] px-2 py-0.5 rounded-md">
                      {prod.category}
                    </span>
                    <span className="absolute top-2 right-2 bg-emerald-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">
                      ⭐ {prod.rating}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {prod.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {prod.specs}
                    </p>
                    <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                      {prod.price}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleBuyProduct(prod)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Buy Demo Order (Add to My Purchases)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB 4: MONGODB ATLAS VAULT & AUDIT LEDGER                */}
      {/* -------------------------------------------------------- */}
      {activeSubTab === 'history' && (
        <div className="space-y-6">
          {/* Top MongoDB Cluster Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 text-white shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    MongoDB Atlas NoSQL Engine Active
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    Primary Production DB
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  MongoDB Atlas Customer Vault & Audit Ledger
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Real-time query telemetry against MongoDB Atlas Cluster (<strong className="text-emerald-300 font-mono">Cluster0 / replicaSet: atlas-q1pse9-shard-0</strong>).
                  All customer purchases, complaint tickets, and activity logs are synchronized and persisted in NoSQL collections.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={loadMongoHistory}
                  disabled={mongoLoading}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  title="Query latest records from MongoDB Atlas"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${mongoLoading ? 'animate-spin' : ''}`} />
                  <span>{mongoLoading ? 'Querying Atlas...' : 'Refresh Telemetry'}</span>
                </button>

                <button
                  onClick={handleSyncAllToMongo}
                  disabled={mongoSyncing}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-50"
                  title="Sync all pre-seeded accounts to MongoDB Atlas collections"
                >
                  {mongoSyncing ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Database className="w-3.5 h-3.5" />
                  )}
                  <span>{mongoSyncing ? 'Syncing...' : 'Force Sync All to MongoDB'}</span>
                </button>
              </div>
            </div>

            {/* Quick MongoDB Connection Metadata */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Cluster Name</span>
                <span className="text-white font-bold">Cluster0 (Atlas Sharded)</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Database</span>
                <span className="text-emerald-400 font-bold">support_nova</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Collections Active</span>
                <span className="text-indigo-300 font-bold">purchases • tickets • audit</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Target Customer</span>
                <span className="text-amber-300 font-bold truncate block">{activeCustomer.email}</span>
              </div>
            </div>
          </div>

          {/* 3 Telemetry Counter Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
                  Atlas Purchases Saved
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {mongoHistory?.total_purchases ?? (mongoHistory?.purchases?.length || currentOrders.length)}
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                  Collection: customer_purchases
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
                  Atlas Complaint Tickets
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {mongoHistory?.total_complaints ?? (mongoHistory?.complaints?.length || myTickets.length)}
                </div>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                  Collection: complaint_tickets
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
                  Atlas Activity Events
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {mongoHistory?.activity_log?.length || 0}
                </div>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                  Collection: customer_activity_log
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Customer Purchases Saved in MongoDB */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Verified Customer Purchases in MongoDB Atlas (<code className="text-xs font-mono text-emerald-600 dark:text-emerald-400">customer_purchases</code>)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Stores complete purchase ledger including order IDs, device serial numbers, pricing, and fulfillment state.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {mongoHistory?.purchases?.length || currentOrders.length} Document(s)
              </span>
            </div>

            {/* Purchases Table / List */}
            {((mongoHistory?.purchases && mongoHistory.purchases.length > 0) || currentOrders.length > 0) ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-lg">Order ID</th>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3">Serial Number</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 rounded-r-lg">MongoDB Persistence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                    {(mongoHistory?.purchases && mongoHistory.purchases.length > 0 ? mongoHistory.purchases : currentOrders).map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {p.order_id || p.orderId}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                          {p.product_name || p.productName}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {p.price}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">
                          {p.serial_number || p.serialNumber || 'N/A'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {p.status || 'Delivered'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Atlas Verified</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl space-y-2">
                <Database className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                <p>No purchases saved in MongoDB Atlas for this account yet.</p>
                <button
                  onClick={handleSyncAllToMongo}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                >
                  Click to Sync Purchases to MongoDB
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Complaints & Tickets in MongoDB Atlas */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Complaint Tickets in MongoDB Atlas (<code className="text-xs font-mono text-indigo-600 dark:text-indigo-400">complaint_tickets</code>)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Full AI inspection telemetry, dual-pipeline diff verdicts, and conversation thread stored in NoSQL documents.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                {mongoHistory?.complaints?.length || myTickets.length} Ticket(s)
              </span>
            </div>

            {/* Tickets Grid */}
            {((mongoHistory?.complaints && mongoHistory.complaints.length > 0) || myTickets.length > 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(mongoHistory?.complaints && mongoHistory.complaints.length > 0 ? mongoHistory.complaints : myTickets).map((t, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 space-y-2.5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {t.complaint_id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {t.status || 'Active'}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {t.complaint_title}
                    </h5>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                      {t.complaint_description || t.customer_response || 'Case logged in MongoDB.'}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px] font-mono text-slate-500">
                      <span>Dept: <strong>{t.assigned_department || 'Support'}</strong></span>
                      {onInspectTicket && (
                        <button
                          onClick={() => onInspectTicket(t.complaint_id)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Inspect in Dual-Pipeline</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                No complaint tickets filed yet by {activeCustomer.name}.
              </div>
            )}
          </div>

          {/* Section 3: Live Customer Audit & Activity Trail in MongoDB */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Live Customer Audit & Activity Trail (<code className="text-xs font-mono text-purple-600 dark:text-purple-400">customer_activity_log</code>)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Captures all user events, logins, complaint submissions, replies, and resolution agreements.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">
                {mongoHistory?.activity_log?.length || 0} Event(s) Recorded
              </span>
            </div>

            {mongoHistory?.activity_log && mongoHistory.activity_log.length > 0 ? (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {mongoHistory.activity_log.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs flex items-start justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {act.event_type}
                        </span>
                        {act.complaint_id && (
                          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                            {act.complaint_id}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 mt-1 font-sans">
                        {act.details || 'Customer action recorded.'}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                      {act.recorded_at ? new Date(act.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Recent'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                Activity log is being recorded to MongoDB Atlas as you interact with the portal.
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* 3. REPORT PROBLEM / FILE COMPLAINT MODAL (WITH EVIDENCE)   */}
      {/* -------------------------------------------------------- */}
      {filingModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Report a Defect or Issue
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  File Complaint: {selectedOrder.productName}
                </h3>
              </div>
              <button 
                onClick={() => setFilingModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFilingSubmit} className="p-6 space-y-4">
              {/* Product Info Summary */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <img 
                  src={selectedOrder.productImage} 
                  alt={selectedOrder.productName} 
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-900 dark:text-white">{selectedOrder.productName}</div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    Order #{selectedOrder.orderId} • Customer: {activeCustomer.name} ({activeCustomer.email})
                  </div>
                </div>
              </div>

              {/* Problem Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Category
                </label>
                <select
                  value={complaintCategory}
                  onChange={(e) => setComplaintCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Hardware Defect & Warranty">Hardware Defect & Warranty Claim</option>
                  <option value="Damaged in Shipping">Damaged in Shipping / Broken in Transit</option>
                  <option value="Critical Safety Hazard (P1)">Critical Safety Hazard (Battery, Smoke, Sparks)</option>
                  <option value="Technical Malfunction">Technical Malfunction / Software Crash</option>
                  <option value="Billing & Duplicate Charge">Billing Dispute / Incorrect Charge</option>
                  <option value="Logistics & Delivery Delay">Late Delivery / Courier Tracking Issue</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Complaint Summary Title
                </label>
                <input
                  type="text"
                  value={complaintTitle}
                  onChange={(e) => setComplaintTitle(e.target.value)}
                  placeholder="e.g. Right ear cup buzzing sound & hinge cracked"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Narrative */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Complaint Narrative
                </label>
                <textarea
                  rows={4}
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  placeholder="Explain exactly what happened, when the defect occurred, and your requested resolution..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Defect Evidence Image Selection (Strictly Optional) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Attach Defect Evidence Photo <span className="font-normal text-slate-400">(Optional)</span></span>
                  </label>
                  {evidenceImageUrl && (
                    <button
                      type="button"
                      onClick={handleClearEvidenceImage}
                      className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <X className="w-3 h-3" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>

                {/* Mode Selector Tabs: Upload File vs Paste URL */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setImageUploadMode('upload')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      imageUploadMode === 'upload'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUploadMode('url')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      imageUploadMode === 'url'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Paste Image Link / URL</span>
                  </button>
                </div>

                {/* Upload from Device Dropzone */}
                {imageUploadMode === 'upload' ? (
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/60 dark:bg-slate-950/60 relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {evidenceImageUrl ? (
                      <div className="flex items-center gap-3 justify-center">
                        <img 
                          src={evidenceImageUrl} 
                          alt="Uploaded Evidence Preview" 
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-xs flex-shrink-0"
                        />
                        <div className="text-left">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                            {fileName || 'Evidence Photo Attached'}
                          </div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            ✓ Ready to attach with complaint
                          </div>
                          <div className="text-[10px] text-slate-400">Click or drop another file to replace</div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 py-1">
                        <Camera className="w-6 h-6 text-slate-400 mx-auto" />
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Click to select a photo from your computer or drag & drop
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Supports PNG, JPG, WebP, GIF • Image is completely optional
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Paste URL Mode */
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={evidenceImageUrl}
                        onChange={(e) => setEvidenceImageUrl(e.target.value)}
                        placeholder="https://... (Paste Google Search or online defect photo link)"
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                      {evidenceImageUrl && (
                        <img 
                          src={evidenceImageUrl} 
                          alt="URL Preview" 
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Copy the image address from Google or any website and paste it above, or leave blank if no photo.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFilingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={filingSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{filingSubmitting ? 'Analyzing with Dual Pipelines...' : 'Submit Official Complaint'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default CustomerPortal;
