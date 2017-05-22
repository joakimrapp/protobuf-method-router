require( '@jrapp/node-project-setup' ).testing.file( './test/file' )( ( router ) => require( 'protobufjs' ).load( `${__dirname}/index.js.test.proto` )
 	.then( root => router().set( '/{aString}/test/{anInt}{?aBool}', root.lookup( 'test.TestService.TestMethod' ).resolve(), ( request ) =>
		request.aString === 'fail' ? Promise.reject() : ( {
		aStringRes: request.aString + 'yo',
		anIntRes: request.anInt + 1,
		aBoolRes: !request.aBool
	} ) ) ) )
	.it( 'should route a hit', ( assert, setup, router ) => new Promise( resolve => router.route( '/val1/test/1?aBool=true' )
 		.then( result => {
			assert.deepEqual( result, { aStringRes: 'val1yo', anIntRes: 2, aBoolRes: false } );
			resolve();
		} ) ) )
	.it( 'should route a miss', ( assert, setup, router ) => new Promise( resolve => router.route( '/val1/nottest/1?aBool=true' )
 		.miss( result => resolve() ) ) )
	.it( 'should throw if handler fails', ( assert, setup, router ) => new Promise( resolve => router.route( '/fail/test/1?aBool=true' )
 		.catch( result => resolve() ) ) )
	.done();
