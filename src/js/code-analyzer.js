import * as esprima from 'esprima';

const parseCode = (txt1, txt2) => {
    initializeExpressionDictionary();
    initializeValueDictionary();
    count = -1;
    last = 0;
    color = 'limegreen';
    graph = [];
    makeCircle('Start');
    args = esprima.parse('[' + txt2 + ']').body[0].expression.elements.map(resolveValue);
    handleSingleElement(esprima.parseScript(txt1));
    return makeStatement();
};

const makeStatement = () => {
    let ans = '';
    let num = 1;
    let makeLabel = (content) => ' label="--' + num++ + '--\n' + content + '"';
    let nodeMakers = {
        n : (content, color, i) => i + ' [shape=box fillcolor=' + color + makeLabel(content) + '];',
        f : (content, color, i) => i + ' [shape=diamond fillcolor=' + color + makeLabel(content) + '];',
        p : (content, color) => color + '[fontsize=25 label="' + content + '"];',
        c : (content, color, i) => i + ' [shape=circle fillcolor=' + color + ' label="' + content + '"];'
    };
    for(let i = 0; i < graph.length; i++){
        ans += nodeMakers[graph[i].type](graph[i].content, graph[i].color, i);
    }
    return ans;
};

let expressionDictionary;
let valueDictionary;
let origins = [];
let args;
let variables = {};
let count;
let last;
let color;
let graph;

let goInside = (arr) => arr.forEach (inner => handleSingleElement(inner));

let addLine = (d) => graph[++count] = d;

let makeSquare = (str) => addLine({type : 'n', content : str, color : color});

let makeDiamond = (str) => addLine({type : 'f', content : str, color : color});

let makeCircle = (str = '') => addLine({type : 'c', content : str, color : color});

let makeEdge = (source, dest, label = '') => {
    if(typeof source === 'string'){
        label = source.substring(0, 1);
        source = Number(source.substring(1));
    }
    addLine({type : 'p', color : source + ' -> ' + dest, content : label});
};

let connectToPrev = (whereTo = count) => makeEdge(last, whereTo);


const initializeExpressionDictionary = () => {
    expressionDictionary = {
        Program : handleProgram,
        FunctionDeclaration : handleFunctionDeclaration,
        BlockStatement : handelBlockStatement,
        ReturnStatement : handleReturnStatement,
        VariableDeclaration : handleVariableDeclaration,
        VariableDeclarator : handleVariableDeclarator,
        ExpressionStatement : handleExpressionStatement,
        WhileStatement : handleWhileExpression,
        IfStatement : handleIfExpression,
        AssignmentExpression : handleAssignmentStatement,
        UpdateExpression : handleUpdateStatement
    };
};

const handleSingleElement = (p) => {
    expressionDictionary[p.type](p);
};

const handleProgram = (p) => {
    goInside(p.body);
};

const handelBlockStatement = (p) => {
    goInside(p.body);
};

const handleFunctionDeclaration = (p) => {
    handleFunctionIdentifiers(p.params);
    handleSingleElement(p.body);
};

const handleFunctionIdentifiers = idents => {
    for (let i = 0; i < idents.length; i++) {
        origins.push(idents[i].name);
        variables[idents[i].name] = args[i];
    }
};

const handleVariableDeclaration = p => {
    goInside(p.declarations);
};

const handleVariableDeclarator = p => {
    let value = resolveValue(p.init);
    let sValue = resolveStringValue(p.init);
    variables[p.id.name] = value;
    let str = value === null ? 'let ' + p.id.name + ';' : 'let ' + p.id.name + ' = ' + sValue + ';';
    if (typeof last === 'number' && graph[last].type === 'n'){
        graph[last].content += '\n' + str;
    }
    else{
        makeSquare(str);
        connectToPrev();
        last = count - 1;
    }
};

const handleExpressionStatement = (p) => {
    handleSingleElement(p.expression);
};

const handleAssignmentStatement = (p) => {
    let value = resolveValue(p.right);
    let sValue = resolveStringValue(p.right);
    variables[p.left.name] = value;
    let str = p.left.name + ' = ' + sValue + ';';
    if (typeof last === 'number' && graph[last].type === 'n'){
        graph[last].content += '\n' + str;
    }
    else{
        makeSquare(str);
        connectToPrev();
        last = count - 1;
    }
};

const handleUpdateStatement = (p) => {
    let value = p.operator === '++' ? 1 : -1;
    let sValue = p.argument.name + p.operator;
    variables[p.argument.name] = variables[p.argument.name] + value;
    let str = sValue + ';';
    if (typeof last === 'number' && graph[last].type === 'n'){
        graph[last].content += '\n' + str;
    }
    else{
        makeSquare(str);
        connectToPrev();
        last = count - 1;
    }
};

const handleWhileExpression = (p) => {
    makeCircle();
    let circle = count;
    connectToPrev();
    makeDiamond(resolveStringValue(p.test));
    let diamond = count;
    makeEdge(circle, diamond);
    let oColor = color;
    last = 'T' + diamond;
    color = (resolveValue(p.test) && color === 'limegreen') ? 'limegreen' : 'white';
    handleSingleElement(p.body);
    connectToPrev(circle);
    last = 'F' + diamond;
    color = oColor;
};

const handleIfExpression = (p) => {
    if(p.alternate === null){
        handleIfWithoutElse(p);
    }
    else{
        handleIfWithElse(p);
    }
};

const handleIfWithElse = (p) => {
    let oColor = color;
    let test = resolveValue(p.test);
    makeDiamond(resolveStringValue(p.test));
    let fPos = count;
    connectToPrev();
    color = (oColor === 'limegreen' && test) ? 'limegreen' : 'white';
    last = 'T' + fPos;
    handleSingleElement(p.consequent);
    let new1 = last;
    color = (oColor === 'limegreen' && !test) ? 'limegreen' : 'white';
    last = 'F' + fPos;
    handleSingleElement(p.alternate);
    let new2 = last;
    color = oColor;
    makeCircle();
    let circle = last = count;
    makeEdge(new1, circle);
    makeEdge(new2, circle);
};

const handleIfWithoutElse = (p) => {
    makeDiamond(resolveStringValue(p.test));
    let oColor = color;
    let test = resolveValue(p.test);
    let fPos = count;
    connectToPrev();
    color = (color === 'limegreen' && test) ? 'limegreen' : 'white';
    last = 'T' + fPos;
    handleSingleElement(p.consequent);
    let new1 = last;
    color = oColor;
    makeCircle();
    let circle = last = count;
    makeEdge(new1, circle);
    makeEdge(fPos, circle, 'F');
};


const handleReturnStatement = (p) => {
    makeSquare('return ' + resolveStringValue(p.argument) + ';');
    connectToPrev();
    last = count - 1;
};


const initializeValueDictionary = () => {
    valueDictionary = {
        Identifier : resolveIdentifier,
        Literal : resolveLiteral,
        BinaryExpression : resolveBinary,
        UnaryExpression : resolveUnary,
        ArrayExpression : resolveArray,
        MemberExpression : resolveMember
    }  ;
};

const resolveValue = v => v == null ? null : valueDictionary[v.type](v);

const resolveIdentifier = v => variables[v.name];

const resolveLiteral = v => v.value;

const resolveBinary = v => ({
    '+' : ((a, b) => a + b),
    '-' : ((a, b) => a - b),
    '*' : ((a, b) => a * b),
    '/' : ((a, b) => a / b),
    '<' : ((a, b) => a < b),
    '>' : ((a, b) => a > b),
    '<=' : ((a, b) => a <= b),
    '>=' : ((a, b) => a >= b),
    '===' : ((a, b) => a === b),
    '==' : ((a, b) => a == b)
})[v.operator](resolveValue(v.left), resolveValue(v.right));

const resolveUnary = v => -resolveValue(v.argument);

const resolveArray = v => v.elements.map(resolveValue);

const resolveMember = v => resolveValue(v.object)[resolveValue(v.property)];



const resolveStringValue = v => v == null ? null : ({
    Identifier : resolveStringIdentifier,
    Literal : resolveStringLiteral,
    BinaryExpression : resolveStringBinary,
    UnaryExpression : resolveStringUnary,
    ArrayExpression : resolveStringArray,
    MemberExpression: resolveStringMember
})[v.type](v);

const resolveStringIdentifier = v => v.name;

const resolveStringLiteral = v => v.value;

const resolveStringBinary = v => resolveStringValue(v.left) + ' ' + v.operator + ' ' + resolveStringValue(v.right);

const resolveStringUnary = v => '-' + resolveStringValue(v.argument);

const resolveStringArray = v => '[' + v.elements.map(resolveStringValue).join(',') + ']';

const resolveStringMember = v => resolveStringValue(v.object) + '[' + resolveStringValue(v.property) + ']';

export {parseCode};
