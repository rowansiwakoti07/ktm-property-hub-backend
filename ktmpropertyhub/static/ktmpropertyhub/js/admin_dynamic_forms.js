// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // 1. IDENTIFY ALL CONTROLLERS AND TARGETS
    const purposeSelect = document.querySelector('#id_listing_purpose');
    const propertyTypeSelect = document.querySelector('#id_property_type');

    // Define all field groups based on their controlling logic
    const buyOnlyFields = [
        '.field-price_min',
        '.field-road_size_min_ft',
        '.field-floors_min',
        '.field-master_bedrooms_min',
        '.field-common_bedrooms_min',
        '.field-common_bathrooms_min',
        '.field-living_rooms_min',
        '.field-kitchens_min',
        '.field-parking_car_min',
        '.field-parking_bike_min'
    ];

    const rentOnlyFields = [
        '.field-rent_duration_value',
        '.field-rent_duration_unit',
        '.field-rent_period'
    ];

    const landOnlyFields = [
        '.field-land_type'
    ];

    const notForLandFields = [
        '.field-property_condition',
        '.field-built_year_bs',
        '.field-built_year_ad',
        '.field-floors_min',
        '.field-floors',
        '.field-master_bedrooms_min',
        '.field-master_bedrooms',
        '.field-common_bedrooms_min',
        '.field-common_bedrooms',
        '.field-common_bathrooms_min',
        '.field-common_bathrooms',
        '.field-living_rooms_min',
        '.field-living_rooms',
        '.field-kitchens_min',
        '.field-kitchens',
        '.field-has_laundry',
        '.field-has_store',
        '.field-has_puja_room',
        '.field-furnishing',
        '.field-parking_car_min',
        '.field-parking_car',
        '.field-parking_bike_min',
        '.field-parking_bike'
    ];

    // Safety check in case the elements aren't on the page
    if (!purposeSelect || !propertyTypeSelect) {
        return;
    }

    // 2. THE SINGLE, CONSOLIDATED LOGIC FUNCTION
    const updateFormVisibility = () => {
        const selectedPurpose = purposeSelect.value;
        const selectedType = propertyTypeSelect.value;

        // --- Logic based on Listing Purpose ---
        const isBuy = (selectedPurpose === 'BUY');
        const isRent = (selectedPurpose === 'RENT');

        buyOnlyFields.forEach(selector => {
            const fieldRow = document.querySelector(selector);
            if (fieldRow) fieldRow.style.display = isBuy ? 'block' : 'none';
        });

        rentOnlyFields.forEach(selector => {
            const fieldRow = document.querySelector(selector);
            if (fieldRow) fieldRow.style.display = isRent ? 'block' : 'none';
        });

        // --- Logic based on Property Type ---
        const isLand = (selectedType === 'LAND');

        landOnlyFields.forEach(selector => {
            const fieldRow = document.querySelector(selector);
            if (fieldRow) fieldRow.style.display = isLand ? 'block' : 'none';
        });

        notForLandFields.forEach(selector => {
            const fieldRow = document.querySelector(selector);
            if (fieldRow) {
                // Hide these fields if 'LAND' is selected, otherwise show them.
                fieldRow.style.display = isLand ? 'none' : 'block';
            }
        });

        // --- Special Case: Hide BUY-only fields if LAND is selected ---
        // Some fields (like floors_min) are in both buyOnlyFields and notForLandFields.
        // We need to ensure they stay hidden if LAND is selected, even if purpose is BUY.
        if (isLand) {
            buyOnlyFields.forEach(selector => {
                // We only need to re-hide the fields that are also house-related
                if (notForLandFields.includes(selector)) {
                    const fieldRow = document.querySelector(selector);
                    if (fieldRow) fieldRow.style.display = 'none';
                }
            });
        }
    };

    // 3. ATTACH EVENT LISTENERS TO BOTH CONTROLLERS
    purposeSelect.addEventListener('change', updateFormVisibility);
    propertyTypeSelect.addEventListener('change', updateFormVisibility);

    // Run the function once on page load to set the initial state correctly
    updateFormVisibility();
});