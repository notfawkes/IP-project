import { describe, it } from 'node:test';
import assert from 'node:assert';

// 1. Institutional Email Domain Validator Test Suite
describe('Institutional Email Policy Verification', () => {
  const validateEmail = (email: string): boolean => {
    const trimmed = email.trim().toLowerCase();
    const domain = '@tcetmumbai.org';
    return trimmed.endsWith(domain) && trimmed.length > domain.length;
  };

  it('should accept valid student institutional email', () => {
    assert.strictEqual(validateEmail('student123@tcetmumbai.org'), true);
  });

  it('should accept valid faculty institutional email', () => {
    assert.strictEqual(validateEmail('dr.sharma@tcetmumbai.org'), true);
  });

  it('should reject standard commercial domains (e.g. gmail.com)', () => {
    assert.strictEqual(validateEmail('user@gmail.com'), false);
  });

  it('should reject lookalike subdomains or deceptive suffixes', () => {
    assert.strictEqual(validateEmail('attacker@tcetmumbai.org.phishing.com'), false);
    assert.strictEqual(validateEmail('attacker@fake-tcetmumbai.org'), false);
  });

  it('should reject bare domain without username prefix', () => {
    assert.strictEqual(validateEmail('@tcetmumbai.org'), false);
  });
});

// 2. Department & Room Allocation Test Suite
describe('Department & Room Seed Data Integrity', () => {
  const departmentSeed = [
    { code: 'COMP', rooms: ['304', '305', '306', '324', '325', '326'] },
    { code: 'IT', rooms: ['203', '204', '205', '220', '221'] },
    { code: 'AI_ML', rooms: ['307', '308', '413'] },
    { code: 'AI_DS', rooms: ['309', '310', '312', '316', '413'] },
    { code: 'CYBER', rooms: ['222', '223', '317'] },
    { code: 'IOT', rooms: ['213', '529', '601'] },
    { code: 'MME', rooms: ['319', '321'] },
    { code: 'ETC', rooms: [] },
    { code: 'ECS', rooms: [] },
    { code: 'CIVIL', rooms: [] },
    { code: 'COMMON', rooms: [] },
  ];

  it('should preserve duplicate Room 413 across AI_ML and AI_DS', () => {
    const aimlRooms = departmentSeed.find((d) => d.code === 'AI_ML')?.rooms || [];
    const aidsRooms = departmentSeed.find((d) => d.code === 'AI_DS')?.rooms || [];

    assert.ok(aimlRooms.includes('413'), 'AI_ML must include Room 413');
    assert.ok(aidsRooms.includes('413'), 'AI_DS must include Room 413');
  });

  it('should leave unconfirmed rooms empty for ETC, ECS, CIVIL, COMMON', () => {
    const unconfirmedCodes = ['ETC', 'ECS', 'CIVIL', 'COMMON'];
    for (const code of unconfirmedCodes) {
      const dept = departmentSeed.find((d) => d.code === code);
      assert.strictEqual(dept?.rooms.length, 0, `${code} should have 0 confirmed rooms initially`);
    }
  });

  it('should provide exactly 6 rooms for COMP and 5 rooms for IT', () => {
    const compRooms = departmentSeed.find((d) => d.code === 'COMP')?.rooms || [];
    const itRooms = departmentSeed.find((d) => d.code === 'IT')?.rooms || [];

    assert.strictEqual(compRooms.length, 6);
    assert.strictEqual(itRooms.length, 5);
  });
});

// 3. Equipment Kanban Column Filter Test Suite
describe('Kanban Classification and Search Filter', () => {
  interface EquipmentMock {
    id: number;
    name: string;
    category: string;
    modelNumber?: string;
    totalQuantity: number;
    availableQuantity: number;
    rentedQuantity: number;
    maintenanceStatus: string;
    condition: string;
  }

  const mockInventory: EquipmentMock[] = [
    {
      id: 1,
      name: 'Raspberry Pi 4 Model B',
      category: 'Microcontroller',
      modelNumber: 'RPI4-4GB',
      totalQuantity: 10,
      availableQuantity: 7,
      rentedQuantity: 3,
      maintenanceStatus: 'OPERATIONAL',
      condition: 'EXCELLENT',
    },
    {
      id: 2,
      name: 'Digital Storage Oscilloscope',
      category: 'Testing',
      modelNumber: 'DSO-X 2002A',
      totalQuantity: 2,
      availableQuantity: 0,
      rentedQuantity: 2,
      maintenanceStatus: 'OPERATIONAL',
      condition: 'GOOD',
    },
    {
      id: 3,
      name: 'Soldering Workstation',
      category: 'Tools',
      totalQuantity: 4,
      availableQuantity: 0,
      rentedQuantity: 0,
      maintenanceStatus: 'UNDER_MAINTENANCE',
      condition: 'DAMAGED',
    },
  ];

  it('should partition equipment correctly into Kanban columns', () => {
    const working = mockInventory.filter(
      (e) => e.maintenanceStatus === 'OPERATIONAL' && e.availableQuantity > 0
    );
    const rented = mockInventory.filter((e) => e.rentedQuantity > 0);
    const notWorking = mockInventory.filter(
      (e) => e.maintenanceStatus !== 'OPERATIONAL' || e.condition === 'DAMAGED'
    );

    assert.strictEqual(working.length, 1);
    assert.strictEqual(working[0].id, 1);

    assert.strictEqual(rented.length, 2); // RPI4 (3 rented) and DSO (2 rented)

    assert.strictEqual(notWorking.length, 1);
    assert.strictEqual(notWorking[0].id, 3);
  });

  it('should filter search queries by name, model, or category case-insensitively', () => {
    const filter = (query: string) => {
      const q = query.toLowerCase();
      return mockInventory.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.modelNumber && e.modelNumber.toLowerCase().includes(q)) ||
          e.category.toLowerCase().includes(q)
      );
    };

    assert.strictEqual(filter('dso').length, 1);
    assert.strictEqual(filter('testing').length, 1);
    assert.strictEqual(filter('raspberry').length, 1);
    assert.strictEqual(filter('nonexistent').length, 0);
  });
});

// 4. Loan Request & Return Validation Test Suite
describe('Loan Request Validation Rules', () => {
  it('should validate quantity limits against available stock', () => {
    const availableStock = 5;
    const isQuantityValid = (qty: number) => qty >= 1 && qty <= availableStock;

    assert.strictEqual(isQuantityValid(1), true);
    assert.strictEqual(isQuantityValid(5), true);
    assert.strictEqual(isQuantityValid(0), false);
    assert.strictEqual(isQuantityValid(6), false);
  });

  it('should reject loan periods where return time is before pickup time', () => {
    const isPeriodValid = (start: string, end: string) => new Date(start) < new Date(end);

    const now = '2026-10-25T10:00:00Z';
    const later = '2026-10-26T10:00:00Z';
    const earlier = '2026-10-24T10:00:00Z';

    assert.strictEqual(isPeriodValid(now, later), true);
    assert.strictEqual(isPeriodValid(now, earlier), false);
    assert.strictEqual(isPeriodValid(now, now), false);
  });

  it('should require minimum academic purpose explanation length', () => {
    const isPurposeValid = (purpose: string) => purpose.trim().length >= 10;

    assert.strictEqual(isPurposeValid('Short'), false);
    assert.strictEqual(
      isPurposeValid('Practicals for Semester VI Microprocessor Lab'),
      true
    );
  });
});
