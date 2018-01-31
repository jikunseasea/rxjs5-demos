((window, Rx) => {
  const codes = [
    38, // up
    38, // up
    40, // down
    40, // down
    37, // left
    39, // right
    37, // left
    39, // right
    66, // b
    65  // a
   ];

   const ndResult = document.querySelector('#result');


   Rx.Observable.fromEvent(document, 'keyup')
                .pluck('keyCode')
                .bufferCount(codes.length, 1)
                .switchMap(buffer => Rx.Observable.from(buffer).sequenceEqual(Rx.Observable.from(codes)))
                .subscribe(isMatched => {
                  const ndLi = document.createElement('li');
                  ndLi.innerHTML = isMatched;
                  ndResult.appendChild(ndLi);
                });

})(window, Rx);