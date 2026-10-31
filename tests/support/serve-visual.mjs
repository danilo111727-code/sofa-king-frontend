import {createServer} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {fileURLToPath} from 'node:url';
const server=await createServer({configFile:false,plugins:[react(),tailwindcss()],
 define:{'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY':JSON.stringify('pk_test_local_visual_only'),'import.meta.env.VITE_APP_ENV':JSON.stringify('preview')},
 resolve:{alias:{'@':fileURLToPath(new URL('../../src',import.meta.url)),'@clerk/react':fileURLToPath(new URL('./clerk-stub.tsx',import.meta.url))}},
 server:{host:'127.0.0.1',port:4100,strictPort:true,proxy:{'/api':'http://127.0.0.1:4101','/uploads':'http://127.0.0.1:4101'}},logLevel:'warn'});
await server.listen();console.log('VISUAL QA http://127.0.0.1:4100');
