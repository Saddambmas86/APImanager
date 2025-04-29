// Store endpoints in localStorage
const STORAGE_KEY = 'api_endpoints';

// DOM Elements
let endpointsList, addEndpointBtn, endpointModal, endpointForm, cancelBtn, headersContainer, addHeaderBtn, requestBodyGroup, requestBodyInput;
let endpointNameInput, httpMethodInput, endpointUrlInput, endpointDescriptionInput;

// Load endpoints from localStorage
let endpoints = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let editingEndpointId = null;

// Initialize the app
function init() {
    console.log('Starting initialization...');
    
    // Get DOM elements
    endpointsList = document.getElementById('endpointsList');
    addEndpointBtn = document.getElementById('addEndpointBtn');
    endpointModal = document.getElementById('endpointModal');
    endpointForm = document.getElementById('endpointForm');
    cancelBtn = document.getElementById('cancelBtn');
    headersContainer = document.getElementById('headersContainer');
    addHeaderBtn = document.getElementById('addHeaderBtn');
    requestBodyGroup = document.getElementById('requestBodyGroup');
    requestBodyInput = document.getElementById('requestBody');
    
    // Form inputs
    endpointNameInput = document.getElementById('endpointName');
    httpMethodInput = document.getElementById('httpMethod');
    endpointUrlInput = document.getElementById('endpointUrl');
    endpointDescriptionInput = document.getElementById('endpointDescription');

    // Debug DOM elements
    console.log('DOM Elements:', {
        endpointsList: !!endpointsList,
        addEndpointBtn: !!addEndpointBtn,
        endpointModal: !!endpointModal,
        endpointForm: !!endpointForm,
        cancelBtn: !!cancelBtn,
        headersContainer: !!headersContainer,
        addHeaderBtn: !!addHeaderBtn,
        requestBodyGroup: !!requestBodyGroup,
        requestBodyInput: !!requestBodyInput,
        endpointNameInput: !!endpointNameInput,
        httpMethodInput: !!httpMethodInput,
        endpointUrlInput: !!endpointUrlInput,
        endpointDescriptionInput: !!endpointDescriptionInput
    });

    if (!addEndpointBtn || !endpointModal || !endpointForm) {
        console.error('Critical DOM elements missing!');
        return;
    }

    // Set up event listeners
    setupEventListeners();
    
    // Initial render
    renderEndpoints();
    
    console.log('Initialization complete');
}

// Set up event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Add endpoint button
    addEndpointBtn.addEventListener('click', (e) => {
        console.log('Add endpoint button clicked', e);
        e.preventDefault();
        editingEndpointId = null;
        showModal('Add New Endpoint');
    });

    // Cancel button
    cancelBtn.addEventListener('click', (e) => {
        console.log('Cancel button clicked', e);
        e.preventDefault();
        hideModal();
    });

    // Form submission
    endpointForm.addEventListener('submit', (e) => {
        if (apiName && apiMethod && apiUrl) {
            currentFolder.apis.push({ name: apiName, method: apiMethod, url: apiUrl });
            folders[folderIndex] = currentFolder;
            localStorage.setItem("folders", JSON.stringify(folders));
            apiForm.reset();
            
            // Hide the modal
            endpointModal.style.display = "none";
            
            // Force a complete page reload
            window.location.reload();
        }
        console.log('Form submitted', e);
        e.preventDefault();
        saveEndpoint();
    });

    // Add header button
    addHeaderBtn.addEventListener('click', (e) => {
        console.log('Add header button clicked', e);
        e.preventDefault();
        addHeaderRow();
    });

    // Close modal when clicking outside
    endpointModal.addEventListener('click', (e) => {
        if (e.target === endpointModal || e.target.classList.contains('modal-overlay')) {
            hideModal();
        }
    });

    // HTTP method change
    httpMethodInput.addEventListener('change', () => {
        const method = httpMethodInput.value;
        requestBodyGroup.classList.toggle('visible', method === 'POST' || method === 'PUT');
    });
}

// Add new header row
function addHeaderRow(key = '', value = '') {
    const headerRow = document.createElement('div');
    headerRow.className = 'header-row';
    headerRow.innerHTML = `
        <input type="text" class="header-key" placeholder="Key" value="${key}">
        <input type="text" class="header-value" placeholder="Value" value="${value}">
        <button type="button" class="btn secondary btn-sm remove-header">
            <i class="fas fa-trash"></i>
        </button>
    `;
    headersContainer.appendChild(headerRow);
    
    // Add event listener to remove button
    headerRow.querySelector('.remove-header').addEventListener('click', () => {
        if (headersContainer.querySelectorAll('.header-row').length > 1) {
            headerRow.remove();
        }
    });
}

// Show modal for adding/editing endpoints
function showModal(title, endpoint = null) {
    console.log('Showing modal with title:', title);
    if (!endpointModal) {
        console.error('Modal element not found!');
        return;
    }
    
    document.getElementById('modalTitle').textContent = title;
    endpointModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (endpoint) {
        // Fill form with endpoint data
        endpointNameInput.value = endpoint.name;
        httpMethodInput.value = endpoint.method;
        endpointUrlInput.value = endpoint.url;
        endpointDescriptionInput.value = endpoint.description || '';
        
        // Clear and add headers
        headersContainer.innerHTML = '';
        if (endpoint.headers) {
            Object.entries(endpoint.headers).forEach(([key, value]) => {
                addHeaderRow(key, value);
            });
        } else {
            addHeaderRow();
        }
        
        // Handle request body
        if (endpoint.body) {
            requestBodyInput.value = JSON.stringify(endpoint.body, null, 2);
        } else {
            requestBodyInput.value = '';
        }
        
        // Show/hide request body based on method
        requestBodyGroup.classList.toggle('visible', endpoint.method === 'POST' || endpoint.method === 'PUT');
    } else {
        resetForm();
    }
}

// Hide modal
function hideModal() {
    if (!endpointModal) {
        console.error('Modal element not found!');
        return;
    }
    
    endpointModal.classList.remove('active');
    document.body.style.overflow = '';
    resetForm();
    editingEndpointId = null;
}

// Reset form inputs
function resetForm() {
    endpointNameInput.value = '';
    httpMethodInput.value = 'GET';
    endpointUrlInput.value = '';
    endpointDescriptionInput.value = '';
    requestBodyInput.value = '';
    headersContainer.innerHTML = '';
    addHeaderRow();
    requestBodyGroup.classList.remove('visible');
}

// Get headers from form
function getHeaders() {
    const headers = {};
    const headerRows = headersContainer.querySelectorAll('.header-row');
    headerRows.forEach(row => {
        const key = row.querySelector('.header-key').value.trim();
        const value = row.querySelector('.header-value').value.trim();
        if (key && value) {
            headers[key] = value;
        }
    });
    return headers;
}

// Save endpoint to localStorage
function saveEndpoint() {
    const endpoint = {
        id: editingEndpointId || Date.now().toString(),
        name: endpointNameInput.value,
        method: httpMethodInput.value,
        url: endpointUrlInput.value,
        description: endpointDescriptionInput.value,
        headers: getHeaders()
    };

    // Add request body for POST and PUT methods
    if (endpoint.method === 'POST' || endpoint.method === 'PUT') {
        try {
            endpoint.body = JSON.parse(requestBodyInput.value);
        } catch (e) {
            alert('Invalid JSON in request body');
            return;
        }
    }

    if (editingEndpointId) {
        // Update existing endpoint
        const index = endpoints.findIndex(e => e.id === editingEndpointId);
        if (index !== -1) {
            endpoints[index] = endpoint;
        }
    } else {
        // Add new endpoint
        endpoints.push(endpoint);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(endpoints));
    renderEndpoints();
    hideModal();
}

// Delete endpoint
function deleteEndpoint(id) {
    if (confirm('Are you sure you want to delete this endpoint?')) {
        endpoints = endpoints.filter(endpoint => endpoint.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(endpoints));
        renderEndpoints();
    }
}

// Edit endpoint
function editEndpoint(id) {
    const endpoint = endpoints.find(e => e.id === id);
    if (endpoint) {
        editingEndpointId = id;
        showModal('Edit Endpoint', endpoint);
    }
}

// Get method color class
function getMethodColorClass(method) {
    const colors = {
        'GET': 'method-get',
        'POST': 'method-post',
        'PUT': 'method-put',
        'DELETE': 'method-delete'
    };
    return colors[method] || 'method-get';
}

// Get status code class
function getStatusCodeClass(status) {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 400 && status < 500) return 'error';
    if (status >= 500) return 'error';
    return 'warning';
}

// Send API request
async function sendRequest(endpointId) {
    const endpoint = endpoints.find(e => e.id === endpointId);
    if (!endpoint) return;

    const card = document.querySelector(`[data-endpoint-id="${endpointId}"]`);
    const sendButton = card.querySelector('.send-request');
    const testButton = card.querySelector('.test-status');
    const responsePanel = document.getElementById('responsePanel');
    const responseContent = document.getElementById('responseContent');
    
    // Show loading state
    sendButton.disabled = true;
    sendButton.innerHTML = '<span class="loading"></span> Sending...';
    
    try {
        const options = {
            method: endpoint.method,
            headers: {
                'Content-Type': 'application/json',
                ...endpoint.headers
            }
        };

        if (endpoint.body) {
            options.body = JSON.stringify(endpoint.body);
        }

        const response = await fetch(endpoint.url, options);
        const responseData = await response.json().catch(() => null);
        const isSuccess = response.status >= 200 && response.status < 300;
        
        // Format response headers
        const headers = {};
        response.headers.forEach((value, key) => {
            headers[key] = value;
        });

        // Update response panel
        responseContent.innerHTML = `
            <div class="response-section">
                <h4>Status Code</h4>
                <div class="status-code ${getStatusCodeClass(response.status)}">
                    ${response.status} ${response.statusText}
                </div>
            </div>
            <div class="response-section">
                <h4>Response Headers</h4>
                <pre>${JSON.stringify(headers, null, 2)}</pre>
            </div>
            <div class="response-section">
                <h4>Response Body</h4>
                <pre>${JSON.stringify(responseData, null, 2)}</pre>
            </div>
        `;

        // Show response panel
        responsePanel.classList.add('active');

        // Update Test button if successful
        if (isSuccess) {
            testButton.innerHTML = `<i class="fas fa-check-circle"></i> PASS`;
            testButton.classList.add('success');
            
            // Reset button state after 2 seconds
            setTimeout(() => {
                testButton.innerHTML = '<i class="fas fa-check-circle"></i> Test';
                testButton.classList.remove('success');
            }, 2000);
        } else {
            testButton.innerHTML = `<i class="fas fa-times-circle"></i> FAIL`;
            testButton.classList.add('error');
            
            // Reset button state after 2 seconds
            setTimeout(() => {
                testButton.innerHTML = '<i class="fas fa-check-circle"></i> Test';
                testButton.classList.remove('error');
            }, 2000);
        }
    } catch (error) {
        responseContent.innerHTML = `
            <div class="response-section">
                <h4>Error</h4>
                <pre>${error.message}</pre>
            </div>
        `;
        responsePanel.classList.add('active');
        
        // Update Test button for error
        testButton.innerHTML = `<i class="fas fa-times-circle"></i> FAIL`;
        testButton.classList.add('error');
        
        // Reset button state after 2 seconds
        setTimeout(() => {
            testButton.innerHTML = '<i class="fas fa-check-circle"></i> Test';
            testButton.classList.remove('error');
        }, 2000);
    } finally {
        // Reset button state
        sendButton.disabled = false;
        sendButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send Request';
    }
}

// Render all endpoints
function renderEndpoints() {
    endpointsList.innerHTML = '';
    
    if (endpoints.length === 0) {
        endpointsList.innerHTML = `
            <div class="empty-state">
                <p>No endpoints added yet. Click "Add New Endpoint" to get started!</p>
            </div>
        `;
        return;
    }

    endpoints.forEach(endpoint => {
        const endpointCard = document.createElement('div');
        endpointCard.className = 'endpoint-card';
        endpointCard.setAttribute('data-endpoint-id', endpoint.id);
        
        let headersHtml = '';
        if (Object.keys(endpoint.headers || {}).length > 0) {
            headersHtml = `
                <div class="endpoint-headers">
                    <strong>Headers:</strong>
                    <pre>${JSON.stringify(endpoint.headers, null, 2)}</pre>
                </div>
            `;
        }

        let bodyHtml = '';
        if (endpoint.body) {
            bodyHtml = `
                <div class="endpoint-body">
                    <strong>Request Body:</strong>
                    <pre>${JSON.stringify(endpoint.body, null, 2)}</pre>
                </div>
            `;
        }

        endpointCard.innerHTML = `
            <h3>${endpoint.name}</h3>
            <div class="endpoint-method ${getMethodColorClass(endpoint.method)}">
                ${endpoint.method}
            </div>
            <p>${endpoint.description || 'No description provided'}</p>
            <div class="endpoint-url">
                <strong>URL:</strong> ${endpoint.url}
            </div>
            ${headersHtml}
            ${bodyHtml}
            <div class="endpoint-actions">
                <button class="btn primary send-request" onclick="sendRequest('${endpoint.id}')">
                    <i class="fas fa-paper-plane"></i> Send Request
                </button>
                <button class="btn secondary test-status" onclick="testStatus('${endpoint.id}')">
                    <i class="fas fa-check-circle"></i> Test
                </button>
                <button class="btn secondary" onclick="editEndpoint('${endpoint.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn secondary" onclick="deleteEndpoint('${endpoint.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
            <div class="endpoint-response">
                <!-- Response will be displayed here -->
            </div>
        `;
        endpointsList.appendChild(endpointCard);
    });
}

async function testStatus(endpointId) {
    const endpoint = endpoints.find(e => e.id === endpointId);
    if (!endpoint) return;

    const card = document.querySelector(`[data-endpoint-id="${endpointId}"]`);
    const testButton = card.querySelector('.test-status');
    const responsePanel = document.getElementById('responsePanel');
    const responseContent = document.getElementById('responseContent');
    
    // Show loading state
    testButton.disabled = true;
    testButton.innerHTML = '<span class="loading"></span> Testing...';
    
    try {
        const options = {
            method: endpoint.method,
            headers: {
                'Content-Type': 'application/json',
                ...endpoint.headers
            }
        };

        if (endpoint.body) {
            options.body = JSON.stringify(endpoint.body);
        }

        const response = await fetch(endpoint.url, options);
        const isSuccess = response.status >= 200 && response.status < 300;
        
        // Update response panel with test result
        responseContent.innerHTML = `
            <div class="response-section">
                <h4>Test Result</h4>
                <div class="test-result ${isSuccess ? 'success' : 'error'}">
                    <i class="fas fa-${isSuccess ? 'check-circle' : 'times-circle'}"></i>
                    ${isSuccess ? 'PASS' : 'FAIL'} (Status: ${response.status})
                </div>
            </div>
            <div class="response-section">
                <h4>Response Headers</h4>
                <pre>${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}</pre>
            </div>
        `;

        // Show response panel
        responsePanel.classList.add('active');
        
        // Update button state
        testButton.innerHTML = `<i class="fas fa-${isSuccess ? 'check-circle' : 'times-circle'}"></i> ${isSuccess ? 'PASS' : 'FAIL'}`;
        testButton.classList.add(isSuccess ? 'success' : 'error');
        
        // Reset button state after 2 seconds
        setTimeout(() => {
            testButton.disabled = false;
            testButton.innerHTML = '<i class="fas fa-check-circle"></i> Test';
            testButton.classList.remove('success', 'error');
        }, 2000);
    } catch (error) {
        responseContent.innerHTML = `
            <div class="response-section">
                <h4>Test Result</h4>
                <div class="test-result error">
                    <i class="fas fa-times-circle"></i>
                    FAIL (Error: ${error.message})
                </div>
            </div>
        `;
        responsePanel.classList.add('active');
        
        // Update button state
        testButton.innerHTML = '<i class="fas fa-times-circle"></i> FAIL';
        testButton.classList.add('error');
        
        // Reset button state after 2 seconds
        setTimeout(() => {
            testButton.disabled = false;
            testButton.innerHTML = '<i class="fas fa-check-circle"></i> Test';
            testButton.classList.remove('error');
        }, 2000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Check which page we're on
    const isTesterPage = document.getElementById('endpointsList') !== null;
    const isHomePage = document.getElementById('foldersList') !== null;
    
    if (isTesterPage) {
        // Only initialize the API tester functionality on the tester page
        init();
    } else if (isHomePage) {
        // Initialize home page functionality
        initHomePage();
    }
    
    // Initialize shared functionality (like theme toggle)
    initSharedFunctionality();
});

// Initialize shared functionality across all pages
function initSharedFunctionality() {
    // Theme toggle
    const themeToggleButton = document.getElementById("theme-toggle");
    if (themeToggleButton) {
        const rootElement = document.documentElement;
        
        // Check for saved theme in localStorage
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            rootElement.classList.add(savedTheme);
        }
        
        themeToggleButton.addEventListener("click", () => {
            if (rootElement.classList.contains("dark")) {
                rootElement.classList.remove("dark");
                localStorage.setItem("theme", "");
            } else {
                rootElement.classList.add("dark");
                localStorage.setItem("theme", "dark");
            }
        });
    }
    
    // Clear response button
    const clearButton = document.getElementById("clear-response");
    if (clearButton) {
        clearButton.addEventListener("click", () => {
            const responsePanel = document.querySelector(".response-content");
            if (responsePanel) {
                responsePanel.innerHTML = ""; // Clear the response content
            }
        });
    }
}

// Initialize home page functionality
function initHomePage() {
    console.log('Initializing home page...');
    
    const foldersList = document.getElementById('foldersList');
    const addFolderBtn = document.getElementById('addFolderBtn');
    const folderModal = document.getElementById('folderModal');
    const folderForm = document.getElementById('folderForm');
    const cancelFolderBtn = document.getElementById('cancelFolderBtn');
    
    if (!foldersList || !addFolderBtn) {
        console.warn('Some home page elements missing');
        return;
    }
    
    // Render folders
    renderFolders();
    
    // Add folder button click
    if (addFolderBtn && folderModal) {
        addFolderBtn.addEventListener('click', () => {
            folderModal.classList.add('active');
        });
    }
    
    // Cancel folder button
    if (cancelFolderBtn && folderModal) {
        cancelFolderBtn.addEventListener('click', () => {
            folderModal.classList.remove('active');
        });
    }
    
    // Folder form submission
    if (folderForm) {
        folderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const folderName = document.getElementById('folderName').value.trim();
            const folderDescription = document.getElementById('folderDescription').value.trim();
            
            if (folderName) {
                const folders = JSON.parse(localStorage.getItem('folders')) || [];
                folders.push({
                    name: folderName,
                    description: folderDescription,
                    apis: []
                });
                localStorage.setItem('folders', JSON.stringify(folders));
                
                // Reset form and hide modal
                folderForm.reset();
                if (folderModal) folderModal.classList.remove('active');
                
                // Re-render folders
                renderFolders();
            }
        });
    }
}

// Render folders on the home page
function renderFolders() {
    const foldersList = document.getElementById('foldersList');
    if (!foldersList) return;
    
    const folders = JSON.parse(localStorage.getItem('folders')) || [];
    
    if (folders.length === 0) {
        foldersList.innerHTML = '<p>No folders yet. Add your first folder!</p>';
        return;
    }
    
    foldersList.innerHTML = folders.map((folder, index) => `
        <div class="folder-card">
            <h3>${folder.name}</h3>
            <p>${folder.description || 'No description'}</p>
            <div class="folder-actions">
                <button class="btn primary" onclick="navigateToTester(${index})">View APIs</button>
                <button class="btn secondary" onclick="deleteFolder(${index})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Delete folder
window.deleteFolder = function(index) {
    if (confirm('Are you sure you want to delete this folder?')) {
        const folders = JSON.parse(localStorage.getItem('folders')) || [];
        folders.splice(index, 1);
        localStorage.setItem('folders', JSON.stringify(folders));
        renderFolders();
    }
};


// Export a single endpoint
window.exportEndpoint = (apiIndex) => {
    const api = currentFolder.apis[apiIndex];
    
    if (!api) {
        alert("Endpoint not found!");
        return;
    }
    
    // Create a copy of the API object to export
    const exportData = {
        name: api.name || "Unnamed API",
        method: api.method || "GET",
        url: api.url || "",
        description: api.description || "",
        headers: api.headers || [],
        body: api.body || ""
    };
    
    // Convert to JSON string with pretty formatting
    const jsonData = JSON.stringify(exportData, null, 2);
    
    // Create a blob with the JSON data
    const blob = new Blob([jsonData], { type: "application/json" });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement("a");
    link.href = url;
    
    // Set the filename based on the API name (sanitized)
    const filename = (api.name || "endpoint")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_") + ".json";
    
    link.download = filename;
    
    // Append the link to the document
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Show a success message in the response panel
    const responsePanel = document.getElementById("responsePanel");
    const responseContent = document.getElementById("responseContent");
    
    responsePanel.style.display = "block";
    responseContent.innerHTML = `
        <div class="export-success">
            <i class="fas fa-check-circle"></i>
            <p>Successfully exported endpoint: <strong>${api.name || "Unnamed API"}</strong></p>
            <pre class="export-preview">${escapeHtml(jsonData)}</pre>
        </div>
    `;
};

// Helper function to escape HTML in the response (if not already defined)
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
