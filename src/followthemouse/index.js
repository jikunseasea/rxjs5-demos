((window, Rx) => {

  // 计算小方块的中心位置
  const computeCenter = element => {
    const { width, height } = window.getComputedStyle(element);
    const mouseX = window.parseFloat(width) / 2;
    const mouseY = window.parseFloat(height) / 2;
    return { mouseX, mouseY };
  };

  // 计算小方块想对于页面的位置
  const computePosition = (cor, anchor) => `${cor - anchor}px`;

  // 设置小方块的位置
  const setPosition = function setPosition(direction, value) {
    this.style[direction] = value;
  }

  const partialAddWidth = function partialAddWidth(a, b) {
    const thisWidth = this.offsetWidth;
    const offset = a / 2 + thisWidth / 2 + window.parseFloat(b);
    return `${offset}px`;
  };

  //
  // ─── GET THE MOUSEMOVE OBSERVABLE ───────────────────────────────────────────────
  //
  const mousemove$ = Rx.Observable.fromEvent(document, 'mousemove');
  const left$ = mousemove$.pluck('clientX').distinctUntilChanged();
  const top$ = mousemove$.pluck('clientY').distinctUntilChanged();

  //
  // ─── UPDATE THE MOUSE ───────────────────────────────────────────────────────────
  //
  const ndMouse = document.querySelector('#themouse');
  const mouseCenter = computeCenter(ndMouse);
  left$
    .map(clientX => computePosition(clientX, mouseCenter.mouseX))
    .subscribe(setPosition.bind(ndMouse, 'left'));
  top$
    .map(clientY => computePosition(clientY, mouseCenter.mouseY))
    .subscribe(setPosition.bind(ndMouse, 'top'));


  const delay = 300;
  //
  // ─── UPDATE THE TAIL ────────────────────────────────────────────────────────────
  //
  const ndTail = document.querySelector('#thetail');
  const tailCenter = computeCenter(ndTail);
  left$
    .map(clientX => computePosition(clientX, tailCenter.mouseX))
    .map(partialAddWidth.bind(ndTail, ndMouse.offsetWidth))
    .delay(delay)
    .subscribe(setPosition.bind(ndTail, 'left'));
  top$
    .map(clientY => computePosition(clientY, tailCenter.mouseY))
    .delay(delay)
    .subscribe(setPosition.bind(ndTail, 'top')); //

  //
  // ─── UPDATE THE WAGGING ─────────────────────────────────────────────────────────
  //
  const ndWagging = document.querySelector('#wagging');
  const waggingCenter = computeCenter(ndWagging);
  left$
    .map(clientX => computePosition(clientX, waggingCenter.mouseX))
    .map(partialAddWidth.bind(ndWagging, ndMouse.offsetWidth))
    .map(clientX => {
      const x = window.parseFloat(clientX) + ndTail.offsetWidth;
      return `${x}px`;
    })
    .delay(delay * 1.5)
    .subscribe(setPosition.bind(ndWagging, 'left'));
  top$
    .map(clientY => computePosition(clientY, waggingCenter.mouseY))
    .delay(delay * 1.5)
    .subscribe(setPosition.bind(ndWagging, 'top')); //

})(window, Rx);