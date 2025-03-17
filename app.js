// app.js
class ShoppingListManager {
    constructor() {
        this.storage = {
            templates: localforage.createInstance({ name: "shoppingListTemplates" }),
            lists: localforage.createInstance({ name: "shoppingLists" })
        };
        
        this.init();
    }


   // new method to init example data
	//The example data should now appear because:

    //On first run, it checks if the data is initialized
	//If not, it creates the example data
	//Then displays it using your existing display methods

    async initializeExampleData() {
    
    // Example templates with ID and Item
    const exampleTemplates = [
        {
            id: 'template_1',
            name: 'Weekly Groceries',
            items: [
                { id: 1, item: 'Milk' },
                { id: 2, item: 'Bread' },
                { id: 3, item: 'Eggs' }
            ],
            createdAt: Date.now()
        },
        {
            id: 'template_2',
            name: 'Monthly Household Items',
            items: [
                { id: 1, item: 'Paper Towels' },
                { id: 2, item: 'Trash Bags' }
            ],
            createdAt: Date.now()
        }
    ];

    // Example active lists
    const exampleLists = [
        {
            id: 'list_1',
            name: 'Weekly Groceries - Jan 15, 2024',
            templateId: 'template_1',
            items: [
                { id: 1, item: 'Milk', quantity: 1, inBasket: false },
                { id: 2, item: 'Bread', quantity: 1, inBasket: false },
                { id: 3, item: 'Eggs', quantity: 1, inBasket: false }
            ],
            createdAt: new Date('2024-01-15').getTime()
        },
        {
            id: 'list_2',
            name: 'Monthly Household Items - January',
            templateId: 'template_2',
            items: [
                { id: 1, item: 'Paper Towels', quantity: 1, inBasket: false },
                { id: 2, item: 'Trash Bags', quantity: 1, inBasket: false }
            ],
            createdAt: new Date('2024-01-01').getTime()
        }
    ];

    // Store example data
    for (const template of exampleTemplates) {
        await this.storage.templates.setItem(template.id, template);
    }

    for (const list of exampleLists) {
        await this.storage.lists.setItem(list.id, list);
    }

    // Mark as initialized
    await localforage.setItem('isInitialized', true);
   }




    async init() {
        // Initialize event listeners
        document.getElementById('newTemplateBtn').addEventListener('click', () => this.createNewTemplate());
        
	 // Check if it's first run
    	const isInitialized = await localforage.getItem('isInitialized');
    
    	if (!isInitialized) {
        	await this.initializeExampleData();
    	}
    
        // Load existing data
        await this.loadTemplates();
        await this.loadLists();

        this.detectBrowser();
    }


    //check browser type & mobile/desktop
    detectBrowser() {
        const userAgent = navigator.userAgent;
        let browserInfo = '';
        let browserVersion = '';
        
        // Detect device type
        const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(userAgent);
        const deviceType = isMobile ? 'Mobile' : 'Desktop';
        
        // Detect browser
        // if (userAgent.includes('Edge') || userAgent.includes('Edg')) {
        //     browserInfo = 'Microsoft Edge';
        // } else if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        //     browserInfo = 'Google Chrome';
        // } else if (userAgent.includes('Firefox')) {
        //     browserInfo = 'Firefox';
        // } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        //     browserInfo = 'Safari';
        // } else {
        //     browserInfo = 'Other Browser';
        // }

        // Detect browser and version
        if (userAgent.includes('Edge') || userAgent.includes('Edg')) {
            browserInfo = 'Microsoft Edge';
            const match = userAgent.match(/Edg\/([0-9]+\.[0-9]+)/);
            browserVersion = match ? match[1] : '';
        } else if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
            browserInfo = 'Google Chrome';
            const match = userAgent.match(/Chrome\/([0-9]+\.[0-9]+)/);
            browserVersion = match ? match[1] : '';
        } else if (userAgent.includes('Firefox')) {
            browserInfo = 'Firefox';
            const match = userAgent.match(/Firefox\/([0-9]+\.[0-9]+)/);
            browserVersion = match ? match[1] : '';
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            browserInfo = 'Safari';
            const match = userAgent.match(/Version\/([0-9]+\.[0-9]+)/);
            browserVersion = match ? match[1] : '';
        } else {
            browserInfo = 'Other Browser';
        }
    
        // Get screen resolution
        const resolution = `${window.screen.width}x${window.screen.height}`;
        
        // Update the browser info element
        const infoElement = document.getElementById('browserInfo');
        infoElement.innerHTML = `
            Device Type: ${deviceType}<br>
            Browser: ${browserInfo} ${browserVersion}<br>
            Screen Resolution: ${resolution}
        `;
    }


    async loadTemplates() {
        const templatesContainer = document.getElementById('templatesContainer');
        templatesContainer.innerHTML = ''; // Clear existing content

        try {
            const keys = await this.storage.templates.keys();
            
            if (keys.length === 0) {
                templatesContainer.innerHTML = '<p>No templates yet. Create one!</p>';
                return;
            }

            for (const key of keys) {
                const template = await this.storage.templates.getItem(key);
                this.displayTemplate(template);
            }
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }

    async loadLists() {
        const listsContainer = document.getElementById('listsContainer');
        listsContainer.innerHTML = ''; // Clear existing content

        try {
            const keys = await this.storage.lists.keys();
            
            if (keys.length === 0) {
                listsContainer.innerHTML = '<p>No active shopping lists.</p>';
                return;
            }

            for (const key of keys) {
                const list = await this.storage.lists.getItem(key);
                this.displayList(list);
            }
        } catch (error) {
            console.error('Error loading lists:', error);
        }
    }

    displayTemplate(template) {
        const templatesContainer = document.getElementById('templatesContainer');
        const templateElement = document.createElement('div');
        templateElement.className = 'template-item';
        templateElement.innerHTML = `
            <div>
                <h3>${template.name}</h3>
                <p>Items: ${template.items.length}</p>
            </div>
            <div>
                <button onclick="shoppingListManager.createListFromTemplate('${template.id}')">
                    Create new list from this template
                </button>
                <button onclick="shoppingListManager.editTemplate('${template.id}')">
                    Edit
                </button>
            </div>
        `;
        templatesContainer.appendChild(templateElement);
    }

    displayList(list) {
        const listsContainer = document.getElementById('listsContainer');
    
        // Create list element
        const existingList = document.getElementById(`list_${list.id}`);
        const listElement = document.createElement('div');
        listElement.className = 'list-item';
        listElement.id = `list_${list.id}`;
        
        // Create the header section
        const headerHtml = `
            <div class="item-details">
                <h3>${list.name}</h3>
                <p>Created: ${new Date(list.createdAt).toLocaleDateString()}</p>
            </div>
        `;

        // Add column headers
        const columnHeadersHtml = `
            <div class="list-columns" style="display: flex; margin: 10px 0; font-weight: bold;">
                <div style="flex: 1;">Item</div>
                <div style="width: 80px; text-align: center;">Quantity</div>
                <div style="width: 80px; text-align: center;">In Basket</div>
            </div>
        `;

        // Create the items section with reordered columns and styled checkbox
        const itemsHtml = list.items.map(item => `
            <div class="list-item-row" style="display: flex; align-items: center; margin: 5px 0;">
                <div style="flex: 1;">
                    <label for="item_${list.id}_${item.id}">
                        ${item.item}
                    </label>
                </div>
                <div style="width: 80px; text-align: center;">
                    <input type="number" 
                        value="${item.quantity}" 
                        min="1" 
                        style="width: 50px;"
                        onchange="shoppingListManager.updateQuantity('${list.id}', ${item.id}, this.value)"
                    >
                </div>
                <div style="width: 80px; text-align: center;">
                    <input type="checkbox" 
                        id="item_${list.id}_${item.id}" 
                        class="custom-checkbox"
                        ${item.inBasket ? 'checked' : ''}
                        onchange="shoppingListManager.toggleInBasket('${list.id}', ${item.id})"
                    >
                </div>
            </div>
        `).join('');

        // Combine all sections
        listElement.innerHTML = `
            ${headerHtml}
            ${columnHeadersHtml}
            <div class="list-items" style="margin: 10px 0;">
                ${itemsHtml}
            </div>
            <div class="action-buttons">
                <button onclick="shoppingListManager.viewList('${list.id}')">View</button>
            </div>
        `;

        if (existingList) {
            existingList.replaceWith(listElement);
        } else {
            listsContainer.appendChild(listElement);
        }

    }

    async createNewTemplate() {
        const templateName = prompt('Enter template name:');
        if (!templateName) return;

        const template = {
            id: 'template_' + Date.now(),
            name: templateName,
            items: [],
            createdAt: Date.now()
        };

        try {
            await this.storage.templates.setItem(template.id, template);
            await this.loadTemplates();
        } catch (error) {
            console.error('Error creating template:', error);
            alert('Failed to create template');
        }
    }

    async createListFromTemplate(templateId) {
        try {
            const template = await this.storage.templates.getItem(templateId);
            const listName = prompt('Enter name for new shopping list:', 
                `${template.name} - ${new Date().toLocaleDateString()}`);
            
            if (!listName) return;

            // Create list items with quantity and inBasket properties
            const listItems = template.items.map(item => ({
                id: item.id,
                item: item.item,
                quantity: 1,
                inBasket: false
            }));

            const newList = {
                id: 'list_' + Date.now(),
                name: listName,
                items: listItems,
                templateId: templateId,
                createdAt: Date.now()
            };

            await this.storage.lists.setItem(newList.id, newList);
            await this.loadLists();
        } catch (error) {
            console.error('Error creating list from template:', error);
            alert('Failed to create list from template');
        }
    }

    // toggle the checkbox
    async toggleInBasket(listId, itemId) {
        try {
            const list = await this.storage.lists.getItem(listId);
            const item = list.items.find(i => i.id === itemId);
            if (item) {
                item.inBasket = !item.inBasket;
                await this.storage.lists.setItem(listId, list);
                this.displayList(list); // Refresh the display
            }
        } catch (error) {
            console.error('Error toggling item status:', error);
        }
    }


    // update quantities 
    async updateQuantity(listId, itemId, newQuantity) {
        try {
            const list = await this.storage.lists.getItem(listId);
            const item = list.items.find(i => i.id === itemId);
            if (item) {
                item.quantity = parseInt(newQuantity) || 1;
                await this.storage.lists.setItem(listId, list);
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    }

    async editTemplate(templateId) {
        // This is a placeholder for the edit functionality
        alert('Edit template functionality will be implemented based on additional requirements');
    }

    async viewList(listId) {
        // This is a placeholder for the view functionality
        alert('View list functionality will be implemented based on additional requirements');
    }
}

// Initialize the app
const shoppingListManager = new ShoppingListManager();