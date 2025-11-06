// --- Wait for the SN Component API to be ready ---
window.onload = () => {
    const component = new window.Component({
        uuid: 'org.standardnotes.eule-recipe',
        areas: {
            'editor-editor': {
                mode: 'json',
                content: {
                    handler: (note) => {
                        // This is the main function that runs when a note is loaded.
                        const noteData = note.content.json;

                        // --- Get all the DOM elements ---
                        const durationEl = document.getElementById('duration');
                        const scaleEl = document.getElementById('scale');
                        const scaleReferenceEl = document.getElementById('scale-reference');
                        const scaleReferenceTextEl = document.getElementById('scale-reference-text');
                        const ingredientsTbody = document.getElementById('ingredients-tbody');
                        const addIngredientBtn = document.getElementById('add-ingredient-btn');
                        const mainRecipeEl = document.getElementById('main-recipe');
                        const forNextTimeEl = document.getElementById('for-next-time');
                        const avoidDoingEl = document.getElementById('avoid-doing');

                        // --- Helper function to update all ingredient quantities ---
                        const updateIngredientQuantities = () => {
                            const scale = parseFloat(scaleEl.value) || 1;
                            const rows = ingredientsTbody.querySelectorAll('tr');
                            rows.forEach(row => {
                                const quantityInput = row.querySelector('.ingredient-quantity');
                                const baseQuantity = quantityInput.dataset.baseQuantity;
                                if (baseQuantity) {
                                    quantityInput.value = (parseFloat(baseQuantity) * scale).toFixed(2).replace(/\.?0+$/, '');
                                }
                            });
                        };

                        // --- Helper function to save the current state to the note ---
                        const saveData = () => {
                            const ingredients = [];
                            ingredientsTbody.querySelectorAll('tr').forEach(row => {
                                ingredients.push({
                                    name: row.querySelector('.ingredient-name').value,
                                    quantity: row.querySelector('.ingredient-quantity').dataset.baseQuantity,
                                    unit: row.querySelector('.ingredient-unit').value
                                });
                            });

                            const dataToSave = {
                                duration: durationEl.value,
                                scale: parseFloat(scaleEl.value),
                                scaleReference: scaleReferenceEl.value,
                                ingredients: ingredients,
                                mainRecipe: mainRecipeEl.value,
                                forNextTime: forNextTimeEl.value,
                                avoidDoing: avoidDoingEl.value
                            };
                            note.content.json = dataToSave;
                        };

                        // --- Function to add a new ingredient row ---
                        const addIngredientRow = (data = { name: '', quantity: '', unit: '' }) => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td><input type="text" class="ingredient-name" value="${data.name}" placeholder="e.g., Flour"></td>
                                <td><input type="number" class="ingredient-quantity" value="${data.quantity}" data-base-quantity="${data.quantity}" placeholder="e.g., 200"></td>
                                <td><input type="text" class="ingredient-unit" value="${data.unit}" placeholder="e.g., grams"></td>
                                <td><button class="delete-btn">×</button></td>
                            `;
                            ingredientsTbody.appendChild(row);

                            // Add event listeners to the new row's inputs
                            row.querySelector('.ingredient-name').addEventListener('input', saveData);
                            row.querySelector('.ingredient-quantity').addEventListener('input', (e) => {
                                e.target.dataset.baseQuantity = e.target.value;
                                updateIngredientQuantities();
                                saveData();
                            });
                            row.querySelector('.ingredient-unit').addEventListener('input', saveData);
                            row.querySelector('.delete-btn').addEventListener('click', () => {
                                row.remove();
                                saveData();
                            });
                        };
                        
                        // --- Load data into the form ---
                        const loadData = (data) => {
                            durationEl.value = data.duration || '';
                            scaleEl.value = data.scale || 1;
                            scaleReferenceEl.value = data.scaleReference || '';
                            scaleReferenceTextEl.textContent = scaleReferenceEl.value || '1x';
                            mainRecipeEl.value = data.mainRecipe || '';
                            forNextTimeEl.value = data.forNextTime || '';
                            avoidDoingEl.value = data.avoidDoing || '';
                            
                            ingredientsTbody.innerHTML = ''; // Clear existing rows
                            const ingredients = data.ingredients || [{ name: '', quantity: '', unit: '' }];
                            if (ingredients.length === 0) {
                                ingredients.push({ name: '', quantity: '', unit: '' });
                            }
                            ingredients.forEach(ing => addIngredientRow(ing));
                            updateIngredientQuantities();
                        };

                        // --- Add event listeners to all main controls ---
                        durationEl.addEventListener('input', saveData);
                        scaleEl.addEventListener('input', () => {
                            updateIngredientQuantities();
                            saveData();
                        });
                        scaleReferenceEl.addEventListener('input', () => {
                            scaleReferenceTextEl.textContent = scaleReferenceEl.value || '1x';
                            saveData();
                        });
                        mainRecipeEl.addEventListener('input', saveData);
                        forNextTimeEl.addEventListener('input', saveData);
                        avoidDoingEl.addEventListener('input', saveData);
                        addIngredientBtn.addEventListener('click', () => addIngredientRow());

                        // --- Initial Load ---
                        if (noteData && Object.keys(noteData).length > 0) {
                            loadData(noteData);
                        } else {
                            // Set default for a new note
                            loadData({});
                        }
                    }
                }
            }
        }
    });
};
