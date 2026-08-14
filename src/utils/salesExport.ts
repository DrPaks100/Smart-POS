import { formatZar } from '@/utils'
import type { Sale } from '@/types'

function csvCell(value: string | number): string {
  const s = String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function stamp(d?: Date) {
  if (!d) return { date: '', time: '' }
  return {
    date: d.toLocaleDateString('en-ZA'),
    time: d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }),
  }
}

function downloadBlob(contents: string, filename: string, type: string) {
  const blob = new Blob([contents], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadSalesCsv(sales: Sale[]) {
  const header = [
    'Date',
    'Time',
    'Sale ID',
    'Reference',
    'Cashier',
    'Method',
    'Items',
    'Qty',
    'Subtotal',
    'Discount',
    'VAT',
    'Total',
    'Cash in',
    'Change',
  ]
  const rows = sales.map((sale) => {
    const { date, time } = stamp(sale.createdAt)
    const items = sale.items.map((i) => `${i.name} x${i.quantity}`).join('; ')
    const qty = sale.items.reduce((n, i) => n + i.quantity, 0)
    return [
      date,
      time,
      sale.id,
      sale.paymentRef ?? '',
      sale.cashierName,
      sale.paymentMethod.toUpperCase(),
      items,
      qty,
      sale.subtotal.toFixed(2),
      sale.discountAmount.toFixed(2),
      sale.taxAmount.toFixed(2),
      sale.total.toFixed(2),
      (sale.amountTendered ?? '').toString(),
      (sale.changeGiven ?? '').toString(),
    ].map(csvCell)
  })

  const csv = ['\uFEFFBest Brightness Smart POS — Sales report', header.map(csvCell).join(','), ...rows.map((r) => r.join(','))].join('\r\n')
  downloadBlob(csv, `best-brightness-sales-${Date.now()}.csv`, 'text/csv;charset=utf-8')
}

export async function downloadSalesSpreadsheet(sales: Sale[]) {
  let logo = ''
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}best-brightness-logo.png`)
    const blob = await res.blob()
    logo = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('logo'))
      reader.readAsDataURL(blob)
    })
  } catch {
    logo = ''
  }

  const cash = sales.filter((s) => s.paymentMethod === 'cash')
  const card = sales.filter((s) => s.paymentMethod === 'card')
  const eft = sales.filter((s) => s.paymentMethod === 'eft')
  const total = sales.reduce((n, s) => n + s.total, 0)
  const generated = new Date().toLocaleString('en-ZA')

  const bodyRows = sales
    .map((sale) => {
      const { date, time } = stamp(sale.createdAt)
      const items = sale.items.map((i) => `${escapeHtml(i.name)} ×${i.quantity}`).join('<br/>')
      return `<tr>
        <td>${escapeHtml(date)} ${escapeHtml(time)}</td>
        <td>${escapeHtml(sale.paymentRef ?? sale.id.slice(-8).toUpperCase())}</td>
        <td>${escapeHtml(sale.cashierName)}</td>
        <td>${sale.paymentMethod.toUpperCase()}</td>
        <td>${items}</td>
        <td class="num">${escapeHtml(formatZar(sale.total))}</td>
      </tr>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Best Brightness — Sales report</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; color: #0f172a; margin: 24px; }
  .head { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
  .head img { width: 64px; height: 64px; object-fit: contain; }
  h1 { margin: 0; font-size: 22px; }
  .muted { color: #64748b; font-size: 12px; }
  .kpis { display: flex; gap: 12px; margin: 12px 0 18px; }
  .kpi { border: 1px solid #e8eaf0; border-radius: 12px; padding: 10px 14px; min-width: 140px; }
  .kpi b { display: block; font-size: 16px; }
  table { border-collapse: collapse; width: 100%; }
  th { background: #0d9488; color: #fff; text-align: left; padding: 8px; font-size: 12px; }
  td { border-bottom: 1px solid #e8eaf0; padding: 7px 8px; font-size: 12px; vertical-align: top; }
  tr:nth-child(even) td { background: #f7f8fc; }
  .num { text-align: right; font-weight: 700; }
</style>
</head>
<body>
  <div class="head">
    ${logo ? `<img src="${logo}" alt="Best Brightness"/>` : ''}
    <div>
      <h1>Best Brightness Smart POS</h1>
      <p class="muted">Sales report · generated ${escapeHtml(generated)}</p>
    </div>
  </div>
  <div class="kpis">
    <div class="kpi"><span class="muted">Total sales</span><b>${escapeHtml(formatZar(total))}</b></div>
    <div class="kpi"><span class="muted">Transactions</span><b>${sales.length}</b></div>
    <div class="kpi"><span class="muted">Cash</span><b>${escapeHtml(formatZar(cash.reduce((n, s) => n + s.total, 0)))}</b><span class="muted">${cash.length} sales</span></div>
    <div class="kpi"><span class="muted">Card</span><b>${escapeHtml(formatZar(card.reduce((n, s) => n + s.total, 0)))}</b><span class="muted">${card.length} sales</span></div>
    <div class="kpi"><span class="muted">EFT</span><b>${escapeHtml(formatZar(eft.reduce((n, s) => n + s.total, 0)))}</b><span class="muted">${eft.length} sales</span></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Date</th><th>Reference</th><th>Cashier</th><th>Method</th><th>Items</th><th>Total</th>
      </tr>
    </thead>
    <tbody>${bodyRows}</tbody>
  </table>
</body>
</html>`

  downloadBlob(html, `best-brightness-sales-${Date.now()}.xls`, 'application/vnd.ms-excel')
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
