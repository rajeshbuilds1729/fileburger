'use client'

import React, { JSX } from 'react'

const SOURCE_URL = 'https://github.com/kern/filepizza'

function FooterLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}): JSX.Element {
  return (
    <a
      className="text-stone-500 dark:text-stone-400 underline hover:text-crust-500 dark:hover:text-bun-400"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
}

export function Footer(): JSX.Element {
  return (
    <>
      {/* Spacer so the fixed footer never covers page content. */}
      <div className="h-[92px]" />
      <footer className="fixed bottom-0 left-0 right-0 text-center py-2.5 pb-3 text-xs border-t border-stone-200 dark:border-stone-800 bg-bun-50/90 dark:bg-[#17120f]/90 backdrop-blur">
        <div className="flex flex-col items-center space-y-1 px-4 sm:px-6">
          <p className="text-stone-500 dark:text-stone-400">
            <strong>FileBurger</strong> is a burger-themed tribute to{' '}
            <FooterLink href={SOURCE_URL}>FilePizza</FooterLink> by Alex Kern
            &amp; Neeraj Baid. Your files never touch our servers.
          </p>
          <p className="text-stone-400 dark:text-stone-500">
            <FooterLink href={`${SOURCE_URL}#faq`}>FAQ</FooterLink>
            {' · '}
            <FooterLink href={`${SOURCE_URL}#what-s-new-with-filepizza-v2`}>
              Protocol
            </FooterLink>
            {' · '}
            <span className="italic">Served best with extra sauce</span>
          </p>
        </div>
      </footer>
    </>
  )
}

export default Footer
