export class Person {
  constructor(name, lastName, age) {
    this.name = name;
    this.lastName = lastName;
    this.age = age;
    this.type = this.getType(age)
  }

  sayHi () {
    return `I am ${this.name} ${this.lastName} - ${this.age} years old, so I'm ${this.type}`
  }
  getType(age) {
    var type = '';
    switch (age) {
      case 0: case 1:
       type = 'Baby';
       break;
      case 2: case 3:
        type = 'Toddler';
        break;
      case 4: case 5: case 6: case 7: case 8: case 9: case 10: case 11: case 12:
        type = 'Child';
        break;
      case 13: case 14: case 15: case 16: case 17: case 18: case 19:
        type = 'Teen';
        break;
      default:
        type = 'Adult'
    }
    return type;
  }
}
