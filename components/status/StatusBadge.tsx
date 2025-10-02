import { Badge } from "@/components/ui/badge"

type StatusBadgeProps = {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "대기중":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          {status}
        </Badge>
      )
    case "작업중":
      return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>
    case "후가공중":
      return <Badge className="bg-purple-100 text-purple-800">{status}</Badge>
    case "배송완료":
      return <Badge className="bg-green-100 text-green-800">{status}</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}
