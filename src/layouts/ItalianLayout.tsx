import { type ReactNode } from 'react';
import { DualBg } from '../components/DualBg';

export interface ItalianLayoutProps {
  children: ReactNode;
  /** Contenido que va dentro del main (debajo del header). */
  showHeader?: ReactNode;
  showFooter?: ReactNode;
}

export function ItalianLayout({
  children,
  showHeader,
  showFooter,
}: ItalianLayoutProps) {
  return (
    <>
      <DualBg />
      {showHeader}
      {children}
      {showFooter}
    </>
  );
}
