import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.8V21h13V9.8" />
    </IconBase>
  );
}

export function IconShoppingBag(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 7h14l-1 12H6L5 7z" />
      <path d="M8 9V5a4 4 0 1 1 8 0v4" />
    </IconBase>
  );
}

export function IconSend(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 11.5 21 3l-7.5 18-2.8-6.7L3 11.5z" />
      <path d="M10.7 14.3 21 3" />
    </IconBase>
  );
}

export function IconMail(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 8l9 6 9-6" />
    </IconBase>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7.5 4.5h3l1 3-1.8 1.8a13 13 0 0 0 5 5l1.8-1.8 3 1v3a2 2 0 0 1-2.2 2c-7.3-.6-13.2-6.5-13.8-13.8a2 2 0 0 1 2-2.2z" />
    </IconBase>
  );
}

export function IconOpenInNew(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14 5h5v5" />
      <path d="M10 14 19 5" />
      <path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" />
    </IconBase>
  );
}

export function IconCamera(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
      <circle cx="12" cy="13" r="3.2" />
    </IconBase>
  );
}

export function IconGroups(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="8" cy="9" r="2.5" />
      <circle cx="16" cy="9" r="2.5" />
      <path d="M3.5 18a4.5 4.5 0 0 1 9 0" />
      <path d="M11.5 18a4.5 4.5 0 0 1 9 0" />
    </IconBase>
  );
}

export function IconInstagram(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </IconBase>
  );
}