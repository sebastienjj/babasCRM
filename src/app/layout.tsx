import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/QueryProvider'
import AuthProvider from "@/providers/SessionProvider"
import ProtectedLayout from "@/components/ProtectedLayout"
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Premia Studio',
  description: 'Web design project management by Premia Studio',
  icons: {
    icon: '/icons/Logo.svg',
  },

}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <ProtectedLayout>{children}</ProtectedLayout>
                  <Toaster position="top-right"  reverseOrder={false} />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}