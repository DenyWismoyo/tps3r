import { Fragment } from 'react';
import { Container } from '@/components/ui/Container';

export interface PageBannerProps {
  title: string;
  subtitle?: string;
  breadcrumb?: readonly string[];
}

export function PageBanner({ title, subtitle, breadcrumb }: PageBannerProps) {
  return (
    <section className="page-banner no-print">
      <Container>
        {breadcrumb && breadcrumb.length > 0 ? (
          <nav className="breadcrumb" aria-label="Breadcrumb">
            {breadcrumb.map((crumb, idx) => (
              <Fragment key={`${crumb}-${idx}`}>
                {idx > 0 ? (
                  <span className="breadcrumb__sep" aria-hidden="true">
                    /
                  </span>
                ) : null}
                <span>{crumb}</span>
              </Fragment>
            ))}
          </nav>
        ) : null}
        <h1>{title}</h1>
        {subtitle ? <p className="page-banner__subtitle">{subtitle}</p> : null}
      </Container>
    </section>
  );
}
