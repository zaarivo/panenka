import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function HangerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 7a2 2 0 1 1 2-2" />
      <path d="M12 7v1.5L3 15a1.5 1.5 0 0 0 1 2.7h16a1.5 1.5 0 0 0 1-2.7l-9-6.5" />
    </Icon>
  )
}

export function ShopIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 8h14l-1 12H6L5 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </Icon>
  )
}

export function AcademyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="3" width="16" height="18" rx="3" />
      <path d="M8 8h3M9.5 6.5v3M13 8h3M8 15l3 3M11 15l-3 3M13 15.5h3M13 17.5h3" />
    </Icon>
  )
}

export function TrophyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
      <path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v3M8 21h8M9 17h6v4H9z" />
    </Icon>
  )
}

export function BackspaceIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7 6-7z" />
      <path d="M12 9l5 6M17 9l-5 6" />
    </Icon>
  )
}

export function SoundOnIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 9h4l5-4v14l-5-4H4z" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
    </Icon>
  )
}

export function SoundOffIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 9h4l5-4v14l-5-4H4z" />
      <path d="M17 9.5l5 5M22 9.5l-5 5" />
    </Icon>
  )
}

export function GearIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </Icon>
  )
}

export function CameraIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </Icon>
  )
}
