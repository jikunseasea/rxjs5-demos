((window, Rx) => {

  const ndReponame = document.querySelector('#reponame');
  const ndCandidates = document.querySelector('#candidate');

  const baseUrl = 'https://api.github.com/search/repositories'

  const keyup$ = Rx.Observable.fromEvent(ndReponame, 'keyup')
                              .pluck('target', 'value')
                              .debounceTime(100)
                              .distinctUntilChanged();

  const searcher$ = keyup$.switchMap(text => Rx.Observable.ajax(`${baseUrl}?q=${text}+user:jkest`))
                          .pluck('response', 'items')
                          .subscribe(
                            items => {
                              ndCandidates.innerHTML = '';
                              const ndItems = items.map(item => {
                                const ndItem = document.createElement('li');
                                ndItem.innerHTML = item.name;
                                return ndItem;
                              });
                              const fragment = document.createDocumentFragment();
                              ndItems.forEach(ndItem => fragment.appendChild(ndItem));
                              ndCandidates.appendChild(fragment);
                            },
                            error => {
                              ndCandidates.innerHTML = String(error);
                            }
                          );

})(window, Rx);
