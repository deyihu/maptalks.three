const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify').uglify;
const json = require('rollup-plugin-json');
const pkg = require('./package.json');

const banner = `/*!\n * ${pkg.name} v${pkg.version}\n * LICENSE : ${pkg.license}\n * (c) 2016-${new Date().getFullYear()} maptalks.org\n */`;

let outro = pkg.name + ' v' + pkg.version;
if (pkg.peerDependencies && pkg.peerDependencies['yymap']) {
    outro += `, requires yymap@${pkg.peerDependencies.yymap}`;
}

outro = `typeof console !== 'undefined' && console.log('${outro}');`;
const intro = `
    var IS_NODE = typeof exports === 'object' && typeof module !== 'undefined';
    var YY = yymap;
    if (IS_NODE) {
        YY = yymap || require('yymap');
    }
    var workerLoaded;
    function define(_, chunk) {
    if (!workerLoaded) {
        if(YY&&YY.registerWorkerAdapter){
            YY.registerWorkerAdapter('${pkg.name}', chunk);
            workerLoaded = true;
        }else{
          console.warn('YY.registerWorkerAdapter is not defined');
        }
    } else {
        var exports = IS_NODE ? module.exports : YY;
        chunk(exports, YY);
    }
}`;


function removeGlobal() {
    return {
        transform(code, id) {
            if (id.indexOf('worker.js') === -1) return null;
            const commonjsCode = /typeof global/g;
            var transformedCode = code.replace(commonjsCode, 'typeof undefined');
            return {
                code: transformedCode,
                map: { mappings: '' }
            };
        }
    };
}

const basePlugins = [
    json(),
    resolve({
        module: true,
        jsnext: true,
        main: true
    }),
    commonjs(),
    babel({
        // exclude: 'node_modules/**'
    }),
    removeGlobal()
];

module.exports = [
    {
        input: 'src/worker/index.js',
        plugins: [
            json(),
            resolve({
                module: true,
                jsnext: true,
                main: true
            }),
            commonjs(),
            babel()
        ],
        external: ['yymap'],
        output: {
            format: 'amd',
            name: 'YY',
            globals: {
                'YY': 'yymap'
            },
            extend: true,
            file: 'dist/worker.js'
        },
        // watch: {
        //     include: 'src/worker/**'
        // }
    },
    {
        input: 'index.js',
        plugins: basePlugins,
        external: ['yymap', 'three'],
        output: {
            'sourcemap': true,
            'format': 'umd',
            'name': 'YY',
            'banner': banner,
            'outro': outro,
            'extend': true,
            // 'intro': intro,
            'globals': {
                'YY': 'yymap',
                'THREE': 'three'
            },
            'file': 'dist/maptalks.three.js'
        }
    },
    {
        input: 'index.js',
        plugins: basePlugins,
        external: ['yymap', 'three'],
        output: {
            'sourcemap': false,
            'format': 'es',
            'banner': banner,
            'outro': outro,
            // 'intro': intro,
            'file': pkg.module
        }
    }
];
