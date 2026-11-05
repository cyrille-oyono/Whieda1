import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCategory, ProductService } from '../types';
import { formatMoney, formatPV, getCategoryLabel } from '../utils/formatters';
import { 
  Calendar, 
  ShoppingBag, 
  Users, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  HeartHandshake, 
  Stethoscope, 
  Edit3, 
  CheckCircle, 
  Activity, 
  Award, 
  ArrowRight,
  X,
  ExternalLink,
  Flame,
  Check
} from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface ShowcaseViewProps {
  onNavigate?: (tab: NavTab) => void;
}

export const ShowcaseView: React.FC<ShowcaseViewProps> = ({ onNavigate }) => {
  const { 
    currentUser, 
    companySettings, 
    updateCompanySettings, 
    products, 
    partners,
    addAppointmentRequest,
    addPartnerApplication
  } = useApp();

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');
  
  // Modals
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isAdminEditModalOpen, setIsAdminEditModalOpen] = useState(false);
  const [selectedProductToBuy, setSelectedProductToBuy] = useState<ProductService | null>(null);

  // Success Feedback Toast
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter products with images for carousel
  const carouselProducts = products.filter(p => p.imageUrl && p.category !== 'services');
  const displaySlides = carouselProducts.length > 0 ? carouselProducts : products.slice(0, 6);

  // Auto rotate carousel every 5s if not hovered
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
    if (isPaused || displaySlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % displaySlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, displaySlides.length]);

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % displaySlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + displaySlides.length) % displaySlides.length);
  };

  // Appointment Form State
  const [aptForm, setAptForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferredTime: '09:30',
    serviceType: 'Bilan de Santé Complet Bio-Électronique',
    reason: '',
    sponsorCode: '',
  });

  // Partner Application Form State
  const [partnerForm, setPartnerForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: 'Douala',
    sponsorCode: '',
    motivation: '',
  });

  // Buy / Reservation Form State
  const [buyForm, setBuyForm] = useState({
    fullName: '',
    phone: '',
    quantity: 1,
    deliveryMode: 'retrait_cabinet',
    sponsorCode: '',
    notes: '',
  });

  // Admin Settings Form State
  const [adminSettingsForm, setAdminSettingsForm] = useState(companySettings);

  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAppointmentRequest({
      fullName: aptForm.fullName,
      phone: aptForm.phone,
      email: aptForm.email || undefined,
      preferredDate: aptForm.preferredDate,
      preferredTime: aptForm.preferredTime,
      serviceType: aptForm.serviceType,
      reason: aptForm.reason || 'Demande de consultation / bilan',
      sponsorCode: aptForm.sponsorCode || undefined,
    });
    setIsAppointmentModalOpen(false);
    setSuccessMessage('Votre rendez-vous a été enregistré avec succès ! Notre équipe d’accueil vous contactera sous peu pour confirmation.');
    setTimeout(() => setSuccessMessage(null), 6000);
  };

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPartnerApplication({
      fullName: partnerForm.fullName,
      phone: partnerForm.phone,
      email: partnerForm.email,
      city: partnerForm.city,
      sponsorCode: partnerForm.sponsorCode || undefined,
      motivation: partnerForm.motivation,
    });
    setIsPartnerModalOpen(false);
    setSuccessMessage('Félicitations ! Votre demande d’adhésion partenaire MLM a été transmise. Un conseiller réseau vous contactera.');
    setTimeout(() => setSuccessMessage(null), 6000);
  };

  const handleBuySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBuyModalOpen(false);
    setSuccessMessage(`Votre commande pour "${selectedProductToBuy?.name}" (${buyForm.quantity} unité(s)) a été prise en compte avec succès ! Mode : ${buyForm.deliveryMode === 'retrait_cabinet' ? 'Retrait au comptoir' : 'Livraison express'}.`);
    setTimeout(() => setSuccessMessage(null), 6000);
  };

  const handleAdminSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(adminSettingsForm);
    setIsAdminEditModalOpen(false);
    setSuccessMessage('Les informations de la vitrine ont été mises à jour avec succès !');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Filtered products list for catalog
  const filteredProducts = products.filter(p => {
    if (selectedFilterCategory === 'all') return true;
    return p.category === selectedFilterCategory;
  });

  return (
    <div className="space-y-12 pb-16">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-20 right-6 z-50 max-w-md bg-emerald-900 text-white p-4 rounded-xl shadow-2xl border border-emerald-500/50 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold block text-emerald-200">Confirmation</span>
            <p className="mt-0.5 text-emerald-100">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="ml-auto text-emerald-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner: Contact, Working Hours & Admin Control */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-neutral-700/60">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-neutral-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="truncate max-w-sm">{companySettings.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-orange-500 shrink-0" />
              <span>{companySettings.phone}</span>
              {companySettings.secondaryPhone && (
                <span className="text-neutral-500">| {companySettings.secondaryPhone}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500 shrink-0" />
              <span>{companySettings.workingHours}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
            {currentUser.role === 'admin' ? (
              <button
                onClick={() => {
                  setAdminSettingsForm(companySettings);
                  setIsAdminEditModalOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium transition-all shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Modifier les infos vitrine (Admin)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Centre Agréé Phytothérapie & Bio-Santé</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-stone-900 text-white shadow-2xl border border-neutral-800">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-orange-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 lg:py-20 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>{companySettings.tagline}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            {companySettings.heroHeadline || companySettings.name}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-neutral-300 max-w-3xl leading-relaxed">
            {companySettings.heroSubheadline || companySettings.vision}
          </p>

          {/* 3 Prominent Action Buttons requested */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {/* Button 1: Prendre un rendez-vous */}
            <button
              onClick={() => setIsAppointmentModalOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all flex items-center gap-2.5 transform active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Prendre un rendez-vous</span>
            </button>

            {/* Button 2: Acheter un produit */}
            <button
              onClick={() => {
                setSelectedProductToBuy(products[0]);
                setIsBuyModalOpen(true);
              }}
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-sm shadow-md transition-all flex items-center gap-2.5 transform active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-orange-600" />
              <span>Acheter un produit</span>
            </button>

            {/* Button 3: Devenir partenaire */}
            <button
              onClick={() => setIsPartnerModalOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-orange-400 hover:text-orange-300 font-bold text-sm border border-orange-500/30 transition-all flex items-center gap-2.5 transform active:scale-95"
            >
              <HeartHandshake className="w-4 h-4 text-orange-400" />
              <span>Devenir partenaire</span>
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="mt-12 pt-8 border-t border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-6 text-neutral-300">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">1 250+</div>
              <div className="text-xs text-neutral-400 mt-1">Patients & Bilans réalisés</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">100%</div>
              <div className="text-xs text-neutral-400 mt-1">Phytothérapie certifiée</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">500+</div>
              <div className="text-xs text-neutral-400 mt-1">Partenaires MLM actifs</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">6 Cat.</div>
              <div className="text-xs text-neutral-400 mt-1">Gamme santé intégrée</div>
            </div>
          </div>
        </div>
      </section>

      {/* CARROUSEL DES CATALOGUES DE PRODUITS EN IMAGES ET LEURS FONCTIONS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Catalogue & Vertus Thérapeutiques</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              Nos Produits Phares & Leurs Fonctions
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Découvrez nos formulations exclusives réparties en 6 gammes ciblées : Régulateur, Nettoyage, Entretien, Alimentation, Soins et Services.
            </p>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handlePrevSlide}
              className="p-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors shadow-xs"
              title="Article précédent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-xs font-mono font-medium text-neutral-500 px-2">
              {currentSlide + 1} / {displaySlides.length}
            </div>
            <button
              onClick={handleNextSlide}
              className="p-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors shadow-xs"
              title="Article suivant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Featured Carousel Slide Card */}
        {displaySlides.length > 0 && (
          <div 
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-lg transition-all"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
              {/* Product Visual */}
              <div className="lg:col-span-5 relative bg-gradient-to-br from-neutral-100 to-orange-50/50 p-8 flex items-center justify-center">
                <div className="relative group w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-white shadow-inner flex items-center justify-center p-4">
                  {displaySlides[currentSlide].imageUrl ? (
                    <img
                      src={displaySlides[currentSlide].imageUrl}
                      alt={displaySlides[currentSlide].name}
                      className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-extrabold text-3xl">
                      {displaySlides[currentSlide].name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-neutral-900/80 text-white backdrop-blur-xs">
                      {getCategoryLabel(displaySlides[currentSlide].category)}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-amber-500 text-white shadow-sm">
                      {formatPV(displaySlides[currentSlide].pv)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Details & Functions */}
              <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-xs font-semibold text-neutral-400">
                      Code : {displaySlides[currentSlide].sku}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                      Disponible en pharmacie
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-2">
                    {displaySlides[currentSlide].name}
                  </h3>

                  {/* Function & Benefits description */}
                  <div className="mt-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                    <span className="text-xs font-bold text-orange-700 uppercase tracking-wide block mb-1">
                      Fonctions & Vertus Thérapeutiques :
                    </span>
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      {displaySlides[currentSlide].description || "Formulation naturelle d'excellence pour rééquilibrer le métabolisme, renforcer le système immunitaire et optimiser l'énergie vitale selon les principes holistiques Whieda."}
                    </p>
                  </div>

                  {/* Highlights list */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-orange-600 shrink-0" />
                      <span>Ingrédients 100% bio-disponibles</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-orange-600 shrink-0" />
                      <span>Action ciblée & synergique</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-orange-600 shrink-0" />
                      <span>Prix Partenaire privilégié</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-orange-600 shrink-0" />
                      <span>Points Valeur MLM comptabilisés</span>
                    </div>
                  </div>
                </div>

                {/* Price and Action */}
                <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-neutral-400 block">Prix Public Patient</span>
                    <div className="text-2xl font-black text-neutral-900 font-mono">
                      {formatMoney(displaySlides[currentSlide].patientPrice)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedProductToBuy(displaySlides[currentSlide]);
                        setIsBuyModalOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Commander cet article</span>
                    </button>
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('products')}
                        className="px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <span>Voir tout le stock</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel Slide Indicators */}
            <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-100 flex items-center justify-center gap-2">
              {displaySlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'w-8 bg-orange-600' 
                      : 'w-2 bg-neutral-300 hover:bg-neutral-400'
                  }`}
                  aria-label={`Aller au produit ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* FILTERABLE CATALOGUE GRID (Régulateur, Nettoyage, Entretien, Alimentation, Soins, Services) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-neutral-900">
              Explorer par Catégorie Thérapeutique
            </h3>
            <p className="text-xs text-neutral-500">
              Sélectionnez une catégorie pour découvrir nos solutions holistiques spécifiques.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-neutral-200/80 rounded-xl">
            <button
              onClick={() => setSelectedFilterCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedFilterCategory === 'all'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Tous ({products.length})
            </button>
            {(['regulateur', 'nettoyage', 'entretien', 'alimentation', 'soins', 'services'] as ProductCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedFilterCategory === cat
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800">
                    {getCategoryLabel(product.category)}
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {formatPV(product.pv)}
                  </span>
                </div>

                <div className="h-40 w-full rounded-xl overflow-hidden bg-neutral-100 mb-4 relative flex items-center justify-center">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-neutral-400 text-xs font-semibold">
                      Whieda Smart
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono rounded">
                    {product.sku}
                  </span>
                </div>

                <h4 className="font-bold text-base text-neutral-900 line-clamp-1">
                  {product.name}
                </h4>

                <p className="mt-2 text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                  {product.description || "Solution phytothérapeutique exclusive certifiée Whieda Smart."}
                </p>
              </div>

              <div className="p-5 pt-0 border-t border-neutral-100 mt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 block">Prix Patient</span>
                  <span className="font-mono font-bold text-base text-neutral-900">
                    {formatMoney(product.patientPrice)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedProductToBuy(product);
                    setIsBuyModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Commander</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CABINET DE SANTÉ & EXAMENS MÉDICAUX */}
      <section className="bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 rounded-3xl p-8 sm:p-12 border border-orange-200/70">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-200/70 text-orange-900 text-xs font-bold uppercase tracking-wide">
            <Stethoscope className="w-4 h-4 text-orange-700" />
            <span>Cabinet Médical & Bilans Holistiques</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Consultations, Bilans Biométriques & Ordonnances Personnalisées
          </h2>
          <p className="text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Sous la direction du Dr Eric Kamga, notre cabinet propose des bilans complets : bio-électronique de Vincent, profil lipidique, glycémie, fonction rénale, acide urique, et dépistage précoce couplés à des prescriptions adaptées.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                setAptForm(prev => ({ ...prev, serviceType: 'Bilan de Santé Complet Bio-Électronique' }));
                setIsAppointmentModalOpen(true);
              }}
              className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Réserver mon bilan de santé</span>
            </button>
            <button
              onClick={() => {
                setAptForm(prev => ({ ...prev, serviceType: 'Consultation Dr Kamga' }));
                setIsAppointmentModalOpen(true);
              }}
              className="px-6 py-3 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs border border-neutral-300 shadow-xs transition-all flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4 text-orange-600" />
              <span>Consultation Médicale</span>
            </button>
          </div>
        </div>
      </section>

      {/* VISION & STRUCTURE INFO SECTION */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wide">
            <Flame className="w-4 h-4" />
            <span>Notre Vision Stratégique</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 leading-tight">
            Pourquoi Choisir Whieda Smart ?
          </h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            {companySettings.vision}
          </p>
          <div className="pt-2 space-y-3 text-xs text-neutral-600">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold shrink-0 mt-0.5">1</div>
              <div>
                <span className="font-bold text-neutral-900 block">Approche Médicale Rigoureuse</span>
                Tous nos conseils reposent sur des bilans documentés et un suivi par un médecin agréé.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold shrink-0 mt-0.5">2</div>
              <div>
                <span className="font-bold text-neutral-900 block">Modèle Économique Participatif (MLM)</span>
                Nos patients recommandés génèrent des gains directs automatiques et des Points de Valeur (PV) pour leurs parrains.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold shrink-0 mt-0.5">3</div>
              <div>
                <span className="font-bold text-neutral-900 block">Transparence & Traçabilité</span>
                Chaque visite, prescription et vente au comptoir est enregistrée et archivée avec remise de reçu officiel.
              </div>
            </div>
          </div>
        </div>

        {/* Coordonnées & Horaires */}
        <div className="bg-neutral-50 rounded-2xl p-6 sm:p-8 border border-neutral-200/80 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-base text-neutral-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>Coordonnées & Accès Public</span>
            </h4>
            <div className="space-y-3.5 text-xs text-neutral-700">
              <div>
                <span className="font-semibold text-neutral-500 block">Structure :</span>
                <span className="font-bold text-neutral-900 text-sm">{companySettings.name}</span>
              </div>
              <div>
                <span className="font-semibold text-neutral-500 block">Adresse :</span>
                <span>{companySettings.address}</span>
              </div>
              <div>
                <span className="font-semibold text-neutral-500 block">Horaires de consultation & caisse :</span>
                <span>{companySettings.workingHours}</span>
              </div>
              <div>
                <span className="font-semibold text-neutral-500 block">Téléphones :</span>
                <span className="font-mono">{companySettings.phone} {companySettings.secondaryPhone && ` / ${companySettings.secondaryPhone}`}</span>
              </div>
              <div>
                <span className="font-semibold text-neutral-500 block">Email officiel :</span>
                <span className="font-mono">{companySettings.email}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-200">
            <button
              onClick={() => setIsPartnerModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <HeartHandshake className="w-4 h-4 text-orange-400" />
              <span>Rejoindre le Réseau de Partenaires MLM</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODAL 1: PRENDRE UN RENDEZ-VOUS */}
      {/* ========================================================================= */}
      {isAppointmentModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm">Prendre un Rendez-vous</h3>
                  <p className="text-[11px] text-orange-100">Consultation médicale ou bilan de santé</p>
                </div>
              </div>
              <button onClick={() => setIsAppointmentModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAppointmentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nom complet du patient *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Jean Emmanuel Moukoko"
                  value={aptForm.fullName}
                  onChange={e => setAptForm({ ...aptForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Téléphone (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+237 6xx xx xx xx"
                    value={aptForm.phone}
                    onChange={e => setAptForm({ ...aptForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email (optionnel)
                  </label>
                  <input
                    type="email"
                    placeholder="patient@email.com"
                    value={aptForm.email}
                    onChange={e => setAptForm({ ...aptForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Prestation souhaitée *
                </label>
                <select
                  value={aptForm.serviceType}
                  onChange={e => setAptForm({ ...aptForm, serviceType: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="Bilan de Santé Complet Bio-Électronique">Bilan de Santé Complet Bio-Électronique</option>
                  <option value="Consultation Dr Kamga">Consultation Dr Kamga (Médecine Holistique)</option>
                  <option value="Bilan Lipidique & Cardiovasculaire">Bilan Lipidique & Cardiovasculaire</option>
                  <option value="Bilan Rénal, Électrolytique & Acide Urique">Bilan Rénal, Électrolytique & Acide Urique</option>
                  <option value="Retrait Ordonnance & Conseils Phytothérapie">Retrait Ordonnance & Conseils Phytothérapie</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Date souhaitée *
                  </label>
                  <input
                    type="date"
                    required
                    value={aptForm.preferredDate}
                    onChange={e => setAptForm({ ...aptForm, preferredDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Heure souhaitée *
                  </label>
                  <input
                    type="time"
                    required
                    value={aptForm.preferredTime}
                    onChange={e => setAptForm({ ...aptForm, preferredTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Partenaire Parrain (Code Parrain si vous êtes recommandé)
                </label>
                <input
                  type="text"
                  placeholder="ex: WH-PTN-101 (optionnel)"
                  value={aptForm.sponsorCode}
                  onChange={e => setAptForm({ ...aptForm, sponsorCode: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Motif ou symptômes
                </label>
                <textarea
                  rows={2}
                  placeholder="ex: Fatigue intense, hypertension, douleurs articulaires..."
                  value={aptForm.reason}
                  onChange={e => setAptForm({ ...aptForm, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAppointmentModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-700 text-white shadow-xs"
                >
                  Confirmer le rendez-vous
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ACHETER UN PRODUIT / COMMANDER */}
      {/* ========================================================================= */}
      {isBuyModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm">Commande & Réservation Produit</h3>
                  <p className="text-[11px] text-orange-100">Pharmacie & Boutique Whieda Smart</p>
                </div>
              </div>
              <button onClick={() => setIsBuyModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBuySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Produit sélectionné *
                </label>
                <select
                  value={selectedProductToBuy?.id || ''}
                  onChange={e => {
                    const prod = products.find(p => p.id === e.target.value);
                    if (prod) setSelectedProductToBuy(prod);
                  }}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({getCategoryLabel(p.category)}) - {formatMoney(p.patientPrice)} [{formatPV(p.pv)}]
                    </option>
                  ))}
                </select>
              </div>

              {selectedProductToBuy && (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-neutral-500 block">Prix Public :</span>
                    <span className="font-mono font-bold text-neutral-900">{formatMoney(selectedProductToBuy.patientPrice)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Points Valeur :</span>
                    <span className="font-mono font-bold text-amber-600">{formatPV(selectedProductToBuy.pv)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Sous-total :</span>
                    <span className="font-mono font-extrabold text-orange-700">
                      {formatMoney(selectedProductToBuy.patientPrice * buyForm.quantity)}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Quantité
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={buyForm.quantity}
                    onChange={e => setBuyForm({ ...buyForm, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Mode de retrait *
                  </label>
                  <select
                    value={buyForm.deliveryMode}
                    onChange={e => setBuyForm({ ...buyForm, deliveryMode: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="retrait_cabinet">Retrait au Comptoir Pharmacie</option>
                    <option value="livraison_domicile">Livraison Express à Domicile</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Votre Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="M./Mme..."
                    value={buyForm.fullName}
                    onChange={e => setBuyForm({ ...buyForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Téléphone (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+237 6xx xx xx xx"
                    value={buyForm.phone}
                    onChange={e => setBuyForm({ ...buyForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Code Partenaire Parrain (facultatif)
                </label>
                <input
                  type="text"
                  placeholder="ex: WH-PTN-101"
                  value={buyForm.sponsorCode}
                  onChange={e => setBuyForm({ ...buyForm, sponsorCode: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBuyModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-700 text-white shadow-xs"
                >
                  Valider la commande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DEVENIR PARTENAIRE MLM */}
      {/* ========================================================================= */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HeartHandshake className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm">Devenir Partenaire Whieda Smart</h3>
                  <p className="text-[11px] text-orange-100">Bâtissez votre indépendance financière dans la santé</p>
                </div>
              </div>
              <button onClick={() => setIsPartnerModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePartnerSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 text-xs text-orange-950">
                <span className="font-bold block mb-1">Avantages du Statut Partenaire :</span>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-orange-900">
                  <li>Prix d'achat préférentiel réseau et marge directe immédiate.</li>
                  <li>Accumulation automatique de Points de Valeur (PV) sur chaque patient recommandé.</li>
                  <li>Paiement des commissions par Orange Money, MTN MoMo ou virement bancaire.</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nom et Prénom *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Samuel Eboule"
                  value={partnerForm.fullName}
                  onChange={e => setPartnerForm({ ...partnerForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Téléphone (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+237 6xx xx xx xx"
                    value={partnerForm.phone}
                    onChange={e => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email de contact *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="partenaire@email.com"
                    value={partnerForm.email}
                    onChange={e => setPartnerForm({ ...partnerForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Ville de résidence *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Douala, Yaoundé, Bafoussam..."
                    value={partnerForm.city}
                    onChange={e => setPartnerForm({ ...partnerForm, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Code du Parrain Up (Recommandant)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: WH-PTN-101"
                    value={partnerForm.sponsorCode}
                    onChange={e => setPartnerForm({ ...partnerForm, sponsorCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Votre motivation / Activité actuelle
                </label>
                <textarea
                  rows={2}
                  placeholder="ex: Professionnel de santé, commerçant, leader associatif..."
                  value={partnerForm.motivation}
                  onChange={e => setPartnerForm({ ...partnerForm, motivation: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-700 text-white shadow-xs"
                >
                  Soumettre ma candidature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: MODIFICATION DES INFOS DE LA VITRINE (ADMIN UNIQUEMENT) */}
      {/* ========================================================================= */}
      {isAdminEditModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-neutral-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-neutral-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-orange-500" />
                <div>
                  <h3 className="font-bold text-sm">Paramètres de la Vitrine Publique (Admin)</h3>
                  <p className="text-[11px] text-neutral-400">Modifiez le nom, la vision, le logo, les contacts et les horaires</p>
                </div>
              </div>
              <button onClick={() => setIsAdminEditModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminSettingsSave} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Nom de la Structure *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminSettingsForm.name}
                    onChange={e => setAdminSettingsForm({ ...adminSettingsForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Slogan / Tagline *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminSettingsForm.tagline}
                    onChange={e => setAdminSettingsForm({ ...adminSettingsForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Vision de la Structure *
                </label>
                <textarea
                  rows={3}
                  required
                  value={adminSettingsForm.vision}
                  onChange={e => setAdminSettingsForm({ ...adminSettingsForm, vision: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Adresse Complète *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminSettingsForm.address}
                    onChange={e => setAdminSettingsForm({ ...adminSettingsForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Email de contact *
                  </label>
                  <input
                    type="email"
                    required
                    value={adminSettingsForm.email}
                    onChange={e => setAdminSettingsForm({ ...adminSettingsForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Téléphone Principal *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminSettingsForm.phone}
                    onChange={e => setAdminSettingsForm({ ...adminSettingsForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Téléphone Secondaire
                  </label>
                  <input
                    type="text"
                    value={adminSettingsForm.secondaryPhone || ''}
                    onChange={e => setAdminSettingsForm({ ...adminSettingsForm, secondaryPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Horaires de Travail *
                </label>
                <input
                  type="text"
                  required
                  value={adminSettingsForm.workingHours}
                  onChange={e => setAdminSettingsForm({ ...adminSettingsForm, workingHours: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Titre Hero d'accueil
                </label>
                <input
                  type="text"
                  value={adminSettingsForm.heroHeadline}
                  onChange={e => setAdminSettingsForm({ ...adminSettingsForm, heroHeadline: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Sous-titre Hero d'accueil
                </label>
                <textarea
                  rows={2}
                  value={adminSettingsForm.heroSubheadline}
                  onChange={e => setAdminSettingsForm({ ...adminSettingsForm, heroSubheadline: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdminEditModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold rounded-lg bg-orange-600 hover:bg-orange-700 text-white shadow-xs"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
