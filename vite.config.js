import { defineConfig } from 'vite';
import path from 'path';
import viteSvgo from 'vite-plugin-svgo';

export default defineConfig({
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        lib: {
            entry: path.resolve(__dirname, 'src/js/spotlight.js'),
            name: 'Spotlight',
            formats: ['umd'],
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true, // ensures a single output file
            }
        },
    },
    css: {
        preprocessorOptions: {
            scss: {}
        }
    },
    plugins: [
        viteSvgo()
    ]
});
