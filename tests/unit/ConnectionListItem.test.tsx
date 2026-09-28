import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ConnectionListItem } from '../../src/components/ConnectionListItem'
import { UploaderConnection, UploaderConnectionStatus } from '../../src/types'

const makeConn = (
  overrides: Partial<UploaderConnection> = {},
): UploaderConnection =>
  ({
    status: UploaderConnectionStatus.Ready,
    dataConnection: {} as UploaderConnection['dataConnection'],
    completedFiles: 0,
    totalFiles: 2,
    currentFileProgress: 0,
    ...overrides,
  }) as UploaderConnection

describe('ConnectionListItem', () => {
  it('falls back to a generic label before the client identifies itself', () => {
    render(<ConnectionListItem conn={makeConn()} />)
    expect(screen.getByText('Customer')).toBeInTheDocument()
  })

  it('shows the browser and version once known', () => {
    render(
      <ConnectionListItem
        conn={makeConn({ browserName: 'Firefox', browserVersion: '121' })}
      />,
    )
    expect(screen.getByText('Firefox')).toBeInTheDocument()
    expect(screen.getByText('v121')).toBeInTheDocument()
  })

  it('renders a human readable status', () => {
    render(
      <ConnectionListItem
        conn={makeConn({ status: UploaderConnectionStatus.InvalidPassword })}
      />,
    )
    expect(screen.getByText('INVALID PASSWORD')).toBeInTheDocument()
  })

  it('reports completed file counts', () => {
    render(<ConnectionListItem conn={makeConn({ completedFiles: 1 })} />)
    expect(screen.getByText('Completed: 1 / 2 files')).toBeInTheDocument()
  })

  it('only shows per-file progress while uploading', () => {
    const { rerender } = render(
      <ConnectionListItem
        conn={makeConn({
          status: UploaderConnectionStatus.Uploading,
          uploadingFileName: 'menu.pdf',
          currentFileProgress: 0.42,
        })}
      />,
    )
    expect(screen.getByText('Current file: 42%')).toBeInTheDocument()

    rerender(
      <ConnectionListItem
        conn={makeConn({
          status: UploaderConnectionStatus.Ready,
          uploadingFileName: 'menu.pdf',
          currentFileProgress: 0.42,
        })}
      />,
    )
    expect(screen.queryByText('Current file: 42%')).not.toBeInTheDocument()
  })
})
