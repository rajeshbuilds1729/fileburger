import { createZipStream } from '../zip-stream'

// Safari still needs the web streams polyfill for the zip writer.
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('web-streams-polyfill/polyfill')
}

const streamSaver =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  typeof window !== 'undefined' ? require('streamsaver') : null

if (typeof window !== 'undefined') {
  streamSaver.mitm = `${window.location.protocol}//${window.location.host}/stream.html`
}

type DownloadFileStream = {
  name: string
  size: number
  stream: () => ReadableStream<Uint8Array>
}

/**
 * Writes a single incoming stream straight to disk. Nothing is buffered in
 * memory, so file size is limited only by the browser's disk.
 */
export async function streamDownloadSingleFile(
  file: DownloadFileStream,
  filename: string,
): Promise<void> {
  const fileStream = streamSaver.createWriteStream(filename, {
    size: file.size,
  })

  const writer = fileStream.getWriter()
  const reader = file.stream().getReader()

  const pump = async (): Promise<void> => {
    const res = await reader.read()
    return res.done ? writer.close() : writer.write(res.value).then(pump)
  }
  await pump()
}

/** Zips several incoming streams into a single download on the fly. */
export function streamDownloadMultipleFiles(
  files: Array<DownloadFileStream>,
  filename: string,
): Promise<void> {
  const totalSize = files.reduce((acc, file) => acc + file.size, 0)
  const fileStream = streamSaver.createWriteStream(filename, {
    size: totalSize,
  })

  const readableZipStream = createZipStream({
    start(ctrl: ReadableStreamDefaultController<any>) {
      for (const file of files) {
        ctrl.enqueue(file)
      }
      ctrl.close()
    },
    async pull(_ctrl) {
      // Called every time the zip stream asks for more data.
    },
  })

  return readableZipStream.pipeTo(fileStream)
}
