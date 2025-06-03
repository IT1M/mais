// Global Variables
let currentUser = null;
let currentRole = null;
let currentLanguage = 'en';
let currentTheme = 'light';
let currentBranch = 'all';
let salesData = [];
let leaderboardData = [];
let charts = {};

// MAISCO Product Categories and Products
const PRODUCT_CATEGORIES = {
    'airway': {
        en: 'Airway Products',
        ar: 'منتجات المجرى الهوائي',
        products: [
            'Endotracheal Tubes Oral/Nasal-Cuffed',
            'Pharyngeal Airway',
            'Laryngeal Airway Mask - PVC',
            'Tracheostomy Tube',
            'Manual Resuscitator PVC Type'
        ]
    },
    'anesthesia': {
        en: 'Anesthesia Products',
        ar: 'منتجات التخدير',
        products: [
            'Anesthesia Breathing circuit (Smooth Bore)',
            'Bacterial & Viral Filters',
            'Spinal needle pencil point',
            'MDI meter Dose'
        ]
    },
    'oxygen-therapy': {
        en: 'Oxygen Therapy Products',
        ar: 'منتجات العلاج بالأكسجين',
        products: [
            'Oxygen Nasal Cannula',
            'Nebulizer Mask With tube',
            'Non-Rebreathing Mask',
            'Venturi Mask/Mask Vent Adult'
        ]
    },
    'neonatal': {
        en: 'Neonatal Products',
        ar: 'منتجات حديثي الولادة',
        products: [
            'NCPAP Mask',
            'Infant bonnet',
            'Umbilical Catheter (PVC) Luer Tip',
            'Breast milk container'
        ]
    },
    'iv-therapy': {
        en: 'I.V. Therapy Products',
        ar: 'منتجات العلاج الوريدي',
        products: [
            'IV Cannula With Port – Sterile',
            'IV Butterfly',
            'Blood Transfusion Set',
            'I.V Infusion set With "Y" injection site'
        ]
    },
    'syringes': {
        en: 'Syringes',
        ar: 'الحقن',
        products: [
            'Syringe luer tip (sterile)',
            'Syringe Insulin (sterile)',
            'Dual Syringe Injector'
        ]
    },
    'hemodialysis': {
        en: 'Hemodialysis Products',
        ar: 'منتجات غسيل الكلى',
        products: [
            'Blood Lines for (Gambro Machines)',
            'Hemodialyzer Filters – Sterile',
            'Fistula Needle – Sterile'
        ]
    },
    'catheters': {
        en: 'Tubes & Catheters',
        ar: 'الأنابيب والقسطرة',
        products: [
            'CVC Single Lumen with J trip guide wire',
            'Feeding Tube with Guide Wire',
            'Suction Catheter with finger control tip'
        ]
    },
    'pulse-oximeter': {
        en: 'Pulse Oximeter Sensors',
        ar: 'أجهزة استشعار الأكسجين',
        products: [
            'Sensor Oxygen Forehead Masimo SET',
            'SPO2 probe with Adhesive tape',
            'Temperature Probe'
        ]
    },
    'general-surgery': {
        en: 'General Surgery Products',
        ar: 'منتجات الجراحة العامة',
        products: [
            'Small Handle Scalpel (Stainless Steel)',
            'Wound Drainage Set Pre-evacuated',
            'Under Water Drainage System'
        ]
    },
    'urology': {
        en: 'Urology Products',
        ar: 'منتجات المسالك البولية',
        products: [
            'Foley Catheter 100% Pure Silicone',
            'Urine Bags Standard -200 ml',
            'Nephrostomy Set'
        ]
    },
    'gynecology': {
        en: 'Obstetrics & Gynecology',
        ar: 'أمراض النساء والتوليد',
        products: [
            'Vaginal Speculum',
            'Circumcision Device',
            'Vaginal Dilator Set'
        ]
    },
    'miscellaneous': {
        en: 'Miscellaneous Products',
        ar: 'منتجات متنوعة',
        products: [
            'Ice Bag Plastic',
            'Stethoscope',
            'Thermometer',
            'Safety Plastic Container'
        ]
    }
};

// Mock data for demonstration
const MOCK_EMPLOYEES = [
    { name: 'Ahmed Al-Mahmoud', branch: 'riyadh', quantity: 2450 },
    { name: 'Fatima Al-Zahra', branch: 'jeddah', quantity: 2380 },
    { name: 'Mohammed Bin Salman', branch: 'riyadh', quantity: 2200 },
    { name: 'Nour Al-Din', branch: 'dammam', quantity: 2150 },
    { name: 'Sara Abdullah', branch: 'jeddah', quantity: 2100 },
    { name: 'Omar Al-Rashid', branch: 'riyadh', quantity: 1950 },
    { name: 'Maryam Al-Qasimi', branch: 'dammam', quantity: 1850 },
    { name: 'Khalid Al-Faisal', branch: 'jeddah', quantity: 1800 }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Show login modal
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Load saved settings
    loadSettings();
    
    // Initialize product categories
    loadProductCategories();
    
    // Generate mock data
    generateMockData();
}

function initializeEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Data entry form
    document.getElementById('dataEntryForm').addEventListener('submit', handleDataEntry);
    
    // Employee input
    document.getElementById('employeeInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addEmployee();
        }
    });
    
    // Branch selector
    document.getElementById('branchSelector').addEventListener('change', function() {
        currentBranch = this.value;
        updateDashboardData();
        if (currentRole === 'admin') {
            updateAdminDashboard();
        }
    });
    
    // Filter functionality
    document.getElementById('searchFilter')?.addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('startDate')?.addEventListener('change', applyFilters);
    document.getElementById('endDate')?.addEventListener('change', applyFilters);
}

function loadSettings() {
    // Load theme
    const savedTheme = localStorage.getItem('maisco-theme') || 'light';
    if (savedTheme === 'dark') {
        toggleTheme();
    }
    
    // Load language
    const savedLanguage = localStorage.getItem('maisco-language') || 'en';
    if (savedLanguage === 'ar') {
        toggleLanguage();
    }
}

function loadProductCategories() {
    const categorySelect = document.getElementById('productCategory');
    if (!categorySelect) return;
    
    // Clear existing options except first
    categorySelect.innerHTML = '<option value="" data-en="Select Category" data-ar="اختر الفئة">Select Category</option>';
    
    Object.keys(PRODUCT_CATEGORIES).forEach(key => {
        const category = PRODUCT_CATEGORIES[key];
        const option = document.createElement('option');
        option.value = key;
        option.setAttribute('data-en', category.en);
        option.setAttribute('data-ar', category.ar);
        option.textContent = currentLanguage === 'ar' ? category.ar : category.en;
        categorySelect.appendChild(option);
    });
}

function loadProducts() {
    const categorySelect = document.getElementById('productCategory');
    const productSelect = document.getElementById('productName');
    
    if (!categorySelect || !productSelect) return;
    
    const selectedCategory = categorySelect.value;
    
    // Clear product options
    productSelect.innerHTML = '<option value="" data-en="Select Product" data-ar="اختر المنتج">Select Product</option>';
    
    if (selectedCategory && PRODUCT_CATEGORIES[selectedCategory]) {
        const products = PRODUCT_CATEGORIES[selectedCategory].products;
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product;
            option.textContent = product;
            productSelect.appendChild(option);
        });
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    // Mock authentication
    if ((username === 'user' && password === 'pass' && role === 'employee') ||
        (username === 'admin' && password === 'admin' && role === 'admin')) {
        
        currentUser = username;
        currentRole = role;
        
        // Update UI
        document.getElementById('currentUser').textContent = username;
        
        // Show/hide admin sections
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = role === 'admin' ? 'block' : 'none';
        });
        
        // Hide login modal
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        loginModal.hide();
        
        // Show dashboard
        showPage('dashboard');
        
        // Show success message
        showToast('Login successful!', 'تم تسجيل الدخول بنجاح!');
        
    } else {
        alert('Invalid credentials! Use demo credentials.');
    }
}

function handleDataEntry(e) {
    e.preventDefault();
    
    const formData = {
        id: Date.now(),
        timestamp: new Date(),
        category: document.getElementById('productCategory').value,
        product: document.getElementById('productName').value,
        quantity: parseInt(document.getElementById('quantity').value),
        branch: document.getElementById('entryBranch').value,
        client: document.getElementById('clientName').value,
        salePrice: parseFloat(document.getElementById('salePrice').value) || 0,
        employees: getSelectedEmployees(),
        submittedBy: currentUser
    };
    
    // Validation
    if (!formData.category || !formData.product || !formData.quantity || !formData.client) {
        alert('Please fill in all required fields!');
        return;
    }
    
    if (formData.employees.length === 0) {
        alert('Please add at least one employee!');
        return;
    }
    
    // Save to mock database
    salesData.push(formData);
    localStorage.setItem('maisco-sales-data', JSON.stringify(salesData));
    
    // Update leaderboard
    updateLeaderboardData(formData);
    
    // Update dashboard stats
    updateDashboardData();
    
    // Reset form
    document.getElementById('dataEntryForm').reset();
    document.getElementById('employeeTags').innerHTML = '';
    
    // Show success message
    showToast('Data entry submitted successfully!', 'تم إرسال البيانات بنجاح!');
    
    // Redirect to leaderboard to show updated data
    setTimeout(() => showPage('leaderboard'), 1500);
}

function addEmployee() {
    const input = document.getElementById('employeeInput');
    const name = input.value.trim();
    
    if (name && !isEmployeeAdded(name)) {
        const tagsContainer = document.getElementById('employeeTags');
        const tag = createEmployeeTag(name);
        tagsContainer.appendChild(tag);
        input.value = '';
    }
}

function createEmployeeTag(name) {
    const tag = document.createElement('div');
    tag.className = 'employee-tag';
    tag.innerHTML = `
        <span>${name}</span>
        <button type="button" class="remove-btn" onclick="removeEmployee(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    return tag;
}

function removeEmployee(button) {
    button.closest('.employee-tag').remove();
}

function isEmployeeAdded(name) {
    const existingTags = document.querySelectorAll('.employee-tag span');
    return Array.from(existingTags).some(tag => tag.textContent === name);
}

function getSelectedEmployees() {
    const tags = document.querySelectorAll('.employee-tag span');
    return Array.from(tags).map(tag => tag.textContent);
}

function updateLeaderboardData(newEntry) {
    newEntry.employees.forEach(employeeName => {
        const existing = leaderboardData.find(emp => emp.name === employeeName);
        if (existing) {
            existing.quantity += newEntry.quantity;
            existing.lastActivity = new Date();
        } else {
            leaderboardData.push({
                name: employeeName,
                quantity: newEntry.quantity,
                branch: newEntry.branch,
                lastActivity: new Date()
            });
        }
    });
    
    // Sort by quantity (descending)
    leaderboardData.sort((a, b) => b.quantity - a.quantity);
    
    // Save to localStorage
    localStorage.setItem('maisco-leaderboard-data', JSON.stringify(leaderboardData));
    
    // Update leaderboard display
    updateLeaderboardDisplay();
}

function updateLeaderboardDisplay() {
    const tableBody = document.getElementById('leaderboardTable');
    if (!tableBody) return;
    
    let filteredData = leaderboardData;
    if (currentBranch !== 'all') {
        filteredData = leaderboardData.filter(emp => emp.branch === currentBranch);
    }
    
    tableBody.innerHTML = '';
    
    filteredData.forEach((employee, index) => {
        const row = document.createElement('tr');
        const rankClass = index < 3 ? ['text-warning', 'text-secondary', 'text-warning'][index] : '';
        
        row.innerHTML = `
            <td><span class="fw-bold ${rankClass}">#${index + 1}</span></td>
            <td>${employee.name}</td>
            <td><strong>${employee.quantity.toLocaleString()}</strong></td>
            <td>
                <span class="badge bg-primary">
                    ${currentLanguage === 'ar' ? 
                        getBranchNameArabic(employee.branch) : 
                        employee.branch.charAt(0).toUpperCase() + employee.branch.slice(1)}
                </span>
            </td>
            <td>${formatDate(employee.lastActivity)}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function updateDashboardData() {
    let filteredSales = salesData;
    if (currentBranch !== 'all') {
        filteredSales = salesData.filter(sale => sale.branch === currentBranch);
    }
    
    // Calculate stats
    const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.salePrice || 0), 0);
    const totalEmployees = new Set(filteredSales.flatMap(sale => sale.employees)).size;
    const totalQuantity = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
    
    // Update display
    document.getElementById('totalSales').textContent = formatCurrency(totalSales);
    document.getElementById('activeEmployees').textContent = totalEmployees;
    document.getElementById('productsShipped').textContent = totalQuantity.toLocaleString();
}

function updateAdminDashboard() {
    const tableBody = document.getElementById('adminTable');
    if (!tableBody) return;
    
    let filteredSales = salesData;
    if (currentBranch !== 'all') {
        filteredSales = salesData.filter(sale => sale.branch === currentBranch);
    }
    
    tableBody.innerHTML = '';
    
    filteredSales.reverse().forEach(sale => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDateTime(sale.timestamp)}</td>
            <td>${sale.product}</td>
            <td>${sale.quantity.toLocaleString()}</td>
            <td>${sale.client}</td>
            <td>${formatCurrency(sale.salePrice)}</td>
            <td>
                ${sale.employees.map(emp => `<span class="badge bg-secondary me-1">${emp}</span>`).join('')}
            </td>
            <td>
                <span class="badge bg-primary">
                    ${currentLanguage === 'ar' ? 
                        getBranchNameArabic(sale.branch) : 
                        sale.branch.charAt(0).toUpperCase() + sale.branch.slice(1)}
                </span>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Update charts
    updateCharts();
}

function updateCharts() {
    // Product sales chart
    updateProductChart();
    // Revenue trend chart
    updateRevenueChart();
    // AI Analytics charts
    updateAICharts();
}

function updateProductChart() {
    const ctx = document.getElementById('productsChart');
    if (!ctx) return;
    
    const productCounts = {};
    salesData.forEach(sale => {
        productCounts[sale.product] = (productCounts[sale.product] || 0) + sale.quantity;
    });
    
    const sortedProducts = Object.entries(productCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    if (charts.products) {
        charts.products.destroy();
    }
    
    charts.products = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sortedProducts.map(([product]) => product),
            datasets: [{
                data: sortedProducts.map(([, count]) => count),
                backgroundColor: [
                    '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    // Generate monthly revenue data
    const monthlyRevenue = {};
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = date.toISOString().slice(0, 7);
        last6Months.push(key);
        monthlyRevenue[key] = 0;
    }
    
    salesData.forEach(sale => {
        const month = sale.timestamp.toISOString().slice(0, 7);
        if (monthlyRevenue.hasOwnProperty(month)) {
            monthlyRevenue[month] += sale.salePrice || 0;
        }
    });
    
    if (charts.revenue) {
        charts.revenue.destroy();
    }
    
    charts.revenue = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last6Months.map(month => {
                const date = new Date(month + '-01');
                return date.toLocaleDateString(currentLanguage === 'ar' ? 'ar-SA' : 'en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                });
            }),
            datasets: [{
                label: currentLanguage === 'ar' ? 'الإيرادات' : 'Revenue',
                data: last6Months.map(month => monthlyRevenue[month]),
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function updateAICharts() {
    // Customer Segmentation Chart
    updateCustomerSegmentChart();
    // Sales Forecast Chart
    updateSalesForecastChart();
    // Employee Performance Chart
    updateEmployeePerformanceChart();
}

function updateCustomerSegmentChart() {
    const ctx = document.getElementById('customerSegmentChart');
    if (!ctx) return;
    
    // Mock customer segmentation data
    const segments = {
        'High Value': 35,
        'Regular': 45,
        'One-time': 20
    };
    
    if (charts.customerSegment) {
        charts.customerSegment.destroy();
    }
    
    charts.customerSegment = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(segments),
            datasets: [{
                data: Object.values(segments),
                backgroundColor: ['#28a745', '#007bff', '#ffc107']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function updateSalesForecastChart() {
    const ctx = document.getElementById('salesForecastChart');
    if (!ctx) return;
    
    // Generate forecast data
    const months = [];
    const actualData = [];
    const forecastData = [];
    
    // Last 6 months (actual)
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push(date.toLocaleDateString('en-US', { month: 'short' }));
        actualData.push(Math.random() * 100000 + 50000);
        forecastData.push(null);
    }
    
    // Next 6 months (forecast)
    for (let i = 1; i <= 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() + i);
        months.push(date.toLocaleDateString('en-US', { month: 'short' }));
        actualData.push(null);
        forecastData.push(Math.random() * 120000 + 60000);
    }
    
    if (charts.salesForecast) {
        charts.salesForecast.destroy();
    }
    
    charts.salesForecast = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: currentLanguage === 'ar' ? 'البيانات الفعلية' : 'Actual Data',
                    data: actualData,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    fill: false
                },
                {
                    label: currentLanguage === 'ar' ? 'التوقعات' : 'Forecast',
                    data: forecastData,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderDash: [5, 5],
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateEmployeePerformanceChart() {
    const ctx = document.getElementById('employeePerformanceChart');
    if (!ctx) return;
    
    // Get top 5 employees
    const topEmployees = leaderboardData.slice(0, 5);
    
    if (charts.employeePerformance) {
        charts.employeePerformance.destroy();
    }
    
    charts.employeePerformance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topEmployees.map(emp => emp.name),
            datasets: [{
                label: currentLanguage === 'ar' ? 'إجمالي الكمية' : 'Total Quantity',
                data: topEmployees.map(emp => emp.quantity),
                backgroundColor: '#007bff',
                borderColor: '#0056b3',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function generateMockData() {
    // Generate mock sales data if none exists
    const savedSales = localStorage.getItem('maisco-sales-data');
    const savedLeaderboard = localStorage.getItem('maisco-leaderboard-data');
    
    if (!savedSales) {
        // Generate 50 mock sales entries
        for (let i = 0; i < 50; i++) {
            const categories = Object.keys(PRODUCT_CATEGORIES);
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const products = PRODUCT_CATEGORIES[randomCategory].products;
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            const randomEmployee = MOCK_EMPLOYEES[Math.floor(Math.random() * MOCK_EMPLOYEES.length)];
            
            const mockSale = {
                id: Date.now() + i,
                timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
                category: randomCategory,
                product: randomProduct,
                quantity: Math.floor(Math.random() * 100) + 10,
                branch: randomEmployee.branch,
                client: `Client ${i + 1}`,
                salePrice: Math.random() * 10000 + 1000,
                employees: [randomEmployee.name],
                submittedBy: 'system'
            };
            
            salesData.push(mockSale);
        }
        
        localStorage.setItem('maisco-sales-data', JSON.stringify(salesData));
    } else {
        salesData = JSON.parse(savedSales);
        // Convert timestamp strings back to Date objects
        salesData.forEach(sale => {
            sale.timestamp = new Date(sale.timestamp);
        });
    }
    
    if (!savedLeaderboard) {
        leaderboardData = [...MOCK_EMPLOYEES];
        localStorage.setItem('maisco-leaderboard-data', JSON.stringify(leaderboardData));
    } else {
        leaderboardData = JSON.parse(savedLeaderboard);
        // Convert lastActivity strings back to Date objects
        leaderboardData.forEach(emp => {
            if (emp.lastActivity) {
                emp.lastActivity = new Date(emp.lastActivity);
            }
        });
    }
}

function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.style.display = 'none';
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.style.display = 'block';
        
        // Update page-specific data
        switch (pageId) {
            case 'dashboard':
                updateDashboardData();
                break;
            case 'leaderboard':
                updateLeaderboardDisplay();
                break;
            case 'admin-dashboard':
                updateAdminDashboard();
                break;
            case 'ai-analytics':
                setTimeout(updateAICharts, 100); // Delay to ensure canvas is visible
                break;
        }
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[onclick="showPage('${pageId}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    const isArabic = currentLanguage === 'ar';
    
    // Update HTML attributes
    document.documentElement.setAttribute('lang', currentLanguage);
    document.documentElement.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
    
    // Update language toggle button
    document.getElementById('langToggle').textContent = isArabic ? 'English' : 'عربي';
    
    // Update all translatable elements
    document.querySelectorAll('[data-en][data-ar]').forEach(element => {
        element.textContent = element.getAttribute(`data-${currentLanguage}`);
    });
    
    // Update product categories
    loadProductCategories();
    
    // Update displays that might need language-specific formatting
    updateLeaderboardDisplay();
    if (currentRole === 'admin') {
        updateAdminDashboard();
    }
    
    // Save language preference
    localStorage.setItem('maisco-language', currentLanguage);
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    const isDark = currentTheme === 'dark';
    
    // Update body class
    document.body.classList.toggle('dark-theme', isDark);
    
    // Update theme icon
    const themeIcon = document.getElementById('themeIcon');
    themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    
    // Save theme preference
    localStorage.setItem('maisco-theme', currentTheme);
    
    // Update charts if they exist (they need to be recreated for theme changes)
    setTimeout(() => {
        if (charts.products) updateProductChart();
        if (charts.revenue) updateRevenueChart();
        if (charts.customerSegment) updateCustomerSegmentChart();
        if (charts.salesForecast) updateSalesForecastChart();
        if (charts.employeePerformance) updateEmployeePerformanceChart();
    }, 100);
}

function refreshLeaderboard() {
    updateLeaderboardDisplay();
    showToast('Leaderboard refreshed!', 'تم تحديث لوحة المتصدرين!');
}

function applyFilters() {
    const startDate = document.getElementById('startDate')?.value;
    const endDate = document.getElementById('endDate')?.value;
    const searchTerm = document.getElementById('searchFilter')?.value.toLowerCase();
    
    let filteredSales = salesData;
    
    // Apply date filters
    if (startDate) {
        filteredSales = filteredSales.filter(sale => 
            sale.timestamp >= new Date(startDate)
        );
    }
    
    if (endDate) {
        filteredSales = filteredSales.filter(sale => 
            sale.timestamp <= new Date(endDate + 'T23:59:59')
        );
    }
    
    // Apply search filter
    if (searchTerm) {
        filteredSales = filteredSales.filter(sale => 
            sale.product.toLowerCase().includes(searchTerm) ||
            sale.client.toLowerCase().includes(searchTerm) ||
            sale.employees.some(emp => emp.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply branch filter
    if (currentBranch !== 'all') {
        filteredSales = filteredSales.filter(sale => sale.branch === currentBranch);
    }
    
    // Update admin table with filtered data
    updateAdminTableWithData(filteredSales);
}

function updateAdminTableWithData(data) {
    const tableBody = document.getElementById('adminTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    data.reverse().forEach(sale => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDateTime(sale.timestamp)}</td>
            <td>${sale.product}</td>
            <td>${sale.quantity.toLocaleString()}</td>
            <td>${sale.client}</td>
            <td>${formatCurrency(sale.salePrice)}</td>
            <td>
                ${sale.employees.map(emp => `<span class="badge bg-secondary me-1">${emp}</span>`).join('')}
            </td>
            <td>
                <span class="badge bg-primary">
                    ${currentLanguage === 'ar' ? 
                        getBranchNameArabic(sale.branch) : 
                        sale.branch.charAt(0).toUpperCase() + sale.branch.slice(1)}
                </span>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function exportToExcel() {
    // Mock export functionality
    showToast('Exporting to Excel...', 'جاري التصدير إلى إكسل...');
    
    setTimeout(() => {
        showToast('Excel export completed!', 'تم تصدير ملف إكسل!');
    }, 2000);
}

function exportToPDF() {
    // Mock export functionality
    showToast('Exporting to PDF...', 'جاري التصدير إلى PDF...');
    
    setTimeout(() => {
        showToast('PDF export completed!', 'تم تصدير ملف PDF!');
    }, 2000);
}

function logout() {
    // Clear current session
    currentUser = null;
    currentRole = null;
    
    // Hide admin sections
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = 'none';
    });
    
    // Show login modal
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
    
    // Reset forms
    document.getElementById('loginForm').reset();
    document.getElementById('dataEntryForm')?.reset();
    
    showToast('Logged out successfully!', 'تم تسجيل الخروج بنجاح!');
}

function showToast(messageEn, messageAr) {
    const toast = document.getElementById('successToast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = currentLanguage === 'ar' ? messageAr : messageEn;
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat(currentLanguage === 'ar' ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 2
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat(currentLanguage === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(new Date(date));
}

function formatDateTime(date) {
    return new Intl.DateTimeFormat(currentLanguage === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

function getBranchNameArabic(branch) {
    const branchNames = {
        'riyadh': 'الرياض',
        'jeddah': 'جدة',
        'dammam': 'الدمام'
    };
    return branchNames[branch] || branch;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Gemini AI API Integration (Mock)
async function callGeminiAPI(prompt, context = {}) {
    // Mock API call to Gemini Flash 2.0
    const apiKey = 'AIzaSyBcK8TFKTSyQ1BJqp5UMfvFLQCqfjCo7OY'; // Note: In production, this should be server-side
    
    try {
        // This is a mock implementation - in production, you would make actual API calls
        console.log('Mock Gemini API Call:', {
            prompt,
            context,
            model: 'gemini-2.0-flash'
        });
        
        // Return mock AI response
        return {
            success: true,
            response: "Mock AI analysis completed. This would contain actual insights from Gemini Flash 2.0 in production.",
            confidence: 0.87,
            insights: [
                "High-value customers prefer I.V. Therapy products",
                "Jeddah branch shows strong neonatal product demand", 
                "Evening shift productivity could be improved"
            ]
        };
        
    } catch (error) {
        console.error('AI API Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Initialize dashboard when page loads
window.addEventListener('load', function() {
    if (currentUser) {
        showPage('dashboard');
    }
});