import type { TemplateRef } from '@angular/core';

/** 上传文件的状态，与上游 `UploadFile.status` 一致。 */
export const UPLOAD_FILE_STATUSES = ['waiting', 'progress', 'success', 'fail'] as const;
export type UploadFileStatus = (typeof UPLOAD_FILE_STATUSES)[number];

/** 上传形态，取值与上游 `theme` 一致。 */
export const UPLOAD_THEMES = ['custom', 'file', 'file-input', 'file-flow', 'image', 'image-flow'] as const;
export type UploadTheme = (typeof UPLOAD_THEMES)[number];

/** 请求方法，大小写都接受（对齐上游 `method` 的取值）。 */
export const UPLOAD_REQUEST_METHODS = [
  'POST',
  'GET',
  'PUT',
  'OPTIONS',
  'PATCH',
  'post',
  'get',
  'put',
  'options',
  'patch',
] as const;
export type UploadRequestMethod = (typeof UPLOAD_REQUEST_METHODS)[number];

/** 提示文案的状态，与上游 `status` 一致。 */
export const UPLOAD_TIPS_STATUSES = ['default', 'success', 'warning', 'error'] as const;
export type UploadTipsStatus = (typeof UPLOAD_TIPS_STATUSES)[number];

/** 校验失败的类型，与上游 `UploadValidateType` 一致。 */
export const UPLOAD_VALIDATE_TYPES = [
  'FILE_OVER_SIZE_LIMIT',
  'FILES_OVER_LENGTH_LIMIT',
  'FILTER_FILE_SAME_NAME',
  'BEFORE_ALL_FILES_UPLOAD',
  'CUSTOM_BEFORE_UPLOAD',
] as const;
export type UploadValidateType = (typeof UPLOAD_VALIDATE_TYPES)[number];

/** `change` 事件的触发来源，与上游 `UploadChangeContext.trigger` 一致。 */
export const UPLOAD_CHANGE_TRIGGERS = [
  'add',
  'remove',
  'abort',
  'progress-success',
  'progress',
  'progress-fail',
] as const;
export type UploadChangeTrigger = (typeof UPLOAD_CHANGE_TRIGGERS)[number];

/** 文件大小单位，与上游 `SizeLimitObj.unit` 一致。 */
export const UPLOAD_SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;
export type UploadSizeUnit = (typeof UPLOAD_SIZE_UNITS)[number];

/** `sizeLimit` 的对象写法：`{ size, unit, message }`。 */
export interface SizeLimitObj {
  size: number;
  unit: UploadSizeUnit;
  message?: string;
}

/** `sizeLimit` 既可以是数字（单位 KB），也可以是对象。 */
export type UploadSizeLimit = number | SizeLimitObj;

/** 上传列表里的文件，字段与上游 `UploadFile` 对齐。 */
export interface UploadFile {
  lastModified?: number;
  name?: string;
  percent?: number;
  raw?: File;
  response?: Record<string, unknown>;
  size?: number;
  status?: UploadFileStatus;
  type?: string;
  uploadTime?: string;
  url?: string;
  [key: string]: unknown;
}

/** 自定义请求方法返回的 `response` 负载，与上游 `ResponseType` 对齐。 */
export interface ResponseType {
  error?: string;
  url?: string;
  status?: UploadFileStatus;
  files?: UploadFile[];
  [key: string]: unknown;
}

/** `formatResponse` 的第二个参数。 */
export interface FormatResponseContext {
  file: UploadFile;
  currentFiles: UploadFile[];
}

/** 自定义请求方法的返回值，与上游 `RequestMethodResponse` 对齐。 */
export interface RequestMethodResponse {
  status: 'success' | 'fail';
  error?: string;
  response: ResponseType;
}

/** 触发器模板的上下文，与上游 `TriggerContext` 对齐。 */
export interface TriggerContext {
  dragActive?: boolean;
  files: UploadFile[];
}

/** 文件列表模板的上下文：`$implicit` 与 `files` 都是当前展示的文件列表。 */
export interface UploadFileListContext {
  $implicit: UploadFile[];
  files: UploadFile[];
}

/** `change` 事件的上下文（上游是 `onChange(value, context)` 两个参数）。 */
export interface UploadChangeContext {
  e?: Event;
  response?: ResponseType;
  trigger: UploadChangeTrigger;
  index?: number;
  file?: UploadFile;
  files?: UploadFile[];
}

/** `change` 事件：`value` 是新的文件列表，其余字段是上游的 context。 */
export interface UploadChangeEvent extends UploadChangeContext {
  value: UploadFile[];
}

/** `fail` / `oneFileFail` 事件的上下文。 */
export interface UploadFailContext {
  e?: Event;
  failedFiles: UploadFile[];
  currentFiles: UploadFile[];
  response?: ResponseType;
  file: UploadFile;
  XMLHttpRequest?: XMLHttpRequest;
}

/** `progress` 事件的上下文。 */
export interface UploadProgressContext {
  e?: Event;
  file?: UploadFile;
  currentFiles: UploadFile[];
  percent: number;
  type: 'real' | 'mock';
  XMLHttpRequest?: XMLHttpRequest;
}

/** `remove` 事件的上下文。 */
export interface UploadRemoveContext {
  index?: number;
  file?: UploadFile;
  e: Event;
}

/** `selectChange` 事件：`files` 是本次选中的原生文件，`currentSelectedFiles` 是格式化后的文件。 */
export interface UploadSelectChangeEvent {
  files: File[];
  currentSelectedFiles: UploadFile[];
}

/** `preview` 事件的上下文。 */
export interface UploadPreviewContext {
  file: UploadFile;
  index: number;
  e: Event;
}

/** `success` 事件的上下文。 */
export interface UploadSuccessContext {
  e?: Event;
  file?: UploadFile;
  fileList?: UploadFile[];
  currentFiles?: UploadFile[];
  response?: ResponseType;
  results?: ResponseType[];
  XMLHttpRequest?: XMLHttpRequest;
}

/** `validate` 事件的上下文。 */
export interface UploadValidateContext {
  type: UploadValidateType;
  files: UploadFile[];
}

/** `waitingUploadFilesChange` 事件的上下文。 */
export interface UploadWaitingFilesContext {
  files: UploadFile[];
  trigger: 'validate' | 'remove' | 'uploaded';
}

/** 拖拽事件的负载，与上游 `onDragenter({ e })` 等签名的单参数形式一致。 */
export interface UploadDragEvent {
  e: DragEvent;
}

/** 单个文件上传完成的内部结果。 */
export interface UploadOneResult {
  status: 'success' | 'fail';
  files: UploadFile[];
  response?: ResponseType;
  event?: Event;
  xmlHttpRequest?: XMLHttpRequest;
}

/** 需要渲染的文件列表模板。 */
export type UploadFileListTemplate = TemplateRef<UploadFileListContext>;

/** 触发器模板。 */
export type UploadTriggerTemplate = TemplateRef<TriggerContext>;

/** 提示内容：字符串按文本渲染。 */
export type UploadTips = string | TemplateRef<unknown>;
