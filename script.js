import { personaTemplates } from './templates.js';

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('create.html')) {
        initCreatePage();
    } else if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        initHomePage();
    }
});

function initCreatePage() {
    const messagesContainer = document.getElementById('ai-messages');
    const userInput = document.getElementById('user-message');
    const sendButton = document.getElementById('send-message');
    const personaCreator = new PersonaCreator();
    const newPersonaBtn = document.querySelector('.new-persona-btn');
    const exportBtns = document.querySelectorAll('.export-btn');

    // Initial greeting
    setTimeout(() => {
        addMessage('ai', "Hello! I'm your AI assistant. Type 'create persona' to get started!");
    }, 500);

    function addMessage(type, text) {
        if (type === 'ai') {
            showTyping();
        }
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${type}-message`);
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function handleUserMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage('user', message);
        userInput.value = '';

        if (message.toLowerCase() === 'create persona') {
            const response = personaCreator.start();
            setTimeout(() => addMessage('ai', response), 500);
        } else if (personaCreator.isCreating) {
            const response = personaCreator.processAnswer(message);
            setTimeout(() => addMessage('ai', response), 500);
        } else {
            handleAIResponse(message);
        }
    }

    function handleAIResponse(message) {
        let response;
        if (message.toLowerCase().includes('export')) {
            response = "You can use the export buttons below the persona to save it in different formats.";
        } else if (message.toLowerCase().includes('template')) {
            response = "Would you like to start with a business or consumer template? Type 'create persona' to begin.";
        } else {
            response = "I can help you create a persona. Type 'create persona' to start!";
        }
        setTimeout(() => addMessage('ai', response), 500);
    }

    // Event listeners
    sendButton.addEventListener('click', handleUserMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserMessage();
    });

    newPersonaBtn.addEventListener('click', () => {
        document.getElementById('persona-result').innerHTML = '';
        addMessage('ai', "Let's create a new persona! Type 'create persona' to start.");
    });

    exportBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const format = btn.classList.contains('html-export') ? 'html' :
                         btn.classList.contains('json-export') ? 'json' : 'pdf';
            exportPersona(format);
        });
    });

    // Template handling
    const templateMenu = document.getElementById('template-menu');
    const templateList = document.getElementById('template-list');
    const showTemplates = document.getElementById('show-templates');
    let activeCategory = 'business';

    function loadTemplates(category) {
        const templates = personaTemplates[category].templates;
        templateList.innerHTML = templates.map(template => `
            <div class="template-item" data-template="${template.name}">
                <h4>${template.name}</h4>
                <p>${template.defaults.industry}</p>
                <button class="use-template-btn">Use Template</button>
            </div>
        `).join('');
    }

    showTemplates.addEventListener('click', () => {
        templateMenu.classList.toggle('active');
        loadTemplates(activeCategory);
    });

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.category-btn.active').classList.remove('active');
            btn.classList.add('active');
            activeCategory = btn.dataset.category;
            loadTemplates(activeCategory);
        });
    });

    templateList.addEventListener('click', (e) => {
        const useTemplateBtn = e.target.closest('.use-template-btn');
        if (!useTemplateBtn) return;

        const templateName = useTemplateBtn.closest('.template-item').dataset.template;
        const template = personaTemplates[activeCategory].templates
            .find(t => t.name === templateName);

        if (template) {
            personaCreator.loadTemplate(template.defaults);
            templateMenu.classList.remove('active');
            addMessage('ai', `Using the ${templateName} template. Let's customize it for your needs!`);
        }
    });

    // Quick action handlers
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.closest('.quick-action-btn').dataset.action;
            switch(action) {
                case 'create':
                    handleUserMessage('create persona');
                    break;
                case 'template':
                    templateMenu.classList.toggle('active');
                    loadTemplates(activeCategory);
                    break;
                case 'help':
                    addMessage('ai', `Here's how to use the persona creator:
                    1. Type 'create persona' or click the Create New button
                    2. Answer the questions about your target audience
                    3. Use templates for quick starts
                    4. Export your persona when finished`);
                    break;
            }
        });
    });

    // Handle all action buttons
    function initButtons() {
        // Header navigation
        document.querySelector('.logo').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // Template buttons in header
        const templateBtn = document.querySelector('.template-btn');
        templateBtn?.addEventListener('click', () => {
            templateMenu.classList.toggle('active');
            loadTemplates(activeCategory);
        });

        // New persona button
        const newBtn = document.querySelector('.new-persona-btn');
        newBtn?.addEventListener('click', () => {
            document.getElementById('persona-result').innerHTML = `
                <div class="empty-state">
                    <i class="ph ph-user-circle"></i>
                    <h3>Start New Persona</h3>
                    <p>Type 'create persona' or use a template</p>
                </div>
            `;
            personaCreator.reset();
            addMessage('ai', "Let's create a new persona! Type 'create persona' to start.");
        });

        // Export buttons
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = btn.classList.contains('html-export') ? 'html' :
                             btn.classList.contains('json-export') ? 'json' : 'pdf';
                if (!document.querySelector('.persona-dashboard')) {
                    addMessage('ai', 'Create a persona first before exporting!');
                    return;
                }
                exportPersona(format);
                updateLastUpdated();
            });
        });

        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                handleQuickAction(action);
            });
        });
    }

    function handleQuickAction(action) {
        switch(action) {
            case 'create':
                userInput.value = 'create persona';
                handleUserMessage();
                break;
            case 'template':
                templateMenu.classList.toggle('active');
                loadTemplates(activeCategory);
                break;
            case 'help':
                addMessage('ai', `Here's how to use the persona creator:
                    1. Type 'create persona' or click Create New
                    2. Answer questions about your target audience
                    3. Use templates for quick starts
                    4. Export your finished persona`);
                break;
        }
    }

    function updateLastUpdated() {
        const timeElement = document.querySelector('.last-updated time');
        if (timeElement) {
            timeElement.textContent = new Date().toLocaleTimeString();
        }
    }

    // Initialize buttons
    initButtons();
}

function initHomePage() {
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            window.location.href = 'create.html';
        });
    }
}

class PersonaCreator {
    constructor() {
        this.currentStep = 'initial';
        this.responses = {};
        this.isCreating = false;
    }

    start() {
        this.isCreating = true;
        this.currentStep = 'initial';
        this.responses = {};
        return personaQuestions[this.currentStep].question;
    }

    processAnswer(answer) {
        if (!this.isCreating) return null;

        this.responses[this.currentStep] = answer;
        const nextStep = personaQuestions[this.currentStep].next;

        if (nextStep) {
            this.currentStep = nextStep;
            return personaQuestions[nextStep].question;
        } else {
            this.isCreating = false;
            return this.generatePersona();
        }
    }

    generatePersona() {
        const persona = {
            industry: this.responses.initial,
            role: this.responses.role,
            age: this.responses.age,
            goals: this.responses.goals.split(',').map(g => g.trim()),
            challenges: this.responses.challenges.split(',').map(c => c.trim()),
            decisionMaking: this.responses.behaviour
        };

        this.displayPersona(persona);
        return "I've created your persona! Would you like to export it or create another one?";
    }

    displayPersona(persona) {
        const personaResult = document.getElementById('persona-result');
        if (!personaResult) return;

        personaResult.innerHTML = `
            <div class="persona-dashboard">
                <div class="persona-header">
                    <div class="persona-avatar">${persona.role[0]}</div>
                    <div>
                        <h3>${persona.role}</h3>
                        <p>${persona.industry}</p>
                    </div>
                </div>
                <div class="persona-stats">
                    <div class="stat-card">
                        <h4>Age Range</h4>
                        <p>${persona.age}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Industry</h4>
                        <p>${persona.industry}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Decision Making</h4>
                        <p>${persona.decisionMaking}</p>
                    </div>
                </div>
                <div class="persona-details">
                    <div>
                        <h4>Goals</h4>
                        <ul>
                            ${persona.goals.map(goal => `<li>${goal}</li>`).join('')}
                        </ul>
                    </div>
                    <div>
                        <h4>Challenges</h4>
                        <ul>
                            ${persona.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    loadTemplate(defaults) {
        this.responses = {
            initial: defaults.industry,
            role: defaults.role || 'Professional',
            age: defaults.ageRange,
            goals: defaults.goals.join(', '),
            challenges: defaults.challenges.join(', '),
            behaviour: defaults.decisionMaking || 'Data-driven'
        };
        this.generatePersona();
    }

    reset() {
        this.currentStep = 'initial';
        this.responses = {};
        this.isCreating = false;
    }
}

function exportPersona(format = 'html') {
    const personaData = document.querySelector('.persona-dashboard');
    if (!personaData) {
        alert("No persona to export yet. Create one first!");
        return;
    }

    const exportOptions = {
        html: () => new Blob([personaData.outerHTML], { type: 'text/html' }),
        json: () => {
            const data = extractPersonaData(personaData);
            return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        },
        pdf: () => {
            alert('PDF export coming soon!');
            return null;
        }
    };

    const blob = exportOptions[format]();
    if (!blob) return;

    downloadFile(blob, `persona.${format}`);
}

function extractPersonaData(element) {
    return {
        role: element.querySelector('h3').textContent,
        industry: element.querySelector('.persona-header p').textContent,
        stats: Array.from(element.querySelectorAll('.stat-card')).map(card => ({
            label: card.querySelector('h4').textContent,
            value: card.querySelector('p').textContent
        })),
        goals: Array.from(element.querySelectorAll('.persona-details ul')[0].children)
            .map(li => li.textContent),
        challenges: Array.from(element.querySelectorAll('.persona-details ul')[1].children)
            .map(li => li.textContent)
    };
}

function downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

const personaQuestions = {
    initial: {
        question: "Hi! I'll help you create a persona. What industry are you creating this persona for?",
        next: "role"
    },
    role: {
        question: "What role or position should this persona have?",
        next: "age"
    },
    age: {
        question: "What age range are you targeting? (e.g., 25-35)",
        next: "goals"
    },
    goals: {
        question: "What are their main goals or objectives?",
        next: "challenges"
    },
    challenges: {
        question: "What challenges do they face in their role?",
        next: "behaviour"
    },
    behaviour: {
        question: "How do they typically make decisions?",
        next: null
    }
};

// Add typing indicator functionality
function showTyping() {
    const indicator = document.querySelector('.typing-indicator');
    indicator.classList.add('active');
    setTimeout(() => indicator.classList.remove('active'), 2000);
}
