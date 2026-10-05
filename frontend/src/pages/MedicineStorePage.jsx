import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import {
  Pill,
  Search,
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  Upload,
  AlertTriangle,
  Clock,
  Package,
  Truck,
  CreditCard,
  Plus,
  Minus,
  Trash2,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Smartphone,
  Building2,
  Banknote,
  Star
} from 'lucide-react';

export default function MedicineStorePage() {
  const { user, cartCount, refreshCart, toast } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [rxOnly, setRxOnly] = useState(false);

  // Price Compare Modal State
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  // Cart Drawer State
  const [cartModalOpen, setCartModalOpen] = useState(searchParams.get('cart') === 'open');
  const [cartData, setCartData] = useState({ items: [], summary: {} });
  const [cartLoading, setCartLoading] = useState(false);

  // Checkout State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('Apartment 4B, Lotus Heights, Outer Ring Road, Bangalore - 560103');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Orders State / History
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrderTracking, setSelectedOrderTracking] = useState(null);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (searchTerm) query.append('search', searchTerm);
      if (selectedCategory !== 'All') query.append('category', selectedCategory);
      if (rxOnly) query.append('prescription_required', '1');

      const res = await api.get(`/medicines?${query.toString()}`);
      if (res.success) {
        setMedicines(res.medicines || []);
        if (res.categories) setCategories(res.categories);
      }
    } catch (err) {
      toast.error('Failed to load pharmacy medicines.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [searchTerm, selectedCategory, rxOnly]);

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const res = await api.get('/cart');
      if (res.success) {
        setCartData(res);
      }
    } catch (err) {
      // ignore
    } finally {
      setCartLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      toast.error('Failed to load order history.');
    }
  };

  const handleAddToCart = async (medicine, seller) => {
    if (!user) {
      toast.info('Please sign in to add medicines to your cart.');
      return;
    }

    try {
      await api.post('/cart', {
        medicine_id: medicine.id,
        seller_id: seller.id,
        quantity: 1
      });
      toast.success(`Added ${medicine.name} (${seller.seller_name}) to cart!`);
      await refreshCart();
      if (compareModalOpen) setCompareModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart');
    }
  };

  const handleUpdateCartQty = async (cartItemId, newQty) => {
    try {
      await api.put(`/cart/${cartItemId}`, { quantity: newQty });
      fetchCart();
      refreshCart();
    } catch (err) {
      toast.error('Failed to update cart');
    }
  };

  const handleRemoveCartItem = async (cartItemId) => {
    try {
      await api.delete(`/cart/${cartItemId}`);
      toast.info('Item removed from cart');
      fetchCart();
      refreshCart();
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleOpenCart = async () => {
    await fetchCart();
    setCartModalOpen(true);
  };

  const handleOpenCheckout = () => {
    setCartModalOpen(false);
    setCheckoutModalOpen(true);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!shippingAddress) {
      toast.error('Please enter a delivery address.');
      return;
    }

    if (cartData.summary?.prescriptionRequired && !prescriptionFile) {
      toast.error('Prescription required: Please upload your doctor prescription.');
      return;
    }

    setCheckoutLoading(true);
    try {
      const formData = new FormData();
      formData.append('shipping_address', shippingAddress);
      formData.append('payment_method', paymentMethod);
      if (prescriptionFile) {
        formData.append('prescription_file', prescriptionFile);
      }

      const res = await api.post('/orders/checkout', formData);
      toast.success(res.message);
      setCheckoutModalOpen(false);
      setPrescriptionFile(null);
      await refreshCart();

      // Show order tracking
      handleViewOrderTracking(res.order.id);
    } catch (err) {
      toast.error(err.message || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleViewOrderTracking = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      if (res.success) {
        setSelectedOrderTracking(res.order);
        setOrdersModalOpen(true);
      }
    } catch (err) {
      toast.error('Failed to load tracking');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header with Cart & Orders Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900/60 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight font-['Poppins']">
              MediCare Medicine Store
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compare prices across Apollo, Tata 1mg, Netmeds, and PharmEasy. Verified CDSCO batches with best price assurance.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {user && (
            <button
              onClick={() => {
                fetchOrders();
                setOrdersModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Package className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Order History</span>
            </button>
          )}

          <button
            onClick={handleOpenCart}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-xs flex items-center space-x-2 transition-colors focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>My Cart ({cartCount})</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search medicine brand, generic salt name, composition..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>

          <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer shrink-0 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              checked={rxOnly}
              onChange={(e) => setRxOnly(e.target.checked)}
              className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
            />
            <span>Prescription Required (Rx Only)</span>
          </label>
        </div>

        {/* Category Pills - Mobile Scrollable */}
        <div className="flex items-center space-x-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Medicines Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : medicines.length === 0 ? (
        <EmptyState
          title="No medicines match your search"
          description="Try searching by generic salt (e.g. Paracetamol, Amoxicillin, Telmisartan) or reset category."
          actionLabel="Clear Filter"
          onAction={() => {
            setSearchTerm('');
            setSelectedCategory('All');
            setRxOnly(false);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {medicines.map((med) => {
            const bestSeller = med.sellers?.find(s => s.is_best_price === 1) || med.sellers?.[0];

            return (
              <div
                key={med.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs card-hover transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Top Image & Badges */}
                  <div className="relative rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 mb-4 h-40 flex items-center justify-center p-3">
                    <img
                      src={med.image_url}
                      alt={med.name}
                      className="max-h-32 w-auto object-contain"
                    />

                    {/* Verified Green Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center space-x-1 bg-white/95 dark:bg-slate-900/90 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-md text-[10px] font-medium shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>Verified Genuine</span>
                    </div>

                    {med.prescription_required === 1 && (
                      <div className="absolute top-2.5 right-2.5 bg-warmrose-50 dark:bg-warmrose-950/40 text-warmrose-700 dark:text-warmrose-300 border border-warmrose-200 dark:border-warmrose-900/60 px-2 py-0.5 rounded-md text-[10px] font-medium">
                        Rx Required
                      </div>
                    )}
                  </div>

                  {/* Category & Title */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {med.category} • {med.packaging}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1 font-['Poppins']">
                      {med.name}
                    </h3>
                    <p className="text-xs text-primary-700 dark:text-primary-400 font-medium line-clamp-1">
                      {med.composition}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Mfr: {med.manufacturer}
                    </p>
                  </div>

                  {/* Price Comparison Summary Box */}
                  <div className="mt-3.5 p-3 rounded-lg bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-semibold text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center space-x-1">
                        <TrendingDown className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>Best Price ({bestSeller?.seller_name})</span>
                      </span>
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span className="text-base font-bold text-slate-900 dark:text-slate-100">₹{med.bestPrice}</span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 line-through">₹{med.base_price}</span>
                        <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                          {med.discount_percentage}% OFF
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedMedicine(med);
                        setCompareModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-750 text-teal-800 dark:text-teal-300 text-[11px] font-medium border border-teal-200 dark:border-teal-800 shadow-2xs transition-colors"
                    >
                      Compare {med.sellerCount} Sellers
                    </button>
                  </div>

                  {/* License & Batch assurance */}
                  <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between px-1">
                    <span>Batch: {med.verified_batch_no}</span>
                    <span>License: {med.verified_license_no}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedMedicine(med);
                      setCompareModalOpen(true);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors"
                  >
                    Compare Sellers
                  </button>

                  <button
                    onClick={() => handleAddToCart(med, bestSeller)}
                    className="flex-1 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-xs transition-colors flex items-center justify-center space-x-1 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MULTI-SELLER PRICE COMPARISON MODAL */}
      <Modal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        title={selectedMedicine ? `Compare Prices: ${selectedMedicine.name}` : 'Compare Prices'}
        maxWidth="max-w-xl"
      >
        {selectedMedicine && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start space-x-3 text-xs">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-200">
                <Pill className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">{selectedMedicine.name}</h4>
                <p className="text-slate-500">{selectedMedicine.composition}</p>
                <div className="mt-1 flex items-center space-x-2 text-[11px] text-medgreen-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Licensed CDSCO Batch: {selectedMedicine.verified_batch_no}</span>
                </div>
              </div>
            </div>

            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Available Certified Sellers ({selectedMedicine.sellers?.length})
            </h4>

            <div className="space-y-2">
              {selectedMedicine.sellers?.map((seller) => {
                const isBest = seller.is_best_price === 1;

                return (
                  <div
                    key={seller.id}
                    className={`p-3 rounded-lg border transition-colors flex items-center justify-between ${
                      isBest
                        ? 'bg-emerald-50/50 border-medgreen-400'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-slate-900">{seller.seller_name}</span>
                        {isBest && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.2 rounded bg-medgreen-600 text-white">
                            Best Price
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                        <span>Delivery: <strong>{seller.delivery_days}</strong></span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{seller.rating}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold text-slate-900">
                        ₹{seller.price.toFixed(2)}
                      </span>

                      <button
                        onClick={() => handleAddToCart(selectedMedicine, seller)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-xs flex items-center space-x-1 ${
                          isBest
                            ? 'bg-medgreen-600 hover:bg-medgreen-700 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Select</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* CART DRAWER / MODAL */}
      <Modal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        title="Your Medicine Cart"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          {cartLoading ? (
            <CardSkeleton />
          ) : cartData.items?.length === 0 ? (
            <EmptyState
              title="Your cart is currently empty"
              description="Browse our verified medicines catalog and select the best price sellers."
              actionLabel="Shop Medicines"
              onAction={() => setCartModalOpen(false)}
            />
          ) : (
            <>
              {/* Prescription Warning Banner */}
              {cartData.summary?.prescriptionRequired && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start space-x-2 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Prescription Required (Rx):</span> One or more items in your cart require a valid physician's prescription. You can upload it during checkout.
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {cartData.items?.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5 flex-1 pr-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-slate-900 text-sm line-clamp-1">{item.medicine_name}</span>
                        {item.prescription_required === 1 && (
                          <span className="text-[9px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">Rx</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">Seller: {item.seller_name} • ₹{item.seller_price} each</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-md p-1">
                        <button
                          onClick={() => handleUpdateCartQty(item.id, item.quantity - 1)}
                          className="p-1 text-slate-500 hover:text-slate-800"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-semibold px-1 text-xs">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateCartQty(item.id, item.quantity + 1)}
                          className="p-1 text-slate-500 hover:text-slate-800"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-semibold text-slate-900 text-sm w-16 text-right">
                        ₹{(item.seller_price * item.quantity).toFixed(2)}
                      </span>

                      <button
                        onClick={() => handleRemoveCartItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Summary */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{cartData.summary?.subtotal?.toFixed(2)}</span>
                </div>
                {cartData.summary?.discount > 0 && (
                  <div className="flex justify-between text-medgreen-700 font-medium">
                    <span>Discount</span>
                    <span>-₹{cartData.summary?.discount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span>{cartData.summary?.deliveryFee === 0 ? 'FREE' : `₹${cartData.summary?.deliveryFee}`}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                  <span>Total Amount</span>
                  <span>₹{cartData.summary?.total?.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleOpenCheckout}
                className="w-full py-2.5 rounded-lg bg-medgreen-600 hover:bg-medgreen-700 text-white font-medium text-sm shadow-xs transition-colors flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </Modal>

      {/* CHECKOUT MODAL (With Mock Payment Gateway Integration) */}
      <Modal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title="Secure Checkout"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
          {/* Prescription Upload Box if Rx required */}
          {cartData.summary?.prescriptionRequired && (
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <label className="block font-semibold text-slate-900 uppercase tracking-wider">
                Upload Doctor Prescription (Required for Rx items) *
              </label>
              <input
                type="file"
                required
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setPrescriptionFile(e.target.files[0])}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary-600 file:text-white hover:file:bg-primary-700 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                A licensed pharmacist will verify this prescription prior to order packaging.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Delivery Address *
            </label>
            <textarea
              rows={2}
              required
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Full shipping address with pincode and apartment number"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Mock Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'UPI', label: 'UPI / QR Code', icon: Smartphone },
                { key: 'Card', label: 'Credit / Debit Card', icon: CreditCard },
                { key: 'Net Banking', label: 'Net Banking', icon: Building2 },
                { key: 'Cash on Delivery', label: 'Cash on Delivery', icon: Banknote }
              ].map((m) => {
                const MethodIcon = m.icon;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setPaymentMethod(m.key)}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center space-x-2 transition-colors ${
                      paymentMethod === m.key
                        ? 'bg-medgreen-50 border-medgreen-500 text-medgreen-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <MethodIcon className="w-4 h-4 text-slate-600" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-tight">
            <strong>Mock Gateway Integration Point:</strong> Payments simulate a Stripe / Razorpay token exchange. No real card will be charged.
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={checkoutLoading}
              className="w-full py-2.5 rounded-lg bg-medgreen-600 hover:bg-medgreen-700 text-white font-medium text-sm shadow-xs disabled:opacity-60 transition-colors"
            >
              {checkoutLoading ? 'Processing Order...' : `Pay ₹${cartData.summary?.total?.toFixed(2)} & Place Order`}
            </button>
          </div>
        </form>
      </Modal>

      {/* ORDER HISTORY & TRACKING MODAL */}
      <Modal
        isOpen={ordersModalOpen}
        onClose={() => setOrdersModalOpen(false)}
        title={selectedOrderTracking ? `Track Order: ${selectedOrderTracking.order_number}` : 'Order History'}
        maxWidth="max-w-xl"
      >
        {selectedOrderTracking ? (
          <div className="space-y-4">
            {/* Tracking Progress Bar */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-semibold text-slate-900">Status: {selectedOrderTracking.status}</span>
                  <p className="text-[11px] text-slate-500">Order No: {selectedOrderTracking.order_number}</p>
                </div>
                <span className="text-sm font-bold text-medgreen-700">₹{selectedOrderTracking.final_amount}</span>
              </div>

              {/* 5-Stage Tracker */}
              <div className="space-y-3">
                {selectedOrderTracking.trackingTimeline?.map((stage, sIdx) => (
                  <div key={stage.key} className="flex items-start space-x-3 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${
                      stage.completed
                        ? 'bg-medgreen-600 text-white shadow-2xs'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {stage.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : sIdx + 1}
                    </div>
                    <div>
                      <p className={`font-semibold ${stage.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                        {stage.label}
                      </p>
                      <p className="text-[11px] text-slate-500">{stage.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedOrderTracking(null)}
              className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
            >
              Back to All Orders
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {orders.length === 0 ? (
              <EmptyState
                title="No past orders"
                description="Orders you place in the medicine store will appear here with live tracking stages."
              />
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900 text-sm">{ord.order_number}</span>
                      <span className="text-[10px] font-medium px-2 py-0.2 rounded-md bg-medgreen-50 text-medgreen-800 border border-medgreen-200">
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {ord.items?.length || 1} item(s) • Total: ₹{ord.final_amount}
                    </p>
                    <p className="text-[11px] text-slate-400">Placed on {ord.created_at?.split(' ')[0]}</p>
                  </div>

                  <button
                    onClick={() => handleViewOrderTracking(ord.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center space-x-1 transition-colors"
                  >
                    <span>Track</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
