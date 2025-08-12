// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // --- 1. CONFIGURATION ---
    // All selectors are defined in one clear, easily updatable object.
    const SELECTORS = {
        purpose: '#id_listing_purpose',
        propertyType: '#id_property_type',
        buyOnly: [
            '.field-price_min', '.field-road_size_min_ft', '.field-floors_min',
            '.field-master_bedrooms_min', '.field-common_bedrooms_min', 
            '.field-common_bathrooms_min', '.field-living_rooms_min', 
            '.field-kitchens_min', '.field-parking_car_min', '.field-parking_bike_min'
        ],
        rentOnly: [
            '.field-rent_duration_value', '.field-rent_duration_unit', '.field-rent_period'
        ],
        landOnly: ['.field-land_type'],
        notForLand: [
            '.field-property_condition', '.field-built_year_bs', '.field-built_year_ad',
            '.field-floors_min', '.field-floors', '.field-master_bedrooms_min',
            '.field-master_bedrooms', '.field-common_bedrooms_min', '.field-common_bedrooms',
            '.field-common_bathrooms_min', '.field-common_bathrooms', '.field-living_rooms_min',
            '.field-living_rooms', '.field-kitchens_min', '.field-kitchens',
            '.field-has_laundry', '.field-has_store', '.field-has_puja_room',
            '.field-furnishing', '.field-parking_car_min', '.field-parking_car',
            '.field-parking_bike_min', '.field-parking_bike'
        ]
    };

    const purposeSelect = document.querySelector(SELECTORS.purpose);
    const propertyTypeSelect = document.querySelector(SELECTORS.propertyType);

    if (!purposeSelect || !propertyTypeSelect) {
        return; // Exit safely if controls are not on the page
    }

    // --- 2. THE STATE MACHINE LOGIC ---
    // This is the heart of the solution. It is pure logic, with no DOM manipulation.
    const determineVisibility = () => {
        const purpose = purposeSelect.value;
        const type = propertyTypeSelect.value;
        
        // This object will hold the final visibility state for each selector.
        const visibilityMap = {};

        // Helper function to apply a state to a group of selectors
        const setVisibility = (selectors, isVisible) => {
            selectors.forEach(selector => {
                visibilityMap[selector] = isVisible;
            });
        };

        // --- Rules Engine ---
        // Rule 1: Determine visibility based on PURPOSE
        setVisibility(SELECTORS.buyOnly, purpose === 'BUY');
        setVisibility(SELECTORS.rentOnly, purpose === 'RENT');

        // Rule 2: Determine visibility based on TYPE
        setVisibility(SELECTORS.landOnly, type === 'LAND');
        setVisibility(SELECTORS.notForLand, type !== 'LAND');

        // Rule 3 (The Override): If type is LAND, it ALWAYS hides 'notForLand' fields,
        // overriding any previous rule that might have shown them.
        if (type === 'LAND') {
            setVisibility(SELECTORS.notForLand, false);
        }

        // Return the final, calculated state map.
        return visibilityMap;
    };

    // --- 3. THE RENDERER ---
    // This function's only job is to update the DOM based on the state map.
    // It is completely separate from the logic.
    const renderForm = () => {
        const visibilityMap = determineVisibility();
        
        // Iterate over the final map and apply the styles
        for (const selector in visibilityMap) {
            const fieldRow = document.querySelector(selector);
            if (fieldRow) {
                fieldRow.style.display = visibilityMap[selector] ? 'block' : 'none';
            }
        }
    };

    // --- 4. EVENT LISTENERS ---
    // The event listeners are essential. We do NOT remove them.
    // Their only job is to trigger a re-render.
    purposeSelect.addEventListener('change', renderForm);
    propertyTypeSelect.addEventListener('change', renderForm);

    // Initial render on page load to set the correct state
    renderForm();
});