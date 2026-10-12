// The list of guide pages. Shown on the landing page and on /guides/.
// When you write a new guide in src/pages/guides/, add it here too.
export interface Guide {
  href: string;
  title: string;
  blurb: string;
  tag: string; // small label, e.g. the category
}

export const GUIDES: Guide[] = [
  {
    href: '/guides/best-laptops-for-cs-students/',
    title: 'Best laptops for CS students',
    blurb: 'How much RAM you really need for coding, why SSD matters, and our top picks.',
    tag: 'Laptops',
  },
  {
    href: '/guides/best-laptops-under-30000/',
    title: 'Best laptops under ₱30,000',
    blurb: 'Solid student laptops that don’t break the budget, plus traps to avoid.',
    tag: 'Budget',
  },
];
