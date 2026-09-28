import { JSX } from 'react'
import Spinner from '../../components/Spinner'
import Wordmark from '../../components/Wordmark'
import TitleText from '../../components/TitleText'
import ReturnHome from '../../components/ReturnHome'

export const metadata = {
  title: 'FileBurger — Order called off',
  description: 'This FileBurger delivery has been halted.',
}

export default function ReportedPage(): JSX.Element {
  return (
    <div className="flex flex-col items-center space-y-5 py-8 sm:py-10 max-w-md mx-auto px-4 w-full">
      <Spinner direction="down" />
      <Wordmark />

      <TitleText>This order has been called off.</TitleText>
      <div className="px-8 py-6 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
        <h3 className="text-lg font-medium text-stone-800 dark:text-stone-200 mb-4">
          Message from the management
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
          Much like a burger with questionable toppings, we have had to pull
          this order for a possible breach of our terms of service. Our quality
          team is looking into it so we can keep the bar high.
        </p>
        <div className="text-sm text-stone-500 dark:text-stone-400 italic">
          — The FileBurger Team
        </div>
      </div>

      <ReturnHome />
    </div>
  )
}
