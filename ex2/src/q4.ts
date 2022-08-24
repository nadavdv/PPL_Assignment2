import { binary, is } from 'ramda';
import * as R from "ramda";
import { Exp, Program } from '../imp/L3-ast';
import { bind , Result, makeFailure, makeOk, isOk } from '../shared/result';
import { CExp,VarDecl, ProcExp, AppExp, isAppExp, isAtomicExp, isBoolExp, isNumExp, isPrimOp, isStrExp, isVarRef, AtomicExp, makeNumExp, makeVarRef, isIfExp, IfExp, PrimOp, makeIfExp, makeAppExp, makePrimOp, isExp, isDefineExp, makeDefineExp, makeVarDecl, makeProgram, makeProcExp, isProcExp } from './L31-ast';
import { cons } from '../shared/list';

/*
Purpose: Transform L3 AST to JavaScript program string
Signature: l30ToJS(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l30ToJS = (exp: Exp | Program): Result<string>  => 
{
    if (isExp(exp))
        return makeOk (ExpToJS(exp));
    else{
        const strings: string[] = R.map( (ex: Exp) =>  ExpToJS(ex) , exp.exps);
        const output:string = R.reduce ((acc:string , curr:string) => R.concat(acc , '\n${curr}') , "" , strings);
        return makeOk (output);
    }
}

export const ExpToJS = (exp:Exp): string =>
    isDefineExp(exp) ? `const ${exp.var.var} = ${CExptoJS(exp.val)} )` :
    CExptoJS(exp);

    
export const CExptoJS = (exp: CExp ): string  => 
    isAtomicExp(exp) ? atomicToJS(exp) :
    isIfExp(exp) ? ifToJS(exp) :
    isAppExp(exp) ? appToJS(exp) :
    isProcExp(exp) ? ProcExpToJS(exp):
    "err";


export const atomicToJS = (exp: AtomicExp): string =>
    isNumExp(exp) ? exp.val.toString() :
    isBoolExp(exp) ? exp.val.toString() :
    isStrExp(exp) ? exp.val :
    isPrimOp(exp) ? primOpToJS(exp) :
    exp.var;

export const primOpToJS =  (exp: PrimOp): string =>
    exp.op === '=' ? "===" : exp.op;


export const ifToJS = (exp: IfExp): string =>{
    const test = CExptoJS(exp.test);
    const then = CExptoJS(exp.then);
    const alt = CExptoJS(exp.alt);
    return `(${test} ? ${then} : ${alt})`;
}

export const appToJS = (exp: AppExp): string => {
    const rator: string = ` ${CExptoJS(exp.rator)} `;
    const rands: string[] = R.map( (ex: CExp) => CExptoJS(ex) , exp.rands);
    return isPrimOp(exp.rator) ? `${rands.join(rator)}` :
    //isProcExp(exp.rator) ? 
    `${rator}(${ rands.join(",") })`;

}


export const ProcExpToJS = (exp: ProcExp): string => {
    const args: string = `(${R.map((v:VarDecl) => v.var , exp.args).join(",")})`;
    const body: string = `(${R.map((ex:CExp) => CExptoJS(ex) , exp.body)})`;

    return `(${args} => ${body})`;
}

// export const LetExpToJS = (exp: LetExp): string => {
//     const args: string = `(${R.map((v:VarDecl) => v.var , exp.args).join(",")})`;
//     const body: string = `(${R.map((ex:CExp) => CExptoJS(ex) , exp.body)})`;

//     return `(${args} => ${body})`;
// }


// export const unparseL31 = (exp: Program | Exp): string =>
//     isBoolExp(exp) ? valueToString(exp.val) :
//     isNumExp(exp) ? valueToString(exp.val) :
//     isStrExp(exp) ? valueToString(exp.val) :
//     isLitExp(exp) ? unparseLitExp(exp) :
//     isVarRef(exp) ? exp.var :
//     isProcExp(exp) ? unparseProcExp(exp) :
//     isIfExp(exp) ? `(if ${unparseL31(exp.test)} ${unparseL31(exp.then)} ${unparseL31(exp.alt)})` :
//     isAppExp(exp) ? `(${unparseL31(exp.rator)} ${unparseLExps(exp.rands)})` :
//     isPrimOp(exp) ? exp.op :
//     isLetExp(exp) ? unparseLetExp(exp) :
//     isLetPlusExp(exp) ? unparseLetPlusExp(exp) :
//     isDefineExp(exp) ? `(define ${exp.var.var} ${unparseL31(exp.val)})` :
//     isProgram(exp) ? `(L31 ${unparseLExps(exp.exps)})` :
//     exp;

export const getValue = (res: Result<string>): string =>
    isOk(res) ? res.value : res.message;
    

const x = makeIfExp(makeAppExp(makePrimOp("=") , [makeVarRef("x") , makeNumExp(3)] ), makeNumExp(4) , 
                                                                                    makeNumExp(5));

const ifexp = makeIfExp(makePrimOp("=") , makeNumExp(2) , makeNumExp(3));
const procexp = makeProcExp([makeVarDecl("x") , makeVarDecl("y")] , [makeAppExp(makePrimOp("*") , [makeVarRef("x") , makeVarRef("y")])]);
const appexp = makeAppExp(procexp , [makeNumExp(3) , makeNumExp(4)]);

// console.log(x);
// console.log(getResult(CExptoJS(x , "")));

// const x = makeDefineExp( makeVarDecl("x") , makeNumExp(4)  );

// const p = makeProgram ([x , x])
console.log(appexp);
console.log(CExptoJS(appexp));