import {Person} from "./person.js";

const value = (firstName, lastName, age) => {
  var person = new Person(firstName, lastName, age);
  return person.sayHi();
};

console.log(value(process.env.FIRST, process.env.LAST, 14,));


