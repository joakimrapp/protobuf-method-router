class FoundRouteResult {
  constructor( promise ) {
    this.promise = promise;
  }
  then( ...params ) {
    this.promise = this.promise.then( ...params );
    return this;
  }
  catch( ...params ) {
    this.promise = this.promise.catch( ...params );
    return this;
  }
  miss() { return this; }
}
class MissedRouteResult {
  then() { return this; }
  catch() { return this; }
  miss( onFulfilled ) {
    process.nextTick( onFulfilled );
    return this;
  }
}
module.exports = ( promise ) => promise ? new FoundRouteResult( promise ) : new MissedRouteResult();
