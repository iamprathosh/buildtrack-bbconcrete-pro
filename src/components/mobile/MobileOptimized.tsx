import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileOptimizedProps {
  children: React.ReactNode;
  mobileComponent?: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
}

export const MobileOptimized: React.FC<MobileOptimizedProps> = ({
  children,
  mobileComponent,
  className = '',
  mobileClassName = '',
  desktopClassName = ''
}) => {
  const isMobile = useIsMobile();

  if (isMobile && mobileComponent) {
    return (
      <div className={cn(className, mobileClassName)}>
        {mobileComponent}
      </div>
    );
  }

  return (
    <div className={cn(className, isMobile ? mobileClassName : desktopClassName)}>
      {children}
    </div>
  );
};

interface MobileGridProps {
  children: React.ReactNode;
  cols?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  className?: string;
}

export const MobileGrid: React.FC<MobileGridProps> = ({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: 4, tablet: 6, desktop: 8 },
  className = ''
}) => {
  const gridClasses = cn(
    'grid',
    `grid-cols-${cols.mobile}`,
    `md:grid-cols-${cols.tablet}`,
    `lg:grid-cols-${cols.desktop}`,
    `gap-${gap.mobile}`,
    `md:gap-${gap.tablet}`,
    `lg:gap-${gap.desktop}`,
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

interface MobileStackProps {
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal';
  spacing?: number;
  mobileDirection?: 'vertical' | 'horizontal';
  className?: string;
}

export const MobileStack: React.FC<MobileStackProps> = ({
  children,
  direction = 'vertical',
  spacing = 4,
  mobileDirection = 'vertical',
  className = ''
}) => {
  const isMobile = useIsMobile();
  const currentDirection = isMobile ? mobileDirection : direction;
  
  const stackClasses = cn(
    'flex',
    currentDirection === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
    `gap-${spacing}`,
    className
  );

  return (
    <div className={stackClasses}>
      {children}
    </div>
  );
};