// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // --- 1. CONFIGURATION ---
    const SELECTORS = {
        purpose: '#id_listing_purpose',
        propertyType: '#id_property_type',

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

    // Create a master list of all fields we control for the reset step.
    const allControlledSelectors = Array.from(new Set([ // Use a Set to remove duplicates
        ...SELECTORS.buyRangeMinFields,
        ...SELECTORS.singleValueOrRangeMaxFields,
        ...SELECTORS.rentSpecificFields,
        ...SELECTORS.landSpecificFields,
        ...SELECTORS.houseAndApartmentFields
    ]));

    const purposeSelect = document.querySelector(SELECTORS.purpose);
    const propertyTypeSelect = document.querySelector(SELECTORS.propertyType);

    if (!purposeSelect || !propertyTypeSelect) {
        return; // Exit safely
    }

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
        if (!purpose || !type) {
            return; // If either dropdown is empty, do nothing.
        }

        // --- Rules based on Property Type ---
        if (type === 'LAND') {
            toggleVisibility(SELECTORS.landSpecificFields, true);
        } else if (type === 'HOUSE' || type === 'APARTMENT') {
            // Show fields common to both House and Apartment
            toggleVisibility(SELECTORS.houseAndApartmentFields, true);
            // Show the single/max fields that are also common to them
            toggleVisibility(SELECTORS.singleValueOrRangeMaxFields, true);
        }

        // --- Rules based on Listing Purpose (these will apply ON TOP of the type rules) ---
        if (purpose === 'BUY') {
            toggleVisibility(SELECTORS.buyRangeMinFields, true);
            // Re-ensure single/max fields are also visible to form the range
            if (type === 'HOUSE' || type === 'APARTMENT') {
                toggleVisibility(SELECTORS.singleValueOrRangeMaxFields, true);
            }
        } else if (purpose === 'SELL') {
            // For Sell, we only want the single/max fields
            toggleVisibility(SELECTORS.buyRangeMinFields, false);
            if (type === 'HOUSE' || type === 'APARTMENT') {
                toggleVisibility(SELECTORS.singleValueOrRangeMaxFields, true);
            }
        } else if (purpose === 'RENT') {
            // For Rent, we want single/max fields AND rent fields
            toggleVisibility(SELECTORS.buyRangeMinFields, false);
            if (type === 'HOUSE' || type === 'APARTMENT') {
                toggleVisibility(SELECTORS.singleValueOrRangeMaxFields, true);
            }
            toggleVisibility(SELECTORS.rentSpecificFields, true);
        }

        // --- FINAL OVERRIDE FOR LAND ---
        // This runs last to ensure it has the final say.
        if (type === 'LAND') {
            // Re-hide all fields that are absolutely not for land
            const trulyNotForLand = [
                ...SELECTORS.houseAndApartmentFields,
                '.field-floors_min', '.field-floors', '.field-master_bedrooms_min',
                '.field-master_bedrooms', '.field-common_bedrooms_min', '.field-common_bedrooms',
                '.field-common_bathrooms_min', '.field-common_bathrooms', '.field-living_rooms_min',
                '.field-living_rooms', '.field-kitchens_min', '.field-kitchens',
                '.field-parking_car_min', '.field-parking_car', '.field-parking_bike_min',
                '.field-parking_bike'
            ];
            toggleVisibility(trulyNotForLand, false);

            // --- THIS IS THE CRITICAL FIX ---
            // Now, explicitly re-show the price fields based on the purpose.
            if (purpose === 'BUY') {
                toggleVisibility(['.field-price_min', '.field-price'], true);
            } else if (purpose === 'SELL' || purpose === 'RENT') {
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