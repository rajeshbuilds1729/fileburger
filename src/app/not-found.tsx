import { JSX } from 'react'
import Spinner from '../components/Spinner'
import Wordmark from '../components/Wordmark'
import ReturnHome from '../components/ReturnHome'
import TitleText from '../components/TitleText'

export const metadata = {
  title: 'FileBurger — 404: Order Not Found',
  description: 'Oops! This FileBurger looks like it got eaten.',
}

export default async function NotFound(): Promise<JSX.Element> {
  return (
    <div className="flex flex-col items-center space-y-5 py-8 sm:py-10 max-w-2xl mx-auto px-4 w-full">
      <Spinner direction="down" />
      <Wordmark />
      <TitleText>404: Looks like this burger got eaten!</TitleText>
      <ReturnHome />
    </div>
  )
}
