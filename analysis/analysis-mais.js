document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const GROQ_API_KEY = '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'; // IMPORTANT: Secure this in a real app!
    const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
    const MODEL_NAME = 'deepseek-r1-distill-llama-70b'; // Using Mixtral as a capable alternative
    const MAX_MANUAL_INPUT_LENGTH = 10000;
    const LOCAL_STORAGE_KEY = 'maisMedicalLastAnalysis';

    // --- UI STRINGS (for future localization) ---
    const uiStrings = {
        en: {
            pageTitle: "Mais Medical - Sales Analysis Dashboard",
            headerTitle: "Sales Analysis Dashboard",
            inputSectionTitle: "Product & Data Input",
            selectCategoryLabel: "Select Product Category:",
            selectCategoryOption: "-- Select Category --",
            subProductLabel: "Enter Sub-product (Optional):",
            subProductPlaceholder: "e.g., Endotracheal Tube",
            provideSalesDataLabel: "Provide Sales Data:",
            uploadFileLabel: "Upload CSV, XLSX, or TXT File:",
            orDivider: "OR",
            manualDataLabel: "Enter Data Manually:",
            manualDataPlaceholder: "Paste your sales data here (e.g., CSV format, or summarized text). One entry per line for structured data. Max " + MAX_MANUAL_INPUT_LENGTH + " characters.",
            analyzeButtonText: "Analyze Sales Data",
            loadingText: "Loading...",
            analyzingText: "MaisIntellect is analyzing... Please wait.",
            analysisOutputTitle: "AI-Powered Analysis",
            visualInsightTitle: "Visual Insight",
            footerText: "© 2024 Mais Medical. All rights reserved.",
            fileNotChosen: "No file chosen.",
            fileChosen: "File: {fileName}",
            manualInputDisabled: "File selected. Manual input disabled.",
            fileInputDisabled: "Manual data entered. File input disabled.",
            errorReadingFile: "Error reading file. Please ensure it is a valid TXT, CSV, or XLSX file.",
            selectCategoryError: "Please select a product category.",
            provideDataError: "Please upload a sales file or enter data manually.",
            apiError: "Error during analysis: {errorMessage}",
            apiErrorSuggestion: "Please check your API key, network connection, and the data provided. The AI model might also be temporarily unavailable or overloaded.",
            emptyAIResponse: "Received an empty response from the AI. The model might be experiencing issues.",
            chartDataError: "Could not parse chart JSON from AI response.",
            chartDataWarning: "(MaisIntellect: Note - There was an issue formatting the chart data. Displaying raw attempt if available or skipping chart.)",
            chartInsufficientData: "Visual Insight: Insufficient data for a meaningful visual representation.",
            localStorageNoticeText: "A previous analysis is available.",
            loadLastAnalysisBtn: "Load It",
            clearLastAnalysisBtn: "Clear",
            inputSanitizedWarning: "Manual input was trimmed or potentially harmful characters were removed for security.",
            inputTooLongWarning: `Manual input exceeds maximum length of ${MAX_MANUAL_INPUT_LENGTH} characters. It has been truncated.`,
            invalidFileType: "Invalid file type. Please upload a CSV, XLSX, or TXT file.",
            charCountText: "{current} / {max}"
        }
    };
    const currentLang = 'en'; // For now, only English
    const T = (key, replacements = {}) => {
        let text = uiStrings[currentLang][key] || key;
        for (const placeholder in replacements) {
            text = text.replace(`{${placeholder}}`, replacements[placeholder]);
        }
        return text;
    };

    // --- DOM ELEMENTS ---
    const dom = {
        productCategorySelect: document.getElementById('product-category'),
        subProductGroup: document.getElementById('sub-product-group'),
        subProductInput: document.getElementById('sub-product'),
        salesFileInput: document.getElementById('sales-file'),
        fileNameDisplay: document.getElementById('file-name-display'),
        manualDataTextarea: document.getElementById('manual-data'),
        analyzeButton: document.getElementById('analyze-button'),
        loadingIndicator: document.getElementById('loading-indicator'),
        analysisOutputSection: document.getElementById('analysis-output-section'),
        aiResponseArea: document.getElementById('ai-response-area'),
        chartContainerWrapper: document.querySelector('.chart-container-wrapper'),
        salesChartCanvas: document.getElementById('salesChart'),
        chatbotIcon: document.getElementById('chatbot-icon'),
        analysisForm: document.getElementById('analysisForm'),
        charCountDisplay: document.getElementById('charCount'),
        localStorageNotice: document.getElementById('localStorageNotice'),
        loadLastAnalysisBtn: document.getElementById('loadLastAnalysisBtn'),
        clearLastAnalysisBtn: document.getElementById('clearLastAnalysisBtn')
    };

    let salesChartInstance = null; // To store Chart.js instance

    // --- SYSTEM PROMPT (Unchanged from user request) ---
    const SYSTEM_PROMPT = `You are "MaisIntellect", an advanced AI medical sales analyst for "Mais Medical". Your expertise lies in dissecting sales data (provided as CSV, plain text, or summarized text) for medical products.

**Your Goal**: Provide a comprehensive, actionable, and insightful analysis of the sales data for the specified product category and sub-product (if provided).

**Analysis Structure (Follow this strictly for your response):**

1.  **Mais Performance Overview (for [Product Category] / [Sub-Product if any]):**
    *   Brief, high-level summary of overall sales performance.
    *   Key achievements or standout positive points.
    *   Major challenges or areas of concern.

2.  **Sales Trends & Patterns:**
    *   Identify and describe dominant sales trends (e.g., upward, downward, seasonal, erratic).
    *   Note any recurring patterns or cycles.
    *   Compare performance across different periods if data allows (e.g., month-over-month, quarter-over-quarter).

3.  **Significant Sales Drops & Potential Reasons:**
    *   Pinpoint any significant drops in sales.
    *   Hypothesize potential reasons for these drops (e.g., competitor activity, supply chain issues, market changes, product lifecycle stage, past seasonal data if available). Be specific to medical device sales.

4.  **Actionable Optimization Recommendations:**
    *   Provide 3-5 concrete, actionable recommendations to improve sales performance.
    *   Recommendations should be tailored to the medical device industry and the specific product context.
    *   Examples: targeted marketing campaigns, sales team training, exploring new distribution channels, product bundling, pricing strategy adjustments.

5.  **Visual Insight Data (for Chart.js):**
    *   **IMPORTANT**: Provide data formatted for a simple Chart.js line or bar chart.
    *   Output this section as a JSON string within a markdown code block. Example:
        \`\`\`json
        {
          "chartType": "bar", // or "line"
          "labels": ["Q1", "Q2", "Q3", "Q4"],
          "datasets": [
            {
              "label": "Sales Volume",
              "data": [120, 190, 150, 210],
              "backgroundColor": "rgba(0, 123, 255, 0.5)", // Use Mais Medical Blue
              "borderColor": "rgba(0, 123, 255, 1)",
              "borderWidth": 1
            }
          ]
        }
        \`\`\`
    *   Base the chart on the most compelling trend or comparison from the data. If data is too sparse for a meaningful chart, state "Insufficient data for a meaningful visual representation." inside the JSON block like: \`\`\`json\n{"chartMessage": "Insufficient data for a meaningful visual representation."}\n\`\`\`

**Data Interpretation Guidelines:**
*   The input data might be raw CSV, structured text, or just a plain text description of sales. Adapt your analysis to the format.
*   If data is sparse, acknowledge it and provide cautious interpretations.
*   Focus on actionable insights. Avoid vague statements.
*   Maintain a professional, analytical, and optimistic tone, appropriate for "Mais Medical".
*   The user will provide the Product Category, optionally a Sub-Product, and the sales data. Your response should dynamically incorporate the Product Category and Sub-Product names where placeholder \`[Product Category]\` or \`[Sub-Product if any]\` appear.

**Response Formatting:**
*   Use markdown for clear formatting (headings, bullet points).
*   Start your entire response with: "## MaisIntellect Analysis for [Product Category]" (and sub-product if provided).`;


    // --- INITIALIZATION ---
    function init() {
        applyTranslations();
        setupEventListeners();
        checkLocalStorage();
        updateCharCount(); // Initialize char count
    }

    function applyTranslations() {
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (uiStrings[currentLang][key]) {
                el.textContent = uiStrings[currentLang][key];
            }
        });
        document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
            const key = el.getAttribute('data-translate-placeholder');
             if (uiStrings[currentLang][key]) {
                el.placeholder = uiStrings[currentLang][key];
            }
        });
        // Update dynamic elements like file name display initially
        dom.fileNameDisplay.textContent = T('fileNotChosen');
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        dom.productCategorySelect.addEventListener('change', handleCategoryChange);
        dom.salesFileInput.addEventListener('change', handleFileSelect);
        dom.manualDataTextarea.addEventListener('input', handleManualDataInput);
        dom.analysisForm.addEventListener('submit', handleSubmit);
        dom.chatbotIcon.addEventListener('click', handleChatbotClick);
        dom.loadLastAnalysisBtn.addEventListener('click', loadAnalysisFromStorage);
        dom.clearLastAnalysisBtn.addEventListener('click', clearStoredAnalysis);
        dom.manualDataTextarea.addEventListener('input', updateCharCount);
    }

    function updateCharCount() {
        const currentLength = dom.manualDataTextarea.value.length;
        dom.charCountDisplay.textContent = T('charCountText', { current: currentLength, max: MAX_MANUAL_INPUT_LENGTH });
        if (currentLength > MAX_MANUAL_INPUT_LENGTH) {
            dom.charCountDisplay.classList.add('text-danger');
        } else {
            dom.charCountDisplay.classList.remove('text-danger');
        }
    }
    
    function handleCategoryChange() {
        dom.subProductGroup.style.display = dom.productCategorySelect.value ? 'block' : 'none';
        if (!dom.productCategorySelect.value) {
            dom.subProductInput.value = '';
        }
    }

    function handleFileSelect() {
        if (dom.salesFileInput.files.length > 0) {
            const file = dom.salesFileInput.files[0];
            const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'];
            const allowedExtensions = ['.csv', '.xlsx', '.txt'];
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

            if (allowedExtensions.includes(fileExtension) || allowedTypes.includes(file.type)) {
                dom.fileNameDisplay.textContent = T('fileChosen', { fileName: file.name });
                dom.manualDataTextarea.disabled = true;
                dom.manualDataTextarea.value = '';
                dom.manualDataTextarea.placeholder = T('manualInputDisabled');
                updateCharCount(); // Reset char count for manual data
            } else {
                alert(T('invalidFileType'));
                dom.salesFileInput.value = ''; // Clear the invalid file
                dom.fileNameDisplay.textContent = T('fileNotChosen');
                dom.manualDataTextarea.disabled = false;
            }
        } else {
            dom.fileNameDisplay.textContent = T('fileNotChosen');
            dom.manualDataTextarea.disabled = false;
            dom.manualDataTextarea.placeholder = T('manualDataPlaceholder');
        }
    }

    function handleManualDataInput() {
        updateCharCount();
        if (dom.manualDataTextarea.value.trim() !== '') {
            dom.salesFileInput.disabled = true;
            dom.fileNameDisplay.textContent = T('fileInputDisabled');
        } else {
            dom.salesFileInput.disabled = false;
            dom.fileNameDisplay.textContent = dom.salesFileInput.files.length > 0 ? T('fileChosen', {fileName: dom.salesFileInput.files[0].name}) : T('fileNotChosen');
        }
    }

    function handleChatbotClick() {
        alert("Mais Medical Tech Support:\n\nFor assistance, please contact support@maismedical.com or call (555) 123-4567.\n\nIf you have issues with the AI analysis, ensure your data is clearly formatted and sufficient for analysis.");
    }

    // --- DATA PROCESSING & SANITIZATION ---
    async function getSalesData() {
        const file = dom.salesFileInput.files[0];
        let salesData = dom.manualDataTextarea.value;

        if (file) {
            try {
                const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                if (fileExtension === '.xlsx') {
                    return await parseXlsxFile(file);
                } else {
                    return await readFileAsText(file);
                }
            } catch (error) {
                console.error('Error reading file:', error);
                alert(T('errorReadingFile'));
                return null;
            }
        } else if (salesData.trim()) {
            return sanitizeManualInput(salesData);
        }
        return null;
    }

    function readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    }

    function parseXlsxFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const csvData = XLSX.utils.sheet_to_csv(worksheet);
                    resolve(csvData);
                } catch (e) {
                    reject(e);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    }

    function sanitizeManualInput(text) {
        let sanitizedText = text.trim();
        // Basic sanitization: remove characters that might break JSON or are typically unwanted.
        // This is a very basic example. For robust sanitization against complex attacks,
        // a more sophisticated library or approach would be needed if the text was used differently.
        // For sending to AI, trimming and length limiting are primary.
        // sanitizedText = sanitizedText.replace(/[<>"'&]/g, ''); // Example: Remove HTML-breaking chars. Use with caution.

        if (sanitizedText.length > MAX_MANUAL_INPUT_LENGTH) {
            sanitizedText = sanitizedText.substring(0, MAX_MANUAL_INPUT_LENGTH);
            // alert(T('inputTooLongWarning')); // Could be annoying, consider a less intrusive notification
            console.warn(T('inputTooLongWarning'));
        }
        return sanitizedText;
    }

    // --- API CALL ---
    async function fetchAIAnalysis(systemPrompt, userPrompt) {
        const response = await fetch(GROQ_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: MODEL_NAME,
                temperature: 0.3,
                max_tokens: 3500, // Increased slightly for potentially larger data or more complex analysis
                top_p: 1,
                stream: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('GROQ API Error:', errorData);
            throw new Error(`API request failed with status ${response.status}: ${errorData.error?.message || response.statusText}`);
        }
        return response.json();
    }

    // --- UI RENDERING ---
    function displayLoading(isLoading) {
        dom.loadingIndicator.style.display = isLoading ? 'block' : 'none';
        dom.analysisOutputSection.style.display = isLoading ? 'none' : dom.analysisOutputSection.style.display; // Keep visible if already shown
        dom.analyzeButton.disabled = isLoading;
    }

    function displayAnalysis(aiContent, category, subProduct) {
        // Extract Chart.js JSON
        const chartJsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = aiContent.match(chartJsonRegex);
        let chartData = null;
        let chartConfigError = null;

        if (match && match[1]) {
            try {
                chartData = JSON.parse(match[1].trim());
                aiContent = aiContent.replace(chartJsonRegex, "").trim(); // Remove JSON block
            } catch (e) {
                console.warn(T('chartDataError'), e);
                chartConfigError = T('chartDataWarning');
                if (match && match[0]) {
                    chartConfigError += `\n\nFaulty JSON block:\n${match[0]}`;
                }
            }
        }
        
        // Ensure the title is correctly set, even if AI misses it
        let title = `## MaisIntellect Analysis for ${category}`;
        if (subProduct) title += ` / ${subProduct}`;
        if (!aiContent.toLowerCase().includes(category.toLowerCase())) { // Simple check if category is in response
             // Prepend title if AI didn't include it in its opening (unlikely with good prompt but safety)
            if(!aiContent.trim().startsWith("## MaisIntellect Analysis for")) {
                aiContent = title + "\n\n" + aiContent;
            }
        }


        dom.aiResponseArea.innerHTML = marked.parse(aiContent);
        if (chartConfigError) {
            const errorP = document.createElement('p');
            errorP.style.color = 'orange';
            errorP.innerHTML = marked.parse(chartConfigError); // Render markdown in error message too
            dom.aiResponseArea.appendChild(errorP);
        }


        if (chartData && !chartData.chartMessage) {
            renderChart(chartData);
            dom.chartContainerWrapper.style.display = 'block';
        } else if (chartData && chartData.chartMessage) {
            const msgP = document.createElement('p');
            msgP.innerHTML = `<strong>${T('visualInsightTitle')}:</strong> ${chartData.chartMessage}`;
            dom.aiResponseArea.appendChild(msgP); // Append message to text area
            dom.chartContainerWrapper.style.display = 'none';
            if (salesChartInstance) salesChartInstance.destroy();
        } else {
            dom.chartContainerWrapper.style.display = 'none';
            if (salesChartInstance) salesChartInstance.destroy();
        }

        dom.analysisOutputSection.style.display = 'block';
        dom.analysisOutputSection.scrollIntoView({ behavior: 'smooth' });

        // Save to localStorage
        saveAnalysisToStorage({
            category,
            subProduct,
            aiContent, // Store the version without the JSON block
            chartData, // Store parsed chart data or message
            timestamp: new Date().toISOString()
        });
    }

    function displayError(errorMessage) {
        dom.aiResponseArea.innerHTML = `<div class="alert alert-danger" role="alert">${T('apiError', {errorMessage})} <br><small>${T('apiErrorSuggestion')}</small></div>`;
        dom.analysisOutputSection.style.display = 'block';
        dom.analysisOutputSection.scrollIntoView({ behavior: 'smooth' });
    }

    function renderChart(chartConfig) {
        if (salesChartInstance) {
            salesChartInstance.destroy();
        }
        const ctx = dom.salesChartCanvas.getContext('2d');
        
        // Default styling for datasets if not provided by AI
        const maisBlueRgba = 'rgba(0, 123, 255, 0.5)'; // from CSS --bs-primary
        const maisBlueBorderRgba = 'rgba(0, 123, 255, 1)';
        const secondaryColorRgba = 'rgba(108, 117, 125, 0.5)'; // from CSS --secondary-text-color
        const secondaryColorBorderRgba = 'rgba(108, 117, 125, 1)';

        if (chartConfig.datasets) {
            chartConfig.datasets.forEach((dataset, index) => {
                dataset.backgroundColor = dataset.backgroundColor || (index % 2 === 0 ? maisBlueRgba : secondaryColorRgba);
                dataset.borderColor = dataset.borderColor || (index % 2 === 0 ? maisBlueBorderRgba : secondaryColorBorderRgba);
                dataset.borderWidth = dataset.borderWidth === undefined ? 1 : dataset.borderWidth;
                dataset.tension = dataset.tension === undefined && chartConfig.chartType === 'line' ? 0.1 : dataset.tension; // Slight curve for line charts
            });
        }

        salesChartInstance = new Chart(ctx, {
            type: chartConfig.chartType || 'bar',
            data: {
                labels: chartConfig.labels || [],
                datasets: chartConfig.datasets || []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#495057' }, grid: { color: '#dee2e6' } },
                    x: { ticks: { color: '#495057' }, grid: { color: '#dee2e6' } }
                },
                plugins: { legend: { labels: { color: '#212529' } } }
            }
        });
    }
    
    // --- LOCALSTORAGE ---
    function checkLocalStorage() {
        const storedAnalysis = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedAnalysis) {
            dom.localStorageNotice.style.display = 'block';
        }
    }

    function saveAnalysisToStorage(analysisData) {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(analysisData));
            dom.localStorageNotice.style.display = 'block'; // Ensure it's visible after saving
        } catch (e) {
            console.error("Error saving to localStorage:", e);
            // Potentially localStorage is full or disabled
        }
    }

    function loadAnalysisFromStorage() {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
            try {
                const analysis = JSON.parse(storedData);
                // Populate form fields (optional, but good for context)
                dom.productCategorySelect.value = analysis.category || '';
                handleCategoryChange(); // to show sub-product if needed
                dom.subProductInput.value = analysis.subProduct || '';
                
                // Display the stored analysis
                displayAnalysis(analysis.aiContent, analysis.category, analysis.subProduct); // displayAnalysis handles chartData itself if present in analysis object
                
                dom.localStorageNotice.style.display = 'none';
            } catch (e) {
                console.error("Error parsing stored analysis:", e);
                localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
            }
        }
    }

    function clearStoredAnalysis() {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        dom.localStorageNotice.style.display = 'none';
        // Optionally clear the displayed analysis too if you want
        // dom.analysisOutputSection.style.display = 'none';
        // dom.aiResponseArea.innerHTML = '';
        // if (salesChartInstance) salesChartInstance.destroy();
    }


    // --- MAIN SUBMISSION LOGIC ---
    async function handleSubmit(event) {
        event.preventDefault(); // Prevent default form submission

        const category = dom.productCategorySelect.value;
        const subProduct = dom.subProductInput.value.trim();
        
        if (!category) {
            alert(T('selectCategoryError'));
            return;
        }

        const salesData = await getSalesData();
        if (!salesData) {
            if (!dom.salesFileInput.files[0] && !dom.manualDataTextarea.value.trim()){ // only show if both are empty
                 alert(T('provideDataError'));
            }
            // If getSalesData returned null due to file read error, alert was already shown.
            return;
        }
        
        displayLoading(true);

        let userPrompt = `Analyze sales data for Product Category: "${category}"`;
        if (subProduct) {
            userPrompt += `, Sub-Product: "${subProduct}"`;
        }
        userPrompt += `.\n\nSales Data:\n\`\`\`\n${salesData}\n\`\`\`\n\nPlease provide the analysis as per the structured format, including the JSON for Chart.js.`;

        try {
            const data = await fetchAIAnalysis(SYSTEM_PROMPT, userPrompt);
            const aiContent = data.choices[0]?.message?.content;

            if (!aiContent) {
                throw new Error(T('emptyAIResponse'));
            }
            displayAnalysis(aiContent, category, subProduct);

        } catch (error) {
            console.error('Analysis error:', error);
            displayError(error.message);
        } finally {
            displayLoading(false);
        }
    }

    // --- START THE APP ---
    init();
});