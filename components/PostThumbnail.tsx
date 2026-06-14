import PostImage from '@/components/PostImage'
import { POST_CARD_THUMBNAIL, POST_DETAIL_MAIN_IMAGE } from '@/lib/home-layout'

type PostThumbnailProps = {
  src: string
  alt?: string
  genre?: string
  priority?: boolean
  sizes?: string
  /** サムネ枠に重ねるバッジ等 */
  children?: React.ReactNode
  frameClassName?: string
  /** list=一覧 cover / detail=記事詳細 contain */
  variant?: 'list' | 'detail'
}

/** ユーザー登録サムネイル（4:5・角丸なし） */
export default function PostThumbnail({
  src,
  alt = '',
  genre,
  priority = false,
  sizes = '(max-width: 640px) 50vw, 200px',
  children,
  frameClassName = '',
  variant = 'list',
}: PostThumbnailProps) {
  const config = variant === 'detail' ? POST_DETAIL_MAIN_IMAGE : POST_CARD_THUMBNAIL

  return (
    <div className={`${config.imageFrame} ${frameClassName}`.trim()}>
      <PostImage
        src={src}
        alt={alt}
        genre={genre}
        priority={priority}
        sizes={sizes}
        className={config.imageClass}
      />
      {children}
    </div>
  )
}
