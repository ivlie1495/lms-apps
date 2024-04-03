'use client'

import ReactConfetti from 'react-confetti'

import { useConfettiStore } from '@/hooks/use-confetti-store'

const ConfettiProvider = () => {
  const { isOpen, onClose } = useConfettiStore()

  if (!isOpen) {
    return null
  }

  return (
    <ReactConfetti
      className="pointer-envets-none z-[100]"
      numberOfPieces={500}
      recycle={false}
      onConfettiComplete={onClose}
    />
  )
}

export default ConfettiProvider
