"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/status/StatusBadge"

export type WorkStatusCaptureItem = {
  id: string
  partnerName: string
  styleNo: string
  imageUrl: string
  orderQuantity: number
  receiveDate: string
  expectedShipDate: string
  status: string
  designMemo?: string
  workQuantity: number
  shipDate: string
  salesMemo?: string
}

export type WorkStatusCaptureViewProps = {
  data: WorkStatusCaptureItem[]
  filterSummary: {
    partner: string
    status: string
    period: string
  }
  className?: string
}

export const WorkStatusCaptureView = React.forwardRef<HTMLDivElement, WorkStatusCaptureViewProps>(
  ({ data, filterSummary, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-[1200px] bg-background px-10 py-8 text-foreground",
          "space-y-6 border border-border shadow-sm",
          className,
        )}
      >
        <section className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">작업 현황</h2>
          </div>
          <div className="rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-xs leading-relaxed text-gray-600">
            <p>
              <span className="font-semibold text-gray-700">거래처:</span> {filterSummary.partner}
            </p>
            <p>
              <span className="font-semibold text-gray-700">진행 상태:</span> {filterSummary.status}
            </p>
            <p>
              <span className="font-semibold text-gray-700">기간:</span> {filterSummary.period}
            </p>
          </div>
        </section>

        <section>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full border-collapse text-[13px] leading-relaxed">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="border-b border-border px-3 py-2 text-left">이미지</th>
                  <th className="border-b border-border px-3 py-2 text-left">거래처명</th>
                  <th className="border-b border-border px-3 py-2 text-left">스타일넘버</th>
                  <th className="border-b border-border px-3 py-2 text-right">오더수량</th>
                  <th className="border-b border-border px-3 py-2 text-center">입고일</th>
                  <th className="border-b border-border px-3 py-2 text-center">예상출고일</th>
                  <th className="border-b border-border px-3 py-2 text-center">진행상태</th>
                  <th className="border-b border-border px-3 py-2 text-right">작업수량</th>
                  <th className="border-b border-border px-3 py-2 text-center">출고일</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-12 text-center text-sm text-gray-500"
                    >
                      조건에 해당하는 작업 현황이 없습니다.
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="odd:bg-background even:bg-muted/50">
                      <td className="border-t border-border px-3 py-3">
                        <div className="flex items-center justify-center">
                          <img
                            src={item.imageUrl}
                            alt={`${item.partnerName} / ${item.styleNo}`}
                            className="h-16 w-16 rounded-md border border-border object-cover"
                          />
                        </div>
                      </td>
                      <td className="border-t border-border px-3 py-3 font-medium text-foreground">
                        {item.partnerName}
                      </td>
                      <td className="border-t border-border px-3 py-3 text-muted-foreground">{item.styleNo}</td>
                      <td className="border-t border-border px-3 py-3 text-right font-medium text-foreground">
                        {item.orderQuantity.toLocaleString()}개
                      </td>
                      <td className="border-t border-border px-3 py-3 text-center text-muted-foreground">{item.receiveDate}</td>
                      <td className="border-t border-border px-3 py-3 text-center text-muted-foreground">
                        {item.expectedShipDate}
                      </td>
                      <td className="border-t border-border px-3 py-3 text-center">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="border-t border-border px-3 py-3 text-right font-medium text-foreground">
                        {item.workQuantity.toLocaleString()}개
                      </td>
                      <td className="border-t border-border px-3 py-3 text-center text-muted-foreground">{item.shipDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    )
  },
)

WorkStatusCaptureView.displayName = "WorkStatusCaptureView"
