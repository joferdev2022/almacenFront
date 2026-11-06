/** Shared spelling for product measures in the table, editor and request payload. */
export function normalizeProductMeasure(value: string | null | undefined): string {
  const measure = String(value ?? '').trim().replace(/\s+/g, ' ');
  if (/^unidad$/i.test(measure)) { return 'Unidad'; }
  if (/^caja$/i.test(measure)) { return 'Caja'; }
  const match = /^(\d+(?:[.,]\d+)?)?\s*(KILOGRAMOS?|KILOS?|KGS?|GRAMOS?|GR|G|MILILITROS?|ML|LITROS?|LTS?|L)$/i.exec(measure);
  if (!match) { return measure; }
  const quantity = match[1] ? Number(match[1].replace(',', '.')) : null;
  if (quantity !== null && !Number.isFinite(quantity)) { return measure; }
  const originalUnit = match[2].toUpperCase();
  const unit = /^(KILO|KG)/.test(originalUnit) ? 'KG'
    : /^(GRAMO|GR$|G$)/.test(originalUnit) ? 'GR'
    : /^(MILILITRO|ML$)/.test(originalUnit) ? 'ML' : 'LT';
  return quantity === null ? unit : `${quantity} ${unit}`;
}

export const PRODUCT_MEASURE_OPTIONS = [
  'Unidad', 'Caja', '100 GR', '500 GR', 'KG', '10 KG', '25 KG', '50 KG',
  '125 ML', '250 ML', 'LT', '4 LT'
].map(value => ({ value, viewValue: value }));
