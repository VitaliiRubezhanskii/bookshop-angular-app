export class Person {
  constructor(name, lastName, age) {
    this.name = name;
    this.lastName = lastName;
    this.age = age;
  }

  sayHi () {
    return `I am ${this.name} ${this.lastName} - ${this.age} years old`
  }
}
