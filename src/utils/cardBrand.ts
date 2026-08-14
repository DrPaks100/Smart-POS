export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown'

export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '')
  if (digits.length < 13) return false
  let sum = 0
  let shouldDouble = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i])
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    shouldDouble = !shouldDouble
  }
  return sum % 10 === 0
}

export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = cardNumber.replace(/\s+/g, '')
  if (digits.length < 4) return 'unknown'
  const two = digits.slice(0, 2)
  const bin = digits.slice(0, 6)
  if (digits.startsWith('4')) return 'visa'
  if (two >= '51' && two <= '55') return 'mastercard'
  if (bin >= '222100' && bin <= '272099') return 'mastercard'
  if (two === '34' || two === '37') return 'amex'
  return 'unknown'
}

export function formatCardNumber(value: string, brand: CardBrand): string {
  const digits = value.replace(/\D/g, '').slice(0, brand === 'amex' ? 15 : 16)
  if (brand === 'amex') {
    return digits.replace(/(\d{1,4})(\d{1,6})?(\d{1,5})?/, (_m, a, b, c) =>
      [a, b, c].filter(Boolean).join(' '),
    )
  }
  return digits.replace(/(\d{1,4})(\d{1,4})?(\d{1,4})?(\d{1,4})?/, (_m, a, b, c, d) =>
    [a, b, c, d].filter(Boolean).join(' '),
  )
}

export function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  if (!digits) return ''
  let month = digits.slice(0, 2)
  if (month.length === 1 && Number(month) > 1) month = `0${month}`
  if (month.length === 2) {
    const m = Number(month)
    if (m === 0) month = '01'
    if (m > 12) month = '12'
  }
  const year = digits.slice(2)
  return year ? `${month}/${year}` : month.length === 2 ? `${month}/` : month
}
