import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import UploadFileList from '../../src/components/UploadFileList'

const files = [
  { fileName: 'menu.pdf', type: 'application/pdf' },
  { fileName: 'sundae.png', type: 'image/png' },
]

describe('UploadFileList', () => {
  it('lists every file with its mime type', () => {
    render(<UploadFileList files={files} />)

    expect(screen.getByText('menu.pdf')).toBeInTheDocument()
    expect(screen.getByText('application/pdf')).toBeInTheDocument()
    expect(screen.getByText('sundae.png')).toBeInTheDocument()
    expect(screen.getByText('image/png')).toBeInTheDocument()
  })

  it('hides the remove buttons when the list is read-only', () => {
    render(<UploadFileList files={files} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('reports the index of the file to remove', async () => {
    const onRemove = vi.fn()
    render(<UploadFileList files={files} onRemove={onRemove} />)

    screen.getByRole('button', { name: 'Remove sundae.png' }).click()

    expect(onRemove).toHaveBeenCalledWith(1)
  })
})
