import {handleRequest} from './feed.js';

export default {fetch: (request, env, ctx) => handleRequest(request, env, ctx)};
