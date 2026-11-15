'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../components/dashboard/Sidebar';
import { Header } from '../../components/dashboard/Header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CivilAIAssistantModal } from '../../components/ai/CivilAIAssistantModal';
import { 
  Search, Star, MapPin, BadgeCheck, Check, 
  Bot, Truck, Plus, Minus, ShoppingCart, Sparkles 
} from 'lucide-react';

interface MaterialItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  currency: string;
  supplier: string;
  minOrder: number;
  deliveryDays: number;
  spec: string;
}

const MATERIAL_CATALOG: MaterialItem[] = [
  {
    id: 'mat-1',
    name: 'OPC 53 Grade Cement',
    category: 'Cement & Concrete',
    unit: 'Bag (50kg)',
    unitPrice: 380,
    currency: '₹',
    supplier: 'Alpha Concrete Supplies',
    minOrder: 50,
    deliveryDays: 1,
    spec: 'High compressive strength 53 MPa for RCC Slabs & Beams',
  },
  {
    id: 'mat-2',
    name: 'Fe 550 TMT Rebar (12mm)',
    category: 'Steel & Metals',
    unit: 'Metric Ton (MT)',
    unitPrice: 62500,
    currency: '₹',
    supplier: 'Apex Structural Builders',
    minOrder: 1,
    deliveryDays: 2,
    spec: 'Ductile corrosion-resistant thermo-mechanically treated steel',
  },
  {
    id: 'mat-3',
    name: 'AAC Light Blocks (600x200x150mm)',
    category: 'Masonry & Bricks',
    unit: 'Piece',
    unitPrice: 68,
    currency: '₹',
    supplier: 'Greenwood Brick & Masonry',
    minOrder: 200,
    deliveryDays: 2,
    spec: 'Thermal insulation grade masonry blocks for interior walls',
  },
  {
    id: 'mat-4',
    name: 'Coarse River Sand (Zone II)',
    category: 'Aggregates & Sand',
    unit: 'Brass (100 CFT)',
    unitPrice: 5400,
    currency: '₹',
    supplier: 'Alpha Concrete Supplies',
    minOrder: 1,
    deliveryDays: 1,
    spec: 'Silt content < 3%, washed sharp river sand for concrete',
  },
  {
    id: 'mat-5',
    name: '20mm Crushed Blue Metal Aggregate',
    category: 'Aggregates & Sand',
    unit: 'Brass (100 CFT)',
    unitPrice: 4200,
    currency: '₹',
    supplier: 'Alpha Concrete Supplies',
    minOrder: 1,
    deliveryDays: 1,
    spec: 'Hard angular granite metal for RCC concrete mix',
  },
  {
    id: 'mat-6',
    name: 'Vitrified Floor Tiles (2x2 ft)',
    category: 'Finishes & Paints',
    unit: 'Box (4 Pcs / 16 Sq.Ft)',
    unitPrice: 850,
    currency: '₹',
    supplier: 'Greenwood Brick & Masonry',
    minOrder: 10,
    deliveryDays: 3,
    spec: 'Double charged stain-resistant high gloss tiles',
  },
];

export default function MarketplacePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [orderedSuccess, setOrderedSuccess] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  const categories = ['All', 'Cement & Concrete', 'Steel & Metals', 'Masonry & Bricks', 'Aggregates & Sand', 'Finishes & Paints'];

  const filteredMaterials = MATERIAL_CATALOG.filter(m => {
    const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleQuantityChange = (id: string, delta: number, minOrder: number) => {
    setCart(prev => {
      const current = prev[id] || 0;
      let updated = current + delta;
      if (updated < 0) updated = 0;
      if (updated > 0 && updated < minOrder && current === 0 && delta > 0) {
        updated = minOrder;
      } else if (updated > 0 && updated < minOrder && delta < 0) {
        updated = 0;
      }
      return { ...prev, [id]: updated };
    });
  };

  const totalCartCount = Object.values(cart).reduce((sum, q) => sum + (q > 0 ? 1 : 0), 0);
  const totalCartCost = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = MATERIAL_CATALOG.find(m => m.id === id);
    return sum + (item ? item.unitPrice * qty : 0);
  }, 0);

  const handleCheckout = () => {
    if (totalCartCount === 0) return;
    setOrderedSuccess(true);
    setTimeout(() => {
      setCart({});
      setOrderedSuccess(false);
    }, 3500);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/40">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} title="Material Marketplace & Procurement" />

        {/* Content canvas */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            
            {/* Top Banner & AI Assistant Launcher */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-xl">
              <div className="space-y-2 z-10 max-w-2xl">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-amber-500 text-slate-950 uppercase tracking-wider">
                    <Truck className="h-3 w-3" />
                    <span>Direct Material Ordering</span>
                  </span>
                </div>
                <h2 className="text-xl font-extrabold tracking-tight">Direct Site Supply Marketplace</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Order verified civil construction materials directly with standard unit pricing. All orders are processed with instant site delivery dispatch.
                </p>
              </div>

              {/* Civil AI Assistant Action Trigger */}
              <div className="z-10 flex items-center space-x-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15">
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-1">
                    <Bot className="h-4 w-4 text-amber-400" />
                    <span>Civil AI Assistant</span>
                  </div>
                  <p className="text-[10px] text-slate-300">Got questions on mix ratios or rebar weight?</p>
                </div>
                <Button
                  onClick={() => setIsAiAssistantOpen(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md whitespace-nowrap"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Ask Civil AI
                </Button>
              </div>
            </div>

            {/* Success Order Alert */}
            {orderedSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center space-x-3 shadow-sm animate-fade-in">
                <Check className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Material Order Dispatched Successfully!</h4>
                  <p className="text-2xs text-emerald-700 font-semibold mt-0.5">Your procurement order has been sent to vendors. Delivery confirmation will arrive shortly.</p>
                </div>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cement bags, TMT steel rebar, aggregate..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-3xs font-bold transition-all whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((mat) => {
                const currentQty = cart[mat.id] || 0;
                return (
                  <Card key={mat.id} hoverEffect className="flex flex-col justify-between border border-slate-100 bg-white">
                    <div>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-4xs font-bold uppercase tracking-wider">
                            {mat.category}
                          </span>
                          <span className="text-emerald-600 flex items-center space-x-0.5 text-4xs font-extrabold uppercase tracking-wide">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            <span>Verified Supplier</span>
                          </span>
                        </div>
                        <CardTitle className="text-base font-bold text-slate-900 mt-2">
                          {mat.name}
                        </CardTitle>
                        <CardDescription className="text-2xs text-slate-400 font-medium">
                          Supplier: {mat.supplier} &bull; Delivery in {mat.deliveryDays} day{mat.deliveryDays > 1 ? 's' : ''}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-2xs text-slate-600">
                          <span className="font-semibold block text-slate-455 text-3xs uppercase tracking-wider mb-1">Specifications</span>
                          {mat.spec}
                        </div>

                        <div className="flex items-baseline justify-between pt-1">
                          <div>
                            <span className="text-lg font-extrabold text-slate-950">{mat.currency} {mat.unitPrice.toLocaleString()}</span>
                            <span className="text-2xs text-slate-400 font-semibold ml-1">/ {mat.unit}</span>
                          </div>
                          <span className="text-3xs font-bold text-slate-400">Min Order: {mat.minOrder} {mat.unit.split(' ')[0]}s</span>
                        </div>
                      </CardContent>
                    </div>

                    {/* Quantity Selector & Order Button */}
                    <div className="p-6 border-t border-slate-50 mt-4 pt-4 flex items-center justify-between">
                      {currentQty === 0 ? (
                        <Button
                          size="sm"
                          onClick={() => handleQuantityChange(mat.id, mat.minOrder, mat.minOrder)}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1.5" />
                          <span>Add to Order</span>
                        </Button>
                      ) : (
                        <div className="flex items-center justify-between w-full bg-slate-100 rounded-xl p-1">
                          <button
                            onClick={() => handleQuantityChange(mat.id, -1, mat.minOrder)}
                            className="p-1.5 rounded-lg bg-white text-slate-700 shadow-xs hover:bg-slate-200"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-xs font-bold text-slate-900 px-3">
                            {currentQty} {mat.unit.split(' ')[0]}s
                          </span>
                          <button
                            onClick={() => handleQuantityChange(mat.id, 1, mat.minOrder)}
                            className="p-1.5 rounded-lg bg-white text-slate-700 shadow-xs hover:bg-slate-200"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Shopping Cart Sticky Footer Summary Bar */}
            {totalCartCount > 0 && (
              <div className="sticky bottom-6 z-30 max-w-4xl mx-auto bg-slate-900 text-white p-4 px-6 rounded-2xl shadow-2xl flex items-center justify-between animate-fade-in border border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Procurement Cart ({totalCartCount} Material Item{totalCartCount > 1 ? 's' : ''})
                    </div>
                    <div className="text-base font-extrabold text-white">
                      Total Order: ₹ {totalCartCost.toLocaleString()}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md"
                >
                  Confirm Order & Dispatch →
                </Button>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Civil Engineering AI Assistant Modal */}
      <CivilAIAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />
    </div>
  );
}
