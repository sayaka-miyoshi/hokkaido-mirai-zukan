import PostImage from '@/components/PostImage'
import { POST_CARD_THUMBNAIL } from '@/lib/home-layout'

type PostThumbnailProps = {
  src: string
  alt?: string
  genre?: string
  priority?: boolean
  sizes?: string
  /** サムネ枠に重ねるバッジ等 */
  children?: React.ReactNode
  frameClassName?: string
}

/** ユーザー登録サムネイル共通（4:5・contain・白背景・角丸なし） */
export default function PostThumbnail({
  src,
  alt = '',
  genre,
  priority = false,
  sizes = '(max-width: 640px) 50vw, 200px',
  children,
  frameClassName = '',
}: PostThumbnailProps) {
  return (
    <div className={`${POST_CARD_THUMBNAIL.imageFrame} ${frameClassName}`.trim()}>
      <PostImage
        src={src}
        alt={alt}
        genre={genre}
        priority={priority}
        sizes={sizes}
        className={POST_CARD_THUMBNAIL.imageClass}
      />
      {children}
    </div>
  )
}
