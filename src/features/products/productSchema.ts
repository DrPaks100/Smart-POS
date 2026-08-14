import { z } from 'zod'
import { findBlockedPhrase } from '@/utils/contentSafety'

export const PRODUCT_CATEGORIES = [
  'Cleaning',
  'Kitchen',
  'Household',
  'Plasticware',
  'Home supplies',
  'Beverages',
  'Personal care',
  'General',
] as const

export const PRODUCT_UNITS = ['each', 'pack', 'box', 'litre', 'kg'] as const

function retailSafeText(label: string) {
  return z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (!value) return
      const hit = findBlockedPhrase(value)
      if (hit) {
        ctx.addIssue({
          code: 'custom',
          message: `${label} must stay retail-safe. That wording is not allowed.`,
        })
      }
    })
}

export const productFormSchema = z
  .object({
    name: retailSafeText('Product name').min(2, 'Enter a product name.').max(80, 'Name is too long.'),
    sku: z.string().trim().min(1, 'Enter a SKU.'),
    barcode: z
      .string()
      .trim()
      .min(4, 'Barcode is too short.')
      .max(32, 'Barcode is too long.')
      .regex(/^[0-9A-Za-z\-]+$/, 'Barcode can only contain letters, numbers, and dashes.'),
    category: z.string().trim().min(1, 'Choose a category.'),
    brand: retailSafeText('Brand').optional(),
    description: retailSafeText('Notes').max(240, 'Notes are too long.').optional(),
    unit: z.enum(PRODUCT_UNITS),
    costPrice: z.number().min(0, 'Cost cannot be negative.'),
    sellingPrice: z.number().min(0.01, 'Selling price is required.'),
    stockQuantity: z.number().int().min(0, 'Stock cannot be negative.'),
    lowStockThreshold: z.number().int().min(0, 'Threshold cannot be negative.'),
    isActive: z.boolean(),
    supplierId: z.string().optional(),
  })
  .refine((v) => v.sellingPrice >= v.costPrice, {
    message: 'Selling price should be at least cost price.',
    path: ['sellingPrice'],
  })

export type ProductFormValues = z.infer<typeof productFormSchema>
