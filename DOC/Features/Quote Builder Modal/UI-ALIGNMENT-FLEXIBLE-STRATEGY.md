# Bid Builder UI Alignment Audit - Flexible Combo Box Strategy

**Date**: December 3, 2025  
**Purpose**: Re-audit with focus on UI component matching + installer flexibility  
**Strategy**: Match Instant Quote field structure while allowing manual input on ALL dropdowns  
**Status**: Planning Phase - Awaiting User Approval  

---

## Executive Summary

### User Requirement Clarification
> "The bid builder UI should have some flexibility of installers inputs even in each dropdown. e.g the panel model is not available in the dropdown, so the installer can manually type. this flexibility should be on each and every dropdowns."

### Strategy: Instant Quote Parity + Installer Flexibility
1. **Match UI Structure**: Bid Builder fields mirror Instant Quote (same labels, groupings, input types)
2. **Flexible Dropdowns**: ALL dropdowns become combo boxes (select from list OR type custom value)
3. **Preserve Context**: Show homeowner's original selections with captions
4. **No Data Loss**: Installer can see AND modify everything the homeowner provided

---

## Part 1: Flexible Combo Box Pattern

### What is a Flexible Combo Box?
A combo box allows:
- **Option 1**: Click dropdown arrow → select from predefined list
- **Option 2**: Type directly into the field → enter custom value
- **Option 3**: Start typing → filter dropdown options → select or continue typing

### Example Use Cases
| Field | Predefined Options | Custom Input Example |
|-------|-------------------|----------------------|
| Panel Brand | SunPower, LG, Trina, REC, etc. | "Local Brand XYZ" |
| Panel Model | Vertex S+ 430W, NeON 2 370W | "Custom 500W Bifacial" |
| Roof Type | Tile, Metal, Concrete, Asphalt | "Slate tiles with steep pitch" |
| Inverter Brand | Fronius, SolarEdge, Enphase | "Chinese OEM Inverter" |
| Battery Brand | Tesla, LG, BYD, Sonnen | "Second-hand Tesla 13.5kWh" |

### Benefits
1. **Installer Autonomy**: Not limited by predefined lists
2. **Regional Flexibility**: Support local/regional products
3. **Unique Solutions**: Handle custom or uncommon configurations
4. **Future-Proof**: No need to constantly update dropdown lists

---

## Part 2: Instant Quote → Bid Builder UI Mapping (Revised)

### Section 1: Project Type & System Size

#### Instant Quote UI
```
┌─────────────────────────────────────────────────┐
│ Property Type                                   │
│ ○ Residential  ● Commercial                     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Recommended System Size                         │
│ 6.6 kW (based on your usage)                    │
│ [Override: _____ kW]                            │
└─────────────────────────────────────────────────┘
```

#### Bid Builder UI (Proposed)
```
┌─────────────────────────────────────────────────┐
│ Project Type *                                  │
│ [Residential ▼]  [Residential/Commercial]       │
│ 💡 Prefilled from homeowner Instant Quote       │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ System Size (kW) *                              │
│ [6.6] kW  [- 0.5kW] [+ 0.5kW]                   │
│ 💡 Homeowner requested: 6.6 kW (100% offset)    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ System Type                                     │
│ [Grid-Connected ▼]  [Grid/Off-Grid/Hybrid]     │
└─────────────────────────────────────────────────┘
```

**Changes**:
- Project Type: Dropdown (Residential/Commercial) - matches Instant Quote radio buttons
- System Size: Number input with quick adjust buttons - prefilled from recommendedSize
- System Type: Dropdown (installer adds this, not in Instant Quote)

---

### Section 2: Roof & Site Details (CRITICAL SECTION)

#### Instant Quote UI
```
┌─────────────────────────────────────────────────┐
│ Roof Type                                       │
│ ○ Tile  ○ Metal  ● Concrete  ○ Asphalt         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Roof Tilt/Pitch                                 │
│ ○ Flat (0-10°)                                  │
│ ○ Low (10-20°)                                  │
│ ● Optimal (20-30°)                              │
│ ○ Steep (30°+)                                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Panel Orientation                               │
│ ● North  ○ Northeast  ○ East  ○ Southeast       │
│ ○ South  ○ Southwest  ○ West  ○ Northwest       │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Shading Level                                   │
│ ● None  ○ Minimal  ○ Partial  ○ Moderate  ○ Heavy│
└─────────────────────────────────────────────────┘
```

#### Bid Builder UI (Proposed - FLEXIBLE)
```
┌─────────────────────────────────────────────────┐
│ Roof Type *                                     │
│ [Concrete ▼] 💡 Prefilled: Concrete             │
│ Options: Tile, Metal, Concrete, Asphalt         │
│ (Or type custom: e.g., "Slate", "Colorbond")    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Roof Pitch *                                    │
│ [Optimal (22°) ▼] 💡 Prefilled: Optimal         │
│ Options:                                        │
│  • Flat (5°)                                    │
│  • Low (15°)                                    │
│  • Optimal (22°)                                │
│  • Steep (40°)                                  │
│ (Or type exact degrees: e.g., "27°")            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Panel Orientation (Primary Array) *             │
│ [North ▼] 💡 Prefilled: North                   │
│ Options: N, NE, E, SE, S, SW, W, NW             │
│ (Or type custom: e.g., "NNE", "Variable")       │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Shading Level *                                 │
│ [None (0) ▼] 💡 Prefilled: None                 │
│ Options:                                        │
│  • None (0) - No shading                        │
│  • Minimal (1) - <10% annual                    │
│  • Partial (2) - 10-25% annual                  │
│  • Moderate (3) - 25-50% annual                 │
│  • Heavy (4) - >50% annual                      │
│ (Or type description: e.g., "Morning shade")    │
└─────────────────────────────────────────────────┘

┌──────────── INSTALLER-ONLY FIELDS ─────────────┐
│ Number of Arrays                                │
│ [1] (Homeowner had: 1 main array)               │
│                                                 │
│ Array Layout Notes (Optional)                   │
│ [___________________________________]            │
│ e.g., "East-West split, 8 panels each side"    │
│                                                 │
│ Roof Access Notes (Optional)                    │
│ [___________________________________]            │
│ e.g., "Ladder access only, no lift"            │
│                                                 │
│ Structural Notes (Optional)                     │
│ [___________________________________]            │
│ e.g., "Trusses 600mm spacing, good condition"  │
│                                                 │
│ Mounting System Preferred (Optional)            │
│ [Select or type... ▼]                           │
│ Options: Tile Hook, Klip-Lok, Tribrack         │
│ (Or type custom)                                │
│                                                 │
│ Conduit Run Complexity                          │
│ [Medium ▼] [Low/Medium/High]                    │
│                                                 │
│ Inverter Location Notes (Optional)              │
│ [___________________________________]            │
│ e.g., "Garage wall, well ventilated"           │
└─────────────────────────────────────────────────┘
```

**Key Changes**:
1. **Roof Type**: Combo box - predefined options + custom typing
2. **Roof Pitch**: Combo box - show homeowner's bucket (Optimal) with degrees, allow custom
3. **Orientation**: Combo box - standard directions + custom (e.g., "NNE")
4. **Shading**: Combo box - semantic labels (None/Minimal) with numeric (0-4) shown, allow custom description
5. **Installer Fields**: All remain, some gain combo boxes for flexibility

---

### Section 3: Energy & Tariffs

#### Instant Quote UI
```
┌─────────────────────────────────────────────────┐
│ Electricity Bill                                │
│ [950] per [Month ▼]                             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Electricity Retailer (Optional)                 │
│ [Origin Energy ▼]                               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Tariff Plan (Optional)                          │
│ [Time of Use ▼]                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Custom Rates (Advanced)                         │
│ Retail Rate: [32] c/kWh                         │
│ Feed-in Tariff: [8] c/kWh                       │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Usage Pattern                                   │
│ ○ Daytime Heavy  ● Evening Heavy  ○ Balanced    │
└─────────────────────────────────────────────────┘
```

#### Bid Builder UI (Proposed - in "Homeowner Requirements" Section)
```
┌────────── HOMEOWNER REQUIREMENTS ──────────────┐
│ [Expand/Collapse]                               │
│                                                 │
│ 📊 Energy Usage Context                         │
│ Electricity Bill: $950/month                    │
│ Retailer: Origin Energy                         │
│ Tariff Plan: Time of Use                        │
│ Usage Pattern: Evening Heavy                    │
│                                                 │
│ 💰 Budget & Goals                               │
│ Budget Range: $8,000 - $10,000                  │
│ Desired Offset: 100%                            │
│                                                 │
│ 🏠 Property Context                             │
│ Location: Sydney, NSW 2000                      │
│ Property Type: Residential                      │
│ Existing System: No                             │
│                                                 │
│ ⚙️ Preferences                                  │
│ Panel Brand Preference: LG Solar                │
│ Battery: Yes (13.5 kWh, Tesla)                  │
│ Special Requests:                               │
│  • VPP Enrollment                               │
│  • EV Charger Ready                             │
│  • Optimizers preferred                         │
└─────────────────────────────────────────────────┘
```

**Key Changes**:
1. **New Section**: "Homeowner Requirements" - collapsible, read-only display
2. **All homeowner context visible** - usage, budget, preferences
3. **Installer still inputs actual rates** in Pricing Engine → Financial Assumptions
4. **Homeowner values shown for reference** - installer can match or adjust

---

### Section 4: Product Configuration

#### Instant Quote UI
```
┌─────────────────────────────────────────────────┐
│ Panel Brand Preference (Optional)               │
│ [LG Solar ▼]                                    │
│ Popular: SunPower, LG, REC, Trina, Q CELLS     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Optimizers / Microinverters                     │
│ ☑ Include panel-level optimizers                │
│ ☐ Prefer microinverters                         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Battery                                         │
│ ☑ Include battery storage                       │
│ Capacity: [13.5 ▼] kWh                          │
│ Brand Preference: [Tesla ▼]                     │
└─────────────────────────────────────────────────┘
```

#### Bid Builder UI (Proposed - FLEXIBLE)
```
┌─────────────────────────────────────────────────┐
│ Solar Panels                                    │
│                                                 │
│ Brand                                           │
│ [LG Solar ▼] 💡 Homeowner prefers: LG Solar     │
│ Popular: SunPower, LG, REC, Trina, Q CELLS     │
│ (Or type custom brand)                          │
│                                                 │
│ Model                                           │
│ [Type or select... ▼]                           │
│ (Filter by brand or type custom)                │
│                                                 │
│ Wattage: [430] W                                │
│ Efficiency: [21.5] %                            │
│ Quantity: [16] panels (calculated)              │
│                                                 │
│ Optimizers                                      │
│ ☑ Include panel-level optimizers                │
│ 💡 Homeowner requested                          │
│                                                 │
│ Warranties                                      │
│ Product: [12] years                             │
│ Performance: [25] years                         │
│ ☐ Tier 1 Manufacturer                           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Inverter                                        │
│                                                 │
│ Brand                                           │
│ [Fronius ▼]                                     │
│ Popular: Fronius, SolarEdge, Enphase, Sungrow  │
│ (Or type custom brand)                          │
│                                                 │
│ Model                                           │
│ [Type or select... ▼]                           │
│ (Filter by brand or type custom)                │
│                                                 │
│ Type: [String ▼] [String/Micro/Hybrid]          │
│ Capacity: [5.0] kW                              │
│ MPPTs: [2]                                      │
│ Warranty: [10] years                            │
│                                                 │
│ Microinverters                                  │
│ ☐ Use microinverters instead                    │
│ (Homeowner preference: Not specified)           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Battery Storage                                 │
│                                                 │
│ ☑ Include Battery 💡 Homeowner requested        │
│                                                 │
│ Capacity                                        │
│ [13.5 kWh ▼] 💡 Homeowner: 13.5 kWh             │
│ Standard: 5, 10, 13.5, 16, 20 kWh              │
│ (Or type custom capacity)                       │
│                                                 │
│ Brand                                           │
│ [Tesla ▼] 💡 Homeowner prefers: Tesla           │
│ Popular: Tesla, LG, BYD, Sonnen, Alpha-ESS     │
│ (Or type custom brand)                          │
│                                                 │
│ Model                                           │
│ [Powerwall 2 ▼]                                 │
│ (Filter by brand or type custom)                │
│                                                 │
│ Usage Type                                      │
│ [Self-Consumption ▼]                            │
│ Options: Self-Consumption, Backup, Both         │
│                                                 │
│ Backup Circuit                                  │
│ ☑ Essential circuits only                       │
│ ☐ Whole-home backup                             │
│                                                 │
│ Warranty: [10] years                            │
└─────────────────────────────────────────────────┘
```

**Key Changes**:
1. **Panel Brand**: Combo box - popular brands + custom typing + homeowner preference shown
2. **Panel Model**: Combo box - dynamic filtering by brand OR custom typing
3. **Inverter Brand/Model**: Combo boxes - same flexibility pattern
4. **Battery Capacity/Brand**: Combo boxes - standard sizes + custom, brands + custom
5. **Homeowner preferences highlighted** - "💡 Homeowner prefers: X"
6. **All checkboxes show homeowner request** - "💡 Homeowner requested"

---

### Section 5: Pricing Engine (Minimal Changes)

#### Current UI (Keep Mostly As-Is)
```
┌─────────────────────────────────────────────────┐
│ Line Items                                      │
│ [+ Add Item]                                    │
│                                                 │
│ Category  |  Description  |  Qty  |  Price      │
│ ─────────────────────────────────────────────────│
│ Panels ▼  | LG NeON 2... | 16    | $320        │
│ Inverter ▼| Fronius...   | 1     | $1,200      │
│ Battery ▼ | Tesla PW2    | 1     | $9,500      │
│ Addons ▼  | VPP Enroll   | 1     | $0          │
│ Addons ▼  | EV Ready     | 1     | $0          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Financial Assumptions                           │
│                                                 │
│ Retail Rate: [0.32] $/kWh                       │
│ 💡 From homeowner Instant Quote                 │
│                                                 │
│ Feed-in Tariff: [0.08] $/kWh                    │
│ 💡 From homeowner Instant Quote                 │
│                                                 │
│ Self-Consumption: [55] %                        │
│ (Derived from Evening Heavy usage pattern)      │
│                                                 │
│ Yield: [4.2] kWh/kW/day                         │
│ Degradation: [0.5] %/year                       │
│ Escalation: [2.5] %/year                        │
│ Annual OPEX: [150] $/year                       │
└─────────────────────────────────────────────────┘
```

**Key Changes**:
1. **Category dropdown**: Already flexible (9 options)
2. **Description field**: Already free text
3. **Add caption to rates**: "💡 From homeowner Instant Quote" when imported
4. **Self-consumption note**: Show derivation from usage pattern

---

## Part 3: Flexible Combo Box Implementation Pattern

### React Component Pattern (Reusable)

```tsx
interface FlexibleComboBoxProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  allowCustom?: boolean; // Default: true
  prefilledCaption?: string; // e.g., "Prefilled from homeowner"
}

const FlexibleComboBox: React.FC<FlexibleComboBoxProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select or type...",
  allowCustom = true,
  prefilledCaption
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-1">
      <label className="text-label text-foreground-primary font-medium">
        {label}
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setFilter(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="form-input w-full"
        />
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2"
        >
          <ChevronDown className="h-4 w-4 text-foreground-muted" />
        </button>
        
        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-background-primary border border-stroke rounded-lg shadow-md max-h-60 overflow-auto">
            {filteredOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-background-hover text-foreground-primary"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {prefilledCaption && (
        <p className="text-caption text-foreground-muted flex items-center gap-1">
          <span className="text-accent">💡</span> {prefilledCaption}
        </p>
      )}
      
      {allowCustom && !prefilledCaption && (
        <p className="text-caption text-foreground-muted">
          Select from list or type custom value
        </p>
      )}
    </div>
  );
};
```

### Usage Examples

```tsx
// Roof Type
<FlexibleComboBox
  label="Roof Type"
  value={roofType}
  onChange={setRoofType}
  options={[
    { value: "tile", label: "Tile" },
    { value: "metal", label: "Metal" },
    { value: "concrete", label: "Concrete" },
    { value: "asphalt", label: "Asphalt Shingle" }
  ]}
  prefilledCaption={prefilledFields.includes('roof.roofType') 
    ? "Prefilled from homeowner Instant Quote" 
    : undefined}
/>

// Panel Brand
<FlexibleComboBox
  label="Panel Brand"
  value={panelBrand}
  onChange={setPanelBrand}
  options={[
    { value: "sunpower", label: "SunPower" },
    { value: "lg", label: "LG Solar" },
    { value: "rec", label: "REC" },
    { value: "trina", label: "Trina Solar" },
    { value: "qcells", label: "Q CELLS" }
  ]}
  prefilledCaption={homeownerPreference 
    ? `Homeowner prefers: ${homeownerPreference}` 
    : undefined}
/>

// Mounting System (Installer-only, no prefill)
<FlexibleComboBox
  label="Mounting System Preferred"
  value={mountingSystem}
  onChange={setMountingSystem}
  options={[
    { value: "tile-hook", label: "Tile Hook" },
    { value: "kliplok", label: "Klip-Lok" },
    { value: "tribrack", label: "Tribrack" }
  ]}
  placeholder="Select or type custom..."
/>
```

---

## Part 4: Revised Phase 12 Task Breakdown

### T110 [P0][Foundation]: Create FlexibleComboBox component
- **Path**: `src/components/ui/FlexibleComboBox.tsx` (new file)
- **Action**:
  - Implement combo box with dropdown + manual typing
  - Support filtering options as user types
  - Support prefilled caption display
  - Keyboard navigation (Arrow Up/Down, Enter, Escape)
  - Design-system compliant styling
- **Testing**:
  - Render with options → verify dropdown appears
  - Type custom value → verify accepted
  - Type partial match → verify filtering works
  - Test keyboard navigation → all keys work
  - Verify Dark/Light/Purple themes
  - Run verification commands → 0/0/0/0/0/0
- **Acceptance**: Reusable component, accessible, design-compliant, works in all themes
- **Status**: NOT STARTED

### T111 [P0][Mapper]: Expand instant-to-bid mapper (25+ fields)
- **Path**: `src/lib/mappers/instant-to-bid.ts`
- **Action**: Add 10 new field mappings:
  1. `budgetRange` → `meta.homeownerBudget` (parse $X-$Y)
  2. `desiredOffset` → `meta.homeownerOffset` (%)
  3. `electricityValue` + `electricityUsageType` → `meta.homeownerUsage` ($X/month)
  4. `retailer` → `meta.homeownerRetailer` (string)
  5. `tariffPlan` → `meta.homeownerTariff` (string)
  6. `panelBrand` → `meta.homeownerPanelPref` (string)
  7. `includeOptimizers` → `meta.homeownerOptimizers` (boolean)
  8. `includeMicroinverters` → `meta.homeownerMicroinverters` (boolean)
  9. `hasExistingSystem` + `existingSystemSize` → `meta.existingSystem` (string)
  10. `peakDemand` + `isThreePhase` + `projectPriority` → `meta.commercial*` (commercial fields)
- **Testing**:
  - Create test lead with all 40+ Instant Quote fields
  - Run mapper → verify 25+ fields returned
  - Verify all conversions accurate (c/kWh → $/kWh, buckets → numeric, etc.)
  - Verify `meta.prefilledFields` array populated
  - Verify no hardcoded values
- **Acceptance**: Mapper returns 25+ fields, all accurate, type-safe, defensive
- **Status**: NOT STARTED

### T112 [P0][UI]: Add Homeowner Requirements section
- **Path**: `src/components/QuoteBuilderModal.tsx`, new component `src/components/quote-builder/HomeownerContext.tsx`
- **Action**:
  - Create collapsible section at top: "Homeowner Requirements"
  - Display all `meta.homeowner*` fields in organized groups:
    - 📊 Energy Usage Context (bill, retailer, tariff, pattern)
    - 💰 Budget & Goals (budget range, desired offset)
    - 🏠 Property Context (location, property type, existing system)
    - ⚙️ Preferences (panel brand, battery, special requests)
  - Collapsed by default, expand on click
  - Read-only display (no inputs)
  - Design-system styling
- **Testing**:
  - Import lead → verify section appears
  - Click to expand → verify all fields display
  - Verify responsive (mobile/tablet/desktop)
  - Verify Dark/Light/Purple themes
  - Run verification commands → 0/0/0/0/0/0
- **Acceptance**: Section renders, all context visible, responsive, design-compliant
- **Status**: NOT STARTED

### T113 [P1][UI]: Convert Roof & Site fields to flexible combo boxes
- **Path**: `src/components/quote-builder/RoofSiteDetails.tsx`
- **Action**: Replace inputs with `FlexibleComboBox`:
  1. **Roof Type**: Options = [Tile, Metal, Concrete, Asphalt, Colorbond] + custom
  2. **Roof Pitch**: Options = [Flat (5°), Low (15°), Optimal (22°), Steep (40°)] + custom degrees
  3. **Panel Orientation**: Options = [N, NE, E, SE, S, SW, W, NW] + custom (e.g., "NNE")
  4. **Shading Level**: Options = [None (0), Minimal (1), Partial (2), Moderate (3), Heavy (4)] + custom description
  5. **Mounting System**: Options = [Tile Hook, Klip-Lok, Tribrack, Unirac] + custom
  6. **Conduit Complexity**: Dropdown only [Low, Medium, High] (no custom needed)
- **Testing**:
  - Import lead → verify all 4 main fields prefilled with homeowner values
  - Verify captions show "Prefilled from homeowner Instant Quote"
  - Test custom input → type "Custom roof type" → verify accepted
  - Test filtering → type "Ti" → verify "Tile" option appears
  - Verify responsive and themes
  - Run verification commands → 0/0/0/0/0/0
- **Acceptance**: All fields flexible, homeowner values preserved, captions shown, design-compliant
- **Status**: NOT STARTED

### T114 [P1][UI]: Convert Product Configuration to flexible combo boxes
- **Path**: `src/components/quote-builder/ProductConfiguration.tsx`
- **Action**: Replace dropdowns with `FlexibleComboBox`:
  1. **Panel Brand**: Popular brands + custom + homeowner preference hint
  2. **Panel Model**: Dynamic filtering by brand OR custom typing
  3. **Inverter Brand**: Popular brands + custom
  4. **Inverter Model**: Dynamic filtering by brand OR custom typing
  5. **Inverter Type**: [String, Micro, Hybrid] + custom
  6. **Battery Capacity**: Standard sizes [5, 10, 13.5, 16, 20 kWh] + custom
  7. **Battery Brand**: Popular brands + custom + homeowner preference hint
  8. **Battery Model**: Dynamic filtering by brand OR custom typing
- **Testing**:
  - Import lead with battery → verify brand/capacity prefilled
  - Verify hints: "💡 Homeowner prefers: Tesla"
  - Test custom brand → type "Local Brand XYZ" → verify accepted
  - Test model filtering → select brand → verify models filter
  - Verify responsive and themes
  - Run verification commands → 0/0/0/0/0/0
- **Acceptance**: All product fields flexible, homeowner preferences shown, filtering works, design-compliant
- **Status**: NOT STARTED

### T115 [P2][UX]: Enhanced budget banner with quick actions
- **Path**: `src/components/QuoteBuilderModal.tsx`
- **Action**:
  - Detect when `currentTotal > homeownerBudget.max * 1.1`
  - Show banner with:
    - Budget range display
    - Current total
    - Overage percentage
    - Homeowner priorities list (offset, battery, addons)
    - Quick action buttons:
      - "Reduce Battery Size" → decrease capacity by 20%
      - "Remove Optional Addons" → remove $0 addons
      - "Dismiss" → hide banner (session storage)
  - Non-blocking, dismissible
  - Design-system styling
- **Testing**:
  - Import lead with budget $8k-$10k
  - Add line items totaling $11.5k
  - Verify banner appears
  - Click "Reduce Battery" → verify capacity decreases, total updates
  - Click "Remove Addons" → verify addons removed, total updates
  - Click "Dismiss" → verify banner disappears
  - Reload → verify banner stays dismissed
  - Verify responsive and themes
- **Acceptance**: Banner triggers correctly, quick actions work, dismissible, design-compliant
- **Status**: NOT STARTED

### T116 [P2][UX]: Fix budget range application
- **Path**: `src/lib/mappers/instant-to-bid.ts`, `src/components/quote-builder/SystemSelection.tsx`
- **Action**:
  - Mapper: Parse `budgetRange` → `meta.homeownerBudget: {min, max}`
  - SystemSelection: Display budget context below system size:
    - "💰 Homeowner Budget: $8,000 - $10,000"
    - Show as info badge, not input field
- **Testing**:
  - Import lead with budget "$8000-$10000"
  - Verify `meta.homeownerBudget = {min: 8000, max: 10000}`
  - Verify badge displays in System Selection
  - Verify budget banner uses this data for threshold
- **Acceptance**: Budget parsed, displayed, banner triggers correctly
- **Status**: NOT STARTED

### T117 [P2][Testing]: E2E test for full field mapping workflow
- **Path**: `tests/e2e/quote-builder-field-mapping.spec.ts` (new file)
- **Action**:
  - Create test lead with 40+ Instant Quote fields populated
  - Test steps:
    1. Navigate to lead feed
    2. Open Bid Builder for lead
    3. Verify Import button visible
    4. Click Import
    5. Verify diff modal shows 25+ changes
    6. Accept import
    7. Verify all fields applied
    8. Verify Homeowner Requirements section displays
    9. Verify captions on prefilled fields
    10. Verify budget banner (if applicable)
    11. Test flexible combo box custom input
    12. Save draft → verify localStorage updated
- **Testing**: Run `npm run test:e2e` → All assertions pass
- **Acceptance**: E2E test covers full workflow, 100% pass rate
- **Status**: NOT STARTED

### T118 [Documentation]: Update implementation plan with findings
- **Path**: `DOC/Features/Quote Builder Modal/BID-BUILDER-ENHANCEMENT-COMPREHENSIVE-PLAN.md`
- **Action**:
  - Mark Phase 1 tasks COMPLETE
  - Document Phase 2 progress (flexible combo box strategy)
  - Add "Lessons Learned" section
  - Update status report
- **Testing**: Manual review
- **Acceptance**: Plan reflects current state, flexible combo box pattern documented
- **Status**: NOT STARTED

---

## Part 5: Implementation Timeline (Revised)

### Week 1: Foundation (T110-T112)
- **Day 1-2**: Create FlexibleComboBox component (T110)
- **Day 3**: Expand mapper to 25+ fields (T111)
- **Day 4-5**: Add Homeowner Requirements section (T112)
- **Checkpoint**: Run verification commands, test themes, commit

### Week 2: UI Alignment (T113-T114)
- **Day 6-7**: Convert Roof & Site fields to flexible combo boxes (T113)
- **Day 8-9**: Convert Product Configuration to flexible combo boxes (T114)
- **Checkpoint**: Test import workflow end-to-end, verify all homeowner values preserved

### Week 3: UX & Testing (T115-T118)
- **Day 10**: Enhanced budget banner with quick actions (T115)
- **Day 11**: Fix budget range application (T116)
- **Day 12**: E2E test for full workflow (T117)
- **Day 13**: Documentation updates (T118)
- **Final Checkpoint**: All tests pass, documentation complete, ready for production

**Total**: 13 days (~2-3 weeks)

---

## Part 6: Success Criteria (Revised)

### Phase 12 Complete When:
1. ✅ FlexibleComboBox component implemented and reusable
2. ✅ Mapper includes 25+ fields (homeowner context preserved)
3. ✅ Homeowner Requirements section displays all context
4. ✅ Roof & Site fields match Instant Quote structure with flexible inputs
5. ✅ Product Configuration fields match Instant Quote with flexible inputs
6. ✅ Budget banner triggers with quick action buttons
7. ✅ Budget range displayed in System Selection
8. ✅ E2E test passes for full import workflow
9. ✅ All verification commands return 0/0/0/0/0/0
10. ✅ Responsive in all breakpoints (320px - 1440px)
11. ✅ All themes pass (Dark/Light/Purple)
12. ✅ Installer can type custom values in ALL dropdowns
13. ✅ Homeowner preferences/selections always visible to installer

---

## Part 7: Risk Assessment

### Low Risk ✅
- FlexibleComboBox component (isolated, reusable)
- Homeowner Requirements section (read-only display, non-blocking)
- Budget banner (non-blocking, dismissible)

### Medium Risk ⚠️
- Mapper expansion (complexity increases with more fields, need defensive programming)
- Product Configuration conversion (dynamic filtering, model dependencies)
- E2E test coverage (test data creation, flakiness potential)

### High Risk 🔴
- **None** - All changes are additive, no existing functionality removed

### Mitigation Strategies
1. **Incremental Testing**: Test each field conversion individually before moving to next
2. **Backup Commits**: Commit after each task completion
3. **Rollback Plan**: Keep old input components in codebase until full validation
4. **Defensive Coding**: Handle missing/malformed data gracefully in mapper
5. **User Testing**: Get installer feedback on flexible combo boxes before finalizing all fields

---

## Conclusion

### Strategy Summary
**Match Instant Quote UI + Installer Flexibility = Perfect Bid Builder**

### Key Innovations
1. **Flexible Combo Boxes**: Select from list OR type custom value
2. **Homeowner Context Always Visible**: Dedicated section with all homeowner inputs
3. **Smart Captions**: Show what was prefilled vs manually entered
4. **Budget Intelligence**: Banner with quick actions to stay within budget
5. **Zero Data Loss**: Every homeowner input preserved and displayed

### User Experience Wins
- **For Installers**: See homeowner's original choices + full customization freedom
- **For Homeowners**: Their preferences guide the installer's quote
- **For Business**: Faster quoting, better alignment, fewer revisions

---

**Status**: Planning Complete ✅  
**Next**: User review and approval before implementation  
**Timeline**: 13 days (~2-3 weeks) after approval
