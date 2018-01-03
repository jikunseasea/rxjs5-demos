((window, Rx) => {
  const ndDragTarget = document.querySelector('#dragTarget');

  const targetMouseDown$ = Rx.Observable.fromEvent(ndDragTarget, 'mousedown');
  const targetMouseMove$ = Rx.Observable.fromEvent(document, 'mousemove');
  const targetMouseUp$ = Rx.Observable.fromEvent(ndDragTarget, 'mouseup');

  const dragDrop$ = targetMouseDown$.switchMap(downEvent => (
    targetMouseMove$
      .map(e => { // 计算位置
        const { offsetX, offsetY } = downEvent;
        const { clientX, clientY } = e;
        const top = clientY - offsetY;
        const left = clientX - offsetX;
        return { top, left };
      })
      .takeUntil(targetMouseUp$)
  ));

  const subscription = dragDrop$.subscribe(({ top, left }) => {
    ndDragTarget.style.top = top + 'px';
    ndDragTarget.style.left = left + 'px';
  });

})(window, Rx);