import type { FC } from 'react';

export const BloodPressureIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a4.4 4.4 0 0 0-4.4 4.4c0 2.4 1.9 4.3 4.4 4.3s4.4-1.9 4.4-4.3A4.4 4.4 0 0 0 12 2z" />
    <path d="M12 12.5a7.5 7.5 0 0 0-7.5 7.5v2h15v-2a7.5 7.5 0 0 0-7.5-7.5z" />
    <path d="M17 10.7a2.5 2.5 0 0 1 0-5" />
    <path d="m19.3 3.8-1.8 1.8" />
  </svg>
);
