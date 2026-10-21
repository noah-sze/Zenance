import { useEffect, type RefObject } from 'react';

/**
 * 標準化不同瀏覽器與輸入設備的滾輪 deltaY 像素值
 */
function normalizeWheelDelta(e: WheelEvent): number {
  let delta = e.deltaY;
  if (e.deltaMode === 1) {
    // DOM_DELTA_LINE：每行約換算為 20 像素
    delta *= 20;
  } else if (e.deltaMode === 2) {
    // DOM_DELTA_PAGE：按頁面高度換算
    delta *= window.innerHeight;
  }
  return delta;
}

/**
 * 檢查當前光標下方的節點是否已經具備原生滾動能力且在當前方向尚有滾動空間
 */
function isCursorInsideScrollable(target: Element | null, deltaY: number): boolean {
  let curr = target;

  while (curr && curr !== document.body && curr !== document.documentElement) {
    // 若光標位於全螢幕遮罩層（Backdrop）或特定非滾動容器上，立即跳出
    const slot = curr.getAttribute('data-slot');
    if (slot && (slot.includes('overlay') || slot.includes('backdrop'))) {
      return false;
    }

    const style = window.getComputedStyle(curr);
    const isOverflow = style.overflowY === 'auto' || style.overflowY === 'scroll';

    if (isOverflow && curr.scrollHeight > curr.clientHeight) {
      const canScrollDown = deltaY > 0 && curr.scrollTop + curr.clientHeight < curr.scrollHeight - 1;
      const canScrollUp = deltaY < 0 && curr.scrollTop > 1;

      // 當前容器在目標滾動方向上仍可原生滾動，直接放行給瀏覽器處理
      if (canScrollDown || canScrollUp) {
        return true;
      }
    }

    curr = curr.parentElement;
  }

  return false;
}

/**
 * 獲取當前最頂層活躍顯示中的彈窗（Dialog / Modal）
 */
function getTopmostActiveDialog(): HTMLElement | null {
  const dialogs = Array.from(
    document.querySelectorAll<HTMLElement>(
      '[data-slot="dialog-content"], [data-slot="confirm-dialog-content"]'
    )
  ).filter((d) => {
    return d.offsetWidth > 0 && d.offsetHeight > 0 && !d.hasAttribute('data-closed');
  });

  if (dialogs.length === 0) return null;
  if (dialogs.length === 1) return dialogs[0];

  // 若存在多層彈窗，依據 z-index 與 DOM 順序選取最高層級的棧頂彈窗
  return dialogs.reduce((top, curr) => {
    const topZ = parseInt(window.getComputedStyle(top).zIndex, 10) || 0;
    const currZ = parseInt(window.getComputedStyle(curr).zIndex, 10) || 0;
    return currZ >= topZ ? curr : top;
  });
}

/**
 * 在彈窗內部智慧探測其實際的主滾動容器
 */
function findScrollContainerInDialog(dialog: HTMLElement): HTMLElement {
  const dialogStyle = window.getComputedStyle(dialog);
  const isDialogScrollable =
    (dialogStyle.overflowY === 'auto' || dialogStyle.overflowY === 'scroll') &&
    dialog.scrollHeight > dialog.clientHeight;

  if (isDialogScrollable) {
    return dialog;
  }

  // 尋找內部帶有 overflow-y: auto / scroll 且內容溢出的子容器
  const candidates = Array.from(dialog.querySelectorAll<HTMLElement>('*')).filter((el) => {
    if (el.clientHeight === 0 || el.clientWidth === 0) return false;
    const style = window.getComputedStyle(el);
    const isOverflow = style.overflowY === 'auto' || style.overflowY === 'scroll';
    return isOverflow && el.scrollHeight > el.clientHeight;
  });

  if (candidates.length > 0) {
    // 選取高度最大者作為核心滾動視圖
    return candidates.reduce((prev, curr) => (curr.clientHeight > prev.clientHeight ? curr : prev));
  }

  return dialog;
}

/**
 * 桌面端智慧滾輪轉發 Hook
 * 解決在桌面寬螢幕環境下，光標置於內容卡片外部（如留白背景、底部導覽列、或彈窗背景遮罩）時無法滾動頁面或彈窗的問題。
 *
 * 具備 4 重完整防禦機制：
 * 1. 棧頂鎖定：若有彈窗開啟，滾輪嚴格轉發給頂層彈窗，絕不穿透滾動背後的頁面。
 * 2. 局部放行：若光標正處於原生可滾動容器（文字輸入框、內部小列表）之上，完全不干涉。
 * 3. 雙向平滑：自動轉換各種 deltaMode 像素規格。
 * 4. 無損 passive：嚴格以 passive: true 監聽，絕不阻塞主執行緒渲染管線。
 */
export function useDesktopWheelScroll(mainRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 僅在桌面端或具備精確指標設備環境下掛載
    const isDesktopOrFinePointer =
      window.innerWidth >= 640 || window.matchMedia('(pointer: fine)').matches;

    if (!isDesktopOrFinePointer) return;

    const handleWheel = (e: WheelEvent) => {
      // 若水平位移大於垂直位移，交由橫向原生滾動，不干涉
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      const deltaY = e.deltaY;
      if (deltaY === 0) return;

      const target = e.target as Element | null;

      // 檢查光標所在處是否已具備自身可滾動能力
      if (isCursorInsideScrollable(target, deltaY)) {
        return;
      }

      const normalizedDelta = normalizeWheelDelta(e);

      // 優先權 1：若當前有活躍的彈窗浮層，轉發給頂層彈窗的主滾動容器
      const activeDialog = getTopmostActiveDialog();
      if (activeDialog) {
        const scrollTarget = findScrollContainerInDialog(activeDialog);
        scrollTarget.scrollTop += normalizedDelta;
        return;
      }

      // 優先權 2：常規頁面環境，轉發給主要主佈局容器 <main>
      const mainEl = mainRef.current;
      if (mainEl) {
        mainEl.scrollTop += normalizedDelta;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [mainRef]);
}
