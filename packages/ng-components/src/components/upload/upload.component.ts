import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { TButton } from '../button/button.component';
import type {
  FormatResponseContext,
  RequestMethodResponse,
  ResponseType,
  SizeLimitObj,
  TriggerContext,
  UploadChangeContext,
  UploadChangeEvent,
  UploadDragEvent,
  UploadFailContext,
  UploadFile,
  UploadFileListContext,
  UploadFileListTemplate,
  UploadFileStatus,
  UploadOneResult,
  UploadPreviewContext,
  UploadProgressContext,
  UploadRemoveContext,
  UploadRequestMethod,
  UploadSelectChangeEvent,
  UploadSizeLimit,
  UploadSizeUnit,
  UploadSuccessContext,
  UploadTheme,
  UploadTips,
  UploadTipsStatus,
  UploadTriggerTemplate,
  UploadValidateContext,
  UploadValidateType,
  UploadWaitingFilesContext,
} from './upload.types';

/** 各文件大小单位对应的字节数，用于 sizeLimit 校验。 */
const SIZE_UNIT_BYTES: Record<UploadSizeUnit, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
};

/** mock 进度最多推进到 90%，剩余部分等真实结果，与上游一致。 */
const MOCK_PROGRESS_MAX = 90;

/** mock 进度每次前进的百分比。 */
const MOCK_PROGRESS_STEP = 10;

/** mockProgressDuration 的下限，避免 setInterval(0) 占满主线程。 */
const MOCK_PROGRESS_MIN_DURATION = 50;

/** 内部校验结果，供 onFileChange 决定后续动作。 */
interface UploadValidateResult {
  type?: UploadValidateType;
  files: UploadFile[];
  toFiles: UploadFile[];
  sizeLimitErrors: UploadFile[];
  beforeUploadErrorFiles: UploadFile[];
  lengthOverLimit: boolean;
  hasSameNameFile: boolean;
}

/**
 * 上传。选择文件、拖拽取文件、列表、进度、删除与自定义请求都在组件内闭环：
 * 原生 input 负责选择，拖拽区负责 dataTransfer.files，上传统一走 requestMethod
 * 或 XMLHttpRequest（action，带真实进度）。样式全部来自 tdesign-common。
 *
 * ```html
 * <t-upload [(files)]="files" [requestMethod]="requestMethod" multiple />
 * ```
 */
@Component({
  selector: 't-upload',
  standalone: true,
  imports: [NgTemplateOutlet, TButton],
  templateUrl: './upload.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    '(paste)': 'handlePaste($event)',
  },
})
export class TUpload {
  /** 接受的文件类型，等价于原生 input accept。 @zh 接受的文件类型 @en accept @defaultValue '' */
  readonly accept = input('');

  /** 上传地址，与 requestMethod 二选一。 @zh 上传地址 @en action @defaultValue '' */
  readonly action = input('');

  /** 是否允许上传同名文件。 @zh 是否允许同名文件 @en allow duplicate files @defaultValue false */
  readonly allowUploadDuplicateFile = input(false, { transform: booleanAttribute });

  /** 选中文件后是否立即上传。 @zh 是否自动上传 @en auto upload @defaultValue true */
  readonly autoUpload = input(true, { transform: booleanAttribute });

  /** 全部文件上传前的钩子，返回 false 时中止本次上传。 @zh 全部文件上传前 @en before all files upload */
  readonly beforeAllFilesUpload = input<((files: UploadFile[]) => boolean | Promise<boolean>) | undefined>(undefined);

  /** 单个文件上传前的钩子，返回 false 时跳过该文件。 @zh 单个文件上传前 @en before upload */
  readonly beforeUpload = input<((file: UploadFile) => boolean | Promise<boolean>) | undefined>(undefined);

  /** 随请求发送的表单数据，可传对象或按文件列表计算的函数。 @zh 表单数据 @en request data @defaultValue {} */
  readonly data = input<Record<string, unknown> | ((files: UploadFile[]) => Record<string, unknown>)>({});

  /** 是否禁用上传。 @zh 是否禁用 @en disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** 是否启用拖拽上传区域。 @zh 是否启用拖拽 @en draggable @defaultValue false */
  readonly draggable = input(false, { transform: booleanAttribute });

  /** 自定义文件列表模板，上下文带 files。 @zh 文件列表模板 @en file list display */
  readonly fileListDisplay = input<UploadFileListTemplate | undefined>(undefined);

  /** 文件列表，用于双向绑定。 @zh 文件列表 @en files @defaultValue [] */
  readonly files = model<UploadFile[]>([]);

  /** 由原生 File 生成 UploadFile 的格式化函数。 @zh 文件格式化 @en format */
  readonly format = input<((file: File) => UploadFile) | undefined>(undefined);

  /** 发送前改写请求数据。 @zh 请求数据格式化 @en format request */
  readonly formatRequest = input<((data: Record<string, unknown>) => Record<string, unknown>) | undefined>(undefined);

  /** 收到响应后改写 response。 @zh 响应格式化 @en format response */
  readonly formatResponse = input<((response: ResponseType, context: FormatResponseContext) => ResponseType) | undefined>(
    undefined,
  );

  /** 请求头。 @zh 请求头 @en headers @defaultValue {} */
  readonly headers = input<Record<string, string>>({});

  /** 文件数量上限，0 表示不限制。 @zh 文件数量上限 @en max @defaultValue 0 */
  readonly max = input(0, { transform: numberAttribute });

  /** 上传请求方法。 @zh 请求方法 @en method @defaultValue 'POST' @values POST,GET,PUT,OPTIONS,PATCH */
  readonly method = input<UploadRequestMethod>('POST');

  /** mock 进度的推进间隔（毫秒）。 @zh mock 进度间隔 @en mock progress duration @defaultValue 300 */
  readonly mockProgressDuration = input(300, { transform: numberAttribute });

  /** 是否允许一次选择多个文件。 @zh 是否多选 @en multiple @defaultValue false */
  readonly multiple = input(false, { transform: booleanAttribute });

  /** 上传文件在表单里的字段名。 @zh 上传字段名 @en name @defaultValue 'file' */
  readonly name = input('file');

  /** 未选择文件时的占位提示。 @zh 占位提示 @en placeholder @defaultValue '' */
  readonly placeholder = input('');

  /** 自定义上传方法，返回 { status, response }，与 action 二选一。 @zh 自定义上传方法 @en request method */
  readonly requestMethod = input<
    ((files: UploadFile | UploadFile[]) => Promise<RequestMethodResponse>) | undefined
  >(undefined);

  /** 进度条是否显示百分比。 @zh 是否显示上传进度 @en show upload progress @defaultValue true */
  readonly showUploadProgress = input(true, { transform: booleanAttribute });

  /** 文件大小限制，数字按 KB 处理，也可传 { size, unit, message }。 @zh 文件大小限制 @en size limit */
  readonly sizeLimit = input<UploadSizeLimit | undefined>(undefined);

  /** 提示文案的状态。 @zh 提示状态 @en tips status @defaultValue 'default' @values default,success,warning,error */
  readonly status = input<UploadTipsStatus>('default');

  /** 上传形态。 @zh 上传形态 @en theme @defaultValue 'file' @values custom,file,file-input,file-flow,image,image-flow */
  readonly theme = input<UploadTheme>('file');

  /** 提示文案，支持字符串与模板。 @zh 提示文案 @en tips */
  readonly tips = input<UploadTips | undefined>(undefined);

  /** 触发器模板，上下文带 files 与 dragActive。 @zh 触发器模板 @en trigger */
  readonly trigger = input<UploadTriggerTemplate | undefined>(undefined);

  /** 是否把所有文件放进同一个请求。 @zh 是否单请求上传 @en upload all files in one request @defaultValue false */
  readonly uploadAllFilesInOneRequest = input(false, { transform: booleanAttribute });

  /** 是否允许粘贴上传。 @zh 是否允许粘贴上传 @en upload pasted files @defaultValue true */
  readonly uploadPastedFiles = input(true, { transform: booleanAttribute });

  /** 是否使用 mock 进度。 @zh 是否使用 mock 进度 @en use mock progress @defaultValue true */
  readonly useMockProgress = input(true, { transform: booleanAttribute });

  /** 请求是否携带凭证。 @zh 是否携带凭证 @en with credentials @defaultValue false */
  readonly withCredentials = input(false, { transform: booleanAttribute });

  /** 文件列表变化事件，value 是新的文件列表。 @zh 文件列表变化 @en change */
  readonly change = output<UploadChangeEvent>();

  /** 上传进度变化事件。 @zh 上传进度 @en progress */
  readonly progress = output<UploadProgressContext>();

  /** 上传成功事件。 @zh 上传成功 @en success */
  readonly success = output<UploadSuccessContext>();

  /** 上传失败事件。 @zh 上传失败 @en fail */
  readonly fail = output<UploadFailContext>();

  /** 文件移除事件。 @zh 文件移除 @en remove */
  readonly remove = output<UploadRemoveContext>();

  /** 选择文件变化事件。 @zh 选择文件变化 @en select change */
  readonly selectChange = output<UploadSelectChangeEvent>();

  /** 取消上传事件。 @zh 取消上传 @en cancel upload */
  readonly cancelUpload = output<void>();

  /** 预览文件事件。 @zh 预览文件 @en preview */
  readonly preview = output<UploadPreviewContext>();

  /** 文件校验事件。 @zh 文件校验 @en validate */
  readonly validate = output<UploadValidateContext>();

  /** 拖拽进入事件。 @zh 拖拽进入 @en dragenter */
  readonly dragenter = output<UploadDragEvent>();

  /** 拖拽离开事件。 @zh 拖拽离开 @en dragleave */
  readonly dragleave = output<UploadDragEvent>();

  /** 文件释放事件。 @zh 文件释放 @en drop */
  readonly drop = output<UploadDragEvent>();

  /** 待上传文件列表变化事件。 @zh 待上传文件变化 @en waiting upload files change */
  readonly waitingUploadFilesChange = output<UploadWaitingFilesContext>();

  /** 单个文件上传失败事件。 @zh 单个文件上传失败 @en one file fail */
  readonly oneFileFail = output<UploadFailContext>();

  /** 单个文件上传成功事件。 @zh 单个文件上传成功 @en one file success */
  readonly oneFileSuccess = output<UploadSuccessContext>();

  private readonly destroyRef = inject(DestroyRef);

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  /** 等待上传 / 上传中 / 上传失败的文件，成功后移入 files。 */
  private readonly toUploadFiles = signal<UploadFile[]>([]);

  private readonly uploading = signal(false);

  /** 最近一次的大小超限提示，模板里以 tips-error 展示。 */
  protected readonly sizeOverLimitMessage = signal('');

  /** 拖拽高亮状态，模板用来加 t-is--active 与切换拖拽文案。 */
  protected readonly dragActive = signal(false);

  /** 文件对象的 percent/status 是就地改写的，用版本号让 displayFiles 产出新数组。 */
  private readonly revision = signal(0);

  /** 进行中请求的取消器（XMLHttpRequest abort / mock 定时器）。 */
  private readonly aborters = new Set<() => void>();

  private readonly mockTimers = new Set<ReturnType<typeof setInterval>>();

  /** 拖拽离开只在离开进入时的目标时才算收起，与上游 useDrag 一致。 */
  private dragTarget: EventTarget | null = null;

  /** 上传批次号，取消后旧批次不再回写状态。 */
  private runId = 0;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.abortAll();
    });
  }

  /** 宿主类名，theme=file-input 时补上游的宽度修饰类。 */
  protected readonly classes = computed(() =>
    this.theme() === 'file-input' ? 't-upload t-upload--theme-file-input' : 't-upload',
  );

  /** 当前展示的文件列表，规则对齐上游 getDisplayFiles。 */
  protected readonly displayFiles = computed<UploadFile[]>(() => {
    // 读取版本号：文件对象被就地改写后需要重新计算。
    this.revision();
    const value = this.files();
    const waiting = this.autoUpload()
      ? this.toUploadFiles()
      : this.toUploadFiles().filter((file) => file.status !== 'success');
    if (this.multiple()) {
      return this.autoUpload() ? [...value, ...waiting] : [...value];
    }
    return waiting.length ? waiting : value;
  });

  /** 首个文件，dragger 与单文件形态的主展示对象。 */
  protected readonly mainFile = computed<UploadFile | null>(() => this.displayFiles()[0] ?? null);

  /** 触发器文案，规则对齐上游 getTriggerTextField。 */
  protected readonly triggerText = computed(() => {
    const status = this.displayFiles()[0]?.status;
    if (this.uploading() || status === 'progress') {
      return '上传中';
    }
    if (status === 'fail') {
      return '重新选择';
    }
    if (status === 'success') {
      return this.multiple() ? '继续选择' : '重新选择';
    }
    if (!this.autoUpload() && status === 'waiting') {
      return this.multiple() ? '继续选择' : '重新选择';
    }
    return '选择文件';
  });

  /** 提示文案类名，对齐 t-upload__tips t-size-s t-upload__tips-{status}。 */
  protected readonly tipsClasses = computed(() => {
    const status = this.status();
    return status === 'default' ? 't-upload__tips t-size-s' : `t-upload__tips t-size-s t-upload__tips-${status}`;
  });

  /** 字符串形式的提示文案。 */
  protected readonly tipsText = computed(() => {
    const tips = this.tips();
    return typeof tips === 'string' ? tips : '';
  });

  /** 模板形式的提示文案。 */
  protected readonly tipsTemplate = computed(() => {
    const tips = this.tips();
    return tips instanceof TemplateRef ? tips : null;
  });

  /** 文件列表模板的上下文。 */
  protected readonly fileListContext = computed<UploadFileListContext>(() => {
    const files = this.displayFiles();
    return { $implicit: files, files };
  });

  /** 触发器模板的上下文，$implicit 便于 let-ctx 取值。 */
  protected readonly triggerContext = computed<TriggerContext & { $implicit: TriggerContext }>(() => {
    const context: TriggerContext = { dragActive: this.dragActive(), files: this.displayFiles() };
    return { ...context, $implicit: context };
  });

  /** 打开系统文件选择框，等价于上游 expose.triggerUpload。 */
  triggerUpload(event?: Event): void {
    if (this.disabled()) {
      return;
    }
    event?.stopPropagation();
    this.inputRef()?.nativeElement.click();
  }

  /** 上传待上传文件，等价于上游 expose.uploadFiles。 */
  uploadFiles(files?: UploadFile[]): void {
    if (this.disabled()) {
      return;
    }
    const current = this.files();
    const targets =
      files ?? (this.autoUpload() ? this.toUploadFiles() : current.filter((file) => file.status !== 'success'));
    if (!targets.length) {
      return;
    }
    void this.doUpload(targets);
  }

  /** 手动更新某个文件的进度，供自定义 requestMethod 回写进度条。 */
  uploadFilePercent(params: { file: UploadFile; percent: number }): void {
    const list = this.autoUpload() ? this.toUploadFiles() : this.files();
    const target = list.find((file) => file === params.file) ?? list.find((file) => file.name === params.file.name);
    if (!target) {
      return;
    }
    target.percent = params.percent;
    this.touch();
  }

  /** 文件大小文案，如 1.5MB。 */
  fileSizeText(size?: number): string {
    if (!size) {
      return '0B';
    }
    const units: UploadSizeUnit[] = ['B', 'KB', 'MB', 'GB'];
    let value = size;
    let index = 0;
    while (value >= 1024 && index < units.length - 1) {
      value /= 1024;
      index += 1;
    }
    const rounded = index === 0 || value >= 10 ? Math.round(value) : Math.round(value * 100) / 100;
    return `${rounded}${units[index]}`;
  }

  /** 原生 input 的选择回调。 */
  protected handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = input.files ? Array.from(input.files) : [];
    // 清空 value，保证连续选择同一个文件也会触发 change。
    input.value = '';
    if (!selected.length) {
      return;
    }
    void this.onFileChange(selected);
  }

  /** 拖拽释放：先派发 (drop)，再按 accept 过滤后进入选择流程。 */
  protected handleDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(false);
    this.drop.emit({ e: event });
    const dropped = event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : [];
    const selected = this.filterByAccept(dropped, this.accept());
    if (selected.length) {
      void this.onFileChange(selected);
    }
  }

  /** 拖拽进入：记录目标并高亮。 */
  protected handleDragenter(event: DragEvent): void {
    event.preventDefault();
    this.dragTarget = event.target;
    this.dragActive.set(true);
    this.dragenter.emit({ e: event });
  }

  /** 拖拽离开：只有离开进入时的目标才收起高亮，避免子元素间移动时闪烁。 */
  protected handleDragleave(event: DragEvent): void {
    if (event.target !== this.dragTarget) {
      return;
    }
    event.preventDefault();
    this.dragActive.set(false);
    this.dragleave.emit({ e: event });
  }

  /** 拖拽悬停：必须阻止默认行为才会触发 drop。 */
  protected handleDragover(event: DragEvent): void {
    event.preventDefault();
  }

  /** 触发器键盘操作：回车 / 空格等同点击，补自定义触发器的无障碍。 */
  protected handleTriggerKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    this.triggerUpload(event);
  }

  /** 删除一个文件，索引基于当前展示列表。 */
  protected handleRemove(event: Event, file: UploadFile, index: number): void {
    event.stopPropagation();
    this.sizeOverLimitMessage.set('');
    const context: UploadChangeContext = { e: event, trigger: 'remove', index, file };
    if (!this.multiple()) {
      this.toUploadFiles.set([]);
      this.waitingUploadFilesChange.emit({ files: [], trigger: 'remove' });
      this.setFiles([], context);
    } else if (!this.autoUpload()) {
      const next = [...this.files()];
      next.splice(index, 1);
      this.setFiles(next, context);
    } else {
      const current = this.files();
      if (index < current.length) {
        const next = [...current];
        next.splice(index, 1);
        this.setFiles(next, context);
      } else {
        const waiting = [...this.toUploadFiles()];
        waiting.splice(index - current.length, 1);
        this.toUploadFiles.set(waiting);
        this.waitingUploadFilesChange.emit({ files: waiting, trigger: 'remove' });
      }
    }
    this.remove.emit({ e: event, index, file });
  }

  /** 取消上传：中断所有请求，未完成的文件回到待上传。 */
  protected handleCancelUpload(event?: Event, file?: UploadFile): void {
    this.runId += 1;
    this.abortAll();
    this.uploading.set(false);
    if (this.autoUpload()) {
      this.toUploadFiles.set([]);
    } else {
      const next = this.files().map<UploadFile>((item) =>
        item.status === 'success' ? item : { ...item, status: 'waiting', percent: 0 },
      );
      this.setFiles(next, { e: event, trigger: 'abort', file });
    }
    this.cancelUpload.emit();
  }

  /** 点击文件名时派发 (preview)，原生链接行为保持不变。 */
  protected handlePreview(event: Event, file: UploadFile, index: number): void {
    this.preview.emit({ file, index, e: event });
  }

  /** 粘贴上传：从 clipboardData.files 取文件。 */
  protected handlePaste(event: ClipboardEvent): void {
    if (!this.uploadPastedFiles() || this.disabled()) {
      return;
    }
    const pasted = event.clipboardData?.files ? Array.from(event.clipboardData.files) : [];
    if (!pasted.length) {
      return;
    }
    event.preventDefault();
    void this.onFileChange(pasted);
  }

  /** 选择 / 拖拽 / 粘贴的统一入口：先派发 (selectChange)，再校验与上传。 */
  private async onFileChange(rawFiles: File[]): Promise<void> {
    if (this.disabled() || !rawFiles.length) {
      return;
    }
    this.selectChange.emit({
      files: rawFiles,
      currentSelectedFiles: rawFiles.map((raw) => this.createUploadFile(raw, undefined)),
    });

    const result = await this.validateFiles(rawFiles);
    if (result.type === 'BEFORE_ALL_FILES_UPLOAD') {
      this.validate.emit({ type: result.type, files: result.files });
      return;
    }
    if (result.lengthOverLimit) {
      this.validate.emit({ type: 'FILES_OVER_LENGTH_LIMIT', files: result.files });
    }
    if (result.hasSameNameFile) {
      this.validate.emit({ type: 'FILTER_FILE_SAME_NAME', files: result.files });
    }
    if (result.sizeLimitErrors.length) {
      const [first] = result.sizeLimitErrors;
      this.sizeOverLimitMessage.set(String(first?.response?.['error'] ?? ''));
      this.validate.emit({ type: 'FILE_OVER_SIZE_LIMIT', files: result.sizeLimitErrors });
    } else {
      this.sizeOverLimitMessage.set('');
    }
    if (result.beforeUploadErrorFiles.length) {
      this.validate.emit({ type: 'CUSTOM_BEFORE_UPLOAD', files: result.beforeUploadErrorFiles });
    }
    if (!result.toFiles.length) {
      return;
    }

    if (this.autoUpload()) {
      const waiting = [...this.toUploadFiles(), ...result.toFiles];
      this.toUploadFiles.set(waiting);
      this.waitingUploadFilesChange.emit({ files: waiting, trigger: 'validate' });
      this.uploadFiles(result.toFiles);
      return;
    }
    this.handleNotAutoUpload(result.toFiles);
  }

  /** 非自动上传：文件进 files（状态 waiting），等 uploadFiles() 再传。 */
  private handleNotAutoUpload(toFiles: UploadFile[]): void {
    const current = this.files();
    const next = this.multiple() ? [...current, ...toFiles] : [...toFiles];
    this.toUploadFiles.set([]);
    this.setFiles(next, { trigger: 'add', index: current.length, file: toFiles[0], files: toFiles });
    this.waitingUploadFilesChange.emit({ files: next, trigger: 'validate' });
  }

  /** 校验：同名过滤、数量上限、beforeAllFilesUpload、sizeLimit、beforeUpload。 */
  private async validateFiles(rawFiles: File[]): Promise<UploadValidateResult> {
    let list = rawFiles;
    let hasSameNameFile = false;
    if (!this.allowUploadDuplicateFile()) {
      const names = new Set<string>();
      const deduped = list.filter((file) => {
        if (names.has(file.name)) {
          return false;
        }
        names.add(file.name);
        return true;
      });
      hasSameNameFile = deduped.length !== list.length;
      list = deduped;
    }

    let lengthOverLimit = false;
    const max = this.max();
    if (max > 0) {
      const remain = Math.max(max - this.files().length, 0);
      if (list.length > remain) {
        lengthOverLimit = true;
        list = list.slice(0, remain);
      }
    }

    const status: UploadFileStatus = this.autoUpload() ? 'progress' : 'waiting';
    const formatted = list.map((raw) => this.createUploadFile(raw, status));

    const beforeAllFilesUpload = this.beforeAllFilesUpload();
    if (beforeAllFilesUpload && (await beforeAllFilesUpload(formatted)) === false) {
      return {
        type: 'BEFORE_ALL_FILES_UPLOAD',
        files: formatted,
        toFiles: [],
        sizeLimitErrors: [],
        beforeUploadErrorFiles: formatted,
        lengthOverLimit,
        hasSameNameFile,
      };
    }

    const toFiles: UploadFile[] = [];
    const sizeLimitErrors: UploadFile[] = [];
    const beforeUploadErrorFiles: UploadFile[] = [];
    for (const file of formatted) {
      const limit = this.checkSizeLimit(file);
      if (limit) {
        file.response = { ...(file.response ?? {}), error: this.getSizeLimitError(limit) };
        sizeLimitErrors.push(file);
        continue;
      }
      if (!(await this.checkBeforeUpload(file))) {
        beforeUploadErrorFiles.push(file);
        continue;
      }
      toFiles.push(file);
    }

    return { files: formatted, toFiles, sizeLimitErrors, beforeUploadErrorFiles, lengthOverLimit, hasSameNameFile };
  }

  /** 把原生 File 转成 UploadFile，format 的结果优先。 */
  private createUploadFile(raw: File, status: UploadFileStatus | undefined): UploadFile {
    const format = this.format();
    const formatted = format ? format(raw) : {};
    return {
      raw,
      lastModified: raw.lastModified,
      name: raw.name,
      size: raw.size,
      type: raw.type,
      percent: 0,
      status,
      ...formatted,
    };
  }

  /** sizeLimit 归一化成对象写法，数字按 KB 处理。 */
  private normalizeSizeLimit(): SizeLimitObj | null {
    const limit = this.sizeLimit();
    if (limit === undefined) {
      return null;
    }
    return typeof limit === 'number' ? { size: limit, unit: 'KB' } : limit;
  }

  /** 超出 sizeLimit 时返回限制对象，否则返回 null。 */
  private checkSizeLimit(file: UploadFile): SizeLimitObj | null {
    const limit = this.normalizeSizeLimit();
    if (!limit) {
      return null;
    }
    return (file.size ?? 0) > limit.size * SIZE_UNIT_BYTES[limit.unit] ? limit : null;
  }

  /** 大小超限文案，支持 message 里的 {sizeLimit} 占位。 */
  private getSizeLimitError(limit: SizeLimitObj): string {
    const sizeLimit = `${limit.size}${limit.unit}`;
    if (limit.message) {
      return limit.message.replace(/\{sizeLimit\}/g, sizeLimit);
    }
    return `文件大小不能超过 ${sizeLimit}`;
  }

  /** beforeUpload 支持同步与 Promise，只有显式 false 才算拒绝。 */
  private async checkBeforeUpload(file: UploadFile): Promise<boolean> {
    const beforeUpload = this.beforeUpload();
    if (!beforeUpload) {
      return true;
    }
    return (await beforeUpload(file)) !== false;
  }

  /** 真正发起上传：多文件且未开 uploadAllFilesInOneRequest 时逐个请求。 */
  private async doUpload(targets: UploadFile[]): Promise<void> {
    const run = (this.runId += 1);
    this.uploading.set(true);
    this.abortAll();
    const previous = this.files();
    targets.forEach((file) => {
      file.status = 'progress';
      file.percent = file.percent ?? 0;
    });
    this.touch();

    const perFile = this.multiple() && !this.uploadAllFilesInOneRequest();
    const results = perFile
      ? await Promise.all(targets.map((file) => this.uploadOne([file])))
      : [await this.uploadOne(targets)];
    if (run !== this.runId) {
      return;
    }

    this.uploading.set(false);
    const succeeded = results.filter((item) => item.status === 'success').flatMap((item) => item.files);
    const failed = results.filter((item) => item.status === 'fail').flatMap((item) => item.files);
    const lastFail = results.find((item) => item.status === 'fail');
    const lastSuccess = [...results].reverse().find((item) => item.status === 'success');

    let next: UploadFile[];
    if (this.multiple()) {
      next = [...previous];
      for (const file of succeeded) {
        const index = next.indexOf(file);
        if (index >= 0) {
          next[index] = file;
        } else {
          next.push(file);
        }
      }
    } else {
      next = succeeded.slice(0, 1);
    }
    this.toUploadFiles.set(failed);

    if (succeeded.length) {
      this.setFiles(next, { trigger: 'add', file: succeeded[0], index: Math.max(next.length - 1, 0) });
      this.success.emit({
        fileList: next,
        currentFiles: targets,
        file: succeeded[0],
        results: results.map((item) => item.response ?? {}),
        response: lastSuccess?.response,
      });
    } else if (!this.multiple() && this.autoUpload()) {
      this.setFiles([], { trigger: 'progress-fail', file: failed[0], e: lastFail?.event });
    }

    this.waitingUploadFilesChange.emit({ files: failed, trigger: 'uploaded' });
    if (failed.length) {
      this.fail.emit({
        e: lastFail?.event,
        failedFiles: failed,
        currentFiles: targets,
        file: failed[0],
        response: lastFail?.response,
        XMLHttpRequest: lastFail?.xmlHttpRequest,
      });
    }
  }

  /** 一次请求：优先 requestMethod，否则走 XMLHttpRequest(action)。 */
  private async uploadOne(files: UploadFile[]): Promise<UploadOneResult> {
    files.forEach((file) => {
      file.status = 'progress';
      file.percent = file.percent ?? 0;
    });
    this.touch();

    const requestMethod = this.requestMethod();
    if (requestMethod) {
      const stopMock = this.startMockProgress(files);
      try {
        const response = await requestMethod(this.multiple() ? files : files[0]);
        if (!this.isRequestMethodResponse(response)) {
          throw new Error('[t-upload] requestMethod 必须返回 { status: "success" | "fail", response }');
        }
        let payload: ResponseType = { ...(response.response ?? {}) };
        const formatResponse = this.formatResponse();
        if (formatResponse) {
          payload = formatResponse(payload, { file: files[0], currentFiles: this.displayFiles() });
        }
        if (response.status === 'fail') {
          payload = { ...payload, error: response.error ?? payload.error };
        }
        const result = this.applyResponse(files, response.status, payload);
        this.emitFileResult(files, result);
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const result = this.applyResponse(files, 'fail', { error: message });
        this.emitFileResult(files, result);
        return result;
      } finally {
        stopMock();
      }
    }

    if (!this.action()) {
      const message = 'action 与 requestMethod 至少需要提供一个。';
      const result = this.applyResponse(files, 'fail', { error: message });
      this.emitFileResult(files, result);
      return result;
    }
    return this.uploadByXhr(files);
  }

  /** XMLHttpRequest 上传：带真实进度，失败 / 超时 / 中断都会回写状态。 */
  private uploadByXhr(files: UploadFile[]): Promise<UploadOneResult> {
    return new Promise<UploadOneResult>((resolve) => {
      if (typeof XMLHttpRequest === 'undefined') {
        const message = '当前环境不支持 XMLHttpRequest，请改用 requestMethod。';
        const result = this.applyResponse(files, 'fail', { error: message });
        this.emitFileResult(files, result);
        resolve(result);
        return;
      }

      const xhr = new XMLHttpRequest();
      const stopMock = this.startMockProgress(files);
      let settled = false;
      const finish = (result: UploadOneResult): void => {
        if (settled) {
          return;
        }
        settled = true;
        stopMock();
        this.aborters.delete(abort);
        resolve(result);
      };
      const abort = (): void => {
        xhr.abort();
        stopMock();
      };
      const fail = (message: string): void => {
        const result = this.applyResponse(files, 'fail', { error: message });
        this.emitFileResult(files, result);
        finish(result);
      };

      this.aborters.add(abort);
      xhr.open(this.method().toUpperCase(), this.action(), true);
      xhr.withCredentials = this.withCredentials();
      Object.entries(this.headers()).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.upload.onprogress = (event: ProgressEvent): void => {
        if (!event.lengthComputable || !event.total) {
          return;
        }
        const percent = Math.round((event.loaded / event.total) * 100);
        if (percent <= (files[0]?.percent ?? 0)) {
          return;
        }
        files.forEach((file) => {
          file.percent = percent;
        });
        this.touch();
        this.progress.emit({
          file: files[0],
          currentFiles: this.displayFiles(),
          percent,
          type: 'real',
          XMLHttpRequest: xhr,
        });
      };

      xhr.onerror = (): void => fail('上传失败，请稍后重试。');
      xhr.ontimeout = (): void => fail('上传超时。');
      xhr.onabort = (): void => fail('上传已取消。');
      xhr.onload = (): void => {
        if (xhr.status < 200 || xhr.status >= 300) {
          fail(`${xhr.status} ${xhr.statusText}`.trim());
          return;
        }
        let payload: ResponseType = {};
        const text = xhr.responseText;
        if (text) {
          try {
            const parsed: unknown = JSON.parse(text);
            payload = typeof parsed === 'object' && parsed !== null ? (parsed as ResponseType) : { message: text };
          } catch {
            payload = { message: text };
          }
        }
        const formatResponse = this.formatResponse();
        if (formatResponse) {
          payload = formatResponse(payload, { file: files[0], currentFiles: this.displayFiles() });
        }
        const result = this.applyResponse(files, 'success', payload);
        this.emitFileResult(files, result);
        finish(result);
      };

      xhr.send(this.buildFormData(files));
    });
  }

  /** 把响应写回文件对象，response.files 存在时以上游返回的文件为准。 */
  private applyResponse(files: UploadFile[], status: 'success' | 'fail', response: ResponseType): UploadOneResult {
    const success = status === 'success';
    const uploadTime = this.getCurrentDate();
    let resultFiles = files;
    if (success && Array.isArray(response.files)) {
      resultFiles = response.files.map<UploadFile>((item, index) => ({
        ...files[index],
        ...item,
        status: 'success',
        response,
      }));
    }
    resultFiles.forEach((file) => {
      file.status = status;
      file.response = response;
      if (success) {
        file.percent = 100;
        if (typeof response.url === 'string') {
          file.url = response.url;
        }
        const responseUploadTime = response['uploadTime'];
        file.uploadTime = typeof responseUploadTime === 'string' ? responseUploadTime : uploadTime;
      } else {
        file.percent = 0;
      }
    });
    this.touch();
    return { status, files: resultFiles, response };
  }

  /** 单个文件的成功 / 失败事件，对齐上游 onOneFileSuccess / onOneFileFail。 */
  private emitFileResult(files: UploadFile[], result: UploadOneResult): void {
    if (result.status === 'success') {
      if (!this.multiple() || this.uploadAllFilesInOneRequest()) {
        return;
      }
      this.oneFileSuccess.emit({
        file: files[0],
        fileList: result.files,
        currentFiles: this.displayFiles(),
        response: result.response,
      });
      return;
    }
    this.oneFileFail.emit({
      failedFiles: files,
      currentFiles: this.displayFiles(),
      file: files[0],
      response: result.response,
      XMLHttpRequest: result.xmlHttpRequest,
    });
  }

  /** 按上游规则拼 FormData：多文件时同时提供 name 数组与 name[i] 单字段。 */
  private buildFormData(files: UploadFile[]): FormData {
    const data = this.data();
    const requestData: Record<string, unknown> = typeof data === 'function' ? data(files) : { ...data };
    const name = this.name();
    if (files.length > 1) {
      files.forEach((file, index) => {
        requestData[`${name}[${index}]`] = file.raw;
      });
    }
    requestData[name] = files.length > 1 ? files.map((file) => file.raw) : files[0]?.raw;
    requestData['length'] = files.length;

    const formatRequest = this.formatRequest();
    const formatted = formatRequest ? formatRequest(requestData) : requestData;
    const form = new FormData();
    Object.entries(formatted).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => form.append(key, item as Blob | string));
        return;
      }
      if (value === undefined || value === null) {
        return;
      }
      form.append(key, value as Blob | string);
    });
    return form;
  }

  /** 没有真实进度时按固定步长推进到 90%，返回值用于停止定时器。 */
  private startMockProgress(files: UploadFile[]): () => void {
    if (!this.useMockProgress()) {
      return () => {};
    }
    const duration = Math.max(MOCK_PROGRESS_MIN_DURATION, this.mockProgressDuration());
    const timer = setInterval(() => {
      const current = files[0]?.percent ?? 0;
      if (current >= MOCK_PROGRESS_MAX) {
        return;
      }
      const percent = Math.min(current + MOCK_PROGRESS_STEP, MOCK_PROGRESS_MAX);
      files.forEach((file) => {
        file.percent = Math.max(file.percent ?? 0, percent);
      });
      this.touch();
      this.progress.emit({
        file: files[0],
        currentFiles: this.displayFiles(),
        percent,
        type: 'mock',
      });
    }, duration);
    this.mockTimers.add(timer);
    return () => {
      clearInterval(timer);
      this.mockTimers.delete(timer);
    };
  }

  /** 中断所有进行中的请求并清掉定时器。 */
  private abortAll(): void {
    for (const abort of [...this.aborters]) {
      abort();
    }
    this.aborters.clear();
    for (const timer of [...this.mockTimers]) {
      clearInterval(timer);
    }
    this.mockTimers.clear();
  }

  /** 通知模板文件对象已就地更新。 */
  private touch(): void {
    this.revision.update((value) => value + 1);
  }

  /** 回写 files 并派发 (change)。 */
  private setFiles(value: UploadFile[], context: UploadChangeContext): void {
    this.files.set(value);
    this.change.emit({ ...context, value });
  }

  /** 按 accept 过滤拖拽进来的文件。 */
  private filterByAccept(files: File[], accept: string): File[] {
    const rules = accept
      .split(',')
      .map((rule) => rule.trim().toLowerCase())
      .filter(Boolean);
    if (!rules.length) {
      return files;
    }
    return files.filter((file) => {
      const name = file.name.toLowerCase();
      const type = file.type.toLowerCase();
      return rules.some((rule) => {
        if (rule.startsWith('.')) {
          return name.endsWith(rule);
        }
        if (rule.endsWith('/*')) {
          return type.startsWith(rule.slice(0, -1));
        }
        return type === rule;
      });
    });
  }

  /** 当前时间，格式 YYYY-MM-DD HH:mm:ss，对齐上游 getCurrentDate。 */
  private getCurrentDate(): string {
    const now = new Date();
    const pad = (value: number): string => String(value).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(
      now.getMinutes(),
    )}:${pad(now.getSeconds())}`;
  }

  /** 判断 requestMethod 的返回值是否合法。 */
  private isRequestMethodResponse(value: unknown): value is RequestMethodResponse {
    if (!value || typeof value !== 'object') {
      return false;
    }
    const status = (value as { status?: unknown }).status;
    return status === 'success' || status === 'fail';
  }
}
