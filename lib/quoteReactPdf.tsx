"use client"

import React from "react"
import { Document, Page, Text, View, StyleSheet, pdf, Font, Image } from "@react-pdf/renderer"
import JSZip from "jszip"
import type { TransactionStatement } from "@/lib/work-status/exporters"

try {
  Font.register({
    family: "NotoSansKR",
    fonts: [
      { src: "/fonts/Noto_Sans_KR/static/NotoSansKR-Regular.ttf", fontWeight: "normal" },
      { src: "/fonts/Noto_Sans_KR/static/NotoSansKR-Bold.ttf", fontWeight: "bold" },
    ],
  })
} catch (error) {
  try {
    Font.register({
      family: "NotoSansKR",
      fonts: [
        { src: "/fonts/NotoSansKR-Regular.ttf", fontWeight: "normal" },
        { src: "/fonts/NotoSansKR-Bold.ttf", fontWeight: "bold" },
      ],
    })
  } catch (fontError) {
    // ignore when font registration fails in non-browser envs
  }
}

const mm = (value: number) => value * 2.83465
const BORDER_PRIMARY = "#1D4ED8"

const styles = StyleSheet.create({
  page: { padding: mm(10), fontSize: 11, fontFamily: "NotoSansKR", color: "#111827" },
  title: { fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: mm(4) },
  subtitle: { fontSize: 11, textAlign: "right", marginBottom: mm(4) },
  infoRow: { flexDirection: "row", gap: mm(4), marginBottom: mm(6) },
  infoBox: { flex: 1, borderWidth: 1, borderColor: BORDER_PRIMARY, borderRadius: 4, padding: mm(4) },
  infoTitle: { fontWeight: 700, fontSize: 12, marginBottom: mm(2), color: BORDER_PRIMARY },
  infoLine: { flexDirection: "row", alignItems: "center", marginBottom: mm(1.2) },
  infoLabel: { width: mm(22), fontWeight: 700 },
  supplierLine: { flexDirection: "row", alignItems: "center" },
  supplierValue: { flex: 1 },
  sealInlineBox: {
    width: mm(24),
    height: mm(24),
    position: "absolute",
    right: 0,
    top: mm(-4),
    justifyContent: "center",
    alignItems: "center",
  },
  sealImageInline: { width: "90%", height: "90%", objectFit: "contain" },
  table: { borderWidth: 1, borderColor: BORDER_PRIMARY, borderRadius: 4, overflow: "hidden" },
  theadRow: { flexDirection: "row", backgroundColor: "#DBEAFE" },
  headerCell: {
    flexDirection: "row",
    flexGrow: 1,
    paddingVertical: mm(2.2),
    paddingHorizontal: mm(2.4),
    fontWeight: 700,
    textAlign: "center",
    borderColor: BORDER_PRIMARY,
    borderStyle: "solid",
    borderRightWidth: 1,
  },
  bodyRow: { flexDirection: "row", borderTopWidth: 1, borderColor: BORDER_PRIMARY },
  bodyCell: {
    flexGrow: 1,
    paddingVertical: mm(2.2),
    paddingHorizontal: mm(2.4),
    borderColor: BORDER_PRIMARY,
    borderStyle: "solid",
    borderRightWidth: 1,
  },
  bodyCellCenter: { textAlign: "center" },
  bodyCellRight: { textAlign: "right" },
  totalsBox: {
    marginTop: mm(6),
    borderWidth: 1,
    borderColor: BORDER_PRIMARY,
    borderRadius: 4,
    padding: mm(4),
    gap: mm(1.8),
  },
  totalLabel: { fontWeight: 700 },
  footer: { marginTop: mm(6), flexDirection: "row", justifyContent: "flex-start", alignItems: "center" },
  accountBox: { flex: 1, borderWidth: 1, borderColor: BORDER_PRIMARY, borderRadius: 4, padding: mm(4) },
  accountLabel: { fontWeight: 700, marginBottom: mm(1.2) },
})

const columnWidths = [mm(12), mm(52), mm(18), mm(22), mm(24), mm(24)]

const formatCurrency = (value: number) => new Intl.NumberFormat("ko-KR").format(value)

type TransactionStatementDocumentProps = {
  statement: TransactionStatement
}

const InfoLine: React.FC<{ label: string; value?: string; children?: React.ReactNode }> = ({ label, value, children }) => (
  <View style={styles.infoLine}>
    <Text style={styles.infoLabel}>{label}</Text>
    {children ? children : <Text>{value || ""}</Text>}
  </View>
)

export function TransactionStatementDocument({ statement }: TransactionStatementDocumentProps) {
  const { buyer, supplier, items, totalAmount, tax, finalAmount, date } = statement

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>거래명세서</Text>
        <Text style={styles.subtitle}>작성일: {date}</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>공급받는자</Text>
            <InfoLine label="상호" value={buyer.name} />
            <InfoLine label="등록번호" value={buyer.registrationNumber} />
            <InfoLine label="사업장" value={buyer.businessAddress} />
            <InfoLine label="담당자" value={buyer.contactPerson} />
            <InfoLine label="연락처" value={buyer.phone} />
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>공급자</Text>
            <View style={{ position: "relative" }}>
              {supplier.sealImageDataUrl ? (
                <View style={styles.sealInlineBox}>
                  <Image src={supplier.sealImageDataUrl} style={styles.sealImageInline} />
                </View>
              ) : null}
              <InfoLine label="상호">
                <Text style={styles.supplierValue}>{supplier.companyName}</Text>
              </InfoLine>
            </View>
            <InfoLine label="등록번호" value={supplier.registrationNumber} />
            <InfoLine label="사업장" value={supplier.businessAddress} />
            <InfoLine label="대표자" value={supplier.representativeName ?? ""} />
            <InfoLine label="연락처" value={supplier.phone} />
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.theadRow}>
            {[
              "번호",
              "품목(스타일)",
              "수량",
              "단가",
              "금액",
              "비고",
            ].map((header, index, array) => (
              <Text
                key={header}
                style={[
                  styles.headerCell,
                  {
                    width: columnWidths[index],
                    borderRightWidth: index === array.length - 1 ? 0 : 1,
                  },
                ]}
              >
                {header}
              </Text>
            ))}
          </View>
          {items.map((item) => (
            <View key={item.no} style={styles.bodyRow}>
              <Text
                style={[styles.bodyCell, styles.bodyCellCenter, { width: columnWidths[0], borderRightWidth: 1 }]}
              >
                {item.no}
              </Text>
              <Text style={[styles.bodyCell, { width: columnWidths[1], borderRightWidth: 1 }]}>{item.productName}</Text>
              <Text
                style={[styles.bodyCell, styles.bodyCellCenter, { width: columnWidths[2], borderRightWidth: 1 }]}
              >
                {formatCurrency(item.quantity)}
              </Text>
              <Text style={[styles.bodyCell, styles.bodyCellRight, { width: columnWidths[3], borderRightWidth: 1 }]}
              >
                {formatCurrency(item.unitPrice)}원
              </Text>
              <Text style={[styles.bodyCell, styles.bodyCellRight, { width: columnWidths[4], borderRightWidth: 1 }]}
              >
                {formatCurrency(item.amount)}원
              </Text>
              <Text style={[styles.bodyCell, { width: columnWidths[5], borderRightWidth: 0 }]}>{item.note}</Text>
            </View>
          ))}
          <View style={styles.bodyRow}>
            <Text style={[styles.bodyCell, styles.bodyCellCenter, { width: columnWidths[0], borderRightWidth: 1 }]}
            >
              합계
            </Text>
            <Text style={[styles.bodyCell, { width: columnWidths[1], borderRightWidth: 1 }]}></Text>
            <Text style={[styles.bodyCell, { width: columnWidths[2], borderRightWidth: 1 }]}></Text>
            <Text style={[styles.bodyCell, { width: columnWidths[3], borderRightWidth: 1 }]}></Text>
            <Text style={[styles.bodyCell, styles.bodyCellRight, { width: columnWidths[4], borderRightWidth: 1 }]}
            >
              {formatCurrency(totalAmount)}원
            </Text>
            <Text style={[styles.bodyCell, { width: columnWidths[5], borderRightWidth: 0 }]}></Text>
          </View>
        </View>

        <View style={styles.totalsBox}>
          <Text>
            <Text style={styles.totalLabel}>공급가액: </Text>
            {formatCurrency(totalAmount)}원
          </Text>
          <Text>
            <Text style={styles.totalLabel}>부가세(10%): </Text>
            {formatCurrency(tax)}원
          </Text>
          <Text>
            <Text style={styles.totalLabel}>합계금액: </Text>
            {formatCurrency(finalAmount)}원
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.accountBox}>
            <Text style={styles.accountLabel}>입금 계좌</Text>
            <Text>{supplier.accountNumber}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

async function createPdfBlob(statement: TransactionStatement) {
  const doc = <TransactionStatementDocument statement={statement} />
  return pdf(doc).toBlob()
}

export async function downloadTransactionStatementsZipReactPdf(
  statements: TransactionStatement[],
  filenameBase = "거래명세서_일괄",
) {
  const zip = new JSZip()
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")

  for (const statement of statements) {
    const blob = await createPdfBlob(statement)
    const arrayBuf = await blob.arrayBuffer()
    const fileName = `거래명세서_${statement.buyer.name}_${y}-${m}-${d}.pdf`
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

export async function downloadTransactionStatementReactPdf(
  statement: TransactionStatement,
  filenameBase = "거래명세서",
) {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  const blob = await createPdfBlob(statement)
  const fileName = `${filenameBase}_${statement.buyer.name}_${y}-${m}-${d}.pdf`
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function printTransactionStatementReactPdf(statement: TransactionStatement) {
  const blob = await createPdfBlob(statement)
  const url = URL.createObjectURL(blob)
  const win = window.open(url)
  if (win) {
    const tryPrint = () => {
      try {
        win.focus()
        win.print()
      } catch (error) {
        console.warn("Failed to trigger print", error)
      }
    }
    setTimeout(tryPrint, 800)
  }
}

export async function downloadTransactionStatementsReactPdfPerPartner(
  statements: TransactionStatement[],
  filenameBase = "거래명세서",
) {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")

  for (const statement of statements) {
    const blob = await createPdfBlob(statement)
    const fileName = `${filenameBase}_${statement.buyer.name}_${y}-${m}-${d}.pdf`
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

export type { TransactionStatement }
