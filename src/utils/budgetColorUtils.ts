/**
 * 預算進度預警色彩工具
 *
 * 規範：
 * 1. 75.0% 起為琥珀黃色 (色值 1: #f59e0b)
 * 2. 100.0% 為純紅色 (色值 10: #ff0000)
 * 3. 75.0% - 100.0% 之間劃分為 10 級線性單色色階，無漸變特效
 * 4. 嚴格符合全平台 WebKit 規範，不使用動態透明度修飾符，避免 color-mix() Fallback
 */

/**
 * 預算 75% - 100% 預警色階階梯定義 (值 1 ~ 10)
 * 10 級單色色階由 #f59e0b 線性過渡至 #ff0000
 */
export const BUDGET_WARNING_COLOR_STEPS: readonly string[] = [
  '#f59e0b', // 1:  75.0% - 77.4%
  '#f68c0a', // 2:  77.5% - 79.9%
  '#f77b09', // 3:  80.0% - 82.4%
  '#f86907', // 4:  82.5% - 84.9%
  '#f95806', // 5:  85.0% - 87.4%
  '#fb4605', // 6:  87.5% - 89.9%
  '#fc3504', // 7:  90.0% - 92.4%
  '#fd2302', // 8:  92.5% - 94.9%
  '#fe1201', // 9:  95.0% - 97.4%
  '#ff0000', // 10: 97.5% - 100.0%+ 及超支
] as const;

/**
 * 依據預算支出百分比計算對應的單色預警色彩
 *
 * @param percentage 當前預算支出百分比 (0 - 100+)
 * @param isOver 是否已超支
 * @returns 預警 HEX 顏色字串；若低於 75% 且未超支則返回 null (代表使用主題默認色)
 */
export function getBudgetWarningColor(
  percentage: number,
  isOver: boolean = false
): string | null {
  // 超支情況直接鎖定為最高危險級別純紅色 (Level 10: #ff0000)
  if (isOver) {
    return BUDGET_WARNING_COLOR_STEPS[9];
  }

  // 低於 75.0% 處於常規安全區間，不觸發預警單色
  if (percentage < 75) {
    return null;
  }

  // 100% 及以上若未標記 isOver 也統一為 Level 10
  if (percentage >= 100) {
    return BUDGET_WARNING_COLOR_STEPS[9];
  }

  // 75.0% - 100.0% 劃分為 10 級階梯，每級跨度為 2.5%
  const index = Math.min(9, Math.max(0, Math.floor((percentage - 75) / 2.5)));
  return BUDGET_WARNING_COLOR_STEPS[index];
}
