import { z } from 'zod'

// Statuts de commande valides
export const orderStatuses = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'] as const

// Schema pour PATCH /api/vendor/orders/[id]
export const updateOrderSchema = z.object({
  status: z.enum(orderStatuses).optional(),
  vendor_notes: z.string().max(500).optional(),
})

// Schema pour créer un produit
export const createProductSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  price: z.number().positive().max(1000000),
  stock_quantity: z.number().int().min(0).max(999999),
  category_id: z.string().uuid(),
})

// Schema pour email
export const emailSchema = z.string().email()

// Helper de validation
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown) {
  try {
    return {
      success: true as const,
      data: schema.parse(data),
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        errors: error.issues.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      }
    }
    return {
      success: false as const,
      errors: [{ field: 'unknown', message: 'Validation error' }],
    }
  }
}
