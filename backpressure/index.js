((window, Rx) => {

  const { Observable } = Rx;

  const ndToggle = document.querySelector('#toggle');
  const ndCloth = document.querySelector('#cloth');
  const ndPosition = document.querySelector('#position');
  
  const move$ = Observable.fromEvent(ndCloth, 'mousemove')
                          .map(e => ({ offsetX: e.offsetX, offsetY: e.offsetY }));

  Observable.fromEvent(ndToggle, 'click')
            .pluck('target', 'checked')
            .switchMap(isChecked => isChecked ? move$ : Observable.empty())
            .subscribe(({ offsetX, offsetY }) => {
              ndPosition.innerHTML = `offsetX: ${offsetX}, offsetY: ${offsetY}`;
            });

})(window, Rx);