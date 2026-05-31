const shareUrl = 'https://drive.google.com/file/d/1abc123XYZ/view?usp=sharing'

function extractGoogleDriveId(url) {
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?[^#]*[?&]id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

function convertGoogleDriveUrl(url) {
  const fileId = extractGoogleDriveId(url.trim())
  if (!fileId) return null
  return `https://drive.google.com/uc?export=view&id=${fileId}`
}

const converted = convertGoogleDriveUrl(shareUrl)
if (converted !== 'https://drive.google.com/uc?export=view&id=1abc123XYZ') {
  console.error('Google Drive conversion failed:', converted)
  process.exit(1)
}

console.log('image-url tests passed')
