# Upload 上传 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/upload/`
- 文档页：`/upload`（`packages/docs/src/app/docs/upload/upload.component.ts`）
- 状态：🚧 有深度债 10 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 63 |
| 已对齐 | 36 |
| 覆盖率 | 57.1% |
| 深度债 | 10（D1 0 / D2 7 / D3 3） |
| Angular 惯用映射 | 17（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TUpload`（`<t-upload>`）

上游接口 `TdUploadProps`；上游属性 63、已对齐 36（57.1%）；深度债 10 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `accept` | string | '' | 接受的文件类型 |
| `action` | string | '' | 上传地址 |
| `allowUploadDuplicateFile` | boolean | false | 是否允许同名文件 |
| `autoUpload` | boolean | true | 是否自动上传 |
| `beforeAllFilesUpload` | ((files: UploadFile[]) => boolean \| Promise<boolean>) \| undefined | undefined | 全部文件上传前 |
| `beforeUpload` | ((file: UploadFile) => boolean \| Promise<boolean>) \| undefined | undefined | 单个文件上传前 |
| `data` | Record<string, unknown> \| ((files: UploadFile[]) => Record<string, unknown>) | {} | 表单数据 |
| `disabled` | boolean | false | 是否禁用 |
| `draggable` | boolean | false | 是否启用拖拽 |
| `fileListDisplay` | UploadFileListTemplate \| undefined | undefined | 文件列表模板 |
| `files` | UploadFile[] | [] | 文件列表 |
| `format` | ((file: File) => UploadFile) \| undefined | undefined | 文件格式化 |
| `formatRequest` | ((data: Record<string, unknown>) => Record<string, unknown>) \| undefined | undefined | 请求数据格式化 |
| `formatResponse` | ((response: ResponseType, context: FormatResponseContext) => ResponseType) \| undefined | undefined | 响应格式化 |
| `headers` | Record<string, string> | {} | 请求头 |
| `max` | number | 0 | 文件数量上限 |
| `method` | UploadRequestMethod | 'POST' | 请求方法 |
| `mockProgressDuration` | number | 300 | mock 进度间隔 |
| `multiple` | boolean | false | 是否多选 |
| `name` | string | 'file' | 上传字段名 |
| `placeholder` | string | '' | 占位提示 |
| `requestMethod` | ((files: UploadFile \| UploadFile[]) => Promise<RequestMethodResponse>) \| undefined | undefined | 自定义上传方法 |
| `showUploadProgress` | boolean | true | 是否显示上传进度 |
| `sizeLimit` | UploadSizeLimit \| undefined | undefined | 文件大小限制 |
| `status` | UploadTipsStatus | 'default' | 提示状态 |
| `theme` | UploadTheme | 'file' | 上传形态 |
| `tips` | UploadTips \| undefined | undefined | 提示文案 |
| `trigger` | UploadTriggerTemplate \| undefined | undefined | 触发器模板 |
| `uploadAllFilesInOneRequest` | boolean | false | 是否单请求上传 |
| `uploadPastedFiles` | boolean | true | 是否允许粘贴上传 |
| `useMockProgress` | boolean | true | 是否使用 mock 进度 |
| `withCredentials` | boolean | false | 是否携带凭证 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `change` | UploadChangeEvent | 文件列表变化 |
| `progress` | UploadProgressContext | 上传进度 |
| `success` | UploadSuccessContext | 上传成功 |
| `fail` | UploadFailContext | 上传失败 |
| `remove` | UploadRemoveContext | 文件移除 |
| `selectChange` | UploadSelectChangeEvent | 选择文件变化 |
| `cancelUpload` | void | 取消上传 |
| `preview` | UploadPreviewContext | 预览文件 |
| `validate` | UploadValidateContext | 文件校验 |
| `dragenter` | UploadDragEvent | 拖拽进入 |
| `dragleave` | UploadDragEvent | 拖拽离开 |
| `drop` | UploadDragEvent | 文件释放 |
| `waitingUploadFilesChange` | UploadWaitingFilesContext | 待上传文件变化 |
| `oneFileFail` | UploadFailContext | 单个文件上传失败 |
| `oneFileSuccess` | UploadSuccessContext | 单个文件上传成功 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `abridgeName` | D2 录入与反馈线 | [D2] 文件名省略规则，围绕 image 主题的缩略图链路，随 image 形态一起做 |
| `cancelUploadButton` | D2 录入与反馈线 | [D2] 取消上传按钮同上 |
| `default` | Angular 惯用映射 | Angular 用 <ng-content> 投影自定义内容，仅在 theme=custom 时生效 |
| `dragContent` | D2 录入与反馈线 | [D2] 拖拽区内容模板，当前拖拽区文案固定 |
| `imageViewerProps` | D2 录入与反馈线 | [D2] 预览需接 image-viewer，随 image 主题一起做 |
| `inputAttributes` | D3 其余组件与边角能力 | [D3] 原生 input 属性透传，需要 attr 白名单避免任意注入 |
| `isBatchUpload` | D2 录入与反馈线 | [D2] 批量上传语义（继续选择/重新选择）后置 |
| `locale` | D3 其余组件与边角能力 | [D3] 文案按 zh-CN 写死（与上游默认值逐字一致），i18n 统一期再抽 |
| `onCancelUpload` | Angular 惯用映射 | Angular 用 (cancelUpload) 输出 |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出，参数含 trigger/value/file/files/index/e |
| `onDragenter` | Angular 惯用映射 | Angular 用 (dragenter) 输出，参数 { e } |
| `onDragleave` | Angular 惯用映射 | Angular 用 (dragleave) 输出，参数 { e } |
| `onDrop` | Angular 惯用映射 | Angular 用 (drop) 输出，参数 { e } |
| `onFail` | Angular 惯用映射 | Angular 用 (fail) 输出，参数 { e, failedFiles, currentFiles, file, response } |
| `onOneFileFail` | Angular 惯用映射 | Angular 用 (oneFileFail) 输出（逐文件失败） |
| `onOneFileSuccess` | Angular 惯用映射 | Angular 用 (oneFileSuccess) 输出（逐文件成功） |
| `onPreview` | Angular 惯用映射 | Angular 用 (preview) 输出，参数 { file, index, e } |
| `onProgress` | Angular 惯用映射 | Angular 用 (progress) 输出，参数 { file, percent, type, XMLHttpRequest } |
| `onRemove` | Angular 惯用映射 | Angular 用 (remove) 输出，参数 { e, index, file } |
| `onSelectChange` | Angular 惯用映射 | Angular 用 (selectChange) 输出，参数 { files, currentSelectedFiles } |
| `onSuccess` | Angular 惯用映射 | Angular 用 (success) 输出，参数 { file, files, response } |
| `onValidate` | Angular 惯用映射 | Angular 用 (validate) 输出，参数 { type, files } |
| `onWaitingUploadFilesChange` | Angular 惯用映射 | Angular 用 (waitingUploadFilesChange) 输出 |
| `showImageFileName` | D2 录入与反馈线 | [D2] 图片名显示属于 image 主题 |
| `showThumbnail` | D2 录入与反馈线 | [D2] 缩略图依赖 image 主题与 t-image |
| `triggerButtonProps` | D3 其余组件与边角能力 | [D3] 触发器按钮 props，需要 ButtonProps 白名单透传 |
| `uploadButton` | Angular 惯用映射 | [D2] 批量上传按钮需要 ButtonProps 类型与按钮插槽 |

## 文档示例

- `packages/docs/src/app/docs/upload/demos/upload-base.ts`
- `packages/docs/src/app/docs/upload/demos/upload-drag.ts`
- `packages/docs/src/app/docs/upload/demos/upload-list.ts`
