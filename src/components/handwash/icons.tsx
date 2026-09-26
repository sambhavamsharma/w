/** Small inline icon set shared by the hero nav, CTA and social rows. */

export function ArrowIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function FacebookIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.5 21v-7.5H16l.5-3h-3V8.5c0-.87.24-1.46 1.49-1.46H16V4.35c-.27-.03-1.21-.11-2.3-.11-2.28 0-3.84 1.39-3.84 3.95v2.31H7.5v3h2.36V21h3.64Z" />
    </svg>
  );
}

export function XIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.24 2H21l-6.53 7.46L22 22h-6.84l-5.35-6.94L3.6 22H1l7.02-8.03L2 2h6.98l4.83 6.35L18.24 2Zm-1.2 18h1.86L7.03 3.9H5.06L17.04 20Z" />
    </svg>
  );
}

export function LinkedInIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4.98 3.5a2.5 2.5 0 1 1-.02 5 2.5 2.5 0 0 1 .02-5ZM3 9.75h4V21H3V9.75Zm6 0h3.83v1.55h.05c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.14V21h-4v-4.9c0-1.17-.02-2.68-1.64-2.68-1.64 0-1.9 1.28-1.9 2.6V21H9V9.75Z" />
    </svg>
  );
}
