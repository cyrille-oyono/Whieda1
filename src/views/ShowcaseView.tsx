import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCategory, ProductService, AssociatedCenter } from '../types';
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
  Check,
  Share2,
  Copy,
  QrCode,
  Building2,
  Trash2,
  Plus,
  Search,
  MessageCircle,
  Smartphone,
  Navigation,
  CheckCheck
} from 'lucide-react';
import { NavTab } from '../components/Sidebar';

// Pixel-perfect official Brand Icons for WhatsApp, Facebook, TikTok
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

export const FacebookIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export const TikTokIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.02 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

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
    addPartnerApplication,
    associatedCenters,
    addAssociatedCenter,
    updateAssociatedCenter,
    deleteAssociatedCenter
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

  // Requirement 2: Option Partager l'Application
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Requirement 3: Centres Whieda Associés State & Filter
  const [selectedCenterCity, setSelectedCenterCity] = useState<string>('all');
  const [searchCenterQuery, setSearchCenterQuery] = useState('');
  const [isCenterModalOpen, setIsCenterModalOpen] = useState(false);
  const [centerToEdit, setCenterToEdit] = useState<AssociatedCenter | null>(null);
  const [centerForm, setCenterForm] = useState({
    name: '',
    address: '',
    phone: '',
    manager: '',
    city: 'Douala',
    workingHours: 'Lun - Ven: 08h00 - 18h30 | Sam: 08h30 - 15h00',
    email: '',
    status: 'actif' as 'actif' | 'en_ouverture',
  });

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

  // Share Handlers
  const handleCopyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

  const handleNativeShare = () => {
    const shareData = {
      title: 'Whieda Smart - Cabinet de Santé & Réseau de Prospérité',
      text: "Découvrez l'application Whieda Smart : soins de santé intégrative, bilans bio-électroniques, pharmacie naturelle et opportunité MLM !",
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      handleCopyShareLink();
    }
  };

  // Associated Centers Handlers
  const handleOpenAddCenter = () => {
    setCenterToEdit(null);
    setCenterForm({
      name: '',
      address: '',
      phone: '+237 ',
      manager: '',
      city: 'Douala',
      workingHours: 'Lun - Ven: 08h00 - 18h30 | Sam: 08h30 - 15h00',
      email: '',
      status: 'actif',
    });
    setIsCenterModalOpen(true);
  };

  const handleOpenEditCenter = (center: AssociatedCenter) => {
    setCenterToEdit(center);
    setCenterForm({
      name: center.name,
      address: center.address,
      phone: center.phone,
      manager: center.manager,
      city: center.city,
      workingHours: center.workingHours || 'Lun - Ven: 08h00 - 18h30 | Sam: 08h30 - 15h00',
      email: center.email || '',
      status: center.status || 'actif',
    });
    setIsCenterModalOpen(true);
  };

  const handleSaveCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (centerToEdit) {
      updateAssociatedCenter(centerToEdit.id, centerForm);
      setSuccessMessage(`Le centre "${centerForm.name}" a été mis à jour avec succès.`);
    } else {
      addAssociatedCenter(centerForm);
      setSuccessMessage(`Le centre associé "${centerForm.name}" a été ajouté avec succès.`);
    }
    setIsCenterModalOpen(false);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDeleteCenter = (id: string, name: string) => {
    deleteAssociatedCenter(id);
    setSuccessMessage(`Le centre "${name}" a été retiré.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Associated Centers Filtered List & Cities
  const centerCities = Array.from(new Set((associatedCenters || []).map(c => c.city).filter(Boolean)));
  const filteredCenters = (associatedCenters || []).filter(c => {
    const matchesCity = selectedCenterCity === 'all' || c.city === selectedCenterCity;
    const q = searchCenterQuery.toLowerCase().trim();
    const matchesQuery = !q || 
      c.name.toLowerCase().includes(q) || 
      c.address.toLowerCase().includes(q) || 
      c.manager.toLowerCase().includes(q) || 
      c.phone.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q);
    return matchesCity && matchesQuery;
  });

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

      {/* Top Banner: Contact, Social Media, Working Hours, Share & Admin Control */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-neutral-700/60">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 text-xs">
          {/* Left: Contact Info */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-neutral-300">
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

          {/* Right: Social Media Links, Share App & Admin Control */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center">
            {/* WhatsApp Direct Link */}
            <a
              href={companySettings.whatsappLink || `https://wa.me/${(companySettings.whatsappPhone || companySettings.phone || '237699001122').replace(/[^0-9]/g, '')}?text=Bonjour%20Whieda%20Smart%2C%20je%20souhaite%20des%20informations.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-xs text-xs"
              title="Discuter directement sur WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            {/* Facebook Link */}
            <a
              href={companySettings.facebookUrl || 'https://facebook.com/whiedasmart'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-xs text-xs"
              title="Page Facebook officielle"
            >
              <FacebookIcon className="w-3.5 h-3.5" />
              <span>Facebook</span>
            </a>

            {/* TikTok Link */}
            <a
              href={companySettings.tiktokUrl || 'https://tiktok.com/@whiedasmart'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 hover:border-neutral-500 font-bold transition-all shadow-xs text-xs"
              title="Vidéos et conseils santé sur TikTok"
            >
              <TikTokIcon className="w-3.5 h-3.5 text-pink-400" />
              <span>TikTok</span>
            </a>

            {/* Link to Associated Centers */}
            <a
              href="#centres-associes"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 text-xs font-semibold transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Nos Centres</span>
            </a>

            {/* Share App Button */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs shadow-xs transition-all"
              title="Partager l'application Whieda Smart"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Partager l'App</span>
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => {
                  setAdminSettingsForm(companySettings);
                  setIsAdminEditModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold transition-all shadow-xs"
                title="Modifier les coordonnées et réseaux sociaux (Admin)"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Admin Vitrine</span>
              </button>
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

          {/* Action Buttons requested */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
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
              className="px-6 py-3.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-800 text-orange-400 hover:text-orange-300 font-bold text-sm border border-orange-500/30 transition-all flex items-center gap-2.5 transform active:scale-95"
            >
              <HeartHandshake className="w-4 h-4 text-orange-400" />
              <span>Devenir partenaire</span>
            </button>

            {/* Button 4: Nos Centres Whieda Associés */}
            <a
              href="#centres-associes"
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 transform active:scale-95"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Nos Centres Associés</span>
            </a>

            {/* Button 5: Partager l'Application */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-5 py-3.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-900 text-neutral-200 hover:text-white font-bold text-sm border border-neutral-700 transition-all flex items-center gap-2 transform active:scale-95"
            >
              <Share2 className="w-4 h-4 text-orange-400" />
              <span>Partager l'App</span>
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
      {/* SECTION 5: NOS CENTRES WHIEDA ASSOCIÉS (RÉGLABLES PAR L'ADMIN)           */}
      {/* ========================================================================= */}
      <section id="centres-associes" className="scroll-mt-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Maillage National & Centres Agréés</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              Nos Centres Whieda Associés
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl">
              Consultez nos médecins, réalisez vos bilans biométriques et retirez vos produits certifiés dans l'ensemble de nos centres partenaires.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            {currentUser.role === 'admin' && (
              <button
                onClick={handleOpenAddCenter}
                className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Centre Associé</span>
              </button>
            )}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-2.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Share2 className="w-4 h-4 text-orange-600" />
              <span>Partager l'App</span>
            </button>
          </div>
        </div>

        {/* Filter by City & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* City Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCenterCity('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedCenterCity === 'all'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Tous les centres ({(associatedCenters || []).length})
            </button>
            {centerCities.map(city => {
              const count = (associatedCenters || []).filter(c => c.city === city).length;
              return (
                <button
                  key={city}
                  onClick={() => setSelectedCenterCity(city)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCenterCity === city
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {city} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher par nom, ville, responsable ou adresse..."
              value={searchCenterQuery}
              onChange={e => setSearchCenterQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Centres Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCenters.length === 0 ? (
            <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-neutral-200 text-neutral-400">
              <Building2 className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
              <p className="font-semibold text-neutral-700 text-sm">Aucun centre associé trouvé pour cette recherche.</p>
              <p className="text-xs text-neutral-500 mt-1">Modifiez vos filtres de ville ou votre recherche par mot-clé.</p>
            </div>
          ) : (
            filteredCenters.map(center => {
              const cleanPhone = (center.phone || '').replace(/[^0-9]/g, '');
              const isMain = center.name.toLowerCase().includes('siège') || center.name.toLowerCase().includes('akwa');

              return (
                <div
                  key={center.id}
                  className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                    isMain ? 'border-orange-300 ring-2 ring-orange-400/20' : 'border-neutral-200'
                  }`}
                >
                  <div className="p-5 space-y-3.5">
                    {/* Top tags */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-800 flex items-center gap-1 border border-neutral-200">
                        <MapPin className="w-3 h-3 text-orange-600" />
                        <span>{center.city}</span>
                      </span>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        center.status === 'en_ouverture'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {center.status === 'en_ouverture' ? 'En ouverture' : 'Centre Actif'}
                      </span>
                    </div>

                    {/* Center Name */}
                    <div>
                      <h3 className="font-extrabold text-base text-neutral-900 leading-snug">
                        {center.name}
                      </h3>
                      {center.email && (
                        <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{center.email}</p>
                      )}
                    </div>

                    {/* Responsable (Admin réglable) */}
                    <div className="p-3 bg-orange-50/70 border border-orange-200/80 rounded-xl space-y-1 text-xs">
                      <div className="text-[10px] uppercase font-bold text-orange-800 tracking-wider flex items-center gap-1">
                        <Users className="w-3 h-3 text-orange-600" />
                        <span>Responsable du Centre</span>
                      </div>
                      <div className="font-bold text-neutral-900 text-xs">
                        {center.manager}
                      </div>
                    </div>

                    {/* Adresse & Coordonnées */}
                    <div className="space-y-2 text-xs text-neutral-600 pt-1">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                        <span className="text-neutral-700">{center.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <a 
                          href={`tel:${center.phone}`} 
                          className="font-mono font-bold text-neutral-900 hover:text-orange-600 transition-colors"
                        >
                          {center.phone}
                        </a>
                      </div>
                      {center.workingHours && (
                        <div className="flex items-start gap-2">
                          <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                          <span className="text-neutral-500 text-[11px]">{center.workingHours}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${center.phone}`}
                        className="flex-1 py-2 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Phone className="w-3 h-3 text-orange-400" />
                        <span>Appeler</span>
                      </a>

                      <a
                        href={`https://wa.me/${cleanPhone}?text=Bonjour%20%2C%20je%20vous%20contacte%20depuis%20l'application%20Whieda%20Smart%20concernant%20le%20${encodeURIComponent(center.name)}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1"
                        title="Contacter ce centre sur WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    <button
                      onClick={() => {
                        setAptForm(prev => ({
                          ...prev,
                          reason: `Rendez-vous au ${center.name} (${center.city})`,
                        }));
                        setIsAppointmentModalOpen(true);
                      }}
                      className="w-full py-1.5 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5 text-orange-700" />
                      <span>Prendre Rendez-vous dans ce centre</span>
                    </button>

                    {currentUser.role === 'admin' && (
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-200 text-xs">
                        <span className="text-[10px] text-neutral-400 font-mono">ID: {center.id}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditCenter(center)}
                            className="px-2 py-1 rounded text-[11px] font-semibold text-blue-700 hover:bg-blue-100 flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Modifier</span>
                          </button>
                          <button
                            onClick={() => handleDeleteCenter(center.id, center.name)}
                            className="px-2 py-1 rounded text-[11px] font-semibold text-red-700 hover:bg-red-100 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: RÉSEAUX SOCIAUX & COMMUNAUTÉ WHIEDA (WHATSAPP, FACEBOOK, TIKTOK) */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-stone-900 rounded-3xl p-8 sm:p-12 text-white border border-neutral-800 shadow-xl space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Communauté & Réseaux Sociaux</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Rejoignez Whieda Smart sur Vos Réseaux Préférés
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
              Conseils de santé au quotidien, témoignages de guérison, sessions de formation pour partenaires MLM et assistance médicale directe.
            </p>
          </div>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2.5 transition-all self-start lg:self-center"
          >
            <Share2 className="w-4 h-4" />
            <span>Partager l'Application</span>
          </button>
        </div>

        {/* Social Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Card 1: WhatsApp */}
          <div className="bg-gradient-to-b from-emerald-950/60 to-neutral-900/90 rounded-2xl p-6 border border-emerald-500/30 flex flex-col justify-between hover:border-emerald-400 transition-all shadow-md group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <WhatsAppIcon className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-white">
                Canal Officiel & Support WhatsApp
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Discutez en direct avec nos conseillers médicaux, passez vos commandes de produits et recevez nos alertes santé.
              </p>
              <div className="font-mono text-xs text-emerald-400 font-bold">
                {companySettings.whatsappPhone || companySettings.phone || '+237 699 00 11 22'}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-800/40">
              <a
                href={companySettings.whatsappLink || `https://wa.me/${(companySettings.whatsappPhone || companySettings.phone || '237699001122').replace(/[^0-9]/g, '')}?text=Bonjour%20Whieda%20Smart%2C%20je%20souhaite%20des%20informations.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Rejoindre sur WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 2: Facebook */}
          <div className="bg-gradient-to-b from-blue-950/60 to-neutral-900/90 rounded-2xl p-6 border border-blue-500/30 flex flex-col justify-between hover:border-blue-400 transition-all shadow-md group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <FacebookIcon className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-white">
                Page Facebook Officielle
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Retrouvez notre actualité médicale, nos webinaires interactifs et les success stories de nos membres de réseau.
              </p>
              <div className="font-mono text-xs text-blue-400 font-bold">
                @whiedasmart.officiel
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-blue-800/40">
              <a
                href={companySettings.facebookUrl || 'https://facebook.com/whiedasmart'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Nous Suivre sur Facebook</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 3: TikTok */}
          <div className="bg-gradient-to-b from-neutral-800/80 to-neutral-950 rounded-2xl p-6 border border-neutral-700 flex flex-col justify-between hover:border-pink-500/50 transition-all shadow-md group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-neutral-950 text-white border border-neutral-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <TikTokIcon className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="font-extrabold text-lg text-white">
                Compte TikTok Bio-Santé
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Vidéos courtes, démonstrations d'usage des produits, recettes bien-être et conseils pratiques pour stimuler votre vitalité.
              </p>
              <div className="font-mono text-xs text-pink-400 font-bold">
                @whiedasmart.sante
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800">
              <a
                href={companySettings.tiktokUrl || 'https://tiktok.com/@whiedasmart'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-neutral-600 shadow-sm"
              >
                <span>Découvrir sur TikTok</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
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

              {/* Réseaux Sociaux & Liens */}
              <div className="pt-3 border-t border-neutral-200 space-y-3">
                <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2 text-orange-600">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Liens Réseaux Sociaux (WhatsApp, Facebook, TikTok)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                      <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Numéro WhatsApp direct</span>
                    </label>
                    <input
                      type="text"
                      placeholder="+237 699 00 11 22"
                      value={adminSettingsForm.whatsappPhone || ''}
                      onChange={e => setAdminSettingsForm({ ...adminSettingsForm, whatsappPhone: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                      <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Lien d'invitation / discussion WhatsApp</span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://wa.me/237..."
                      value={adminSettingsForm.whatsappLink || ''}
                      onChange={e => setAdminSettingsForm({ ...adminSettingsForm, whatsappLink: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                      <FacebookIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>Lien Page Facebook</span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://facebook.com/..."
                      value={adminSettingsForm.facebookUrl || ''}
                      onChange={e => setAdminSettingsForm({ ...adminSettingsForm, facebookUrl: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                      <TikTokIcon className="w-3.5 h-3.5 text-pink-500" />
                      <span>Lien Profil TikTok</span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://tiktok.com/@..."
                      value={adminSettingsForm.tiktokUrl || ''}
                      onChange={e => setAdminSettingsForm({ ...adminSettingsForm, tiktokUrl: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
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

      {/* ========================================================================= */}
      {/* MODAL 5: OPTION PARTAGER L'APPLICATION (LIEN, WHATSAPP, QR CODE)           */}
      {/* ========================================================================= */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-950 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-md">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Partager l'Application Whieda Smart</h3>
                  <p className="text-xs text-neutral-400">Transmettez l'accès à vos patients et membres du réseau</p>
                </div>
              </div>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Copy URL Box */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Lien Web Direct de l'Application :
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== 'undefined' ? window.location.href : 'https://whiedasmart.com'}
                    className="flex-1 px-3 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-neutral-700 select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyShareLink}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-900 hover:bg-black text-white'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <CheckCheck className="w-4 h-4 text-emerald-200" />
                        <span>Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
                {copiedLink && (
                  <p className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Lien copié dans le presse-papier avec succès !</span>
                  </p>
                )}
              </div>

              {/* Direct Social Media Sharing Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-700">
                  Partager Instantanément sur les Réseaux :
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Share on WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      "Découvrez l'application Whieda Smart : cabinet de santé bio-électronique, pharmacie naturelle certifiée et opportunité MLM ! Accéder ici : " +
                      (typeof window !== 'undefined' ? window.location.href : 'https://whiedasmart.com')
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                    <span>Via WhatsApp</span>
                  </a>

                  {/* Share on Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      typeof window !== 'undefined' ? window.location.href : 'https://whiedasmart.com'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
                  >
                    <FacebookIcon className="w-4 h-4 text-blue-600" />
                    <span>Via Facebook</span>
                  </a>

                  {/* Share via SMS */}
                  <a
                    href={`sms:?body=${encodeURIComponent(
                      "Application Whieda Smart - Santé & Pharmacie Verte : " +
                      (typeof window !== 'undefined' ? window.location.href : '')
                    )}`}
                    className="p-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Smartphone className="w-4 h-4 text-neutral-600" />
                    <span>Par SMS</span>
                  </a>

                  {/* Share via Email */}
                  <a
                    href={`mailto:?subject=${encodeURIComponent("Recommandation : Application Whieda Smart")}&body=${encodeURIComponent(
                      "Bonjour,\n\nJe vous invite à découvrir la plateforme Whieda Smart dédiée à la santé intégrative, aux bilans biométriques et aux soins de phytothérapie.\n\nLien d'accès : " +
                      (typeof window !== 'undefined' ? window.location.href : '')
                    )}`}
                    className="p-3 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-orange-600" />
                    <span>Par Email</span>
                  </a>
                </div>
              </div>

              {/* Native Mobile Share Button */}
              <div>
                <button
                  onClick={handleNativeShare}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Ouvrir le menu de partage mobile (Tous réseaux)</span>
                </button>
              </div>

              {/* QR Code Section */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center gap-4">
                <div className="w-20 h-20 bg-white p-2 rounded-xl border border-neutral-300 shadow-2xs shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full text-neutral-900" viewBox="0 0 100 100" fill="currentColor">
                    {/* Visual QR Code Pattern */}
                    <rect x="0" y="0" width="30" height="30" rx="4" fill="currentColor" />
                    <rect x="5" y="5" width="20" height="20" rx="2" fill="white" />
                    <rect x="10" y="10" width="10" height="10" fill="currentColor" />

                    <rect x="70" y="0" width="30" height="30" rx="4" fill="currentColor" />
                    <rect x="75" y="5" width="20" height="20" rx="2" fill="white" />
                    <rect x="80" y="10" width="10" height="10" fill="currentColor" />

                    <rect x="0" y="70" width="30" height="30" rx="4" fill="currentColor" />
                    <rect x="5" y="75" width="20" height="20" rx="2" fill="white" />
                    <rect x="10" y="80" width="10" height="10" fill="currentColor" />

                    <rect x="40" y="10" width="10" height="10" fill="currentColor" />
                    <rect x="55" y="15" width="8" height="8" fill="currentColor" />
                    <rect x="45" y="35" width="10" height="10" fill="currentColor" />
                    <rect x="15" y="45" width="10" height="10" fill="currentColor" />
                    <rect x="75" y="45" width="12" height="8" fill="currentColor" />
                    <rect x="40" y="65" width="10" height="10" fill="currentColor" />
                    <rect x="60" y="75" width="8" height="8" fill="currentColor" />
                    <rect x="80" y="80" width="12" height="12" fill="currentColor" />
                  </svg>
                </div>

                <div>
                  <div className="font-extrabold text-xs text-neutral-900 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-orange-600" />
                    <span>Scannez pour Ouvrir sur Smartphone</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                    Pointez l'appareil photo d'un téléphone vers ce code pour lancer immédiatement Whieda Smart sans saisie d'adresse.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-neutral-100 border-t border-neutral-200 flex justify-end">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-white border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: GÉRER LE CENTRE WHIEDA ASSOCIÉ (AJOUTER / MODIFIER - ADMIN)       */}
      {/* ========================================================================= */}
      {isCenterModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs text-white flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">
                    {centerToEdit ? 'Modifier le Centre Whieda Associé' : 'Ajouter un Nouveau Centre Associé'}
                  </h3>
                  <p className="text-xs text-orange-100">Configuration des coordonnées et du responsable</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCenterModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCenter} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Nom du Centre Associé *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Centre Whieda Santé Bastos"
                  value={centerForm.name}
                  onChange={e => setCenterForm({ ...centerForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none font-bold text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Ville *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Yaoundé, Douala, Bafoussam..."
                    value={centerForm.city}
                    onChange={e => setCenterForm({ ...centerForm, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Statut du Centre *
                  </label>
                  <select
                    value={centerForm.status}
                    onChange={e => setCenterForm({ ...centerForm, status: e.target.value as 'actif' | 'en_ouverture' })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold"
                  >
                    <option value="actif">Centre Actif</option>
                    <option value="en_ouverture">En cours d'ouverture</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Responsable du Centre * (Nom & Titre)
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Mme Bella Christine (Directrice Régionale) ou Dr. Kamga"
                  value={centerForm.manager}
                  onChange={e => setCenterForm({ ...centerForm, manager: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Adresse Complète * (Quartier, Repère)
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Avenue Rosa Parks, Derrière Ambassade de Belgique"
                  value={centerForm.address}
                  onChange={e => setCenterForm({ ...centerForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Numéro de Téléphone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+237 6..."
                    value={centerForm.phone}
                    onChange={e => setCenterForm({ ...centerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Email du Centre (Optionnel)
                  </label>
                  <input
                    type="email"
                    placeholder="centre@whiedasmart.com"
                    value={centerForm.email}
                    onChange={e => setCenterForm({ ...centerForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Horaires d'Accueil
                </label>
                <input
                  type="text"
                  placeholder="ex: Lun - Ven: 08h00 - 18h30 | Sam: 08h30 - 15h00"
                  value={centerForm.workingHours}
                  onChange={e => setCenterForm({ ...centerForm, workingHours: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCenterModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-xl shadow-sm"
                >
                  {centerToEdit ? 'Enregistrer les Modifications' : 'Créer le Centre Associé'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
