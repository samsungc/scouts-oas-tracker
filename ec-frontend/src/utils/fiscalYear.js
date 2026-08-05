// Keep this in sync with treasury/fiscal_year.py
const FISCAL_YEAR_START_MONTH = 9

export function fiscalYearForDateStr(dateStr) {
  const [year, month] = dateStr.split('-').map(Number)
  return month >= FISCAL_YEAR_START_MONTH ? year : year - 1
}
