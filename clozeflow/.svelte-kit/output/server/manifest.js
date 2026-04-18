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
		client: {start:"_app/immutable/entry/start.C5HtfAo8.js",app:"_app/immutable/entry/app.hG8gBd1Q.js",imports:["_app/immutable/entry/start.C5HtfAo8.js","_app/immutable/chunks/DAUCvcrX.js","_app/immutable/chunks/CQY3VV7G.js","_app/immutable/chunks/DuDm8rwf.js","_app/immutable/chunks/BtBuVhZ2.js","_app/immutable/entry/app.hG8gBd1Q.js","_app/immutable/chunks/BtBuVhZ2.js","_app/immutable/chunks/CQY3VV7G.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/","/activity","/manage"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
