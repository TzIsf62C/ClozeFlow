export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".nojekyll","favicon.png","samples/Chinese_Traditional.csv","samples/English.csv"]),
	mimeTypes: {".png":"image/png",".csv":"text/csv"},
	_: {
		client: {start:"_app/immutable/entry/start.uapi_reG.js",app:"_app/immutable/entry/app.DnT8Q4nz.js",imports:["_app/immutable/entry/start.uapi_reG.js","_app/immutable/chunks/DZqFfQE0.js","_app/immutable/chunks/CQY3VV7G.js","_app/immutable/chunks/DuDm8rwf.js","_app/immutable/chunks/BtBuVhZ2.js","_app/immutable/entry/app.DnT8Q4nz.js","_app/immutable/chunks/BtBuVhZ2.js","_app/immutable/chunks/CQY3VV7G.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
