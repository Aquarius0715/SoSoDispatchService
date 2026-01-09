// right-sidebar関連の型定義

// ポイント変更データの型定義
export type PointChangeData = {
  title: string
  dateTime: string
  changer: string
  changee: string
  pointText: string
  pointTextColor: string
  reason: string
}

// ポイント変更カードのProps型定義
export type PointChangeCardProps = PointChangeData & {
  className?: string
  onClick?: () => void
}

// AppSidebarのProps型定義
export type AppSidebarProps = {
  onCardClick: (data: PointChangeData) => void
}

// ModalのProps型定義
export type ModalProps = {
  onClose: () => void
  title: string
  reason: string
}

