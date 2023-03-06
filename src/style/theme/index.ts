import { cssPartial } from "@microsoft/fast-element"

export const fontFamily = cssPartial`font-family: Inter, "-apple-system", BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "noto sans", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;`;

export const codeFamily = cssPartial`code-family: Consolas, Menlo`;

export const fontSizebody = cssPartial`font-size: 14px;`;

export const transitionDuration1 = `0.1s`;
export const transitionDuration2 = `0.2s`;
export const transitionDuration3 = `0.3s`;
export const transitionDuration4 = `0.4s`;
export const transitionDuration5 = `0.5s`;

export const transitionDurationLoading = `1s`;


// 线性
export const transitionTimingFunctionLinear = `cubic-bezier(0, 0, 1, 1)`;
// 标准
export const transitionTimingFunctionStandard = `cubic-bezier(0.34, 0.69, 0.1, 1)`;
// 过冲
export const transitionTimingFunctionOvershoot = `cubic-bezier(0.3, 1.3, 0.3, 1)`;
// 减速
export const transitionTimingFunctionDecelerate = `cubic-bezier(0.4, 0.8, 0.74, 1)`;
// 加速
export const transitionTimingFunctionAccelerate = `cubic-bezier(0.26, 0, 0.6, 0.2)`;

export const zIndexPopupBase = 1000;
export const zIndexAffix = zIndexPopupBase - 1; // 999
export const zIndexPopup= zIndexPopupBase; // 1000
export const zIndexDrawer = zIndexPopupBase + 1; // 1001
export const zIndexModal = zIndexDrawer; // 1001
export const zIndexMessage = zIndexPopupBase + 3; // 1003
export const zIndexNotification = zIndexPopupBase + 3; // 1003
export const zIndexImagePreview = zIndexModal; // 1001

export const lineHeightBase = 1.5715;


