export async function checkRedirect(url: string) {
  const response = await fetch(url, {
    method: 'HEAD',
    redirect: 'manual',
  })

  if (response.status >= 300 && response.status < 400) {
    const redirectUrl = response.headers.get('location')
    return redirectUrl
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else {
    return url
  }
}
