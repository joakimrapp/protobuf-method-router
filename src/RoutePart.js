const url = require( 'url' );
module.exports = class RoutePart {
  constructor() {
    Object.assign( this, { literals: new Map() } );
  }
  setNext( { expression, literal, key, value }, keys ) {
    if( literal ) {
      if( !this.literals.has( value ) )
        this.literals.set( value, new RoutePart() );
      return [ this.literals.get( value ), keys ];
    }
    else if( expression ) {
      if( !this.expression )
        this.expression = new RoutePart();
      return [ this.expression, keys.concat( key ) ];
    }
    else
      throw new Error( 'Unknown part, neither an expression or a literal!' );
  }
  set( route, requestType, responseType, routeKeys, queryKeys, handler ) {
    if( this.route )
      throw new Error( `route is already registered "${route}"` );
    else {
      this.route = { route, requestType, responseType, routeKeys, queryKeys, handler, bools: requestType.fieldsArray.filter( ( { type } ) => type === 'bool' ).map( ( { name } ) => name ) };
    }
  }
  invoke( queryValues, routeValues ) {
    const { route, requestType, responseType, routeKeys, queryKeys, handler, bools } = this.route;
    return Promise.resolve( Object.assign( ...queryKeys.map( key => ( { [ key ]: queryValues[ key ] } ) ), ...routeKeys.map( ( key, index ) => ( { [ key ]: routeValues[ index ] } ) ) ) )
      .then( rawRequest => {
        bools.forEach( ( name ) => {
          if( rawRequest.hasOwnProperty( name ) )
            rawRequest[ name ] = rawRequest[ name ] === 'true';
        } );
        return rawRequest;
      } )
      .then( rawRequest => handler( requestType.fromObject( rawRequest ) ) )
      .then( rawResponse => responseType.fromObject( rawResponse ) );
  }
  getNext( parts, query, values = [] ) {
    if( parts.length ) {
      const part = parts.shift();
      if( this.literals.has( part ) )
        return this.literals.get( part ).getNext( parts, query, values );
      else if( this.expression )
        return this.expression.getNext( parts, query, values.concat( part ) );
      else
        return undefined;
    }
    else if( this.route )
      return this.invoke( query, values );
    else
      return undefined;
  }
  get( path ) {
    const { pathname, query } = url.parse( path, true );
    return this.getNext( pathname.split( '/' ).filter( part => part.length ), query );
  }
};
