// Every product category and the specs it has.
// The finder form, the data checker and the ranking are ALL built from this file.
// To add a category: add one entry to CATEGORIES and create
// src/data/products/<id>.json (start it as an empty list: []).

// ---------- Types ----------

// A spec is one of three kinds:
//  - number:  e.g. RAM = 16 (GB). "better" says if higher or lower is better.
//  - choice:  e.g. form factor = "Over-ear". "multi" = a product can have
//             several values (e.g. colors: ["Black", "White"]).
//  - boolean: yes/no, e.g. touchscreen = true.
interface BaseSpec {
  key: string; // the name used in the JSON files
  label: string; // the name shown to users
  group: string; // section of the form it appears in
}
export interface NumberSpec extends BaseSpec {
  kind: 'number';
  unit: string;
  better: 'higher' | 'lower' | 'none'; // 'none' = no right answer (e.g. screen size)
}
export interface ChoiceSpec extends BaseSpec {
  kind: 'choice';
  options?: string[]; // allowed values; leave out to allow any text (brands, colors)
  multi?: boolean;
}
export interface BooleanSpec extends BaseSpec {
  kind: 'boolean';
}
export type SpecDef = NumberSpec | ChoiceSpec | BooleanSpec;

// What the user wants for one spec.
export interface Requirement {
  importance: 'must' | 'nice'; // must = filter out; nice = only affects ranking
  min?: number; // number specs
  max?: number; // number specs
  anyOf?: string[]; // choice specs: any of these values is OK
  want?: boolean; // boolean specs
}

// A quick-pick button such as "Good for coding": a ready-made set of requirements.
export interface Preset {
  id: string;
  label: string;
  reqs: Record<string, Requirement>;
}

export interface Category {
  id: string; // also the data file name
  label: string; // plural, shown to users
  group: 'Gadgets' | 'Accessories';
  summary: string[]; // spec keys shown on each result card
  specs: SpecDef[];
  presets: Preset[];
}

// ---------- Small helpers so the lists below stay short ----------

const num = (key: string, label: string, unit: string, better: NumberSpec['better'], group: string): NumberSpec =>
  ({ kind: 'number', key, label, unit, better, group });
const choice = (key: string, label: string, group: string, options?: string[], multi = false): ChoiceSpec =>
  ({ kind: 'choice', key, label, group, options, multi });
const bool = (key: string, label: string, group: string): BooleanSpec =>
  ({ kind: 'boolean', key, label, group });

const must = (r: Omit<Requirement, 'importance'>): Requirement => ({ importance: 'must', ...r });
const nice = (r: Omit<Requirement, 'importance'>): Requirement => ({ importance: 'nice', ...r });

// Specs every category has.
const STYLE = 'Brand & style';
const COMMON: SpecDef[] = [choice('brand', 'Brand', STYLE), choice('color', 'Color', STYLE, undefined, true)];

const PERF = 'Performance';
const DISPLAY = 'Display';
const BUILD = 'Battery & build';
const FEAT = 'Features';
const CONN = 'Connectivity';
const COMPAT = 'Compatibility';
const CAMERA = 'Camera';
const DESIGN = 'Design & form factor';

const WIRELESS = ['Wired', 'Bluetooth', '2.4GHz wireless'];

// ---------- The categories ----------

export const CATEGORIES: Category[] = [
  {
    id: 'laptop',
    label: 'Laptops',
    group: 'Gadgets',
    summary: ['cpu', 'ramGB', 'storageGB', 'screenInches', 'batteryHours', 'weightKg'],
    specs: [
      choice('cpu', 'Processor', PERF),
      num('ramGB', 'RAM', 'GB', 'higher', PERF),
      num('storageGB', 'Storage', 'GB', 'higher', PERF),
      choice('storageType', 'Storage type', PERF, ['SSD', 'eMMC', 'HDD']),
      choice('gpu', 'Graphics', PERF),
      bool('dedicatedGpu', 'Dedicated graphics card', PERF),
      num('screenInches', 'Screen size', 'inch', 'none', DISPLAY),
      choice('resolution', 'Resolution', DISPLAY),
      num('refreshHz', 'Refresh rate', 'Hz', 'higher', DISPLAY),
      choice('panel', 'Panel type', DISPLAY, ['IPS', 'OLED', 'TN', 'VA']),
      bool('touchscreen', 'Touchscreen', DISPLAY),
      num('batteryHours', 'Battery life', 'hours', 'higher', BUILD),
      num('weightKg', 'Weight', 'kg', 'lower', BUILD),
      choice('formFactor', 'Form factor', DESIGN, ['Clamshell', '2-in-1 convertible', 'Detachable']),
      bool('backlitKeyboard', 'Backlit keyboard', FEAT),
      bool('fingerprint', 'Fingerprint reader', FEAT),
      choice('os', 'Operating system', FEAT, ['Windows', 'macOS', 'ChromeOS', 'Linux']),
      choice('ports', 'Ports', CONN, ['USB-C', 'USB-A', 'HDMI', 'SD card', 'Ethernet', 'Thunderbolt'], true),
      ...COMMON,
    ],
    presets: [
      { id: 'coding', label: 'Good for coding', reqs: {
        ramGB: nice({ min: 16 }), storageType: must({ anyOf: ['SSD'] }), batteryHours: nice({ min: 8 }) } },
      { id: 'gaming', label: 'Gaming', reqs: {
        dedicatedGpu: must({ want: true }), ramGB: nice({ min: 16 }), refreshHz: nice({ min: 120 }) } },
      { id: 'school', label: 'Light for school', reqs: {
        weightKg: nice({ max: 1.5 }), batteryHours: nice({ min: 9 }), storageType: must({ anyOf: ['SSD'] }) } },
      { id: 'creative', label: 'Design & video', reqs: {
        ramGB: must({ min: 16 }), panel: nice({ anyOf: ['IPS', 'OLED'] }), dedicatedGpu: nice({ want: true }) } },
      { id: 'mac', label: 'Mac (macOS)', reqs: { os: must({ anyOf: ['macOS'] }) } },
      { id: 'windows', label: 'Windows', reqs: { os: must({ anyOf: ['Windows'] }) } },
    ],
  },
  {
    id: 'tablet',
    label: 'Tablets',
    group: 'Gadgets',
    summary: ['chipset', 'ramGB', 'storageGB', 'screenInches', 'batteryMah'],
    specs: [
      choice('chipset', 'Chipset', PERF),
      num('ramGB', 'RAM', 'GB', 'higher', PERF),
      num('storageGB', 'Storage', 'GB', 'higher', PERF),
      num('screenInches', 'Screen size', 'inch', 'none', DISPLAY),
      num('refreshHz', 'Refresh rate', 'Hz', 'higher', DISPLAY),
      num('batteryMah', 'Battery', 'mAh', 'higher', BUILD),
      num('weightG', 'Weight', 'g', 'lower', BUILD),
      choice('os', 'Operating system', FEAT, ['Android', 'iPadOS', 'Windows', 'HarmonyOS']),
      bool('stylusSupport', 'Stylus / pen support', FEAT),
      bool('keyboardSupport', 'Keyboard cover support', FEAT),
      bool('cellular', 'SIM card (cellular data)', CONN),
      ...COMMON,
    ],
    presets: [
      { id: 'notes', label: 'Note-taking', reqs: { stylusSupport: must({ want: true }), screenInches: nice({ min: 10 }) } },
      { id: 'media', label: 'Movies & reading', reqs: {
        screenInches: nice({ min: 11 }), batteryMah: nice({ min: 7000 }) } },
    ],
  },
  {
    id: 'audio',
    label: 'Headphones & earbuds',
    group: 'Gadgets',
    summary: ['formFactor', 'connection', 'anc', 'batteryHours'],
    specs: [
      choice('formFactor', 'Type', DESIGN, ['True wireless earbuds', 'In-ear wired', 'Neckband', 'On-ear', 'Over-ear']),
      choice('connection', 'Connection', CONN, ['Bluetooth', 'Wired', '2.4GHz dongle'], true),
      bool('anc', 'Active noise cancelling (ANC)', FEAT),
      num('batteryHours', 'Battery life (with case)', 'hours', 'higher', BUILD),
      choice('waterResistance', 'Water resistance', BUILD, ['None', 'IPX4', 'IPX5', 'IP54', 'IP55', 'IPX7']),
      bool('lowLatency', 'Low-latency gaming mode', FEAT),
      bool('multipoint', 'Connect 2 devices at once', CONN),
      bool('mic', 'Built-in microphone', FEAT),
      ...COMMON,
    ],
    presets: [
      { id: 'commute', label: 'Noisy commute', reqs: { anc: must({ want: true }), batteryHours: nice({ min: 20 }) } },
      { id: 'gaming', label: 'Gaming', reqs: { lowLatency: must({ want: true }), mic: nice({ want: true }) } },
      { id: 'workout', label: 'Workout', reqs: {
        waterResistance: nice({ anyOf: ['IPX4', 'IPX5', 'IP54', 'IP55', 'IPX7'] }),
        formFactor: nice({ anyOf: ['True wireless earbuds', 'Neckband'] }) } },
      { id: 'classes', label: 'Online classes', reqs: { mic: must({ want: true }), multipoint: nice({ want: true }) } },
    ],
  },
  {
    id: 'monitor',
    label: 'Monitors',
    group: 'Gadgets',
    summary: ['screenInches', 'resolution', 'refreshHz', 'panel'],
    specs: [
      num('screenInches', 'Screen size', 'inch', 'none', DISPLAY),
      choice('resolution', 'Resolution', DISPLAY, ['1920×1080', '2560×1440', '3440×1440', '3840×2160']),
      num('refreshHz', 'Refresh rate', 'Hz', 'higher', DISPLAY),
      num('responseMs', 'Response time', 'ms', 'lower', DISPLAY),
      choice('panel', 'Panel type', DISPLAY, ['IPS', 'VA', 'TN', 'OLED']),
      bool('curved', 'Curved screen', DESIGN),
      bool('adjustableStand', 'Height-adjustable stand', DESIGN),
      bool('vesa', 'Wall / arm mount (VESA)', DESIGN),
      choice('ports', 'Ports', CONN, ['HDMI', 'DisplayPort', 'USB-C', 'VGA'], true),
      bool('speakers', 'Built-in speakers', FEAT),
      ...COMMON,
    ],
    presets: [
      { id: 'gaming', label: 'Gaming', reqs: { refreshHz: must({ min: 144 }), responseMs: nice({ max: 1 }) } },
      { id: 'work', label: 'Work & coding', reqs: {
        screenInches: nice({ min: 24 }), resolution: nice({ anyOf: ['2560×1440', '3840×2160'] }),
        adjustableStand: nice({ want: true }) } },
      { id: 'design', label: 'Photo & design', reqs: {
        panel: must({ anyOf: ['IPS', 'OLED'] }), resolution: nice({ anyOf: ['2560×1440', '3840×2160'] }) } },
    ],
  },
  {
    id: 'keyboard',
    label: 'Keyboards',
    group: 'Accessories',
    summary: ['formFactor', 'switchType', 'connection', 'backlight'],
    specs: [
      choice('formFactor', 'Size / layout', DESIGN, ['Full-size', '96%', 'TKL', '75%', '65%', '60%']),
      choice('switchType', 'Switch type', FEAT, [
        'Mechanical (linear)', 'Mechanical (tactile)', 'Mechanical (clicky)', 'Membrane', 'Optical', 'Low-profile']),
      bool('hotSwappable', 'Hot-swappable switches', FEAT),
      choice('connection', 'Connection', CONN, WIRELESS, true),
      choice('backlight', 'Backlight', DESIGN, ['None', 'Single color', 'RGB']),
      choice('keycaps', 'Keycap material', DESIGN, ['ABS', 'PBT']),
      ...COMMON,
    ],
    presets: [
      { id: 'coding', label: 'Typing & coding', reqs: {
        switchType: nice({ anyOf: ['Mechanical (tactile)', 'Mechanical (linear)'] }),
        formFactor: nice({ anyOf: ['TKL', '75%'] }) } },
      { id: 'gaming', label: 'Gaming', reqs: {
        switchType: nice({ anyOf: ['Mechanical (linear)', 'Optical'] }), backlight: nice({ anyOf: ['RGB'] }) } },
      { id: 'quiet', label: 'Quiet (dorm/office)', reqs: {
        switchType: must({ anyOf: ['Membrane', 'Low-profile', 'Mechanical (linear)'] }) } },
    ],
  },
  {
    id: 'mouse',
    label: 'Mice',
    group: 'Accessories',
    summary: ['connection', 'dpi', 'weightG', 'formFactor'],
    specs: [
      choice('formFactor', 'Shape', DESIGN, ['Ergonomic (right-hand)', 'Ambidextrous', 'Vertical']),
      choice('connection', 'Connection', CONN, WIRELESS, true),
      num('dpi', 'Max DPI (sensitivity)', 'DPI', 'higher', PERF),
      num('weightG', 'Weight', 'g', 'lower', BUILD),
      num('buttons', 'Buttons', '', 'higher', FEAT),
      bool('rechargeable', 'Rechargeable', BUILD),
      bool('silentClicks', 'Silent clicks', FEAT),
      ...COMMON,
    ],
    presets: [
      { id: 'gaming', label: 'Gaming', reqs: { weightG: nice({ max: 70 }), dpi: nice({ min: 12000 }) } },
      { id: 'office', label: 'Quiet & portable', reqs: {
        silentClicks: nice({ want: true }), connection: nice({ anyOf: ['Bluetooth', '2.4GHz wireless'] }) } },
    ],
  },
  {
    id: 'powerbank',
    label: 'Power banks',
    group: 'Accessories',
    summary: ['capacityMah', 'outputW', 'ports', 'weightG'],
    specs: [
      num('capacityMah', 'Capacity', 'mAh', 'higher', PERF),
      num('outputW', 'Max charging speed', 'W', 'higher', PERF),
      choice('ports', 'Ports', CONN, ['USB-C', 'USB-A', 'Lightning'], true),
      bool('laptopCharging', 'Can charge laptops', FEAT),
      bool('wireless', 'Wireless / magnetic charging', FEAT),
      bool('builtInCable', 'Built-in cable', FEAT),
      bool('display', 'Battery % display', FEAT),
      num('weightG', 'Weight', 'g', 'lower', BUILD),
      ...COMMON,
    ],
    presets: [
      { id: 'daily', label: 'Everyday phone top-up', reqs: {
        capacityMah: nice({ min: 10000 }), weightG: nice({ max: 250 }) } },
      { id: 'laptop', label: 'Charges my laptop', reqs: {
        laptopCharging: must({ want: true }), outputW: nice({ min: 65 }) } },
      { id: 'travel', label: 'Long trips', reqs: { capacityMah: must({ min: 20000 }) } },
      { id: 'magnetic', label: 'Wireless / magnetic', reqs: { wireless: must({ want: true }) } },
    ],
  },
  {
    id: 'charger',
    label: 'Chargers',
    group: 'Accessories',
    summary: ['outputW', 'portCount', 'ports', 'gan'],
    specs: [
      num('outputW', 'Max output', 'W', 'higher', PERF),
      num('portCount', 'Number of ports', '', 'higher', CONN),
      choice('ports', 'Ports', CONN, ['USB-C', 'USB-A'], true),
      bool('gan', 'GaN (smaller and cooler)', FEAT),
      bool('foldablePlug', 'Foldable plug', DESIGN),
      bool('cableIncluded', 'Cable included', FEAT),
      ...COMMON,
    ],
    presets: [
      { id: 'phone', label: 'Fast phone charging', reqs: { outputW: must({ min: 20 }) } },
      { id: 'laptop', label: 'Laptop + phone', reqs: { outputW: must({ min: 65 }), portCount: nice({ min: 2 }) } },
      { id: 'travel', label: 'Small for travel', reqs: { gan: nice({ want: true }), foldablePlug: nice({ want: true }) } },
    ],
  },
  {
    id: 'smartwatch',
    label: 'Smartwatches & bands',
    group: 'Accessories',
    summary: ['formFactor', 'batteryDays', 'gps', 'worksWith'],
    specs: [
      choice('formFactor', 'Type', DESIGN, ['Smartwatch', 'Fitness band']),
      num('screenInches', 'Screen size', 'inch', 'none', DISPLAY),
      num('batteryDays', 'Battery life', 'days', 'higher', BUILD),
      choice('waterResistance', 'Water resistance', BUILD, ['IP67', 'IP68', '5 ATM', '10 ATM']),
      bool('gps', 'Built-in GPS', FEAT),
      bool('heartRate', 'Heart-rate sensor', FEAT),
      bool('spo2', 'Blood oxygen (SpO2)', FEAT),
      bool('calls', 'Take calls on the watch', FEAT),
      bool('nfc', 'Tap to pay (NFC)', CONN),
      choice('worksWith', 'Works with', CONN, ['Android', 'iPhone'], true),
      ...COMMON,
    ],
    presets: [
      { id: 'fitness', label: 'Running & fitness', reqs: { gps: must({ want: true }), heartRate: nice({ want: true }) } },
      { id: 'battery', label: 'Week-long battery', reqs: { batteryDays: must({ min: 7 }) } },
      { id: 'iphone', label: 'Works with iPhone', reqs: { worksWith: must({ anyOf: ['iPhone'] }) } },
      { id: 'budget', label: 'Simple fitness band', reqs: { formFactor: must({ anyOf: ['Fitness band'] }) } },
    ],
  },
  {
    id: 'speaker',
    label: 'Bluetooth speakers',
    group: 'Accessories',
    summary: ['formFactor', 'outputW', 'batteryHours', 'waterResistance'],
    specs: [
      choice('formFactor', 'Size', DESIGN, ['Pocket', 'Portable', 'Party']),
      num('outputW', 'Power (loudness)', 'W', 'higher', PERF),
      num('batteryHours', 'Battery life', 'hours', 'higher', BUILD),
      choice('waterResistance', 'Water resistance', BUILD, ['None', 'IPX4', 'IPX5', 'IPX7', 'IP67']),
      num('weightG', 'Weight', 'g', 'lower', BUILD),
      bool('stereoPair', 'Pair two for stereo', FEAT),
      bool('mic', 'Speakerphone mic', FEAT),
      ...COMMON,
    ],
    presets: [
      { id: 'outdoor', label: 'Beach & outdoors', reqs: { waterResistance: must({ anyOf: ['IPX7', 'IP67'] }) } },
      { id: 'dorm', label: 'Dorm & small parties', reqs: { outputW: nice({ min: 20 }), batteryHours: nice({ min: 12 }) } },
      { id: 'pocket', label: 'Fits in a bag', reqs: { formFactor: nice({ anyOf: ['Pocket'] }), weightG: nice({ max: 300 }) } },
    ],
  },
  {
    id: 'hub',
    label: 'USB hubs & adapters',
    group: 'Accessories',
    summary: ['formFactor', 'connector', 'portCount', 'ports'],
    specs: [
      choice('formFactor', 'Type', DESIGN, ['Dongle', 'Hub', 'Dock']),
      choice('connector', 'Plugs into', COMPAT, ['USB-C', 'USB-A', 'Thunderbolt']),
      num('portCount', 'Number of ports', '', 'higher', CONN),
      choice('ports', 'Ports', CONN, ['HDMI', 'USB-A', 'USB-C', 'SD card', 'microSD', 'Ethernet', '3.5mm audio'], true),
      bool('hdmi4k60', '4K 60Hz video', FEAT),
      num('passThroughW', 'Pass-through charging', 'W', 'higher', FEAT),
      ...COMMON,
    ],
    presets: [
      { id: 'macbook', label: 'For MacBooks', reqs: {
        connector: must({ anyOf: ['USB-C', 'Thunderbolt'] }), ports: nice({ anyOf: ['HDMI', 'SD card'] }) } },
      { id: 'present', label: 'Presentations (HDMI)', reqs: { ports: must({ anyOf: ['HDMI'] }) } },
      { id: 'desk', label: 'Desk setup', reqs: { portCount: nice({ min: 6 }), passThroughW: nice({ min: 60 }) } },
    ],
  },
  {
    id: 'portable',
    label: 'Flash drives & portable storage',
    group: 'Accessories',
    summary: ['type', 'capacityGB', 'readMBs', 'connector'],
    specs: [
      choice('type', 'Type', DESIGN, ['Flash drive', 'microSD card', 'Portable SSD', 'Portable HDD']),
      num('capacityGB', 'Capacity', 'GB', 'higher', PERF),
      num('readMBs', 'Read speed', 'MB/s', 'higher', PERF),
      choice('connector', 'Connector', COMPAT, ['USB-A', 'USB-C', 'microSD'], true),
      bool('rugged', 'Drop / water resistant', BUILD),
      num('weightG', 'Weight', 'g', 'lower', BUILD),
      ...COMMON,
    ],
    presets: [
      { id: 'school', label: 'School files', reqs: { type: nice({ anyOf: ['Flash drive'] }), capacityGB: nice({ min: 64 }) } },
      { id: 'backup', label: 'Back up my laptop', reqs: { capacityGB: must({ min: 1000 }) } },
      { id: 'fast', label: 'Fast (video, big files)', reqs: { readMBs: must({ min: 500 }) } },
    ],
  },
  {
    id: 'bag',
    label: 'Laptop bags & sleeves',
    group: 'Accessories',
    summary: ['formFactor', 'fitsInches', 'capacityL', 'waterResistant'],
    specs: [
      choice('formFactor', 'Type', DESIGN, ['Backpack', 'Sleeve', 'Messenger']),
      num('fitsInches', 'Fits laptops up to', 'inch', 'higher', COMPAT),
      num('capacityL', 'Capacity', 'L', 'higher', BUILD),
      num('weightG', 'Weight', 'g', 'lower', BUILD),
      bool('waterResistant', 'Water resistant', BUILD),
      bool('antiTheft', 'Anti-theft pocket', FEAT),
      bool('usbPort', 'USB charging port', FEAT),
      ...COMMON,
    ],
    presets: [
      { id: 'commute', label: 'Daily commute', reqs: { formFactor: nice({ anyOf: ['Backpack'] }), antiTheft: nice({ want: true }) } },
      { id: 'rain', label: 'Rainy season', reqs: { waterResistant: must({ want: true }) } },
      { id: 'slim', label: 'Slim sleeve', reqs: { formFactor: must({ anyOf: ['Sleeve'] }) } },
    ],
  },
];

// ---------- Lookup and formatting helpers ----------

export function getCategory(id: string): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

export function getSpec(category: Category, key: string): SpecDef | undefined {
  return category.specs.find((s) => s.key === key);
}

// Turns a spec value into text: 16 → "16 GB", true → "Yes", ["Black","Red"] → "Black, Red".
export function formatSpec(def: SpecDef, value: unknown): string {
  if (value === undefined) return 'unknown';
  if (def.kind === 'number') return def.unit ? `${value} ${def.unit}` : String(value);
  if (def.kind === 'boolean') return value ? 'Yes' : 'No';
  return Array.isArray(value) ? value.join(', ') : String(value);
}
