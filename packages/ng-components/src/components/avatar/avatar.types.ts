import type { Content } from '../../_utils/content';
import type { ImageContent, ImageEvent, ImageFit, ImageOverlayTrigger, ImageReferrerpolicy, ImageShape, ImageSrcset } from '../image/image.component';

/** 头像及折叠头像内容，Angular 用模板表达上游 TNode。 */
export type AvatarContent = Content;

/** 头像内 Image 当前支持的配置；src 和 alt 由头像的显式输入管理。 */
export interface AvatarImageProps {
  error?: ImageContent;
  fallback?: string;
  fit?: ImageFit;
  gallery?: boolean;
  lazy?: boolean;
  loading?: ImageContent;
  overlayContent?: ImageContent;
  overlayTrigger?: ImageOverlayTrigger;
  placeholder?: ImageContent;
  position?: string;
  referrerpolicy?: ImageReferrerpolicy;
  shape?: ImageShape;
  srcset?: ImageSrcset;
  onLoad?: (context: ImageEvent) => void;
  onError?: (context: ImageEvent) => void;
}

/** 头像形状。 */
export const AVATAR_SHAPES = ['circle', 'round', 'square'] as const;

export type AvatarShape = (typeof AVATAR_SHAPES)[number];

/** 头像尺寸。 */
export const AVATAR_SIZES = ['small', 'medium', 'large'] as const;

export type AvatarSize = (typeof AVATAR_SIZES)[number];

/** 头像组的层叠方向。 */
export const AVATAR_CASCADINGS = ['left-up', 'right-up'] as const;

export type AvatarCascading = (typeof AVATAR_CASCADINGS)[number];
