import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { PackagePlus, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { STORE_ID } from '@/constants'
import { BarcodeCaptureField } from '@/features/products/BarcodeCaptureField'
import { ProductImageDropzone } from '@/features/products/ProductImageDropzone'
import {
  PRODUCT_CATEGORIES,
  PRODUCT_UNITS,
  productFormSchema,
  type ProductFormValues,
} from '@/features/products/productSchema'
import { allocateProductId, createProduct, updateProduct } from '@/services/productService'
import { listSuppliers } from '@/services/supplierService'
import { uploadProductImage } from '@/services/storageService'
import { useQuery } from '@tanstack/react-query'
import type { Product } from '@/types'
import { cn } from '@/utils'

interface ProductComposerProps {
  open: boolean
  onClose: () => void
  onSaved: (saved: Product) => void
  product?: Product | null
  uid?: string
}

const defaults: ProductFormValues = {
  name: '',
  sku: '',
  barcode: '',
  category: 'Cleaning',
  brand: '',
  description: '',
  unit: 'each',
  costPrice: 0,
  sellingPrice: 0,
  stockQuantity: 0,
  lowStockThreshold: 5,
  isActive: true,
  supplierId: '',
}

const fieldClass =
  'h-9 rounded-xl border border-[var(--bb-border)] bg-[#f6f7fb] px-3 text-[13px] font-medium outline-none focus:border-[var(--bb-blue)] focus:bg-white focus:ring-2 focus:ring-[var(--bb-blue)]/20'

export function ProductComposer({
  open,
  onClose,
  onSaved,
  product,
  uid,
}: ProductComposerProps) {
  const editing = Boolean(product)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [clearExistingImage, setClearExistingImage] = useState(false)
  const [saving, setSaving] = useState(false)

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers', STORE_ID],
    queryFn: () => listSuppliers(STORE_ID),
    enabled: open,
  })

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaults,
  })

  useEffect(() => {
    if (!open) return
    setImageFile(null)
    setClearExistingImage(false)
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        category: product.category || 'General',
        brand: product.brand ?? '',
        description: product.description ?? '',
        unit: (PRODUCT_UNITS.includes(product.unit as (typeof PRODUCT_UNITS)[number])
          ? product.unit
          : 'each') as ProductFormValues['unit'],
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        isActive: product.isActive,
        supplierId: product.supplierId ?? '',
      })
    } else {
      reset(defaults)
    }
  }, [open, product, reset])

  async function onSubmit(values: ProductFormValues) {
    setSaving(true)
    try {
      const productId = product?.id ?? allocateProductId()
      let imageUrl = clearExistingImage ? undefined : product?.imageUrl

      if (imageFile) {
        const uploaded = await uploadProductImage({ file: imageFile })
        imageUrl = uploaded.downloadURL
      } else if (clearExistingImage) {
        imageUrl = undefined
      }

      const payload = {
        name: values.name,
        sku: values.sku,
        barcode: values.barcode,
        category: values.category,
        brand: values.brand || undefined,
        description: values.description || undefined,
        unit: values.unit,
        costPrice: values.costPrice,
        sellingPrice: values.sellingPrice,
        stockQuantity: values.stockQuantity,
        lowStockThreshold: values.lowStockThreshold,
        imageUrl,
        isActive: values.isActive,
        storeId: STORE_ID,
        supplierId: values.supplierId || undefined,
      }

      if (editing && product) {
        await updateProduct(product.id, {
          ...payload,
          imageUrl: imageUrl ?? null,
          imagePath: null,
          supplierId: values.supplierId || null,
        })
        toast.success('Product updated')
      } else {
        await createProduct({ ...payload, createdBy: uid }, productId)
        toast.success('Product saved to catalogue')
      }

      onSaved({
        id: productId,
        ...payload,
      })
      onClose()
    } catch (err) {
      const message = (err as Error).message
      if (message === 'BARCODE_TAKEN') {
        toast.error('That barcode is already used by another product.')
      } else if (message.includes('permission') || (err as { code?: string }).code === 'permission-denied') {
        toast.error('Firestore blocked the save. Publish the Firestore rules, then try again.')
      } else {
        toast.error(message || 'Could not save product.')
      }
    } finally {
      setSaving(false)
    }
  }

  function handleImageChange(file: File | null) {
    setImageFile(file)
    if (file === null && product?.imageUrl) setClearExistingImage(true)
    if (file) setClearExistingImage(false)
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-3 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal
            aria-label={editing ? 'Edit product' : 'Add product'}
            initial={{ y: 16, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong flex w-full max-w-[560px] flex-col rounded-[1.35rem]"
          >
            <header className="flex items-center justify-between gap-3 px-4 pb-2 pt-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl text-white bb-blend-bg">
                  <PackagePlus className="h-4 w-4" />
                </div>
                <h2 className="font-[family-name:var(--font-display)] text-[15px] font-extrabold tracking-[-0.03em] text-[var(--bb-ink)]">
                  {editing ? 'Edit product' : 'Register product'}
                </h2>
              </div>
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="px-4 pb-4">
              <div className="flex gap-3">
                <ProductImageDropzone
                  previewUrl={clearExistingImage ? null : imageFile ? null : product?.imageUrl}
                  file={imageFile}
                  onFileChange={handleImageChange}
                  disabled={saving}
                />
                <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                  <Input
                    label="Name"
                    placeholder="Valpré Still 500ml"
                    error={errors.name?.message}
                    disabled={saving}
                    className="h-9"
                    {...register('name')}
                  />
                  <Input
                    label="Brand"
                    placeholder="Valpré"
                    error={errors.brand?.message}
                    disabled={saving}
                    className="h-9"
                    {...register('brand')}
                  />
                </div>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <Input
                  label="SKU"
                  placeholder="Stock code"
                  error={errors.sku?.message}
                  disabled={saving}
                  className="h-9"
                  {...register('sku')}
                />
                <label className="flex w-full flex-col gap-1">
                  <span className="text-[12px] font-semibold text-[var(--bb-muted)]">Category</span>
                  <select className={cn(fieldClass, 'w-full')} disabled={saving} {...register('category')}>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-2.5">
                <Controller
                  name="barcode"
                  control={control}
                  render={({ field }) => (
                    <BarcodeCaptureField
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.barcode?.message}
                      disabled={saving}
                    />
                  )}
                />
              </div>

              <div className="mt-2.5 grid grid-cols-4 gap-2">
                <Input
                  label="Cost (R)"
                  type="number"
                  step="0.01"
                  min={0}
                  error={errors.costPrice?.message}
                  disabled={saving}
                  className="h-9"
                  {...register('costPrice', { valueAsNumber: true })}
                />
                <Input
                  label="Sell (R)"
                  type="number"
                  step="0.01"
                  min={0}
                  error={errors.sellingPrice?.message}
                  disabled={saving}
                  className="h-9"
                  {...register('sellingPrice', { valueAsNumber: true })}
                />
                <Input
                  label="Stock"
                  type="number"
                  step="1"
                  min={0}
                  error={errors.stockQuantity?.message}
                  disabled={saving}
                  className="h-9"
                  {...register('stockQuantity', { valueAsNumber: true })}
                />
                <Input
                  label="Low at"
                  type="number"
                  step="1"
                  min={0}
                  error={errors.lowStockThreshold?.message}
                  disabled={saving}
                  className="h-9"
                  {...register('lowStockThreshold', { valueAsNumber: true })}
                />
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <label className="flex w-full flex-col gap-1">
                  <span className="text-[12px] font-semibold text-[var(--bb-muted)]">Supplier</span>
                  <select className={cn(fieldClass, 'w-full')} disabled={saving} {...register('supplierId')}>
                    <option value="">None</option>
                    {suppliers
                      .filter((s) => s.isActive)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </label>
                <Input
                  label="Notes"
                  placeholder="Optional"
                  disabled={saving}
                  className="h-9"
                  {...register('description')}
                />
              </div>

              <div className="mt-2.5 grid grid-cols-[88px_auto] items-end gap-2">
                <label className="flex flex-col gap-1">
                  <span className="text-[12px] font-semibold text-[var(--bb-muted)]">Unit</span>
                  <select className={cn(fieldClass, 'w-full')} disabled={saving} {...register('unit')}>
                    {PRODUCT_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mb-0.5 flex h-9 items-center gap-1.5 whitespace-nowrap rounded-xl border border-[var(--bb-border)] bg-white px-2.5">
                  <input type="checkbox" className="accent-[var(--bb-blue)]" {...register('isActive')} />
                  <span className="text-[12px] font-semibold text-[var(--bb-ink)]">POS</span>
                </label>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" loading={saving}>
                  <Save className="h-3.5 w-3.5" />
                  {editing ? 'Save' : 'Add product'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
