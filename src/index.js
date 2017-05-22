const RoutePart = require( './RoutePart.js' );
const routeResult = require( './routeResult.js' );
module.exports = () => {
  const root = new RoutePart();
  const router = {
    set: ( route, { resolvedRequestType: requestType, resolvedResponseType: responseType }, handler ) => {
      let parts = require( '@jrapp/url-templating' )( route ).parsed.filter( ( { separator, value } ) => {
        if( separator )
          if( value === '/' )
            return false;
          else
            throw new Error( `Unknown separator "${value}"` );
        else
          return true;
      } );
      const queryIndex = parts.findIndex( ( { expression, query } ) => expression && query );
      const query = queryIndex < 0 ? [] : parts.splice( queryIndex ).filter( ( { expression, query } ) => expression ).map( ( { key } ) => key );
      const [ routePart, keys ] = parts.reduce( ( [ routePart, keys ], part ) => routePart.setNext( part, keys ), [ root, [] ] );
      routePart.set( route, requestType, responseType, keys, query, handler );
      return router;
    },
    route: ( path ) => routeResult( root.get( path ) )
  };
  return router;
};
