import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Language = "en" | "rw";

export type TranslationKeys =
  | "dashboard"
  | "inventory"
  | "sales"
  | "services"
  | "expenses"
  | "debts"
  | "reports"
  | "notes"
  | "notesDescription"
  | "notesPlaceholder"
  | "addNote"
  | "savedNotes"
  | "noNotesYet"
  | "deleteNote"
  | "welcomeBack"
  | "signedInAs"
  | "staff"
  | "toggleTheme"
  | "alerts"
  | "logout"
  | "language"
  | "todaysOverview"
  | "loadingData"
  | "servicesRevenue"
  | "productsRevenue"
  | "totalRevenueToday"
  | "fromServicesToday"
  | "fromProductsToday"
  | "servicesProductsCombined"
  | "productsSoldToday"
  | "stockStatus"
  | "weekPerformanceTrend"
  | "last7Days"
  | "itemsLow"
  | "loading"
  | "serviceRevenueThisMonth"
  | "allPastDatesCurrentMonth"
  | "monthToDate"
  | "signIn"
  | "signingIn"
  | "email"
  | "password"
  | "accessDashboard"
  | "useCredentials"
  | "searchPlaceholder"
  | "clearSearch"
  | "closeForm"
  | "noProductsYet"
  | "noProductsMatchSearch"
  | "noImage"
  | "uploadProductPhoto"
  | "newCategoryNamePlaceholder"
  | "editProductDescription"
  | "editProduct"
  | "deleteProduct"
  | "uncategorized"
  | "addProduct"
  | "saveProduct"
  | "savingProduct"
  | "stockRefill"
  | "refillStock"
  | "refillDescription"
  | "refillProduct"
  | "refillAmount"
  | "currentStock"
  | "validRefillAmount"
  | "productNotFound"
  | "failedRefillStock"
  | "requiredProductFields"
  | "failedLoadProducts"
  | "failedProcessImage"
  | "failedUpdateProduct"
  | "failedCreateProduct"
  | "confirmDelete"
  | "failedDelete"
  | "failedUpdate"
  | "editDebt"
  | "editExpense"
  | "editSale"
  | "editService"
  | "save"
  | "noPermission"
  | "businessSummary"
  | "businessSummaryDescription"
  | "monthlyPerformance"
  | "monthlyPerformanceDescription"
  | "ownerDecisionMetrics"
  | "ownerDecisionDescription"
  | "ownerDecisionRestricted"
  | "cashVsMomo"
  | "confirmDeleteProduct"
  | "failedDeleteProduct"
  | "productName"
  | "barcode"
  | "productCategory"
  | "stockQuantity"
  | "reorderPoint"
  | "buyPrice"
  | "sellPrice"
  | "imageUrl"
  | "description"
  | "inventoryDescription"
  | "newSale"
  | "customerName"
  | "customerPhone"
  | "taxFees"
  | "totalDueIncludingTax"
  | "product"
  | "quantity"
  | "unitPrice"
  | "remove"
  | "saveSale"
  | "savingSale"
  | "pleaseAddAtLeastOneProduct"
  | "failedRecordSale"
  | "paymentMethod"
  | "paymentMethodCash"
  | "paymentMethodMomo"
  | "profile"
  | "salesTableSaleId"
  | "salesTableCustomer"
  | "salesTableWorker"
  | "salesTableTotal"
  | "salesTableProfit"
  | "salesTableDate"
  | "recordService"
  | "serviceType"
  | "other"
  | "serviceDetailsPlaceholder"
  | "saveService"
  | "savingService"
  | "validServiceAmount"
  | "otherServiceTypeName"
  | "failedSaveService"
  | "serviceTableService"
  | "serviceTableAmount"
  | "serviceTablePayment"
  | "serviceTableWorker"
  | "serviceTableDate"
  | "trackExpenses"
  | "recordExpense"
  | "saveExpense"
  | "savingExpense"
  | "validExpenseAmount"
  | "failedSaveExpense"
  | "validPaymentAmount"
  | "failedRecordPayment"
  | "recordPayment"
  | "savePayment"
  | "note"
  | "existingPayments"
  | "noPayments"
  | "amountPaid"
  | "fullPaymentPlaceholder"
  | "expenseTableCategory"
  | "expenseTableAmount"
  | "expenseTableRecordedBy"
  | "expenseTableDate"
  | "trackDebts"
  | "newDebtRecord"
  | "amountOwed"
  | "dueDate"
  | "saveDebt"
  | "savingDebt"
  | "validCustomerDetails"
  | "failedRecordDebt"
  | "debtTableCustomer"
  | "debtTableTotalOwed"
  | "debtTableRemaining"
  | "debtTableStatus"
  | "exportPDF"
  | "exportExcel"
  | "export"
  | "exportOptions"
  | "daily"
  | "monthly"
  | "selectDate"
  | "selectMonth"
  | "dailyPerformanceDetails"
  | "selectDailyReportDate"
  | "itemsSoldCount"
  | "lowStockCount"
  | "detailedForOwner"
  | "cancel"
  | "monthBreakdown"
  | "monthTotal"
  | "detailedServiceList"
  | "service"
  | "date"
  | "reportsDescription"
  | "dailyRevenue"
  | "monthlyRevenue"
  | "netProfit"
  | "stockValue"
  | "valueOfInventory"
  | "mobileMoneyBreakdown"
  | "metric"
  | "value"
  | "servicesPageDescription"
  | "newServiceTypePlaceholder"
  | "expenseDescriptionPlaceholder"
  | "amount"
  | "walkIn"
  | "addTodo"
  | "noteTitle"
  | "noteTitlePlaceholder"
  | "noteContent"
  | "noteDate"
  | "todoItems"
  | "todoPlaceholder"
  | "markComplete"
  | "untitledNote"
  | "todaySalesPerformance"
  | "currentMonthPerformance"
  | "revenueAfterExpenses"
  | "totalExpenses"
  | "debtBalance"
  | "serviceIncome"
  | "saleRevenue"
  | "saleProfit"
  | "serviceRevenue"
  | "totalMonthlyRevenue"
  | "monthlyExpenses"
  | "totalCashReceived"
  | "totalMomoReceived"
  | "totalDebtPayments"
  | "outstandingDebt"
  | "cashVsMomo";

type TranslationValues = Record<TranslationKeys, string>;

const translations: Record<Language, TranslationValues> = {
  en: {
    dashboard: "Dashboard",
    inventory: "Inventory",
    sales: "Sales",
    services: "Services",
    expenses: "Expenses",
    debts: "Debts",
    reports: "Reports",
    notes: "Notes",
    notesDescription: "Write quick reminders and save them locally for your next visit.",
    notesPlaceholder: "Type your note here...",
    addNote: "Add Note",
    addTodo: "Add Todo",
    savedNotes: "Saved notes",
    noNotesYet: "No notes yet. Write your first reminder.",
    deleteNote: "Delete",
    welcomeBack: "Welcome back, {name}",
    signedInAs: "Signed in as",
    staff: "Staff",
    toggleTheme: "Toggle theme",
    alerts: "Alerts",
    logout: "Logout",
    language: "Language",
    todaysOverview: "Today's Overview",
    loadingData: "Loading today's data...",
    servicesRevenue: "Services Revenue",
    productsRevenue: "Products Revenue",
    totalRevenueToday: "Total Revenue Today",
    fromServicesToday: "From services delivered today",
    fromProductsToday: "From product sales today",
    servicesProductsCombined: "Services + Products combined",
    productsSoldToday: "Products Sold Today",
    stockStatus: "Stock Status",
    itemsLow: "{count} items low",
    weekPerformanceTrend: "Week Performance Trend",
    last7Days: "Last 7 days revenue comparison",
    loading: "Loading...",
    signIn: "Sign In",
    signingIn: "Signing in...",
    email: "Email",
    password: "Password",
    accessDashboard: "Access your business dashboard and manage inventory, sales, and services.",
    useCredentials: "Use owner@sdtech.com / Admin123!",
    searchPlaceholder: "Search by name, barcode, description or category...",
    clearSearch: "Clear search",
    closeForm: "Close Form",
    noProductsYet: "No products yet. Add your first product!",
    noProductsMatchSearch: "No products match your search.",
    noImage: "No image",
    uploadProductPhoto: "Upload a product photo from your device.",
    newCategoryNamePlaceholder: "New category name",
    editProductDescription: "Update product details and save your changes.",
    editProduct: "Edit product",
    deleteProduct: "Delete product",
    uncategorized: "Uncategorized",
    addProduct: "Add Product",
    saveProduct: "Save Product",
    savingProduct: "Saving product...",
    stockRefill: "Stock Refill",
    refillStock: "Refill Stock",
    refillDescription: "Add new bought items to existing stock quantities.",
    refillProduct: "Product",
    refillAmount: "Refill Amount",
    currentStock: "Current Stock",
    validRefillAmount: "Please enter a valid refill amount.",
    productNotFound: "Selected product could not be found.",
    failedRefillStock: "Failed to refill stock.",
    requiredProductFields: "Please complete the required product fields.",
    failedLoadProducts: "Failed to load products and categories. Please refresh.",
    failedProcessImage: "Failed to process image",
    failedUpdateProduct: "Failed to update product.",
    failedCreateProduct: "Failed to create product.",
    confirmDelete: "Are you sure you want to delete this item?",
    failedDelete: "Failed to delete.",
    failedUpdate: "Failed to update.",
    editDebt: "Edit Debt",
    editExpense: "Edit Expense",
    editSale: "Edit Sale",
    editService: "Edit Service",
    save: "Save",
    noPermission: "You do not have permission to perform this action.",
    businessSummary: "Business Summary",
    businessSummaryDescription: "High-level revenue, profit and expense figures for the business.",
    monthlyPerformance: "Monthly Performance",
    monthlyPerformanceDescription: "Owner-level totals for cash, MOMO, profit and monthly revenue.",
    ownerDecisionMetrics: "Owner Decision Metrics",
    ownerDecisionDescription: "Monthly revenue, profit and cash-versus-MOMO details for owner review.",
    ownerDecisionRestricted: "Owner-only decision metrics are visible to the business owner.",
    cashVsMomo: "Cash vs MOMO",
    confirmDeleteProduct: "Are you sure you want to delete \"{name}\"?",
    failedDeleteProduct: "Failed to delete product.",
    productName: "Product Name",
    barcode: "Barcode",
    productCategory: "Category",
    stockQuantity: "Stock Quantity",
    reorderPoint: "Reorder Point",
    buyPrice: "Buy Price",
    sellPrice: "Sell Price",
    imageUrl: "Image URL",
    description: "Description",
    inventoryDescription: "Manage products, stock, pricing, and categories.",
    newSale: "New Sale",
    customerName: "Customer Name",
    customerPhone: "Customer Phone",
    taxFees: "Tax / Fees",
    totalDueIncludingTax: "Total due including tax.",
    product: "Product",
    quantity: "Quantity",
    unitPrice: "Unit Price",
    remove: "Remove",
    saveSale: "Save Sale",
    savingSale: "Saving sale...",
    pleaseAddAtLeastOneProduct: "Please add at least one product to the sale.",
    failedRecordSale: "Failed to record sale.",
    paymentMethod: "Payment Method",
    paymentMethodCash: "Cash",
    paymentMethodMomo: "MOMO",
    profile: "Profile",
    salesTableSaleId: "Sale ID",
    salesTableCustomer: "Customer",
    salesTableWorker: "Worker",
    salesTableTotal: "Total",
    salesTableProfit: "Profit",
    salesTableDate: "Date",
    recordService: "Record Service",
    serviceType: "Service Type",
    other: "Other",
    serviceDetailsPlaceholder: "Service details, customer notes...",
    servicesPageDescription: "Track and manage service revenue, customer orders and team performance.",
    newServiceTypePlaceholder: "Enter other service type",
    saveService: "Save Service",
    savingService: "Saving...",
    validServiceAmount: "Please enter a valid service amount.",
    otherServiceTypeName: "Please enter the other service type name.",
    failedSaveService: "Failed to save service.",
    serviceTableService: "Service",
    serviceTableAmount: "Amount",
    serviceTablePayment: "Payment",
    serviceTableWorker: "Worker",
    serviceTableDate: "Date",
    trackExpenses: "Track shop operating costs and recurring bills.",
    recordExpense: "Record Expense",
    saveExpense: "Save Expense",
    savingExpense: "Saving...",
    validExpenseAmount: "Please enter a valid expense amount.",
    expenseDescriptionPlaceholder: "Add a short description for this expense.",
    failedSaveExpense: "Failed to save expense.",
    expenseTableCategory: "Category",
    expenseTableAmount: "Amount",
    expenseTableRecordedBy: "Recorded By",
    expenseTableDate: "Date",
    trackDebts: "Track amounts owed, payments, and customer balances.",
    newDebtRecord: "New Debt Record",
    amountOwed: "Amount Owed",
    dueDate: "Due Date",
    saveDebt: "Save Debt",
    savingDebt: "Saving...",
    validCustomerDetails: "Please enter valid customer details and owed amount.",
    failedRecordDebt: "Failed to record debt.",
    validPaymentAmount: "Please enter a valid payment amount.",
    failedRecordPayment: "Failed to record payment.",
    recordPayment: "Record Payment",
    savePayment: "Save Payment",
    note: "Note",
    existingPayments: "Existing Payments",
    noPayments: "No payments yet.",
    amountPaid: "Amount Paid",
    fullPaymentPlaceholder: "Leave blank for full payment",
    debtTableCustomer: "Customer",
    debtTableTotalOwed: "Total Owed",
    debtTableRemaining: "Remaining",
    debtTableStatus: "Status",
    amount: "Amount",
    walkIn: "Walk-in",
    noteTitle: "Note Title",
    noteTitlePlaceholder: "Give your note a title...",
    noteContent: "Note Content",
    noteDate: "Created",
    todoItems: "Todo Items",
    todoPlaceholder: "Add a todo item...",
    markComplete: "Mark complete",
    untitledNote: "Untitled note",
    exportPDF: "Export PDF",
    exportExcel: "Export Excel",
    reportsDescription: "Generate profit, sales, inventory and expense reports.",
    dailyRevenue: "Daily Revenue",
    monthlyRevenue: "Monthly Revenue",
    netProfit: "Net Profit",
    stockValue: "Stock Value",
    valueOfInventory: "Value of inventory across categories.",
    mobileMoneyBreakdown: "Mobile Money Breakdown",
    todaySalesPerformance: "Today's sales performance.",
    currentMonthPerformance: "Performance for the current month.",
    serviceRevenueThisMonth: "Services Revenue This Month",
    allPastDatesCurrentMonth: "All service revenues by past dates of this month",
    monthToDate: "Month-to-date",
    export: "Export",
    exportOptions: "Export options",
    daily: "Daily",
    monthly: "Monthly",
    selectDate: "Select date",
    selectMonth: "Select month",
    dailyPerformanceDetails: "Daily Performance Details",
    selectDailyReportDate: "Choose a date to view daily performance",
    itemsSoldCount: "Items sold",
    lowStockCount: "Low stock items",
    detailedForOwner: "Include detailed data (owner only)",
    cancel: "Cancel",
    monthBreakdown: "Month breakdown",
    monthTotal: "Month total",
    detailedServiceList: "Detailed service list",
    service: "Service",
    date: "Date",
    revenueAfterExpenses: "Revenue after expenses.",
    totalExpenses: "Total Expenses",
    debtBalance: "Debt Balance",
    serviceIncome: "Service Income",
    saleRevenue: "Sales received",
    saleProfit: "Sales profit",
    serviceRevenue: "Service revenue",
    totalMonthlyRevenue: "Total monthly revenue",
    monthlyExpenses: "Monthly expenses",
    totalCashReceived: "Total cash received",
    totalMomoReceived: "Total MOMO received",
    totalDebtPayments: "Total debt payments",
    outstandingDebt: "Outstanding debt",
    metric: "Metric",
    value: "Value",
  },
  rw: {
    dashboard: "Ahabanza",
    inventory: "Ububiko",
    sales: "Kugurisha",
    services: "Serivisi",
    expenses: "Imikoreshereze",
    debts: "Ubukode",
    reports: "Raporo",
    notes: "Inyandiko",
    notesDescription: "Andika inyandiko z'ibibutsa ubike aho mu bwirinzi bwa mudasobwa.",
    notesPlaceholder: "Andika igihe n'icyibutsa cyawe hano...",
    addNote: "Ongeraho inyandiko",
    addTodo: "Ongeraho todo",
    savedNotes: "Inyandiko zibitswe",
    noNotesYet: "Nta nyandiko zibitswe. Andika icyibutsa cya mbere.",
    deleteNote: "Siba",
    welcomeBack: "Turakwakira, {name}",
    signedInAs: "Yinjiye nka",
    staff: "Umukozi",
    toggleTheme: "Hindura uburyo",
    alerts: "Amakuru",
    logout: "Sohoka",
    language: "Ururimi",
    todaysOverview: "Iby'uyu munsi",
    loadingData: "Birimo gufungura amakuru y'uyu munsi...",
    servicesRevenue: "Inyungu za serivisi",
    productsRevenue: "Inyungu z'ibicuruzwa",
    totalRevenueToday: "Inyungu y'uyu munsi",
    fromServicesToday: "Ku serivisi zagezweho uyu munsi",
    fromProductsToday: "Ku bicuruzwa byagurishijwe uyu munsi",
    servicesProductsCombined: "Serivisi + Ibicuruzwa hamwe",
    productsSoldToday: "Ibicuruzwa byagurishijwe uyu munsi",
    stockStatus: "Imiterere y'ububiko",
    itemsLow: "Ibintu {count} bike",
    weekPerformanceTrend: "Imiterere y'icyumweru",
    last7Days: "Ugereranyo ry'inyungu z'iminsi 7 ishize",
    loading: "Birimo...",
    signIn: "Injira",
    signingIn: "Kwinjira...",
    email: "Imeili",
    password: "Ijambo ry'ibanga",
    accessDashboard: "Fungura dashboard y'umuryango wawe kandi ucunge ububiko, kugurisha, n'amasomo.",
    useCredentials: "Koresha owner@sdtech.com / Admin123!",
    searchPlaceholder: "Shakisha ku izina, barcode, ibisobanuro cyangwa icyiciro...",
    clearSearch: "Siba ubushakashatsi",
    closeForm: "Funga ifishi",
    noProductsYet: "Nta bicuruzwa biri hano. Ongeramo igicuruzwa cya mbere!",
    noProductsMatchSearch: "Nta bicuruzwa bihura n'ubushakashatsi bwawe.",
    noImage: "Nta shusho",
    uploadProductPhoto: "Ohereza ifoto y'igicuruzwa ivuye kuri mudasobwa yawe.",
    newCategoryNamePlaceholder: "Izina ry'icyiciro gishya",
    editProductDescription: "Hindura ibisobanuro by'igicuruzwa unabitse impinduka.",
    editProduct: "Hindura igicuruzwa",
    deleteProduct: "Siba igicuruzwa",
    uncategorized: "Nta cyiciro",
    addProduct: "Ongeramo igicuruzwa",
    saveProduct: "Bika igicuruzwa",
    savingProduct: "Birimo kubika igicuruzwa...",
    stockRefill: "Ongeramo ububiko",
    refillStock: "Suzuma ububiko",
    refillDescription: "Ongeramo ibicuruzwa byaguzwe ku mubare usanzwe ububiko bufite.",
    refillProduct: "Igicuruzwa",
    refillAmount: "Umubare w'inyongera",
    currentStock: "Umubare uhari",
    validRefillAmount: "Nyamuneka shyiramo umubare w'inyongera wemewe.",
    productNotFound: "Igicuruzwa wahisemo nticyabonetse.",
    failedRefillStock: "Ntibyashoboye kongera ububiko.",
    requiredProductFields: "Nyamuneka wuzuze ibice byose bisabwa by'igicuruzwa.",
    failedLoadProducts: "Ntibyakunze gupakira ibicuruzwa n'ibice. Ohereza urupapuro.",
    failedProcessImage: "Ntibyashoboye gutunganya ishusho",
    failedUpdateProduct: "Ntibyashoboye kuvugurura igicuruzwa.",
    failedCreateProduct: "Ntibyashoboye gushyiraho igicuruzwa.",
    confirmDelete: "Wizeye ko ushaka gusiba iki?",
    failedDelete: "Byanze gusiba.",
    failedUpdate: "Byanze kuvugurura.",
    editDebt: "Hindura umwenda",
    editExpense: "Hindura ikiguzi",
    editSale: "Hindura kugurisha",
    editService: "Hindura serivisi",
    save: "Bika",
    noPermission: "Nta burenganzira bwo gukora iki gikorwa ufite.",
    businessSummary: "Icyegeranyo cy'Ubucuruzi",
    businessSummaryDescription: "Amasoko y'ingenzi y'inyungu, igishoro n'imikoreshereze y'ubucuruzi.",
    monthlyPerformance: "Imikorere y'Ukwezi",
    monthlyPerformanceDescription: "Amafaranga y'ukwezi, inyungu n'uburyo bwo kwakira amafaranga kuri nyir'ububiko.",
    ownerDecisionMetrics: "Ibipimo by'Icyemezo cy'Nyir'Ubucuruzi",
    ownerDecisionDescription: "Amafaranga y'ukwezi, inyungu n'isano hagati ya cash na MOMO ku nyir'ububiko.",
    ownerDecisionRestricted: "Ibipimo by'icyemezo by'inyir'ububiko bibonwa gusa na nyir'ububiko.",
    cashVsMomo: "Cash vs MOMO",
    confirmDeleteProduct: "Wemeza ko ushaka gusiba \"{name}\"?",
    failedDeleteProduct: "Ntibyashoboye gusiba igicuruzwa.",
    productName: "Izina ry'igicuruzwa",
    barcode: "Barcode",
    productCategory: "Icyiciro",
    stockQuantity: "Umubare uhari",
    reorderPoint: "Urwego rwo gusubiramo",
    buyPrice: "Igiciro cyo kugura",
    sellPrice: "Igiciro cyo kugurisha",
    imageUrl: "URL y'ishusho",
    description: "Ibisobanuro",
    inventoryDescription: "Genzura ibicuruzwa, ububiko, ibiciro, n'ibyiciro.",
    newSale: "Igurisha rishya",
    customerName: "Izina ry'umukiriya",
    customerPhone: "Telefone y'umukiriya",
    taxFees: "Imisoro / Amafaranga",
    totalDueIncludingTax: "Igiteranyo cyishyurwa harimo imisoro.",
    product: "Igicuruzwa",
    quantity: "Umubare",
    unitPrice: "Igiciro kimwe",
    remove: "Kuraho",
    saveSale: "Bika igurisha",
    savingSale: "Birimo kubika igurisha...",
    pleaseAddAtLeastOneProduct: "Nyamuneka ongeramo nibura igicuruzwa kimwe mu igurisha.",
    failedRecordSale: "Ntibyashoboye kwandika igurisha.",
    paymentMethod: "Uburyo bwo kwishyura",
    paymentMethodCash: "Aya mafaranga",
    paymentMethodMomo: "MOMO",
    profile: "Umwirondoro",
    salesTableSaleId: "ID y'igurisha",
    salesTableCustomer: "Umukiriya",
    salesTableWorker: "Umukozi",
    salesTableTotal: "Igiteranyo",
    salesTableProfit: "Inyungu",
    salesTableDate: "Italiki",
    recordService: "Andika serivisi",
    serviceType: "Ubwoko bwa serivisi",
    other: "Icyindi",
    serviceDetailsPlaceholder: "Ibisobanuro bya serivisi, inyandiko z'umukiriya...",
    servicesPageDescription: "Genzura inyungu za serivisi, gutumizwa kw'abakiriya n'imikorere y'itsinda.",
    newServiceTypePlaceholder: "Shyiramo izindi serivisi...",
    saveService: "Bika serivisi",
    savingService: "Birimo kubika...",
    validServiceAmount: "Nyamuneka shyiramo igiciro cya serivisi cyemewe.",
    otherServiceTypeName: "Nyamuneka shyiramo izina ry'icyiciro cya serivisi cy'undi.",
    failedSaveService: "Ntibyashoboye kubika serivisi.",
    serviceTableService: "Serivisi",
    serviceTableAmount: "Igiciro",
    serviceTablePayment: "Uburyo bwo kwishyura",
    serviceTableWorker: "Umukozi",
    serviceTableDate: "Italiki",
    trackExpenses: "Genzura amafaranga akoresha iduka n'amabere yishyurwa buri gihe.",
    recordExpense: "Andika imikoreshereze",
    saveExpense: "Bika imikoreshereze",
    savingExpense: "Birimo kubika...",
    validExpenseAmount: "Nyamuneka shyiramo igiciro cy'imikoreshereze cyemewe.",
    expenseDescriptionPlaceholder: "Ongeramo ibisobanuro by'iyi mikoreshereze.",
    failedSaveExpense: "Ntibyashoboye kubika imikoreshereze.",
    expenseTableCategory: "Icyiciro",
    expenseTableAmount: "Igiciro",
    expenseTableRecordedBy: "Uwabyanditse",
    expenseTableDate: "Italiki",
    trackDebts: "Genzura amafaranga asigaye kwishyurwa, ibyo bishyuwe, n'umwenda w'umukiriya.",
    newDebtRecord: "Andika umwenda mushya",
    amountOwed: "Igiteranyo gisigaye",
    dueDate: "Italiki y'igihe",
    saveDebt: "Bika umwenda",
    savingDebt: "Birimo kubika...",
    validCustomerDetails: "Nyamuneka shyiramo amakuru y'umukiriya yemewe n'igiciro gisigaye.",
    failedRecordDebt: "Ntibyashoboye kwandika umwenda.",
    validPaymentAmount: "Nyamuneka shyiramo igiciro cyishyurwa cyemewe.",
    failedRecordPayment: "Ntibyashoboye kwandika ubwishyu.",
    recordPayment: "Andika ubwishyu",
    savePayment: "Bika ubwishyu",
    note: "Icyitonderwa",
    existingPayments: "Ubwishyu busanzwe",
    noPayments: "Nta bwishyuwe kugeza ubu.",
    amountPaid: "Amafaranga yishyuwe",
    fullPaymentPlaceholder: "Siga ubusa kugirango wishyure byose",
    debtTableCustomer: "Umukiriya",
    debtTableTotalOwed: "Igiteranyo gisigaye",
    debtTableRemaining: "Birasigaye",
    debtTableStatus: "Imiterere",
    amount: "Igiciro",
    walkIn: "Witabiriye",
    noteTitle: "Umutwe w'inyandiko",
    noteTitlePlaceholder: "Tanga umutwe w'inyandiko yawe...",
    noteContent: "Ibirimo inyandiko",
    noteDate: "Byanditswe",
    todoItems: "Ibintu byo gukora",
    todoPlaceholder: "Ongeramo ikintu cyo gukora...",
    markComplete: "Bishyiremo",
    untitledNote: "Inyandiko idafite umutwe",
    exportPDF: "Ohereza PDF",
    exportExcel: "Ohereza Excel",
    reportsDescription: "Kora raporo z'inyungu, kugurisha, ububiko n'imikoreshereze.",
    dailyRevenue: "Inyungu ya buri munsi",
    monthlyRevenue: "Inyungu y'ukwezi",
    netProfit: "Inyungu nyayo",
    stockValue: "Agaciro k'ububiko",
    valueOfInventory: "Agaciro k'ibicuruzwa mu byiciro.",
    mobileMoneyBreakdown: "Ibyerekeye Mobile Money",
    todaySalesPerformance: "Imikorere y'uyu munsi mu kugurisha.",
    currentMonthPerformance: "Imikorere y'ukwezi muri iki gihe.",
    serviceRevenueThisMonth: "Inyungu za serivisi z'ukwezi",
    allPastDatesCurrentMonth: "Inyungu z'itariki zose z'ukwezi uyu munsi",
    monthToDate: "Ubu kugeza ubu",
    export: "Ohereza",
    exportOptions: "Amahitamo yo kohereza",
    daily: "Buri munsi",
    monthly: "Bwari buri kwezi",
    selectDate: "Hitamo italiki",
    selectMonth: "Hitamo ukwezi",
    dailyPerformanceDetails: "Ibisobanuro by'imikorere y'umunsi",
    selectDailyReportDate: "Hitamo italiki kugirango urebe imikorere y'umunsi",
    itemsSoldCount: "Ibicuruzwa byagurishijwe",
    lowStockCount: "Ibikoresho biri hasi y'ububiko",
    detailedForOwner: "Ongeramo amakuru arambuye (nyir'ububiko gusa)",
    cancel: "Hagarika",
    monthBreakdown: "Icyegeranyo cy'ukwezi",
    monthTotal: "Igiteranyo cy'ukwezi",
    detailedServiceList: "Urutonde rurambuye rwa serivisi",
    service: "Serivisi",
    date: "Italiki",
    revenueAfterExpenses: "Inyungu isigaye nyuma y'imikoreshereze.",
    totalExpenses: "Imikoreshereze yose",
    debtBalance: "Icyumba cy'umwenda",
    serviceIncome: "Inyungu za serivisi",
    saleRevenue: "Amafaranga yakiriwe mu kugurisha",
    saleProfit: "Inyungu yo kugurisha",
    serviceRevenue: "Amafaranga ya serivisi",
    totalMonthlyRevenue: "Amafaranga yose y'ukwezi",
    monthlyExpenses: "Imikoreshereze y'ukwezi",
    totalCashReceived: "Amafaranga yose y'ifyashusho",
    totalMomoReceived: "Amafaranga yose yoherejwe na MOMO",
    totalDebtPayments: "Amafaranga yishyuwe ku madeni",
    outstandingDebt: "Umwenda usigaye",
    metric: "Igipimo",
    value: "Agaciro",
  },
};

const languageOptions: Array<{ code: Language; label: string }> = [
  { code: "en", label: "English" },
  { code: "rw", label: "Kinyarwanda" },
];

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKeys, vars?: Record<string, string | number>) => string;
  options: Array<{ code: Language; label: string }>;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = window.localStorage.getItem("sdtech_language");
    return stored === "rw" ? "rw" : "en";
  });

  useEffect(() => {
    window.localStorage.setItem("sdtech_language", language);
  }, [language]);

  const t = (key: TranslationKeys, vars?: Record<string, string | number>) => {
    const text = translations[language][key] || translations.en[key] || key;
    if (!vars) return text;
    return Object.entries(vars).reduce(
      (value, [varKey, varValue]) =>
        value.replace(new RegExp(`\\{${varKey}\\}`, "g"), String(varValue)),
      text,
    );
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLanguageState, t, options: languageOptions }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
};
