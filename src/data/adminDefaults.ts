import { AdminUser, AuditLogEntry } from '../types';

export const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    id: 'adm-001',
    name: 'Main Super Admin',
    email: 'zentrixcoreitsolutionsltd@gmail.com',
    role: 'super_admin',
    pin: '1234',
    department: 'Executive Management',
    active: true,
    lastLogin: new Date().toISOString()
  },
  {
    id: 'adm-002',
    name: 'Kipchimatt Super Admin',
    email: 'admin@kipchimatt.co.ke',
    role: 'super_admin',
    pin: '1234',
    department: 'Headquarters Operations',
    active: true,
    lastLogin: new Date().toISOString()
  },
  {
    id: 'adm-003',
    name: 'Sarah Wambui (Inventory Lead)',
    email: 'inventory@kipchimatt.co.ke',
    role: 'inventory_manager',
    pin: '1234',
    department: 'Warehouse & Stock Operations',
    active: true
  },
  {
    id: 'adm-004',
    name: 'David Ochieng (Orders Lead)',
    email: 'orders@kipchimatt.co.ke',
    role: 'order_manager',
    pin: '1234',
    department: 'Logistics & Dispatch',
    active: true
  },
  {
    id: 'adm-005',
    name: 'Grace Mutua (Compliance Auditor)',
    email: 'auditor@kipchimatt.co.ke',
    role: 'auditor',
    pin: '1234',
    department: 'Audit & Loss Prevention',
    active: true
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    adminEmail: 'zentrixcoreitsolutionsltd@gmail.com',
    adminName: 'Main Super Admin',
    adminRole: 'super_admin',
    category: 'settings',
    action: 'SYSTEM_BOOT',
    details: 'Initial system initialization & security profile configuration'
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    adminEmail: 'inventory@kipchimatt.co.ke',
    adminName: 'Sarah Wambui (Inventory Lead)',
    adminRole: 'inventory_manager',
    category: 'inventory',
    action: 'CATALOG_AUDIT',
    details: 'Verified initial product stock counts across catalog items'
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    adminEmail: 'orders@kipchimatt.co.ke',
    adminName: 'David Ochieng (Orders Lead)',
    adminRole: 'order_manager',
    category: 'orders',
    action: 'ORDER_DISPATCH',
    details: 'Updated order dispatch batch #4029 status to SHIPPED'
  }
];
