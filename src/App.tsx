import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  Plus,
  ShoppingBag,
  Bell,
  Home,
  LayoutGrid,
  ShoppingCart,
  DollarSign,
  User,
  ChevronRight,
  Trash2,
  Edit3,
  QrCode,
  Search,
  LogOut,
  Check,
  X,
  AlertTriangle,
  Package,
  Scale,
  History,
  Smartphone,
  Camera,
  Sparkles,
  ArrowLeft,
  Minus,
  RefreshCw,
  Receipt,
  Store,
  Award,
  Maximize2,
  Minimize2,
  Globe
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

// ==========================================
// CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE
// ==========================================
let app = null;
let auth = null;
let db = null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'ventapos-store-app';

try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const firebaseConfig = JSON.parse(__firebase_config);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (error) {
  console.error('Error al inicializar Firebase:', error);
}

// ==========================================
// DATOS INICIALES DE EJEMPLO (SEED DATA)
// ==========================================
const INITIAL_PROFILES = [
  {
    id: 'prof_brayan',
    name: 'Brayan',
    color: '#2563eb',
    individualEarnings: 25.0,
    salesCount: 1,
    createdAt: Date.now() - 86400000
  },
  {
    id: 'prof_maria',
    name: 'María',
    color: '#9333ea',
    individualEarnings: 0.0,
    salesCount: 0,
    createdAt: Date.now() - 43200000
  }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod_tortillas',
    name: 'Tortillas',
    barcode: '1',
    type: 'bulk', // 'bulk' = A Granel ($/kg), 'piece' = Por Pieza ($/pza)
    price: 25.0,
    stock: 45.0, // kg disponibles
    minStock: 5.0
  },
  {
    id: 'prod_azucar',
    name: 'Azúcar Estándar',
    barcode: '75010001',
    type: 'bulk',
    price: 28.5,
    stock: 30.0,
    minStock: 4.0
  },
  {
    id: 'prod_frijol',
    name: 'Frijol Negro',
    barcode: '75010002',
    type: 'bulk',
    price: 38.0,
    stock: 22.5,
    minStock: 3.0
  },
  {
    id: 'prod_takis',
    name: 'Takis Fuego 62g',
    barcode: '75010003',
    type: 'piece',
    price: 18.0,
    stock: 24, // piezas disponibles
    minStock: 5
  },
  {
    id: 'prod_catsup',
    name: 'Bote Catsup Clemente Jacques',
    barcode: '75010004',
    type: 'piece',
    price: 34.0,
    stock: 12,
    minStock: 3
  }
];

const INITIAL_SALES = [
  {
    id: 'sale_demo_1',
    profileId: 'prof_brayan',
    profileName: 'Brayan',
    total: 25.0,
    timestamp: Date.now() - 3600000,
    items: [
      {
        productId: 'prod_tortillas',
        name: 'Tortillas',
        type: 'bulk',
        quantity: 1.0,
        price: 25.0,
        subtotal: 25.0
      }
    ]
  }
];

const PROFILE_COLORS = [
  '#2563eb', // Azul prototipo
  '#9333ea', // Morado prototipo
  '#16a34a', // Verde
  '#ea580c', // Naranja
  '#dc2626', // Rojo
  '#0891b2'  // Cyan
];

// ==========================================
// DICCIONARIO MULTILENGUAJE (ES, EN, DE, FR, IT)
// ==========================================
const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸', locale: 'es-MX' },
  { code: 'en', name: 'English', flag: '🇺🇸', locale: 'en-US' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', locale: 'de-DE' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', locale: 'fr-FR' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', locale: 'it-IT' }
];

const TRANSLATIONS = {
  es: {
    posSubtitle: 'PUNTO DE VENTA',
    storeTotalShort: 'Tienda Total',
    apkMode: 'Modo APK',
    install: 'Instalar',
    selectProfileTitle: 'Selecciona tu Perfil',
    selectProfileSubtitle: 'Toca un perfil para entrar',
    individualLabel: 'Individual',
    salesWord: 'ventas',
    createNewProfile: 'Crear Nuevo Perfil',
    sharedFooterNote: 'Todos los perfiles comparten inventario y ganancias totales de la tienda.',
    welcome: 'Bienvenido',
    whatToRegisterLine1: '¿Qué vas a',
    whatToRegisterLine2: 'registrar hoy?',
    storeTotalEarningsTitle: 'Ganancias Totales Tienda',
    sharedWithProfiles: 'Compartida ({profiles} perfiles • {sales} ventas)',
    yourEarnings: 'TU GANANCIA',
    individualTag: '↑ Individual',
    salesUpper: 'VENTAS',
    averageUpper: 'PROMEDIO',
    ticketTag: '↑ Ticket',
    quickActions: 'ACCIONES RÁPIDAS',
    newBadge: 'NUEVO',
    addProductBtn: 'Agregar Producto',
    viewCartBtn: 'Ver Carrito',
    inBasketBadge: '{count} en canasta ({total})',
    salesHistoryTitle: 'Historial de ventas',
    salesHistorySubtitle: 'Consultar transacciones anteriores',
    catalogTitle: 'Catálogo',
    sharedInventoryCount: 'Inventario compartido ({count} productos)',
    searchPlaceholder: 'Buscar por nombre o código de barras...',
    filterAll: 'Todos',
    filterBulk: 'A Granel (kg)',
    filterPiece: 'Por Pieza',
    filterLow: 'Bajo Stock ({count})',
    noProductsFound: 'No se encontraron productos en el inventario',
    addNewItemLink: '+ Añadir nuevo objeto al inventario',
    bulkProductLabel: 'Producto a Granel',
    pieceProductLabel: 'Producto por Pieza',
    stockLabel: 'Stock',
    unitKg: 'kg',
    unitPcs: 'pzas',
    perKg: '/kg',
    perPc: '/pza',
    editBtn: 'Modificar',
    outOfStockBtn: 'Agotado',
    toCartBtn: 'Al carrito',
    virtualCartTitle: 'Carrito Virtual',
    scanBtn: 'Escanear',
    emptyBasketTitle: 'La canasta está vacía',
    emptyBasketSubtitle: 'Escanea el código de barras con la cámara o busca manualmente los productos que llevará el cliente.',
    addToCartTitle: 'Añadir al Carrito',
    removeBtn: 'Quitar',
    totalToPay: 'Total a pagar',
    chargeSaleBtn: 'Cobrar Venta',
    salesTabTitle: 'Ventas',
    salesTabSubtitle: 'Ganancias compartidas de la tienda vs individuales por perfil',
    chargesCount: '{count} cobros',
    cashierBreakdown: 'Ganancias Individuales por Cajero / Perfil:',
    youBadge: 'Tú',
    salesShort: 'vtas',
    allSalesFilter: 'Todas las ventas ({count})',
    noSalesRegistered: 'Aún no hay ventas registradas para este filtro.',
    chargedBy: 'Cobró',
    activeLocalProfile: 'Perfil Local Activo',
    individualEarningsUpper: 'GANANCIAS INDIVIDUALES',
    individualSalesUpper: 'VENTAS INDIVIDUALES',
    sumAllProfilesNote: 'Suma de todos los perfiles de la tienda',
    editProfileBtn: 'Modificar Perfil',
    deleteProfileBtn: 'Eliminar Perfil',
    logoutSwitchProfile: 'Cerrar Sesión / Cambiar Perfil',
    navHome: 'Inicio',
    navCatalog: 'Catálogo',
    navCart: 'Carrito',
    navSales: 'Ventas',
    navProfile: 'Perfil',
    scanCodeBtn: 'Escanear Código',
    orSearchManually: 'O busca manualmente:',
    nameOrCodePlaceholder: 'Nombre o Código',
    codeLabel: 'Código',
    cancelBtn: 'Cancelar',
    addBtn: 'Agregar',
    productLabel: 'Producto',
    priceLabel: 'Precio',
    availableInStore: 'Disponible en tienda',
    piecesWord: 'piezas',
    byKilosBtn: 'Por Kilos (kg)',
    byAmountBtn: 'Por Monto ($)',
    weightInKgLabel: 'Peso en Kilogramos',
    requestedAmountLabel: 'Monto solicitado en Pesos ($)',
    equivalentTo: 'Equivale a:',
    piecesQuantityLabel: 'Cantidad de Piezas',
    newInventoryItemTitle: 'Nuevo Objeto al Inventario',
    editInventoryItemTitle: 'Modificar Objeto',
    saleTypeLabel: 'Tipo de Venta',
    bulkTypeTitle: 'A Granel',
    bulkTypeDesc: 'Precio por Kilo ($/kg)',
    pieceTypeTitle: 'Por Pieza',
    pieceTypeDesc: 'Precio por Unidad ($/pza)',
    itemNameLabel: 'Nombre del objeto (ej. Azúcar, Frijol, Takis, Catsup)',
    itemNamePlaceholder: 'Ej. Tortillas o Bote Catsup',
    barcodeFieldLabel: 'Código de Barras (Escanea o escribe uno manual)',
    barcodePlaceholder: 'Ej. 75010001 o 1',
    autoBtn: 'Auto',
    pricePerKgLabel: 'Precio por Kilo ($/kg)',
    pricePerPcLabel: 'Precio por Pieza ($/pza)',
    kilosInInventoryLabel: 'Kilos en Inventario',
    piecesInInventoryLabel: 'Piezas en Inventario',
    saveInInventoryBtn: 'Guardar en Inventario',
    saveChangesBtn: 'Guardar Cambios',
    barcodeScannerTitle: 'Lector de Código de Barras',
    simulateScanPrompt: 'O toca un producto para simular el escaneo de su código:',
    confirmChargeTitle: 'Confirmar Cobro',
    confirmChargeDesc: 'Al cobrar se descontarán los productos del inventario y la ganancia se sumará a {name} y al total de la tienda.',
    totalToChargeLabel: 'Total a cobrar:',
    cashReceivedLabel: 'Efectivo recibido del cliente (opcional para calcular cambio):',
    exampleShort: 'Ej.',
    changeToReturn: 'Cambio a devolver:',
    backBtn: 'Volver',
    confirmAndChargeBtn: 'Confirmar y Cobrar',
    profileNameLabel: 'Nombre del Perfil / Cajero',
    profileNamePlaceholder: 'Ej. Brayan, Don José, Turno Tarde',
    avatarColorLabel: 'Color del Avatar',
    saveProfileBtn: 'Guardar Perfil',
    yesDeleteBtn: 'Sí, Eliminar',
    inventoryStatusTitle: 'Estado del Inventario',
    allStockGood: '¡Todo excelente! Todos los productos tienen buen nivel de stock.',
    remainingLabel: 'Quedan',
    restockBtn: 'Surtir',
    apkModalTitle: 'Usar como App Android / APK',
    apkModalIntro: 'Esta aplicación está construida con diseño nativo móvil oscuro y lista para usarse en tu tienda:',
    apkOption1Title: 'Opción 1: Instalar directo en Android',
    apkOption1Desc: 'Abre esta app en Chrome desde tu celular, toca el menú ⋮ y selecciona "Agregar a la pantalla principal" / "Instalar aplicación". Se abrirá a pantalla completa sin barras de navegador.',
    apkOption2Title: 'Opción 2: Generar archivo .APK con Capacitor',
    apkOption2Desc: 'Puedes empaquetar este proyecto en un archivo .apk usando CapacitorJS (npx cap add android) o PWABuilder para instalarlo directamente en cualquier teléfono Android.',
    understoodBtn: 'Entendido',
    languageLabel: 'Idioma de la aplicación',
    selectLanguageTitle: 'Seleccionar Idioma',
    toastEnterProfileName: 'Escribe un nombre para el perfil',
    toastProfileCreated: 'Perfil "{name}" creado',
    toastProfileUpdated: 'Perfil actualizado a "{name}"',
    toastMinOneProfile: 'Debe existir al menos un perfil en la tienda',
    deleteProfileConfirmTitle: '¿Eliminar perfil de {name}?',
    deleteProfileConfirmDesc: 'Las ventas históricas de la tienda se conservan, pero este perfil ya no podrá seleccionarse.',
    toastBarcodeAssigned: 'Código de barras asignado manualmente',
    toastEnterProductName: 'Ingresa el nombre del producto',
    toastEnterValidPrice: 'Ingresa un precio válido mayor a $0',
    toastEnterValidStock: 'Ingresa una cantidad de inventario válida',
    toastDuplicateCode: 'El código {code} ya pertenece a "{name}"',
    toastProductAdded: '"{name}" añadido al inventario',
    toastProductUpdated: 'Inventario de "{name}" actualizado',
    deleteProductConfirmTitle: '¿Eliminar "{name}"?',
    deleteProductConfirmDesc: 'Este objeto se eliminará del inventario compartido de la tienda.',
    toastProfileDeleted: 'Perfil eliminado correctamente',
    toastProductDeleted: 'Producto eliminado del inventario',
    toastBasketCleared: 'Canasta vaciada',
    toastProductOutOfStock: '"{name}" está agotado en el inventario',
    toastEnterValidAmount: 'Ingresa un monto en pesos válido',
    toastEnterValidWeight: 'Ingresa un peso en kilogramos mayor a 0',
    toastEnterValidPieces: 'Ingresa una cantidad de piezas válida',
    toastInsufficientStock: 'Stock insuficiente. Solo quedan {stock} {unit} de {name}',
    toastAddedToCart: 'Añadido: {qty} {unit} de {name}',
    toastOnlyStockAvailable: 'Solo hay {stock} {unit} en inventario',
    toastSaleCompleted: '¡Venta cobrada por {total}! Inventario actualizado.',
    cameraErrorMsg: 'No se pudo acceder a la cámara en este navegador o permiso denegado. Puedes tocar cualquier código de abajo para escanear al instante.',
    toastCodeCaptured: 'Código {code} capturado',
    toastNoProductWithCode: 'No existe producto con el código "{code}"',
    toastLoggedInAs: 'Sesión iniciada como {name}',
    clearCartConfirmTitle: '¿Vaciar el Carrito Virtual?',
    clearCartConfirmDesc: 'Se quitarán todos los artículos anotados en la canasta actual.',
    toastLanguageChanged: 'Idioma cambiado a {lang}'
  },
  en: {
    posSubtitle: 'POINT OF SALE',
    storeTotalShort: 'Store Total',
    apkMode: 'APK Mode',
    install: 'Install',
    selectProfileTitle: 'Select your Profile',
    selectProfileSubtitle: 'Tap a profile to enter',
    individualLabel: 'Individual',
    salesWord: 'sales',
    createNewProfile: 'Create New Profile',
    sharedFooterNote: 'All profiles share store inventory and total store earnings.',
    welcome: 'Welcome',
    whatToRegisterLine1: 'What will you',
    whatToRegisterLine2: 'register today?',
    storeTotalEarningsTitle: 'Total Store Earnings',
    sharedWithProfiles: 'Shared ({profiles} profiles • {sales} sales)',
    yourEarnings: 'YOUR EARNINGS',
    individualTag: '↑ Individual',
    salesUpper: 'SALES',
    averageUpper: 'AVERAGE',
    ticketTag: '↑ Ticket',
    quickActions: 'QUICK ACTIONS',
    newBadge: 'NEW',
    addProductBtn: 'Add Product',
    viewCartBtn: 'View Cart',
    inBasketBadge: '{count} in basket ({total})',
    salesHistoryTitle: 'Sales History',
    salesHistorySubtitle: 'View previous transactions',
    catalogTitle: 'Catalog',
    sharedInventoryCount: 'Shared inventory ({count} products)',
    searchPlaceholder: 'Search by name or barcode...',
    filterAll: 'All',
    filterBulk: 'Bulk (kg)',
    filterPiece: 'By Piece',
    filterLow: 'Low Stock ({count})',
    noProductsFound: 'No products found in inventory',
    addNewItemLink: '+ Add new item to inventory',
    bulkProductLabel: 'Bulk Product',
    pieceProductLabel: 'Piece Product',
    stockLabel: 'Stock',
    unitKg: 'kg',
    unitPcs: 'pcs',
    perKg: '/kg',
    perPc: '/pc',
    editBtn: 'Edit',
    outOfStockBtn: 'Out of stock',
    toCartBtn: 'To cart',
    virtualCartTitle: 'Virtual Cart',
    scanBtn: 'Scan',
    emptyBasketTitle: 'The basket is empty',
    emptyBasketSubtitle: 'Scan the barcode with the camera or manually search for the products the customer is buying.',
    addToCartTitle: 'Add to Cart',
    removeBtn: 'Remove',
    totalToPay: 'Total to pay',
    chargeSaleBtn: 'Charge Sale',
    salesTabTitle: 'Sales',
    salesTabSubtitle: 'Shared store earnings vs individual profile earnings',
    chargesCount: '{count} charges',
    cashierBreakdown: 'Individual Earnings by Cashier / Profile:',
    youBadge: 'You',
    salesShort: 'sales',
    allSalesFilter: 'All sales ({count})',
    noSalesRegistered: 'No sales registered for this filter yet.',
    chargedBy: 'Charged by',
    activeLocalProfile: 'Active Local Profile',
    individualEarningsUpper: 'INDIVIDUAL EARNINGS',
    individualSalesUpper: 'INDIVIDUAL SALES',
    sumAllProfilesNote: 'Sum of all profiles in the store',
    editProfileBtn: 'Edit Profile',
    deleteProfileBtn: 'Delete Profile',
    logoutSwitchProfile: 'Log Out / Switch Profile',
    navHome: 'Home',
    navCatalog: 'Catalog',
    navCart: 'Cart',
    navSales: 'Sales',
    navProfile: 'Profile',
    scanCodeBtn: 'Scan Code',
    orSearchManually: 'Or search manually:',
    nameOrCodePlaceholder: 'Name or Code',
    codeLabel: 'Code',
    cancelBtn: 'Cancel',
    addBtn: 'Add',
    productLabel: 'Product',
    priceLabel: 'Price',
    availableInStore: 'Available in store',
    piecesWord: 'pieces',
    byKilosBtn: 'By Weight (kg)',
    byAmountBtn: 'By Amount ($)',
    weightInKgLabel: 'Weight in Kilograms',
    requestedAmountLabel: 'Requested Amount ($)',
    equivalentTo: 'Equals to:',
    piecesQuantityLabel: 'Quantity of Pieces',
    newInventoryItemTitle: 'New Inventory Item',
    editInventoryItemTitle: 'Edit Item',
    saleTypeLabel: 'Sale Type',
    bulkTypeTitle: 'Bulk',
    bulkTypeDesc: 'Price per Kilo ($/kg)',
    pieceTypeTitle: 'By Piece',
    pieceTypeDesc: 'Price per Unit ($/pc)',
    itemNameLabel: 'Item name (e.g. Sugar, Beans, Takis, Ketchup)',
    itemNamePlaceholder: 'E.g. Tortillas or Ketchup Bottle',
    barcodeFieldLabel: 'Barcode (Scan or type manually)',
    barcodePlaceholder: 'E.g. 75010001 or 1',
    autoBtn: 'Auto',
    pricePerKgLabel: 'Price per Kilo ($/kg)',
    pricePerPcLabel: 'Price per Piece ($/pc)',
    kilosInInventoryLabel: 'Kilos in Inventory',
    piecesInInventoryLabel: 'Pieces in Inventory',
    saveInInventoryBtn: 'Save to Inventory',
    saveChangesBtn: 'Save Changes',
    barcodeScannerTitle: 'Barcode Scanner',
    simulateScanPrompt: 'Or tap a product below to simulate scanning its barcode:',
    confirmChargeTitle: 'Confirm Charge',
    confirmChargeDesc: 'Charging will deduct items from inventory and add earnings to {name} and the store total.',
    totalToChargeLabel: 'Total to charge:',
    cashReceivedLabel: 'Cash received from customer (optional to calculate change):',
    exampleShort: 'E.g.',
    changeToReturn: 'Change due:',
    backBtn: 'Back',
    confirmAndChargeBtn: 'Confirm & Charge',
    profileNameLabel: 'Profile / Cashier Name',
    profileNamePlaceholder: 'E.g. Brayan, John, Afternoon Shift',
    avatarColorLabel: 'Avatar Color',
    saveProfileBtn: 'Save Profile',
    yesDeleteBtn: 'Yes, Delete',
    inventoryStatusTitle: 'Inventory Status',
    allStockGood: 'All good! Every product has healthy stock levels.',
    remainingLabel: 'Left',
    restockBtn: 'Restock',
    apkModalTitle: 'Use as Android App / APK',
    apkModalIntro: 'This application is built with a native dark mobile UI and ready for your store:',
    apkOption1Title: 'Option 1: Install directly on Android',
    apkOption1Desc: 'Open this app in Chrome on your phone, tap the ⋮ menu and select "Add to Home screen" / "Install app". It will run full screen.',
    apkOption2Title: 'Option 2: Build .APK file with Capacitor',
    apkOption2Desc: 'You can package this project into an .apk file using CapacitorJS (npx cap add android) or PWABuilder for any Android device.',
    understoodBtn: 'Got it',
    languageLabel: 'Application Language',
    selectLanguageTitle: 'Select Language',
    toastEnterProfileName: 'Please enter a name for the profile',
    toastProfileCreated: 'Profile "{name}" created',
    toastProfileUpdated: 'Profile updated to "{name}"',
    toastMinOneProfile: 'At least one profile must exist in the store',
    deleteProfileConfirmTitle: 'Delete profile "{name}"?',
    deleteProfileConfirmDesc: 'Historical store sales are kept, but this profile will no longer be selectable.',
    toastBarcodeAssigned: 'Barcode assigned manually',
    toastEnterProductName: 'Please enter the product name',
    toastEnterValidPrice: 'Enter a valid price greater than $0',
    toastEnterValidStock: 'Enter a valid inventory quantity',
    toastDuplicateCode: 'Code {code} already belongs to "{name}"',
    toastProductAdded: '"{name}" added to inventory',
    toastProductUpdated: 'Inventory for "{name}" updated',
    deleteProductConfirmTitle: 'Delete "{name}"?',
    deleteProductConfirmDesc: 'This item will be removed from the shared store inventory.',
    toastProfileDeleted: 'Profile deleted successfully',
    toastProductDeleted: 'Product removed from inventory',
    toastBasketCleared: 'Basket cleared',
    toastProductOutOfStock: '"{name}" is out of stock',
    toastEnterValidAmount: 'Enter a valid currency amount',
    toastEnterValidWeight: 'Enter a weight in kilograms greater than 0',
    toastEnterValidPieces: 'Enter a valid quantity of pieces',
    toastInsufficientStock: 'Insufficient stock. Only {stock} {unit} left of {name}',
    toastAddedToCart: 'Added: {qty} {unit} of {name}',
    toastOnlyStockAvailable: 'Only {stock} {unit} available in inventory',
    toastSaleCompleted: 'Sale charged for {total}! Inventory updated.',
    cameraErrorMsg: 'Camera access unavailable or permission denied. Tap any product below to simulate instant barcode scanning.',
    toastCodeCaptured: 'Barcode {code} captured',
    toastNoProductWithCode: 'No product found with barcode "{code}"',
    toastLoggedInAs: 'Logged in as {name}',
    clearCartConfirmTitle: 'Clear Virtual Cart?',
    clearCartConfirmDesc: 'All items currently in the basket will be removed.',
    toastLanguageChanged: 'Language changed to {lang}'
  },
  de: {
    posSubtitle: 'KASSENSYSTEM',
    storeTotalShort: 'Laden Gesamt',
    apkMode: 'APK-Modus',
    install: 'Installieren',
    selectProfileTitle: 'Wähle dein Profil',
    selectProfileSubtitle: 'Tippe auf ein Profil, um fortzufahren',
    individualLabel: 'Individuell',
    salesWord: 'Verkäufe',
    createNewProfile: 'Neues Profil erstellen',
    sharedFooterNote: 'Alle Profile teilen sich das Inventar und die Gesamteinnahmen des Ladens.',
    welcome: 'Willkommen',
    whatToRegisterLine1: 'Was möchtest du',
    whatToRegisterLine2: 'heute erfassen?',
    storeTotalEarningsTitle: 'Gesamteinnahmen Laden',
    sharedWithProfiles: 'Geteilt ({profiles} Profile • {sales} Verkäufe)',
    yourEarnings: 'DEIN UMSATZ',
    individualTag: '↑ Individuell',
    salesUpper: 'VERKÄUFE',
    averageUpper: 'SCHNITT',
    ticketTag: '↑ Bon',
    quickActions: 'SCHNELLAKTIONEN',
    newBadge: 'NEU',
    addProductBtn: 'Produkt hinzufügen',
    viewCartBtn: 'Warenkorb ansehen',
    inBasketBadge: '{count} im Korb ({total})',
    salesHistoryTitle: 'Verkaufshistorie',
    salesHistorySubtitle: 'Frühere Transaktionen einsehen',
    catalogTitle: 'Katalog',
    sharedInventoryCount: 'Geteiltes Inventar ({count} Produkte)',
    searchPlaceholder: 'Nach Name oder Barcode suchen...',
    filterAll: 'Alle',
    filterBulk: 'Lose Ware (kg)',
    filterPiece: 'Pro Stück',
    filterLow: 'Wenig Bestand ({count})',
    noProductsFound: 'Keine Produkte im Inventar gefunden',
    addNewItemLink: '+ Neuen Artikel zum Inventar hinzufügen',
    bulkProductLabel: 'Lose Ware (Gewicht)',
    pieceProductLabel: 'Stückware',
    stockLabel: 'Bestand',
    unitKg: 'kg',
    unitPcs: 'Stk',
    perKg: '/kg',
    perPc: '/Stk',
    editBtn: 'Ändern',
    outOfStockBtn: 'Ausverkauft',
    toCartBtn: 'In den Korb',
    virtualCartTitle: 'Virtueller Warenkorb',
    scanBtn: 'Scannen',
    emptyBasketTitle: 'Der Warenkorb ist leer',
    emptyBasketSubtitle: 'Scanne den Barcode mit der Kamera oder suche manuell nach den Produkten für den Kunden.',
    addToCartTitle: 'In den Warenkorb',
    removeBtn: 'Entfernen',
    totalToPay: 'Gesamtbetrag',
    chargeSaleBtn: 'Verkauf kassieren',
    salesTabTitle: 'Verkäufe',
    salesTabSubtitle: 'Geteilte Ladeneinnahmen vs. individuelle Profileinnahmen',
    chargesCount: '{count} Kassierungen',
    cashierBreakdown: 'Individuelle Einnahmen pro Kassierer / Profil:',
    youBadge: 'Du',
    salesShort: 'Verk.',
    allSalesFilter: 'Alle Verkäufe ({count})',
    noSalesRegistered: 'Noch keine Verkäufe für diesen Filter erfasst.',
    chargedBy: 'Kassiert von',
    activeLocalProfile: 'Aktives lokales Profil',
    individualEarningsUpper: 'INDIVIDUELLE EINNAHMEN',
    individualSalesUpper: 'INDIVIDUELLE VERKÄUFE',
    sumAllProfilesNote: 'Summe aller Profile im Laden',
    editProfileBtn: 'Profil ändern',
    deleteProfileBtn: 'Profil löschen',
    logoutSwitchProfile: 'Abmelden / Profil wechseln',
    navHome: 'Start',
    navCatalog: 'Katalog',
    navCart: 'Korb',
    navSales: 'Verkäufe',
    navProfile: 'Profil',
    scanCodeBtn: 'Barcode scannen',
    orSearchManually: 'Oder manuell suchen:',
    nameOrCodePlaceholder: 'Name oder Barcode',
    codeLabel: 'Code',
    cancelBtn: 'Abbrechen',
    addBtn: 'Hinzufügen',
    productLabel: 'Produkt',
    priceLabel: 'Preis',
    availableInStore: 'Im Laden verfügbar',
    piecesWord: 'Stück',
    byKilosBtn: 'Nach Kilo (kg)',
    byAmountBtn: 'Nach Betrag ($)',
    weightInKgLabel: 'Gewicht in Kilogramm',
    requestedAmountLabel: 'Gewünschter Betrag ($)',
    equivalentTo: 'Entspricht:',
    piecesQuantityLabel: 'Stückzahl',
    newInventoryItemTitle: 'Neuer Inventarartikel',
    editInventoryItemTitle: 'Artikel bearbeiten',
    saleTypeLabel: 'Verkaufsart',
    bulkTypeTitle: 'Lose Ware',
    bulkTypeDesc: 'Preis pro Kilo ($/kg)',
    pieceTypeTitle: 'Pro Stück',
    pieceTypeDesc: 'Preis pro Einheit ($/Stk)',
    itemNameLabel: 'Artikelname (z. B. Zucker, Bohnen, Chips, Ketchup)',
    itemNamePlaceholder: 'z. B. Tortillas oder Ketchup',
    barcodeFieldLabel: 'Barcode (Scannen oder manuell eingeben)',
    barcodePlaceholder: 'z. B. 75010001 oder 1',
    autoBtn: 'Auto',
    pricePerKgLabel: 'Preis pro Kilo ($/kg)',
    pricePerPcLabel: 'Preis pro Stück ($/Stk)',
    kilosInInventoryLabel: 'Kilo im Inventar',
    piecesInInventoryLabel: 'Stück im Inventar',
    saveInInventoryBtn: 'Im Inventar speichern',
    saveChangesBtn: 'Änderungen speichern',
    barcodeScannerTitle: 'Barcode-Scanner',
    simulateScanPrompt: 'Oder tippe auf ein Produkt, um den Scan zu simulieren:',
    confirmChargeTitle: 'Zahlung bestätigen',
    confirmChargeDesc: 'Beim Kassieren wird der Bestand abgezogen und der Umsatz zu {name} sowie dem Ladengesamt addiert.',
    totalToChargeLabel: 'Zu zahlender Betrag:',
    cashReceivedLabel: 'Erhaltenes Bargeld (optional für Rückgeld):',
    exampleShort: 'z. B.',
    changeToReturn: 'Rückgeld:',
    backBtn: 'Zurück',
    confirmAndChargeBtn: 'Bestätigen & Kassieren',
    profileNameLabel: 'Name des Profils / Kassierers',
    profileNamePlaceholder: 'z. B. Brayan, Maria, Spätschicht',
    avatarColorLabel: 'Avatar-Farbe',
    saveProfileBtn: 'Profil speichern',
    yesDeleteBtn: 'Ja, löschen',
    inventoryStatusTitle: 'Inventarstatus',
    allStockGood: 'Alles bestens! Alle Produkte haben ausreichend Bestand.',
    remainingLabel: 'Übrig',
    restockBtn: 'Auffüllen',
    apkModalTitle: 'Als Android-App / APK nutzen',
    apkModalIntro: 'Diese App ist im mobilen Dark-Design für deinen Laden optimiert:',
    apkOption1Title: 'Option 1: Direkt auf Android installieren',
    apkOption1Desc: 'Öffne die App in Chrome auf dem Handy, tippe auf ⋮ und wähle "Zum Startbildschirm hinzufügen" / "App installieren".',
    apkOption2Title: 'Option 2: .APK-Datei mit Capacitor erstellen',
    apkOption2Desc: 'Du kannst dieses Projekt mit CapacitorJS (npx cap add android) oder PWABuilder als .apk-Datei verpacken.',
    understoodBtn: 'Verstanden',
    languageLabel: 'App-Sprache',
    selectLanguageTitle: 'Sprache wählen',
    toastEnterProfileName: 'Bitte gib einen Profilnamen ein',
    toastProfileCreated: 'Profil "{name}" erstellt',
    toastProfileUpdated: 'Profil aktualisiert auf "{name}"',
    toastMinOneProfile: 'Es muss mindestens ein Profil im Laden existieren',
    deleteProfileConfirmTitle: 'Profil von {name} löschen?',
    deleteProfileConfirmDesc: 'Bisherige Verkäufe bleiben erhalten, aber dieses Profil kann nicht mehr gewählt werden.',
    toastBarcodeAssigned: 'Barcode manuell zugewiesen',
    toastEnterProductName: 'Bitte gib den Produktnamen ein',
    toastEnterValidPrice: 'Bitte einen gültigen Preis größer als 0 eingeben',
    toastEnterValidStock: 'Bitte eine gültige Bestandsmenge eingeben',
    toastDuplicateCode: 'Der Code {code} gehört bereits zu "{name}"',
    toastProductAdded: '"{name}" zum Inventar hinzugefügt',
    toastProductUpdated: 'Inventar von "{name}" aktualisiert',
    deleteProductConfirmTitle: '"{name}" löschen?',
    deleteProductConfirmDesc: 'Dieser Artikel wird aus dem gemeinsamen Ladeninventar gelöscht.',
    toastProfileDeleted: 'Profil erfolgreich gelöscht',
    toastProductDeleted: 'Produkt aus dem Inventar gelöscht',
    toastBasketCleared: 'Warenkorb geleert',
    toastProductOutOfStock: '"{name}" ist nicht mehr vorrätig',
    toastEnterValidAmount: 'Bitte einen gültigen Betrag eingeben',
    toastEnterValidWeight: 'Bitte ein Gewicht in Kilogramm größer als 0 eingeben',
    toastEnterValidPieces: 'Bitte eine gültige Stückzahl eingeben',
    toastInsufficientStock: 'Nicht genug Bestand. Nur noch {stock} {unit} von {name} übrig',
    toastAddedToCart: 'Hinzugefügt: {qty} {unit} {name}',
    toastOnlyStockAvailable: 'Nur {stock} {unit} im Inventar verfügbar',
    toastSaleCompleted: 'Verkauf über {total} kassiert! Inventar aktualisiert.',
    cameraErrorMsg: 'Kamerazugriff nicht möglich. Tippe unten auf ein Produkt, um den Barcode-Scan sofort zu simulieren.',
    toastCodeCaptured: 'Barcode {code} erfasst',
    toastNoProductWithCode: 'Kein Produkt mit dem Barcode "{code}" gefunden',
    toastLoggedInAs: 'Angemeldet als {name}',
    clearCartConfirmTitle: 'Virtuellen Warenkorb leeren?',
    clearCartConfirmDesc: 'Alle Artikel im aktuellen Warenkorb werden entfernt.',
    toastLanguageChanged: 'Sprache geändert zu {lang}'
  },
  fr: {
    posSubtitle: 'POINT DE VENTE',
    storeTotalShort: 'Total Boutique',
    apkMode: 'Mode APK',
    install: 'Installer',
    selectProfileTitle: 'Sélectionnez votre Profil',
    selectProfileSubtitle: 'Touchez un profil pour entrer',
    individualLabel: 'Individuel',
    salesWord: 'ventes',
    createNewProfile: 'Créer un Nouveau Profil',
    sharedFooterNote: 'Tous les profils partagent l’inventaire et les gains totaux de la boutique.',
    welcome: 'Bienvenue',
    whatToRegisterLine1: 'Que voulez-vous',
    whatToRegisterLine2: 'enregistrer aujourd’hui ?',
    storeTotalEarningsTitle: 'Gains Totaux Boutique',
    sharedWithProfiles: 'Partagé ({profiles} profils • {sales} ventes)',
    yourEarnings: 'VOS GAINS',
    individualTag: '↑ Individuel',
    salesUpper: 'VENTES',
    averageUpper: 'MOYENNE',
    ticketTag: '↑ Ticket',
    quickActions: 'ACTIONS RAPIDES',
    newBadge: 'NOUVEAU',
    addProductBtn: 'Ajouter un Produit',
    viewCartBtn: 'Voir le Panier',
    inBasketBadge: '{count} dans le panier ({total})',
    salesHistoryTitle: 'Historique des ventes',
    salesHistorySubtitle: 'Consulter les transactions précédentes',
    catalogTitle: 'Catalogue',
    sharedInventoryCount: 'Inventaire partagé ({count} produits)',
    searchPlaceholder: 'Rechercher par nom ou code-barres...',
    filterAll: 'Tous',
    filterBulk: 'En Vrac (kg)',
    filterPiece: 'À la Pièce',
    filterLow: 'Stock Faible ({count})',
    noProductsFound: 'Aucun produit trouvé dans l’inventaire',
    addNewItemLink: '+ Ajouter un nouvel article à l’inventaire',
    bulkProductLabel: 'Produit en Vrac',
    pieceProductLabel: 'Produit à la Pièce',
    stockLabel: 'Stock',
    unitKg: 'kg',
    unitPcs: 'pces',
    perKg: '/kg',
    perPc: '/pce',
    editBtn: 'Modifier',
    outOfStockBtn: 'Épuisé',
    toCartBtn: 'Au panier',
    virtualCartTitle: 'Panier Virtuel',
    scanBtn: 'Scanner',
    emptyBasketTitle: 'Le panier est vide',
    emptyBasketSubtitle: 'Scannez le code-barres avec la caméra ou recherchez manuellement les produits du client.',
    addToCartTitle: 'Ajouter au Panier',
    removeBtn: 'Retirer',
    totalToPay: 'Total à payer',
    chargeSaleBtn: 'Encaisser la Vente',
    salesTabTitle: 'Ventes',
    salesTabSubtitle: 'Gains partagés de la boutique vs gains individuels par profil',
    chargesCount: '{count} encaissements',
    cashierBreakdown: 'Gains Individuels par Caissier / Profil :',
    youBadge: 'Vous',
    salesShort: 'vtes',
    allSalesFilter: 'Toutes les ventes ({count})',
    noSalesRegistered: 'Aucune vente enregistrée pour ce filtre.',
    chargedBy: 'Encaissé par',
    activeLocalProfile: 'Profil Local Actif',
    individualEarningsUpper: 'GAINS INDIVIDUELS',
    individualSalesUpper: 'VENTES INDIVIDUELLES',
    sumAllProfilesNote: 'Somme de tous les profils de la boutique',
    editProfileBtn: 'Modifier le Profil',
    deleteProfileBtn: 'Supprimer le Profil',
    logoutSwitchProfile: 'Déconnexion / Changer de Profil',
    navHome: 'Accueil',
    navCatalog: 'Catalogue',
    navCart: 'Panier',
    navSales: 'Ventes',
    navProfile: 'Profil',
    scanCodeBtn: 'Scanner le Code',
    orSearchManually: 'Ou rechercher manuellement :',
    nameOrCodePlaceholder: 'Nom ou Code',
    codeLabel: 'Code',
    cancelBtn: 'Annuler',
    addBtn: 'Ajouter',
    productLabel: 'Produit',
    priceLabel: 'Prix',
    availableInStore: 'Disponible en boutique',
    piecesWord: 'pièces',
    byKilosBtn: 'Au Poids (kg)',
    byAmountBtn: 'Par Montant ($)',
    weightInKgLabel: 'Poids en Kilogrammes',
    requestedAmountLabel: 'Montant demandé ($)',
    equivalentTo: 'Équivaut à :',
    piecesQuantityLabel: 'Quantité de Pièces',
    newInventoryItemTitle: 'Nouvel Article en Inventaire',
    editInventoryItemTitle: 'Modifier l’Article',
    saleTypeLabel: 'Type de Vente',
    bulkTypeTitle: 'En Vrac',
    bulkTypeDesc: 'Prix au Kilo ($/kg)',
    pieceTypeTitle: 'À la Pièce',
    pieceTypeDesc: 'Prix à l’Unité ($/pce)',
    itemNameLabel: 'Nom de l’article (ex. Sucre, Haricots, Chips, Ketchup)',
    itemNamePlaceholder: 'Ex. Tortillas ou Bouteille de Ketchup',
    barcodeFieldLabel: 'Code-barres (Scannez ou saisissez manuellement)',
    barcodePlaceholder: 'Ex. 75010001 ou 1',
    autoBtn: 'Auto',
    pricePerKgLabel: 'Prix au Kilo ($/kg)',
    pricePerPcLabel: 'Prix à la Pièce ($/pce)',
    kilosInInventoryLabel: 'Kilos en Inventaire',
    piecesInInventoryLabel: 'Pièces en Inventaire',
    saveInInventoryBtn: 'Enregistrer dans l’Inventaire',
    saveChangesBtn: 'Enregistrer les Modifications',
    barcodeScannerTitle: 'Lecteur de Code-barres',
    simulateScanPrompt: 'Ou touchez un produit pour simuler le scan de son code :',
    confirmChargeTitle: 'Confirmer l’Encaissement',
    confirmChargeDesc: 'L’encaissement déduira les produits de l’inventaire et ajoutera les gains à {name} et au total de la boutique.',
    totalToChargeLabel: 'Total à encaisser :',
    cashReceivedLabel: 'Espèces reçues du client (optionnel pour calculer la monnaie) :',
    exampleShort: 'Ex.',
    changeToReturn: 'Monnaie à rendre :',
    backBtn: 'Retour',
    confirmAndChargeBtn: 'Confirmer et Encaisser',
    profileNameLabel: 'Nom du Profil / Caissier',
    profileNamePlaceholder: 'Ex. Brayan, Marie, Équipe Soir',
    avatarColorLabel: 'Couleur de l’Avatar',
    saveProfileBtn: 'Enregistrer le Profil',
    yesDeleteBtn: 'Oui, Supprimer',
    inventoryStatusTitle: 'État de l’Inventaire',
    allStockGood: 'Tout est parfait ! Tous les produits ont un bon niveau de stock.',
    remainingLabel: 'Reste',
    restockBtn: 'Réapprovisionner',
    apkModalTitle: 'Utiliser comme App Android / APK',
    apkModalIntro: 'Cette application est conçue avec un design mobile sombre prête pour votre boutique :',
    apkOption1Title: 'Option 1 : Installer directement sur Android',
    apkOption1Desc: 'Ouvrez cette application dans Chrome sur votre téléphone, touchez le menu ⋮ et sélectionnez « Ajouter à l’écran d’accueil » / « Installer l’application ».',
    apkOption2Title: 'Option 2 : Générer un fichier .APK avec Capacitor',
    apkOption2Desc: 'Vous pouvez empaqueter ce projet dans un fichier .apk avec CapacitorJS (npx cap add android) ou PWABuilder.',
    understoodBtn: 'Compris',
    languageLabel: 'Langue de l’application',
    selectLanguageTitle: 'Choisir la Langue',
    toastEnterProfileName: 'Veuillez saisir un nom pour le profil',
    toastProfileCreated: 'Profil « {name} » créé',
    toastProfileUpdated: 'Profil mis à jour en « {name} »',
    toastMinOneProfile: 'Il doit exister au moins un profil dans la boutique',
    deleteProfileConfirmTitle: 'Supprimer le profil de {name} ?',
    deleteProfileConfirmDesc: 'L’historique des ventes est conservé, mais ce profil ne pourra plus être sélectionné.',
    toastBarcodeAssigned: 'Code-barres attribué manuellement',
    toastEnterProductName: 'Veuillez saisir le nom du produit',
    toastEnterValidPrice: 'Saisissez un prix valide supérieur à 0 $',
    toastEnterValidStock: 'Saisissez une quantité d’inventaire valide',
    toastDuplicateCode: 'Le code {code} appartient déjà à « {name} »',
    toastProductAdded: '« {name} » ajouté à l’inventaire',
    toastProductUpdated: 'Inventaire de « {name} » mis à jour',
    deleteProductConfirmTitle: 'Supprimer « {name} » ?',
    deleteProductConfirmDesc: 'Cet article sera supprimé de l’inventaire partagé de la boutique.',
    toastProfileDeleted: 'Profil supprimé avec succès',
    toastProductDeleted: 'Produit supprimé de l’inventaire',
    toastBasketCleared: 'Panier vidé',
    toastProductOutOfStock: '« {name} » est en rupture de stock',
    toastEnterValidAmount: 'Saisissez un montant valide',
    toastEnterValidWeight: 'Saisissez un poids en kilogrammes supérieur à 0',
    toastEnterValidPieces: 'Saisissez une quantité de pièces valide',
    toastInsufficientStock: 'Stock insuffisant. Il ne reste que {stock} {unit} de {name}',
    toastAddedToCart: 'Ajouté : {qty} {unit} de {name}',
    toastOnlyStockAvailable: 'Seulement {stock} {unit} disponibles en inventaire',
    toastSaleCompleted: 'Vente encaissée pour {total} ! Inventaire mis à jour.',
    cameraErrorMsg: 'Accès caméra indisponible ou refusé. Touchez un produit ci-dessous pour simuler le scan.',
    toastCodeCaptured: 'Code-barres {code} capturé',
    toastNoProductWithCode: 'Aucun produit trouvé avec le code « {code} »',
    toastLoggedInAs: 'Connecté en tant que {name}',
    clearCartConfirmTitle: 'Vider le Panier Virtuel ?',
    clearCartConfirmDesc: 'Tous les articles actuellement dans le panier seront retirés.',
    toastLanguageChanged: 'Langue changée en {lang}'
  },
  it: {
    posSubtitle: 'PUNTO VENDITA',
    storeTotalShort: 'Totale Negozio',
    apkMode: 'Modalità APK',
    install: 'Installa',
    selectProfileTitle: 'Seleziona il tuo Profilo',
    selectProfileSubtitle: 'Tocca un profilo per entrare',
    individualLabel: 'Individuale',
    salesWord: 'vendite',
    createNewProfile: 'Crea Nuovo Profilo',
    sharedFooterNote: 'Tutti i profili condividono l’inventario e i guadagni totali del negozio.',
    welcome: 'Benvenuto',
    whatToRegisterLine1: 'Cosa vuoi',
    whatToRegisterLine2: 'registrare oggi?',
    storeTotalEarningsTitle: 'Guadagni Totali Negozio',
    sharedWithProfiles: 'Condiviso ({profiles} profili • {sales} vendite)',
    yourEarnings: 'TUO GUADAGNO',
    individualTag: '↑ Individuale',
    salesUpper: 'VENDITE',
    averageUpper: 'MEDIA',
    ticketTag: '↑ Scontrino',
    quickActions: 'AZIONI RAPIDE',
    newBadge: 'NUOVO',
    addProductBtn: 'Aggiungi Prodotto',
    viewCartBtn: 'Vedi Carrello',
    inBasketBadge: '{count} nel carrello ({total})',
    salesHistoryTitle: 'Storico vendite',
    salesHistorySubtitle: 'Consulta le transazioni precedenti',
    catalogTitle: 'Catalogo',
    sharedInventoryCount: 'Inventario condiviso ({count} prodotti)',
    searchPlaceholder: 'Cerca per nome o codice a barre...',
    filterAll: 'Tutti',
    filterBulk: 'Sfuso (kg)',
    filterPiece: 'Al Pezzo',
    filterLow: 'Scorte Basse ({count})',
    noProductsFound: 'Nessun prodotto trovato nell’inventario',
    addNewItemLink: '+ Aggiungi nuovo articolo all’inventario',
    bulkProductLabel: 'Prodotto Sfuso',
    pieceProductLabel: 'Prodotto al Pezzo',
    stockLabel: 'Scorte',
    unitKg: 'kg',
    unitPcs: 'pz',
    perKg: '/kg',
    perPc: '/pz',
    editBtn: 'Modifica',
    outOfStockBtn: 'Esaurito',
    toCartBtn: 'Al carrello',
    virtualCartTitle: 'Carrello Virtuale',
    scanBtn: 'Scansiona',
    emptyBasketTitle: 'Il carrello è vuoto',
    emptyBasketSubtitle: 'Scansiona il codice a barre con la fotocamera o cerca manualmente i prodotti per il cliente.',
    addToCartTitle: 'Aggiungi al Carrello',
    removeBtn: 'Rimuovi',
    totalToPay: 'Totale da pagare',
    chargeSaleBtn: 'Incassa Vendita',
    salesTabTitle: 'Vendite',
    salesTabSubtitle: 'Guadagni condivisi del negozio vs individuali per profilo',
    chargesCount: '{count} incassi',
    cashierBreakdown: 'Guadagni Individuali per Cassiere / Profilo:',
    youBadge: 'Tu',
    salesShort: 'vend.',
    allSalesFilter: 'Tutte le vendite ({count})',
    noSalesRegistered: 'Nessuna vendita registrata per questo filtro.',
    chargedBy: 'Incassato da',
    activeLocalProfile: 'Profilo Locale Attivo',
    individualEarningsUpper: 'GUADAGNI INDIVIDUALI',
    individualSalesUpper: 'VENDITE INDIVIDUALI',
    sumAllProfilesNote: 'Somma di tutti i profili del negozio',
    editProfileBtn: 'Modifica Profilo',
    deleteProfileBtn: 'Elimina Profilo',
    logoutSwitchProfile: 'Esci / Cambia Profilo',
    navHome: 'Home',
    navCatalog: 'Catalogo',
    navCart: 'Carrello',
    navSales: 'Vendite',
    navProfile: 'Profilo',
    scanCodeBtn: 'Scansiona Codice',
    orSearchManually: 'O cerca manualmente:',
    nameOrCodePlaceholder: 'Nome o Codice',
    codeLabel: 'Codice',
    cancelBtn: 'Annulla',
    addBtn: 'Aggiungi',
    productLabel: 'Prodotto',
    priceLabel: 'Prezzo',
    availableInStore: 'Disponibile in negozio',
    piecesWord: 'pezzi',
    byKilosBtn: 'A Peso (kg)',
    byAmountBtn: 'Per Importo ($)',
    weightInKgLabel: 'Peso in Chilogrammi',
    requestedAmountLabel: 'Importo richiesto ($)',
    equivalentTo: 'Equivale a:',
    piecesQuantityLabel: 'Quantità di Pezzi',
    newInventoryItemTitle: 'Nuovo Articolo in Inventario',
    editInventoryItemTitle: 'Modifica Articolo',
    saleTypeLabel: 'Tipo di Vendita',
    bulkTypeTitle: 'Sfuso',
    bulkTypeDesc: 'Prezzo al Chilo ($/kg)',
    pieceTypeTitle: 'Al Pezzo',
    pieceTypeDesc: 'Prezzo all’Unità ($/pz)',
    itemNameLabel: 'Nome dell’articolo (es. Zucchero, Fagioli, Patatine, Ketchup)',
    itemNamePlaceholder: 'Es. Tortillas o Ketchup',
    barcodeFieldLabel: 'Codice a Barre (Scansiona o inserisci manualmente)',
    barcodePlaceholder: 'Es. 75010001 o 1',
    autoBtn: 'Auto',
    pricePerKgLabel: 'Prezzo al Chilo ($/kg)',
    pricePerPcLabel: 'Prezzo al Pezzo ($/pz)',
    kilosInInventoryLabel: 'Chili in Inventario',
    piecesInInventoryLabel: 'Pezzi in Inventario',
    saveInInventoryBtn: 'Salva in Inventario',
    saveChangesBtn: 'Salva Modifiche',
    barcodeScannerTitle: 'Lettore Codice a Barre',
    simulateScanPrompt: 'O tocca un prodotto qui sotto per simulare la scansione:',
    confirmChargeTitle: 'Conferma Incasso',
    confirmChargeDesc: 'All’incasso i prodotti verranno scalati dall’inventario e il guadagno sarà sommato a {name} e al totale del negozio.',
    totalToChargeLabel: 'Totale da incassare:',
    cashReceivedLabel: 'Contanti ricevuti dal cliente (opzionale per calcolare il resto):',
    exampleShort: 'Es.',
    changeToReturn: 'Resto da dare:',
    backBtn: 'Indietro',
    confirmAndChargeBtn: 'Conferma e Incassa',
    profileNameLabel: 'Nome del Profilo / Cassiere',
    profileNamePlaceholder: 'Es. Brayan, Marco, Turno Sera',
    avatarColorLabel: 'Colore Avatar',
    saveProfileBtn: 'Salva Profilo',
    yesDeleteBtn: 'Sì, Elimina',
    inventoryStatusTitle: 'Stato dell’Inventario',
    allStockGood: 'Tutto ottimo! Tutti i prodotti hanno un buon livello di scorte.',
    remainingLabel: 'Restano',
    restockBtn: 'Rifornisci',
    apkModalTitle: 'Usa come App Android / APK',
    apkModalIntro: 'Questa applicazione è progettata con interfaccia mobile scura pronta per il tuo negozio:',
    apkOption1Title: 'Opzione 1: Installa direttamente su Android',
    apkOption1Desc: 'Apri questa app in Chrome dal cellulare, tocca il menu ⋮ e seleziona "Aggiungi a schermata Home" / "Installa app".',
    apkOption2Title: 'Opzione 2: Genera file .APK con Capacitor',
    apkOption2Desc: 'Puoi impacchettare questo progetto in un file .apk usando CapacitorJS (npx cap add android) o PWABuilder.',
    understoodBtn: 'Capito',
    languageLabel: 'Lingua dell’applicazione',
    selectLanguageTitle: 'Seleziona Lingua',
    toastEnterProfileName: 'Inserisci un nome per il profilo',
    toastProfileCreated: 'Profilo "{name}" creato',
    toastProfileUpdated: 'Profilo aggiornato in "{name}"',
    toastMinOneProfile: 'Deve esistere almeno un profilo nel negozio',
    deleteProfileConfirmTitle: 'Eliminare il profilo di {name}?',
    deleteProfileConfirmDesc: 'Lo storico vendite del negozio viene conservato, ma questo profilo non sarà più selezionabile.',
    toastBarcodeAssigned: 'Codice a barre assegnato manualmente',
    toastEnterProductName: 'Inserisci il nome del prodotto',
    toastEnterValidPrice: 'Inserisci un prezzo valido maggiore di $0',
    toastEnterValidStock: 'Inserisci una quantità di inventario valida',
    toastDuplicateCode: 'Il codice {code} appartiene già a "{name}"',
    toastProductAdded: '"{name}" aggiunto all’inventario',
    toastProductUpdated: 'Inventario di "{name}" aggiornato',
    deleteProductConfirmTitle: 'Eliminare "{name}"?',
    deleteProductConfirmDesc: 'Questo articolo verrà eliminato dall’inventario condiviso del negozio.',
    toastProfileDeleted: 'Profilo eliminato correttamente',
    toastProductDeleted: 'Prodotto eliminato dall’inventario',
    toastBasketCleared: 'Carrello svuotato',
    toastProductOutOfStock: '"{name}" è esaurito in inventario',
    toastEnterValidAmount: 'Inserisci un importo valido',
    toastEnterValidWeight: 'Inserisci un peso in chilogrammi maggiore di 0',
    toastEnterValidPieces: 'Inserisci una quantità di pezzi valida',
    toastInsufficientStock: 'Scorte insufficienti. Restano solo {stock} {unit} di {name}',
    toastAddedToCart: 'Aggiunto: {qty} {unit} di {name}',
    toastOnlyStockAvailable: 'Solo {stock} {unit} disponibili in inventario',
    toastSaleCompleted: 'Vendita incassata per {total}! Inventario aggiornato.',
    cameraErrorMsg: 'Impossibile accedere alla fotocamera. Tocca un prodotto qui sotto per simulare la scansione istantanea.',
    toastCodeCaptured: 'Codice {code} acquisito',
    toastNoProductWithCode: 'Nessun prodotto trovato con il codice "{code}"',
    toastLoggedInAs: 'Accesso effettuato come {name}',
    clearCartConfirmTitle: 'Svuotare il Carrello Virtuale?',
    clearCartConfirmDesc: 'Tutti gli articoli presenti nel carrello attuale verranno rimossi.',
    toastLanguageChanged: 'Lingua cambiata in {lang}'
  }
};

// Utilidad para obtener iniciales
const getInitials = (name = '') => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'US';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

// Formateador de moneda
const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return `$${num.toFixed(2)}`;
};

export default function App() {
  // Autenticación y sincronización
  const [user, setUser] = useState(null);
  const [isCloudReady, setIsCloudReady] = useState(false);

  // Idioma activo (guardado en localStorage)
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('ventapos_lang');
      if (saved && TRANSLATIONS[saved]) return saved;
    } catch (e) {
      // Ignorar errores de almacenamiento
    }
    return 'es';
  });
  const [languageModalOpen, setLanguageModalOpen] = useState(false);

  // Función traductora con soporte para variables dinámicas {var}
  const t = (key, params = {}) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.es;
    let text = dict[key] || TRANSLATIONS.es[key] || key;
    Object.keys(params).forEach((k) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]);
    });
    return text;
  };

  const currentLangObj = useMemo(
    () => LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0],
    [lang]
  );

  const handleSelectLanguage = (code) => {
    setLang(code);
    try {
      localStorage.setItem('ventapos_lang', code);
    } catch (e) {
      // Ignorar
    }
    const selectedObj = LANGUAGES.find((l) => l.code === code);
    const msg =
      TRANSLATIONS[code]?.toastLanguageChanged?.replace(
        '{lang}',
        selectedObj ? selectedObj.name : code
      ) || code;
    setLanguageModalOpen(false);
    showToast(msg);
  };

  // Estado principal de la tienda
  const [profiles, setProfiles] = useState(INITIAL_PROFILES);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [sales, setSales] = useState(INITIAL_SALES);

  // Perfil activo (null = pantalla "Selecciona tu Perfil")
  const [activeProfileId, setActiveProfileId] = useState('prof_brayan');
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'catalog' | 'cart' | 'sales' | 'profile'
  const [isFullScreenDesktop, setIsFullScreenDesktop] = useState(false);

  // Carrito de compras actual
  const [cart, setCart] = useState([]);

  // Notificaciones Toast internas (sin alert())
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Estados para Modales
  const [profileModal, setProfileModal] = useState({
    open: false,
    mode: 'create', // 'create' | 'edit'
    profileId: null,
    name: '',
    color: '#2563eb'
  });

  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    open: false,
    type: null, // 'profile' | 'product' | 'clearCart'
    targetId: null,
    title: '',
    description: ''
  });

  const [productModal, setProductModal] = useState({
    open: false,
    mode: 'create', // 'create' | 'edit'
    id: null,
    name: '',
    barcode: '',
    type: 'bulk', // 'bulk' | 'piece'
    price: '',
    stock: '',
    minStock: '3'
  });

  // Modales del Carrito (idénticos a los prototipos 4 y 5)
  const [addToCartModalOpen, setAddToCartModalOpen] = useState(false);
  const [cartSearchQuery, setCartSearchQuery] = useState('');
  const [selectedProductForCart, setSelectedProductForCart] = useState(null);
  const [quantityInput, setQuantityInput] = useState('1.0');
  const [bulkInputMode, setBulkInputMode] = useState('kg'); // 'kg' | 'pesos'
  const [pesosInput, setPesosInput] = useState('');

  // Modal de Cobro / Cambio
  const [checkoutModal, setCheckoutModal] = useState({
    open: false,
    cashReceived: ''
  });

  // Escáner de cámara (para agregar al carrito o para registrar código en inventario)
  const [scannerModal, setScannerModal] = useState({
    open: false,
    purpose: 'cart', // 'cart' | 'productForm'
    manualCode: '',
    cameraError: null
  });
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Modal de ayuda APK / Instalación
  const [apkModalOpen, setApkModalOpen] = useState(false);
  const [lowStockModalOpen, setLowStockModalOpen] = useState(false);

  // Filtros en Catálogo y Ventas
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogFilter, setCatalogFilter] = useState('all'); // 'all' | 'bulk' | 'piece' | 'low'
  const [salesFilterProfile, setSalesFilterProfile] = useState('all');

  // ==========================================
  // 1. AUTENTICACIÓN FIREBASE (REGLA 3)
  // ==========================================
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Error en autenticación:', err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // ==========================================
  // 2. SINCRONIZACIÓN DE DATOS COMPARTIDOS
  // ==========================================
  useEffect(() => {
    if (!user || !db) return;

    const profilesRef = collection(db, 'artifacts', appId, 'public', 'data', 'profiles');
    const productsRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
    const salesRef = collection(db, 'artifacts', appId, 'public', 'data', 'sales');

    const unsubProfiles = onSnapshot(
      profilesRef,
      (snap) => {
        if (snap.empty) {
          INITIAL_PROFILES.forEach((p) => {
            setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', p.id), p);
          });
        } else {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
          setProfiles(list);
        }
        setIsCloudReady(true);
      },
      (err) => console.error('Error leyendo perfiles:', err)
    );

    const unsubProducts = onSnapshot(
      productsRef,
      (snap) => {
        if (snap.empty) {
          INITIAL_PRODUCTS.forEach((prod) => {
            setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', prod.id), prod);
          });
        } else {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          list.sort((a, b) => a.name.localeCompare(b.name));
          setProducts(list);
        }
      },
      (err) => console.error('Error leyendo inventario:', err)
    );

    const unsubSales = onSnapshot(
      salesRef,
      (snap) => {
        if (snap.empty) {
          INITIAL_SALES.forEach((s) => {
            setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sales', s.id), s);
          });
        } else {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setSales(list);
        }
      },
      (err) => console.error('Error leyendo ventas:', err)
    );

    return () => {
      unsubProfiles();
      unsubProducts();
      unsubSales();
    };
  }, [user]);

  // ==========================================
  // CÁLCULOS Y MÉTRICAS DE LA TIENDA Y PERFIL
  // ==========================================
  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeProfileId) || null,
    [profiles, activeProfileId]
  );

  // Ganancias Totales de la Tienda (compartidas entre todos los perfiles)
  const storeTotalEarnings = useMemo(() => {
    return profiles.reduce((acc, p) => acc + (Number(p.individualEarnings) || 0), 0);
  }, [profiles]);

  const storeTotalSalesCount = useMemo(() => {
    return profiles.reduce((acc, p) => acc + (Number(p.salesCount) || 0), 0);
  }, [profiles]);

  // Estadísticas individuales del perfil activo
  const profileEarnings = Number(activeProfile?.individualEarnings) || 0;
  const profileSalesCount = Number(activeProfile?.salesCount) || 0;
  const profileAverageTicket =
    profileSalesCount > 0 ? profileEarnings / profileSalesCount : 0;

  // Productos con bajo inventario
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => Number(p.stock) <= Number(p.minStock || 3));
  }, [products]);

  // Total del carrito actual
  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.subtotal, 0);
  }, [cart]);

  // ==========================================
  // FUNCIONES DE GESTIÓN DE PERFILES
  // ==========================================
  const handleOpenCreateProfile = () => {
    setProfileModal({
      open: true,
      mode: 'create',
      profileId: null,
      name: '',
      color: PROFILE_COLORS[profiles.length % PROFILE_COLORS.length]
    });
  };

  const handleOpenEditProfile = (profile, e) => {
    if (e) e.stopPropagation();
    setProfileModal({
      open: true,
      mode: 'edit',
      profileId: profile.id,
      name: profile.name,
      color: profile.color || '#2563eb'
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const trimmedName = profileModal.name.trim();
    if (!trimmedName) {
      showToast(t('toastEnterProfileName'), 'error');
      return;
    }

    if (profileModal.mode === 'create') {
      const newProfile = {
        id: `prof_${Date.now()}`,
        name: trimmedName,
        color: profileModal.color,
        individualEarnings: 0,
        salesCount: 0,
        createdAt: Date.now()
      };

      setProfiles((prev) => [...prev, newProfile]);
      if (user && db) {
        await setDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'profiles', newProfile.id),
          newProfile
        );
      }
      showToast(t('toastProfileCreated', { name: trimmedName }));
    } else {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === profileModal.profileId
            ? { ...p, name: trimmedName, color: profileModal.color }
            : p
        )
      );
      if (user && db) {
        await updateDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'profiles', profileModal.profileId),
          { name: trimmedName, color: profileModal.color }
        );
      }
      showToast(t('toastProfileUpdated', { name: trimmedName }));
    }

    setProfileModal({ ...profileModal, open: false });
  };

  const confirmDeleteProfile = (profile, e) => {
    if (e) e.stopPropagation();
    if (profiles.length <= 1) {
      showToast(t('toastMinOneProfile'), 'error');
      return;
    }
    setDeleteConfirmModal({
      open: true,
      type: 'profile',
      targetId: profile.id,
      title: t('deleteProfileConfirmTitle', { name: profile.name }),
      description: t('deleteProfileConfirmDesc')
    });
  };

  // ==========================================
  // FUNCIONES DE GESTIÓN DE INVENTARIO
  // ==========================================
  const handleOpenCreateProduct = () => {
    setProductModal({
      open: true,
      mode: 'create',
      id: null,
      name: '',
      barcode: '',
      type: 'bulk',
      price: '',
      stock: '',
      minStock: '3'
    });
  };

  const handleOpenEditProduct = (prod) => {
    setProductModal({
      open: true,
      mode: 'edit',
      id: prod.id,
      name: prod.name,
      barcode: prod.barcode,
      type: prod.type,
      price: String(prod.price),
      stock: String(prod.stock),
      minStock: String(prod.minStock || 3)
    });
  };

  const generateRandomBarcode = () => {
    const randomCode = '750' + Math.floor(100000000 + Math.random() * 900000000);
    setProductModal((prev) => ({ ...prev, barcode: randomCode }));
    showToast(t('toastBarcodeAssigned'));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const name = productModal.name.trim();
    const barcode =
      productModal.barcode.trim() || String(products.length + 1);
    const price = parseFloat(productModal.price);
    const stock = parseFloat(productModal.stock);
    const minStock = parseFloat(productModal.minStock) || 3;

    if (!name) {
      showToast(t('toastEnterProductName'), 'error');
      return;
    }
    if (isNaN(price) || price <= 0) {
      showToast(t('toastEnterValidPrice'), 'error');
      return;
    }
    if (isNaN(stock) || stock < 0) {
      showToast(t('toastEnterValidStock'), 'error');
      return;
    }

    // Verificar código duplicado
    const duplicate = products.find(
      (p) => p.barcode === barcode && p.id !== productModal.id
    );
    if (duplicate) {
      showToast(t('toastDuplicateCode', { code: barcode, name: duplicate.name }), 'error');
      return;
    }

    const normalizedStock =
      productModal.type === 'piece' ? Math.floor(stock) : Number(stock.toFixed(3));

    if (productModal.mode === 'create') {
      const newProd = {
        id: `prod_${Date.now()}`,
        name,
        barcode,
        type: productModal.type,
        price: Number(price.toFixed(2)),
        stock: normalizedStock,
        minStock
      };
      setProducts((prev) => [...prev, newProd]);
      if (user && db) {
        await setDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'products', newProd.id),
          newProd
        );
      }
      showToast(t('toastProductAdded', { name }));
    } else {
      const updatedProd = {
        name,
        barcode,
        type: productModal.type,
        price: Number(price.toFixed(2)),
        stock: normalizedStock,
        minStock
      };
      setProducts((prev) =>
        prev.map((p) => (p.id === productModal.id ? { ...p, ...updatedProd } : p))
      );
      if (user && db) {
        await updateDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'products', productModal.id),
          updatedProd
        );
      }
      showToast(t('toastProductUpdated', { name }));
    }

    setProductModal((prev) => ({ ...prev, open: false }));
  };

  const confirmDeleteProduct = (prod) => {
    setDeleteConfirmModal({
      open: true,
      type: 'product',
      targetId: prod.id,
      title: t('deleteProductConfirmTitle', { name: prod.name }),
      description: t('deleteProductConfirmDesc')
    });
  };

  // Ejecución de eliminaciones confirmadas
  const handleExecuteDelete = async () => {
    const { type, targetId } = deleteConfirmModal;
    if (type === 'profile') {
      setProfiles((prev) => prev.filter((p) => p.id !== targetId));
      if (activeProfileId === targetId) {
        setActiveProfileId(null);
      }
      if (user && db) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', targetId));
      }
      showToast(t('toastProfileDeleted'));
    } else if (type === 'product') {
      setProducts((prev) => prev.filter((p) => p.id !== targetId));
      setCart((prev) => prev.filter((item) => item.productId !== targetId));
      if (user && db) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', targetId));
      }
      showToast(t('toastProductDeleted'));
    } else if (type === 'clearCart') {
      setCart([]);
      showToast(t('toastBasketCleared'));
    }
    setDeleteConfirmModal({ open: false, type: null, targetId: null, title: '', description: '' });
  };

  // ==========================================
  // FUNCIONES DEL CARRITO Y ESCÁNER DE CÁMARA
  // ==========================================
  const selectProductToAddToCart = (product) => {
    if (product.stock <= 0) {
      showToast(t('toastProductOutOfStock', { name: product.name }), 'error');
      return;
    }
    setSelectedProductForCart(product);
    setBulkInputMode('kg');
    setPesosInput('');
    setQuantityInput(product.type === 'bulk' ? '1.0' : '1');
  };

  const handleConfirmAddToCart = (e) => {
    if (e) e.preventDefault();
    if (!selectedProductForCart) return;

    const prod = selectedProductForCart;
    let qtyToAdd = 0;

    if (prod.type === 'bulk') {
      if (bulkInputMode === 'pesos') {
        const pesos = parseFloat(pesosInput);
        if (isNaN(pesos) || pesos <= 0) {
          showToast(t('toastEnterValidAmount'), 'error');
          return;
        }
        qtyToAdd = Number((pesos / prod.price).toFixed(3));
      } else {
        qtyToAdd = parseFloat(quantityInput);
      }
    } else {
      qtyToAdd = parseInt(quantityInput, 10);
    }

    if (isNaN(qtyToAdd) || qtyToAdd <= 0) {
      showToast(
        prod.type === 'bulk'
          ? t('toastEnterValidWeight')
          : t('toastEnterValidPieces'),
        'error'
      );
      return;
    }

    // Revisar cuánto hay ya en la canasta para no exceder stock real
    const existingInCart = cart.find((item) => item.productId === prod.id);
    const currentCartQty = existingInCart ? existingInCart.quantity : 0;
    const totalRequested = Number((currentCartQty + qtyToAdd).toFixed(3));

    if (totalRequested > prod.stock) {
      showToast(
        t('toastInsufficientStock', {
          stock: prod.stock,
          unit: prod.type === 'bulk' ? t('unitKg') : t('unitPcs'),
          name: prod.name
        }),
        'error'
      );
      return;
    }

    const subtotal = Number((totalRequested * prod.price).toFixed(2));

    if (existingInCart) {
      setCart((prev) =>
        prev.map((item) =>
          item.productId === prod.id
            ? { ...item, quantity: totalRequested, subtotal }
            : item
        )
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          productId: prod.id,
          name: prod.name,
          barcode: prod.barcode,
          type: prod.type,
          price: prod.price,
          quantity: totalRequested,
          subtotal
        }
      ]);
    }

    showToast(
      t('toastAddedToCart', {
        qty: qtyToAdd,
        unit: prod.type === 'bulk' ? t('unitKg') : t('unitPcs'),
        name: prod.name
      })
    );
    setSelectedProductForCart(null);
    setAddToCartModalOpen(false);
    setCartSearchQuery('');
  };

  const updateCartItemQuantity = (productId, delta) => {
    const item = cart.find((i) => i.productId === productId);
    const prod = products.find((p) => p.id === productId);
    if (!item || !prod) return;

    const step = item.type === 'bulk' ? delta * 0.25 : delta;
    const newQty = Number((item.quantity + step).toFixed(3));

    if (newQty <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }

    if (newQty > prod.stock) {
      showToast(
        t('toastOnlyStockAvailable', {
          stock: prod.stock,
          unit: prod.type === 'bulk' ? t('unitKg') : t('unitPcs')
        }),
        'error'
      );
      return;
    }

    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? {
              ...i,
              quantity: newQty,
              subtotal: Number((newQty * i.price).toFixed(2))
            }
          : i
      )
    );
  };

  // ==========================================
  // COBRAR CANASTA (DESCUENTA INVENTARIO Y SUMA GANANCIAS)
  // ==========================================
  const handleCompleteSale = async () => {
    if (cart.length === 0 || !activeProfile) return;

    const saleTotal = Number(cartTotal.toFixed(2));
    const newSale = {
      id: `sale_${Date.now()}`,
      profileId: activeProfile.id,
      profileName: activeProfile.name,
      total: saleTotal,
      timestamp: Date.now(),
      items: cart
    };

    // 1. Descontar cada artículo del inventario (sea por pieza o a granel en kg)
    const updatedProducts = products.map((prod) => {
      const cartItem = cart.find((c) => c.productId === prod.id);
      if (!cartItem) return prod;
      const remainingStock = Math.max(
        0,
        Number((prod.stock - cartItem.quantity).toFixed(3))
      );
      return {
        ...prod,
        stock: prod.type === 'piece' ? Math.floor(remainingStock) : remainingStock
      };
    });

    // 2. Sumar ganancias al perfil activo (lo cual también suma a las ganancias totales de la tienda)
    const newProfileEarnings = Number(
      (profileEarnings + saleTotal).toFixed(2)
    );
    const newProfileSalesCount = profileSalesCount + 1;

    setProducts(updatedProducts);
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === activeProfile.id
          ? {
              ...p,
              individualEarnings: newProfileEarnings,
              salesCount: newProfileSalesCount
            }
          : p
      )
    );
    setSales((prev) => [newSale, ...prev]);
    setCart([]);
    setCheckoutModal({ open: false, cashReceived: '' });

    // Persistir en Firestore si está activo
    if (user && db) {
      try {
        for (const item of cart) {
          const updatedProd = updatedProducts.find((p) => p.id === item.productId);
          if (updatedProd) {
            await updateDoc(
              doc(db, 'artifacts', appId, 'public', 'data', 'products', updatedProd.id),
              { stock: updatedProd.stock }
            );
          }
        }
        await updateDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'profiles', activeProfile.id),
          {
            individualEarnings: newProfileEarnings,
            salesCount: newProfileSalesCount
          }
        );
        await setDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'sales', newSale.id),
          newSale
        );
      } catch (err) {
        console.error('Error guardando venta en nube:', err);
      }
    }

    showToast(t('toastSaleCompleted', { total: formatCurrency(saleTotal) }));
  };

  // ==========================================
  // LECTOR DE CÓDIGO DE BARRAS CON CÁMARA
  // ==========================================
  useEffect(() => {
    let animationFrameId;
    let barcodeDetector = null;

    const startCamera = async () => {
      if (!scannerModal.open) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        if ('BarcodeDetector' in window) {
          barcodeDetector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'code_128', 'qr_code', 'upc_a']
          });

          const detectLoop = async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  handleBarcodeDetected(barcodes[0].rawValue);
                  return;
                }
              } catch (e) {
                // Ignorar frame fallido
              }
            }
            animationFrameId = requestAnimationFrame(detectLoop);
          };
          detectLoop();
        }
      } catch (err) {
        setScannerModal((prev) => ({
          ...prev,
          cameraError: t('cameraErrorMsg')
        }));
      }
    };

    if (scannerModal.open) {
      startCamera();
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [scannerModal.open]);

  const closeScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScannerModal({ open: false, purpose: 'cart', manualCode: '', cameraError: null });
  };

  const handleBarcodeDetected = (code) => {
    const cleanCode = String(code).trim();
    if (!cleanCode) return;

    if (scannerModal.purpose === 'productForm') {
      setProductModal((prev) => ({ ...prev, barcode: cleanCode }));
      showToast(t('toastCodeCaptured', { code: cleanCode }));
      closeScanner();
      return;
    }

    // Buscar producto en inventario por código de barras
    const foundProduct = products.find((p) => p.barcode === cleanCode);
    if (foundProduct) {
      closeScanner();
      setAddToCartModalOpen(true);
      selectProductToAddToCart(foundProduct);
    } else {
      showToast(t('toastNoProductWithCode', { code: cleanCode }), 'error');
    }
  };

  // Productos filtrados para Catálogo
  const filteredCatalog = useMemo(() => {
    return products.filter((p) => {
      const matchesQuery =
        p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        p.barcode.toLowerCase().includes(catalogSearch.toLowerCase());
      if (!matchesQuery) return false;
      if (catalogFilter === 'bulk') return p.type === 'bulk';
      if (catalogFilter === 'piece') return p.type === 'piece';
      if (catalogFilter === 'low') return p.stock <= (p.minStock || 3);
      return true;
    });
  }, [products, catalogSearch, catalogFilter]);

  // Productos filtrados dentro del Modal "Añadir al Carrito"
  const filteredCartModalProducts = useMemo(() => {
    const q = cartSearchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q)
    );
  }, [products, cartSearchQuery]);

  // ==========================================
  // RENDERIZADO: PANTALLA 1 - SELECCIONA TU PERFIL
  // ==========================================
  const renderProfileSelectorScreen = () => (
    <div className="flex flex-col justify-between min-h-full px-6 py-10 bg-[#0b0e14] text-white select-none">
      {/* Parte superior con botón de info APK y Selector de Idioma */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#161b22] px-3 py-1.5 rounded-full border border-slate-800/80 truncate">
          <Store className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="truncate">
            {t('storeTotalShort')}:{' '}
            <strong className="text-emerald-400">{formatCurrency(storeTotalEarnings)}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setLanguageModalOpen(true)}
            className="flex items-center gap-1 text-xs text-slate-200 bg-[#161b22] hover:bg-[#1f2633] border border-slate-800 px-2.5 py-1.5 rounded-full transition"
            title={t('selectLanguageTitle')}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{currentLangObj.flag}</span>
            <span className="uppercase font-bold text-[10px]">{lang}</span>
          </button>

          <button
            onClick={() => setApkModalOpen(true)}
            className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-full hover:bg-blue-500/20 transition"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{t('apkMode')}</span>
          </button>
        </div>
      </div>

      {/* Centro idéntico a la Imagen 1 del prototipo */}
      <div className="my-auto py-8 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-blue-600/10 flex items-center justify-center mb-5">
          <Users className="w-12 h-12 text-[#2563eb]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5 text-center">
          {t('selectProfileTitle')}
        </h1>
        <p className="text-sm text-slate-400 mb-8 text-center">
          {t('selectProfileSubtitle')}
        </p>

        {/* Lista de Perfiles */}
        <div className="w-full space-y-3 mb-4">
          {profiles.map((prof) => (
            <div
              key={prof.id}
              onClick={() => {
                setActiveProfileId(prof.id);
                setActiveTab('home');
                showToast(t('toastLoggedInAs', { name: prof.name }));
              }}
              className="group w-full bg-[#161b24] hover:bg-[#1c222d] active:scale-[0.99] transition-all rounded-2xl p-4 flex items-center justify-between cursor-pointer border border-slate-800/70 shadow-lg"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-base shrink-0 shadow-inner"
                  style={{ backgroundColor: prof.color || '#2563eb' }}
                >
                  {getInitials(prof.name)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white text-base truncate">
                    {prof.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t('individualLabel')}:{' '}
                    <span className="text-emerald-400 font-medium">
                      {formatCurrency(prof.individualEarnings)}
                    </span>{' '}
                    • {prof.salesCount || 0} {t('salesWord')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => handleOpenEditProfile(prof, e)}
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-xl transition"
                  title={t('editProfileBtn')}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {profiles.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => confirmDeleteProfile(prof, e)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition"
                    title={t('deleteProfileBtn')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <ChevronRight className="w-5 h-5 text-slate-500 ml-1" />
              </div>
            </div>
          ))}
        </div>

        {/* Botón "+ Crear Nuevo Perfil" fiel a la Imagen 1 */}
        <button
          type="button"
          onClick={handleOpenCreateProfile}
          className="w-full py-3.5 px-4 rounded-xl border border-[#2563eb] text-[#3b82f6] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-600/10 active:scale-[0.99] transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t('createNewProfile')}</span>
        </button>
      </div>

      {/* Pie informativo */}
      <div className="text-center text-xs text-slate-500">
        {t('sharedFooterNote')}
      </div>
    </div>
  );

  // ==========================================
  // RENDERIZADO: PESTAÑA 1 - INICIO (IMAGEN 2)
  // ==========================================
  const renderHomeTab = () => (
    <div className="p-5 pb-28 space-y-6">
      {/* Header superior fiel a Imagen 2 + Botón de Idioma */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#2563eb] flex items-center justify-center shadow-lg shadow-blue-600/20">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-white">VentaPOS</h1>
            <p className="text-[10px] tracking-widest text-slate-400 font-semibold uppercase">
              {t('posSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de idioma rápido */}
          <button
            onClick={() => setLanguageModalOpen(true)}
            className="h-11 px-3 rounded-2xl bg-[#1c212b] hover:bg-[#252b38] flex items-center justify-center gap-1.5 text-white text-xs font-bold transition"
            title={t('selectLanguageTitle')}
          >
            <span>{currentLangObj.flag}</span>
            <span className="uppercase text-[11px] text-slate-300">{lang}</span>
          </button>

          {/* Botón de alertas de stock */}
          <button
            onClick={() => setLowStockModalOpen(true)}
            className="relative w-11 h-11 rounded-2xl bg-[#1c212b] hover:bg-[#252b38] flex items-center justify-center text-white transition"
            title={t('inventoryStatusTitle')}
          >
            <Bell className="w-5 h-5" />
            {lowStockProducts.length > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-[#1c212b]" />
            )}
          </button>

          {/* Avatar del Perfil Activo (tocar para ir a Perfil o cambiar) */}
          <button
            onClick={() => setActiveTab('profile')}
            className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white text-sm shadow-md transition active:scale-95"
            style={{ backgroundColor: activeProfile?.color || '#9333ea' }}
            title={t('navProfile')}
          >
            {getInitials(activeProfile?.name)}
          </button>
        </div>
      </div>

      {/* Saludo personalizado */}
      <div>
        <p className="text-base text-slate-200 font-medium">
          {t('welcome')},{' '}
          <span className="text-amber-500 font-bold">{activeProfile?.name}</span> 👋
        </p>
        <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight mt-1">
          {t('whatToRegisterLine1')}
          <br />
          {t('whatToRegisterLine2')}
        </h2>
      </div>

      {/* Barra de Ganancias Totales de la Tienda (Compartida por todos los perfiles) */}
      <div className="bg-gradient-to-r from-[#161b26] to-[#1b2230] border border-slate-800/90 rounded-2xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              {t('storeTotalEarningsTitle')}
            </p>
            <p className="text-xs text-slate-400">
              {t('sharedWithProfiles', {
                profiles: profiles.length,
                sales: storeTotalSalesCount
              })}
            </p>
          </div>
        </div>
        <span className="text-lg font-extrabold text-emerald-400">
          {formatCurrency(storeTotalEarnings)}
        </span>
      </div>

      {/* 3 Tarjetas de resumen individual (HOY / VENTAS / PROMEDIO) fiel a Imagen 2 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#161b24] border border-slate-800/60 rounded-2xl p-3.5 text-center flex flex-col justify-between">
          <p className="text-lg font-extrabold text-white truncate">
            {formatCurrency(profileEarnings)}
          </p>
          <p className="text-[10px] tracking-wider text-slate-400 uppercase my-1">
            {t('yourEarnings')}
          </p>
          <p className="text-[11px] text-emerald-400 font-medium">
            {t('individualTag')}
          </p>
        </div>

        <div className="bg-[#161b24] border border-slate-800/60 rounded-2xl p-3.5 text-center flex flex-col justify-between">
          <p className="text-lg font-extrabold text-white">
            {profileSalesCount}
          </p>
          <p className="text-[10px] tracking-wider text-slate-400 uppercase my-1">
            {t('salesUpper')}
          </p>
          <p className="text-[11px] text-emerald-400 font-medium">
            ↑ {profileSalesCount}
          </p>
        </div>

        <div className="bg-[#161b24] border border-slate-800/60 rounded-2xl p-3.5 text-center flex flex-col justify-between">
          <p className="text-lg font-extrabold text-white truncate">
            {formatCurrency(profileAverageTicket)}
          </p>
          <p className="text-[10px] tracking-wider text-slate-400 uppercase my-1">
            {t('averageUpper')}
          </p>
          <p className="text-[11px] text-emerald-400 font-medium">
            {t('ticketTag')}
          </p>
        </div>
      </div>

      {/* ACCIONES RÁPIDAS (Tarjetas grandes Azul y Verde idénticas a Imagen 2) */}
      <div className="space-y-3.5">
        <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
          {t('quickActions')}
        </p>

        {/* Botón Azul: Agregar Producto */}
        <button
          onClick={handleOpenCreateProduct}
          className="relative w-full bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] hover:brightness-110 active:scale-[0.99] transition rounded-3xl p-6 flex flex-col items-center justify-center text-white shadow-lg shadow-blue-900/30"
        >
          <span className="absolute top-3.5 right-4 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
            {t('newBadge')}
          </span>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2.5">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-base tracking-wide">
            {t('addProductBtn')}
          </span>
        </button>

        {/* Botón Verde: Ver Carrito */}
        <button
          onClick={() => setActiveTab('cart')}
          className="relative w-full bg-gradient-to-br from-[#229954] to-[#1e8449] hover:brightness-110 active:scale-[0.99] transition rounded-3xl p-6 flex flex-col items-center justify-center text-white shadow-lg shadow-emerald-900/30"
        >
          {cart.length > 0 && (
            <span className="absolute top-3.5 right-4 bg-black/30 text-emerald-200 text-xs font-bold px-2.5 py-1 rounded-lg">
              {t('inBasketBadge', {
                count: cart.length,
                total: formatCurrency(cartTotal)
              })}
            </span>
          )}
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2.5">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-base tracking-wide">
            {t('viewCartBtn')}
          </span>
        </button>

        {/* Tarjeta Historial de ventas */}
        <button
          onClick={() => setActiveTab('sales')}
          className="w-full bg-[#161b24] hover:bg-[#1c222d] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between transition"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#212733] flex items-center justify-center text-slate-200">
              <History className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-white">{t('salesHistoryTitle')}</p>
              <p className="text-xs text-slate-400">
                {t('salesHistorySubtitle')}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </button>
      </div>
    </div>
  );

  // ==========================================
  // RENDERIZADO: PESTAÑA 2 - CATÁLOGO / INVENTARIO (IMAGEN 3)
  // ==========================================
  const renderCatalogTab = () => (
    <div className="p-5 pb-28 space-y-5">
      {/* Header Catálogo idéntico a Imagen 3 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">{t('catalogTitle')}</h1>
          <p className="text-xs text-slate-400">
            {t('sharedInventoryCount', { count: products.length })}
          </p>
        </div>
        <button
          onClick={handleOpenCreateProduct}
          className="w-12 h-12 rounded-full bg-[#2563eb] hover:bg-blue-500 active:scale-95 transition flex items-center justify-center text-white shadow-lg shadow-blue-600/30"
          title={t('addProductBtn')}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Buscador y Filtros */}
      <div className="space-y-2.5">
        <div className="relative">
          <input
            type="text"
            value={catalogSearch}
            onChange={(e) => setCatalogSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-[#161b24] border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          {catalogSearch && (
            <button
              onClick={() => setCatalogSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: t('filterAll') },
            { id: 'bulk', label: t('filterBulk') },
            { id: 'piece', label: t('filterPiece') },
            {
              id: 'low',
              label: t('filterLow', { count: lowStockProducts.length })
            }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCatalogFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                catalogFilter === tab.id
                  ? 'bg-[#2563eb] text-white'
                  : 'bg-[#161b24] text-slate-400 border border-slate-800/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Productos (Fiel a la tarjeta de Tortillas en Imagen 3) */}
      {filteredCatalog.length === 0 ? (
        <div className="bg-[#161b24] border border-slate-800/60 rounded-2xl p-8 text-center space-y-3">
          <Package className="w-10 h-10 text-slate-500 mx-auto" />
          <p className="text-sm text-slate-300 font-medium">
            {t('noProductsFound')}
          </p>
          <button
            onClick={handleOpenCreateProduct}
            className="text-xs text-blue-400 font-semibold hover:underline"
          >
            {t('addNewItemLink')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCatalog.map((prod) => {
            const isLow = prod.stock <= (prod.minStock || 3);
            return (
              <div
                key={prod.id}
                className="bg-[#161b24] border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      EAN: {prod.barcode}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-xs text-slate-400">
                        {prod.type === 'bulk'
                          ? t('bulkProductLabel')
                          : t('pieceProductLabel')}
                      </span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${
                          prod.stock <= 0
                            ? 'bg-red-500/20 text-red-400'
                            : isLow
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {t('stockLabel')}:{' '}
                        {prod.type === 'bulk'
                          ? `${Number(prod.stock).toFixed(2)} ${t('unitKg')}`
                          : `${prod.stock} ${t('unitPcs')}`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-lg font-extrabold text-[#22c55e]">
                      ${Number(prod.price).toFixed(1)}
                      {prod.type === 'bulk' ? t('perKg') : t('perPc')}
                    </p>
                  </div>
                </div>

                {/* Acciones rápidas sobre el objeto del inventario */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditProduct(prod)}
                      className="flex items-center gap-1 text-xs text-slate-300 hover:text-blue-400 bg-[#1f2633] px-3 py-1.5 rounded-lg transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{t('editBtn')}</span>
                    </button>
                    <button
                      onClick={() => confirmDeleteProduct(prod)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 bg-[#1f2633] px-2.5 py-1.5 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setAddToCartModalOpen(true);
                      selectProductToAddToCart(prod);
                    }}
                    disabled={prod.stock <= 0}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg transition ${
                      prod.stock <= 0
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>
                      {prod.stock <= 0 ? t('outOfStockBtn') : t('toCartBtn')}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ==========================================
  // RENDERIZADO: PESTAÑA 3 - CARRITO VIRTUAL (IMÁGENES 4, 5 Y 6)
  // ==========================================
  const renderCartTab = () => (
    <div className="flex flex-col h-full min-h-[calc(100vh-5rem)] p-5 pb-28 justify-between">
      <div>
        {/* Header Carrito Virtual idéntico a Imagen 6 */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-extrabold text-white">
            {t('virtualCartTitle')}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setScannerModal({
                  open: true,
                  purpose: 'cart',
                  manualCode: '',
                  cameraError: null
                })
              }
              className="flex items-center gap-1.5 bg-blue-600/20 border border-blue-500/40 text-blue-400 px-3 py-2 rounded-xl text-xs font-bold hover:bg-blue-600/30 transition"
            >
              <QrCode className="w-4 h-4" />
              <span>{t('scanBtn')}</span>
            </button>
            {cart.length > 0 && (
              <button
                onClick={() =>
                  setDeleteConfirmModal({
                    open: true,
                    type: 'clearCart',
                    targetId: null,
                    title: t('clearCartConfirmTitle'),
                    description: t('clearCartConfirmDesc')
                  })
                }
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition"
                title={t('clearCartConfirmTitle')}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Lista de objetos que se llevará el cliente */}
        {cart.length === 0 ? (
          <div className="bg-[#161b24] border border-slate-800/70 rounded-2xl p-8 text-center my-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/70 flex items-center justify-center mx-auto text-slate-400">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-bold text-white">
                {t('emptyBasketTitle')}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {t('emptyBasketSubtitle')}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedProductForCart(null);
                setAddToCartModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-blue-500 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addToCartTitle')}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {cart.map((item) => (
              <div
                key={item.productId}
                className="bg-[#161b24] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-base truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.type === 'bulk'
                      ? `${Number(item.quantity).toFixed(3)} ${t('unitKg')} x $${Number(
                          item.price
                        ).toFixed(1)}${t('perKg')}`
                      : `${item.quantity} ${t('unitPcs')} x $${Number(item.price).toFixed(
                          2
                        )}${t('perPc')}`}
                  </p>

                  {/* Controles rápidos de cantidad */}
                  <div className="flex items-center gap-2 mt-2.5">
                    <button
                      onClick={() => updateCartItemQuantity(item.productId, -1)}
                      className="w-7 h-7 rounded-lg bg-[#212836] hover:bg-slate-700 flex items-center justify-center text-slate-300"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-semibold text-slate-200 px-1">
                      {item.type === 'bulk'
                        ? `${item.quantity} ${t('unitKg')}`
                        : `${item.quantity} ${t('unitPcs')}`}
                    </span>
                    <button
                      onClick={() => updateCartItemQuantity(item.productId, 1)}
                      className="w-7 h-7 rounded-lg bg-[#212836] hover:bg-slate-700 flex items-center justify-center text-slate-300"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setCart((prev) =>
                          prev.filter((i) => i.productId !== item.productId)
                        )
                      }
                      className="ml-2 text-xs text-red-400 hover:underline"
                    >
                      {t('removeBtn')}
                    </button>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-lg font-extrabold text-[#22c55e]">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Parte inferior fija con botón flotante azul + Tarjeta de Cobro (Imagen 6) */}
      <div className="mt-auto space-y-3">
        <div className="flex justify-end">
          <button
            onClick={() => {
              setSelectedProductForCart(null);
              setAddToCartModalOpen(true);
            }}
            className="w-14 h-14 rounded-2xl bg-[#2563eb] hover:bg-blue-500 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-blue-600/30 transition"
            title={t('addToCartTitle')}
          >
            <ShoppingCart className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-[#161b24] border border-slate-800/90 rounded-3xl p-5 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-base text-slate-200 font-medium">
              {t('totalToPay')}
            </span>
            <span className="text-2xl font-extrabold text-[#22c55e]">
              {formatCurrency(cartTotal)}
            </span>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() =>
              setCheckoutModal({ open: true, cashReceived: '' })
            }
            className={`w-full py-4 rounded-2xl font-bold text-base transition ${
              cart.length === 0
                ? 'bg-[#21262d] text-slate-500 cursor-not-allowed'
                : 'bg-[#229954] hover:bg-[#1e8449] active:scale-[0.99] text-white shadow-lg shadow-emerald-900/40'
            }`}
          >
            {t('chargeSaleBtn')}
          </button>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // RENDERIZADO: PESTAÑA 4 - VENTAS E HISTORIAL
  // ==========================================
  const renderSalesTab = () => {
    const filteredSales =
      salesFilterProfile === 'all'
        ? sales
        : sales.filter((s) => s.profileId === salesFilterProfile);

    return (
      <div className="p-5 pb-28 space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {t('salesTabTitle')}
          </h1>
          <p className="text-xs text-slate-400">
            {t('salesTabSubtitle')}
          </p>
        </div>

        {/* Resumen general de la tienda vs perfiles */}
        <div className="bg-gradient-to-br from-[#161b24] to-[#1d2432] border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                {t('storeTotalEarningsTitle')}
              </p>
              <p className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                {formatCurrency(storeTotalEarnings)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded-lg font-semibold">
                {t('chargesCount', { count: storeTotalSalesCount })}
              </span>
            </div>
          </div>

          {/* Desglose individual por perfil */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <p className="text-xs text-slate-400 font-semibold">
              {t('cashierBreakdown')}
            </p>
            {profiles.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-xs bg-[#11151c] px-3 py-2 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: p.color || '#2563eb' }}
                  >
                    {getInitials(p.name)}
                  </span>
                  <span className="text-white font-medium">{p.name}</span>
                  {p.id === activeProfileId && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                      {t('youBadge')}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold">
                    {formatCurrency(p.individualEarnings)}
                  </span>
                  <span className="text-slate-500 ml-1.5">
                    ({p.salesCount || 0} {t('salesShort')})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtro por perfil */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSalesFilterProfile('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              salesFilterProfile === 'all'
                ? 'bg-[#2563eb] text-white'
                : 'bg-[#161b24] text-slate-400 border border-slate-800'
            }`}
          >
            {t('allSalesFilter', { count: sales.length })}
          </button>
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => setSalesFilterProfile(p.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                salesFilterProfile === p.id
                  ? 'bg-[#2563eb] text-white'
                  : 'bg-[#161b24] text-slate-400 border border-slate-800'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Lista de tickets cobrados */}
        {filteredSales.length === 0 ? (
          <div className="bg-[#161b24] border border-slate-800/60 rounded-2xl p-8 text-center text-slate-400 text-sm">
            {t('noSalesRegistered')}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSales.map((sale) => (
              <div
                key={sale.id}
                className="bg-[#161b24] border border-slate-800/80 rounded-2xl p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">
                      {t('chargedBy')}: {sale.profileName}
                    </span>
                  </div>
                  <span className="text-base font-extrabold text-emerald-400">
                    {formatCurrency(sale.total)}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  {new Date(sale.timestamp).toLocaleString(currentLangObj.locale, {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </p>

                <div className="pt-2 border-t border-slate-800/70 space-y-1">
                  {(sale.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-xs text-slate-300"
                    >
                      <span>
                        {item.type === 'bulk'
                          ? `${item.quantity} ${t('unitKg')}`
                          : `${item.quantity}x`}{' '}
                        {item.name}
                      </span>
                      <span className="text-slate-400">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // RENDERIZADO: PESTAÑA 5 - PERFIL (IMAGEN 7)
  // ==========================================
  const renderProfileTab = () => (
    <div className="p-6 pb-28 flex flex-col items-center text-center space-y-6">
      {/* Avatar circular grande fiel a Imagen 7 */}
      <div className="mt-4 flex flex-col items-center">
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-extrabold text-white shadow-xl border-4 border-slate-800"
          style={{ backgroundColor: activeProfile?.color || '#2d333b' }}
        >
          {getInitials(activeProfile?.name)}
        </div>
        <h1 className="text-3xl font-extrabold text-white mt-4">
          {activeProfile?.name}
        </h1>
        <p className="text-sm text-slate-400 mt-1">{t('activeLocalProfile')}</p>
      </div>

      {/* 2 Tarjetas Individuales (GANANCIAS y VENTAS TOTALES) idénticas a Imagen 7 */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="bg-[#1c2128] border border-slate-800/80 rounded-2xl p-5 flex flex-col items-center justify-center">
          <p className="text-xl font-extrabold text-white">
            {formatCurrency(profileEarnings)}
          </p>
          <p className="text-[11px] tracking-wider text-slate-400 uppercase mt-1.5">
            {t('individualEarningsUpper')}
          </p>
        </div>

        <div className="bg-[#1c2128] border border-slate-800/80 rounded-2xl p-5 flex flex-col items-center justify-center">
          <p className="text-xl font-extrabold text-white">
            {profileSalesCount}
          </p>
          <p className="text-[11px] tracking-wider text-slate-400 uppercase mt-1.5">
            {t('individualSalesUpper')}
          </p>
        </div>
      </div>

      {/* Tarjeta de Ganancias Totales de la Tienda (compartida) */}
      <div className="w-full bg-[#161b24] border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-left">
        <div>
          <p className="text-xs text-slate-400 uppercase font-semibold">
            {t('storeTotalEarningsTitle')}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('sumAllProfilesNote')}
          </p>
        </div>
        <p className="text-xl font-extrabold text-emerald-400">
          {formatCurrency(storeTotalEarnings)}
        </p>
      </div>

      {/* Selector de Idioma dentro de Perfil */}
      <div className="w-full bg-[#161b24] border border-slate-800 rounded-2xl p-4 text-left space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>{t('languageLabel')}</span>
          </div>
          <span className="text-xs text-blue-400 font-bold">
            {currentLangObj.flag} {currentLangObj.name}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => handleSelectLanguage(l.code)}
              className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 border transition ${
                lang === l.code
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-[#0b0e14] border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <span className="uppercase text-[10px]">{l.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Acciones para modificar o eliminar este perfil */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <button
          onClick={(e) => handleOpenEditProfile(activeProfile, e)}
          className="py-3 px-4 rounded-xl bg-[#161b24] hover:bg-[#1f2633] border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          <Edit3 className="w-4 h-4 text-blue-400" />
          <span>{t('editProfileBtn')}</span>
        </button>

        <button
          onClick={(e) => confirmDeleteProfile(activeProfile, e)}
          className="py-3 px-4 rounded-xl bg-[#161b24] hover:bg-red-950/30 border border-slate-800 text-slate-300 hover:text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
          <span>{t('deleteProfileBtn')}</span>
        </button>
      </div>

      {/* Botón Rojo "Cerrar Sesión" fiel a Imagen 7 */}
      <button
        onClick={() => setActiveProfileId(null)}
        className="w-full py-4 rounded-2xl border border-red-600/80 hover:bg-red-600/10 active:scale-[0.99] text-red-500 font-bold text-sm flex items-center justify-center gap-2.5 transition"
      >
        <LogOut className="w-5 h-5" />
        <span>{t('logoutSwitchProfile')}</span>
      </button>
    </div>
  );

  // ==========================================
  // RENDER PRINCIPAL Y CONTENEDOR MÓVIL / APK
  // ==========================================
  return (
    <div className="min-h-screen bg-[#06080c] text-white flex flex-col items-center justify-center font-sans">
      {/* Contenedor adaptable tipo Teléfono Android / APK */}
      <div
        className={`relative w-full bg-[#0b0e14] flex flex-col overflow-hidden transition-all ${
          isFullScreenDesktop
            ? 'min-h-screen max-w-full'
            : 'min-h-screen sm:min-h-[840px] sm:max-h-[92vh] sm:max-w-[430px] sm:rounded-[38px] sm:border-[6px] sm:border-[#1e2430] sm:shadow-2xl'
        }`}
      >
        {/* Barra superior de estado simulada en escritorio */}
        <div className="hidden sm:flex items-center justify-between px-6 py-2 bg-[#0b0e14] text-[11px] text-slate-400 border-b border-slate-900">
          <span>VentaPOS APK</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguageModalOpen(true)}
              className="hover:text-white flex items-center gap-1 text-slate-300"
            >
              <Globe className="w-3 h-3 text-blue-400" />
              <span>
                {currentLangObj.flag} {currentLangObj.name}
              </span>
            </button>
            <button
              onClick={() => setApkModalOpen(true)}
              className="hover:text-white flex items-center gap-1 text-blue-400"
            >
              <Smartphone className="w-3 h-3" /> {t('install')}
            </button>
            <button
              onClick={() => setIsFullScreenDesktop(!isFullScreenDesktop)}
              className="hover:text-white flex items-center gap-1"
              title="Alternar tamaño pantalla"
            >
              {isFullScreenDesktop ? (
                <Minimize2 className="w-3 h-3" />
              ) : (
                <Maximize2 className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {/* Notificación Toast flotante */}
        {toast && (
          <div className="fixed sm:absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
            <div
              className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md ${
                toast.type === 'error'
                  ? 'bg-red-950/90 border-red-500/50 text-red-200'
                  : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              ) : (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Contenido Principal */}
        <div className="flex-1 overflow-y-auto">
          {!activeProfile ? (
            renderProfileSelectorScreen()
          ) : (
            <>
              {activeTab === 'home' && renderHomeTab()}
              {activeTab === 'catalog' && renderCatalogTab()}
              {activeTab === 'cart' && renderCartTab()}
              {activeTab === 'sales' && renderSalesTab()}
              {activeTab === 'profile' && renderProfileTab()}
            </>
          )}
        </div>

        {/* Barra de Navegación Inferior Fija (5 pestañas fieles al prototipo) */}
        {activeProfile && (
          <nav className="sticky bottom-0 left-0 right-0 bg-[#0d1117]/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-2 flex items-center justify-around z-30">
            {[
              { id: 'home', label: t('navHome'), icon: Home },
              { id: 'catalog', label: t('navCatalog'), icon: LayoutGrid },
              {
                id: 'cart',
                label: t('navCart'),
                icon: ShoppingCart,
                badge: cart.length
              },
              { id: 'sales', label: t('navSales'), icon: DollarSign },
              { id: 'profile', label: t('navProfile'), icon: User }
            ].map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
                    isActive
                      ? 'text-[#3b82f6]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="relative">
                    <IconComponent className="w-5 h-5" />
                    {item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 bg-emerald-500 text-black text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium mt-1">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        )}

        {/* ========================================================= */}
        {/* MODAL 1: AÑADIR AL CARRITO (Fiel a las Imágenes 4 y 5)    */}
        {/* ========================================================= */}
        {addToCartModalOpen && (
          <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#12161f] border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
              <h2 className="text-xl font-bold text-white">
                {t('addToCartTitle')}
              </h2>

              {!selectedProductForCart ? (
                /* Paso 1: Escanear Código o Buscar Manualmente (Imagen 4) */
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => {
                      setAddToCartModalOpen(false);
                      setScannerModal({
                        open: true,
                        purpose: 'cart',
                        manualCode: '',
                        cameraError: null
                      });
                    }}
                    className="w-full py-3.5 px-4 rounded-full bg-[#2563eb] hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/30 transition"
                  >
                    <QrCode className="w-5 h-5" />
                    <span>{t('scanCodeBtn')}</span>
                  </button>

                  <p className="text-xs text-slate-400">{t('orSearchManually')}</p>

                  <div className="relative">
                    <input
                      type="text"
                      value={cartSearchQuery}
                      onChange={(e) => setCartSearchQuery(e.target.value)}
                      placeholder={t('nameOrCodePlaceholder')}
                      className="w-full bg-[#0b0e14] border border-slate-700 focus:border-blue-500 rounded-xl pl-4 pr-10 py-3.5 text-sm text-white placeholder-slate-400 outline-none"
                      autoFocus
                    />
                    <Search className="w-5 h-5 text-[#3b82f6] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>

                  {/* Lista desplegable de coincidencias (como Tortillas en Imagen 4) */}
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {filteredCartModalProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectProductToAddToCart(p)}
                        className="w-full bg-[#1c222d] hover:bg-[#252d3b] rounded-xl p-3.5 flex items-center justify-between text-left transition"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {t('codeLabel')}: {p.barcode} • {t('stockLabel')}:{' '}
                            {p.type === 'bulk'
                              ? `${p.stock} ${t('unitKg')}`
                              : `${p.stock} ${t('unitPcs')}`}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">
                          ${p.price}
                          {p.type === 'bulk' ? t('perKg') : t('perPc')}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAddToCartModalOpen(false);
                        setCartSearchQuery('');
                      }}
                      className="text-sm font-semibold text-slate-400 hover:text-white px-3 py-1.5"
                    >
                      {t('cancelBtn')}
                    </button>
                  </div>
                </div>
              ) : (
                /* Paso 2: Ingresar Peso en Kilogramos o Piezas (Imagen 5) */
                <form onSubmit={handleConfirmAddToCart} className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-white">
                      {t('productLabel')}: {selectedProductForCart.name}
                    </p>
                    <p className="text-sm font-semibold text-[#22c55e] mt-1">
                      {t('priceLabel')}: ${Number(selectedProductForCart.price).toFixed(1)}
                      {selectedProductForCart.type === 'bulk' ? t('perKg') : t('perPc')}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t('availableInStore')}:{' '}
                      {selectedProductForCart.type === 'bulk'
                        ? `${selectedProductForCart.stock} ${t('unitKg')}`
                        : `${selectedProductForCart.stock} ${t('piecesWord')}`}
                    </p>
                  </div>

                  {selectedProductForCart.type === 'bulk' ? (
                    <div className="space-y-3">
                      {/* Selector por Kilos o por Pesos */}
                      <div className="grid grid-cols-2 gap-2 bg-[#0b0e14] p-1 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setBulkInputMode('kg')}
                          className={`py-1.5 rounded-lg text-xs font-bold transition ${
                            bulkInputMode === 'kg'
                              ? 'bg-[#2563eb] text-white'
                              : 'text-slate-400'
                          }`}
                        >
                          {t('byKilosBtn')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setBulkInputMode('pesos')}
                          className={`py-1.5 rounded-lg text-xs font-bold transition ${
                            bulkInputMode === 'pesos'
                              ? 'bg-[#2563eb] text-white'
                              : 'text-slate-400'
                          }`}
                        >
                          {t('byAmountBtn')}
                        </button>
                      </div>

                      {bulkInputMode === 'kg' ? (
                        <div className="relative pt-2">
                          <label className="absolute top-0 left-3 bg-[#12161f] px-1.5 text-[11px] text-slate-300">
                            {t('weightInKgLabel')}
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            min="0.01"
                            value={quantityInput}
                            onChange={(e) => setQuantityInput(e.target.value)}
                            className="w-full bg-transparent border border-slate-600 focus:border-blue-500 rounded-xl px-4 py-3.5 text-base text-white outline-none"
                            autoFocus
                          />
                          {/* Botones rápidos de peso */}
                          <div className="flex gap-2 mt-2">
                            {['0.25', '0.5', '1.0', '2.0'].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setQuantityInput(preset)}
                                className="flex-1 py-1.5 bg-[#1c222d] hover:bg-slate-700 rounded-lg text-xs text-slate-200 font-semibold"
                              >
                                {preset} {t('unitKg')}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="relative pt-2">
                          <label className="absolute top-0 left-3 bg-[#12161f] px-1.5 text-[11px] text-slate-300">
                            {t('requestedAmountLabel')}
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="1"
                            value={pesosInput}
                            onChange={(e) => setPesosInput(e.target.value)}
                            placeholder={`${t('exampleShort')} 15.00`}
                            className="w-full bg-transparent border border-slate-600 focus:border-blue-500 rounded-xl px-4 py-3.5 text-base text-white outline-none"
                            autoFocus
                          />
                          {pesosInput > 0 && (
                            <p className="text-xs text-emerald-400 mt-1.5">
                              {t('equivalentTo')}{' '}
                              <strong>
                                {(
                                  parseFloat(pesosInput) /
                                  selectedProductForCart.price
                                ).toFixed(3)}{' '}
                                {t('unitKg')}
                              </strong>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Producto por pieza */
                    <div className="relative pt-2">
                      <label className="absolute top-0 left-3 bg-[#12161f] px-1.5 text-[11px] text-slate-300">
                        {t('piecesQuantityLabel')}
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        max={selectedProductForCart.stock}
                        value={quantityInput}
                        onChange={(e) => setQuantityInput(e.target.value)}
                        className="w-full bg-transparent border border-slate-600 focus:border-blue-500 rounded-xl px-4 py-3.5 text-base text-white outline-none"
                        autoFocus
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-5 pt-3">
                    <button
                      type="button"
                      onClick={() => setSelectedProductForCart(null)}
                      className="text-sm font-semibold text-slate-400 hover:text-white"
                    >
                      {t('cancelBtn')}
                    </button>
                    <button
                      type="submit"
                      className="text-sm font-bold text-[#3b82f6] hover:text-blue-400"
                    >
                      {t('addBtn')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: CREAR / MODIFICAR OBJETO DEL INVENTARIO          */}
        {/* ========================================================= */}
        {productModal.open && (
          <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#12161f] border border-slate-800 rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  {productModal.mode === 'create'
                    ? t('newInventoryItemTitle')
                    : t('editInventoryItemTitle')}
                </h2>
                <button
                  onClick={() =>
                    setProductModal((prev) => ({ ...prev, open: false }))
                  }
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                {/* Selector A Granel vs Por Pieza */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-semibold">
                    {t('saleTypeLabel')}
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        setProductModal((prev) => ({ ...prev, type: 'bulk' }))
                      }
                      className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1 ${
                        productModal.type === 'bulk'
                          ? 'bg-blue-600/15 border-[#2563eb] text-white'
                          : 'bg-[#161b24] border-slate-800 text-slate-400'
                      }`}
                    >
                      <Scale className="w-5 h-5 text-blue-400" />
                      <span className="text-xs font-bold">{t('bulkTypeTitle')}</span>
                      <span className="text-[10px] text-slate-400">
                        {t('bulkTypeDesc')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setProductModal((prev) => ({ ...prev, type: 'piece' }))
                      }
                      className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1 ${
                        productModal.type === 'piece'
                          ? 'bg-blue-600/15 border-[#2563eb] text-white'
                          : 'bg-[#161b24] border-slate-800 text-slate-400'
                      }`}
                    >
                      <Package className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-bold">{t('pieceTypeTitle')}</span>
                      <span className="text-[10px] text-slate-400">
                        {t('pieceTypeDesc')}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Nombre del producto */}
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    {t('itemNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={productModal.name}
                    onChange={(e) =>
                      setProductModal((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder={t('itemNamePlaceholder')}
                    className="w-full bg-[#0b0e14] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                    required
                  />
                </div>

                {/* Código de barras con opción de cámara o manual */}
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    {t('barcodeFieldLabel')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={productModal.barcode}
                      onChange={(e) =>
                        setProductModal((prev) => ({
                          ...prev,
                          barcode: e.target.value
                        }))
                      }
                      placeholder={t('barcodePlaceholder')}
                      className="flex-1 bg-[#0b0e14] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setScannerModal({
                          open: true,
                          purpose: 'productForm',
                          manualCode: '',
                          cameraError: null
                        })
                      }
                      className="px-3 bg-blue-600/20 border border-blue-500/40 text-blue-400 rounded-xl hover:bg-blue-600/30 transition"
                      title={t('scanCodeBtn')}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={generateRandomBarcode}
                      className="px-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 text-xs font-semibold transition"
                    >
                      {t('autoBtn')}
                    </button>
                  </div>
                </div>

                {/* Precio (por kilo o por pieza según elección) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-emerald-400 font-semibold mb-1">
                      {productModal.type === 'bulk'
                        ? t('pricePerKgLabel')
                        : t('pricePerPcLabel')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      value={productModal.price}
                      onChange={(e) =>
                        setProductModal((prev) => ({
                          ...prev,
                          price: e.target.value
                        }))
                      }
                      placeholder={
                        productModal.type === 'bulk' ? '25.00' : '18.00'
                      }
                      className="w-full bg-[#0b0e14] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      {productModal.type === 'bulk'
                        ? t('kilosInInventoryLabel')
                        : t('piecesInInventoryLabel')}
                    </label>
                    <input
                      type="number"
                      step={productModal.type === 'bulk' ? '0.001' : '1'}
                      min="0"
                      value={productModal.stock}
                      onChange={(e) =>
                        setProductModal((prev) => ({
                          ...prev,
                          stock: e.target.value
                        }))
                      }
                      placeholder={productModal.type === 'bulk' ? '20.5' : '15'}
                      className="w-full bg-[#0b0e14] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setProductModal((prev) => ({ ...prev, open: false }))
                    }
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    {t('cancelBtn')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30"
                  >
                    {productModal.mode === 'create'
                      ? t('saveInInventoryBtn')
                      : t('saveChangesBtn')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 3: LECTOR DE CÓDIGO DE BARRAS CON CÁMARA            */}
        {/* ========================================================= */}
        {scannerModal.open && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#12161f] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-white text-base">
                    {t('barcodeScannerTitle')}
                  </h3>
                </div>
                <button
                  onClick={closeScanner}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Visor de cámara en vivo */}
              <div className="relative w-full h-48 bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {/* Guía láser de escaneo */}
                <div className="absolute inset-6 border-2 border-blue-500/60 rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="w-full h-0.5 bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                </div>
              </div>

              {scannerModal.cameraError && (
                <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5">
                  {scannerModal.cameraError}
                </p>
              )}

              {/* Entrada de código o toque rápido para pruebas */}
              <div className="space-y-2">
                <p className="text-xs text-slate-400">
                  {t('simulateScanPrompt')}
                </p>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleBarcodeDetected(p.barcode)}
                      className="w-full bg-[#191f2c] hover:bg-[#232b3d] rounded-xl px-3 py-2 flex items-center justify-between text-xs transition"
                    >
                      <span className="font-semibold text-white">{p.name}</span>
                      <span className="text-blue-400 font-mono">
                        EAN: {p.barcode}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 4: CONFIRMAR COBRO DE CANASTA Y CAMBIO              */}
        {/* ========================================================= */}
        {checkoutModal.open && (
          <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#12161f] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-xl font-extrabold text-white">
                {t('confirmChargeTitle')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('confirmChargeDesc', { name: activeProfile?.name || '' })}
              </p>

              <div className="bg-[#0b0e14] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-sm text-slate-300">
                  {t('totalToChargeLabel')}
                </span>
                <span className="text-2xl font-extrabold text-[#22c55e]">
                  {formatCurrency(cartTotal)}
                </span>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {t('cashReceivedLabel')}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={checkoutModal.cashReceived}
                  onChange={(e) =>
                    setCheckoutModal({
                      ...checkoutModal,
                      cashReceived: e.target.value
                    })
                  }
                  placeholder={`${t('exampleShort')} ${Math.ceil(cartTotal / 10) * 10}`}
                  className="w-full bg-[#0b0e14] border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                />
                {parseFloat(checkoutModal.cashReceived) >= cartTotal && (
                  <p className="text-xs text-emerald-400 font-bold mt-2">
                    {t('changeToReturn')}{' '}
                    {formatCurrency(
                      parseFloat(checkoutModal.cashReceived) - cartTotal
                    )}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setCheckoutModal({ open: false, cashReceived: '' })
                  }
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  {t('backBtn')}
                </button>
                <button
                  type="button"
                  onClick={handleCompleteSale}
                  className="flex-1 py-3 rounded-xl bg-[#229954] hover:bg-[#1e8449] text-white text-xs font-bold shadow-lg shadow-emerald-900/40"
                >
                  {t('confirmAndChargeBtn')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 5: CREAR / EDITAR PERFIL                            */}
        {/* ========================================================= */}
        {profileModal.open && (
          <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleSaveProfile}
              className="w-full max-w-sm bg-[#12161f] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white">
                {profileModal.mode === 'create'
                  ? t('createNewProfile')
                  : t('editProfileBtn')}
              </h3>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  {t('profileNameLabel')}
                </label>
                <input
                  type="text"
                  value={profileModal.name}
                  onChange={(e) =>
                    setProfileModal({ ...profileModal, name: e.target.value })
                  }
                  placeholder={t('profileNamePlaceholder')}
                  className="w-full bg-[#0b0e14] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-2">
                  {t('avatarColorLabel')}
                </label>
                <div className="flex gap-2.5">
                  {PROFILE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        setProfileModal({ ...profileModal, color: c })
                      }
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                        profileModal.color === c
                          ? 'ring-2 ring-white scale-110'
                          : 'opacity-75'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {profileModal.color === c && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() =>
                    setProfileModal({ ...profileModal, open: false })
                  }
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {t('cancelBtn')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-500 text-white text-xs font-bold"
                >
                  {t('saveProfileBtn')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 6: CONFIRMACIÓN DE ELIMINACIÓN (SIN ALERT NATIVO)   */}
        {/* ========================================================= */}
        {deleteConfirmModal.open && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#12161f] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {deleteConfirmModal.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {deleteConfirmModal.description}
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() =>
                    setDeleteConfirmModal({
                      open: false,
                      type: null,
                      targetId: null,
                      title: '',
                      description: ''
                    })
                  }
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  {t('cancelBtn')}
                </button>
                <button
                  onClick={handleExecuteDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                >
                  {t('yesDeleteBtn')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 7: ALERTAS DE BAJO INVENTARIO (CAMPANA)             */}
        {/* ========================================================= */}
        {lowStockModalOpen && (
          <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#12161f] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>{t('inventoryStatusTitle')}</span>
                </h3>
                <button
                  onClick={() => setLowStockModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-slate-300 py-4 text-center">
                  {t('allStockGood')}
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {lowStockProducts.map((p) => (
                    <div
                      key={p.id}
                      className="bg-[#181e29] border border-amber-500/30 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{p.name}</p>
                        <p className="text-[11px] text-amber-300">
                          {t('remainingLabel')}: {p.stock}{' '}
                          {p.type === 'bulk' ? t('unitKg') : t('unitPcs')}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setLowStockModalOpen(false);
                          handleOpenEditProduct(p);
                        }}
                        className="text-xs bg-blue-600/20 text-blue-400 px-2.5 py-1 rounded-lg font-semibold"
                      >
                        {t('restockBtn')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 8: GUÍA RÁPIDA PARA INSTALAR EN ANDROID / APK       */}
        {/* ========================================================= */}
        {apkModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#12161f] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-400">
                  <Smartphone className="w-5 h-5" />
                  <h3 className="font-bold text-white text-base">
                    {t('apkModalTitle')}
                  </h3>
                </div>
                <button
                  onClick={() => setApkModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
                <p>{t('apkModalIntro')}</p>
                <div className="bg-[#0b0e14] p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <p className="font-bold text-white">{t('apkOption1Title')}</p>
                  <p className="text-slate-400">{t('apkOption1Desc')}</p>
                </div>
                <div className="bg-[#0b0e14] p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <p className="font-bold text-white">{t('apkOption2Title')}</p>
                  <p className="text-slate-400">{t('apkOption2Desc')}</p>
                </div>
              </div>

              <button
                onClick={() => setApkModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#2563eb] text-white text-xs font-bold"
              >
                {t('understoodBtn')}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 9: SELECTOR DE IDIOMA MULTILENGUAJE                 */}
        {/* ========================================================= */}
        {languageModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#12161f] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-400">
                  <Globe className="w-5 h-5" />
                  <h3 className="font-bold text-white text-base">
                    {t('selectLanguageTitle')}
                  </h3>
                </div>
                <button
                  onClick={() => setLanguageModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {LANGUAGES.map((l) => {
                  const isSelected = lang === l.code;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => handleSelectLanguage(l.code)}
                      className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-blue-600/15 border-[#2563eb] text-white'
                          : 'bg-[#161b24] border-slate-800/80 text-slate-300 hover:bg-[#1c222d]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{l.flag}</span>
                        <div className="text-left">
                          <p className="text-sm font-bold text-white">{l.name}</p>
                          <p className="text-[10px] uppercase text-slate-400">
                            {l.code}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#2563eb] flex items-center justify-center text-white">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}