'use client';

import { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';

const STATIC_TITLES: Record<string, string> = {
  '/': 'Home | ICPWork',
  '/login': 'Login | ICPWork',
  '/signup': 'Sign Up | ICPWork',
  '/freelancer/dashboard': 'Dashboard | Freelancer | ICPWork',
  '/freelancer/my-services': 'My Services | Freelancer | ICPWork',
  '/freelancer/analytics': 'Analytics | Freelancer | ICPWork',
  '/freelancer/projects': 'Projects | Freelancer | ICPWork',
  '/client/dashboard': 'Dashboard | Client | ICPWork',
  '/client/browse-services': 'Browse Services | Client | ICPWork',
  '/client/my-projects': 'My Projects | Client | ICPWork',
};

const DYNAMIC_RULES: Array<{ test: RegExp; title: string }> = [
  {
    test: /^\/freelancer\/update-service\//,
    title: 'Update Service | Freelancer | ICPWork',
  },
  {
    test: /^\/freelancer\/service-preview\//,
    title: 'Service Preview | Freelancer | ICPWork',
  },
  {
    test: /^\/freelancer\/add-service/,
    title: 'Add Service | Freelancer | ICPWork',
  },
  {
    test: /^\/client\/service\//,
    title: 'Service Details | Client | ICPWork',
  },
  {
    test: /^\/client\/payment\//,
    title: 'Payment | Client | ICPWork',
  },
];

const fallbackTitle = (pathname: string) => {
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .map((segment) =>
      segment
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase()),
    );

  if (segments.length === 0) {
    return 'ICPWork';
  }

  return `${segments.join(' | ')} | ICPWork`;
};

export function PageTitleManager() {
  const pathname = usePathname();

  const resolvedTitle = useMemo(() => {
    if (!pathname) {
      return 'ICPWork';
    }

    if (STATIC_TITLES[pathname]) {
      return STATIC_TITLES[pathname];
    }

    const matchedRule = DYNAMIC_RULES.find((rule) =>
      rule.test.test(pathname),
    );
    if (matchedRule) {
      return matchedRule.title;
    }

    return fallbackTitle(pathname);
  }, [pathname]);

  useEffect(() => {
    if (resolvedTitle) {
      document.title = resolvedTitle;
    }
  }, [resolvedTitle]);

  return null;
}

