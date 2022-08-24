import {  Binding, CExp , Exp, isAppExp, isAtomicExp, isBinding, isCompoundExp, isDefineExp, isIfExp, isLetExp, isLetPlusExp, isProcExp, isProgram, LetExp, LetPlusExp, makeAppExp, makeBinding, makeDefineExp, makeIfExp, makeLetExp, makeLetPlusExp, makeNumExp, makePrimOp, makeProcExp, makeProgram, makeVarDecl, makeVarRef, Program } from "./L31-ast";
import { Result, makeFailure, makeOk, isOk } from "../shared/result";
import { first } from "../shared/list";
import { any, map } from "ramda";
import { isArray } from "../shared/type-predicates";
import { Certificate } from "crypto";


/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
isProgram(exp) ? makeOk(makeProgram(map( (x) => processExp(x) , exp.exps ))) :
makeOk(processExp(exp));

export const LetPlusToLet = (exp: LetPlusExp):LetExp => {
    if (exp.bindings.length === 1)
        return makeLetExp(exp.bindings , exp.body);

                                                                //const util = require('util');
    const First = exp.bindings.slice(0 , 1);                    //console.log("first: "+util.inspect(First, false, null, false )) ; console.log();
    const Rest = exp.bindings.slice(1 , exp.bindings.length);   //console.log("rest: "+util.inspect(Rest, false, null, false ));
    // return makeLetExp(  First , LetPlusToLet( makeLetPlusExp( Rest , exp.body ) ).body );
    return makeLetExp(  First , [makeLetExp( Rest , exp.body )] );

}

export const searchForLetPLus = (exp: CExp):CExp => 
    isAtomicExp(exp) ? exp :
    isAppExp(exp) ? makeAppExp(searchForLetPLus(exp.rator) , map( searchForLetPLus , exp.rands)) :
    isIfExp(exp) ? makeIfExp(searchForLetPLus(exp.test) ,
                             searchForLetPLus(exp.then) ,
                             searchForLetPLus(exp.alt)) :
    isProcExp(exp) ? makeProcExp(exp.args ,map( searchForLetPLus , exp.body) ) :
    isLetExp(exp) ? makeLetExp( map ((b: Binding) => makeBinding(b.var.var , searchForLetPLus(b.val)) , exp.bindings)  
                                , map(searchForLetPLus , exp.body)) :
    isLetPlusExp(exp) ? searchForLetPLus(LetPlusToLet(exp)) :
    exp;

export const processExp = (exp: Exp) : Exp => 
    isDefineExp(exp) ? makeDefineExp(exp.var , searchForLetPLus(exp.val)) : 
    searchForLetPLus(exp);


const release = (res: Result<Exp|Program>): Exp|Program|string => 
    isOk(res)? res.value : res.message;


const a = makeBinding("a" , makeNumExp(1));
const b = makeBinding("b" ,makeAppExp(makePrimOp("+") , [makeVarRef("a") , makeNumExp(2)]));

const bindings = [ a , b ];
const app = makeAppExp(makePrimOp("*") , [makeVarRef("a") , makeVarRef("b")]);
const let1 = makeLetPlusExp(bindings , [app]);
const let2 = L31ToL3(let1);


const util = require('util')


// console.log("before: "+util.inspect(let1, false, null, false /* enable colors */))
// console.log();
// console.log("after: "+util.inspect(release(let2), false, null, false /* enable colors */))