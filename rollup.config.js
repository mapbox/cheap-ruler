import buble from '@rollup/plugin-buble';
import {terser} from 'rollup-plugin-terser'

const output = (file, plugins) => ({
    input: 'index.js',
    output: {
        name: 'CheapRuler',
        format: 'umd',
        indent: false,
        file
    },
    plugins
});

export default [
    output('cheap-ruler.js', [buble()]),
    output('cheap-ruler.min.js', [terser(), buble()])
];
