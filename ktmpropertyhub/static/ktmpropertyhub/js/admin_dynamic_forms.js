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
            '.field-kitchens_min', '.field-built_up_area_min_sqft', '.field-parking_car_min', '.field-parking_bike_min'
        ],
        singleValueOrRangeMaxFields: [
            '.field-price', '.field-road_size_ft', '.field-floors',
            '.field-master_bedrooms', '.field-common_bedrooms',
            '.field-common_bathrooms', '.field-living_rooms',
            '.field-kitchens', '.field-built_up_area_sqft', '.field-parking_car', '.field-parking_bike'
        ],
        rentSpecificFields: [
            '.field-rent_available_duration_unit', '.field-rent_amount', '.field-frequency'
        ],
        sellSpecificFields: [
            '.field-price_negotiable'
        ],
        sellOrRentHouseAndAptFields: [
            '.field-built_year_bs', '.field-built_year_ad'
        ],
        landSpecificFields: ['.field-land_type'],
        houseAndApartmentFields: [
            '.field-property_condition', '.field-has_laundry',
            '.field-has_store', '.field-has_puja_room', '.field-furnishing'
        ]
    };

    // Create a master list of all fields we control for the reset step.
    const allControlledSelectors = Array.from(new Set([
        ...SELECTORS.buyRangeMinFields,
        ...SELECTORS.singleValueOrRangeMaxFields,
        ...SELECTORS.rentSpecificFields,
        ...SELECTORS.sellSpecificFields,
        ...SELECTORS.sellOrRentHouseAndAptFields,
        ...SELECTORS.landSpecificFields,
        ...SELECTORS.houseAndApartmentFields
    ]));

    const purposeSelect = document.querySelector(SELECTORS.purpose);
    const propertyTypeSelect = document.querySelector(SELECTORS.propertyType);

    if (!purposeSelect || !propertyTypeSelect) {
        return;
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

        // --- STEP 1: RESET. Hide EVERYTHING first. ---
        toggleVisibility(allControlledSelectors, false);

        // --- STEP 2: REBUILD. Explicitly SHOW what is needed. ---
        if (!purpose || !type) {
            return;
        }

        // --- Rules based on Property Type ---
        if (type === 'LAND') {
            toggleVisibility(SELECTORS.landSpecificFields, true);
        } else if (type === 'HOUSE' || type === 'APARTMENT') {
            toggleVisibility(SELECTORS.houseAndApartmentFields, true);
            toggleVisibility(SELECTORS.singleValueOrRangeMaxFields, true);
        }

        // --- Rules based on Listing Purpose ---
        if (purpose === 'BUY') {
            toggleVisibility(SELECTORS.buyRangeMinFields, true);
            if (type === 'HOUSE' || type === 'APARTMENT') {
                toggleVisibility(SELECTORS.singleValueOrRangeMaxFields, true);
            }
        } else if (purpose === 'SELL' || purpose === 'RENT') {
            toggleVisibility(SELECTORS.buyRangeMinFields, false);
            // Show build years ONLY for Sell or Rent for House/Apt
            if (type === 'HOUSE' || type === 'APARTMENT') {
                toggleVisibility(SELECTORS.singleValueOrRangeMaxFields, true);
                toggleVisibility(SELECTORS.sellOrRentHouseAndAptFields, true);
            }
        }

        if (purpose === 'RENT') {
            toggleVisibility(SELECTORS.rentSpecificFields, true);
        }

        if (purpose === 'SELL') {
            toggleVisibility(SELECTORS.sellSpecificFields, true);
        }

        // --- FINAL OVERRIDE FOR LAND ---
        if (type === 'LAND') {
            const trulyNotForLand = [
                ...SELECTORS.houseAndApartmentFields,
                ...SELECTORS.sellOrRentHouseAndAptFields,
                '.field-floors_min', '.field-floors', '.field-master_bedrooms_min',
                '.field-master_bedrooms', '.field-common_bedrooms_min', '.field-common_bedrooms',
                '.field-common_bathrooms_min', '.field-common_bathrooms', '.field-living_rooms_min',
                '.field-living_rooms', '.field-kitchens_min', '.field-kitchens', '.field-built_up_area_min_sqft', '.field-built_up_area_sqft',
                '.field-parking_car_min', '.field-parking_car', '.field-parking_bike_min',
                '.field-parking_bike'
            ];
            toggleVisibility(trulyNotForLand, false);

            // Explicitly re-show the price and road size fields for Land based on purpose.
            if (purpose === 'BUY') {
                toggleVisibility(['.field-price_min', '.field-price', '.field-road_size_min_ft', '.field-road_size_ft'], true);
            } else if (purpose === 'SELL' || purpose === 'RENT') {
                toggleVisibility(['.field-price', '.field-road_size_ft'], true);
            }
        }
    };

    // --- 3. EVENT LISTENERS ---
    purposeSelect.addEventListener('change', updateFormVisibility);
    propertyTypeSelect.addEventListener('change', updateFormVisibility);

    // Initial render on page load
    updateFormVisibility();
});