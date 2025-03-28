// Mock data for demonstration
const mockData = {
    personas: [
        { id: 1, name: "Tech Lead", industry: "Software", age: "30-40" },
        { id: 2, name: "Marketing Manager", industry: "Retail", age: "25-35" },
        { id: 3, name: "Sales Executive", industry: "Finance", age: "35-45" }
    ],
    canvases: [
        {
            id: 1,
            name: "SaaS Platform",
            lastModified: "2024-02-15",
            content: {
                keyPartners: "Cloud service providers\nTechnology vendors\nMarketing agencies",
                keyActivities: "Software development\nCustomer support\nPlatform maintenance",
                valuePropositions: "Automated workflow\nReal-time analytics\nSeamless integration",
                customerRelationships: "24/7 Support\nPersonal account managers\nOnline community",
                customerSegments: "Small businesses\nEnterprise companies\nFreelancers",
                keyResources: "Development team\nCloud infrastructure\nIntellectual property",
                channels: "Direct sales\nOnline platform\nPartner network",
                costStructure: "Development costs\nServer maintenance\nMarketing expenses",
                revenueStreams: "Subscription fees\nPremium features\nConsulting services"
            }
        },
        {
            id: 2,
            name: "E-commerce Store",
            lastModified: "2024-02-14",
            content: {
                keyPartners: "Suppliers\nShipping companies\nPayment processors",
                keyActivities: "Inventory management\nOrder fulfillment\nCustomer service",
                valuePropositions: "Quality products\nFast shipping\nEasy returns",
                customerRelationships: "Loyalty program\nEmail marketing\nSocial media",
                customerSegments: "Online shoppers\nFashion enthusiasts\nGift buyers",
                keyResources: "Inventory\nWarehouse\nE-commerce platform",
                channels: "Online store\nMobile app\nSocial media",
                costStructure: "Inventory costs\nShipping fees\nMarketing budget",
                revenueStreams: "Product sales\nShipping fees\nAffiliate marketing"
            }
        },
        {
            id: 3,
            name: "Mobile App",
            lastModified: "2024-02-13",
            content: {
                keyPartners: "App stores\nAdvertising networks\nContent providers",
                keyActivities: "App development\nUser engagement\nContent updates",
                valuePropositions: "Unique features\nUser experience\nOffline access",
                customerRelationships: "In-app support\nUser feedback\nRegular updates",
                customerSegments: "Mobile users\nYoung professionals\nTech enthusiasts",
                keyResources: "Development team\nUser data\nBrand identity",
                channels: "App stores\nSocial media\nInfluencer marketing",
                costStructure: "Development\nServer costs\nMarketing",
                revenueStreams: "In-app purchases\nSubscriptions\nAdvertising"
            }
        }
    ]
};

class DashboardManager {
    constructor() {
        // Make instance globally available for event handlers
        window.dashboardManager = this;
        this.data = this.loadStoredData();
        this.initializeEventListeners();
        this.loadDashboardData();
        this.currentCanvasId = null;
        this.initializeStats();
        this.setupTemplateSystem();
        this.setupCanvasSystem();
        this.setupPersonaListeners();
    }

    loadStoredData() {
        const stored = localStorage.getItem('dashboardData');
        const data = stored ? JSON.parse(stored) : {
            personas: mockData.personas,
            canvases: mockData.canvases
        };
        
        // Ensure all personas have createdAt dates
        data.personas = data.personas.map(p => ({
            ...p,
            createdAt: p.createdAt || new Date().toISOString()
        }));
        
        return data;
    }

    saveData() {
        localStorage.setItem('dashboardData', JSON.stringify(this.data));
    }

    initializeEventListeners() {
        document.querySelector('.new-canvas-btn')?.addEventListener('click', () => this.openCanvasModal());
        document.querySelector('.close-modal')?.addEventListener('click', () => this.closeCanvasModal());
        document.querySelector('.new-persona-btn')?.addEventListener('click', () => {
            window.location.href = 'create.html';
        });

        // Add navigation handlers
        document.querySelectorAll('.dashboard-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(e.target.getAttribute('href').substring(1));
            });
        });

        // Add canvas save functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('save-canvas')) {
                this.saveCurrentCanvas();
            } else if (e.target.classList.contains('delete-canvas')) {
                this.deleteCanvas(this.currentCanvasId);
            } else if (e.target.classList.contains('edit-persona')) {
                this.editPersona(e.target.dataset.id);
            } else if (e.target.classList.contains('delete-persona')) {
                this.deletePersona(e.target.dataset.id);
            }
        });

        // Add section navigation
        const sections = ['overview', 'personas', 'canvas', 'templates'];
        sections.forEach(section => {
            const link = document.querySelector(`[href="#${section}"]`);
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleNavigation(section);
                });
            }
        });

        // Initialize all sections
        sections.forEach(section => {
            const sectionElement = document.getElementById(`${section}-section`);
            if (sectionElement) {
                if (section === 'overview') {
                    sectionElement.style.display = 'block';
                } else {
                    sectionElement.style.display = 'none';
                }
            }
        });

        // Add stats refresh
        this.initializeStats();

        // Add canvas grid view handlers
        const canvasSection = document.getElementById('canvas-section');
        if (canvasSection) {
            this.renderCanvasGrid(canvasSection);
        }

        // Add templates handlers
        const templatesSection = document.getElementById('templates-section');
        if (templatesSection) {
            this.renderTemplatesGrid(templatesSection);
        }
    }

    handleNavigation(section) {
        document.querySelectorAll('.dashboard-section').forEach(s => s.style.display = 'none');
        document.getElementById(section + '-section').style.display = 'block';

        document.querySelectorAll('.dashboard-nav a').forEach(a => a.classList.remove('active'));
        document.querySelector(`[href="#${section}"]`).classList.add('active');
    }

    loadDashboardData() {
        this.renderRecentPersonas();
        this.renderBusinessCanvases();
        this.updateStats();
    }

    renderRecentPersonas() {
        const container = document.getElementById('recentPersonas');
        const personasGrid = document.querySelector('.personas-grid');
        if (!container || !personasGrid) return;

        // Sort personas by creation date
        const sortedPersonas = [...this.data.personas]
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        // Render recent personas (top 5)
        container.innerHTML = sortedPersonas
            .slice(0, 5)
            .map(persona => this.createPersonaCard(persona, true))
            .join('');

        // Render all personas in the personas grid
        personasGrid.innerHTML = sortedPersonas
            .map(persona => this.createPersonaCard(persona, false))
            .join('');
    }

    createPersonaCard(persona, isCompact) {
        return `
            <div class="persona-item ${isCompact ? 'compact' : 'full'}">
                <div class="persona-info">
                    <h4>${persona.name || 'Unnamed Persona'}</h4>
                    <p>${persona.industry || 'No Industry'} | ${persona.age || 'No Age Range'}</p>
                    ${!isCompact ? `
                        <div class="persona-details">
                            <p><strong>Role:</strong> ${persona.role || 'Not specified'}</p>
                            <p><strong>Goals:</strong> ${Array.isArray(persona.goals) ? persona.goals.join(', ') : 'None specified'}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="persona-actions">
                    <button class="edit-persona" onclick="window.dashboardManager.editPersona(${persona.id})">
                        <i class="ph ph-pencil"></i>
                    </button>
                    <button class="delete-persona" onclick="window.dashboardManager.deletePersona(${persona.id})">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderBusinessCanvases() {
        const container = document.getElementById('businessCanvases');
        if (!container) return;

        const html = this.data.canvases.map(canvas => `
            <div class="canvas-item">
                <h4>${canvas.name}</h4>
                <div class="canvas-actions">
                    <button class="view-canvas" data-id="${canvas.id}">View</button>
                    <button class="delete-canvas" data-id="${canvas.id}">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;

        // Add event listeners to view buttons
        container.querySelectorAll('.view-canvas').forEach(btn => {
            btn.addEventListener('click', () => this.openCanvasModal(btn.dataset.id));
        });
    }

    openCanvasModal(canvasId = null) {
        this.currentCanvasId = canvasId;
        const modal = document.getElementById('canvasModal');
        modal.classList.add('active');

        const modalContent = modal.querySelector('.modal-content');
        const canvas = canvasId ? this.data.canvases.find(c => c.id === Number(canvasId)) : null;

        modalContent.innerHTML = `
            <div class="modal-header">
                <div class="modal-title">
                    <h2>${canvasId ? canvas.name : 'New'} Business Model Canvas</h2>
                    <span class="last-modified">${canvas ? `Last modified: ${canvas.lastModified}` : 'Draft'}</span>
                </div>
                <div class="modal-actions">
                    <button class="analyze-canvas" title="Analyze with AI"><i class="ph ph-brain"></i> AI Analysis</button>
                    <button class="save-canvas">Save</button>
                    <button class="close-modal" onclick="document.getElementById('canvasModal').classList.remove('active')">&times;</button>
                </div>
            </div>
            <div class="canvas-grid">
                ${this.getCanvasTemplate()}
            </div>
            <div class="ai-assistant">
                <div class="ai-header">
                    <h3><i class="ph ph-robot"></i> AI Assistant</h3>
                    <button class="close-ai">&times;</button>
                </div>
                <div class="ai-messages"></div>
                <div class="ai-input">
                    <input type="text" placeholder="Ask about this canvas...">
                    <button><i class="ph ph-paper-plane-right"></i></button>
                </div>
            </div>
        `;

        if (canvas?.content) {
            this.loadCanvasContent(canvas.content, modalContent);
        }

        this.setupCanvasEventListeners(modalContent);
    }

    loadCanvasContent(content, container) {
        Object.entries(content).forEach(([key, value]) => {
            const section = container.querySelector(`[data-section="${key}"]`);
            if (section) {
                // Clear existing content first
                section.innerHTML = '';

                // Create content container
                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                section.appendChild(contentContainer);

                // Add items
                const items = value.split('\n').filter(item => item.trim());
                contentContainer.innerHTML = items.map(item => this.createCanvasItem(item)).join('');

                // Add button with counter
                const addButton = document.createElement('button');
                addButton.className = 'add-item-btn';
                addButton.innerHTML = `<i class="ph ph-plus"></i> Add Item <span class="item-count">${items.length}</span>`;
                section.appendChild(addButton);

                this.setupDragAndDrop(contentContainer);

                // Update item count when items change
                this.updateSectionItemCount(section);
            }
        });
    }

    createCanvasItem(text) {
        return `
            <div class="canvas-item" draggable="true">
                <span class="item-text">${text}</span>
                <div class="item-actions">
                    <button class="edit-item" title="Edit"><i class="ph ph-pencil"></i></button>
                    <button class="delete-item" title="Delete"><i class="ph ph-trash"></i></button>
                </div>
            </div>
        `;
    }

    setupCanvasEventListeners(container) {
        const aiButton = container.querySelector('.analyze-canvas');
        const aiAssistant = container.querySelector('.ai-assistant');
        const closeAiBtn = container.querySelector('.close-ai');
        const aiInput = container.querySelector('.ai-input input');
        const aiSendButton = container.querySelector('.ai-input button');

        // Initialize AI Assistant state
        aiAssistant.style.display = 'none';

        // AI Button Click Handler
        aiButton?.addEventListener('click', () => {
            aiAssistant.style.display = aiAssistant.style.display === 'none' ? 'flex' : 'none';
            if (aiAssistant.style.display === 'flex') {
                this.initializeAIAssistant(aiAssistant);
            }
        });

        // Close Button Handler
        closeAiBtn?.addEventListener('click', () => {
            aiAssistant.style.display = 'none';
        });

        // AI Input Handlers
        if (aiInput && aiSendButton) {
            const handleInput = () => {
                if (aiInput.value.trim()) {
                    this.handleAIQuery(aiInput.value, container);
                }
            };

            aiSendButton.addEventListener('click', handleInput);
            aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleInput();
            });
        }

        // Setup sections
        container.querySelectorAll('.canvas-content').forEach(section => {
            this.setupSectionEditing(section);
        });
    }

    setupSectionEditing(section) {
        // Only setup if not already initialized
        if (!section.querySelector('.content-container')) {
            // Create content container
            const contentContainer = document.createElement('div');
            contentContainer.className = 'content-container';
            section.appendChild(contentContainer);

            // Add single add item button
            const addButton = document.createElement('button');
            addButton.className = 'add-item-btn';
            addButton.innerHTML = '<i class="ph ph-plus"></i> Add Item';
            section.appendChild(addButton);
        }

        // Event handlers
        section.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            if (target.classList.contains('edit-item')) {
                this.editCanvasItem(target.closest('.canvas-item'));
            } else if (target.classList.contains('delete-item')) {
                this.deleteCanvasItem(target.closest('.canvas-item'));
            } else if (target.classList.contains('add-item-btn')) {
                const contentContainer = section.querySelector('.content-container');
                this.addCanvasItem(contentContainer);
            }
        });
    }

    setupDragAndDrop(section) {
        const items = section.querySelectorAll('.canvas-item');

        items.forEach(item => {
            item.addEventListener('dragstart', e => {
                item.classList.add('dragging');
                e.dataTransfer.setData('text/plain', '');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });

        section.addEventListener('dragover', e => {
            e.preventDefault();
            const draggable = document.querySelector('.dragging');
            const afterElement = this.getDragAfterElement(section, e.clientY);

            if (afterElement) {
                section.insertBefore(draggable, afterElement);
            } else {
                section.appendChild(draggable);
            }
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.canvas-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    editCanvasItem(item) {
        const text = item.querySelector('.item-text');
        const input = document.createElement('input');
        input.type = 'text';
        input.value = text.textContent;
        input.className = 'edit-input';

        text.replaceWith(input);
        input.focus();

        const saveEdit = () => {
            text.textContent = input.value;
            input.replaceWith(text);
            this.saveCurrentCanvas(false);
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                saveEdit();
            }
        });
    }

    deleteCanvasItem(item) {
        if (confirm('Delete this item?')) {
            const section = item.closest('.canvas-section');
            item.remove();

            // Update item count
            this.updateSectionItemCount(section);

            this.saveCurrentCanvas(false);
        }
    }

    addCanvasItem(container) {
        const newItem = prompt('Enter new item:');
        if (newItem?.trim()) {
            const itemElement = document.createElement('div');
            itemElement.innerHTML = this.createCanvasItem(newItem);
            container.appendChild(itemElement.firstElementChild);
            this.setupDragAndDrop(container);

            // Update item count in the section
            this.updateSectionItemCount(container.closest('.canvas-section'));

            this.saveCurrentCanvas(false);
        }
    }

    initializeAIAssistant(container) {
        const messages = container.querySelector('.ai-messages');
        messages.innerHTML = `
            <div class="ai-message">
                I can help you analyze and improve your business model canvas.
                Ask me about specific sections or general improvements!
            </div>
        `;
    }

    handleAIQuery(query, container) {
        const messages = container.querySelector('.ai-messages');
        const aiInput = container.querySelector('.ai-input input');

        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'message user-message';
        userMsg.textContent = query;
        messages.appendChild(userMsg);

        // Add loading message
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'message ai-message loading';
        loadingMsg.textContent = 'Analyzing...';
        messages.appendChild(loadingMsg);

        messages.scrollTop = messages.scrollHeight;

        // Get response
        setTimeout(() => {
            const response = this.generateAIResponse(query);
            loadingMsg.textContent = response;
            loadingMsg.classList.remove('loading');
            messages.scrollTop = messages.scrollHeight;
        }, 1000);

        aiInput.value = '';
    }

    generateAIResponse(query) {
        const canvas = this.currentCanvasId ?
            this.data.canvases.find(c => c.id === Number(this.currentCanvasId)) : null;

        if (!canvas) return "Please save your canvas first for detailed analysis.";

        // Simple response generation based on query keywords
        if (query.toLowerCase().includes('revenue')) {
            return `Based on your revenue streams (${canvas.content.revenueStreams}),
                    you might want to consider diversifying your income sources.`;
        } else if (query.toLowerCase().includes('customer')) {
            return `Your customer segments (${canvas.content.customerSegments})
                    align well with your value propositions. Consider expanding to related segments.`;
        }

        return `I analyzed your canvas and noticed potential opportunities in customer relationships
                and key partnerships. Would you like me to elaborate on any specific section?`;
    }

    saveCurrentCanvas(showPrompt = true) {
        let name = this.currentCanvasId ?
            this.data.canvases.find(c => c.id === Number(this.currentCanvasId))?.name :
            'New Canvas';

        if (showPrompt) {
            const newName = prompt('Enter canvas name:', name);
            if (!newName) return;
            name = newName;
        }

        const canvasContent = {};
        document.querySelectorAll('.canvas-content').forEach(section => {
            const items = [...section.querySelectorAll('.item-text')]
                .map(item => item.textContent.trim())
                .filter(Boolean);
            canvasContent[section.dataset.section] = items.join('\n');
        });

        if (this.currentCanvasId) {
            const index = this.data.canvases.findIndex(c => c.id === Number(this.currentCanvasId));
            if (index !== -1) {
                this.data.canvases[index] = {
                    ...this.data.canvases[index],
                    name,
                    content: canvasContent,
                    lastModified: new Date().toISOString().split('T')[0]
                };
            }
        } else {
            const newCanvas = {
                id: Date.now(),
                name,
                lastModified: new Date().toISOString().split('T')[0],
                content: canvasContent
            };
            this.data.canvases.unshift(newCanvas);
        }

        this.saveData();
        this.renderBusinessCanvases();
        if (showPrompt) {
            this.closeCanvasModal();
        }
    }

    deleteCanvas(canvasId) {
        if (confirm('Are you sure you want to delete this canvas?')) {
            this.data.canvases = this.data.canvases.filter(c => c.id !== Number(canvasId));
            this.saveData();
            this.renderBusinessCanvases();
        }
    }

    editPersona(personaId) {
        window.location.href = `create.html?edit=${personaId}`;
    }

    deletePersona(personaId) {
        if (confirm('Are you sure you want to delete this persona?')) {
            this.data.personas = this.data.personas.filter(p => p.id !== Number(personaId));
            this.saveData();
            this.renderRecentPersonas();
            this.updateStats();
        }
    }

    getCanvasTemplate() {
        return `
        <div class="canvas-section key-partners">
            <h4>Key Partners <span class="section-tip" title="Who helps you?">?</span></h4>
            <div class="canvas-content" contenteditable="true" data-section="keyPartners"></div>
        </div>
        <div class="canvas-section key-activities">
            <h4>Key Activities <span class="section-tip" title="What do you do?">?</span></h4>
            <div class="canvas-content" contenteditable="true" data-section="keyActivities"></div>
        </div>
        <div class="canvas-section value-propositions">
            <h4>Value Propositions <span class="section-tip" title="How do you help?">?</span></h4>
            <div class="canvas-content" contenteditable="true" data-section="valuePropositions"></div>
        </div>
        <div class="canvas-section customer-relationships">
            <h4>Customer Relationships <span class="section-tip" title="How do you interact?">?</span></h4>
            <div class="canvas-content" contenteditable="true" data-section="customerRelationships"></div>
        </div>
        <div class="canvas-section customer-segments">
            <h4>Customer Segments <span class="section-tip" title="Who do you help?">?</span></h4>
            <div class="canvas-content" contenteditable="true" data-section="customerSegments"></div>
        </div>
        <div class="canvas-section key-resources">
            <h4>Key Resources <span class="section-tip" title="What do you need?">?</span></h4>
            <div class="canvas-content" contenteditable="true" data-section="keyResources"></div>
        </div>
        <div class="canvas-section channels">
            <h4>Channels <span class="section-tip" title="How do you reach customers?">?</span></h4>
            <div class="canvas-content" contenteditable="true" data-section="channels"></div>
        </div>
        <div class="canvas-section cost-structure">
            <h4>Cost Structure <span class="section-tip" title="What do you spend?">?</span></h4>
            <div class="canvas-content" contenteditable="true" data-section="costStructure"></div>
        </div>
        <div class="canvas-section revenue-streams">
            <h4>Revenue Streams <span class="section-tip" title="How do you earn?">?</span></h4>
            <div class="canvas-content" contenteditable="true" data-section="revenueStreams"></div>
        </div>
    `;
    }

    initializeStats() {
        const stats = {
            personas: this.data.personas.length,
            canvases: this.data.canvases.length,
            projects: this.data.personas.length + this.data.canvases.length
        };

        document.querySelectorAll('.stat-number').forEach(stat => {
            const type = stat.nextElementSibling.textContent.toLowerCase();
            stat.textContent = stats[type] || 0;
        });
    }

    renderCanvasGrid(container) {
        const grid = container.querySelector('.canvas-grid-full') || container;
        grid.innerHTML = this.data.canvases.map(canvas => `
            <div class="canvas-item">
                <div class="canvas-preview">
                    <h4>${canvas.name}</h4>
                    <p>Last modified: ${canvas.lastModified}</p>
                    <div class="canvas-stats">
                        <span>${Object.keys(canvas.content).length} sections</span>
                        <span>${this.countCanvasItems(canvas)} items</span>
                    </div>
                </div>
                <div class="canvas-actions">
                    <button class="view-canvas" data-id="${canvas.id}">
                        <i class="ph ph-eye"></i> View
                    </button>
                    <button class="duplicate-canvas" data-id="${canvas.id}">
                        <i class="ph ph-copy"></i>
                    </button>
                    <button class="delete-canvas" data-id="${canvas.id}">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        this.attachCanvasHandlers(grid);
    }

    countCanvasItems(canvas) {
        return Object.values(canvas.content)
            .reduce((count, section) => count + section.split('\n').filter(Boolean).length, 0);
    }

    renderTemplatesGrid(container) {
        const templates = this.getTemplates();
        container.innerHTML = templates.map(template => `
            <div class="template-card">
                <h4>${template.name}</h4>
                <p>${template.description}</p>
                <button class="use-template-btn" data-template="${template.id}">
                    <i class="ph ph-copy"></i> Use Template
                </button>
            </div>
        `).join('');

        // Add click handlers for template buttons
        container.querySelectorAll('.use-template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const templateId = btn.dataset.template;
                const template = templates.find(t => t.id === templateId);
                if (template) {
                    this.applyTemplate(template);
                }
            });
        });
    }

    getTemplates() {
        return [
            {
                id: 'startup',
                name: 'Tech Startup',
                description: 'Perfect for software and technology startups',
                content: {
                    keyPartners: 'Cloud Providers\nTech Vendors',
                    keyActivities: 'Product Development\nCustomer Support',
                    valuePropositions: 'Innovative Solution\nSeamless Integration',
                    customerRelationships: 'Self Service\nAutomated Support',
                    customerSegments: 'Tech Companies\nStartups',
                    keyResources: 'Development Team\nIPR',
                    channels: 'Website\nApp Store',
                    costStructure: 'Development\nMarketing',
                    revenueStreams: 'Subscriptions\nPremium Features'
                }
            },
            {
                id: 'retail',
                name: 'Retail Business',
                description: 'Ideal for retail and e-commerce businesses',
                content: {
                    keyPartners: 'Suppliers\nLogistics Partners',
                    keyActivities: 'Inventory Management\nCustomer Service',
                    valuePropositions: 'Quality Products\nFast Delivery',
                    customerRelationships: 'Personal Service\nLoyalty Programs',
                    customerSegments: 'Online Shoppers\nRetail Customers',
                    keyResources: 'Inventory\nWarehouses',
                    channels: 'Online Store\nRetail Locations',
                    costStructure: 'Inventory\nStaff\nRent',
                    revenueStreams: 'Product Sales\nDelivery Fees'
                }
            }
        ];
    }

    applyTemplate(template) {
        this.openCanvasModal();
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            this.loadCanvasContent(template.content, modalContent);
        }
        this.currentCanvasId = null; // Force save as new
    }

    attachCanvasHandlers(container) {
        container.querySelectorAll('.view-canvas').forEach(btn => {
            btn.addEventListener('click', () => this.openCanvasModal(btn.dataset.id));
        });

        container.querySelectorAll('.duplicate-canvas').forEach(btn => {
            btn.addEventListener('click', () => this.duplicateCanvas(btn.dataset.id));
        });

        container.querySelectorAll('.delete-canvas').forEach(btn => {
            btn.addEventListener('click', () => this.deleteCanvas(btn.dataset.id));
        });
    }

    duplicateCanvas(canvasId) {
        const original = this.data.canvases.find(c => c.id === Number(canvasId));
        if (original) {
            const duplicate = {
                ...original,
                id: Date.now(),
                name: `${original.name} (Copy)`,
                lastModified: new Date().toISOString().split('T')[0]
            };
            this.data.canvases.unshift(duplicate);
            this.saveData();
            this.renderBusinessCanvases();
            this.initializeStats();
        }
    }

    closeCanvasModal() {
        const modal = document.getElementById('canvasModal');
        if (modal) {
            modal.classList.remove('active');
            const aiAssistant = modal.querySelector('.ai-assistant');
            if (aiAssistant) {
                aiAssistant.style.display = 'none';
            }
        }
    }

    updateSectionItemCount(section) {
        const container = section.querySelector('.content-container');
        const countSpan = section.querySelector('.item-count');
        const items = container.querySelectorAll('.canvas-item').length;

        if (countSpan) {
            countSpan.textContent = items;
        } else {
            const addButton = section.querySelector('.add-item-btn');
            if (addButton) {
                // Create count span if it doesn't exist
                const newCount = document.createElement('span');
                newCount.className = 'item-count';
                newCount.textContent = items;
                addButton.appendChild(newCount);
            }
        }
    }

    setupTemplateSystem() {
        const templates = {
            startup: { name: 'Tech Startup', sections: ['Product Development', 'Market Research'] },
            enterprise: { name: 'Enterprise', sections: ['Corporate Strategy', 'Operations'] },
            retail: { name: 'Retail Business', sections: ['Store Operations', 'Inventory'] }
        };

        const container = document.querySelector('.templates-grid');
        if (container) {
            container.innerHTML = Object.entries(templates).map(([key, template]) => `
                <div class="template-card">
                    <h4>${template.name}</h4>
                    <p>${template.sections.join(', ')}</p>
                    <button class="use-template" data-template="${key}">Use Template</button>
                </div>
            `).join('');
        }
    }

    setupCanvasSystem() {
        // Add canvas drag and drop
        document.querySelectorAll('.canvas-section').forEach(section => {
            section.addEventListener('dragover', e => {
                e.preventDefault();
                const dragging = document.querySelector('.dragging');
                if (dragging) {
                    const afterElement = this.getDragAfterElement(section, e.clientY);
                    section.insertBefore(dragging, afterElement);
                }
            });
        });

        // Add item editing
        document.addEventListener('dblclick', e => {
            const item = e.target.closest('.canvas-item');
            if (item) {
                this.editItem(item);
            }
        });
    }

    editItem(item) {
        const text = item.querySelector('.item-text');
        const input = document.createElement('input');
        input.type = 'text';
        input.value = text.textContent;
        input.classList.add('edit-input');

        text.replaceWith(input);
        input.focus();

        input.addEventListener('blur', () => {
            text.textContent = input.value;
            input.replaceWith(text);
            this.saveCanvas();
        });
    }

    saveCanvas() {
        // Save current canvas state
        const canvas = {
            sections: {},
            lastModified: new Date().toISOString()
        };

        document.querySelectorAll('.canvas-section').forEach(section => {
            const items = Array.from(section.querySelectorAll('.canvas-item'))
                .map(item => item.textContent);
            canvas.sections[section.dataset.section] = items;
        });

        // Save to localStorage
        localStorage.setItem('currentCanvas', JSON.stringify(canvas));
    }

    updateStats() {
        const stats = {
            personas: this.data.personas.length,
            canvases: this.data.canvases.length,
            completed: this.data.canvases.filter(c => this.isCanvasComplete(c)).length
        };

        document.querySelectorAll('.stat-number').forEach(stat => {
            const key = stat.dataset.stat;
            if (key in stats) {
                stat.textContent = stats[key];
            }
        });
    }

    isCanvasComplete(canvas) {
        return Object.values(canvas.content).every(section => section.trim().length > 0);
    }

    setupPersonaListeners() {
        // Listen for persona storage changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'dashboardData') {
                this.data = JSON.parse(e.newValue || '{}');
                this.renderRecentPersonas();
                this.updateStats();
            }
        });

        // Check URL for new persona data
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('newPersona')) {
            try {
                const newPersonaData = JSON.parse(decodeURIComponent(urlParams.get('newPersona')));
                this.addNewPersona(newPersonaData);
                // Clear URL parameters after processing
                window.history.replaceState({}, '', window.location.pathname);
            } catch (e) {
                console.error('Error processing new persona data:', e);
            }
        }
    }

    addNewPersona(personaData) {
        const newPersona = {
            id: Date.now(),
            ...personaData,
            createdAt: new Date().toISOString()
        };

        this.data.personas.unshift(newPersona);
        this.saveData();
        this.renderRecentPersonas();
        this.updateStats();
        
        // Switch to personas tab if we're adding a new persona
        this.handleNavigation('personas');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});
