"use client";

import { type FC, type SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  filled?: boolean;
}

// Like Icon - Thumbs up gesture
export const LikeIcon: FC<IconProps> = ({
  size = 24,
  filled = false,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

// Dislike Icon - Thumbs down gesture
export const DislikeIcon: FC<IconProps> = ({
  size = 24,
  filled = false,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
  </svg>
);

// Heart Icon - Love/favorite
export const HeartIcon: FC<IconProps> = ({
  size = 24,
  filled = false,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// Angry Icon - Rage face expression
export const AngryIcon: FC<IconProps> = ({
  size = 24,
  filled = false,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" fill={filled ? "currentColor" : "none"} />
    <path
      d="M16 16s-1.5 2-4 2-4-2-4-2"
      stroke={filled ? "var(--color-paper)" : "currentColor"}
    />
    <path
      d="M7.5 8 10 9"
      stroke={filled ? "var(--color-paper)" : "currentColor"}
    />
    <path
      d="m14 9 2.5-1"
      stroke={filled ? "var(--color-paper)" : "currentColor"}
    />
    <path
      d="M9 10h.01"
      stroke={filled ? "var(--color-paper)" : "currentColor"}
      strokeWidth="3"
    />
    <path
      d="M15 10h.01"
      stroke={filled ? "var(--color-paper)" : "currentColor"}
      strokeWidth="3"
    />
  </svg>
);

// Laugh Icon - Joy/laughing face
export const LaughIcon: FC<IconProps> = ({
  size = 24,
  filled = false,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" fill={filled ? "currentColor" : "none"} />
    <path
      d="M8 14s1.5 2 4 2 4-2 4-2"
      stroke={filled ? "var(--color-paper)" : "currentColor"}
    />
    <path
      d="M9 9 7 9.5"
      stroke={filled ? "var(--color-paper)" : "currentColor"}
    />
    <path
      d="M17 9.5 15 9"
      stroke={filled ? "var(--color-paper)" : "currentColor"}
    />
    <path
      d="M6.5 11 6 13"
      stroke={filled ? "var(--color-paper)" : "currentColor"}
      opacity="0.6"
    />
    <path
      d="M17.5 11 18 13"
      stroke={filled ? "var(--color-paper)" : "currentColor"}
      opacity="0.6"
    />
  </svg>
);

// Wow Icon - Surprised/amazed face
export const WowIcon: FC<IconProps> = ({
  size = 24,
  filled = false,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" fill={filled ? "currentColor" : "none"} />
    <path d="M8 15h8" stroke={filled ? "var(--color-paper)" : "currentColor"} />
    <path
      d="M9 9h.01"
      stroke={filled ? "var(--color-paper)" : "currentColor"}
      strokeWidth="3"
    />
    <path
      d="M15 9h.01"
      stroke={filled ? "var(--color-paper)" : "currentColor"}
      strokeWidth="3"
    />
  </svg>
);

// Sad Icon - Crying/sad face
export const SadIcon: FC<IconProps> = ({
  size = 24,
  filled = false,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" fill={filled ? "currentColor" : "none"} />
    <path
      d="M8 16s1.5-2 4-2 4 2 4 2"
      stroke={filled ? "var(--color-paper)" : "currentColor"}
    />
    <path
      d="M8 9h.01"
      stroke={filled ? "var(--color-paper)" : "currentColor"}
      strokeWidth="3"
    />
    <path
      d="M16 9h.01"
      stroke={filled ? "var(--color-paper)" : "currentColor"}
      strokeWidth="3"
    />
    <path
      d="M9.5 12c.5-1 1.5-1 2.5-1s2 .5 2.5 1"
      stroke={filled ? "var(--color-paper)" : "currentColor"}
      opacity="0.6"
    />
  </svg>
);

// Reaction type configuration for mapping
export const REACTION_ICONS = {
  like: { Icon: LikeIcon, label: "إعجاب", color: "text-blue-500" },
  dislike: { Icon: DislikeIcon, label: "عدم إعجاب", color: "text-gray-500" },
  heart: { Icon: HeartIcon, label: "قلب", color: "text-red-500" },
  angry: { Icon: AngryIcon, label: "غاضب", color: "text-orange-500" },
  laugh: { Icon: LaughIcon, label: "ضحك", color: "text-yellow-500" },
  wow: { Icon: WowIcon, label: "مندهش", color: "text-purple-500" },
  sad: { Icon: SadIcon, label: "حزين", color: "text-blue-400" },
} as const;

export type ReactionType = keyof typeof REACTION_ICONS;
