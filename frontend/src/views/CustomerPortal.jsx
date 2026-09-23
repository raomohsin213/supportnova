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
  Check
} from 'lucide-react';
import { trackComplaint, fetchRecentPublicComplaints, submitComplaint } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

// Real Consumer Electronics & Computing Store Inventory for NovaTech
const MOCK_ORDERS = [
  {
    orderId: 'NVT-77401',
    productName: 'NovaBook Pro 16" Gaming & Workstation',
    category: 'High-Performance Computing',
    specs: 'Intel Core i9 14900HX • RTX 4080 16GB • 32GB DDR5 • 1TB NVMe',
    price: '$2,499.00',
    date: '2026-03-21 (2 days ago)',
    status: 'Delivered',
    deliveryNote: 'Delivered via Express Courier. Signature verified.',
    icon: Laptop,
    customerName: 'Dr. Eleanor Vance',
    customerTier: 'VIP',
    sampleIssues: [
      {
        title: 'Screen Flickering on Battery Power',
        desc: 'The OLED panel displays severe horizontal artifacting and flickers whenever unplugged from AC power.',
        resolution: 'Replacement Unit (Warranty)'
      },
      {
        title: 'Overheating & Thermal Throttling',
        desc: 'Fans spinning at 100% idle and CPU reaching 98C during standard office tasks.',
        resolution: 'Technical Support / Inspection'
      }
    ]
  },
  {
    orderId: 'SRV-BAT-8841',
    productName: 'NovaPower Smart Battery Backup Pack B-90',
    category: 'Industrial & Server Power Systems',
    specs: '9000mAh Solid-State Lithium • Chem-Safe Casing • Dual 100W PD',
    price: '$650.00',
    date: '2026-03-20 (3 days ago)',
    status: 'Delivered',
    deliveryNote: 'Delivered to On-Premise Chemical Laboratory Facility.',
    icon: Zap,
    customerName: 'Dr. Eleanor Vance',
    customerTier: 'VIP',
    isHazardCandidate: true,
    sampleIssues: [
      {
        title: 'Critical: Emitting White Smoke & Sparks',
        desc: 'Good afternoon team, just an FYI that the server battery pack we received started emitting white smoke and sparked near our chemical storage. No rush, please advise.',
        resolution: 'Immediate Safety Escalation (Hazard)',
        isHazard: true
      },
      {
        title: 'Refuses to Hold Charge Beyond 20%',
        desc: 'Device halts charging at 20% and throws firmware error code ERR-BAT-09.',
        resolution: 'Replacement Unit'
      }
    ]
  },
  {
    orderId: 'NVT-44102',
    productName: 'NovaPhone Ultra 5G (Titanium Gray)',
    category: 'Mobile Devices & Telephony',
    specs: '256GB Storage • Snapdragon 8 Gen 3 • 6.8" 120Hz AMOLED • 50MP Lens',
    price: '$1,199.00',
    date: '2026-03-18 (5 days ago)',
    status: 'Delayed in Transit',
    deliveryNote: 'Carrier Exception: Logistics hub sorting delay exceeding 4 business days.',
    icon: Smartphone,
    customerName: 'Marcus Vance',
    customerTier: 'Standard',
    sampleIssues: [
      {
        title: 'Delivery Delayed 4 Days - Courier Tracking Frozen',
        desc: 'My order has been stuck at the regional sorting hub for 4 business days with zero courier updates. Promised delivery date was March 19.',
        resolution: 'Expedited Delivery or Refund'
      },
      {
        title: 'Urgent Address Change Request',
        desc: 'I moved addresses while package was delayed and need courier routing updated.',
        resolution: 'Customer Service Assistance'
      }
    ]
  },
  {
    orderId: 'NVT-33109',
    productName: 'SonicNova Studio Pro Wireless ANC Headphones',
    category: 'Premium Audio & Wearables',
    specs: 'Active Noise Cancellation • 40mm Beryllium Drivers • 40hr Battery',
    price: '$349.00',
    date: '2026-03-15 (1 week ago)',
    status: 'Delivered',
    deliveryNote: 'Package placed in secure parcel locker.',
    icon: Headphones,
    customerName: 'Marcus Vance',
    customerTier: 'Standard',
    sampleIssues: [
      {
        title: 'Audio Crackling & Bluetooth Disconnects',
        desc: 'Left ear cup emits loud static buzzing and disconnects every 5 minutes from Windows laptop.',
        resolution: 'Warranty Replacement'
      },
      {
        title: 'Incorrect Billing / Double Charged',
        desc: 'My credit card statement shows two identical charges of $349.00 for order NVT-33109.',
        resolution: 'Refund of Duplicate Charge'
      }
    ]
  },
  {
    orderId: 'NVT-11045',
    productName: 'NovaVision 34" Curved 4K OLED UltraWide Monitor',
    category: 'Displays & Peripherals',
    specs: '3440x1440 QD-OLED • 175Hz 0.03ms • 99% DCI-P3 • USB-C 90W Hub',
    price: '$899.00',
    date: '2026-03-10 (2 weeks ago)',
    status: 'Delivered',
    deliveryNote: 'Signed by building concierge.',
    icon: Monitor,
    customerName: 'Dr. Eleanor Vance',
    customerTier: 'VIP',
    sampleIssues: [
      {
        title: 'Cluster of Dead Pixels Near Screen Center',
        desc: 'Discovered a visible cluster of 5 stuck green subpixels in the center of the display during color grading.',
        resolution: 'Panel Replacement Under Zero-Dead-Pixel Policy'
      }
    ]
  }
];

export function CustomerPortal({ onInspectTicket }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'track'
  const [searchId, setSearchId] = useState('TC-ADV-001');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentComplaints, setRecentComplaints] = useState([]);

  // Modal / Filing state
  const [filingModalOpen, setFilingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [desiredResolution, setDesiredResolution] = useState('Replacement Unit');
  const [filingSubmitting, setFilingSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState('');

  useEffect(() => {
    async function loadRecent() {
      try {
        const list = await fetchRecentPublicComplaints();
        setRecentComplaints(list || []);
      } catch (err) {
        console.error('Failed to load recent complaints:', err);
      }
    }
    loadRecent();
  }, []);

  async function handleSearch(idToSearch) {
    const id = (idToSearch || searchId).trim();
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await trackComplaint(id);
      setTicket(data);
      setActiveTab('track');
    } catch (err) {
      setError(err.message || 'Unable to locate complaint with this reference ID.');
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenFilingModal = (order, presetIssue = null) => {
    setSelectedOrder(order);
    if (presetIssue) {
      setCustomTitle(presetIssue.title);
      setCustomDesc(presetIssue.desc);
      setDesiredResolution(presetIssue.resolution);
    } else {
      setCustomTitle(`Issue with ${order.productName}`);
      setCustomDesc('');
      setDesiredResolution('Replacement Unit');
    }
    setFilingModalOpen(true);
  };

  const handleFilingSubmit = async (e) => {
    e.preventDefault();
    if (!customTitle || !customDesc) {
      alert('Please enter both an issue title and description.');
      return;
    }
    setFilingSubmitting(true);
    try {
      const payload = {
        customer_name: selectedOrder.customerName,
        customer_tier: selectedOrder.customerTier,
        channel: 'Web Form',
        product_or_service: selectedOrder.productName,
        order_reference: selectedOrder.orderId,
        transaction_date: '2026-03-20',
        previous_complaints_count: 1,
        complaint_title: customTitle,
        complaint_description: customDesc
      };

      const result = await submitComplaint(payload);
      setSubmittedTicketId(result.complaint_id);
      setFilingModalOpen(false);
      handleSearch(result.complaint_id);
    } catch (err) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setFilingSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 px-4 sm:px-6 pt-4">
      
      {/* Enterprise Store & Customer Experience Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 flex-shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                NovaTech Global
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Customer Support & Resolutions</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Customer Account & Order Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select an item from your verified order history below to file a formal complaint, or track an existing resolution ticket.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700/60 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({MOCK_ORDERS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'track'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Track Resolution</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner after filing */}
      {submittedTicketId && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <strong>Complaint Successfully Lodged:</strong> Ticket reference{' '}
              <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-white dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700">
                {submittedTicketId}
              </span>{' '}
              is now processed by SupportNova's Dual-Pipeline Engine.
            </div>
          </div>
          {onInspectTicket && (
            <Button
              variant="success"
              size="sm"
              onClick={() => onInspectTicket(submittedTicketId)}
              className="gap-1.5 self-start sm:self-auto"
            >
              <span>Inspect in Diff Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB A: MY ORDERS & PURCHASES (REAL COMMERCE SCENARIO)     */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Your Recent NovaTech Purchases</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Click "Report Issue / File Complaint" on any item to test SupportNova's AI & Python verification.</p>
            </div>
            <span className="text-xs font-mono text-slate-500 hidden sm:block">Customer: Dr. Eleanor Vance (VIP)</span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {MOCK_ORDERS.map((order) => {
              const Icon = order.icon;
              return (
                <div 
                  key={order.orderId}
                  className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-xs"
                >
                  {/* Left Product Info */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700/60 flex-shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          Order #{order.orderId}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{order.date}</span>
                        <Badge variant={order.status === 'Delivered' ? 'success' : 'warning'}>
                          {order.status}
                        </Badge>
                        {order.isHazardCandidate && (
                          <Badge variant="destructive">
                            Safety Test Case
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {order.productName}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {order.specs}
                      </p>

                      <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span>Price: <strong className="text-slate-900 dark:text-slate-200">{order.price}</strong></span>
                        <span>•</span>
                        <span>{order.deliveryNote}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions & Preset Issues */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <Button
                      variant="default"
                      onClick={() => handleOpenFilingModal(order)}
                      className="gap-2 whitespace-nowrap"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Report Issue / File Complaint</span>
                    </Button>

                    {/* Quick Issue Chips */}
                    <div className="flex flex-wrap gap-1.5 max-w-md lg:justify-end">
                      {order.sampleIssues.map((issue, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOpenFilingModal(order, issue)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors flex items-center gap-1 cursor-pointer ${
                            issue.isHazard
                              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 hover:bg-rose-100'
                              : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                          title={`Quick file: "${issue.title}"`}
                        >
                          {issue.isHazard && <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />}
                          <span>{issue.title}</span>
                          <ChevronRight className="w-3 h-3 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB B: TRACK EXISTING RESOLUTION (LIFECYCLE TIMELINE)    */}
      {/* ======================================================== */}
      {activeTab === 'track' && (
        <div className="space-y-6">
          {/* Tracking Search Form */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="max-w-2xl mx-auto space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block text-center">
                Search Customer Complaint Reference ID
              </label>
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                className="relative flex items-center"
              >
                <Search className="absolute left-4 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="e.g. TC-ADV-001, TC-ADV-002, or your newly filed ticket"
                  className="w-full pl-12 pr-28 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="absolute right-1.5 h-8 px-4"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Track</span>
                  )}
                </Button>
              </form>

              {/* Quick Select Chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="text-[11px]">Quick Samples:</span>
                {['TC-ADV-001', 'TC-ADV-002', 'TC-ADV-003', 'TC-ADV-004', 'TC-ADV-006'].map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => { setSearchId(id); handleSearch(id); }}
                    className={`font-mono text-[11px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                      searchId === id
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Active Complaint Status Card */}
          {ticket && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {ticket.complaint_id}
                    </span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {ticket.complaint_title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Product: <strong className="text-slate-800 dark:text-slate-200">{ticket.product_or_service || 'Consumer Electronics'}</strong>
                    {ticket.order_reference && (
                      <span> • Order: <strong className="text-slate-800 dark:text-slate-200 font-mono">{ticket.order_reference}</strong></span>
                    )}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Assigned Department</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center sm:justify-end gap-1.5 mt-0.5">
                    <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>{ticket.department || 'Customer Support'}</span>
                  </div>
                </div>
              </div>

              {/* 4-Stage Lifecycle Progress Tracker */}
              <div className="py-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">Resolution Lifecycle Progress</div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 space-y-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mx-auto">1</div>
                    <div className="font-bold">Submitted</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Received</div>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 space-y-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mx-auto">2</div>
                    <div className="font-bold">Validated</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Rule checked</div>
                  </div>

                  <div className={`p-3 rounded-lg border space-y-1 ${
                    ticket.status === 'In Review' || ticket.status === 'Manual Review Required'
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
                      : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  }`}>
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto">3</div>
                    <div className="font-bold">Supervisor Review</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Triage Active</div>
                  </div>

                  <div className={`p-3 rounded-lg border space-y-1 ${
                    ticket.status === 'Resolved' || ticket.status === 'Closed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center mx-auto">4</div>
                    <div className="font-bold">Dispatched</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Customer notified</div>
                  </div>
                </div>
              </div>

              {/* Official Customer-Facing Response */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Official Resolution Draft
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Customer Communication</span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans bg-white dark:bg-slate-900 p-4 rounded-md border border-slate-200 dark:border-slate-800 shadow-xs">
                  {ticket.customer_facing_response || 'Our support operations are currently evaluating your complaint. An official communication will be delivered to your contact channel.'}
                </p>
              </div>

              {/* Link to Inspect in Diff Workspace (For evaluators) */}
              {onInspectTicket && (
                <div className="pt-2 flex items-center justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onInspectTicket(ticket.complaint_id)}
                    className="gap-1.5"
                  >
                    <span>Inspect AI vs. Python verification for this ticket on Agent Desk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* ISSUE FILING MODAL (PRE-FILLED FOR PRODUCT)               */}
      {/* ======================================================== */}
      {filingModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">File Issue on Order #{selectedOrder.orderId}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedOrder.productName}</p>
                </div>
              </div>
              <button 
                onClick={() => setFilingModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFilingSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 dark:text-slate-300">
              
              {/* Product Metadata Bar */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Customer:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Customer Tier:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedOrder.customerTier}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Purchased Date:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedOrder.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Price:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedOrder.price}</span>
                </div>
              </div>

              {/* Issue Title Input */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-900 dark:text-slate-200 block">
                  Complaint / Issue Summary:
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Battery emitting white smoke and sparked"
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Desired Resolution Preference */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-900 dark:text-slate-200 block">
                  Desired Resolution:
                </label>
                <select
                  value={desiredResolution}
                  onChange={(e) => setDesiredResolution(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Replacement Unit">Replacement Unit (Manufacturer Warranty)</option>
                  <option value="Return & Full Refund">Return & Full Refund</option>
                  <option value="Technical Support / Repair">Technical Support / Repair Inspection</option>
                  <option value="Immediate Safety Escalation (Hazard)">Immediate Safety Escalation (Hazard)</option>
                  <option value="Expedited Courier Delivery">Expedited Courier Delivery</option>
                </select>
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-900 dark:text-slate-200 block">
                    Detailed Description of What Happened:
                  </label>
                  <span className="text-[10px] text-slate-500">Will be analyzed by Gemini & Python</span>
                </div>
                <textarea
                  rows={4}
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Describe what occurred, any hazards, or courier tracking behavior..."
                  className="w-full p-3.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans"
                  required
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Protected by SupportNova Zero-AI Ground-Truth Governance
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setFilingModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    disabled={filingSubmitting}
                    className="gap-2"
                  >
                    {filingSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit to SupportNova</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
