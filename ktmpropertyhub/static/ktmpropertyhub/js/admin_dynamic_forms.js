document.addEventListener('DOMContentLoaded', () => {
    const SELECTORS = {
        purpose: '#id_listing_purpose',
        propertyType: '#id_property_type',
        buyRangeMinFields: ['.field-price_min', '.field-road_size_min_ft', '.field-floors_min', '.field-master_bedrooms_min', '.field-common_bedrooms_min', '.field-common_bathrooms_min', '.field-living_rooms_min', '.field-kitchens_min', '.field-built_up_area_min_sqft', '.field-parking_car_min', '.field-parking_bike_min'],
        singleValueOrRangeMaxFields: ['.field-road_size_ft', '.field-floors', '.field-master_bedrooms', '.field-common_bedrooms', '.field-common_bathrooms', '.field-living_rooms', '.field-kitchens', '.field-built_up_area_sqft', '.field-parking_car', '.field-parking_bike'],
        rentSpecificFields: ['.field-rent_available_duration_unit', '.field-rent_amount', '.field-frequency'],
        sellSpecificFields: ['.field-price_negotiable'],
        buyOrSellSpecificFields: ['.field-price'],
        sellOrRentHouseAndAptFields: ['.field-built_year_bs', '.field-built_year_ad'],
        landSpecificFields: ['.field-land_type'],
        houseAndApartmentFields: ['.field-property_condition', '.field-has_laundry', '.field-has_store', '.field-has_puja_room', '.field-furnishing']
    };

    const allSelectors = [...new Set(Object.values(SELECTORS).flat())];

    // Cache all DOM elements once
    const fieldCache = Object.fromEntries(
        allSelectors.map(sel => [sel, document.querySelector(sel)])
    );

    const purposeSelect = document.querySelector(SELECTORS.purpose);
    const propertyTypeSelect = document.querySelector(SELECTORS.propertyType);

    if (!purposeSelect || !propertyTypeSelect) return;

    const setVisibility = (selectors, show) => {
        selectors.forEach(sel => {
            const el = fieldCache[sel];
            if (el) el.classList.toggle('hidden', !show);
        });
    };

    const rules = {
        BUY: [
            SELECTORS.buyRangeMinFields,
            SELECTORS.buyOrSellSpecificFields
        ],
        SELL: [
            SELECTORS.buyOrSellSpecificFields,
            SELECTORS.sellSpecificFields,
            SELECTORS.sellOrRentHouseAndAptFields
        ],
        RENT: [
            SELECTORS.rentSpecificFields,
            SELECTORS.sellOrRentHouseAndAptFields
        ]
    };

    const typeRules = {
        LAND: [SELECTORS.landSpecificFields],
        HOUSE: [SELECTORS.houseAndApartmentFields, SELECTORS.singleValueOrRangeMaxFields],
        APARTMENT: [SELECTORS.houseAndApartmentFields, SELECTORS.singleValueOrRangeMaxFields]
    };

    const applyLandOverrides = (purpose) => {
        const notForLand = [
            ...SELECTORS.houseAndApartmentFields,
            ...SELECTORS.sellOrRentHouseAndAptFields,
            '.field-floors_min', '.field-floors', '.field-master_bedrooms_min',
            '.field-master_bedrooms', '.field-common_bedrooms_min', '.field-common_bedrooms',
            '.field-common_bathrooms_min', '.field-common_bathrooms', '.field-living_rooms_min',
            '.field-living_rooms', '.field-kitchens_min', '.field-kitchens', '.field-built_up_area_min_sqft', '.field-built_up_area_sqft',
            '.field-parking_car_min', '.field-parking_car', '.field-parking_bike_min',
            '.field-parking_bike'
        ];
        setVisibility(notForLand, false);

        const landExtras = (purpose === 'BUY')
            ? ['.field-price_min', '.field-price', '.field-road_size_min_ft', '.field-road_size_ft']
            : ['.field-price', '.field-road_size_ft'];

        setVisibility(landExtras, true);
    };

    const updateFormVisibility = () => {
        const purpose = purposeSelect.value;
        const type = propertyTypeSelect.value;

        // Reset: hide everything
        setVisibility(allSelectors, false);

        if (!purpose || !type) return;

        // Apply type rules
        (typeRules[type] || []).forEach(sel => setVisibility(sel, true));

        // Apply purpose rules
        (rules[purpose] || []).forEach(sel => setVisibility(sel, true));

        // Special case: LAND
        if (type === 'LAND') applyLandOverrides(purpose);
    };

    purposeSelect.addEventListener('change', updateFormVisibility);
    propertyTypeSelect.addEventListener('change', updateFormVisibility);
    updateFormVisibility();
});
