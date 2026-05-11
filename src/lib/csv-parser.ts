import type { Transaction, TransactionType } from '@/types'

export interface CsvRow {
  raw: Record<string, string>
  date: string
  description: string
  amount: number
  type: TransactionType
}

export interface ParsedCsv {
  headers: string[]
  rows: CsvRow[]
  sample: Record<string, string>[]
  detectedMapping: Partial<ColumnMapping>
}

export interface ColumnMapping {
  date: string
  description: string
  amount: string
  type: string
  expense: string
  income: string
}

const KNOWN_DATE_FORMATS = [
  /^(\d{4})-(\d{2})-(\d{2})/,      // 2024-01-15
  /^(\d{4})\/(\d{2})\/(\d{2})/,     // 2024/01/15
  /^(\d{4})年(\d{1,2})月(\d{1,2})日/, // 2024年01月15日
  /^(\d{4})(\d{2})(\d{2})/,         // 20240115
  /^(\d{2})-(\d{2})/,                // 01-15 (assume current year)
]

function parseDate(raw: string): string {
  for (const fmt of KNOWN_DATE_FORMATS) {
    const m = raw.match(fmt)
    if (m) {
      if (m.length === 4) {
        const y = m[1], mo = m[2].padStart(2, '0'), d = m[3].padStart(2, '0')
        return `${y}-${mo}-${d}`
      }
      if (m.length === 3) {
        const y = new Date().getFullYear().toString()
        const mo = m[1].padStart(2, '0'), d = m[2].padStart(2, '0')
        return `${y}-${mo}-${d}`
      }
    }
  }
  return raw.trim()
}

function parseAmount(val: string): number {
  const cleaned = val.replace(/[¥￥,，\s]/g, '').trim()
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : Math.abs(n)
}

function mapType(raw: string): TransactionType {
  const v = raw.trim()
  if (/收入|贷方|工资|入账|存现/.test(v)) return 'income'
  if (/支出|借方|消费|取现|转账|还款/.test(v)) return 'expense'
  return 'expense'
}

// --- Auto categorization ---

interface CategoryRule {
  keywords: string[]
  categoryId: string
}

const categoryRules: CategoryRule[] = [
  { keywords: ['餐饮', '吃饭', '午餐', '早餐', '晚餐', '麦当劳', '肯德基', '星巴克', '外卖', '美食', '食堂', '咖啡', '奶茶'], categoryId: 'food' },
  { keywords: ['地铁', '公交', '滴滴', '打车', '出租车', '加油', '停车', '交通', '高铁', '机票', '自行车'], categoryId: 'transport' },
  { keywords: ['淘宝', '京东', '拼多多', '购物', '超市', '百货', '便利店', '网购', '天猫', '商城', '下单'], categoryId: 'shopping' },
  { keywords: ['电影', '游戏', '视频', '娱乐', '音乐', '健身', 'KTV', '旅游', '门票', '会员', '充值', '直播'], categoryId: 'entertain' },
  { keywords: ['房租', '租金', '物业'], categoryId: 'housing' },
  { keywords: ['水费', '电费', '煤气', '燃气', '暖气', '水电', '物业费', '宽带', '有线电视'], categoryId: 'utility' },
  { keywords: ['医疗', '医院', '药店', '体检', '看病', '挂号', '药房'], categoryId: 'medical' },
  { keywords: ['学费', '课程', '教育', '培训', '书本', '教材', '网课'], categoryId: 'education' },
  { keywords: ['话费', '手机', '流量', '通讯', '短信'], categoryId: 'comm' },
  { keywords: ['服装', '衣服', '鞋', '包', '饰品', '穿搭'], categoryId: 'clothing' },
  { keywords: ['机票', '酒店', '旅行', '旅游', '民宿', '度假'], categoryId: 'travel' },
  { keywords: ['工资', '薪资', '奖金', '补贴', '薪酬', '工资条'], categoryId: 'salary' },
  { keywords: ['理财', '利息', '收益', '基金', '股票', '投资', '分红', '股息'], categoryId: 'investment' },
  { keywords: ['兼职', '稿费', '劳务', '佣金', '提成', '返现', '红包'], categoryId: 'freelance' },
  { keywords: ['转账', '转入', '转出', '汇款', '网银'], categoryId: 'other-expense' },
]

export function autoCategorize(description: string): string | null {
  const desc = description.toLowerCase()
  for (const rule of categoryRules) {
    for (const kw of rule.keywords) {
      if (desc.includes(kw.toLowerCase())) return rule.categoryId
    }
  }
  return null
}

// --- CSV parsing ---

export function parseCsv(text: string): ParsedCsv {
  // Strip UTF-8 BOM
  let clean = text
  if (clean.charCodeAt(0) === 0xFEFF || clean.charCodeAt(0) === 0xFFFE) {
    clean = clean.slice(1)
  }
  // Normalize line endings / remove \r
  const lines = clean.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) throw new Error('CSV 文件至少需要包含表头和一行数据')

  const headers = parseCsvLine(lines[0])
  const rawRows = lines.slice(1).map(l => parseCsvLine(l))

  const rows = rawRows.map(cols => {
    const raw: Record<string, string> = {}
    headers.forEach((h, i) => { raw[h] = cols[i] || '' })
    return raw
  })

  const detectedMapping = detectMapping(headers)
  const parsedRows = rows.map(r => applyMapping(r, detectedMapping)).filter(r => r.amount > 0)

  return {
    headers,
    rows: parsedRows,
    sample: rows.slice(0, 5),
    detectedMapping,
  }
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuote = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuote && i + 1 < line.length && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuote = !inQuote
      }
    } else if (ch === ',' && !inQuote) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

// --- Column detection ---

const DATE_HEADERS = ['交易时间', '交易日期', '日期', '记账日期', '时间', '发生日', '交易时间']
const DESC_HEADERS = ['交易摘要', '商品说明', '备注', '摘要', '交易说明', '用途', '商品名称', '交易对方', '对方户名', '商户', '商品', '说明']
const AMOUNT_HEADERS = ['金额', '交易金额', '金额(元)', '实付金额', '总收入']
const TYPE_HEADERS = ['收/支', '收支', '类型', '交易类型', '借贷']
const EXPENSE_HEADERS = ['支出金额', '支出', '借方金额', '借方发生额', '支出(元)']
const INCOME_HEADERS = ['收入金额', '收入', '贷方金额', '贷方发生额', '收入(元)']

function detectMapping(headers: string[]): Partial<ColumnMapping> {
  const mapping: Partial<ColumnMapping> = {}

  for (const h of headers) {
    const hc = h.toLowerCase().replace(/[\s()（）]/g, '')

    if (!mapping.date && DATE_HEADERS.some(dh => h.includes(dh) || hc === dh)) mapping.date = h
    if (!mapping.description && DESC_HEADERS.some(dh => h.includes(dh) || hc === dh)) mapping.description = h
    if (!mapping.amount && AMOUNT_HEADERS.some(ah => h.includes(ah) || hc === ah)) mapping.amount = h
    if (!mapping.type && TYPE_HEADERS.some(th => h.includes(th) || hc === th)) mapping.type = h
    if (!mapping.expense && EXPENSE_HEADERS.some(eh => h.includes(eh) || hc === eh)) mapping.expense = h
    if (!mapping.income && INCOME_HEADERS.some(ih => h.includes(ih) || hc === ih)) mapping.income = h
  }

  return mapping
}

function applyMapping(row: Record<string, string>, mapping: Partial<ColumnMapping>): CsvRow {
  let date = ''
  if (mapping.date) date = parseDate(row[mapping.date])
  else if (row[Object.keys(row)[0]]) date = parseDate(row[Object.keys(row)[0]])

  const description = mapping.description ? row[mapping.description]?.trim() || '' : ''
  const amountStr = mapping.amount ? row[mapping.amount] : ''

  let type: TransactionType = 'expense'
  let amount = 0

  if (mapping.type) {
    type = mapType(row[mapping.type])
    amount = parseAmount(amountStr)
  } else if (mapping.expense || mapping.income) {
    const expenseVal = mapping.expense ? parseAmount(row[mapping.expense]) : 0
    const incomeVal = mapping.income ? parseAmount(row[mapping.income]) : 0
    if (incomeVal > 0) { type = 'income'; amount = incomeVal }
    else if (expenseVal > 0) { type = 'expense'; amount = expenseVal }
  } else {
    const n = parseAmount(amountStr)
    const rawVal = (amountStr || '').trim().replace(/[¥￥,，\s]/g, '')
    if (rawVal.startsWith('-') || rawVal.startsWith('－')) {
      type = 'expense'; amount = n
    } else {
      type = 'expense'; amount = n
    }
  }

  return { raw: row, date, description, amount, type }
}

// --- Bank-specific formats ---

export function tryDetectAndParse(rawText: string): ParsedCsv | null {
  return parseCsv(rawText)
}
