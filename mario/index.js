((window, Rx) => {
  const obs = Rx.Observable;

  //
  // ─── UTILS ───────────────────────────────────────────────────────────────────────
  //

  const update = (prev, postOrFunc) => (
    typeof postOrFunc === 'function'
      ? update(prev, postOrFunc(prev))
      : { ...prev, ...postOrFunc }
  );

  const compose = (...funcs) => {
    if (funcs.length === 0) throw new Error('No functions to compose!');
    return funcs.reduce((f, g) => (...args) => f(g(...args)), v => v); 
  };

  //
  // ─── BUSINESS LOGIC ─────────────────────────────────────────────────────────
  //

  const jump = j => keys => m => ( // j 是 跳跃因子
    keys.y > 0 && m.y === 0 ? update(m, { vy: j }) : m
  );

  const gravity = e => dt => m => ( // e 是衰减因子， 当 y > 0 时， 减小 vy
    m.y > 0 ? update(m, { vy: m.vy - dt / e }) : m
  );

  const walk = keys => m => {
    let dir = keys.x === 0 ? m.dir : (keys.x > 0 ? 'right' : 'left');
    return update(m, { vx: keys.x, dir });
  };

  const physics = dt => m => (
    update(m, {
      x: m.x + dt * m.vx,
      y: Math.max(0, m.y + dt * m.vy)
    })
  );

  const step = ({ j, e }) => ({ dt, keys }) => ( // dt 就是0.8, keys就是 { x, y }
    compose(jump(j)(keys), gravity(e)(dt), walk(keys), physics(dt))
  );   

  const render = ({ mario, dimensions }, marioImage) => {
    // 选择图片
    let verb = 'stand';
    if (mario.y > 0) {
      verb = 'jump';
    } else if (mario.vx !== 0) {
      verb = 'walk';
    }
    const src = 'img/' + verb + '-' + mario.dir + '.gif';
    if(marioImage.name !== src) {
      marioImage.src = src;
      marioImage.name = src;
    }

    // 设置位置
    marioImage.style.left = (mario.x + dimensions.width / 2) + 'px';
    marioImage.style.top = (dimensions.height - 91 - mario.y) + 'px'; // 草地60px，小人图像35px，加起来除去空白91px
 
  };

  //
  // ─── CREATE FPS STREAM ──────────────────────────────────────────────────────────
  //

  const createFps = f => p => (
    obs
      .interval(1000 / f)
      .timeInterval()
      .pluck('interval')
      .map(t => t / p)
  );

  //
  // ─── CREATE KEYBOARD STREAM ─────────────────────────────────────────────────────
  //

  const normalizeKeys = (acc, e) => {
    if (e.type === 'keydown') {
      normalized = acc.map(k => k.keyCode).indexOf(e.keyCode) > -1
                 ? [...acc]
                 : [...acc, e]
    } else {
      normalized = acc.filter(ae => ae.keyCode !== e.keyCode);
    }

    return normalized;
  };

  const initial = { x: 0, y: 0 };

  const reduceKeyCodes = arrowsMap => keyCodes => (
    keyCodes.reduce((acc, keyCode) => (
      update(acc, prev => ({
          x: prev.x + arrowsMap[keyCode].x,
          y: prev.y + arrowsMap[keyCode].y
      }))
    ), initial)
  );

  // LEFT: 37
  // UP: 38
  // RIGHT: 39
  // UP: 40
  const arrowsMap = {
    37: {x: -1, y: 0},
    39: {x: 1, y: 0},
    38: {x: 0, y: 1},
    40: {x: 0, y: -1}
  };

  const createKbd = () => (
    obs
      .fromEvent(document, 'keydown')
      .merge(obs.fromEvent(document, 'keyup'))
      .filter(e => arrowsMap.hasOwnProperty(e.keyCode))
      .scan(normalizeKeys, [])
      .map(normalized => normalized.map(e => e.keyCode))
      .map(reduceKeyCodes(arrowsMap))
      .startWith(initial)
  );

  //
  // ─── WINDOW RESIZE STREAM ───────────────────────────────────────────────────────
  //

  const createDimensions = () => (
    obs
      .fromEvent(window, 'resize')
      .map(e => ({
        width: e.target.innerWidth,
        height: e.target.innerHeight
      }))
      .startWith({
        width: window.innerWidth,
        height: window.innerHeight
      })
  );

  //
  // ─── MAIN STEAM ───────────────────────────────────────────────────────────────────────
  //
  // mario
  var mario = {
    x: 0, // 横坐标，在草地上的位移，以屏幕中心的为原点，左边是负值，右边是正值
    y: 0, // 跳跃高度
    vx: 0, // 梯度
    vy: 0, // 梯度
    dir: 'right'
  };

  const stepSet = step({ j: 10, e: 4 });

  const createMain = () => (
    createFps(60)(20)
      .combineLatest(createKbd(), (dt, keys) => ({ dt, keys }))
      .scan((accMario, c) => stepSet(c)(accMario), mario)
      .combineLatest(createDimensions(), (mario, dimensions) => ({ mario, dimensions }))
  );

  //
  // ─── ENTRY POINT ────────────────────────────────────────────────────────────────
  //

  const marioImage = document.getElementById('mario');

  createMain()
    .do(x => console.log(x))
    .subscribe(
      c => render(c, marioImage),
      err => console.log(err)
    );

})(window, Rx);