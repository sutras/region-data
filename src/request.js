import ora from 'ora'

export async function request(url, options = {}) {
  const controller = new AbortController()
  const signal = controller.signal
  options.signal = signal

  let retry = options.retry || 0

  let timer = null
  if (options.timeout) {
    timer = setTimeout(() => {
      timer = null
      controller.abort()

      if (retry > 0) {
        ora().warn(`请求超时，正在重试...（${url}）`)
      } else {
        ora().fail(`请求超时（${url}）`)
      }
    }, options.timeout)
  }

  try {
    const res = await fetch(url, options)
    if (!res.ok) {
      throw res
    }
    return res
  } catch (err) {
    if (retry-- > 0) {
      return request(url, {
        ...options,
        retry,
      })
    } else {
      throw err
    }
  } finally {
    if (timer) {
      clearTimeout(timer)
    }
  }
}
