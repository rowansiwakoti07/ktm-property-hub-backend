// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // --- 1. CONFIGURATION (SEMANTICALLY CORRECT) ---
    const SELECTORS = {
        purpose: '#id_listing_purpose',
        propertyType: '#id_property_type',

        // Fields that ONLY appear for 'BUY' (the "min" part of a range)
        minRangeFields: [
            '.field-price_min', '.field-road_size_min_ft', '.field-floors_min',
            '.field-master_bedrooms_min', '.field-common_bedrooms_min',
            '.field-common_bathrooms_min', '.field-living_rooms_min',
            '.field-kitchens_min', '.field-parking_car_min', '.field-parking_bike_min'
        ],

        // Fields that appear for BUY, SELL, or RENT (the "max" part of a range or a single value)
        maxRangeOrSingleValueFields: [
            '.field-price', '.field-road_size_ft', '.field-floors',
            '.field-master_bedrooms', '.field-common_bedrooms',
            '.field-common_bathrooms', '.field-living_rooms',
            '.field-kitchens', '.field-parking_car', '.field-parking_bike'
        ],

        // Fields that ONLY appear for 'RENT'
        rentOnlyFields: [
            '.field-rent_duration_value', '.field-rent_duration_unit', '.field-rent_period'
        ],

        // Fields that ONLY appear for 'LAND'
        landOnlyFields: ['.field-land_type'],

        // Fields that should NEVER appear for 'LAND'
        notForLandFields: [
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
        return;
    }

    // --- 2. THE STATE MACHINE LOGIC ---
    const determineVisibility = () => {
        const purpose = purposeSelect.value;
        const type = propertyTypeSelect.value;
        const visibilityMap = {};

        const setVisibility = (selectors, isVisible) => {
            selectors.forEach(selector => { visibilityMap[selector] = isVisible; });
        };

        // --- Rules Engine (Now Correctly Reflects Your Logic) ---

        // Rule 1: The 'min' fields are ONLY visible for 'BUY'.
        setVisibility(SELECTORS.minRangeFields, purpose === 'BUY');

        // Rule 2: The 'max'/single-value fields are visible if ANY purpose is selected.
        const anyPurposeSelected = purpose !== '';
        setVisibility(SELECTORS.maxRangeOrSingleValueFields, anyPurposeSelected);

        // Rule 3: The rent-specific fields are ONLY visible for 'RENT'.
        setVisibility(SELECTORS.rentOnly, purpose === 'RENT');

        // Rule 4: The land-type field is ONLY visible for 'LAND'.
        setVisibility(SELECTORS.landOnly, type === 'LAND');

        // Rule 5 (The Final Override): If type is LAND, it ALWAYS hides 'notForLand' fields.
        // This is the most important rule and runs last to ensure it wins any conflict.
        if (type === 'LAND') {
            setVisibility(SELECTORS.notForLand, false);
        }

        return visibilityMap;
    };

    // --- 3. THE RENDERER (No changes needed) ---
    const renderForm = () => {
        const visibilityMap = determineVisibility();
        for (const selector in visibilityMap) {
            const fieldRow = document.querySelector(selector);
            if (fieldRow) {
                fieldRow.style.display = visibilityMap[selector] ? 'block' : 'none';
            }
        }
    };

    // --- 4. EVENT LISTENERS (No changes needed) ---
    purposeSelect.addEventListener('change', renderForm);
    propertyTypeSelect.addEventListener('change', renderForm);

    // Initial render on page load
    renderForm();
});