// right-sidebar関連の型定義

// ポイント変更データの型定義
export interface PointChangeData {
  title: string
  dateTime: string
  changer: string
  changee: string
  pointText: string
  pointTextColor: string
  reason: string
}

// ポイント変更カードのProps型定義
// extends使わないで
export interface PointChangeCardProps {
  className?: string
  onClick?: () => void
  pointChangeData : PointChangeData
}

// AppSidebarのProps型定義
export interface AppSidebarProps {
  onCardClick: (data: PointChangeData) => void
}

// ModalのProps型定義
export interface ModalProps {
  onClose: () => void
  title: string
  reason: string
}

