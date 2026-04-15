export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "ClozeFlow/_app",
	assets: new Set([".nojekyll","favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {start:"_app/immutable/entry/start.QfZ9Cb6s.js",app:"_app/immutable/entry/app.BWxYfY8E.js",imports:["_app/immutable/entry/start.QfZ9Cb6s.js","_app/immutable/chunks/D76gbyXw.js","_app/immutable/chunks/CR0Ep_tM.js","_app/immutable/chunks/B5JE0GZ3.js","_app/immutable/chunks/BLNxhGaS.js","_app/immutable/entry/app.BWxYfY8E.js","_app/immutable/chunks/BLNxhGaS.js","_app/immutable/chunks/CR0Ep_tM.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/activity",
				pattern: /^\/activity\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/manage",
				pattern: /^\/manage\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
