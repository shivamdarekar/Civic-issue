import { z } from "zod";

// Define enum values explicitly for Zod
const UserRoleEnum = z.enum(["SUPER_ADMIN", "ZONE_OFFICER", "WARD_ENGINEER", "FIELD_WORKER", "CITIZEN"]);
const DepartmentEnum = z.enum(["ROAD", "STORM_WATER_DRAINAGE", "SEWAGE_DISPOSAL", "WATER_WORKS", "STREET_LIGHT", "BRIDGE_CELL", "SOLID_WASTE_MANAGEMENT", "HEALTH", "TOWN_PLANNING", "PARKS_GARDENS", "ENCROACHMENT", "FIRE", "ELECTRICAL"]);

// Validation patterns
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PHONE_REGEX = /^(\+91)?[6-9]\d{9}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export const registerUserSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format").transform(val => val.toLowerCase()),
  phoneNumber: z.string().refine(val => PHONE_REGEX.test(val), { message: "Invalid Indian phone number" }),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .refine(val => PASSWORD_REGEX.test(val), { message: "Password must contain uppercase, lowercase and number" }),
  role: UserRoleEnum,
  wardId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }).nullable().optional(),
  zoneId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }).nullable().optional(),
  department: DepartmentEnum.nullable().optional()
}).refine((data) => {
  if (data.role === 'FIELD_WORKER') return true;
  if (data.role === 'ZONE_OFFICER') {
    if (!data.zoneId) return false;
    if (data.wardId) return false;
    return true;
  }
  if (data.role === 'WARD_ENGINEER') {
    if (!data.wardId || !data.zoneId || !data.department) return false;
    return true;
  }
  if (data.role === 'SUPER_ADMIN') return true;
  return true;
}, {
  message: "Invalid role-specific requirements"
});

export const getUsersByFilterSchema = z.object({
  role: UserRoleEnum.optional(),
  wardId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }).optional(),
  zoneId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }).optional(),
  isActive: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  department: DepartmentEnum.optional()
});

export const getAllUsersSchema = z.object({
  page: z.string().transform(val => parseInt(val)).refine(val => val > 0, { message: "Page must be greater than 0" }).optional(),
  limit: z.string().transform(val => parseInt(val)).refine(val => val > 0 && val <= 100, { message: "Limit must be between 1 and 100" }).optional()
});

// Params only schemas
export const userIdParamsSchema = z.object({
  userId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" })
});

export const zoneIdParamsSchema = z.object({
  zoneId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" })
});

export const wardIdParamsSchema = z.object({
  wardId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" })
});

// Combined schemas for routes with both params and body (using 'all' source)
export const updateUserWithParamsSchema = z.object({
  userId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }),
  fullName: z.string().min(2).max(100).optional(),
  email: z.string().email().transform(val => val.toLowerCase()).optional(),
  phoneNumber: z.string().refine(val => PHONE_REGEX.test(val), { message: "Invalid Indian phone number" }).optional(),
  role: UserRoleEnum.optional(),
  wardId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }).nullable().optional(),
  zoneId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }).nullable().optional(),
  department: DepartmentEnum.nullable().optional()
}).refine((data) => {
  if (data.role === 'WARD_ENGINEER' && data.department === null) return false;
  if (data.role && data.role !== 'WARD_ENGINEER' && data.department) return false;
  if (data.role && ['WARD_ENGINEER', 'FIELD_WORKER'].includes(data.role) && !data.wardId) return false;
  if (data.role === 'ZONE_OFFICER' && !data.zoneId) return false;
  return true;
}, {
  message: "Invalid role-specific requirements"
});

export const reassignWorkWithParamsSchema = z.object({
  userId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" }),
  toUserId: z.string().refine(val => UUID_REGEX.test(val), { message: "Invalid UUID" })
});

export type RegisterUserData = z.infer<typeof registerUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserWithParamsSchema>;
export type ReassignWorkData = z.infer<typeof reassignWorkWithParamsSchema>;
export type GetUsersByFilterData = z.infer<typeof getUsersByFilterSchema>;
