import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';


describe('Test', () => {
    it('simple function', () => {
        assert.equal(
            parseCode('function test (a,b,c) { return a+b+c; }', '1,2,3'),
            '0 [shape=circle fillcolor=limegreen label="Start"];1 [shape=box fillcolor=limegreen label="--1--\nreturn a + b + c;"];0 -> 1[fontsize=25 label=""];'
        );
    }) ;
});

describe('Test', () => {
    it('variable declarations', () => {
        assert.equal(
            parseCode('function test (a,b,c) { let x = a; let y = b; let z = c; return x+y+z; }', '1,2,3'),
            '0 [shape=circle fillcolor=limegreen label="Start"];1 [shape=box fillcolor=limegreen label="--1--\nlet x = a;\nlet y = b;\nlet z = c;"];0 -> 1[fontsize=25 label=""];3 [shape=box fillcolor=limegreen label="--2--\nreturn x + y + z;"];1 -> 3[fontsize=25 label=""];'
        );
    }) ;
});

describe('Test', () => {
    it('assignment 1', () => {
        assert.equal(
            parseCode('function test (a,b,c) { let x = a; x = x + 5; return x; }', '1,2,3'),
            '0 [shape=circle fillcolor=limegreen label="Start"];1 [shape=box fillcolor=limegreen label="--1--\nlet x = a;\nx = x + 5;"];0 -> 1[fontsize=25 label=""];3 [shape=box fillcolor=limegreen label="--2--\nreturn x;"];1 -> 3[fontsize=25 label=""];'
        );
    }) ;
});

describe('Test', () => {
    it('assignment 2', () => {
        assert.equal(
            parseCode('function test (a,b,c) { let x = a; a = x + 5; return x; }', '1,2,3'),
            '0 [shape=circle fillcolor=limegreen label="Start"];1 [shape=box fillcolor=limegreen label="--1--\nlet x = a;\na = x + 5;"];0 -> 1[fontsize=25 label=""];3 [shape=box fillcolor=limegreen label="--2--\nreturn x;"];1 -> 3[fontsize=25 label=""];'
        );
    }) ;
});

describe('Test', () => {
    it('while', () => {
        assert.equal(
            parseCode('function test (a,b,c) { while(a < b){a=a+1;} return a;}', '1,2,3'),
            '0 [shape=circle fillcolor=limegreen label="Start"];1 [shape=circle fillcolor=limegreen label=""];0 -> 1[fontsize=25 label=""];3 [shape=diamond fillcolor=limegreen label="--1--\na < b"];1 -> 3[fontsize=25 label=""];5 [shape=box fillcolor=limegreen label="--2--\na = a + 1;"];3 -> 5[fontsize=25 label="T"];5 -> 1[fontsize=25 label=""];8 [shape=box fillcolor=limegreen label="--3--\nreturn a;"];3 -> 8[fontsize=25 label="F"];'
        );
    }) ;
});

describe('Test', () => {
    it('while2', () => {
        assert.equal(
            parseCode('function test (a,b,c) { while(a < b){a=a+1;} return a;}', '1,0,3'),
            '0 [shape=circle fillcolor=limegreen label="Start"];1 [shape=circle fillcolor=limegreen label=""];0 -> 1[fontsize=25 label=""];3 [shape=diamond fillcolor=limegreen label="--1--\na < b"];1 -> 3[fontsize=25 label=""];5 [shape=box fillcolor=white label="--2--\na = a + 1;"];3 -> 5[fontsize=25 label="T"];5 -> 1[fontsize=25 label=""];8 [shape=box fillcolor=limegreen label="--3--\nreturn a;"];3 -> 8[fontsize=25 label="F"];'
        );
    }) ;
});

describe('Test', () => {
    it('if without else', () => {
        assert.equal(
            parseCode('function test () {if (1 < 2) {return 0;} return 1; }', '1,2'),
            '0 [shape=circle fillcolor=limegreen label="Start"];1 [shape=diamond fillcolor=limegreen label="--1--\n1 < 2"];0 -> 1[fontsize=25 label=""];3 [shape=box fillcolor=limegreen label="--2--\nreturn 0;"];1 -> 3[fontsize=25 label="T"];5 [shape=circle fillcolor=limegreen label=""];3 -> 5[fontsize=25 label=""];1 -> 5[fontsize=25 label="F"];8 [shape=box fillcolor=limegreen label="--3--\nreturn 1;"];5 -> 8[fontsize=25 label=""];'
        );
    }) ;
});

describe('Test', () => {
    it('if without else2', () => {
        assert.equal(
            parseCode('function test () {if (1 > 2) {return 0;} return 1; }', '1,2'),
            '0 [shape=circle fillcolor=limegreen label="Start"];1 [shape=diamond fillcolor=limegreen label="--1--\n1 > 2"];0 -> 1[fontsize=25 label=""];3 [shape=box fillcolor=white label="--2--\nreturn 0;"];1 -> 3[fontsize=25 label="T"];5 [shape=circle fillcolor=limegreen label=""];3 -> 5[fontsize=25 label=""];1 -> 5[fontsize=25 label="F"];8 [shape=box fillcolor=limegreen label="--3--\nreturn 1;"];5 -> 8[fontsize=25 label=""];'
        );
    }) ;
});

describe('Test', () => {
    it('if with else', () => {
        assert.equal(
            parseCode('function test (a,b) {if (a < b) {return 0;} else return 1; }', '3,2'),
            '0 [shape=circle fillcolor=limegreen label="Start"];1 [shape=diamond fillcolor=limegreen label="--1--\na < b"];0 -> 1[fontsize=25 label=""];3 [shape=box fillcolor=white label="--2--\nreturn 0;"];1 -> 3[fontsize=25 label="T"];5 [shape=box fillcolor=limegreen label="--3--\nreturn 1;"];1 -> 5[fontsize=25 label="F"];7 [shape=circle fillcolor=limegreen label=""];3 -> 7[fontsize=25 label=""];5 -> 7[fontsize=25 label=""];'
        );
    }) ;
});

describe('Test', () => {
    it('if else if', () => {
        assert.equal(
            parseCode('function test (a,b) {if (a === b) {return 0;} else if(a>b)return a; else return b;}', '3,2'),
            '0 [shape=circle fillcolor=limegreen label="Start"];1 [shape=diamond fillcolor=limegreen label="--1--\na === b"];0 -> 1[fontsize=25 label=""];3 [shape=box fillcolor=white label="--2--\nreturn 0;"];1 -> 3[fontsize=25 label="T"];5 [shape=diamond fillcolor=limegreen label="--3--\na > b"];1 -> 5[fontsize=25 label="F"];7 [shape=box fillcolor=limegreen label="--4--\nreturn a;"];5 -> 7[fontsize=25 label="T"];9 [shape=box fillcolor=white label="--5--\nreturn b;"];5 -> 9[fontsize=25 label="F"];11 [shape=circle fillcolor=limegreen label=""];7 -> 11[fontsize=25 label=""];9 -> 11[fontsize=25 label=""];14 [shape=circle fillcolor=limegreen label=""];3 -> 14[fontsize=25 label=""];11 -> 14[fontsize=25 label=""];'
        );
    }) ;
});

describe('Test', () => {
    it('resolve binary', () => {
        assert.equal(
            parseCode('function test(a,b,c,d){\n' +
                '     let x = a-b;\n' +
                '     let y = a*c;\n' +
                '     let z = a / d;\n' +
                '     let b1 = x > y;\n' +
                '     let b2 = y < z;\n' +
                '     let b3 = z <= x;\n' +
                '     let b4 = y >= x;\n' +
                '     let b5 = b1 == b2;\n' +
                '     let b6 = b3 == b4;\n' +
                '     let b7 = b5 === b6;\n' +
                '     return b7;\n' +
                '}', '8,1,0,2'),
            '0 [shape=circle fillcolor=limegreen label="Start"];1 [shape=box fillcolor=limegreen label="--1--\nlet x = a - b;\nlet y = a * c;\nlet z = a / d;\nlet b1 = x > y;\nlet b2 = y < z;\nlet b3 = z <= x;\nlet b4 = y >= x;\nlet b5 = b1 == b2;\nlet b6 = b3 == b4;\nlet b7 = b5 === b6;"];0 -> 1[fontsize=25 label=""];3 [shape=box fillcolor=limegreen label="--2--\nreturn b7;"];1 -> 3[fontsize=25 label=""];'
        );
    }) ;
});

describe('Test', () => {
    it('resolve unary', () => {
        assert.equal(
            parseCode('function test(a){\n' +
                '     let x = -1;\n' +
                '     return a+x;\n' +
                '}', '3'),
            '0 [shape=circle fillcolor=limegreen label="Start"];1 [shape=box fillcolor=limegreen label="--1--\nlet x = -1;"];0 -> 1[fontsize=25 label=""];3 [shape=box fillcolor=limegreen label="--2--\nreturn a + x;"];1 -> 3[fontsize=25 label=""];'
        );
    }) ;
});

describe('Test', () => {
    it('resolve array', () => {
        assert.equal(
            parseCode('function test(){\n' +
                '     let x = [true,1,2];\n' +
                '     if (x[0]) return 5;\n' +
                '}'),
            '0 [shape=circle fillcolor=limegreen label="Start"];1 [shape=box fillcolor=limegreen label="--1--\nlet x = [true,1,2];"];0 -> 1[fontsize=25 label=""];3 [shape=diamond fillcolor=limegreen label="--2--\nx[0]"];1 -> 3[fontsize=25 label=""];5 [shape=box fillcolor=limegreen label="--3--\nreturn 5;"];3 -> 5[fontsize=25 label="T"];7 [shape=circle fillcolor=limegreen label=""];5 -> 7[fontsize=25 label=""];3 -> 7[fontsize=25 label="F"];'
        );
    }) ;
});

describe('Test', () => {
    it('auxiliary', () => {
        assert.equal(
            parseCode('function test (a) {let b; return a;}', '3'),
            '0 [shape=circle fillcolor=limegreen label="Start"];1 [shape=box fillcolor=limegreen label="--1--\nlet b;"];0 -> 1[fontsize=25 label=""];3 [shape=box fillcolor=limegreen label="--2--\nreturn a;"];1 -> 3[fontsize=25 label=""];'
        );
    }) ;
});

