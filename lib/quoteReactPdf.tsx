"use client"
import React from "react"
import { Document, Page, Text, View, StyleSheet, pdf, Font } from "@react-pdf/renderer"
import JSZip from "jszip"

export type QuoteItem = {
  no: number
  productName: string
  quantity: number
  unitPrice: number
  amount: number
  note: string
}

export async function downloadQuotesZipReactPdf(quotes: Quote[], filenameBase = "견적서_일괄") {
  // Create zip and add each partner PDF as a file
  const zip = new JSZip()
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")

  for (const q of quotes) {
    const doc = <QuoteDocument quote={q} />
    const blob = await pdf(doc).toBlob()
    const arrayBuf = await blob.arrayBuffer()
    const fileName = `견적서_${q.partnerName}_${y}-${m}-${d}.pdf`
    zip.file(fileName, arrayBuf)
  }

  const zipBlob = await zip.generateAsync({ type: "blob" })
  const zipName = `${filenameBase}_${y}-${m}-${d}.zip`
  const url = URL.createObjectURL(zipBlob)
  const a = document.createElement("a")
  a.href = url
  a.download = zipName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function downloadQuoteReactPdf(quote: Quote, filenameBase = "견적서") {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  const doc = <QuoteDocument quote={quote} />
  const blob = await pdf(doc).toBlob()
  const fileName = `${filenameBase}_${quote.partnerName}_${y}-${m}-${d}.pdf`
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function printQuoteReactPdf(quote: Quote) {
  const doc = <QuoteDocument quote={quote} />
  const blob = await pdf(doc).toBlob()
  const url = URL.createObjectURL(blob)
  // Open in a new window and attempt to trigger print
  const win = window.open(url)
  if (win) {
    // Some browsers need time for the PDF viewer to load
    const tryPrint = () => {
      try {
        win.focus()
        win.print()
      } catch {}
    }
    setTimeout(tryPrint, 800)
  }
}

export type CompanyInfo = {
  companyName?: string
  manager?: string
  phone?: string
}

export type Quote = {
  partnerName: string
  items: QuoteItem[]
  totalAmount: number
  tax: number
  finalAmount: number
  date: string
  companyInfo?: CompanyInfo
}

// Register Korean fonts (tries multiple common paths)
try {
  // 1) Path used by Google Fonts when keeping original structure
  Font.register({
    family: "NotoSansKR",
    fonts: [
      { src: "/fonts/Noto_Sans_KR/static/NotoSansKR-Regular.ttf", fontWeight: "normal" },
      { src: "/fonts/Noto_Sans_KR/static/NotoSansKR-Bold.ttf", fontWeight: "bold" },
    ],
  })
} catch (e) {
  try {
    // 2) Flat path under /public/fonts
    Font.register({
      family: "NotoSansKR",
      fonts: [
        { src: "/fonts/NotoSansKR-Regular.ttf", fontWeight: "normal" },
        { src: "/fonts/NotoSansKR-Bold.ttf", fontWeight: "bold" },
      ],
    })
  } catch (e2) {
    // If registration fails, PDF will fall back to default fonts (Korean may not render correctly)
  }
}

// Helper to convert millimeters to points for consistency with A4 sizing
const mm = (n: number) => n * 2.83465

const styles = StyleSheet.create({
  // Web container uses p-8 (~32px) => ~11.3mm
  page: { padding: mm(11.3), fontSize: 11, fontFamily: "NotoSansKR" },
  // Web title is roughly text-3xl (~24px) => ~18pt
  title: { fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: mm(5.6) },
  // Web subtitle is text-lg (~18px) => ~13.5pt
  subtitle: { fontSize: 13.5, textAlign: "center", marginBottom: mm(4) },
  hr: { height: 1, backgroundColor: "#000000", marginVertical: mm(6) },
  grid: { flexDirection: "row", gap: mm(6), marginBottom: mm(6) },
  // Box padding p-8 (~32px) => ~11.3mm, border ≈ 1px
  box: { flex: 1, borderWidth: 0.75, borderColor: "#D1D5DB", padding: mm(11.3) },
  boxTitle: { fontSize: 12, fontWeight: 700, marginBottom: mm(3) },
  row: { flexDirection: "row" },
  // Label column ~20mm width to mimic layout density
  label: { width: mm(20), fontWeight: 700 },
  table: { width: "100%", borderWidth: 0.75, borderColor: "#D1D5DB" },
  thead: { backgroundColor: "#F3F4F6" },
  // Table padding p-2 (~8px) => ~2.1mm; borders ≈ 1px
  th: { fontWeight: 700, padding: mm(2.1), borderRightWidth: 0.75, borderColor: "#D1D5DB", textAlign: "center" },
  td: { padding: mm(2.1), borderRightWidth: 0.75, borderTopWidth: 0.75, borderColor: "#D1D5DB" },
  tdCenter: { textAlign: "center" },
  tdRight: { textAlign: "right" },
  totalRow: { flexDirection: "row" },
  strong: { fontWeight: 700 },
})

function formatCurrency(n: number) {
  return new Intl.NumberFormat("ko-KR").format(n)
}

export function QuoteDocument({ quote }: { quote: Quote }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>견적서</Text>
        <Text style={styles.subtitle}>작성일: {quote.date}</Text>
        <View style={styles.hr} />

        <View style={styles.grid}>
          <View style={styles.box}>
            <Text style={styles.boxTitle}>공급받는자</Text>
            <View style={styles.row}>
              <Text style={styles.label}>거래처명:</Text>
              <Text>{quote.partnerName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>담당자:</Text>
              <Text> </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>연락처:</Text>
              <Text> </Text>
            </View>
          </View>
          <View style={styles.box}>
            <Text style={styles.boxTitle}>공급자</Text>
            <View style={styles.row}>
              <Text style={styles.label}>회사명:</Text>
              <Text>{quote.companyInfo?.companyName || "우리회사"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>담당자:</Text>
              <Text>{quote.companyInfo?.manager || ""}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>연락처:</Text>
              <Text>{quote.companyInfo?.phone || ""}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.row, styles.thead]}>
            {/* 번호 w-12 ≈ 48px ≈ 12.7mm */}
            <Text style={[styles.th, { width: mm(12.7) }]}>번호</Text>
            {/* 품목명 flex */}
            <Text style={[styles.th, { flex: 1 }]}>품목명(스타일번호)</Text>
            {/* 수량 w-20 ≈ 80px ≈ 21.2mm */}
            <Text style={[styles.th, { width: mm(21.2) }]}>수량</Text>
            {/* 단가 w-24 ≈ 96px ≈ 25.4mm */}
            <Text style={[styles.th, { width: mm(25.4) }]}>단가</Text>
            {/* 금액 w-40 ≈ 160px ≈ 42.3mm */}
            <Text style={[styles.th, { width: mm(42.3) }]}>금액</Text>
            {/* 비고 w-40 ≈ 160px ≈ 42.3mm */}
            <Text style={[styles.th, { width: mm(42.3), borderRightWidth: 0 }]}>비고</Text>
          </View>
          {quote.items.map((item) => (
            <View key={item.no} style={styles.row}>
              <Text style={[styles.td, styles.tdCenter, { width: mm(12.7) }]}>{item.no}</Text>
              <Text style={[styles.td, { flex: 1 }]}>{item.productName}</Text>
              <Text style={[styles.td, styles.tdCenter, { width: mm(21.2) }]}>
                {formatCurrency(item.quantity)}
              </Text>
              <Text style={[styles.td, styles.tdRight, { width: mm(25.4) }]}>
                {formatCurrency(item.unitPrice)}원
              </Text>
              <Text style={[styles.td, styles.tdRight, { width: mm(42.3) }]}>
                {formatCurrency(item.amount)}원
              </Text>
              <Text style={[styles.td, { width: mm(42.3), borderRightWidth: 0 }]}>{item.note}</Text>
            </View>
          ))}
          <View style={styles.row}>
            <Text style={[styles.td, styles.tdCenter, styles.strong, { width: mm(12.7) }]}>합계</Text>
            <Text style={[styles.td, styles.strong, { flex: 1 }]}> </Text>
            <Text style={[styles.td, styles.strong, { width: mm(21.2) }]}></Text>
            <Text style={[styles.td, styles.strong, { width: mm(25.4) }]}></Text>
            <Text style={[styles.td, styles.tdRight, styles.strong, { width: mm(42.3) }]}>
              {formatCurrency(quote.totalAmount)}원
            </Text>
            <Text style={[styles.td, { width: mm(42.3), borderRightWidth: 0 }]}></Text>
          </View>
        </View>

        <View style={{ marginTop: mm(28) }}>
          <Text>총 공급가액: {formatCurrency(quote.totalAmount)}원</Text>
          <Text>부가세(10%): {formatCurrency(quote.tax)}원</Text>
          <Text style={{ fontSize: 13, fontWeight: 700 }}>
            총 금액: {formatCurrency(quote.finalAmount)}원
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export async function downloadQuotesReactPdfPerPartner(quotes: Quote[], filenameBase = "견적서") {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")

  for (const q of quotes) {
    const doc = <QuoteDocument quote={q} />
    const blob = await pdf(doc).toBlob()
    const fileName = `${filenameBase}_${q.partnerName}_${y}-${m}-${d}.pdf`
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}
