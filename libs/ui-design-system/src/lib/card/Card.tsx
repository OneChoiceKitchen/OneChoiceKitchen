import React from 'react';
import styles from './Card.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = '', style, ...props }: CardProps) {
  return (
    <div className={`${styles.card} ${className}`} style={style} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`${styles.cardHeader} ${className}`} style={style} {...props}>{children}</div>;
}

export function CardTitle({ children, className = '', style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`${styles.cardTitle} ${className}`} style={style} {...props}>{children}</h3>;
}

export function CardContent({ children, className = '', style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`${styles.cardContent} ${className}`} style={style} {...props}>{children}</div>;
}

export function CardFooter({ children, className = '', style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`${styles.cardFooter} ${className}`} style={style} {...props}>{children}</div>;
}
