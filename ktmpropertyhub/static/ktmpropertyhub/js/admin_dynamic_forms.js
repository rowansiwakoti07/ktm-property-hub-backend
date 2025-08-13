// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // --- 1. CONFIGURATION ---
    // All selectors are defined in one clear, easily updatable object.
    const SELECTORS = {
        purpose: '#id_listing_purpose',
        propertyType: '#id_property_type',

        // Groups are now defined by what they ARE, not what they are not.
        buyRangeMinFields: [
            '.field-price_min', '.field-road_size_min_ft', '.field-floors_min',
            '.field-master_bedrooms_min', '.field-common_bedrooms_min',
            '.field-common_bathrooms_min', '.field-living_rooms_min',
            '.field-kitchens_min', '.field-parking_car_min', '.field-parking_bike_min'
        ],
        singleValueOrRangeMaxFields: [
            '.field-price', '.field-road_size_ft', '.field-floors',
            '.field-master_bedrooms', '.field-common_bedrooms',
            '.field-common_bathrooms', '.field-living_rooms',
            '.field-kitchens', '.field-parking_car', '.field-parking_bike'
        ],
        rentSpecificFields: [
            '.field-rent_duration_value', '.field-rent_duration_unit', '.field-rent_period'
        ],
        landSpecificFields: ['.field-land_type'],
        houseAndApartmentFields: [
            '.field-property_condition', '.field-built_year_bs', '.field-built_year_ad',
            '.field-has_laundry', '.field-has_store', '.field-has_puja_room',
            '.field-furnishing'
        ]
    };

    // --- Create a MASTER list of all fields we control ---
    const allControlledSelectors = [
        ...SELECTORS.buyRangeMinFields,
        ...SELECTORS.singleValueOrRangeMaxFields,
        ...SELECTORS.rentSpecificFields,
        ...SELECTORS.landSpecificFields,
        ...SELECTORS.houseAndApartmentFields
    ];

    const purposeSelect = document.querySelector(SELECTORS.purpose);
    const propertyTypeSelect = document.querySelector(SELECTORS.propertyType);

    if (!purposeSelect || !propertyTypeSelect) {
        return; // Exit safely
    }

    // Helper function to make showing/hiding cleaner
    const toggleVisibility = (selectors, show) => {
        selectors.forEach(selector => {
            const fieldRow = document.querySelector(selector);
            if (fieldRow) {
                fieldRow.style.display = show ? 'block' : 'none';
            }
        });
    };

    // --- 2. THE DEFINITIVE LOGIC FUNCTION ---
    const updateFormVisibility = () => {
        const purpose = purposeSelect.value;
        const type = propertyTypeSelect.value;

        // --- STEP 1: RESET. Hide EVERYTHING first. This is the key. ---
        toggleVisibility(allControlledSelectors, false);

        // --- STEP 2: REBUILD. Explicitly SHOW what is needed. ---
        // If no purpose or type is selected, we stop here, and everything remains hidden.
        if (!purpose || !type) {
            return;
        }

        // Rule for Property Type
        if (type === 'LAND') {
            toggleVisibility(SELECTORS.landSpecificFields, true);
        } else if (type === 'HOUSE' || type === 'APARTMENT') {
            toggleVisibility(SELECTORS.houseAndApartmentFields, true);
            // Also show the single/max fields for House/Apt by default
            toggleVisibility(SELECTORS.singleValueOrRangeMaxFields, true);
        }

        // Rule for Listing Purpose (which can now correctly override the above)
        if (purpose === 'BUY') {
            toggleVisibility(SELECTORS.buyRangeMinFields, true);
            // Ensure single/max fields are also visible for BUY
            toggleVisibility(SELECTORS.singleValueOrRangeMaxFields, true);
        } else if (purpose === 'SELL') {
            // Hide min fields, show single/max fields
            toggleVisibility(SELECTORS.buyRangeMinFields, false);
            toggleVisibility(SELECTORS.singleValueOrRangeMaxFields, true);
        } else if (purpose === 'RENT') {
            // Hide min fields, show single/max fields AND rent fields
            toggleVisibility(SELECTORS.buyRangeMinFields, false);
            toggleVisibility(SELECTORS.singleValueOrRangeMaxFields, true);
            toggleVisibility(SELECTORS.rentSpecificFields, true);
        }

        // Final Override: If it's LAND, none of the house/apt fields should show, ever.
        if (type === 'LAND') {
            const houseAptAndRangeFields = [
                ...SELECTORS.buyRangeMinFields,
                ...SELECTORS.singleValueOrRangeMaxFields,
                ...SELECTORS.houseAndApartmentFields
            ];
            toggleVisibility(houseAptAndRangeFields, false);
            // But we still need to show the land-specific fields
            toggleVisibility(SELECTORS.landSpecificFields, true);

            // And potentially the price range for buying land
            if (purpose === 'BUY') {
                toggleVisibility(['.field-price_min'], true);
            }
            if (purpose === 'SELL' || purpose === 'RENT') {
                toggleVisibility(['.field-price'], true);
            }
        }
    };

    // --- 3. EVENT LISTENERS ---
    purposeSelect.addEventListener('change', updateFormVisibility);
    propertyTypeSelect.addEventListener('change', updateFormVisibility);

    // Initial render on page load
    updateFormVisibility();
});