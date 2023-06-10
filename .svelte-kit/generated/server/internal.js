
import root from '../root.svelte';
import { set_building } from '__sveltekit/environment';
import { set_assets } from '__sveltekit/paths';
import { set_private_env, set_public_env } from '../../../node_modules/@sveltejs/kit/src/runtime/shared-server.js';

export const options = {
	app_template_contains_nonce: false,
	csp: {"mode":"auto","directives":{"upgrade-insecure-requests":false,"block-all-mixed-content":false},"reportOnly":{"upgrade-insecure-requests":false,"block-all-mixed-content":false}},
	csrf_check_origin: true,
	track_server_fetches: false,
	embedded: false,
	env_public_prefix: 'PUBLIC_',
	hooks: null, // added lazily, via `get_hooks`
	preload_strategy: "modulepreload",
	root,
	service_worker: false,
	templates: {
		app: ({ head, body, assets, nonce, env }) => "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <link rel=\"icon\" href=\"" + assets + "/favicon.png\" />\n    <link\n      rel=\"preload\"\n      href=\"fonts/stylesheet.css\"\n      as=\"style\"\n      onload=\"this.rel='stylesheet'\"\n    />\n    <meta name=\"viewport\" content=\"width=device-width\" />\n    " + head + "\n  </head>\n  <body data-sveltekit-preload-data=\"hover\">\n    <div style=\"display: contents\">" + body + "</div>\n  </body>\n</html>\n\n<style global>\n  *,\n  ::before,\n  ::after {\n    box-sizing: border-box;\n  }\n  html {\n    scrollbar-gutter: stable;\n    background: #e9e4e4;\n  }\n\n  body,\n  input {\n    font-family: 'Hypermarket';\n    letter-spacing: 1px;\n    font-size: 1.125rem;\n    line-height: 1.5;\n  }\n\n  img,\n  svg,\n  video {\n    max-width: 100%;\n    display: block;\n  }\n\n  * {\n    color: #373f51;\n  }\n\n  dialog {\n    border-radius: 5px;\n  }\n\n  button {\n    border: 1px solid #373f51;\n    background: white;\n    border-radius: 2px;\n    text-transform: uppercase;\n    transition: all 0.1s ease-in-out;\n    cursor: pointer;\n  }\n\n  button:hover {\n    box-shadow: white 0px 0px 0px 1px, black 0px 0px 0px 3px !important;\n    background: var(--btn);\n  }\n\n  button:hover > * {\n    scale: 1.1;\n  }\n\n  textarea:focus,\n  input:focus,\n  input[type]:focus {\n    outline-color: inherit;\n  }\n\n  hr {\n    height: 1px;\n    border: none;\n    margin: 10px 0px;\n    border: 1px dashed;\n  }\n\n  input {\n    background: transparent;\n  }\n\n  .btn {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    padding: 5px;\n  }\n\n  .btn--round {\n    width: 25px;\n    height: 25px;\n    border-radius: 50%;\n  }\n\n  .btn--big {\n    height: 39px;\n    aspect-ratio: 1;\n    font-size: 33px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    border-radius: 50%;\n    cursor: pointer;\n  }\n\n  .drag-over {\n    outline: 3px solid #373f51;\n  }\n</style>\n",
		error: ({ status, message }) => "<!DOCTYPE html>\n<html lang=\"en\">\n\t<head>\n\t\t<meta charset=\"utf-8\" />\n\t\t<title>" + message + "</title>\n\n\t\t<style>\n\t\t\tbody {\n\t\t\t\t--bg: white;\n\t\t\t\t--fg: #222;\n\t\t\t\t--divider: #ccc;\n\t\t\t\tbackground: var(--bg);\n\t\t\t\tcolor: var(--fg);\n\t\t\t\tfont-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,\n\t\t\t\t\tUbuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;\n\t\t\t\tdisplay: flex;\n\t\t\t\talign-items: center;\n\t\t\t\tjustify-content: center;\n\t\t\t\theight: 100vh;\n\t\t\t}\n\n\t\t\t.error {\n\t\t\t\tdisplay: flex;\n\t\t\t\talign-items: center;\n\t\t\t\tmax-width: 32rem;\n\t\t\t\tmargin: 0 1rem;\n\t\t\t}\n\n\t\t\t.status {\n\t\t\t\tfont-weight: 200;\n\t\t\t\tfont-size: 3rem;\n\t\t\t\tline-height: 1;\n\t\t\t\tposition: relative;\n\t\t\t\ttop: -0.05rem;\n\t\t\t}\n\n\t\t\t.message {\n\t\t\t\tborder-left: 1px solid var(--divider);\n\t\t\t\tpadding: 0 0 0 1rem;\n\t\t\t\tmargin: 0 0 0 1rem;\n\t\t\t\tmin-height: 2.5rem;\n\t\t\t\tdisplay: flex;\n\t\t\t\talign-items: center;\n\t\t\t}\n\n\t\t\t.message h1 {\n\t\t\t\tfont-weight: 400;\n\t\t\t\tfont-size: 1em;\n\t\t\t\tmargin: 0;\n\t\t\t}\n\n\t\t\t@media (prefers-color-scheme: dark) {\n\t\t\t\tbody {\n\t\t\t\t\t--bg: #222;\n\t\t\t\t\t--fg: #ddd;\n\t\t\t\t\t--divider: #666;\n\t\t\t\t}\n\t\t\t}\n\t\t</style>\n\t</head>\n\t<body>\n\t\t<div class=\"error\">\n\t\t\t<span class=\"status\">" + status + "</span>\n\t\t\t<div class=\"message\">\n\t\t\t\t<h1>" + message + "</h1>\n\t\t\t</div>\n\t\t</div>\n\t</body>\n</html>\n"
	},
	version_hash: "272h90"
};

export function get_hooks() {
	return {};
}

export { set_assets, set_building, set_private_env, set_public_env };